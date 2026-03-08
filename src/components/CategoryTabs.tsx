import type { FileCategory } from '@/lib/mockData';

interface CategoryTabsProps {
  active: FileCategory | 'all';
  onSelect: (cat: FileCategory | 'all') => void;
}

const categories: { key: FileCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'Big Offenders' },
  { key: 'large', label: 'Large Files' },
  { key: 'old', label: 'Old Files' },
  { key: 'downloads', label: 'Downloads' },
  { key: 'duplicates', label: 'Duplicates' },
  { key: 'screenshots', label: 'Screenshots' },
];

const CategoryTabs = ({ active, onSelect }: CategoryTabsProps) => {
  return (
    <div className="flex gap-2 flex-wrap">
      {categories.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onSelect(cat.key)}
          className={`category-pill ${active === cat.key ? 'category-pill-active' : ''}`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;
