import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchContainers,
  createContainer,
  setSelectedContainer,
  fetchAreaLogs,
  setSearchTerm,
  clearLogs,
} from '../../store/slices/wasteContainerSlice';
import type { WasteContainer, CreateContainerRequest } from '../../services/wasteContainerService';

/**
 * Feature-specific hook for waste container operations
 * Combines Redux actions with component logic
 */
export const useWasteContainer = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector(state => state.wasteContainer);

  // Initialize data on mount
  useEffect(() => {
    dispatch(fetchContainers());
  }, [dispatch]);

  // Handle container selection
  const selectContainer = (container: WasteContainer | null) => {
    dispatch(setSelectedContainer(container));
    if (container) {
      dispatch(fetchAreaLogs(container.area_id));
    } else {
      dispatch(clearLogs());
    }
  };

  // Create container with error handling
  const addContainer = async (
    payload: CreateContainerRequest & { latitude?: number; longitude?: number }
  ) => {
    try {
      await dispatch(createContainer(payload)).unwrap();
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error || 'Failed to create container' };
    }
  };

  // Update search term
  const updateSearch = (term: string) => {
    dispatch(setSearchTerm(term));
  };

  return {
    // State
    containers: state.containers,
    selectedContainer: state.selectedContainer,
    logs: state.logs,
    loading: state.loading,
    logsLoading: state.logsLoading,
    error: state.error,
    searchTerm: state.searchTerm,
    
    // Actions
    selectContainer,
    addContainer,
    updateSearch,
    refresh: () => dispatch(fetchContainers()),
  };
};