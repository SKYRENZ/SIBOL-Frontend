import { useState, useCallback } from 'react';
import * as machineService from '../../services/machineService';
import type { Machine, Area } from '../../services/machineService';

export function useMachinesData() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [machineStatuses, setMachineStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMachineData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [machinesData, areasData, statusesData] = await Promise.all([
        machineService.getAllMachines(),
        machineService.getAreas(),
        machineService.getMachineStatuses()
      ]);
      setMachines(machinesData);
      setAreas(areasData);
      setMachineStatuses(statusesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load machine data';
      setError(errorMessage);
      console.error('❌ Load machine data error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    machines,
    areas,
    machineStatuses,
    loading,
    error,
    fetchMachineData,
  };
}