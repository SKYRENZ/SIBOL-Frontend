import { fetchJson, post } from './apiClient';

// This interface can be shared across components and hooks
export interface WasteContainer {
  container_id: number;
  area_id: number; //
  container_name: string;
  area_name: string;
  status: 'Empty' | 'Collecting' | 'Full' | 'In-Maintenance';
  deployment_date: string;
  latitude: number;
  longitude: number;
}

export interface CreateContainerRequest {
    container_name: string;
    area_id: number;
    deployment_date: string;
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
  const { data } = await post('/api/waste-containers', containerData);
  return data;
};

/**
 * Fetches waste input logs for a specific area.
 * @param areaId - The ID of the area.
 */
export const getAreaLogs = async (areaId: number): Promise<AreaLog[]> => {
  const data = await fetchJson(`/api/areas/${areaId}/logs`);
  return data?.data ?? data ?? [];
};