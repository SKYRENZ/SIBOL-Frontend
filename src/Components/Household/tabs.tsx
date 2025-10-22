import React from "react";
import Tabs from "../common/Tabs";

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

  return <Tabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />;
};

export default HouseholdTabs;
