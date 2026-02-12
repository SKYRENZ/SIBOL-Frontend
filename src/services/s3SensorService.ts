import { fetchJson } from './apiClient';

export interface S3SensorReading {
    S3sensor_id: number;
    Machine_id: number;
    Pressure_Sensor: number | null;
    Ph_Sensor: number | null;
    Temp_Sensor: number | null;
    Methane_Sensor: number | null;
    Timestamp: string;
}

export interface S3SensorResponse {
    success: boolean;
    count: number;
    data: S3SensorReading[];
}

export const getLatestS3Readings = async (machineId: number, limit = 1): Promise<S3SensorReading[]> => {
    try {
        const response = await fetchJson<S3SensorResponse>(`/api/s3-sensors/data?machineId=${machineId}&limit=${limit}`);
        return response.data || [];
    } catch (error) {
        console.error('Error fetching S3 sensor readings:', error);
        return [];
    }
};
