import React, { useState } from "react";
import Header from "../Components/Header";
import HouseholdTabs from "../Components/Household/tabs";
import SearchFilterBar from "../Components/Household/searchFilter";
import AddRewardsBar from "../Components/Household/filter";
import ScheduleTab from "../Components/Household/schedule";
import ClaimedRewards from "../Components/Household/claimedReward";
import RewardTab from "../Components/Household/reward";
import AddScheduleModal from "../Components/Household/addSchedule";
import EditScheduleModal from "../Components/Household/editScheduleModal";
import AddRewardModal from "../Components/Household/addReward";
import LeaderboardTab from "../Components/Household/leaderboard";
import "../types/Household.css";

interface RowData {
  maintenance: string;
  contact: string;
  area: string[];
  date: string;
  totalWaste?: string;
  status: string;
}

const Household: React.FC = () => {
  const [activeTab, setActiveTab] = useState("schedule");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [rowToEdit, setRowToEdit] = useState<RowData | null>(null);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);

  const handleAddSchedule = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);

  const handleEditSchedule = (row: RowData) => {
    setRowToEdit(row);
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setRowToEdit(null);
  };

  const handleAddReward = () => setIsRewardModalOpen(true);
  const handleCloseRewardModal = () => setIsRewardModalOpen(false);

  const handleSaveReward = (data: any) => {
    console.log("Reward Saved:", data);
    setIsRewardModalOpen(false);
  };

  return (
    <div className="household-container">
      <Header />
      <HouseholdTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ✅ Top Bars */}
      {activeTab === "schedule" && (
        <SearchFilterBar onAddSchedule={handleAddSchedule} />
      )}
      {(activeTab === "reward" || activeTab === "leaderboard") && (
        <AddRewardsBar onAddReward={handleAddReward} />
      )}

      {/* ✅ Tabs Content */}
      {activeTab === "schedule" && (
        <ScheduleTab onEdit={handleEditSchedule} />
      )}
      {activeTab === "reward" && <RewardTab />}
      {activeTab === "leaderboard" && <LeaderboardTab />}
      {activeTab === "claimed" && <ClaimedRewards />}

      {/* ✅ Modals */}
      <AddScheduleModal isOpen={isAddModalOpen} onClose={handleCloseAddModal} />

      <EditScheduleModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        initialData={rowToEdit}
        onSave={(data) => {
          console.log("Edited Schedule:", data);
          handleCloseEditModal();
        }}
      />

      <AddRewardModal
        isOpen={isRewardModalOpen}
        onClose={handleCloseRewardModal}
        onSave={handleSaveReward}
      />
    </div>
  );
};

export default Household;
