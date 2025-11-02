import React from "react";
import Table from "../common/Table";
import * as scheduleService from '../../services/Schedule/scheduleService';
import * as profileService from '../../services/profile/profileService';
import EditScheduleModal from "./editScheduleModal";
import EditButton from "../editButton";
import { useAreas, useSchedules } from "../../hooks/household/useScheduleHooks";

const ScheduleTab: React.FC = () => {
  // replace local hooks with centralized hooks
  const { schedules, setSchedules, loading: loadingSchedules, error: schedulesError } = useSchedules();
  const { areaMap, loading: loadingAreas, error: areasError } = useAreas();
  const loading = loadingSchedules || loadingAreas;
  const error = schedulesError ?? areasError;

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<any | null>(null);

  // Map status ID to string (fetch from backend or hardcode for now)
  const getStatusLabel = (statusId: number) => {
    const statusMap: Record<number, string> = { 1: 'Collecting', 2: 'Pending', 3: 'Collected', 4: 'Cancelled' };
    return statusMap[statusId] ?? 'Unknown';
  };

  const handleEditClick = (row: any) => {
    const initialData = {
      Schedule_id: row.Schedule_id ?? row.schedule_id ?? undefined,
      maintenance: row.Collector ?? row.Maintenance ?? row.maintenance ?? row.Username ?? '',
      // ensure modal receives a string for editing
      contact: String(row.Contact ?? row.collector_contact ?? row.Contact_of_Maintenance ?? ''),
      area: Array.isArray(row.Area)
        ? row.Area.map((a: any) => areaMap[a] ?? String(a))
        : (row.AreaName ? [row.AreaName] : (row.Area ? [ (areaMap[row.Area] ?? String(row.Area)) ] : [])),
      date: row.Date_of_collection ? new Date(row.Date_of_collection).toISOString().split('T')[0] : '',
    };
    setSelectedRow(initialData);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (updated: { maintenance: string; Account_id?: number; area: string[]; date: string }) => {
    const scheduleId = selectedRow?.Schedule_id ?? selectedRow?.schedule_id;

    // build name->id map from areaMap
    const nameToId: Record<string, number> = {};
    for (const [key, val] of Object.entries(areaMap)) {
      const numKey = Number(key);
      if (!Number.isNaN(numKey)) nameToId[val] = numKey;
    }

    // map area names -> ids when possible
    const mappedIds = updated.area.map(name => nameToId[name]).filter((v): v is number => typeof v === 'number');

    // decide areaPayload for UI: keep names for display, but prepare numeric IDs (if any) for backend
    let areaPayloadForUI: number | number[] | string | string[] = updated.area;
    if (mappedIds.length === 1) areaPayloadForUI = mappedIds[0];
    else if (mappedIds.length > 1) areaPayloadForUI = mappedIds;

    // local UI update (keep types compatible)
    setSchedules(prev =>
      prev.map(s => {
        if (scheduleId && s.Schedule_id === scheduleId) {
          return {
            ...s,
            Collector: updated.maintenance,
            Contact: updated.contact,
            Area: areaPayloadForUI,
            Date_of_collection: updated.date,
          };
        }
        return s;
      })
    );

    try {
      if (!scheduleId) {
        console.warn('No Schedule_id available for update; skipping backend call.');
        setIsEditModalOpen(false);
        setSelectedRow(null);
        return;
      }

      const original = schedules.find(s => s.Schedule_id === scheduleId);

      // updated.contact is numeric (normalized by modal). Prefer it.
      let normalizedContact = original?.Contact;
      const accountIdToUse = Number(updated.Account_id ?? original?.Account_id);
      if (accountIdToUse) {
        const profile = await profileService.getProfileByAccountId(accountIdToUse);
        const contactRaw = profile?.Contact ?? profile?.contact ?? '';
        normalizedContact = String(contactRaw);
      }

      // For backend prefer mapped numeric area ids. If some names weren't mapped, keep only mapped ids.
      const unknownAreas = updated.area.filter(name => nameToId[name] === undefined);
      if (unknownAreas.length > 0) {
        console.warn('Some areas were not found in area list and will not be sent as IDs:', unknownAreas);
      }

      // Choose area payload for backend:
      // - if we have mappedIds use them (single number or CSV string)
      // - otherwise fall back to original.Area to avoid sending plain names that backend may reject
      let backendAreaPayload: number | string | string[] | number[] = original?.Area ?? updated.area;
      if (mappedIds.length === 1) {
        backendAreaPayload = mappedIds[0];
      } else if (mappedIds.length > 1) {
        // Many APIs expect a comma-separated list instead of a JSON array.
        backendAreaPayload = mappedIds.join(',');
      }
      
      const payload: any = {
        // include Account_id only when available on original
        ...(original?.Account_id !== undefined ? { Account_id: original.Account_id } : {}),
        Collector: updated.maintenance,
        Contact: normalizedContact,
        Area: backendAreaPayload,
        ...(original?.sched_stat_id !== undefined ? { sched_stat_id: original.sched_stat_id } : {}),
        Date_of_collection: updated.date,
      };

      // debug: inspect exact payload sent to server
      console.debug('[schedule] update payload:', payload);

      await scheduleService.updateSchedule(scheduleId, payload);
    } catch (err: any) {
      console.error('Failed to persist schedule update', err);
      if (err?.message) console.error('Server message:', err.message);
    } finally {
      setIsEditModalOpen(false);
      setSelectedRow(null);
    }
  };

  const renderAreaCell = (row: any) => {
    // row.Area can be an ID, array of IDs, or already a name/array of names
    if (Array.isArray(row.Area)) {
      return row.Area.map((a: any) => areaMap[a] ?? String(a)).join(', ');
    }
    if (row.AreaName) return row.AreaName;
    const id = row.Area ?? row.Area_id ?? row.AreaId;
    if (id === undefined || id === null || id === '') return '';
    // if id is numeric string, try lookup
    return areaMap[id] ?? String(id);
  };

  const columns = [
    { key: 'Collector', label: 'Collector Name' },
    { 
      key: 'Area', 
      label: 'Area',
      render: (_value: any, row: any) => (
        <span>{renderAreaCell(row)}</span>
      )
    },
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
      label: 'Action',
      // Table implementations vary; provide both value,row params to be safe
      render: (_value: any, row: any) => (
        <div className="flex items-center gap-2">
          <EditButton
            onClick={() => handleEditClick(row)}
            // ensure prop matches EditButton props; use aria-label (valid attribute)
            disable={row.sched_stat_id === 3}
            aria-label="Edit schedule"
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
