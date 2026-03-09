import { Folder, Feather, Clock, Download, Copy, Camera } from 'lucide-react';
import type { FileCategory } from '@/lib/mockData';

const categoryMessages: Record<FileCategory | 'all', { icon: React.ReactNode; title: string; desc: string }> = {
  all: { icon: <Folder size={28} className="text-white/40" />, title: 'Ready to sweep', desc: 'Select a folder to start scanning files' },
  large: { icon: <Feather size={28} className="text-white/40" />, title: 'Nothing heavy here', desc: 'No large files detected' },
  old: { icon: <Clock size={28} className="text-white/40" />, title: 'No old files', desc: 'Everything looks recently used' },
  downloads: { icon: <Download size={28} className="text-white/40" />, title: 'Downloads clean', desc: 'No lingering downloads found' },
  duplicates: { icon: <Copy size={28} className="text-white/40" />, title: 'No duplicates', desc: 'All files are unique copies' },
  screenshots: { icon: <Camera size={28} className="text-white/40" />, title: 'Screenshots clear', desc: 'No screenshot clutter detected' },
};

const EmptyState = ({ category = 'all', onScan }: { category?: FileCategory | 'all', onScan?: () => void }) => {
  const msg = categoryMessages[category] || categoryMessages.all;
  const isAll = category === 'all';

  return (
    <div 
      className={`flex flex-col items-center justify-center py-16 animate-fade-in ${isAll && onScan ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
      onClick={isAll && onScan ? onScan : undefined}
    >
      <div className="mb-3">{msg.icon}</div>
      <h3 className="text-sm font-semibold text-white/80 mb-1">{msg.title}</h3>
      <p className="text-[11px] text-white/40">{msg.desc}</p>
    </div>
  );
};

export default EmptyState;