import { useState, useCallback, useRef } from 'react';
import type { SweepFile, FileCategory } from '@/lib/mockData';

function getFileCategory(file: File): FileCategory[] {
  const cats: FileCategory[] = [];
  const GB = 1024 * 1024 * 1024;
  
  if (file.size > 0.5 * GB) cats.push('large');
  
  const lastMod = new Date(file.lastModified);
  const daysSince = (Date.now() - lastMod.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince > 180) cats.push('old');
  
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (['png', 'jpg', 'jpeg'].includes(ext) && file.name.toLowerCase().includes('screenshot')) {
    cats.push('screenshots');
  }
  if (file.webkitRelativePath?.toLowerCase().includes('download')) {
    cats.push('downloads');
  }
  
  if (cats.length === 0) cats.push('large');
  return cats;
}

function getFileType(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    app: 'app', dmg: 'installer', pkg: 'installer',
    zip: 'archive', tar: 'archive', gz: 'archive', xip: 'archive', rar: 'archive',
    mov: 'video', mp4: 'video', avi: 'video', mkv: 'video',
    png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', webp: 'image', svg: 'image',
    pdf: 'document', doc: 'document', docx: 'document', xls: 'document', xlsx: 'document',
    pptx: 'document', txt: 'document', csv: 'document',
  };
  return map[ext] || 'document';
}

export function useFileScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedFiles, setScannedFiles] = useState<SweepFile[]>([]);
  const [scanProgress, setScanProgress] = useState(0); // 0-100
  const [scanETA, setScanETA] = useState<string>(''); // e.g. "~12s left"
  const scanStartRef = useRef(0);

  const formatETA = (seconds: number): string => {
    if (seconds < 1) return 'Almost done...';
    if (seconds < 60) return `~${Math.ceil(seconds)}s left`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.ceil(seconds % 60);
    return `~${mins}m ${secs}s left`;
  };

  const updateProgress = (processed: number, total: number) => {
    const pct = total > 0 ? Math.min(99, Math.round((processed / total) * 100)) : 0;
    setScanProgress(pct);
    
    const elapsed = (Date.now() - scanStartRef.current) / 1000;
    if (pct > 2 && elapsed > 0.5) {
      const rate = processed / elapsed;
      const remaining = (total - processed) / rate;
      setScanETA(formatETA(remaining));
    }
  };

  const scanFolder = useCallback(async () => {
    scanStartRef.current = Date.now();
    setScanProgress(0);
    setScanETA('Calculating...');

    // 1. Try Native Electron scanning if available
    if ('require' in window) {
      try {
        setIsScanning(true);
        const { ipcRenderer } = (window as any).require('electron');
        const fs = (window as any).require('fs');
        const path = (window as any).require('path');
        
        const selectedDir = await ipcRenderer.invoke('select-directory');
        if (!selectedDir) {
          setIsScanning(false);
          setScanProgress(0);
          setScanETA('');
          return [];
        }

        // First pass: count total entries for progress
        let totalEntries = 0;
        const countEntries = (dir: string, depth = 0) => {
          if (depth > 5) return;
          try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
              if (entry.name.startsWith('.')) continue;
              totalEntries++;
              if (entry.isDirectory()) {
                countEntries(path.join(dir, entry.name), depth + 1);
              }
            }
          } catch { /* ignore */ }
        };
        countEntries(selectedDir);

        const files: SweepFile[] = [];
        let id = 1000;
        let processed = 0;
        
        const scanDir = (dir: string, depth = 0) => {
          if (depth > 5) return;
          try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
              const fullPath = path.join(dir, entry.name);
              if (entry.name.startsWith('.')) continue;
              processed++;
              
              if (entry.isDirectory()) {
                scanDir(fullPath, depth + 1);
              } else if (entry.isFile()) {
                try {
                  const stats = fs.statSync(fullPath);
                  const mockFile = {
                    name: entry.name,
                    size: stats.size,
                    lastModified: stats.mtimeMs,
                    webkitRelativePath: fullPath,
                  } as any as File;
                  
                  files.push({
                    id: String(id++),
                    name: entry.name,
                    path: fullPath,
                    size: stats.size,
                    lastOpened: new Date(stats.atimeMs).toISOString().split('T')[0],
                    type: getFileType(entry.name),
                    category: getFileCategory(mockFile),
                  });
                } catch { /* ignore */ }
              }

              // Update progress every 100 files
              if (processed % 100 === 0) {
                updateProgress(processed, totalEntries);
              }
            }
          } catch { /* ignore */ }
        };
        
        await new Promise(resolve => setTimeout(resolve, 50)); 
        scanDir(selectedDir);
        
        setScanProgress(100);
        setScanETA('');
        setScannedFiles(files);
        setIsScanning(false);
        return files;
      } catch (e) {
        console.error('Electron scan error:', e);
        setIsScanning(false);
        setScanProgress(0);
        setScanETA('');
      }
    }

    // Try modern File System Access API
    if ('showDirectoryPicker' in window) {
      try {
        setIsScanning(true);
        const dirHandle = await (window as any).showDirectoryPicker({ mode: 'read' });
        const files: SweepFile[] = [];
        let id = 1000;
        const BATCH_SIZE = 100; // Increased for speed
        let pending: Promise<void>[] = [];

        // Two-pass: first count entries, then process
        let totalEntries = 0;
        let processed = 0;

        async function countAll(handle: any) {
          for await (const entry of handle.values()) {
            totalEntries++;
            if (entry.kind === 'directory' && !entry.name.startsWith('.')) {
              await countAll(entry);
            }
          }
        }

        await countAll(dirHandle);
        setScanETA(totalEntries > 500 ? 'Scanning...' : 'Almost done...');

        async function processFile(entry: any, filePath: string) {
          try {
            const file = await entry.getFile();
            files.push({
              id: String(id++),
              name: file.name,
              path: filePath,
              size: file.size,
              lastOpened: new Date(file.lastModified).toISOString().split('T')[0],
              type: getFileType(file.name),
              category: getFileCategory(file),
            });
          } catch { /* skip inaccessible files */ }
        }

        async function flushBatch() {
          if (pending.length > 0) {
            await Promise.all(pending);
            processed += pending.length;
            pending = [];
            updateProgress(processed, totalEntries);
            setScannedFiles([...files]);
            await new Promise(r => setTimeout(r, 0));
          }
        }

        async function traverse(handle: any, filePath: string) {
          // Collect all entries first, then process files concurrently
          const dirs: any[] = [];
          const fileEntries: { entry: any; path: string }[] = [];
          
          for await (const entry of handle.values()) {
            if (entry.kind === 'file') {
              fileEntries.push({ entry, path: filePath });
            } else if (entry.kind === 'directory' && !entry.name.startsWith('.')) {
              dirs.push({ entry, path: `${filePath}/${entry.name}` });
            }
          }

          // Process files in batch
          for (const { entry, path: p } of fileEntries) {
            pending.push(processFile(entry, p));
            if (pending.length >= BATCH_SIZE) {
              await flushBatch();
            }
          }

          // Traverse subdirectories
          for (const dir of dirs) {
            await traverse(dir.entry, dir.path);
          }
        }
        
        await traverse(dirHandle, dirHandle.name);
        await flushBatch();
        setScanProgress(100);
        setScanETA('');
        setScannedFiles([...files]);
        setIsScanning(false);
        return files;
      } catch (e: any) {
        if (e.name === 'AbortError') {
          setIsScanning(false);
          setScanProgress(0);
          setScanETA('');
          return [];
        }
        console.error('Scan error, falling back:', e);
      }
    }
    
    // Fallback: file input with webkitdirectory
    return new Promise<SweepFile[]>((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.webkitdirectory = true;
      input.multiple = true;
      
      input.onchange = () => {
        setIsScanning(true);
        const files: SweepFile[] = [];
        let id = 1000;
        
        if (input.files) {
          const total = input.files.length;
          for (let i = 0; i < total; i++) {
            const file = input.files[i];
            files.push({
              id: String(id++),
              name: file.name,
              path: file.webkitRelativePath || 'Unknown',
              size: file.size,
              lastOpened: new Date(file.lastModified).toISOString().split('T')[0],
              type: getFileType(file.name),
              category: getFileCategory(file),
            });
            if (i % 50 === 0) {
              updateProgress(i, total);
            }
          }
        }
        
        setScanProgress(100);
        setScanETA('');
        setScannedFiles(files);
        setIsScanning(false);
        resolve(files);
      };
      
      input.oncancel = () => {
        setIsScanning(false);
        setScanProgress(0);
        setScanETA('');
        resolve([]);
      };
      
      input.click();
    });
  }, []);

  const trashFiles = useCallback(async (filePaths: string[]) => {
    if ('require' in window) {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        let successCount = 0;
        for (const path of filePaths) {
          const success = await ipcRenderer.invoke('trash-file', path);
          if (success) successCount++;
        }
        return successCount === filePaths.length;
      } catch (e) {
        console.error('Failed to trash files:', e);
        return false;
      }
    }
    console.log('Not in Electron, skipping real trash for:', filePaths);
    return false;
  }, []);

  return { isScanning, scannedFiles, scanFolder, trashFiles, scanProgress, scanETA };
}
