import React, { useState, useEffect } from 'react';
import Header from '../Components/Header';
import * as machineService from '../services/machineService';
import type { Machine, Area } from '../services/machineService';
import { useMachine } from '../hooks/sibolMachine/useMachine';
import Tabs from '../Components/common/Tabs';
import SearchBar from '../Components/common/SearchBar';
import Table from '../Components/common/Table';
import FormModal from '../Components/common/FormModal';
import FormField from '../Components/common/FormField';
import '../types/Household.css';

const SibolMachinePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Chemical Additives');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMachine, setSelectedMachine] = useState('SIBOL Machine 1');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Items per page
  
  const { 
    showAddForm, 
    showEditForm,
    openAddForm, 
    closeAddForm, 
    openEditForm,
    closeEditForm,
    formData, 
    updateFormField, 
    setFormData 
  } = useMachine();

  // ✅ Add state for real machine data
  const [machines, setMachines] = useState<Machine[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [machineStatuses, setMachineStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);

  // ✅ Load data when Machines tab is active
  useEffect(() => {
    if (activeTab === 'Machines') {
      loadMachineData();
    }
  }, [activeTab]);

  // Reset to page 1 when search term or active tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const loadMachineData = async () => {
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
      setError(err instanceof Error ? err.message : 'Failed to load machine data');
      console.error('❌ Load machine data error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sample data for Chemical Additives
  const chemicalAdditivesData = [
    {
      chemicalInput: 'Water',
      stage: '2',
      value: '20',
      units: 'liters',
      date: '8/27/25',
      time: '09:39AM',
      personInCharge: 'Maintenance#32'
    },
    {
      chemicalInput: 'Water',
      stage: '2',
      value: '10',
      units: 'ounces',
      date: '8/27/25',
      time: '10:40AM',
      personInCharge: 'Maintenance#54'
    },
    {
      chemicalInput: 'Sodium Hydroxide',
      stage: '1',
      value: '15',
      units: 'liters',
      date: '8/28/25',
      time: '08:15AM',
      personInCharge: 'Maintenance#12'
    },
    {
      chemicalInput: 'Hydrochloric Acid',
      stage: '3',
      value: '5',
      units: 'liters',
      date: '8/28/25',
      time: '11:20AM',
      personInCharge: 'Maintenance#45'
    },
    {
      chemicalInput: 'Chlorine',
      stage: '2',
      value: '8',
      units: 'liters',
      date: '8/29/25',
      time: '09:00AM',
      personInCharge: 'Maintenance#23'
    },
    {
      chemicalInput: 'Water',
      stage: '1',
      value: '25',
      units: 'liters',
      date: '8/29/25',
      time: '02:30PM',
      personInCharge: 'Maintenance#32'
    },
    {
      chemicalInput: 'Sulfuric Acid',
      stage: '3',
      value: '12',
      units: 'liters',
      date: '8/30/25',
      time: '10:45AM',
      personInCharge: 'Maintenance#67'
    },
    {
      chemicalInput: 'Ammonia',
      stage: '2',
      value: '18',
      units: 'liters',
      date: '8/30/25',
      time: '03:15PM',
      personInCharge: 'Maintenance#54'
    },
    {
      chemicalInput: 'Sodium Hypochlorite',
      stage: '1',
      value: '22',
      units: 'liters',
      date: '8/31/25',
      time: '08:30AM',
      personInCharge: 'Maintenance#12'
    },
    {
      chemicalInput: 'Water',
      stage: '3',
      value: '30',
      units: 'liters',
      date: '8/31/25',
      time: '01:00PM',
      personInCharge: 'Maintenance#45'
    },
    {
      chemicalInput: 'Phosphoric Acid',
      stage: '2',
      value: '7',
      units: 'liters',
      date: '9/1/25',
      time: '09:20AM',
      personInCharge: 'Maintenance#23'
    },
    {
      chemicalInput: 'Calcium Chloride',
      stage: '1',
      value: '14',
      units: 'liters',
      date: '9/1/25',
      time: '11:45AM',
      personInCharge: 'Maintenance#32'
    },
    {
      chemicalInput: 'Water',
      stage: '2',
      value: '19',
      units: 'liters',
      date: '9/2/25',
      time: '08:00AM',
      personInCharge: 'Maintenance#67'
    },
    {
      chemicalInput: 'Potassium Hydroxide',
      stage: '3',
      value: '11',
      units: 'liters',
      date: '9/2/25',
      time: '02:20PM',
      personInCharge: 'Maintenance#54'
    },
    {
      chemicalInput: 'Nitric Acid',
      stage: '1',
      value: '9',
      units: 'liters',
      date: '9/3/25',
      time: '10:10AM',
      personInCharge: 'Maintenance#12'
    }
  ];

  // Sample data for Waste Container
  const wasteContainerData = [
    {
      wasteContainerNo: 'WC-001',
      area: 'Package 1',
      status: 'Full',
      startDate: '8/1/2025'
    },
    {
      wasteContainerNo: 'WC-002',
      area: 'Package 2',
      status: 'Not Full',
      startDate: '8/15/2025'
    },
    {
      wasteContainerNo: 'WC-003',
      area: 'Package 3',
      status: 'Full',
      startDate: '8/5/2025'
    },
    {
      wasteContainerNo: 'WC-004',
      area: 'Package 1',
      status: 'Not Full',
      startDate: '8/10/2025'
    },
    {
      wasteContainerNo: 'WC-005',
      area: 'Package 4',
      status: 'Full',
      startDate: '8/12/2025'
    },
    {
      wasteContainerNo: 'WC-006',
      area: 'Package 2',
      status: 'Not Full',
      startDate: '8/18/2025'
    },
    {
      wasteContainerNo: 'WC-007',
      area: 'Package 3',
      status: 'Full',
      startDate: '8/20/2025'
    },
    {
      wasteContainerNo: 'WC-008',
      area: 'Package 1',
      status: 'Not Full',
      startDate: '8/22/2025'
    },
    {
      wasteContainerNo: 'WC-009',
      area: 'Package 4',
      status: 'Full',
      startDate: '8/25/2025'
    },
    {
      wasteContainerNo: 'WC-010',
      area: 'Package 2',
      status: 'Not Full',
      startDate: '8/28/2025'
    },
    {
      wasteContainerNo: 'WC-011',
      area: 'Package 3',
      status: 'Full',
      startDate: '8/30/2025'
    },
    {
      wasteContainerNo: 'WC-012',
      area: 'Package 1',
      status: 'Not Full',
      startDate: '9/1/2025'
    }
  ];

  const tabsConfig = [
    { id: 'Process Panels', label: 'Process Panels' },
    { id: 'Chemical Additives', label: 'Chemical Additives' },
    { id: 'Machines', label: 'Machines' },
    { id: 'Waste Container', label: 'Waste Container' },
    { id: 'Analytics', label: 'Analytics' }
  ];
  const staticAreas = ['Package 1', 'Package 2', 'Package 3', 'Package 4'];
  const sibolMachines = Array.from({ length: 120305 }, (_, i) => `SIBOL Machine ${i + 1}`);

  const generateMachineNo = () => {
    return Math.floor(Math.random() * 1000) + 1;
  };

  // ✅ Handle edit machine button click
  const handleEditMachine = (machine: Machine) => {
    setEditingMachine(machine);
    setFormData({
      area: machine.Area_id.toString(),
      startDate: '',
      name: machine.Name, // ✅ This is correct
      status: machine.status_id?.toString() || ''
    });
    openEditForm();
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'Machines') {
      if (showEditForm && editingMachine) {
        // ✅ Handle machine edit
        try {
          setLoading(true);
          
          // ✅ Fix: Use formData.name directly, fallback to original only if empty
          const updatedName = formData.name?.trim() || editingMachine.Name;
          
          await machineService.updateMachine(editingMachine.machine_id, {
            name: updatedName,
            areaId: parseInt(formData.area),
            status: formData.status ? parseInt(formData.status) : undefined
          });
          await loadMachineData(); // Reload data
          closeEditForm();
          setEditingMachine(null);
          alert('Machine updated successfully!');
        } catch (err) {
          alert(`Failed to update machine: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
          setLoading(false);
        }
      } else {
        // ✅ Handle real machine creation (unchanged)
        try {
          setLoading(true);
          const areaId = parseInt(formData.area);
          await machineService.createMachine(areaId);
          await loadMachineData(); // Reload data
          closeAddForm();
          alert('Machine created successfully!');
        } catch (err) {
          alert(`Failed to create machine: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
          setLoading(false);
        }
      }
    } else {
      // Handle other tabs (existing logic)
      console.log('Form submitted:', { machineNo: generateMachineNo(), ...formData });
      closeAddForm();
    }
  };

  const renderTable = () => {
    if (activeTab === 'Chemical Additives') {
      const columns = [
        { key: 'chemicalInput', label: 'Chemical Input' },
        { key: 'stage', label: 'Stage' },
        { key: 'value', label: 'Value' },
        { key: 'units', label: 'Units', hideMobile: true },
        { key: 'date', label: 'Date' },
        { key: 'time', label: 'Time', hideMobile: true, hideTablet: true },
        { key: 'personInCharge', label: 'Person in Charge', hideMobile: true }
      ];
      
      // Paginate chemical additives data
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = chemicalAdditivesData.slice(startIndex, endIndex);
      
      return (
        <Table 
          columns={columns} 
          data={paginatedData} 
          emptyMessage="No chemical additives data available"
          pagination={{
            currentPage,
            pageSize,
            totalItems: chemicalAdditivesData.length,
            onPageChange: setCurrentPage,
            onPageSizeChange: handlePageSizeChange
          }}
        />
      );
    } else if (activeTab === 'Machines') {
      const filteredMachines = machines.filter(machine => 
        searchTerm === '' || 
        machine.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.Area_Name?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const columns = [
        { 
          key: 'machine_id', 
          label: 'Machine ID',
          render: (value: number) => `#${value}`
        },
        { key: 'Name', label: 'Machine Name' },
        { 
          key: 'Area_Name', 
          label: 'Area',
          render: (value: string | undefined, row: Machine) => value || `Area ${row.Area_id}`,
          hideMobile: true
        },
        { 
          key: 'status_name', 
          label: 'Status',
          render: (value: string | undefined) => (
            <span className={`px-2 py-1 text-xs rounded-full ${
              value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {value || 'No Status'}
            </span>
          ),
          hideMobile: true
        },
        { 
          key: 'machine_id', 
          label: 'Actions',
          render: (_: any, row: Machine) => (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditMachine(row);
              }}
              className="bg-[#2E523A] hover:bg-[#3b6b4c] text-white px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-all duration-200 focus:outline-none"
            >
              Edit
            </button>
          )
        }
      ];

      // Paginate machines data
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedMachines = filteredMachines.slice(startIndex, endIndex);

      return (
        <div>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              ❌ {error}
              <button 
                onClick={() => setError(null)}
                className="float-right text-red-700 hover:text-red-900"
              >
                ×
              </button>
            </div>
          )}
          {loading && (
            <div className="text-center py-8 text-gray-500">
              🔄 Loading machines...
            </div>
          )}
          <Table 
            columns={columns} 
            data={paginatedMachines} 
            emptyMessage="No machines found. Click 'Add Machine' to create one."
            pagination={{
              currentPage,
              pageSize,
              totalItems: filteredMachines.length,
              onPageChange: setCurrentPage,
              onPageSizeChange: handlePageSizeChange
            }}
          />
        </div>
      );
    } else if (activeTab === 'Waste Container') {
      const columns = [
        { key: 'wasteContainerNo', label: 'Waste Container No' },
        { key: 'area', label: 'Area' },
        { key: 'status', label: 'Status' },
        { key: 'startDate', label: 'Start Date', hideMobile: true }
      ];
      
      // Paginate waste container data
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = wasteContainerData.slice(startIndex, endIndex);
      
      return (
        <Table 
          columns={columns} 
          data={paginatedData} 
          emptyMessage="No waste container data available"
          pagination={{
            currentPage,
            pageSize,
            totalItems: wasteContainerData.length,
            onPageChange: setCurrentPage,
            onPageSizeChange: handlePageSizeChange
          }}
        />
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Sub Navigation Bar */}
      <div className="w-full bg-white shadow-sm">
        <div style={{ height: 'calc(var(--header-height, 72px) + 8px)' }} aria-hidden />
        <div
          className="subheader sticky top-[60px] z-30 w-full bg-white px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 shadow-sm"
          style={{ top: 'calc(var(--header-height, 72px) + 8px)' }}
        >
          <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-2 sm:gap-3 md:gap-4">
            {/* Tabs - with relative positioning for dropdown overlay */}
            <div className="relative">
              <Tabs tabs={tabsConfig} activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            {/* Right side buttons - always horizontal */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0 ml-auto">
              {activeTab !== 'Machines' && (
                <div className="relative flex-shrink-0">
                  <select
                    value={selectedMachine}
                    onChange={(e) => setSelectedMachine(e.target.value)}
                    className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 appearance-none pr-6 sm:pr-8 cursor-pointer bg-white border border-gray-200 whitespace-nowrap"
                  >
                    {sibolMachines.slice(0, 100).map((machine) => (
                      <option key={machine} value={machine} className="bg-white text-gray-900">
                        {machine}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-1 sm:pr-2 pointer-events-none">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              )}

              <button className="flex items-center justify-center gap-1 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#AFC8AD]/40 flex-shrink-0 whitespace-nowrap">
                 <span className="hidden sm:inline">Filter by</span>
                 <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                 </svg>
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-2 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <div className="max-w-screen-2xl mx-auto">
          {/* Search Bar and Action Buttons */}
          <div className="mb-4 sm:mb-6 flex items-center justify-between gap-2 sm:gap-3 md:gap-4">
            <div className="min-w-0 flex-1 max-w-xs sm:max-w-sm md:max-w-md">
              <SearchBar 
                value={searchTerm} 
                onChange={setSearchTerm}
              />
            </div>

            {/* Action Buttons - always horizontal */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0">
            <button 
              onClick={openAddForm}
              className="bg-[#2E523A] hover:bg-[#3b6b4c] text-white px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#AFC8AD]/40 whitespace-nowrap"
            >
              {activeTab === 'Chemical Additives' ? 'Add Chemical' : 'Add Machine'}
            </button>
            {activeTab !== 'Machines' && (
              <button className="flex items-center justify-center gap-1 px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#AFC8AD]/40 flex-shrink-0">
                 <span className="hidden sm:inline">Filter</span>
                 <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                 </svg>
               </button>
            )}
          </div>
        </div>

          {/* Data Table */}
          {renderTable()}
        </div>
      </div>

      {/* Add Machine Form Modal */}
      <FormModal
        isOpen={showAddForm}
        onClose={closeAddForm}
        title={`Add ${activeTab === 'Chemical Additives' ? 'Chemical' : 'Machine'}`}
        subtitle={`Fill out the form to add a new ${activeTab === 'Chemical Additives' ? 'chemical' : 'machine'}`}
        width="500px"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <FormField
            label="Area"
            name="area"
            type="select"
            value={formData.area}
            onChange={(e) => updateFormField('area', e.target.value)}
            options={(activeTab === 'Machines' ? areas : staticAreas.map((area, index) => ({ Area_id: index + 1, Area_Name: area }))).map((area) => ({
              value: area.Area_id.toString(),
              label: area.Area_Name
            }))}
            required
          />
          <FormField
            label="Start Date"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => updateFormField('startDate', e.target.value)}
            required
          />
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={closeAddForm}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-200 mr-3 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#2E523A] hover:bg-[#3b6b4c] text-white font-medium px-8 py-2.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#AFC8AD]/40 disabled:opacity-50"
            >
              {loading ? 'Creating...' : `Add ${activeTab === 'Chemical Additives' ? 'Chemical' : 'Machine'}`}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Edit Machine Form Modal */}
      {editingMachine && (
        <FormModal
          isOpen={showEditForm}
          onClose={() => {
            closeEditForm();
            setEditingMachine(null);
          }}
          title={`Edit Machine #${editingMachine.machine_id}`}
          subtitle="Update machine information"
          width="500px"
        >
          <form onSubmit={handleSubmitForm} className="space-y-4">
            <FormField
              label="Machine Name"
              name="name"
              type="text"
              value={formData.name || ''}
              onChange={(e) => updateFormField('name', e.target.value)}
              required
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
              required
            />
            <FormField
              label="Status"
              name="status"
              type="select"
              value={formData.status || ''}
              onChange={(e) => updateFormField('status', e.target.value)}
              options={[
                { value: '', label: 'No Status' },
                ...machineStatuses.map((status) => ({
                  value: status.Mach_status_id.toString(),
                  label: status.Status
                }))
              ]}
            />
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => {
                  closeEditForm();
                  setEditingMachine(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-200 mr-3 focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#2E523A] hover:bg-[#3b6b4c] text-white font-medium px-8 py-2.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#AFC8AD]/40 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Machine'}
              </button>
            </div>
          </form>
        </FormModal>
      )}
    </div>
  );
};

export default SibolMachinePage;
