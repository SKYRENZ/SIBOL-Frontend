import React, { useState } from "react";
import { Filter } from "lucide-react";
import SearchBar from "../common/SearchBar";

interface SearchFilterBarProps {
  onAddSchedule: () => void;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({ onAddSchedule }) => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="flex items-center justify-between gap-6 mb-6">
      <div className="w-3/5">
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
      </div>

      <div className="flex items-center gap-3">
        <button 
          className="bg-[#2E523A] hover:bg-[#3b6b4c] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#AFC8AD]/40" 
          onClick={onAddSchedule}
        >
          Add Schedule
        </button>

        <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 focus:outline-none">
          <Filter size={16} />
          <span>Filter by</span>
        </button>
      </div>
    </div>
  );
};

export default SearchFilterBar;
