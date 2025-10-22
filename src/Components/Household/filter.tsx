import React from "react";
import { Search, Filter, Gift } from "lucide-react";

interface AddRewardsBarProps {
  onAddReward: () => void;
}

const AddRewardsBar: React.FC<AddRewardsBarProps> = ({ onAddReward }) => {
  return (
    <div className="search-filter-bar">
      <div className="search-section">
        <div className="search-input">
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent border border-[#7B9B7B] rounded-md px-3 py-2 text-sm text-[#355842] placeholder-gray-400 focus:outline-none"
          />
          <Search className="search-icon" size={18} />
        </div>
      </div>

      <div className="filter-section">
        <button className="add-btn" onClick={onAddReward}>
          Add Reward
        </button>

        <div className="filter-group">
          <div className="filter-dropdown">
            <Gift size={16} />
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

export default AddRewardsBar;
