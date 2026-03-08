import { formatSize } from '@/lib/mockData';

interface StorageRingProps {
  used: number;
  total: number;
}

const StorageRing = ({ used, total }: StorageRingProps) => {
  const percentage = (used / total) * 100;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="animate-ring-fill"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-foreground">{percentage.toFixed(0)}%</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{formatSize(used)}</p>
        <p className="text-xs text-muted-foreground">of {formatSize(total)}</p>
      </div>
    </div>
  );
};

export default StorageRing;
