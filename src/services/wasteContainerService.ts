import { fetchJson, post } from './apiClient';

// This interface can be shared across components and hooks
export interface WasteContainer {
  container_id: number;
  area_id: number; //
  container_name: string;
  area_name: string;
  // added optional full_address so frontend can show the area's full address returned by the backend
  full_address?: string;
  status: 'Empty' | 'Collecting' | 'Full' | 'In-Maintenance';
  device_id?: string | null;
  current_kg?: number | null;
  last_weight_at?: string | null;
  has_weight_data?: 0 | 1 | boolean;
  status_label?: string;
  deployment_date: string;
  latitude: number;
  longitude: number;
}

export interface CreateContainerRequest {
  container_name: string;
  device_id?: string;
  area_name: string;
  fullAddress: string;
}

export interface AreaLog {
  input_id: number;
  weight: number;
  date: string;
  time: string;
  operator_name: string;
}

/**
 * Fetches all waste containers from the backend.
 */
export const getWasteContainers = async (): Promise<WasteContainer[]> => {
  const data = await fetchJson('/api/waste-containers');
  // Normalize response, as the backend might wrap it in a 'data' object
  return data?.data ?? data ?? [];
};

/**
 * Creates a new waste container.
 * @param containerData - The data for the new container.
 */
export const createWasteContainer = async (containerData: CreateContainerRequest): Promise<WasteContainer> => {
  // payload now includes area_name and fullAddress for backend geocoding
  const { data } = await post('/api/waste-containers', containerData);
  return (data as any)?.data ?? data;
};

/**
 * Fetches waste input logs for a specific area.
 * @param areaId - The ID of the area.
 */
export const getAreaLogs = async (areaId: number): Promise<AreaLog[]> => {
  const data = await fetchJson(`/api/areas/${areaId}/logs`);
  return data?.data ?? data ?? [];
};