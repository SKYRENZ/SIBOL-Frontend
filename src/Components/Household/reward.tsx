import React, { useState, useEffect } from "react";
import { useRewards, useArchiveReward } from "../../hooks/household/useRewardHooks";
import type { Reward } from "../../services/rewardService";
import { Gift, Archive, RotateCcw, Sparkles, Edit2, ImageIcon } from "lucide-react";

interface RewardTabProps {
  filters: string[];
  onEditReward: (reward: Reward) => void;
}

const RewardTab: React.FC<RewardTabProps> = ({ filters, onEditReward }) => {
  const [showArchived, setShowArchived] = useState(false);
  const { rewards, loading, error, refetch } = useRewards(showArchived);
  const { archiveReward, restoreReward, loading: archiveLoading } = useArchiveReward();
  const [rewardImages, setRewardImages] = useState<Record<number, string>>({});

  // Load images from localStorage
  useEffect(() => {
    const storedImages = JSON.parse(localStorage.getItem('rewardImages') || '{}');
    setRewardImages(storedImages);
  }, [rewards]);

  const handleArchive = async (id: number) => {
    if (!confirm("Are you sure you want to archive this reward?")) return;
    
    try {
      await archiveReward(id);
      refetch();
    } catch (err: any) {
      console.error("Failed to archive reward:", err);
      alert(err?.message || 'Failed to archive reward');
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await restoreReward(id);
      refetch();
    } catch (err: any) {
      console.error("Failed to restore reward:", err);
      alert(err?.message || 'Failed to restore reward');
    }
  };

  // Get image URL - prioritize localStorage, fallback to Image_url from backend
  const getImageUrl = (reward: Reward): string | null => {
    if (reward.Reward_id && rewardImages[reward.Reward_id]) {
      return rewardImages[reward.Reward_id];
    }
    return reward.Image_url || null;
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
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Toggle Archived */}
      <div className="flex justify-end mb-6">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-0 transition"
          />
          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
            Show Archived Rewards
          </span>
        </label>
      </div>

      {/* Rewards Grid */}
      {filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <Gift className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg font-medium">No rewards found</p>
          <p className="text-gray-400 text-sm mt-1">
            {showArchived ? "No archived rewards yet" : "Click 'Add Reward' to create one"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredData.map((reward) => {
            const imageUrl = getImageUrl(reward);
            
            return (
              <div
                key={reward.Reward_id}
                className={`group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 ${
                  reward.IsArchived 
                    ? 'border-gray-200 opacity-75' 
                    : 'border-transparent hover:border-green-100'
                }`}
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4 z-10">
                  {reward.IsArchived ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
                      <Archive className="w-3 h-3" />
                      Archived
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
                      <Sparkles className="w-3 h-3" />
                      Active
                    </span>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {/* Image Placeholder */}
                  <div className="w-full h-40 mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center overflow-hidden">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={reward.Item}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <ImageIcon className="w-12 h-12 mb-2" />
                        <span className="text-xs font-medium">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Reward Name */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                    {reward.Item}
                  </h3>

                  {/* Description */}
                  {reward.Description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                      {reward.Description}
                    </p>
                  )}

                  {/* Points & Quantity */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                        Points Cost
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {reward.Points_cost}
                        <span className="text-sm text-gray-500 font-normal ml-1">pts</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                        Available
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {reward.Quantity}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {!reward.IsArchived && (
                      <button
                        onClick={() => onEditReward(reward)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-medium text-sm hover:bg-blue-100 transition-all border border-blue-200"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                    )}
                    
                    {reward.IsArchived ? (
                      <button
                        onClick={() => handleRestore(reward.Reward_id!)}
                        disabled={archiveLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 rounded-xl font-medium text-sm hover:bg-green-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-green-200"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Restore
                      </button>
                    ) : (
                      <button
                        onClick={() => handleArchive(reward.Reward_id!)}
                        disabled={archiveLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 rounded-xl font-medium text-sm hover:bg-red-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-red-200"
                      >
                        <Archive className="w-4 h-4" />
                        Archive
                      </button>
                    )}
                  </div>
                </div>

                {/* Hover Effect Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/0 via-green-50/0 to-green-100/0 group-hover:from-green-50/20 group-hover:via-green-50/10 group-hover:to-green-100/20 transition-all duration-300 pointer-events-none rounded-2xl" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RewardTab;
