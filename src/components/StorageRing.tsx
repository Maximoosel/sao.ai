import { formatSize } from '@/lib/mockData';

interface StorageRingProps {
  used: number;
  total: number;
}

const StorageRing = ({ used, total }: StorageRingProps) => {
  const percentage = (used / total) * 100;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="6"
          />
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="animate-ring-fill"
            style={{ '--ring-target': offset } as React.CSSProperties}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold text-foreground">{percentage.toFixed(0)}%</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-foreground">{formatSize(used)}</p>
        <p className="text-xs text-muted-foreground">of {formatSize(total)} used</p>
      </div>
    </div>
  );
};

export default StorageRing;
