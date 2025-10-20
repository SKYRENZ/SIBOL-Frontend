import React, { useState } from 'react';
import Header from '../Components/Header';
import MaintenanceTable from '../Components/MaintenanceTable';
import MaintenanceForm from '../Components/MaintenanceForm';

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
  const tabs = ['Request Maintenance', 'Pending Maintenance', 'Complete Maintenance'];

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

      <div className="w-full bg-white">
        <div style={{ height: '60px' }} aria-hidden />
        <div className="subheader sticky top-[60px] z-30 w-full border-b-2 border-[color:var(--sibol-green)]/20 bg-white">
          <div className="max-w-screen-2xl mx-auto flex items-center justify-between py-2 px-6">
            <nav className="flex items-center gap-6" role="tablist" aria-label="Maintenance tabs">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-base px-4 py-2 font-medium bg-transparent appearance-none focus:outline-none focus:ring-0 shadow-none transition-transform duration-150 transform hover:scale-105 hover:-translate-y-1 ${
                    activeTab === tab
                      ? 'text-[color:var(--sibol-green)] font-semibold underline underline-offset-4'
                      : 'text-[color:var(--sibol-green)]/70 hover:font-semibold hover:text-[color:var(--sibol-green)]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              {activeTab === 'Request Maintenance' && (
                <button onClick={handleRequestForm} className="btn btn-primary">Request Maintenance</button>
              )}
              <button className="btn btn-outline" onClick={() => setShowFilterModal(true)}>Filter by
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-opacity-20 sm:text-sm"
              style={{ 
                '--tw-ring-color': 'rgba(135, 169, 144, 0.2)',
                '--tw-border-opacity': '1'
              } as React.CSSProperties}
              onFocus={(e) => {
                e.target.style.borderColor = '#a7b5a9';
                e.target.style.boxShadow = '0 0 0 3px rgba(135, 169, 144, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Data Table */}
        <MaintenanceTable 
          activeTab={activeTab}
          searchTerm={searchTerm}
          onRowClick={handleRowClick}
        />
      </div>

      {/* Request Maintenance Form Modal */}
      <MaintenanceForm 
        isOpen={showRequestForm}
        onClose={() => setShowRequestForm(false)}
        onSubmit={handleSubmitRequest}
      />

      {/* Row Click Modal */}
      {showRowModal && selectedRow && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-5 mx-auto p-4 border w-9/12 max-w-5xl shadow-lg rounded-xl bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#2E523A' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h3 className="text-xl font-bold" style={{ color: '#2E523A' }}>
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
                <span className="font-bold" style={{ color: '#2E523A' }}>Request no. {selectedRow.requestNumber}</span>
                <span className="text-gray-500">Request date: {selectedRow.requestDate}</span>
              </div>

              {activeTab === 'Pending Maintenance' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold mb-3" style={{ color: '#2E523A' }}>Assigned to</label>
                      <input
                        type="text"
                        value="Justine Bryan M. Peralta"
                        className="w-full px-4 py-4 border rounded-lg bg-white text-lg"
                        style={{ borderColor: '#2E523A' }}
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-3" style={{ color: '#2E523A' }}>Contact no.</label>
                      <span className="text-gray-500 text-lg">09394337048</span>
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-3" style={{ color: '#2E523A' }}>Issue</label>
                      <textarea
                        value="The sensor in the anaerobic digestion chamber is not functioning. It has stopped sending data since yesterday."
                        className="w-full px-4 py-4 border rounded-lg bg-white text-lg"
                        style={{ borderColor: '#2E523A' }}
                        rows={4}
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-3" style={{ color: '#2E523A' }}>Remarks: Justine | 10/08/25 | 10:00:00 AM</label>
                      <div className="relative">
                        <textarea
                          value="Sensor for anaerobic process is currently not functioning. Needs immediate checking and repair."
                          className="w-full px-4 py-4 border rounded-lg bg-white text-lg pr-12"
                          style={{ borderColor: '#2E523A' }}
                          rows={3}
                          readOnly
                        />
                        <svg className="absolute right-4 top-4 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#2E523A' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold mb-3" style={{ color: '#2E523A' }}>Due Date</label>
                      <div className="relative">
                        <input
                          type="date"
                          className="w-full px-4 py-4 border rounded-lg bg-white text-lg pr-12"
                          style={{ borderColor: '#2E523A' }}
                        />
                        <svg className="absolute right-4 top-4 w-6 h-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#2E523A' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-3" style={{ color: '#2E523A' }}>Attached Files</label>
                      <div className="border-2 border-dashed rounded-lg p-8 text-center" style={{ borderColor: '#2E523A' }}>
                        <svg className="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#2E523A' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-lg mb-2" style={{ color: '#2E523A' }}>Click to Upload or drag & drop file</p>
                        <p className="text-gray-500 text-sm mb-4">maximum file size 10MB</p>
                        
                        {/* File Entry */}
                        <div className="flex items-center justify-center space-x-3 bg-gray-50 rounded-lg p-3">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#2E523A' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-lg" style={{ color: '#2E523A' }}>Prototype of SIBOL.jpeg</span>
                          <span className="text-gray-500">10MB</span>
                          <button className="text-red-500 hover:text-red-700 ml-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          className="w-full px-4 py-4 border rounded-lg bg-white text-lg pr-12"
                          style={{ borderColor: '#2E523A' }}
                        />
                        <svg className="absolute right-4 top-4 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#2E523A' }}>
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
                <div className="mt-12 flex justify-center gap-8">
                  <button 
                    className="px-12 py-4 text-white rounded-lg font-medium transition-colors duration-200 text-lg"
                    style={{ backgroundColor: '#6B7280' }}
                  >
                    Renew Request
                  </button>
                  <button 
                    className="px-12 py-4 text-white rounded-lg font-medium transition-colors duration-200 text-lg"
                    style={{ backgroundColor: '#2E523A' }}
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
