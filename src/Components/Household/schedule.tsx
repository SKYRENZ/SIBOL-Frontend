import React from "react";
import Table from "../common/Table";
import * as scheduleService from '../../services/Schedule/scheduleService';
import * as profileService from '../../services/profile/profileService';
import EditScheduleModal from "./editScheduleModal";
import EditButton from "../editButton";
import { useAreas, useSchedules } from "../../hooks/household/useScheduleHooks";
import useFilters from "../../hooks/filter/useFilter";

interface ScheduleTabProps {
  filters?: string[];
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({ filters = [] }) => {
  const { schedules, setSchedules, loading: loadingSchedules, error: schedulesError } = useSchedules();
  const { areaMap, loading: loadingAreas, error: areasError } = useAreas();
  const { get, loading: loadingScheduleStatuses } = useFilters(['scheduleStatuses']);
  const scheduleStatuses = get('scheduleStatuses') as { id: number | string; name: string }[];

  // Build status map from fetched data
  const scheduleStatusMap: Record<number, string> = React.useMemo(() => {
    const map: Record<number, string> = {};
    scheduleStatuses.forEach(status => {
      map[Number(status.id)] = status.name;
    });
    return map;
  }, [scheduleStatuses]);

  const getStatusLabel = (statusId: number | string | undefined) => {
    const id = Number(statusId);
    return scheduleStatusMap[id] ?? 'Unknown';
  };
  
  const loading = loadingSchedules || loadingAreas || loadingScheduleStatuses;
  const error = schedulesError ?? areasError;

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<any | null>(null);
  const [filteredSchedules, setFilteredSchedules] = React.useState(schedules);

  // Update filtered schedules when filters change
  React.useEffect(() => {
    if (filters.length === 0) {
      setFilteredSchedules(schedules);
      return;
    }

    const filtered = schedules.filter(schedule => {
      const statusLabel = getStatusLabel(schedule.sched_stat_id);
      return filters.includes(statusLabel);
    });
    setFilteredSchedules(filtered);
  }, [filters, schedules, scheduleStatusMap]);

  const handleEditClick = (row: any) => {
    const initialData = {
      Schedule_id: row.Schedule_id ?? row.schedule_id ?? undefined,
      maintenance: row.Collector ?? row.Maintenance ?? row.maintenance ?? row.Username ?? '',
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

    const nameToId: Record<string, number> = {};
    for (const [key, val] of Object.entries(areaMap)) {
      const numKey = Number(key);
      if (!Number.isNaN(numKey)) nameToId[val] = numKey;
    }

    const mappedIds = updated.area.map(name => nameToId[name]).filter((v): v is number => typeof v === 'number');

    let areaPayloadForUI: number | number[] | string | string[] = updated.area;
    if (mappedIds.length === 1) areaPayloadForUI = mappedIds[0];
    else if (mappedIds.length > 1) areaPayloadForUI = mappedIds;

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

      let backendAreaPayload: number | string | string[] | number[] = original?.Area ?? updated.area;
      if (mappedIds.length === 1) {
        backendAreaPayload = mappedIds[0];
      } else if (mappedIds.length > 1) {
        backendAreaPayload = mappedIds.join(',');
      }
      
      const payload: any = {
        ...(original?.Account_id !== undefined ? { Account_id: original.Account_id } : {}),
        Collector: updated.maintenance,
        Contact: normalizedContact,
        Area: backendAreaPayload,
        ...(original?.sched_stat_id !== undefined ? { sched_stat_id: original.sched_stat_id } : {}),
        Date_of_collection: updated.date,
      };

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
    if (Array.isArray(row.Area)) {
      return row.Area.map((a: any) => areaMap[a] ?? String(a)).join(', ');
    }
    if (row.AreaName) return row.AreaName;
    const id = row.Area ?? row.Area_id ?? row.AreaId;
    if (id === undefined || id === null || id === '') return '';
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
      label: '',
      render: (_value: any, row: any) => (
        <div className="flex items-center gap-2">
          <EditButton
            onClick={() => handleEditClick(row)}
            disable={row.sched_stat_id === 3}
            aria-label="Edit schedule"
          />
        </div>
      )
    }
  ];

  const data = filteredSchedules.map(schedule => ({
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
