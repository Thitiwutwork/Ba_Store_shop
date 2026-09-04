import React from 'react';
import { Search } from 'lucide-react';

export default function CategoryFilter({
  categories = [],
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange
}) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Category Pills Scrollable */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                  : 'bg-white text-gray-600 border border-pink-100 hover:border-pink-300 hover:bg-pink-50/50'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative shrink-0">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ค้นหาชื่อแอพ, บริการ, OTP..."
          className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-2xl text-xs bg-white border border-pink-100 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 shadow-2xs"
        />
      </div>
    </div>
  );
}
