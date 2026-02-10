import React, { useState, useEffect } from 'react';
import Header from '../Components/Header';
import type { Machine } from '../services/machineService';
import Tabs from '../Components/common/Tabs';
import FormModal from '../Components/common/FormModal';
import FormField from '../Components/common/FormField';
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

const SibolMachinePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Machines');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [headerHeight, setHeaderHeight] = useState<number>(0);

  // Redux Hooks
  const {
    machines,
    areas,
    machineStatuses,
    loading: machinesLoading,
    error: machinesError,
    addMachine,
    editMachine,
  } = useMachines();

  const {
    loading: containersLoading,
    addContainer,
  } = useWasteContainer();

  // UI State Hook
  const { modals, openModal, closeModal } = useUIState();

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
    { id: 'Analytics', label: 'Analytics' }
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
        alert('Machine updated successfully!');
      } else {
        alert(`Failed to update machine: ${result.error}`);
      }
    } else {
      const result = await addMachine(parseInt(formData.area));

      if (result.success) {
        closeModal('add');
        alert('Machine created successfully!');
      } else {
        alert(`Failed to create machine: ${result.error}`);
      }
    }
  };

  // Handle Container Submit
  const handleContainerSubmit = async (payload: any) => {
    const result = await addContainer(payload);
    if (result.success) {
      closeModal('add');
      alert('Waste container created successfully!');
      return true;
    } else {
      alert(`Failed to create container: ${result.error}`);
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
      case 'Analytics':
        return <Analytics />; // ✅ Analytics tab rendering
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
        >
          <form onSubmit={handleMachineSubmit} className="space-y-4">
            {modals.edit && (
              <FormField
                label="Machine Name"
                name="name"
                type="text"
                placeholder="e.g., SIBOL-M-001"
                value={formData.name}
                onChange={(e) => updateFormField('name', e.target.value)}
                required
              />
            )}
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
              required
            />
            {modals.edit && (
              <FormField
                label="Status"
                name="status"
                type="select"
                value={formData.status}
                onChange={(e) => updateFormField('status', e.target.value)}
                options={machineStatuses.map((s) => ({ 
                  value: s.Mach_status_id.toString(), 
                  label: s.Status 
                }))}
              />
            )}
            <div className="flex justify-center pt-2">
              <button 
                type="button" 
                onClick={() => modals.edit ? closeModal('edit') : closeModal('add')} 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 mr-3"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={machinesLoading} 
                className="bg-[#2E523A] hover:bg-[#3b6b4c] text-white font-medium px-8 py-2.5 rounded-lg disabled:opacity-50"
              >
                {machinesLoading ? 'Saving...' : (modals.edit ? 'Update Machine' : 'Add Machine')}
              </button>
            </div>
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
    </div>
  );
};

export default SibolMachinePage;
