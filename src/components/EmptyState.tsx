import type { FileCategory } from '@/lib/mockData';

const categoryMessages: Record<FileCategory | 'all', { emoji: string; title: string; desc: string }> = {
  all: { emoji: '📂', title: 'Ready to sweep', desc: 'Select a folder to start scanning files' },
  large: { emoji: '🪶', title: 'Nothing heavy here', desc: 'No large files detected' },
  old: { emoji: '🕐', title: 'No old files', desc: 'Everything looks recently used' },
  downloads: { emoji: '📥', title: 'Downloads clean', desc: 'No lingering downloads found' },
  duplicates: { emoji: '✦', title: 'No duplicates', desc: 'All files are unique copies' },
  screenshots: { emoji: '📸', title: 'Screenshots clear', desc: 'No screenshot clutter detected' },
};

const EmptyState = ({ category = 'all' }: { category?: FileCategory | 'all' }) => {
  const msg = categoryMessages[category] || categoryMessages.all;

  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <span className="text-4xl mb-3">{msg.emoji}</span>
      <h3 className="text-sm font-semibold text-white/80 mb-1">{msg.title}</h3>
      <p className="text-[11px] text-white/40">{msg.desc}</p>
    </div>
  );
};

export default EmptyState;
