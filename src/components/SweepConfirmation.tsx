import { formatSize } from '@/lib/mockData';

interface SweepConfirmationProps {
  fileCount: number;
  totalSize: number;
  onClose: () => void;
}

const SweepConfirmation = ({ fileCount, totalSize, onClose }: SweepConfirmationProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div className="animate-sweep-confirm text-center" onClick={(e) => e.stopPropagation()}>
        <span className="text-6xl block mb-4">🧹</span>
        <h2 className="text-2xl font-bold text-foreground mb-1">Swept {formatSize(totalSize)}</h2>
        <p className="text-muted-foreground text-sm">{fileCount} files moved to Trash</p>
      </div>
    </div>
  );
};

export default SweepConfirmation;
