import { fetchJson } from '../apiClient';

export interface Schedule {
  Schedule_id?: number;
  Account_id: number;
  Collector?: string;
  // Contact is stored/sent as local Philippine string with leading 0 (e.g. "09XXXXXXXXX")
  Contact: string;
  // area can be a single id, array of ids, or names (string) / array of names
  Area: number | number[] | string | string[];
  sched_stat_id: number;
  Date_of_collection: string;
}

// Fetch all schedules
export const getAllSchedules = async (): Promise<Schedule[]> => {
  const data = await fetchJson('/api/schedules');
  return data?.data ?? data ?? [];
};

// Create a new schedule
export const createSchedule = async (scheduleData: Omit<Schedule, 'Schedule_id'>): Promise<Schedule> => {
  const data = await fetchJson('/api/schedules', {
    method: 'POST',
    body: JSON.stringify(scheduleData),
  });
  return data;
};

// Update an existing schedule
export const updateSchedule = async (id: number, scheduleData: Partial<Schedule>): Promise<Schedule> => {
  const data = await fetchJson(`/api/schedules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(scheduleData),
  });
  return data;
};

// Delete a schedule
export const deleteSchedule = async (id: number): Promise<void> => {
  await fetchJson(`/api/schedules/${id}`, {
    method: 'DELETE',
  });
};