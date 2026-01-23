import React from 'react';
import RemarkItem from './RemarksItem';
import type { MaintenanceRemark } from '../../../types/maintenance';
import CustomScrollbar from '../../common/CustomScrollbar';

interface RemarksListProps {
  remarks: MaintenanceRemark[];
  loading?: boolean;
  currentUserId?: number;
}

const RemarksList: React.FC<RemarksListProps> = ({
  remarks,
  loading = false,
  currentUserId,
}) => {
  if (loading) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">Loading remarks...</p>
      </div>
    );
  }

  if (remarks.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic text-center py-8 bg-gray-50 rounded-lg">
        No remarks yet
      </p>
    );
  }

  return (
    <CustomScrollbar className="max-h-96 overflow-y-auto">
      <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
        {remarks.map((remark) => (
          <RemarkItem
            key={remark.Remark_Id}
            remark={remark}
            isCurrentUser={remark.Created_by === currentUserId}
          />
        ))}
      </div>
    </CustomScrollbar>
  );
};

export default RemarksList;