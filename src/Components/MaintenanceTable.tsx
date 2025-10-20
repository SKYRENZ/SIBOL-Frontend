import React from 'react';

interface MaintenanceTableProps {
  activeTab: string;
  searchTerm: string;
  onRowClick: (row: any) => void;
}

const MaintenanceTable: React.FC<MaintenanceTableProps> = ({ activeTab, searchTerm, onRowClick }) => {
  // Sample data for different maintenance types
  const requestData = [
    { requestNumber: '112105', details: 'New maintenance request for machine calibration', priority: 'Critical', requestDate: '08/25/25' },
    { requestNumber: '112106', details: 'Routine maintenance check for waste processing unit', priority: 'Mild', requestDate: '08/26/25' }
  ];

  const pendingData = [
    { requestNumber: '112103', details: 'Sensor malfunction in anaerobic chamber', priority: 'Critical', dueDate: '10/10/25', assignedTo: 'Mark', contactDetails: '+639 001 002 0044', status: 'On-Going' },
    { requestNumber: '112104', details: 'Filter replacement needed for waste unit', priority: 'Mild', dueDate: '10/10/25', assignedTo: 'Karl', contactDetails: '+639 011 002 0044', status: 'On-Going' }
  ];

  const completeData = [
    { requestNumber: '112101', details: 'Completed sensor repair in chamber A', priority: 'Critical', dateCompleted: '08/20/25', assignedTo: 'Mark' },
    { requestNumber: '112102', details: 'Completed filter maintenance in unit B', priority: 'Mild', dateCompleted: '08/22/25', assignedTo: 'Karl' }
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

  const getTableColumns = () => {
    switch (activeTab) {
      case 'Request Maintenance':
        return ['Request Number', 'Details', 'Priority', 'Request Date'];
      case 'Pending Maintenance':
        return ['Request Number', 'Details', 'Priority', 'Due Date', 'Assigned to', 'Contact Detail', 'Status'];
      case 'Complete Maintenance':
        return ['Request Number', 'Details', 'Priority', 'Date Completed', 'Assigned to'];
      default:
        return [];
    }
  };

  const getPriorityColor = (priority: string) => {
    const option = priorityOptions.find(opt => opt.value === priority);
    return option ? option.color : 'bg-gray-500';
  };

  const data = getTableData();
  const columns = getTableColumns();

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <thead style={{ backgroundColor: 'rgba(175, 200, 173, 0.55)' }}>
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr 
              key={index} 
              className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} cursor-pointer hover:bg-gray-100`}
              onClick={() => onRowClick(row)}
            >
              {Object.values(row).map((value, cellIndex) => (
                <td key={cellIndex} className="px-6 py-4 text-sm text-gray-900 border-b border-gray-100">
                  {cellIndex === 2 ? (
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${getPriorityColor(value as string)}`}>
                      {value}
                    </span>
                  ) : (
                    value
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MaintenanceTable;
