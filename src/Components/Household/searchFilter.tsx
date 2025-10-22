import { Search } from "lucide-react";
import FilterDropdown from "../filterDropdown";

interface SearchFilterBarProps {
  onAddSchedule: () => void;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({ onAddSchedule }) => {
  const handleFilterSelect = (value: string): void => {
    console.log("Selected Filter:", value);
  };

  return (
    <div className="w-full px-6 mb-4">
      <div className="flex justify-between items-center">
        {/* 🔍 Search Box */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="w-[250px] border border-[#7B9B7B] rounded-md pl-10 pr-4 py-2 text-sm text-[#355842] placeholder-gray-400 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#7B9B7B]"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#355842]" />
        </div>

        <div className="flex items-center gap-3">
          {/* Add Schedule */}
          <button
            onClick={onAddSchedule}
            className="bg-[#355842] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#2e4a36] transition"
          >
            Add Schedule
          </button>

          {/* Filter Dropdown */}
          <FilterDropdown onSelect={handleFilterSelect} />
        </div>
      </div>
    </div>
  );
};

export default SearchFilterBar;
