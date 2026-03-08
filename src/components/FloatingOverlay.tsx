import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Layers, X, Minus, Search, FolderOpen, Sparkles, ArrowDown, ArrowUp, 
  Clock, BarChart3, Trash2, Check, GripVertical, Maximize2, Minimize2,
  ChevronDown
} from 'lucide-react';
import { AbstractShape } from './SplashScreen';
import FileCard from './FileCard';
import StorageRing from './StorageRing';
import EmptyState from './EmptyState';
import SweepConfirmation from './SweepConfirmation';
import CategoryTabs from './CategoryTabs';
import { useFileScanner } from '@/hooks/useFileScanner';
import { useRelevanceScoring } from '@/hooks/useRelevanceScoring';
import { mockFiles, totalStorage, usedStorage, formatSize, type FileCategory, type SweepFile } from '@/lib/mockData';

type SortMode = 'size' | 'lastOpened' | 'relevance';

const FloatingOverlay = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const [files, setFiles] = useState<SweepFile[]>(mockFiles);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<FileCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('size');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [sweepResult, setSweepResult] = useState<{ count: number; size: number } | null>(null);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [currentUsed, setCurrentUsed] = useState(usedStorage);

  const { isScanning, scanFolder } = useFileScanner();
  const { isAnalyzing, analyzeFiles } = useRelevanceScoring();

  // Drag handling
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, .no-drag')) return;
    setIsDragging(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: position.x, origY: position.y };
  }, [position]);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPosition({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy });
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isDragging]);

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
        return sortOrder === 'desc' ? da - db : db - da; // desc = oldest first (least recently opened)
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
    setFiles(prev => prev.filter(f => f.id !== id));
    setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    setCurrentUsed(prev => prev - file.size);
  }, [files]);

  const sweepSelected = useCallback(() => {
    const swept = files.filter(f => selectedIds.has(f.id));
    if (swept.length === 0) return;
    const totalSwept = swept.reduce((s, f) => s + f.size, 0);
    setFiles(prev => prev.filter(f => !selectedIds.has(f.id)));
    setCurrentUsed(prev => prev - totalSwept);
    setSelectedIds(new Set());
    setSweepResult({ count: swept.length, size: totalSwept });
    setTimeout(() => setSweepResult(null), 2500);
  }, [files, selectedIds]);

  const handleScanFolder = async () => {
    const scanned = await scanFolder();
    if (scanned.length > 0) {
      setFiles(scanned);
      setSelectedIds(new Set());
    }
  };

  const handleAnalyze = async () => {
    const analyzed = await analyzeFiles(files);
    setFiles(analyzed);
    setSortMode('relevance');
    setSortOrder('asc'); // Show lowest priority first (most deletable)
  };

  const selectLowPriority = () => {
    const lowPriority = files.filter(f => (f.keepPriority ?? 50) < 40);
    setSelectedIds(new Set(lowPriority.map(f => f.id)));
  };

  const sortLabels: Record<SortMode, string> = {
    size: 'Size',
    lastOpened: 'Last Opened',
    relevance: 'Keep Priority',
  };

  if (isMinimized) {
    return (
      <div
        className="fixed z-[100] cursor-pointer"
        style={{ left: position.x, top: position.y }}
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
    <>
      <div
        ref={overlayRef}
        className={`fixed z-[100] ${width} ${height} flex flex-col transition-all duration-300`}
        style={{ left: position.x, top: position.y, maxHeight: '90vh' }}
      >
        <div className="flex flex-col h-full rounded-3xl overflow-hidden shadow-2xl shadow-black/10 border border-white/40"
          style={{ background: 'hsla(0, 0%, 100%, 0.55)', backdropFilter: 'blur(80px) saturate(180%)', WebkitBackdropFilter: 'blur(80px) saturate(180%)' }}>
          
          {/* Title bar - draggable */}
          <div
            className="flex items-center justify-between px-4 py-3 cursor-move select-none border-b border-black/5"
            onMouseDown={onMouseDown}
          >
            <div className="flex items-center gap-2.5">
              <GripVertical size={14} className="text-muted-foreground/50" />
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Layers size={14} className="text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground tracking-tight">Sift</span>
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
              <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 rounded-lg hover:bg-black/5 text-muted-foreground transition-colors">
                {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
              </button>
              <button onClick={() => setIsMinimized(true)} className="p-1.5 rounded-lg hover:bg-black/5 text-muted-foreground transition-colors">
                <Minus size={12} />
              </button>
              <button onClick={() => setIsMinimized(true)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                <X size={12} />
              </button>
            </div>
          </div>

          {/* Compact storage + actions */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-black/5">
            <StorageRing used={currentUsed} total={totalStorage} />
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

          {/* Category tabs */}
          <div className="px-4 pt-3 pb-1">
            <CategoryTabs active={activeCategory} onSelect={setActiveCategory} />
          </div>

          {/* Search + Sort */}
          <div className="flex gap-2 px-4 py-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="no-drag w-full rounded-xl pl-8 pr-3 py-2 text-xs outline-none transition-all border border-black/5 bg-white/50 focus:border-primary/30 focus:ring-2 focus:ring-primary/10"
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
                <div className="absolute right-0 top-full mt-1 w-40 rounded-xl bg-white/95 backdrop-blur-xl border border-black/10 shadow-lg z-10 py-1 overflow-hidden">
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
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-black/5 transition-colors ${
                        sortMode === mode ? 'text-primary font-semibold' : 'text-foreground'
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
          <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-1.5 no-drag">
            {filteredFiles.length === 0 ? (
              <EmptyState />
            ) : (
              filteredFiles.map((file, i) => (
                <OverlayFileCard
                  key={file.id}
                  file={file}
                  selected={selectedIds.has(file.id)}
                  onToggle={toggleSelect}
                  onTrash={trashSingle}
                />
              ))
            )}
          </div>

          {/* Bottom sweep bar */}
          <div className="px-4 py-3 border-t border-black/5 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              <span className="text-foreground font-semibold">{selectedIds.size}</span> selected · <span className="text-foreground font-semibold">{formatSize(selectedSize)}</span>
            </p>
            <button
              onClick={sweepSelected}
              disabled={selectedIds.size === 0}
              className={`px-5 py-2 rounded-xl font-semibold text-xs transition-all ${
                selectedIds.size === 0
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-destructive text-destructive-foreground shadow-md shadow-destructive/20 hover:brightness-110 hover:-translate-y-0.5'
              }`}
            >
              Sweep {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
            </button>
          </div>
        </div>
      </div>

      {sweepResult && (
        <SweepConfirmation
          fileCount={sweepResult.count}
          totalSize={sweepResult.size}
          onClose={() => setSweepResult(null)}
        />
      )}
    </>
  );
};

// Compact file card for overlay
const OverlayFileCard = ({ file, selected, onToggle, onTrash }: {
  file: SweepFile;
  selected: boolean;
  onToggle: (id: string) => void;
  onTrash: (id: string) => void;
}) => {
  const tagColors: Record<string, string> = {
    'essential': 'bg-green-100 text-green-700',
    'useful': 'bg-blue-100 text-blue-700',
    'questionable': 'bg-yellow-100 text-yellow-700',
    'low-priority': 'bg-orange-100 text-orange-700',
    'safe-to-remove': 'bg-red-100 text-red-700',
  };

  return (
    <div
      onClick={() => onToggle(file.id)}
      className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
        selected 
          ? 'bg-primary/8 border border-primary/25 shadow-sm shadow-primary/5' 
          : 'hover:bg-black/3 border border-transparent'
      }`}
    >
      <div className={`w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
        selected ? 'bg-primary' : 'border border-black/15 bg-white/80'
      }`}>
        {selected && <Check size={10} className="text-primary-foreground" strokeWidth={3} />}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate leading-tight">{file.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-muted-foreground truncate">{file.path}</span>
          {file.relevanceTag && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${tagColors[file.relevanceTag] || 'bg-muted text-muted-foreground'}`}>
              {file.relevanceTag === 'safe-to-remove' ? 'Safe to remove' : file.relevanceTag}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {file.keepPriority !== undefined && (
          <div className="flex items-center gap-1">
            <div className="w-8 h-1.5 rounded-full bg-black/5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  file.keepPriority > 70 ? 'bg-green-500' :
                  file.keepPriority > 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${file.keepPriority}%` }}
              />
            </div>
            <span className="text-[9px] text-muted-foreground w-5 text-right">{file.keepPriority}</span>
          </div>
        )}
        <span className="text-[10px] font-semibold text-primary bg-primary/8 px-2 py-0.5 rounded-lg">{formatSize(file.size)}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onTrash(file.id); }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};

export default FloatingOverlay;
