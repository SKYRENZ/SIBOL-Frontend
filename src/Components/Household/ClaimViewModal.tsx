import React from "react";
import FormModal from "../common/FormModal";

interface ClaimViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  row: any | null;
  onMarkClick: (row: any) => void;
  isMarking?: boolean;
}

const formatDate = (v?: string) => (v ? String(v).split("T")[0] : "-----");

const ClaimViewModal: React.FC<ClaimViewModalProps> = ({ isOpen, onClose, row, onMarkClick, isMarking = false }) => {
  if (!isOpen || !row) return null;

  const status = String(row.Status ?? "").toLowerCase();
  const isAlreadyClaimed = status === "claimed" || status === "redeemed";

  return (
    <FormModal isOpen={isOpen} onClose={onClose} title="Claim Details" width="520px">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-gray-500">Name</div>
            <div className="font-medium">{row.Fullname ?? "—"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Email</div>
            <div className="font-medium">{row.Email ?? "—"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Reward</div>
            <div className="font-medium">{row.Item ?? "—"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Points Used</div>
            <div className="font-medium">{row.Total_points ?? 0}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Code</div>
            <div className="font-medium">{row.Redemption_code ?? "—"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Status</div>
            <div className="font-medium">{row.Status ?? "—"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Date Generated</div>
            <div className="font-medium">{formatDate(row.Created_at)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Date Claimed</div>
            <div className="font-medium">{formatDate(row.Redeemed_at)}</div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>

          {!isAlreadyClaimed && (
            <button
              onClick={() => onMarkClick(row)}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              disabled={isMarking}
            >
              {isMarking ? "Processing..." : "Mark as Claimed"}
            </button>
          )}
        </div>
      </div>
    </FormModal>
  );
};

export default ClaimViewModal;