import React, { useMemo, useState } from "react";
import { FaTable, FaThLarge } from 'react-icons/fa';
import Table from "../common/Table";
import SearchBar from "../common/SearchBar";
import FilterPanel from "../common/filterPanel";
import EndlessScroll from "../common/EndlessScroll";
import useClaimedReward from "../../hooks/household/useClaimedReward";
import ClaimViewModal from "./claimViewModal";

const formatDate = (v?: string) => {
  if (!v) return "-----";
  // try native Date first
  const d = new Date(v);
  if (!Number.isNaN(d.getTime())) {
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`; // MM/DD/YYYY
  }
  // fallback for "YYYY-MM-DD" like strings
  const iso = String(v).split("T")[0];
  const parts = iso.split("-");
  if (parts.length === 3) {
    const [y, m, day] = parts;
    const mm = String(Number(m)).padStart(2, "0");
    const dd = String(Number(day)).padStart(2, "0");
    return `${mm}/${dd}/${y}`;
  }
  return String(v);
};

const ClaimedRewards: React.FC = () => {
  const { data, loading, error, refresh } = useClaimedReward();

  // view modal state
  const [selectedRowForView, setSelectedRowForView] = useState<any | null>(null);

  // removed confirm modal state
  const [isMarking, setIsMarking] = useState(false);

  // View mode state
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const columns = [
    { key: "Fullname", label: "Name" },
    { key: "Item", label: "Reward" },
    { key: "Total_points", label: "Points Used", render: (v: any) => v ?? 0 },
    { key: "Redemption_code", label: "Code" },
    {
      key: "Status",
      label: "Status",
      render: (v: any) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            v === "Claimed" ? "bg-[#D9EBD9] text-[#355842]" : "bg-gray-200 text-gray-600"
          }`}
        >
          {v}
        </span>
      ),
    },
    {
      key: "Created_at",
      label: "Date Generated",
      render: (v: any) => formatDate(v),
    },
    {
      key: "Redeemed_at",
      label: "Date Claimed",
      render: (v: any) => formatDate(v),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedRowForView(row);
            }}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
          >
            View
          </button>
        </div>
      ),
    },
  ];

  // Filter and search data for card view
  const filteredRewards = useMemo(() => {
    let result = data;

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((reward) =>
        reward.Fullname?.toLowerCase().includes(query) ||
        reward.Item?.toLowerCase().includes(query) ||
        reward.Redemption_code?.toLowerCase().includes(query) ||
        reward.Status?.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (activeFilters.length > 0) {
      result = result.filter((reward) =>
        activeFilters.includes(reward.Status || '')
      );
    }

    return result;
  }, [data, searchQuery, activeFilters]);

  // Card component
  const RewardCard: React.FC<{ reward: any }> = ({ reward }) => {
    const getInitials = (name: string) => {
      return name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'R';
    };

    return (
      <div className="bg-white border border-[#00001A4D] rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-sibol-green/10 text-sibol-green border border-sibol-green/30 flex items-center justify-center text-sm font-bold">
            {getInitials(reward.Fullname)}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-sibol-green">{reward.Item}</h3>
            <p className="text-sm text-gray-600">{reward.Fullname}</p>
          </div>
        </div>
        <div className="space-y-1 mb-4">
          <p className="text-sm">
            <span className="font-medium">Points Used:</span>
            <span className="ml-2 text-sibol-green">{reward.Total_points ?? 0}</span>
          </p>
          <p className="text-sm">
            <span className="font-medium">Code:</span>
            <span className="ml-2 text-sibol-green">{reward.Redemption_code || '---'}</span>
          </p>
          <p className="text-sm">
            <span className="font-medium">Date Generated:</span>
            <span className="ml-2 text-sibol-green">{formatDate(reward.Created_at)}</span>
          </p>
          {reward.Redeemed_at && (
            <p className="text-sm">
              <span className="font-medium">Date Claimed:</span>
              <span className="ml-2 text-sibol-green">{formatDate(reward.Redeemed_at)}</span>
            </p>
          )}
        </div>
        <button
          onClick={() => setSelectedRowForView(reward)}
          className="w-full px-3 py-2 bg-sibol-green text-white text-sm font-semibold rounded-lg hover:bg-sibol-green/90 transition-all duration-200"
        >
          View Details
        </button>
      </div>
    );
  };

  return (
    <div className="w-full px-6 py-4">
      {/* View Toggle and Controls */}
      <div className="flex justify-end gap-2 mb-6">
        <button
          onClick={() => setViewMode('table')}
          className={`p-2 rounded-full transition-all duration-200 border ${
            viewMode === 'table'
              ? 'bg-sibol-green text-white border-sibol-green/60 shadow-md'
              : 'bg-white text-gray-700 border-gray-300 hover:border-sibol-green hover:text-sibol-green'
          }`}
          title="Table View"
        >
          <FaTable size={18} />
        </button>
        <button
          onClick={() => setViewMode('card')}
          className={`p-2 rounded-full transition-all duration-200 border ${
            viewMode === 'card'
              ? 'bg-sibol-green text-white border-sibol-green/60 shadow-md'
              : 'bg-white text-gray-700 border-gray-300 hover:border-sibol-green hover:text-sibol-green'
          }`}
          title="Card View"
        >
          <FaThLarge size={18} />
        </button>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'table' ? (
        <Table
          columns={columns}
          data={data}
          emptyMessage={loading ? "Loading..." : "No claimed rewards found."}
          enablePagination={true}
          initialPageSize={5}
          filterTypes={["rewardStatuses"]}
          className=""
        />
      ) : (
        <div>
          {/* Search and Filter Toolbar for Card View */}
          <div className="flex gap-4 mb-6 items-center justify-between">
            {/* Left Side: Search Bar */}
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search rewards..."
              className="flex-1 max-w-2xl"
            />

            {/* Right Side: Filter */}
            <FilterPanel
              types={["rewardStatuses"]}
              onFilterChange={setActiveFilters}
            />
          </div>

          {/* Cards Grid with Endless Scroll */}
          <EndlessScroll
            hasMore={false}
            loading={loading}
            onLoadMore={() => {}}
            className="w-full"
          >
            {loading ? (
              <p className="text-center text-gray-500 py-8">Loading...</p>
            ) : filteredRewards.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {searchQuery || activeFilters.length > 0 ? "No matching rewards found." : "No claimed rewards found."}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRewards.map((reward, idx) => (
                  <RewardCard key={reward.Redemption_code || idx} reward={reward} />
                ))}
              </div>
            )}
          </EndlessScroll>
        </div>
      )}

      {error && <div className="mt-3 text-red-600">Error: {error}</div>}

      {/* View modal (new file) */}
      <ClaimViewModal
        isOpen={!!selectedRowForView}
        onClose={() => setSelectedRowForView(null)}
        row={selectedRowForView}
        onMarked={() => {
          setIsMarking(false);
          setSelectedRowForView(null);
          refresh();
        }}
      />
    </div>
  );
};

export default ClaimedRewards;