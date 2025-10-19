const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

// Get all machines
export const getAllMachines = async (): Promise<Machine[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/machines`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('❌ Get all machines error:', error);
    throw error;
  }
};

// Create new machine  
export const createMachine = async (areaId: number, status?: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/machines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ areaId, status }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ Create machine error:', error);
    throw error;
  }
};

// Get areas
export const getAreas = async (): Promise<Area[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/machines/areas`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('❌ Get areas error:', error);
    throw error;
  }
};