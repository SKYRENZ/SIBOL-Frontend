import React from 'react';
import Table from './common/Table';

interface MaintenanceTableProps {
  activeTab: string;
  searchTerm: string;
  onRowClick: (row: any) => void;
}

const MaintenanceTable: React.FC<MaintenanceTableProps> = ({ activeTab, onRowClick }) => {
  // Sample data for different maintenance types
  const requestData = [
    { requestNumber: '112105', details: 'New maintenance request for machine calibration', priority: 'Critical', requestDate: '08/25/25', image: 'https://via.placeholder.com/60' },
    { requestNumber: '112106', details: 'Routine maintenance check for waste processing unit', priority: 'Mild', requestDate: '08/26/25', image: 'https://via.placeholder.com/60' }
  ];

  const pendingData = [
    { requestNumber: '112103', details: 'Sensor malfunction in anaerobic chamber', priority: 'Critical', dueDate: '10/10/25', assignedTo: 'Mark', contactDetails: '+639 001 002 0044', status: 'On-Going', image: 'https://via.placeholder.com/60' },
    { requestNumber: '112104', details: 'Filter replacement needed for waste unit', priority: 'Mild', dueDate: '10/10/25', assignedTo: 'Karl', contactDetails: '+639 011 002 0044', status: 'On-Going', image: 'https://via.placeholder.com/60' }
  ];

  const completeData = [
    { requestNumber: '112101', details: 'Completed sensor repair in chamber A', priority: 'Critical', dateCompleted: '08/20/25', assignedTo: 'Mark', image: 'https://via.placeholder.com/60' },
    { requestNumber: '112102', details: 'Completed filter maintenance in unit B', priority: 'Mild', dateCompleted: '08/22/25', assignedTo: 'Karl', image: 'https://via.placeholder.com/60' }
  ];

  const priorityOptions = [
    { value: 'Urgent', color: 'bg-red-500', text: 'Urgent' },
    { value: 'Critical', color: 'bg-orange-500', text: 'Critical' },
    { value: 'Mild', color: 'bg-yellow-500', text: 'Mild' }
  ];

  const getTableData = () => {
    switch (activeTab) {
      case 'Request Maintenance': return requestData;
      case 'Pending Maintenance': return pendingData;
      case 'Complete Maintenance': return completeData;
      default: return [];
    }
  };

  const getPriorityColor = (priority: string) => {
    const option = priorityOptions.find(opt => opt.value === priority);
    return option ? option.color : 'bg-gray-500';
  };

  const data = getTableData();

  // Map columns to Table component format
  const columns = React.useMemo(() => {
    switch (activeTab) {
      case 'Request Maintenance':
        return [
          { key: 'requestNumber', label: 'Request Number' },
          { key: 'details', label: 'Details' },
          { 
            key: 'priority', 
            label: 'Priority',
            render: (value: string) => (
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${getPriorityColor(value)}`}>
                {value}
              </span>
            )
          },
          { key: 'requestDate', label: 'Request Date' },
          { 
            key: 'image', 
            label: 'Image',
            render: (value: string) => (
              <img 
                src={value} 
                alt="Maintenance" 
                className="w-12 h-12 rounded-md border border-gray-200 object-cover"
              />
            )
          }
        ];
      case 'Pending Maintenance':
        return [
          { key: 'requestNumber', label: 'Request Number' },
          { key: 'details', label: 'Details' },
          { 
            key: 'priority', 
            label: 'Priority',
            render: (value: string) => (
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${getPriorityColor(value)}`}>
                {value}
              </span>
            )
          },
          { key: 'dueDate', label: 'Due Date' },
          { key: 'assignedTo', label: 'Assigned to' },
          { key: 'contactDetails', label: 'Contact Detail' },
          { key: 'status', label: 'Status' },
          { 
            key: 'image', 
            label: 'Image',
            render: (value: string) => (
              <img 
                src={value} 
                alt="Maintenance" 
                className="w-12 h-12 rounded-md border border-gray-200 object-cover"
              />
            )
          }
        ];
      case 'Complete Maintenance':
        return [
          { key: 'requestNumber', label: 'Request Number' },
          { key: 'details', label: 'Details' },
          { 
            key: 'priority', 
            label: 'Priority',
            render: (value: string) => (
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${getPriorityColor(value)}`}>
                {value}
              </span>
            )
          },
          { key: 'dateCompleted', label: 'Date Completed' },
          { key: 'assignedTo', label: 'Assigned to' },
          { 
            key: 'image', 
            label: 'Image',
            render: (value: string) => (
              <img 
                src={value} 
                alt="Maintenance" 
                className="w-12 h-12 rounded-md border border-gray-200 object-cover"
              />
            )
          }
        ];
      default:
        return [];
    }
  }, [activeTab]);

  return (
    <Table 
      columns={columns}
      data={data}
      onRowClick={onRowClick}
      emptyMessage="No maintenance records found"
    />
  );
};

export default MaintenanceTable;
