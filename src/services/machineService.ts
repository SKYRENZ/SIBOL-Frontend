const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
import { fetchJson } from './apiClient';

export interface Machine {
  machine_id: number;
  Name: string;
  Area_id: number;
  Area_Name: string;
  status_id: number | null;
  status_name: string | null;
}

export interface MachineStatus {
  Mach_status_id: number;
  Status: string;
}

export interface Area {
  Area_id: number;
  Area_Name: string;
}

export interface UpdateMachineRequest {
  name: string;
  areaId: number;
  status?: number;
}

// Get all machines
export const getAllMachines = async (): Promise<Machine[]> => {
  const data = await fetchJson('/api/machines');
  // backend sometimes returns { data: [...] } or array directly; normalize:
  return data?.data ?? data ?? [];
};

// Create new machine  
export const createMachine = async (areaId: number, status?: number) => {
  const data = await fetchJson('/api/machines', {
    method: 'POST',
    body: JSON.stringify({ areaId, status }),
  });
  return data;
};

// ✅ Add missing updateMachine function
export const updateMachine = async (id: number, machineData: UpdateMachineRequest) => {
  const data = await fetchJson(`/api/machines/${id}`, {
    method: 'PUT',
    body: JSON.stringify(machineData),
  });
  return data;
};

// ✅ Add missing getMachineStatuses function
export const getMachineStatuses = async (): Promise<MachineStatus[]> => {
  const data = await fetchJson('/api/machines/statuses');
  return data?.data ?? data ?? [];
};

// Get areas
export const getAreas = async (): Promise<Area[]> => {
  const data = await fetchJson('/api/machines/areas');
  return data?.data ?? data ?? [];
};