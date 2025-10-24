import React, { useState, useEffect } from "react";
import Table from "../common/Table";
import * as scheduleService from '../../services/Schedule/scheduleService'; // Import the new service
import EditScheduleModal from "./editScheduleModal";
import EditButton from "../editButton"; // reusable edit button component

const ScheduleTab: React.FC = () => {
  const [schedules, setSchedules] = useState<scheduleService.Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

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

  const handleEditClick = (row: any) => {
    // normalize data shape expected by edit modal
    const initialData = {
      maintenance: row.Collector ?? row.Maintenance ?? row.maintenance ?? row.Username ?? '',
      contact: row.Contact ?? row.collector_contact ?? row.Contact_of_Maintenance ?? '',
      area: Array.isArray(row.Area) ? row.Area : (row.AreaName ? [row.AreaName] : (row.Area ? [String(row.Area)] : [])),
      date: row.Date_of_collection ? new Date(row.Date_of_collection).toISOString().split('T')[0] : '',
    };
    setSelectedRow(initialData);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (updated: { maintenance: string; contact: string; area: string[]; date: string }) => {
    // update local state for immediate UI feedback
    setSchedules(prev =>
      prev.map(s => {
        // try to match by id fields commonly present
        const idMatch = (s.Schedule_id && selectedRow && s.Schedule_id === (selectedRow.Schedule_id ?? s.Schedule_id)) || false;
        if (idMatch) {
          return {
            ...s,
            Collector: updated.maintenance,
            Contact: updated.contact,
            Area: updated.area, // backend may require IDs — this keeps UI consistent
            Date_of_collection: updated.date,
          };
        }
        return s;
      })
    );

    // send update to backend if service provides it
    (async () => {
      try {
        // best-effort: call scheduleService.updateSchedule if exists
        if (typeof (scheduleService as any).updateSchedule === 'function') {
          // try to include Schedule_id if available on selected schedule object
          const scheduleId = (selectedRow && (selectedRow.Schedule_id ?? selectedRow.schedule_id)) ?? undefined;
          await (scheduleService as any).updateSchedule(scheduleId, {
            Collector: updated.maintenance,
            Contact: updated.contact,
            Area: updated.area,
            Date_of_collection: updated.date,
          });
        }
      } catch (err) {
        console.error('Failed to persist schedule update', err);
      }
    })();

    setIsEditModalOpen(false);
    setSelectedRow(null);
  };

  const columns = [
    { key: 'Collector', label: 'Maintenance Person' },
    { key: 'Area', label: 'Area' }, // Note: Backend uses Area as ID; you may need to fetch area names separately
    { 
      key: 'sched_stat_id', 
      label: 'Status',
      render: (value: number) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${value === 3 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {getStatusLabel(value)}
        </span>
      )
    },
    { key: 'Contact', label: 'Collector Contact' },
    { key: 'Date_of_collection', label: 'Date of Collection' },
    {
      key: 'actions',
      label: '',
      // Table implementations vary; provide both value,row params to be safe
      render: (_value: any, row: any) => (
        <div className="flex items-center gap-2">
          <EditButton
            onClick={() => handleEditClick(row)}
            disabled={row.sched_stat_id === 3} // example: disable edit if already collected
            title="Edit"
          />
        </div>
      )
    }
  ];

  const data = schedules.map(schedule => ({
    ...schedule,
    Date_of_collection: schedule.Date_of_collection ? new Date(schedule.Date_of_collection).toLocaleDateString() : '',
  }));

  if (loading) return <div>Loading schedules...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="mt-4">
      <Table columns={columns} data={data} emptyMessage="No schedule data available" />
      <EditScheduleModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedRow(null); }}
        initialData={selectedRow}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default ScheduleTab;
