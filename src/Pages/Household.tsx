import React, { useState, useEffect } from "react";
import Header from "../Components/Header";
import HouseholdTabs from "../Components/Household/tabs";
import SearchBar from "../Components/common/SearchBar";
import FilterPanel from "../Components/common/filterPanel";
import ScheduleTab from "../Components/Household/schedule";
import ClaimedRewards from "../Components/Household/claimedReward";
import RewardTab from "../Components/Household/reward";
import AddScheduleModal from "../Components/Household/addSchedule";
import EditScheduleModal from "../Components/Household/editScheduleModal";
import AddRewardModal from "../Components/Household/addReward";
import LeaderboardTab from "../Components/Household/leaderboard";
import PointSystem from "../Components/Household/pointSystem";
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
  
  useEffect(() => {
    console.log("Household mounted");
  }, []);

  useEffect(() => {
    console.log("activeTab ->", activeTab);
  }, [activeTab]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [rowToEdit, setRowToEdit] = useState<RowData | null>(null);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

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
            <div className="flex items-center gap-4">
              <SearchBar
                value={searchValue}
                onChange={setSearchValue}
                placeholder="Search schedules..."
                className="max-w-[100vh] flex-grow"
                
              />
              <button
                type="button"
                onClick={handleAddSchedule}
                className="px-4 py-2 bg-[#AFC8AD] text-white rounded-md shadow-sm text-sm"
              >
                Create
              </button>
              <FilterPanel />
            </div>
          )}
  
          {/* show the AddRewardsBar only on the Rewards tab so the Create button is hidden on Leaderboard */}  
          {activeTab === "schedule" && <ScheduleTab />}
          {activeTab === "reward" && <RewardTab />}
          {activeTab === "leaderboard" && <LeaderboardTab />}
          {activeTab === "claimed" && <ClaimedRewards />}
  
          {/* render Point System tab */}
          {activeTab === "points" && <PointSystem />}
        </div>
      </div>

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
