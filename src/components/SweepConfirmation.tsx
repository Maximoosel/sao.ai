import { formatSize } from '@/lib/mockData';
import { Check } from 'lucide-react';

interface SweepConfirmationProps {
  fileCount: number;
  totalSize: number;
  onClose: () => void;
}

const SweepConfirmation = ({ fileCount, totalSize, onClose }: SweepConfirmationProps) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-background/30 backdrop-blur-sm" onClick={onClose}>
      <div className="animate-sweep-confirm text-center glass-panel p-6 max-w-[240px]" onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
          <Check size={20} className="text-green-500" />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-0.5">Swept {formatSize(totalSize)}</h2>
        <p className="text-muted-foreground text-xs">{fileCount} files moved to Trash</p>
      </div>
    </div>
  );
};

export default SweepConfirmation;
