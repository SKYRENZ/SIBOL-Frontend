import React from "react";
import Table from "../common/Table";

const ScheduleTab: React.FC = () => {
  const columns = [
    { key: 'maintenancePerson', label: 'Maintenance Person' },
    { key: 'area', label: 'Area' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'Collected' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {value}
        </span>
      )
    },
    { key: 'collectorContact', label: 'Collector Contact' },
    { key: 'dateOfCollection', label: 'Date of Collection' },
    { key: 'totalWaste', label: 'Total Waste' }
  ];

  const data = [
    {
      maintenancePerson: 'Carlos Dela Cruz',
      area: 'Barangay 167, Caloocan City',
      status: 'Collected',
      collectorContact: '0912 345 6789',
      dateOfCollection: '2025-10-12',
      totalWaste: '8.5 kg'
    },
    {
      maintenancePerson: 'Maria Santos',
      area: 'Barangay 168, Caloocan City',
      status: 'Pending',
      collectorContact: '0919 876 5432',
      dateOfCollection: '2025-10-14',
      totalWaste: '5.2 kg'
    }
  ];

  return (
    <div className="mt-4">
      <Table columns={columns} data={data} emptyMessage="No schedule data available" />
    </div>
  );
};

export default ScheduleTab;
