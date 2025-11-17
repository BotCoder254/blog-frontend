import React from 'react';
import { ChevronDown, Folder } from 'lucide-react';

const CategorySelect = ({ categories = [], onChange, multiple = true }) => {
  const availableCategories = [
    'Technology', 'Business', 'Design', 'Marketing', 'Lifestyle',
    'Travel', 'Food', 'Health', 'Education', 'Entertainment'
  ];

  const handleCategoryChange = (category) => {
    if (multiple) {
      if (categories.includes(category)) {
        onChange(categories.filter(c => c !== category));
      } else {
        onChange([...categories, category]);
      }
    } else {
      onChange(categories.includes(category) ? [] : [category]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Folder className="w-4 h-4" />
        Categories {multiple && '(multiple)'}
      </label>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {availableCategories.map((category) => (
          <label
            key={category}
            className="flex items-center gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <input
              type={multiple ? 'checkbox' : 'radio'}
              name="categories"
              checked={categories.includes(category)}
              onChange={() => handleCategoryChange(category)}
              className="text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="text-sm text-gray-900 dark:text-white">{category}</span>
          </label>
        ))}
      </div>
      
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {categories.map((category) => (
            <span
              key={category}
              className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-md"
            >
              {category}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategorySelect;