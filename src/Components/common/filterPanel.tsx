import { useState } from "react";
import { Filter, X } from "lucide-react";
import { useFilterOptions } from "../../hooks/filter/userFilterOption"; // Fix: correct path with 'user' in filename

const FilterPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const { categories, loading, error } = useFilterOptions(); // ✅ use hook

  const toggleFilter = () => setIsOpen(!isOpen);

  const handleRemoveFilter = (filter: string) => {
    setSelectedFilters((prev) => prev.filter((f) => f !== filter));
  };

  const handleCheckboxChange = (option: string) => {
    setSelectedFilters((prev) =>
      prev.includes(option)
        ? prev.filter((f) => f !== option)
        : [...prev, option]
    );
  };

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={toggleFilter}
        className={`flex items-center gap-2 border border-[#7B9B7B] text-[#355842] rounded-md px-4 py-2 text-sm font-medium transition bg-transparent ${
          isOpen ? "ring-1 ring-[#7B9B7B]" : "hover:bg-transparent"
        }`}
      >
        <span>Filter by</span>
        <Filter className="w-4 h-4" />
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-[500px] bg-white border border-gray-200 rounded-xl shadow-lg p-5 z-50">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#355842]" />
              <h2 className="text-[#355842] font-semibold text-lg">Filter</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-gray-100 transition bg-transparent"
            >
              <X className="w-4 h-4 text-[#355842]" />
            </button>
          </div>

          {/* Active Filter Pills */}
          <div className="border border-gray-300 rounded-md p-2 flex flex-wrap gap-2 mb-5">
            {selectedFilters.map((filter, idx) => (
              <span
                key={idx}
                className="flex items-center gap-2 bg-[#D9EBD9] text-[#355842] text-sm font-medium rounded-full px-3 py-1"
              >
                {filter}
                <button
                  onClick={() => handleRemoveFilter(filter)}
                  className="bg-[#355842] text-white text-[11px] w-5 h-5 flex items-center justify-center rounded-full shadow-sm hover:bg-[#2e4a36] transition-all"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Filter Options */}
          {loading ? (
            <p className="text-sm text-gray-500">Loading filters...</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : (
            <div className="grid grid-cols-3 gap-4 text-[#355842]">
              {Object.entries(categories).map(([category, options]) => (
                <div key={category}>
                  <h3 className="font-semibold mb-2">{category}</h3>
                  {options.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-2 mb-1 cursor-pointer text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFilters.includes(option)}
                        onChange={() => handleCheckboxChange(option)}
                        className="accent-[#355842] w-4 h-4"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
