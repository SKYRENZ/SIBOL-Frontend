import { useState } from 'react';

/**
 * Reusable hook for common UI state patterns
 * Can be used across ANY component
 */
export const useUIState = () => {
  const [modals, setModals] = useState({
    add: false,
    edit: false,
    delete: false,
    info: false,
  });

  const [ui, setUI] = useState({
    sidebarOpen: true,
    viewMode: 'grid' as 'grid' | 'list' | 'table',
  });

  const openModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  };

  const closeAllModals = () => {
    setModals({ add: false, edit: false, delete: false, info: false });
  };

  const toggleSidebar = () => {
    setUI(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  };

  const setViewMode = (mode: 'grid' | 'list' | 'table') => {
    setUI(prev => ({ ...prev, viewMode: mode }));
  };

  return {
    modals,
    ui,
    openModal,
    closeModal,
    closeAllModals,
    toggleSidebar,
    setViewMode,
  };
};