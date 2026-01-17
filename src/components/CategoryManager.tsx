import { useState } from 'react';
import { Category } from '@/types';

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
}

const PRESET_COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
  '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'
];

export default function CategoryManager({ categories, onAddCategory, onDeleteCategory }: CategoryManagerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const getAvailableColors = () => {
    const usedColors = categories.map(cat => cat.color);
    return PRESET_COLORS.filter(color => !usedColors.includes(color));
  };

  const getRandomAvailableColor = () => {
    const availableColors = getAvailableColors();
    if (availableColors.length === 0) {
      // If all colors are used, pick a random one anyway
      return PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
    }
    return availableColors[Math.floor(Math.random() * availableColors.length)];
  };

  const [selectedColor, setSelectedColor] = useState(getRandomAvailableColor());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      onAddCategory({
        id: crypto.randomUUID(),
        name: newCategoryName.trim(),
        color: selectedColor,
      });
      setNewCategoryName('');
      setSelectedColor(getRandomAvailableColor());
      setIsExpanded(false);
    }
  };

  return (
    <div className="mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Manage Categories</h2>
        <span className="text-gray-500 dark:text-gray-400 text-sm">{isExpanded ? '▼' : '▶'}</span>
      </button>
      {isExpanded && (
        <div className="px-3 pb-3">
          <form onSubmit={handleSubmit} className="mb-3">
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name"
                className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-400">Color:</span>
                <div
                  className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: selectedColor }}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">(randomly assigned)</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="px-3 py-1.5 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-100 rounded hover:bg-gray-400 dark:hover:bg-gray-500 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>

          {categories.length > 0 && (
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Existing categories:</div>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="px-2 py-1 rounded-full text-white text-xs font-medium flex items-center gap-1.5"
                    style={{ backgroundColor: category.color }}
                  >
                    <span>{category.name}</span>
                    <button
                      onClick={() => onDeleteCategory(category.id)}
                      className="hover:bg-black/20 rounded-full w-3.5 h-3.5 flex items-center justify-center text-xs leading-none"
                      title="Delete category"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
