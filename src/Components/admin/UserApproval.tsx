import React, { useState } from "react";
import Table from "../common/Table";
import PendingAccountModal from "./UserApprovalModal";
import type { Account } from "../../types/adminTypes";

type Props = {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  onAccept: (a: Account) => void;
  onReject: (a: Account, reason?: string) => void;
};

export default function UserApproval({ accounts, loading, error, onAccept, onReject }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (pendingId?: number | null) => {
    if (!pendingId) return;
    setSelectedId(pendingId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedId(null);
    setModalOpen(false);
  };

  const columns = [
    { key: "Username", label: "Username" },
    { key: "Email", label: "Email" },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: Account) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => openModal((row as any).Pending_id)}
            className="px-3 py-1 text-xs font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition"
          >
            View
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <div className="p-4 text-center">Loading pending accounts...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <Table
        columns={columns}
        data={accounts}
        emptyMessage="No pending accounts to approve."
        enablePagination={true}
        initialPageSize={5}
        fixedPagination={false}
      />

      <PendingAccountModal
        pendingId={selectedId}
        isOpen={modalOpen}
        onClose={closeModal}
        onApprove={async (a) => {
          await onAccept(a);
        }}
        onReject={async (a, reason) => {
          await onReject(a);
        }}
      />
    </div>
  );
}