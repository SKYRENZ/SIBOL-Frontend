import React from "react";

interface HouseholdTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const HouseholdTabs: React.FC<HouseholdTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "schedule", label: "Schedule" },
    { id: "leaderboard", label: "Leaderboard" },
    { id: "reward", label: "Rewards" },
    { id: "claimed", label: "Claimed Rewards" },
    { id: "points", label: "Point System" },
  ];

  return (
    <div className="household-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default HouseholdTabs;
