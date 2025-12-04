import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchAllMachineData,
  fetchMachines,
  createMachine,
  updateMachine,
  setSelectedMachine,
  setSearchTerm,
} from '../../store/slices/machineSlice';
import type { Machine } from '../../services/machineService';

/**
 * Feature-specific hook for machine operations
 * Combines Redux actions with component logic
 */
export const useMachines = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector(state => state.machine);

  // Initialize data on mount
  useEffect(() => {
    dispatch(fetchAllMachineData());
  }, [dispatch]);

  // Select a machine
  const selectMachine = (machine: Machine | null) => {
    dispatch(setSelectedMachine(machine));
  };

  // Create a new machine
  const addMachine = async (areaId: number) => {
    try {
      await dispatch(createMachine(areaId)).unwrap();
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error || 'Failed to create machine' };
    }
  };

  // Update existing machine
  const editMachine = async (
    machineId: number,
    updates: { name?: string; areaId?: number; status?: number }
  ) => {
    try {
      await dispatch(updateMachine({ machineId, updates })).unwrap();
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error || 'Failed to update machine' };
    }
  };

  // Update search term
  const updateSearch = (term: string) => {
    dispatch(setSearchTerm(term));
  };

  // Refresh all data
  const refresh = () => {
    dispatch(fetchAllMachineData());
  };

  // Refresh machines only
  const refreshMachines = () => {
    dispatch(fetchMachines());
  };

  return {
    // State
    machines: state.machines,
    areas: state.areas,
    machineStatuses: state.machineStatuses,
    selectedMachine: state.selectedMachine,
    loading: state.loading,
    error: state.error,
    searchTerm: state.searchTerm,
    currentPage: state.currentPage,
    pageSize: state.pageSize,

    // Actions
    selectMachine,
    addMachine,
    editMachine,
    updateSearch,
    refresh,
    refreshMachines,
  };
};