import React, { useState, useEffect } from "react";
import Table from "../common/Table";
import * as scheduleService from '../../services/Schedule/scheduleService'; // Import the new service

const ScheduleTab: React.FC = () => {
  const [schedules, setSchedules] = useState<scheduleService.Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const data = await scheduleService.getAllSchedules();
        setSchedules(data);
      } catch (err: any) {
        setError(err?.message ?? 'Failed to load schedules');
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  // Map status ID to string (fetch from backend or hardcode for now)
  const getStatusLabel = (statusId: number) => {
    const statusMap: Record<number, string> = { 1: 'Collecting', 2: 'Pending', 3: 'Collected', 4: 'Cancelled' };
    return statusMap[statusId] ?? 'Unknown';
  };

  const columns = [
    { key: 'Collector', label: 'Maintenance Person' },
    { key: 'Area', label: 'Area' }, // Note: Backend uses Area as ID; you may need to fetch area names separately
    { 
      key: 'sched_stat_id', 
      label: 'Status',
      render: (value: number) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          value === 3 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {getStatusLabel(value)}
        </span>
      )
    },
    { key: 'Contact', label: 'Collector Contact' },
    { key: 'Date_of_collection', label: 'Date of Collection' },
    // Add totalWaste if available in backend (not in current schema)
  ];

  const data = schedules.map(schedule => ({
    ...schedule,
    Date_of_collection: new Date(schedule.Date_of_collection).toLocaleDateString(), // Format date
  }));

  if (loading) return <div>Loading schedules...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="mt-4">
      <Table columns={columns} data={data} emptyMessage="No schedule data available" />
    </div>
  );
};

export default ScheduleTab;
