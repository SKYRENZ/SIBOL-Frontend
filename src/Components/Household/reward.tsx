import React, { useState } from "react";
import { useRewards, useArchiveReward } from "../../hooks/household/useRewardHooks";
import type { Reward } from "../../services/rewardService";

interface RewardTabProps {
  filters: string[];
}

const RewardTab: React.FC<RewardTabProps> = ({ filters }) => {
  const [showArchived, setShowArchived] = useState(false);
  const { rewards, loading, error, refetch } = useRewards(showArchived);
  const { archiveReward, restoreReward, loading: archiveLoading } = useArchiveReward();

  const handleArchive = async (id: number) => {
    if (!confirm("Are you sure you want to archive this reward?")) return;
    
    try {
      await archiveReward(id);
      refetch();
    } catch (err) {
      console.error("Failed to archive reward:", err);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await restoreReward(id);
      refetch();
    } catch (err) {
      console.error("Failed to restore reward:", err);
    }
  };

  // Apply filters based on status (Active/Archived)
  const filteredData = filters.length === 0 
    ? rewards 
    : rewards.filter(reward => {
        const status = reward.IsArchived ? "Archived" : "Active";
        return filters.includes(status);
      });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Toggle Archived */}
      <div className="flex justify-end mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Show Archived</span>
        </label>
      </div>

      {/* Rewards Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reward
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Points Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No rewards found
                </td>
              </tr>
            ) : (
              filteredData.map((reward) => (
                <tr key={reward.Reward_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {reward.Item}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {reward.Description || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reward.Points_cost} pts
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reward.Quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {reward.IsArchived ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Archived
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {reward.IsArchived ? (
                      <button
                        onClick={() => handleRestore(reward.Reward_id!)}
                        disabled={archiveLoading}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      >
                        Restore
                      </button>
                    ) : (
                      <button
                        onClick={() => handleArchive(reward.Reward_id!)}
                        disabled={archiveLoading}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        Archive
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RewardTab;
