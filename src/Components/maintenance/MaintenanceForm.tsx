import React, { useState, useEffect } from 'react';
import FormModal from '../common/FormModal';

interface MaintenanceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  mode?: 'create' | 'assign';
  initialData?: any;
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  mode = 'create',
  initialData 
}) => {
  const [formData, setFormData] = useState({
    assignedTo: '',
    issue: '',
    priority: '',
    dueDate: '',
    file: null as File | null,
    staffAccountId: '',
  });

  // Auto-fetch staff account ID from localStorage
  useEffect(() => {
    if (isOpen && mode === 'assign') {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        const accountId = userData.Account_id ?? userData.account_id;
        setFormData(prev => ({
          ...prev,
          staffAccountId: String(accountId || ''),
        }));
      }
    }
  }, [isOpen, mode]);

  // Populate form with ticket details
  useEffect(() => {
    if (initialData && mode === 'assign') {
      setFormData(prev => ({
        ...prev,
        issue: initialData.Details || '',
        priority: initialData.Priority_Id || '',
        dueDate: initialData.Due_date ? initialData.Due_date.split('T')[0] : '',
      }));
    }
  }, [initialData, mode]);

  const assignedOptions = [
    { value: '3', label: 'Justine Bryan M. Peralta' },
    { value: '4', label: 'Mark Johnson' },
    { value: '5', label: 'Karl Smith' },
    { value: '6', label: 'Sarah Wilson' }
  ];
  
  const priorityOptions = [
    { value: 'Urgent', label: 'Urgent' },
    { value: 'Critical', label: 'Critical' },
    { value: 'Mild', label: 'Mild' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'assign' && !formData.staffAccountId.trim()) {
      alert('Staff Account ID is required');
      return;
    }
    onSubmit(formData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  if (!isOpen) return null;

  const requestNumber = initialData?.Request_Id || Math.floor(Math.random() * 100000) + 100000;
  const requestDate = initialData?.Request_date 
    ? new Date(initialData.Request_date).toLocaleDateString() 
    : new Date().toLocaleDateString();
  const title = initialData?.Title || '';
  const isAssignMode = mode === 'assign';

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isAssignMode ? "View Request & Accept" : "Request Maintenance"}
      subtitle={isAssignMode ? "Review details and assign to operator" : "Fill up the forms for request maintenance"}
      width="900px"
    >
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <div>
          <span className="font-bold text-lg" style={{ color: '#2E523A' }}>Request no. {requestNumber}</span>
          <p className="text-gray-600 text-sm mt-1">{title}</p>
        </div>
        <span className="text-gray-500 text-sm">Request date: {requestDate}</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left */}
          <div className="space-y-4">
            {isAssignMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Staff Account ID</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#355842] focus:outline-none bg-gray-50"
                  value={formData.staffAccountId}
                  disabled
                  placeholder="Loading..."
                />
                <p className="text-xs text-gray-500 mt-1">Auto-filled from your account</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned to {isAssignMode && '*'}
              </label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#355842] focus:outline-none"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                disabled={!isAssignMode}
              >
                <option value="">Select operator</option>
                {assignedOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description</label>
              <textarea
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#355842] focus:outline-none"
                rows={5}
                value={formData.issue}
                onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                placeholder="Describe the issue..."
                disabled={isAssignMode}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority {isAssignMode && '(editable)'}
              </label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#355842] focus:outline-none"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                disabled={!isAssignMode}
              >
                <option value="">Select priority</option>
                {priorityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date {isAssignMode && '(editable)'}
              </label>
              <input
                type="date"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#355842] focus:outline-none"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                disabled={!isAssignMode}
              />
            </div>

            {!isAssignMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
                <div className="border-2 border-dashed rounded-xl p-8 text-center bg-transparent" style={{ borderColor: '#2E523A' }}>
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#2E523A' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mt-2" style={{ color: '#2E523A' }}>Click to Upload or drag & drop file</p>
                  <p className="text-gray-500 text-sm">maximum file size 10MB</p>
                  <input type="file" onChange={handleFileUpload} className="hidden" id="file-upload" />
                  <label htmlFor="file-upload" className="mt-2 inline-block cursor-pointer">
                    <span style={{ color: '#2E523A' }}>Choose file</span>
                  </label>
                  {formData.file && (
                    <div className="mt-2">
                      <p style={{ color: '#2E523A' }}>{formData.file.name}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-3 pt-4 border-t mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-[#355842] text-white text-sm rounded-md hover:bg-[#2e4a36]"
          >
            {isAssignMode ? "Accept & Assign" : "Submit Request"}
          </button>
        </div>
      </form>
    </FormModal>
  );
};

export default MaintenanceForm;
