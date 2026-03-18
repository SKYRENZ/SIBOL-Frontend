import React, { useState, useEffect } from 'react';
import Header from '../Components/Header';
import type { Machine } from '../services/machineService';
import Tabs from '../Components/common/Tabs';
import FormModal from '../Components/common/FormModal';
import FormField from '../Components/common/FormField';
import Toast from '../Components/common/Toast';
import WasteContainerTab from '../Components/SibolMachine/WasteContainerTab';
import MachineTab from '../Components/SibolMachine/MachineTab';
import AddWasteContainerForm from '../Components/SibolMachine/AddWasteContainerForm';
import ProcessPanelTab from '../Components/SibolMachine/ProcessPanelTab';
import type { CreateContainerRequest } from '../services/wasteContainerService';
import "../tailwind.css";

// Custom Hooks
import { useMachines } from '../hooks/sibolMachine/useMachines';
import { useWasteContainer } from '../hooks/wasteContainer/useWasteContainer';
import { useUIState } from '../hooks/common/useUIState';
import { useToast } from '../hooks/common/useToast';

// Redux
import { useAppSelector } from '../store/hooks';

// Assets
import lilyImage from '../assets/images/lili.png';
import stage3DrumImage from '../assets/images/Stage3Drum.png';

const SibolMachinePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Machines');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [headerHeight, setHeaderHeight] = useState<number>(0);

  // Redux Hooks
  const user = useAppSelector(state => state.auth.user);
  const {
    machines,
    areas,
    machineStatuses,
    loading: machinesLoading,
    error: machinesError,
    addMachine,
    editMachine,
    refresh,
  } = useMachines();

  const {
    loading: containersLoading,
    addContainer,
  } = useWasteContainer();

  // UI State Hook
  const { modals, openModal, closeModal } = useUIState();

  // Toast Hook
  const { toasts, addToast, removeToast } = useToast();

  // Local form state
  const [formData, setFormData] = useState({
    area: '',
    startDate: '',
    name: '',
    status: '',
  });
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);

  const tabsConfig = [
    { id: 'Machines', label: 'Machines' },
    { id: 'Process Panel', label: 'Process Panel' },
    { id: 'Waste Container', label: 'Waste Container' },
  ];

  // Header height calculation
  useEffect(() => {
    const update = () => {
      const headerEl = document.querySelector('header.header') as HTMLElement | null;
      if (!headerEl) {
        setHeaderHeight(0);
        return;
      }
      const style = getComputedStyle(headerEl);
      const isFixed = style.position === 'fixed' || style.position === 'sticky';
      setHeaderHeight(isFixed ? Math.ceil(headerEl.getBoundingClientRect().height) : 0);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Reset pagination on tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setFormData({ area: '', startDate: '', name: '', status: '' });
    setEditingMachine(null);
    refresh(); // Refetch areas with barangay data
    openModal('add');
  };

  // Open Edit Modal
  const handleEditMachine = (machine: Machine) => {
    setEditingMachine(machine);
    setFormData({
      area: machine.Area_id.toString(),
      startDate: '',
      name: machine.Name,
      status: machine.status_id?.toString() || '',
    });
    openModal('edit');
  };

  // Update form field
  const updateFormField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Check if form data has changed
  const hasFormDataChanged = editingMachine && (
    formData.name !== editingMachine.Name ||
    formData.area !== editingMachine.Area_id.toString() ||
    formData.status !== (editingMachine.status_id?.toString() || '')
  );

  // Handle Machine Form Submit
  const handleMachineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = modals.edit && editingMachine;

    if (isEditing) {
      const result = await editMachine(editingMachine.machine_id, {
        name: formData.name?.trim() || editingMachine.Name,
        areaId: parseInt(formData.area),
        status: formData.status ? parseInt(formData.status) : undefined,
      });

      if (result.success) {
        closeModal('edit');
        addToast('Machine updated successfully!', 'success');
      } else {
        addToast(`Failed to update machine: ${result.error}`, 'error');
      }
    } else {
      // Get barangay ID from current user's barangay
      const barangayId = user?.Barangay_id || user?.barangay_id || user?.Barangay_Name;
      const result = await addMachine(parseInt(formData.area), barangayId ? parseInt(barangayId.toString()) : undefined);

      if (result.success) {
        closeModal('add');
        addToast('Machine created successfully!', 'success');
      } else {
        addToast(`Failed to create machine: ${result.error}`, 'error');
      }
    }
  };

  // Handle Container Submit
  const handleContainerSubmit = async (payload: any) => {
    const result = await addContainer(payload);
    if (result.success) {
      closeModal('add');
      addToast('Waste container created successfully!', 'success');
      return true;
    } else {
      addToast(`Failed to create container: ${result.error}`, 'error');
      return false;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Machines':
        return (
          <MachineTab
            machines={machines}
            loading={machinesLoading}
            error={machinesError}
            onEdit={handleEditMachine}
            onAdd={handleOpenAddModal}
            pagination={{
              currentPage,
              pageSize,
              totalItems: machines.length,
              onPageChange: setCurrentPage,
              onPageSizeChange: handlePageSizeChange,
            }}
            filterTypes={['machine-status', 'area']}
          />
        );
      case 'Waste Container':
        return (
          <WasteContainerTab
            filterTypes={['container-status', 'waste-type']}
          />
        );
      case 'Process Panel':
        return <ProcessPanelTab />;
      default:
        return <div className="text-center py-10">Content for {activeTab}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="w-full bg-white border-b">
        <div style={{ height: `calc(${headerHeight}px)` }} aria-hidden />
        <div
          className="subheader sticky z-10 w-full bg-white px-6"
          style={{ top: `calc(${headerHeight}px)` }}
        >
          <div className="max-w-screen-2xl mx-auto py-3">
            <Tabs tabs={tabsConfig} activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>
      </div>

      <div className="w-full px-6 py-8">
        <div className="max-w-screen-2xl mx-auto">
          {renderContent()}
        </div>
      </div>

      {/* Machine Form Modal */}
      {activeTab === 'Machines' && (
        <FormModal
          isOpen={modals.add || modals.edit}
          onClose={() => modals.edit ? closeModal('edit') : closeModal('add')}
          title={modals.edit ? `Edit Machine #${editingMachine?.machine_id}` : 'Add Machine'}
          width="500px"
          headerImage={modals.add ? lilyImage : undefined}
          contentLayout="default"
        >
          <form onSubmit={handleMachineSubmit}>
            {modals.add && (
              <div className="space-y-4 flex flex-col items-center">
                {/* Area dropdown */}
                <div className="w-full max-w-xs">
                  <FormField
                    label="Area"
                    name="area"
                    type="select"
                    value={formData.area}
                    onChange={(e) => updateFormField('area', e.target.value)}
                    options={areas.map((area) => ({
                      value: area.Area_id.toString(),
                      label: area.Area_Name
                    }))}
                    selectSize={5}
                  />
                </div>

                {/* Drum image */}
                <img
                  src={stage3DrumImage}
                  alt="Stage 3 Drum"
                  className="h-56 object-contain"
                />

                {/* Description below drum */}
                <p className="text-sm text-gray-700 text-center max-w-xs">
                  IoT-powered biogas generator that transforms food waste into renewable energy
                </p>

                {/* Add Machine button */}
                <button
                  type="submit"
                  disabled={machinesLoading}
                  className="bg-[#2E523A] hover:bg-[#3b6b4c] text-white font-medium px-8 py-2 rounded-full disabled:opacity-50 mt-2"
                >
                  {machinesLoading ? 'Saving...' : 'Add Machine'}
                </button>
              </div>
            )}

            {modals.edit && (
              <div className="space-y-4">
                <FormField
                  label="Machine Name"
                  name="name"
                  type="text"
                  placeholder="e.g., SIBOL-M-001"
                  value={formData.name}
                  onChange={(e) => updateFormField('name', e.target.value)}
                />
                <FormField
                  label="Area"
                  name="area"
                  type="select"
                  value={formData.area}
                  onChange={(e) => updateFormField('area', e.target.value)}
                  options={areas.map((area) => ({
                    value: area.Area_id.toString(),
                    label: area.Area_Name
                  }))}
                  selectSize={5}
                />
                <FormField
                  label="Status"
                  name="status"
                  type="button-grid-select"
                  value={formData.status}
                  onChange={(e) => updateFormField('status', e.target.value)}
                  options={machineStatuses.map((s) => ({
                    value: s.Mach_status_id.toString(),
                    label: s.Status
                  }))}
                  colorMap={Object.fromEntries(
                    machineStatuses.map((s) => {
                      const status = s.Status?.toLowerCase();
                      let colors;
                      if (status === 'active') {
                        colors = {
                          bg: 'bg-green-50',
                          border: 'border-green-300',
                          gradient: 'bg-green-100',
                          selectedGradient: 'bg-green-500',
                          selectedBorder: 'border-green-600'
                        };
                      } else if (status === 'inactive') {
                        colors = {
                          bg: 'bg-red-50',
                          border: 'border-red-300',
                          gradient: 'bg-red-100',
                          selectedGradient: 'bg-red-500',
                          selectedBorder: 'border-red-600'
                        };
                      } else if (status === 'under maintenance') {
                        colors = {
                          bg: 'bg-yellow-50',
                          border: 'border-yellow-300',
                          gradient: 'bg-yellow-100',
                          selectedGradient: 'bg-yellow-500',
                          selectedBorder: 'border-yellow-600'
                        };
                      } else {
                        colors = {
                          bg: 'bg-gray-50',
                          border: 'border-gray-300',
                          gradient: 'bg-gray-100',
                          selectedGradient: 'bg-gray-500',
                          selectedBorder: 'border-gray-600'
                        };
                      }
                      return [s.Mach_status_id.toString(), colors];
                    })
                  )}
                />
                <div className="flex justify-center pt-2">
                  <button
                    type="submit"
                    disabled={machinesLoading || !hasFormDataChanged}
                    className="bg-[#2E523A] hover:bg-[#3b6b4c] text-white font-medium px-8 py-2.5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {machinesLoading ? 'Saving...' : 'Update Machine'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </FormModal>
      )}

      {/* Container Form Modal */}
      {activeTab === 'Waste Container' && (
        <FormModal
          isOpen={modals.add}
          onClose={() => closeModal('add')}
          title="Add Container"
          width="500px"
        >
          <AddWasteContainerForm
            loading={containersLoading}
            onCancel={() => closeModal('add')}
            onSubmit={handleContainerSubmit}
          />
        </FormModal>
      )}

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[9999] space-y-3 max-w-sm">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </div>
  );
};

export default SibolMachinePage;
