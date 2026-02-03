import React, { useMemo, useState } from "react";
import Table from "../common/Table";
import SearchBar from "../common/SearchBar";
import FilterPanel from "../common/filterPanel";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // view modal state
  const [selectedRowForView, setSelectedRowForView] = useState<any | null>(null);

  // removed confirm modal state
  const [isMarking, setIsMarking] = useState(false);

  const filteredData = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return data.filter((item) => {
      const matchesSearch = !q
        ? true
        : [
            item.Fullname,
            item.Item,
            item.Status,
            item.Redemption_code,
            String(item.Total_points ?? ""),
            String(item.Redeemed_at ?? item.Created_at ?? ""),
            item.Email,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(q);

      const matchesStatus =
        selectedFilters.length === 0
          ? true
          : selectedFilters.some((f) => item.Status === f);

      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, selectedFilters]);

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

  return (
    <div className="w-full px-6 py-4">
      <div className="flex justify-between items-center mb-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search claimed rewards..."
          className="max-w-[100vh] flex-grow"
        />
        <div className="ml-4">
          <FilterPanel
            types={["rewardStatuses"]}
            onFilterChange={setSelectedFilters}
          />
        </div>
      </div>

      <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
        <Table
          columns={columns}
          data={filteredData}
          emptyMessage={loading ? "Loading..." : "No claimed rewards found."}
          enablePagination={true}
          initialPageSize={10}
          className=""
        />
      </div>

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
