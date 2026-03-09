import { useState, useCallback } from 'react';
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

  const scanFolder = useCallback(async () => {
    // 1. Try Native Electron scanning if available
    if ('require' in window) {
      try {
        setIsScanning(true);
        const { ipcRenderer } = (window as any).require('electron');
        const fs = (window as any).require('fs');
        const path = (window as any).require('path');
        const os = (window as any).require('os');
        
        // Ask user to select directory
        const selectedDir = await ipcRenderer.invoke('select-directory');
        if (!selectedDir) {
          setIsScanning(false);
          return [];
        }

        const files: SweepFile[] = [];
        let id = 1000;
        
        const scanDir = (dir: string, depth = 0) => {
          if (depth > 5) return;
          try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
              const fullPath = path.join(dir, entry.name);
              if (entry.name.startsWith('.')) continue;
              
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
                } catch (e) { /* ignore */ }
              }
            }
          } catch (e) { /* ignore */ }
        };
        
        await new Promise(resolve => setTimeout(resolve, 50)); 
        scanDir(selectedDir);
        
        setScannedFiles(files);
        setIsScanning(false);
        return files;
      } catch (e) {
        console.error('Electron scan error:', e);
        setIsScanning(false);
      }
    }

    // Try modern File System Access API first
    if ('showDirectoryPicker' in window) {
      try {
        setIsScanning(true);
        const dirHandle = await (window as any).showDirectoryPicker({ mode: 'read' });
        const files: SweepFile[] = [];
        let id = 1000;
        
        async function traverse(handle: any, path: string) {
          for await (const entry of handle.values()) {
            if (entry.kind === 'file') {
              try {
                const file = await entry.getFile();
                files.push({
                  id: String(id++),
                  name: file.name,
                  path: path,
                  size: file.size,
                  lastOpened: new Date(file.lastModified).toISOString().split('T')[0],
                  type: getFileType(file.name),
                  category: getFileCategory(file),
                });
              } catch { /* skip inaccessible files */ }
            } else if (entry.kind === 'directory' && !entry.name.startsWith('.')) {
              await traverse(entry, `${path}/${entry.name}`);
            }
          }
        }
        
        await traverse(dirHandle, dirHandle.name);
        setScannedFiles(files);
        setIsScanning(false);
        return files;
      } catch (e: any) {
        if (e.name !== 'AbortError') console.error('Scan error:', e);
        setIsScanning(false);
        return [];
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
          for (let i = 0; i < input.files.length; i++) {
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
          }
        }
        
        setScannedFiles(files);
        setIsScanning(false);
        resolve(files);
      };
      
      input.oncancel = () => {
        setIsScanning(false);
        resolve([]);
      };
      
      input.click();
    });
  }, []);

  return { isScanning, scannedFiles, scanFolder };
}
