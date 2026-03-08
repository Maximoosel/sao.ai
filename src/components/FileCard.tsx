import { Trash2, Check } from 'lucide-react';
import { SweepFile, formatSize, formatDate, getFileIcon } from '@/lib/mockData';

interface FileCardProps {
  file: SweepFile;
  selected: boolean;
  onToggle: (id: string) => void;
  onTrash: (id: string) => void;
  index: number;
}

const FileCard = ({ file, selected, onToggle, onTrash, index }: FileCardProps) => {
  return (
    <div
      onClick={() => onToggle(file.id)}
      className={`glass-card group flex items-center gap-4 px-4 py-3 cursor-pointer ${selected ? 'glass-card-selected' : ''}`}
      style={{ animationDelay: `${index * 0.03}s` }}
    >
      {/* Selection indicator */}
      <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
        selected 
          ? 'bg-primary' 
          : 'border border-muted-foreground/30'
      }`}>
        {selected && <Check size={12} className="text-primary-foreground" />}
      </div>

      {/* File icon */}
      <span className="text-xl flex-shrink-0">{getFileIcon(file.type)}</span>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground truncate">{file.path} · {formatDate(file.lastOpened)}</p>
      </div>

      {/* Size badge */}
      <span className="size-badge flex-shrink-0">{formatSize(file.size)}</span>

      {/* Trash button */}
      <button
        onClick={(e) => { e.stopPropagation(); onTrash(file.id); }}
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex-shrink-0"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default FileCard;
