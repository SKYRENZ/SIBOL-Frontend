import React, { useState } from "react";
import Table from "../common/Table";
import SearchBar from "../common/SearchBar";
import FilterPanel from "../filterPanel";

const LeaderboardTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const columns = [
    { key: "rank", label: "#" },
    { key: "name", label: "Name" },
    { key: "barangay", label: "Barangay" },
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

  const leaderboardData = [
    {
      rank: 1,
      name: "Laurenz.listangco",
      barangay: "Barangay 178",
      points: "100pts",
      status: "Inactive",
    },
    {
      rank: 2,
      name: "Karl Miranda",
      barangay: "Barangay 178",
      points: "100pts",
      status: "Active",
    },
  ];

  // ✅ Filter leaderboard based on search input
  const filteredData = leaderboardData.filter((item) =>
    [item.name, item.barangay, item.status, item.points]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mt-4">
      {/* 🔍 Search + Filter Section */}
      <div className="flex justify-between items-center mb-4 gap-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search leaderboard..."
          className="max-w-[100vh] flex-grow"
        />
        <FilterPanel />
      </div>

      {/* 🧾 Table Section */}
      <Table
        columns={columns}
        data={filteredData}
        emptyMessage="No leaderboard data available"
        className="rounded-lg shadow-md"
      />
    </div>
  );
};

export default LeaderboardTab;
