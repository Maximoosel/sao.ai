import { useState, useMemo, useCallback } from 'react';
import { Search, Undo2, Wind, ArrowUpDown, ArrowDown, ArrowUp } from 'lucide-react';
import StorageRing from '@/components/StorageRing';
import CategoryTabs from '@/components/CategoryTabs';
import FileCard from '@/components/FileCard';
import EmptyState from '@/components/EmptyState';
import OnboardingModal from '@/components/OnboardingModal';
import SweepConfirmation from '@/components/SweepConfirmation';
import SplashScreen from '@/components/SplashScreen';
import { mockFiles, totalStorage, usedStorage, formatSize, type FileCategory, type SweepFile } from '@/lib/mockData';

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [files, setFiles] = useState<SweepFile[]>(mockFiles);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<FileCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sweepResult, setSweepResult] = useState<{ count: number; size: number } | null>(null);
  const [undoStack, setUndoStack] = useState<SweepFile[]>([]);
  const [showUndo, setShowUndo] = useState(false);
  const [currentUsed, setCurrentUsed] = useState(usedStorage);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const filteredFiles = useMemo(() => {
    let result = files;
    if (activeCategory !== 'all') {
      result = result.filter(f => f.category.includes(activeCategory));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(f => f.name.toLowerCase().includes(q));
    }
    return result.sort((a, b) => sortOrder === 'desc' ? b.size - a.size : a.size - b.size);
  }, [files, activeCategory, searchQuery, sortOrder]);

  const selectedSize = useMemo(() => {
    return files.filter(f => selectedIds.has(f.id)).reduce((sum, f) => sum + f.size, 0);
  }, [files, selectedIds]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const trashSingle = useCallback((id: string) => {
    const file = files.find(f => f.id === id);
    if (!file) return;
    setUndoStack([file]);
    setFiles(prev => prev.filter(f => f.id !== id));
    setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    setCurrentUsed(prev => prev - file.size);
    setShowUndo(true);
    setTimeout(() => setShowUndo(false), 5000);
  }, [files]);

  const sweepSelected = useCallback(() => {
    const swept = files.filter(f => selectedIds.has(f.id));
    if (swept.length === 0) return;
    const totalSwept = swept.reduce((s, f) => s + f.size, 0);
    setUndoStack(swept);
    setFiles(prev => prev.filter(f => !selectedIds.has(f.id)));
    setCurrentUsed(prev => prev - totalSwept);
    setSelectedIds(new Set());
    setSweepResult({ count: swept.length, size: totalSwept });
    setTimeout(() => {
      setSweepResult(null);
      setShowUndo(true);
      setTimeout(() => setShowUndo(false), 5000);
    }, 2000);
  }, [files, selectedIds]);

  const undoSweep = useCallback(() => {
    setFiles(prev => [...prev, ...undoStack]);
    setCurrentUsed(prev => prev + undoStack.reduce((s, f) => s + f.size, 0));
    setUndoStack([]);
    setShowUndo(false);
  }, [undoStack]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (showOnboarding) {
    return <OnboardingModal onDismiss={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 max-w-4xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wind size={20} className="text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Sweep</h1>
        </div>
        <StorageRing used={currentUsed} total={totalStorage} />
      </div>

      {/* Category tabs */}
      <div className="mb-5 animate-fade-in-up-delay-1">
        <CategoryTabs active={activeCategory} onSelect={setActiveCategory} />
      </div>

      {/* Search + Sort */}
      <div className="flex gap-2 mb-4 animate-fade-in-up-delay-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input pl-10"
          />
        </div>
        <button
          onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
          className="sort-button"
          title={`Sort by size ${sortOrder === 'desc' ? 'ascending' : 'descending'}`}
        >
          {sortOrder === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
          Size
        </button>
      </div>

      {/* File list */}
      <div className="space-y-2 mb-28 animate-fade-in-up-delay-3">
        {filteredFiles.length === 0 ? (
          <EmptyState />
        ) : (
          filteredFiles.map((file, i) => (
            <FileCard
              key={file.id}
              file={file}
              selected={selectedIds.has(file.id)}
              onToggle={toggleSelect}
              onTrash={trashSingle}
              index={i}
            />
          ))
        )}
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="max-w-4xl mx-auto px-4 md:px-8 pb-4">
          {showUndo && undoStack.length > 0 && (
            <div className="undo-banner flex items-center justify-between mb-3">
              <span>{undoStack.length} file{undoStack.length > 1 ? 's' : ''} moved to Trash</span>
              <button onClick={undoSweep} className="flex items-center gap-1 font-semibold hover:underline">
                <Undo2 size={14} /> Undo
              </button>
            </div>
          )}
          <div className="glass-panel px-5 py-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Selected: <span className="text-foreground font-semibold">{selectedIds.size} files</span> · <span className="text-foreground font-semibold">{formatSize(selectedSize)}</span>
            </p>
            <button
              onClick={sweepSelected}
              disabled={selectedIds.size === 0}
              className={`sweep-button ${selectedIds.size === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              Sweep
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
    </div>
  );
};

export default Index;
