import React, { useState } from 'react';
import Header from '../Components/Header';
import MaintenanceTable from '../Components/MaintenanceTable';
import MaintenanceForm from '../Components/MaintenanceForm';
import Tabs from '../Components/common/Tabs';
import SearchBar from '../Components/common/SearchBar';
import '../types/Household.css';

const MaintenancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Complete Maintenance');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showRowModal, setShowRowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [filterOptions] = useState({
    status: ['On-going', 'Completed', 'Canceled'],
    priority: ['Critical', 'Urgent', 'Mild'],
    requestDate: ['Weekly', 'Monthly', 'Yearly']
  });
  const tabsConfig = [
    { id: 'Request Maintenance', label: 'Request Maintenance' },
    { id: 'Pending Maintenance', label: 'Pending Maintenance' },
    { id: 'Complete Maintenance', label: 'Complete Maintenance' }
  ];

  const handleRequestForm = () => setShowRequestForm(true);
  const handleRowClick = (row: any) => {
    setSelectedRow(row);
    setShowRowModal(true);
  };
  const handleFilterToggle = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };
  const removeFilter = (filter: string) => {
    setSelectedFilters(prev => prev.filter(f => f !== filter));
  };
  const handleSubmitRequest = (formData: any) => {
    console.log('Request submitted:', formData);
    setShowRequestForm(false);
  };

  const getPriorityColor = (priority: string) => {
    const priorityOptions = [
      { value: 'Urgent', color: 'bg-red-500' },
      { value: 'Critical', color: 'bg-orange-500' },
      { value: 'Mild', color: 'bg-yellow-500' }
    ];
    const option = priorityOptions.find(opt => opt.value === priority);
    return option ? option.color : 'bg-gray-500';
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="w-full bg-white shadow-sm">
        <div style={{ height: '60px' }} aria-hidden />
        <div className="subheader sticky top-[60px] z-30 w-full bg-white px-6 py-4 shadow-sm">
          <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
            <Tabs tabs={tabsConfig} activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="flex items-center gap-3">
              {activeTab === 'Request Maintenance' && (
                <button 
                  onClick={handleRequestForm} 
                  className="bg-[#2E523A] hover:bg-[#3b6b4c] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#AFC8AD]/40"
                >
                  Request Maintenance
                </button>
              )}
              <button 
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#AFC8AD]/40"
                onClick={() => setShowFilterModal(true)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>Filter by</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-6 py-8">
        <div className="max-w-screen-2xl mx-auto">
          {/* Search Bar */}
          <div className="mb-6 flex justify-center">
            <div className="w-[70%]">
              <SearchBar value={searchTerm} onChange={setSearchTerm} />
            </div>
          </div>

          {/* Data Table */}
          <MaintenanceTable 
            activeTab={activeTab}
            searchTerm={searchTerm}
            onRowClick={handleRowClick}
          />
        </div>
      </div>

      {/* Request Maintenance Form Modal */}
      <MaintenanceForm 
        isOpen={showRequestForm}
        onClose={() => setShowRequestForm(false)}
        onSubmit={handleSubmitRequest}
      />

      {/* Row Click Modal */}
      {showRowModal && selectedRow && (
        <div className="fixed inset-0 bg-black bg-opacity-40 overflow-y-auto h-full w-full z-[100] flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full mx-auto p-6 border border-gray-200 shadow-xl rounded-xl bg-white">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#2E523A' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold" style={{ color: '#2E523A' }}>
                    {activeTab === 'Pending Maintenance' ? 'Pending Maintenance' : 'Complete Maintenance'}
                  </h3>
                </div>
                <div className="flex space-x-2">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full text-white ${getPriorityColor(selectedRow.priority)}`}>
                    {selectedRow.priority}
                  </span>
                  <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full text-white" style={{ backgroundColor: '#2E523A' }}>
                    {activeTab === 'Pending Maintenance' ? 'Pending' : 'Completed'}
                  </span>
                </div>
                <button
                  onClick={() => setShowRowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <span className="font-semibold text-sm" style={{ color: '#2E523A' }}>Request no. {selectedRow.requestNumber}</span>
                <span className="text-gray-500 text-sm">Request date: {selectedRow.requestDate}</span>
              </div>

              {activeTab === 'Pending Maintenance' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Assigned to</label>
                      <input
                        type="text"
                        value="Justine Bryan M. Peralta"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#AFC8AD]/40"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact no.</label>
                      <span className="text-gray-900 text-sm">09394337048</span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Issue</label>
                      <textarea
                        value="The sensor in the anaerobic digestion chamber is not functioning. It has stopped sending data since yesterday."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#AFC8AD]/40"
                        rows={4}
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Remarks: Justine | 10/08/25 | 10:00:00 AM</label>
                      <div className="relative">
                        <textarea
                          value="Sensor for anaerobic process is currently not functioning. Needs immediate checking and repair."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-[#AFC8AD]/40"
                          rows={3}
                          readOnly
                        />
                        <svg className="absolute right-3 top-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#2E523A' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                      <div className="relative">
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-[#AFC8AD]/40"
                        />
                        <svg className="absolute right-3 top-3 w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#2E523A' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Attached Files</label>
                      <div className="border-2 border-dashed rounded-lg p-6 text-center" style={{ borderColor: '#2E523A' }}>
                        <svg className="mx-auto h-12 w-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#2E523A' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm mb-1" style={{ color: '#2E523A' }}>Click to Upload or drag & drop file</p>
                        <p className="text-gray-500 text-xs mb-3">maximum file size 10MB</p>
                        
                        {/* File Entry */}
                        <div className="flex items-center justify-center space-x-2 bg-gray-50 rounded-lg p-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#2E523A' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm" style={{ color: '#2E523A' }}>Prototype of SIBOL.jpeg</span>
                          <span className="text-gray-500 text-xs">10MB</span>
                          <button className="text-red-500 hover:text-red-700">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Remarks..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-[#AFC8AD]/40"
                        />
                        <svg className="absolute right-3 top-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#2E523A' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: '#2E523A' }}>Assigned to</label>
                      <input
                        type="text"
                        value={selectedRow.assignedTo || 'Not assigned'}
                        className="w-full px-3 py-2 border rounded-md bg-white"
                        style={{ borderColor: '#2E523A' }}
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: '#2E523A' }}>Contact no.</label>
                      <span className="text-gray-500">{selectedRow.contactDetails || 'N/A'}</span>
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: '#2E523A' }}>Issue</label>
                      <textarea
                        value={selectedRow.details}
                        className="w-full px-3 py-2 border rounded-md bg-white"
                        style={{ borderColor: '#2E523A' }}
                        rows={4}
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: '#2E523A' }}>Remarks: Justine | 10/08/25 | 10:00:00 AM</label>
                      <textarea
                        value="Sensor for anaerobic process is currently not functioning. Needs immediate checking and repair."
                        className="w-full px-3 py-2 border rounded-md bg-white"
                        style={{ borderColor: '#2E523A' }}
                        rows={3}
                        readOnly
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: '#2E523A' }}>Remarks: Justine | 10/08/25 | 10:00:00 AM</label>
                      <textarea
                        value="Sensor for anaerobic process is currently not functioning. Needs immediate checking and repair."
                        className="w-full px-3 py-2 border rounded-md bg-white"
                        style={{ borderColor: '#2E523A' }}
                        rows={3}
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: '#2E523A' }}>Attached Files</label>
                      <div className="border-2 border-dashed rounded-lg p-4" style={{ borderColor: '#2E523A' }}>
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#2E523A' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span style={{ color: '#2E523A' }}>SIBOL Machine 1.png</span>
                          <span className="text-gray-500">10MB</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {activeTab === 'Pending Maintenance' && (
                <div className="mt-6 flex justify-center gap-4">
                  <button 
                    className="px-6 py-2.5 text-white rounded-lg font-medium transition-all duration-200 text-sm bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    Renew Request
                  </button>
                  <button 
                    className="px-6 py-2.5 text-white rounded-lg font-medium transition-all duration-200 text-sm bg-[#2E523A] hover:bg-[#3b6b4c] focus:outline-none focus:ring-2 focus:ring-[#AFC8AD]/40"
                  >
                    Complete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-96 max-w-md shadow-lg rounded-xl bg-white">
            <div className="mt-2">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#2E523A' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <h3 className="text-xl font-bold" style={{ color: '#2E523A' }}>Filter</h3>
                </div>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Selected Filters Display */}
              <div className="mb-6">
                <div className="w-full px-3 py-3 border rounded-lg bg-white min-h-[50px] flex flex-wrap gap-2 items-center">
                  {selectedFilters.length === 0 ? (
                    <span className="text-gray-400">Select filters...</span>
                  ) : (
                    selectedFilters.map((filter) => (
                      <span
                        key={filter}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                        style={{ backgroundColor: '#AFC8AD', color: '#2E523A' }}
                      >
                        {filter}
                        <button
                          onClick={() => removeFilter(filter)}
                          className="ml-2 w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: '#2E523A' }}
                        >
                          <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Filter Categories */}
              <div className="grid grid-cols-3 gap-6">
                {/* Status */}
                <div>
                  <h4 className="text-sm font-bold mb-3" style={{ color: '#2E523A' }}>Status</h4>
                  <div className="space-y-2">
                    {filterOptions.status.map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedFilters.includes(option)}
                          onChange={() => handleFilterToggle(option)}
                          className="w-4 h-4 mr-2 rounded border-2"
                          style={{ accentColor: '#2E523A' }}
                        />
                        <span className="text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <h4 className="text-sm font-bold mb-3" style={{ color: '#2E523A' }}>Priority</h4>
                  <div className="space-y-2">
                    {filterOptions.priority.map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedFilters.includes(option)}
                          onChange={() => handleFilterToggle(option)}
                          className="w-4 h-4 mr-2 rounded border-2"
                          style={{ accentColor: '#2E523A' }}
                        />
                        <span className="text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Request Date */}
                <div>
                  <h4 className="text-sm font-bold mb-3" style={{ color: '#2E523A' }}>Request date</h4>
                  <div className="space-y-2">
                    {filterOptions.requestDate.map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedFilters.includes(option)}
                          onChange={() => handleFilterToggle(option)}
                          className="w-4 h-4 mr-2 rounded border-2"
                          style={{ accentColor: '#2E523A' }}
                        />
                        <span className="text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;
