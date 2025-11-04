import React from 'react';
import Table from '../common/Table';
import type { Machine } from '../../services/machineService';

interface MachineTabProps {
  machines: Machine[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  onEdit: (machine: Machine) => void;
}

const MachineTab: React.FC<MachineTabProps> = ({ machines, loading, error, searchTerm, pagination, onEdit }) => {
  const filteredMachines = machines.filter(machine =>
    searchTerm === '' ||
    machine.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.Area_Name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'machine_id', label: 'Machine ID', render: (value: number) => `#${value}` },
    { key: 'Name', label: 'Machine Name' },
    { key: 'Area_Name', label: 'Area', render: (value: string | undefined, row: Machine) => value || `Area ${row.Area_id}` },
    {
      key: 'status_name',
      label: 'Status',
      render: (value: string | undefined) => (
        <span className={`px-2 py-1 text-xs rounded-full ${value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {value || 'No Status'}
        </span>
      )
    },
    {
      key: 'machine_id',
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

  const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  const paginatedMachines = filteredMachines.slice(startIndex, endIndex);

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
        data={paginatedMachines}
        emptyMessage="No machines found. Click 'Add Machine' to create one."
        pagination={{
          ...pagination,
          totalItems: filteredMachines.length,
        }}
      />
    </div>
  );
};

export default MachineTab;