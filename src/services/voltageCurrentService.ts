import { fetchJson } from './apiClient';

export interface VoltageCurrentReading {
    id: number;
    deviceId: string;
    voltage: number;
    current: number;
    power: number;
    timestamp: string;
    createdAt: string;
    cumulativeKwh?: number;
    intervalKwh?: number;
}

export interface VoltageCurrentResponse {
    count: number;
    data: VoltageCurrentReading[];
}

export const getLatestVoltageCurrentReadings = async (deviceId?: string, limit = 1): Promise<VoltageCurrentReading[]> => {
    try {
        const queryParams = new URLSearchParams();
        if (deviceId) queryParams.append('deviceId', deviceId);
        queryParams.append('limit', limit.toString());
        
        const response = await fetchJson<VoltageCurrentResponse>(`/api/voltage-current?${queryParams.toString()}`);
        return response.data || [];
    } catch (error) {
        console.error('Error fetching voltage/current readings:', error);
        return [];
    }
};
