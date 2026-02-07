import { fetchJson } from './apiClient';

export interface Machine {
  machine_id: number;
  Name: string;
  Area_id: number;
  Area_Name: string;
  status_id: number | null;
  status_name: string | null;
  Updated_at?: string | null;
  updated_at?: string | null;
  Updated_by?: string | number | null;
  updated_by?: string | number | null;
  Updated_by_name?: string | null;
  updated_by_name?: string | null;
  Updated_by_username?: string | null;
  updated_by_username?: string | null;
  Last_modified_at?: string | null;
  last_modified_at?: string | null;
  Modified_at?: string | null;
  modified_at?: string | null;
  Last_action?: string | null;
  last_action?: string | null;
  Action?: string | null;
  action?: string | null;
}

export interface MachineStatus {
  Mach_status_id: number;
  Status: string;
}

export interface Area {
  Area_id: number;
  Area_Name: string;
  Full_Address?: string; // Add optional address field
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
  const data = await fetchJson('/api/areas'); // Assuming you have an /api/areas endpoint
  return data?.data ?? data ?? [];
};

// Create a new area
export const createArea = async (areaName: string, fullAddress: string): Promise<Area> => {
    const data = await fetchJson('/api/areas', {
        method: 'POST',
        body: JSON.stringify({ areaName, fullAddress }),
    });
    return data;
};