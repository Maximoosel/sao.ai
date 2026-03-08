import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, X, Minus, Search, FolderOpen, Sparkles, ArrowDown, ArrowUp, 
  Clock, BarChart3, Trash2, Check, GripVertical, Maximize2, Minimize2,
  ChevronDown, Undo2, History
} from 'lucide-react';
import { AbstractShape } from './SplashScreen';
import FileCard from './FileCard';
import StorageRing from './StorageRing';
import EmptyState from './EmptyState';
import CategoryTabs from './CategoryTabs';
import { useFileScanner } from '@/hooks/useFileScanner';
import { useRelevanceScoring } from '@/hooks/useRelevanceScoring';
import { mockFiles, totalStorage, usedStorage, formatSize, formatSizeWithContext, timeAgo, type FileCategory, type SweepFile } from '@/lib/mockData';

type SortMode = 'size' | 'lastOpened' | 'relevance';

interface SweptEntry { files: SweepFile[]; totalSize: number; timestamp: Date }

const FloatingOverlay = ({ bgBlur = 60, panelOpacity = 50 }: { bgBlur?: number; panelOpacity?: number }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const posRef = useRef({ x: 20, y: 20 });
  const isDraggingRef = useRef(false);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const [files, setFiles] = useState<SweepFile[]>(mockFiles);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<FileCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('size');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [sweepResult, setSweepResult] = useState<{ count: number; size: number } | null>(null);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [currentUsed, setCurrentUsed] = useState(usedStorage);
  const [sweepAnimating, setSweepAnimating] = useState(false);
  const [showTick, setShowTick] = useState(false);
  const [ballSpawns, setBallSpawns] = useState<{ id: string; topPct: number; leftPct: number }[]>([]);
  const sweepBtnRef = useRef<HTMLButtonElement>(null);
  const fileListRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Undo state
  const [undoData, setUndoData] = useState<{ files: SweepFile[]; size: number } | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Last scan timestamp
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);

  // Recently swept log
  const [recentlySwept, setRecentlySwept] = useState<SweptEntry[]>([]);
  const [showRecents, setShowRecents] = useState(false);

  const { isScanning, scanFolder } = useFileScanner();
  const { isAnalyzing, analyzeFiles } = useRelevanceScoring();

  const applyPosition = useCallback(() => {
    if (overlayRef.current) {
      overlayRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
    }
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, .no-drag')) return;
    isDraggingRef.current = true;
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: posRef.current.x, origY: posRef.current.y };
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      posRef.current = { x: dragRef.current.origX + dx, y: dragRef.current.origY + dy };
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(applyPosition);
    };
    const onUp = () => { isDraggingRef.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [applyPosition]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isMinimized || sweepAnimating) return;
      
      // ⌘A / Ctrl+A — select all visible
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        setSelectedIds(new Set(filteredFiles.map(f => f.id)));
      }
      // Delete / Backspace — sweep selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.size > 0 && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        sweepSelected();
      }
      // ⌘Z — undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && undoData) {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  // Filtered + sorted files
  const filteredFiles = (() => {
    let result = files;
    if (activeCategory !== 'all') result = result.filter(f => f.category.includes(activeCategory));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(f => f.name.toLowerCase().includes(q));
    }
    return result.sort((a, b) => {
      if (sortMode === 'size') return sortOrder === 'desc' ? b.size - a.size : a.size - b.size;
      if (sortMode === 'lastOpened') {
        const da = new Date(a.lastOpened).getTime();
        const db = new Date(b.lastOpened).getTime();
        return sortOrder === 'desc' ? da - db : db - da;
      }
      if (sortMode === 'relevance') {
        const pa = a.keepPriority ?? 50;
        const pb = b.keepPriority ?? 50;
        return sortOrder === 'asc' ? pa - pb : pb - pa;
      }
      return 0;
    });
  })();

  const selectedSize = files.filter(f => selectedIds.has(f.id)).reduce((sum, f) => sum + f.size, 0);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }, []);

  const trashSingle = useCallback((id: string) => {
    const file = files.find(f => f.id === id);
    if (!file) return;
    // Save for undo
    setUndoData({ files: [file], size: file.size });
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => setUndoData(null), 10000);

    setFiles(prev => prev.filter(f => f.id !== id));
    setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    setCurrentUsed(prev => prev - file.size);
    setRecentlySwept(prev => [{ files: [file], totalSize: file.size, timestamp: new Date() }, ...prev].slice(0, 20));
  }, [files]);

  const handleUndo = useCallback(() => {
    if (!undoData) return;
    setFiles(prev => [...prev, ...undoData.files]);
    setCurrentUsed(prev => prev + undoData.size);
    setUndoData(null);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setRecentlySwept(prev => prev.slice(1));
  }, [undoData]);

  const sweepSelected = useCallback(() => {
    const swept = files.filter(f => selectedIds.has(f.id));
    if (swept.length === 0) return;
    const totalSwept = swept.reduce((s, f) => s + f.size, 0);
    
    // Capture card positions relative to the overlay
    const overlayRect = overlayRef.current?.getBoundingClientRect();
    const spawns = swept.map(f => {
      const el = cardRefs.current.get(f.id);
      if (el && overlayRect) {
        const rect = el.getBoundingClientRect();
        const topPct = ((rect.top - overlayRect.top + rect.height / 2) / overlayRect.height) * 100;
        const leftPct = ((rect.right - overlayRect.left - 40) / overlayRect.width) * 100;
        return { id: f.id, topPct: Math.min(Math.max(topPct, 5), 85), leftPct: Math.min(leftPct, 90) };
      }
      return { id: f.id, topPct: 40, leftPct: 75 };
    });
    setBallSpawns(spawns);
    
    setSweepAnimating(true);
    
    setTimeout(() => {
      setFiles(prev => prev.filter(f => !selectedIds.has(f.id)));
      setCurrentUsed(prev => prev - totalSwept);
      setSelectedIds(new Set());
      setSweepAnimating(false);
      setShowTick(true);
      setSweepResult({ count: swept.length, size: totalSwept });

      // Save for undo
      setUndoData({ files: swept, size: totalSwept });
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      undoTimerRef.current = setTimeout(() => setUndoData(null), 10000);

      // Add to recents
      setRecentlySwept(prev => [{ files: swept, totalSize: totalSwept, timestamp: new Date() }, ...prev].slice(0, 20));
      
      setTimeout(() => {
        setShowTick(false);
        setSweepResult(null);
      }, 1200);
    }, 1200);
  }, [files, selectedIds]);

  const handleScanFolder = async () => {
    const scanned = await scanFolder();
    if (scanned.length > 0) {
      setFiles(scanned);
      setSelectedIds(new Set());
    }
    setLastScanTime(new Date());
  };

  const handleAnalyze = async () => {
    const analyzed = await analyzeFiles(files);
    setFiles(analyzed);
    setSortMode('relevance');
    setSortOrder('asc');
  };

  const selectLowPriority = () => {
    const lowPriority = files.filter(f => (f.keepPriority ?? 50) < 40);
    setSelectedIds(new Set(lowPriority.map(f => f.id)));
  };

  // Duplicate detection
  const duplicateGroups = useMemo(() => {
    const groups = new Map<string, SweepFile[]>();
    files.forEach(f => {
      const key = `${f.name}|${f.size}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(f);
    });
    return [...groups.values()].filter(g => g.length > 1);
  }, [files]);

  const duplicateCount = duplicateGroups.reduce((sum, g) => sum + g.length, 0);

  const sortLabels: Record<SortMode, string> = {
    size: 'Size',
    lastOpened: 'Last Opened',
    relevance: 'Keep Priority',
  };

  if (isMinimized) {
    return (
      <div
        className="fixed z-[100] cursor-pointer left-0 top-0"
        style={{ transform: `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`, willChange: 'transform' }}
        onClick={() => setIsMinimized(false)}
      >
        <div className="w-12 h-12 rounded-2xl bg-black/80 shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-110 transition-transform">
          <AbstractShape size={28} />
        </div>
      </div>
    );
  }

  const width = isExpanded ? 'w-[800px]' : 'w-[420px]';
  const height = isExpanded ? 'h-[85vh]' : 'h-[600px]';

  return (
      <div
        ref={overlayRef}
        className={`fixed z-[100] left-0 top-0 ${width} ${height} flex flex-col`}
        style={{ transform: `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`, willChange: 'transform', maxHeight: '90vh' }}
      >
        <div className="flex flex-col h-full rounded-3xl overflow-hidden shadow-2xl shadow-black/8 border border-white/20"
          style={{ background: `hsla(0, 0%, 100%, ${panelOpacity / 100})`, backdropFilter: `blur(${bgBlur}px) saturate(180%)`, WebkitBackdropFilter: `blur(${bgBlur}px) saturate(180%)` }}>
          
          {/* Title bar - draggable */}
          <div
            className="flex items-center justify-between px-4 py-3 cursor-move select-none border-b border-white/10"
            onMouseDown={onMouseDown}
          >
            <div className="flex items-center gap-2.5">
              <GripVertical size={14} className="text-white/30" />
              <div className="w-7 h-7 rounded-lg flex items-center justify-center">
                <AbstractShape size={22} />
              </div>
              <span className="text-sm font-semibold text-white tracking-tight">swept.ai</span>
              {isAnalyzing && (
                <span className="text-xs text-primary animate-pulse flex items-center gap-1">
                  <Sparkles size={10} /> Analyzing...
                </span>
              )}
              {isScanning && (
                <span className="text-xs text-primary animate-pulse flex items-center gap-1">
                  <FolderOpen size={10} /> Scanning...
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setShowRecents(!showRecents)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 transition-colors" title="Recently swept">
                <History size={12} />
              </button>
              <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 transition-colors">
                {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
              </button>
              <button onClick={() => setIsMinimized(true)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 transition-colors">
                <Minus size={12} />
              </button>
              <button onClick={() => setIsMinimized(true)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors">
                <X size={12} />
              </button>
            </div>
          </div>

          {/* Recently Swept dropdown */}
          <AnimatePresence>
            {showRecents && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-b border-white/10 overflow-hidden"
              >
                <div className="px-4 py-2 max-h-[140px] overflow-y-auto">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-2">Recently Swept</p>
                  {recentlySwept.length === 0 ? (
                    <p className="text-[11px] text-white/30 pb-1">Nothing swept yet this session</p>
                  ) : (
                    recentlySwept.map((entry, i) => (
                      <div key={i} className="flex justify-between items-center py-1">
                        <span className="text-[11px] text-white/60 truncate">
                          {entry.files.length} file{entry.files.length > 1 ? 's' : ''} · {formatSize(entry.totalSize)}
                        </span>
                        <span className="text-[10px] text-white/30 flex-shrink-0 ml-2">{timeAgo(entry.timestamp)}</span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Compact storage + actions */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <StorageRing used={currentUsed} total={totalStorage} />
              {lastScanTime && (
                <span className="text-[10px] text-white/30">
                  Scanned {timeAgo(lastScanTime)}
                </span>
              )}
            </div>
            <div className="flex gap-1.5">
              <button onClick={handleScanFolder} disabled={isScanning} className="overlay-action-btn" title="Scan a folder">
                <FolderOpen size={14} />
              </button>
              <button onClick={handleAnalyze} disabled={isAnalyzing || files.length === 0} className="overlay-action-btn" title="AI Keep Priority analysis">
                <Sparkles size={14} />
              </button>
              {files.some(f => f.keepPriority !== undefined) && (
                <button onClick={selectLowPriority} className="overlay-action-btn text-destructive" title="Select low priority files">
                  <BarChart3 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Category tabs with duplicate badge */}
          <div className="px-4 pt-3 pb-1">
            <CategoryTabs active={activeCategory} onSelect={setActiveCategory} duplicateCount={duplicateCount} />
          </div>

          {/* Search + Sort */}
          <div className="flex gap-2 px-4 py-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="no-drag w-full rounded-xl pl-8 pr-3 py-2 text-xs outline-none transition-all border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
              />
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="overlay-sort-btn"
              >
                {sortOrder === 'desc' ? <ArrowDown size={11} /> : <ArrowUp size={11} />}
                <span>{sortLabels[sortMode]}</span>
                <ChevronDown size={10} />
              </button>
              {showSortMenu && (
                <div className="absolute right-0 top-full mt-1 w-40 rounded-xl bg-white/10 backdrop-blur-xl border border-white/15 shadow-lg z-10 py-1 overflow-hidden">
                  {(Object.keys(sortLabels) as SortMode[]).map(mode => (
                    <button
                      key={mode}
                      onClick={() => {
                        if (sortMode === mode) {
                          setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
                        } else {
                          setSortMode(mode);
                          setSortOrder(mode === 'relevance' ? 'asc' : 'desc');
                        }
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-white/10 transition-colors ${
                        sortMode === mode ? 'text-primary font-semibold' : 'text-white/80'
                      }`}
                    >
                      {sortLabels[mode]}
                      {sortMode === mode && (sortOrder === 'desc' ? <ArrowDown size={10} /> : <ArrowUp size={10} />)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* File list */}
          <div ref={fileListRef} className="flex-1 overflow-y-auto px-3 pb-2 space-y-1.5 no-drag relative">
            {filteredFiles.length === 0 && !sweepAnimating ? (
              <EmptyState category={activeCategory} />
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredFiles.map((file) => {
                  const isSelected = selectedIds.has(file.id);
                  return (
                    <motion.div
                      key={file.id}
                      ref={(el: HTMLDivElement | null) => { if (el) cardRefs.current.set(file.id, el); else cardRefs.current.delete(file.id); }}
                      layout
                      initial={false}
                      animate={sweepAnimating && isSelected ? {
                        opacity: [1, 0.3, 0],
                        scaleY: [1, 0.6, 0],
                        scaleX: [1, 0.8, 0.3],
                        height: ['auto', '16px', 0],
                        marginBottom: [6, 2, 0],
                      } : { opacity: 1, scaleX: 1, scaleY: 1 }}
                      transition={sweepAnimating && isSelected ? {
                        duration: 0.5,
                        ease: [0.4, 0, 1, 1],
                      } : { layout: { duration: 0.4, ease: 'easeOut' } }}
                      style={{ transformOrigin: 'center center' }}
                    >
                      <OverlayFileCard
                        file={file}
                        selected={isSelected}
                        onToggle={sweepAnimating ? () => {} : toggleSelect}
                        onTrash={sweepAnimating ? () => {} : trashSingle}
                        totalStorage={totalStorage}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          {/* Undo banner */}
          <AnimatePresence>
            {undoData && !sweepAnimating && !showTick && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="border-t border-white/10 overflow-hidden"
              >
                <div className="px-4 py-2.5 flex items-center justify-between bg-white/5">
                  <span className="text-[11px] text-white/60">
                    {undoData.files.length} file{undoData.files.length > 1 ? 's' : ''} moved to Trash · {formatSize(undoData.size)}
                  </span>
                  <button
                    onClick={handleUndo}
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    <Undo2 size={12} /> Undo
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom sweep bar */}
          <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between">
            <p className="text-xs text-white/50">
              <span className="text-white font-semibold">{selectedIds.size}</span> selected · <span className="text-white font-semibold">{formatSize(selectedSize)}</span>
            </p>
            <motion.button
              ref={sweepBtnRef}
              onClick={sweepSelected}
              disabled={selectedIds.size === 0 || sweepAnimating}
              animate={sweepAnimating ? {
                scale: [1, ...Array.from({ length: selectedIds.size }, () => [1.15, 0.92, 1.05, 1]).flat()],
                boxShadow: [
                  '0 4px 12px rgba(239,68,68,0.2)',
                  ...Array.from({ length: selectedIds.size }, () => [
                    '0 0 25px rgba(239,68,68,0.7)',
                    '0 4px 12px rgba(239,68,68,0.3)',
                    '0 0 18px rgba(239,68,68,0.5)',
                    '0 4px 12px rgba(239,68,68,0.2)',
                  ]).flat(),
                ],
              } : { scale: 1 }}
              transition={sweepAnimating ? {
                duration: 0.3 * selectedIds.size + 0.8,
                ease: 'easeOut',
                delay: 0.6,
              } : { type: 'spring', stiffness: 400, damping: 15 }}
              className={`relative px-5 py-2 rounded-xl font-semibold text-xs transition-colors ${
                selectedIds.size === 0
                  ? 'bg-white/10 text-white/30 cursor-not-allowed'
                  : 'bg-destructive text-destructive-foreground shadow-md shadow-destructive/20 hover:brightness-110 hover:-translate-y-0.5'
              }`}
            >
              Sweep {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
              <AnimatePresence>
                {sweepAnimating && (
                  <>
                    {[...Array(3)].map((_, ri) => (
                      <motion.span
                        key={ri}
                        className="absolute inset-0 rounded-xl border-2 border-destructive/40"
                        initial={{ scale: 1, opacity: 0.6 }}
                        animate={{ scale: 1.8, opacity: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 + ri * 0.25, ease: 'easeOut' }}
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Logo balls floating from file size badges to sweep button */}
        <AnimatePresence>
          {sweepAnimating && ballSpawns.map((spawn, idx) => {
            const endTop = 93;
            const endLeft = 85;
            const dy = endTop - spawn.topPct;
            const dx = endLeft - spawn.leftPct;
            
            return (
              <motion.div
                key={`ball-${spawn.id}`}
                className="absolute z-40 pointer-events-none"
                style={{ left: `${spawn.leftPct}%`, top: `${spawn.topPct}%`, marginLeft: -18, marginTop: -18 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 1, 1, 0],
                  scale: [0, 1, 0.9, 0.7, 0.2],
                  x: [0, dx * 0.1, dx * 0.5, dx * 0.85, dx].map(v => `${v}%`),
                  y: [0, dy * 0.05, dy * 0.4, dy * 0.75, dy].map(v => `${v}%`),
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  duration: 1.0,
                  ease: [0.25, 0.1, 0.25, 1],
                  delay: idx * 0.08,
                }}
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{
                    background: 'radial-gradient(circle, hsl(var(--primary) / 0.6) 0%, hsl(var(--primary) / 0.2) 70%)',
                    boxShadow: '0 0 14px hsl(var(--primary) / 0.5), 0 0 28px hsl(var(--primary) / 0.2)',
                  }}
                >
                  <AbstractShape size={24} />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Minimalist tick overlay */}
        <AnimatePresence>
          {showTick && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl"
              style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check size={28} className="text-green-400" strokeWidth={2.5} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
};

// Compact file card for overlay
const OverlayFileCard = ({ file, selected, onToggle, onTrash, totalStorage }: {
  file: SweepFile;
  selected: boolean;
  onToggle: (id: string) => void;
  onTrash: (id: string) => void;
  totalStorage: number;
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const tagColors: Record<string, string> = {
    'essential': 'bg-green-500/20 text-green-300',
    'useful': 'bg-blue-500/20 text-blue-300',
    'questionable': 'bg-yellow-500/20 text-yellow-300',
    'low-priority': 'bg-orange-500/20 text-orange-300',
    'safe-to-remove': 'bg-red-500/20 text-red-300',
  };

  return (
    <div
      onClick={() => onToggle(file.id)}
      className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
        selected 
          ? 'bg-primary/15 border border-primary/30 shadow-sm shadow-primary/10' 
          : 'hover:bg-white/5 border border-transparent'
      }`}
    >
      <div className={`w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
        selected ? 'bg-primary' : 'border border-white/20 bg-white/10'
      }`}>
        {selected && <Check size={10} className="text-primary-foreground" strokeWidth={3} />}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-white truncate leading-tight">{file.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-white/40 truncate">{file.path}</span>
          {file.relevanceTag && (
            <span 
              className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium cursor-help relative ${tagColors[file.relevanceTag] || 'bg-white/10 text-white/50'}`}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              {file.relevanceTag === 'safe-to-remove' ? 'Safe to remove' : file.relevanceTag}
              {/* AI explanation tooltip */}
              <AnimatePresence>
                {showTooltip && file.relevanceReason && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute bottom-full left-0 mb-2 w-48 p-2 rounded-lg bg-black/90 backdrop-blur-sm border border-white/10 z-50"
                  >
                    <p className="text-[10px] text-white/80 leading-relaxed">{file.relevanceReason}</p>
                    {file.confidence !== undefined && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${file.confidence > 80 ? 'bg-green-500' : file.confidence > 50 ? 'bg-yellow-500' : 'bg-orange-500'}`}
                            style={{ width: `${file.confidence}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-white/40">{file.confidence}% sure</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {file.keepPriority !== undefined && (
          <div className="flex items-center gap-1 relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <div className="w-8 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  file.keepPriority > 70 ? 'bg-green-500' :
                  file.keepPriority > 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${file.keepPriority}%` }}
              />
            </div>
            <span className="text-[9px] text-white/40 w-5 text-right">{file.keepPriority}</span>
            {file.confidence !== undefined && (
              <span className={`text-[8px] px-1 py-0.5 rounded ${
                file.confidence > 80 ? 'text-green-400/60' : file.confidence > 50 ? 'text-yellow-400/60' : 'text-orange-400/60'
              }`}>
                {file.confidence}%
              </span>
            )}
          </div>
        )}
        <span className="text-[10px] font-semibold text-primary bg-primary/15 px-2 py-0.5 rounded-lg">
          {formatSizeWithContext(file.size, totalStorage)}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onTrash(file.id); }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};

export default FloatingOverlay;
