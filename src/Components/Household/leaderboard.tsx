import React, { useEffect, useState } from "react";
import Table from "../common/Table";
import SearchBar from "../common/SearchBar";
import FilterPanel from "../common/filterPanel";
import { fetchLeaderboard } from "../../services/leaderboardService";

type Row = {
  Account_id: number;
  Username: string;
  Total_kg: number;
  Points?: number;
  rank?: number;
};

const LeaderboardTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchLeaderboard(100)
      .then((rows: any[]) => {
        if (!mounted) return;
        const withRank = rows.map((r, i) => ({ ...r, rank: i + 1 }));
        setData(withRank);
      })
      .catch(() => {
        if (mounted) setData([]);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const columns = [
    { key: "rank", label: "Rank" },
    { key: "Username", label: "Name" },
    { key: "Total_kg", label: "Total Contribution" },
    { key: "Points", label: "Points" },
  ];

  const filteredData = data.filter((item) =>
    [item.Username, String(item.Total_kg), String(item.Points)]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4 gap-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search leaderboard..."
          className="max-w-[100vh] flex-grow"
        />
        <FilterPanel />
      </div>

      <Table
        columns={columns}
        data={filteredData}
        emptyMessage={loading ? "Loading..." : "No leaderboard data available"}
        className="rounded-lg shadow-md"
      />
    </div>
  );
};

export default LeaderboardTab;
