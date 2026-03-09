import { Trash2, Check, FileText, Film, Image, Archive, Package, Disc, File } from 'lucide-react';
import { SweepFile, formatSize, formatDate } from '@/lib/mockData';

const typeIconMap: Record<string, React.ReactNode> = {
  app: <Package size={18} className="text-primary" />,
  archive: <Archive size={18} className="text-orange-500" />,
  video: <Film size={18} className="text-purple-500" />,
  image: <Image size={18} className="text-green-500" />,
  document: <FileText size={18} className="text-blue-500" />,
  installer: <Disc size={18} className="text-rose-500" />,
};

interface FileCardProps {
  file: SweepFile;
  selected: boolean;
  onToggle: (id: string) => void;
  onTrash: (id: string) => void;
  index: number;
}

const FileCard = ({ file, selected, onToggle, onTrash, index }: FileCardProps) => {
  const icon = typeIconMap[file.type] || <File size={18} className="text-muted-foreground" />;

  return (
    <div
      onClick={() => onToggle(file.id)}
      className={`group flex items-center gap-3.5 px-4 py-3.5 cursor-pointer rounded-2xl transition-all duration-200 ${
        selected ? 'bg-white/20 border-primary/40' : 'bg-white/8 hover:bg-white/12'
      }`}
      style={{ 
        animationDelay: `${index * 0.03}s`,
        border: selected ? '1px solid hsl(var(--primary) / 0.4)' : '0.5px solid rgba(255,255,255,0.1)',
        boxShadow: selected ? '0 0 0 3px hsl(var(--primary) / 0.1)' : 'none'
      }}
    >
      {/* Checkbox */}
      <div className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
        selected
          ? 'bg-primary shadow-sm'
          : 'bg-white/10 border border-white/20'
      }`}>
        {selected && <Check size={12} className="text-primary-foreground" strokeWidth={3} />}
      </div>

      {/* File icon */}
      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/90 truncate">{file.name}</p>
        <p className="text-xs text-white/50 truncate">{file.path} · {formatDate(file.lastOpened)}</p>
      </div>

      {/* Size badge */}
      <span className="size-badge flex-shrink-0">{formatSize(file.size)}</span>

      {/* Trash */}
      <button
        onClick={(e) => { e.stopPropagation(); onTrash(file.id); }}
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-xl hover:bg-destructive/10 text-white/40 hover:text-destructive flex-shrink-0"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
};

export default FileCard;
