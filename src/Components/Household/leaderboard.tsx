import React, { useEffect, useState } from "react";
import SearchBar from "../common/SearchBar";
import FilterPanel from "../common/filterPanel";
import { fetchLeaderboard } from "../../services/leaderboardService";
import { API_URL } from "../../services/apiClient";

type Row = {
  Account_id: number;
  Username: string;
  FirstName?: string;
  LastName?: string;
  Total_kg: number;
  Points?: number;
  rank?: number;
  Image_path?: string;
  image_path?: string;
  avatar?: string;
};

const MAX_VISIBLE_BARS = 10;
const fallbackAvatar = new URL("../../assets/images/lili.png", import.meta.url).href;

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeImageUrl(value: string): string {
  const v = String(value || "").trim();
  if (!v) return "";
  if (/^(https?:)?\/\//i.test(v) || v.startsWith("data:") || v.startsWith("blob:")) {
    return v;
  }

  const base = API_URL.replace(/\/+$/, "");
  const path = v.startsWith("/") ? v : `/${v}`;
  return `${base}${path}`;
}

function resolveAvatar(row: Row): string {
  return normalizeImageUrl(row.Image_path || row.image_path || row.avatar || "") || fallbackAvatar;
}

function resolveDisplayName(row: Row): string {
  const username = String(row.Username ?? "").trim();
  if (username) return username;

  const firstName = String(row.FirstName ?? "").trim();
  const lastName = String(row.LastName ?? "").trim();
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  if (fullName) return fullName;

  return `User ${row.Account_id}`;
}

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
        const sortedRows = [...rows].sort((a, b) => toNumber(b.Total_kg) - toNumber(a.Total_kg));
        const withRank = sortedRows.map((r, i) => ({ ...r, rank: i + 1 }));
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

  const filteredData = data.filter((item) =>
    [item.Username, String(item.Total_kg), String(item.Points)]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const chartData = filteredData.slice(0, MAX_VISIBLE_BARS);
  const maxKg = Math.max(...chartData.map((item) => toNumber(item.Total_kg)), 1);

  return (
    <div className="mt-4 rounded-2xl border border-gray-300 bg-white p-4 shadow-md md:p-6">
      <div className="flex justify-between items-center mb-4 gap-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search leaderboard by name, kg, or points..."
          className="max-w-[100vh] flex-grow text-[#082117]"
        />
        <FilterPanel />
      </div>

      <div className="mb-2 text-xs uppercase tracking-[0.2em] text-gray-600">
        <span>Top Contributors</span>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-gray-600">Loading leaderboard...</div>
      ) : chartData.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-600">No leaderboard data available</div>
      ) : (
        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-max items-end gap-3 px-2 pt-24 md:gap-5">
            {chartData.map((item, index) => {
              const rank = item.rank ?? index + 1;
              const totalKg = toNumber(item.Total_kg);
              const points = toNumber(item.Points);
              const barHeight = Math.max(140, Math.round((totalKg / maxKg) * 300));

              return (
                <div key={item.Account_id} className="relative flex w-[112px] flex-col items-center">
                  <div className="absolute -top-20 z-20 flex flex-col items-center">
                    <img
                      src={resolveAvatar(item)}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = fallbackAvatar;
                      }}
                      alt={`${item.Username || "User"} profile`}
                      className="h-14 w-14 rounded-full border-2 border-green-100 object-cover shadow-md"
                    />
                    <p className="mt-2 max-w-[104px] truncate text-center text-xs font-semibold text-[#14532d] drop-shadow-[0_1px_0_rgba(255,255,255,0.75)]">
                      {resolveDisplayName(item)}
                    </p>
                  </div>

                  <div
                    className={`relative flex w-full flex-col items-center justify-end rounded-t-2xl border border-green-300/20 px-2 pb-3 ${
                      rank === 1
                        ? "bg-gradient-to-b from-[#4a8d67] via-[#2f6f4f] to-[#1a4d37]"
                        : "bg-gradient-to-b from-[#2f6f4f] via-[#1f5a43] to-[#123a2a]"
                    }`}
                    style={{ height: `${barHeight}px` }}
                  >
                    <span className="absolute left-2 top-2 rounded-md bg-black/20 px-2 py-0.5 text-[10px] font-bold tracking-widest text-green-100">
                      #{rank}
                    </span>

                    <div className="text-center">
                      <p className="text-lg font-extrabold leading-tight text-white">{totalKg.toFixed(1)}</p>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-green-200">kg</p>
                      <p className="mt-1 text-[11px] text-green-100">{points} pts</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardTab;
