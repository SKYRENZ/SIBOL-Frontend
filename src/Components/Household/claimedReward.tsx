import React, { useMemo, useState } from "react";
import Table from "../common/Table";
import SearchBar from "../common/SearchBar";
import FilterPanel from "../common/filterPanel";
import useClaimedReward from "../../hooks/household/useClaimedReward";
import MarkConfirmModal from "./claimConfirmModal";
import ClaimViewModal from "./ClaimViewModal";

const formatDate = (v?: string) => (v ? String(v).split("T")[0] : "-----");

const ClaimedRewards: React.FC = () => {
  const { data, loading, error, refresh } = useClaimedReward();
  const [searchTerm, setSearchTerm] = useState("");

  // view modal state
  const [selectedRowForView, setSelectedRowForView] = useState<any | null>(null);

  // confirm modal state (opened from inside the view modal)
  const [selectedRowForMark, setSelectedRowForMark] = useState<any | null>(null);
  const [isMarking, setIsMarking] = useState(false);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const q = searchTerm.toLowerCase();
    return data.filter((item) =>
      [
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
        .includes(q)
    );
  }, [data, searchTerm]);

  const handleMarkConfirm = async () => {
    if (!selectedRowForMark) return;
    const id = Number(selectedRowForMark.Reward_transaction_id ?? selectedRowForMark.Transaction_id);
    if (!id) return;
    try {
      setIsMarking(true);
      const res = await fetch(`/api/rewards/transaction/${id}/redeemed`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.message || "Failed to mark redeemed");
      }
      await refresh();
      setSelectedRowForMark(null);
      setSelectedRowForView(null);
    } catch (err: any) {
      console.error("markRedeemed error", err);
      setSelectedRowForMark(null);
      await refresh();
    } finally {
      setIsMarking(false);
    }
  };

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
            v === "Redeemed" ? "bg-[#D9EBD9] text-[#355842]" : "bg-gray-200 text-gray-600"
          }`}
        >
          {v}
        </span>
      ),
    },
    {
      key: "Created_at",
      label: "Date Generated",
      render: (v: any) => (v ? String(v).split("T")[0] : ""),
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
          <FilterPanel />
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
        onMarkClick={(r) => setSelectedRowForMark(r)}
        isMarking={isMarking}
      />

      {/* Confirmation modal */}
      <MarkConfirmModal
        isOpen={!!selectedRowForMark}
        onClose={() => setSelectedRowForMark(null)}
        onConfirm={handleMarkConfirm}
        isLoading={isMarking}
      />
    </div>
  );
};

export default ClaimedRewards;
