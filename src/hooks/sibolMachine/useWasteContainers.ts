import { useState, useCallback } from 'react';
import * as wasteContainerService from '../../services/wasteContainerService';
import type { WasteContainer, CreateContainerRequest } from '../../services/wasteContainerService';

export function useWasteContainers() {
  const [wasteContainers, setWasteContainers] = useState<WasteContainer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContainers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await wasteContainerService.getWasteContainers();
      setWasteContainers(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Failed to load waste containers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createContainer = async (containerData: CreateContainerRequest) => {
    setLoading(true);
    try {
      await wasteContainerService.createWasteContainer(containerData);
      await fetchContainers(); // Refresh data after creation
      return true; // Indicate success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Failed to create container:', err);
      return false; // Indicate failure
    } finally {
      setLoading(false);
    }
  };

  return {
    wasteContainers,
    loading,
    error,
    fetchContainers,
    createContainer,
  };
}