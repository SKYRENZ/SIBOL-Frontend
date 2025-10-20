import React from "react";
import { Search, Filter, Clock } from "lucide-react";

interface SearchFilterBarProps {
  onAddSchedule: () => void;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({ onAddSchedule }) => {
  return (
    <div className="search-filter-bar">
      <div className="search-section">
        <div className="search-input">
          <input type="text" placeholder="Search" />
          <Search className="search-icon" size={18} />
        </div>
      </div>

      <div className="filter-section">
        <button className="add-btn" onClick={onAddSchedule}>
          Add Schedule
        </button>

        <div className="filter-group">
          <div className="filter-dropdown">
            <Clock size={16} />
            <span>All</span>
          </div>
          <div className="filter-dropdown">
            <Filter size={16} />
            <span>Filter by</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilterBar;
