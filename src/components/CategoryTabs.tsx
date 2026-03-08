import type { FileCategory } from '@/lib/mockData';

interface CategoryTabsProps {
  active: FileCategory | 'all';
  onSelect: (cat: FileCategory | 'all') => void;
  duplicateCount?: number;
}

const categories: { key: FileCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'Big Offenders' },
  { key: 'large', label: 'Large Files' },
  { key: 'old', label: 'Old Files' },
  { key: 'downloads', label: 'Downloads' },
  { key: 'duplicates', label: 'Duplicates' },
  { key: 'screenshots', label: 'Screenshots' },
];

const CategoryTabs = ({ active, onSelect, duplicateCount }: CategoryTabsProps) => {
  return (
    <div className="flex gap-2 flex-wrap">
      {categories.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onSelect(cat.key)}
          className={`category-pill ${active === cat.key ? 'category-pill-active' : ''}`}
        >
          {cat.label}
          {cat.key === 'duplicates' && duplicateCount && duplicateCount > 0 && (
            <span className="ml-1 text-[9px] bg-destructive/20 text-destructive px-1.5 py-0.5 rounded-full font-semibold">
              {duplicateCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;
