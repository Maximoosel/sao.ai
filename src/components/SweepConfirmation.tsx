import { formatSize } from '@/lib/mockData';
import { Check } from 'lucide-react';

interface SweepConfirmationProps {
  fileCount: number;
  totalSize: number;
  onClose: () => void;
}

const SweepConfirmation = ({ fileCount, totalSize, onClose }: SweepConfirmationProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md" onClick={onClose}>
      <div className="animate-sweep-confirm text-center glass-panel p-10" onClick={(e) => e.stopPropagation()}>
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
          <Check size={32} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Swept {formatSize(totalSize)}</h2>
        <p className="text-muted-foreground text-sm">{fileCount} files moved to Trash</p>
      </div>
    </div>
  );
};

export default SweepConfirmation;
