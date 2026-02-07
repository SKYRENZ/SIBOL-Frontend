import React from 'react';
import Table from '../common/Table';

import type { Machine } from '../../services/machineService';

interface MachineTabProps {
  machines: Machine[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  onEdit: (machine: Machine) => void;
  onAdd: () => void;
  filterTypes?: string[]; // ✅ Added
}

const MachineTab: React.FC<MachineTabProps> = ({ 
  machines,
  loading, 
  error, 
  pagination, 
  onEdit,
  onAdd,
  filterTypes = ['machine-status', 'area'], // ✅ Default values
}) => {
  const columns = [
    { key: 'machine_id', label: 'Machine ID', render: (value: number) => `#${value}` },
    { key: 'Name', label: 'Machine Name' },
    { key: 'Area_Name', label: 'Area', render: (value: string | undefined, row: Machine) => value || `Area ${row.Area_id}` },
    {
      key: 'status_name',
      label: 'Status',
      render: (value: string | undefined) => {
        const status = value?.toLowerCase();

        const statusClasses: Record<string, string> = {
          'active': 'bg-green-100 text-green-800',
          'inactive': 'bg-red-100 text-red-800',
          'under maintenance': 'bg-yellow-100 text-yellow-800',
          'no status': 'bg-gray-100 text-gray-800'
        };

        const badgeClass = statusClasses[status ?? 'no status'] ?? statusClasses['no status'];

        return (
          <span className={`px-2 py-1 text-xs rounded-full capitalize ${badgeClass}`}>
            {value || 'No Status'}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Machine) => (
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(row); }}
          className="bg-[#2E523A] hover:bg-[#3b6b4c] text-white px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 focus:outline-none"
        >
          Edit
        </button>
      )
    }
  ];

  // Custom Toolbar with Add Machine Button
  const customToolbar = (
    <button 
      onClick={onAdd}
      className="bg-[#2E523A] hover:bg-[#3b6b4c] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
    >
      Add Machine
    </button>
  );

  return (
    <div>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          ❌ {error}
        </div>
      )}
      {loading && (
        <div className="text-center py-8 text-gray-500">
          🔄 Loading machines...
        </div>
      )}
      <Table
        columns={columns}
        data={machines}
        emptyMessage="No machines found. Click 'Add Machine' to create one."
        rowKey="machine_id"
        pagination={pagination}
        customToolbar={customToolbar}
        filterTypes={filterTypes} // ✅ Pass filter types
      />
    </div>
  );
};

export default MachineTab;