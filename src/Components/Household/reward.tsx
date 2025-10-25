import React, { useState } from "react";
import Table from "../common/Table";
import SearchBar from "../common/SearchBar";
import FilterPanel from "../filterPanel";
import AddRewardModal from "./addReward";

const RewardTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    { key: "rank", label: "#" },
    { key: "name", label: "Name" },
    { key: "area", label: "Area" },
    { key: "points", label: "Points" },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            value === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {value}
        </span>
      ),
    },
  ];

  const rewardData = [
    { rank: 1, name: "User#3521", area: "Package 1", points: "100pts", status: "Inactive" },
    { rank: 2, name: "User#3521", area: "Petunia St", points: "100pts", status: "Active" },
  ];

  const filteredData = rewardData.filter((item) =>
    [item.name, item.area, item.status, item.points]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleSaveReward = (data: any) => {
    console.log("New reward added:", data);
    setIsModalOpen(false);
  };

  return (
    <div className="mt-4">
      {/* 🔍 Search + Button + Filter Section */}
      <div className="flex justify-between items-center mb-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search rewards..."
          className="max-w-[100vh] flex-grow"
        />

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenModal}
            className="bg-[#355842] hover:bg-[#2E523A] text-white text-sm font-medium px-5 py-2 rounded-md transition-all duration-200"
          >
            Add Reward
          </button>
          <FilterPanel />
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredData}
        emptyMessage="No reward data available"
        className="rounded-lg shadow-md"
      />

      <AddRewardModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveReward}
      />
    </div>
  );
};

export default RewardTab;
