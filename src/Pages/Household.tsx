import React, { useState } from "react";
import Header from "../Components/Header";
import HouseholdTabs from "../Components/Household/tabs";
import SearchFilterBar from "../Components/Household/searchFilter";
import AddRewardsBar from "../Components/Household/filter";
import ScheduleTab from "../Components/Household/schedule";
import RewardTab from "../Components/Household/reward";
import AddScheduleModal from "../Components/Household/addSchedule";
import AddRewardModal from "../Components/Household/addReward";
import LeaderboardTab from "../Components/Household/leaderboard";
import "../types/Household.css";

const Household: React.FC = () => {
  const [activeTab, setActiveTab] = useState("schedule");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);

  const handleAddSchedule = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleAddReward = () => setIsRewardModalOpen(true);
  const handleCloseRewardModal = () => setIsRewardModalOpen(false);

  const handleSaveReward = (data: any) => {
    console.log("Reward Saved:", data);
    setIsRewardModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Sub Navigation Bar */}
      <div className="w-full bg-white shadow-sm">
        <div style={{ height: '60px' }} aria-hidden />
        <div className="subheader sticky top-[60px] z-30 w-full bg-white px-6 py-4 shadow-sm">
          <div className="max-w-screen-2xl mx-auto">
            <HouseholdTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-6 py-8">
        <div className="max-w-screen-2xl mx-auto">
          {activeTab === "schedule" && (
            <SearchFilterBar onAddSchedule={handleAddSchedule} />
          )}

          {(activeTab === "reward" || activeTab === "leaderboard") && (
            <AddRewardsBar onAddReward={handleAddReward} />
          )}

          {activeTab === "schedule" && <ScheduleTab />}
          {activeTab === "reward" && <RewardTab />}
          {activeTab === "leaderboard" && <LeaderboardTab />}
        </div>
      </div>

      <AddScheduleModal isOpen={isModalOpen} onClose={handleCloseModal} />

      <AddRewardModal
        isOpen={isRewardModalOpen}
        onClose={handleCloseRewardModal}
        onSave={handleSaveReward}
      />
    </div>
  );
};

export default Household;
