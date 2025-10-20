import React from "react";

const LeaderboardTab: React.FC = () => {
  const leaderboardData = [
    { rank: 1, name: "User#3521", area: "Package 1", points: "100pts", status: "Inactive" },
    { rank: 2, name: "User#3521", area: "Petunia St", points: "100pts", status: "Active" },
  ];

  return (
    <div className="table-section">
      <table className="household-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Area</th>
            <th>Points</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {leaderboardData.map((row, index) => (
            <tr key={index}>
              <td>{row.rank}</td>
              <td>{row.name}</td>
              <td>{row.area}</td>
              <td>{row.points}</td>
              <td>
                <span className={`status-badge ${row.status.toLowerCase()}`}>
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTab;
