import React from "react";
import Table from "../common/Table";

const LeaderboardTab: React.FC = () => {
  const columns = [
    { key: 'rank', label: '#' },
    { key: 'name', label: 'Name' },
    { key: 'area', label: 'Area' },
    { key: 'points', label: 'Points' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    }
  ];

  const leaderboardData = [
    { rank: 1, name: "User#3521", area: "Package 1", points: "100pts", status: "Inactive" },
    { rank: 2, name: "User#3521", area: "Petunia St", points: "100pts", status: "Active" },
  ];

  return (
    <div className="mt-4">
      <Table columns={columns} data={leaderboardData} emptyMessage="No leaderboard data available" />
    </div>
  );
};

export default LeaderboardTab;
