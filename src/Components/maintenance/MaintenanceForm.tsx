import React, { useState, useEffect } from 'react';
import FormModal from '../common/FormModal';
import FormField from '../common/FormField';
import DatePicker from '../common/DatePicker';
import * as userService from '../../services/userService';
import * as maintenanceService from '../../services/maintenanceService';
import CustomScrollbar from '../common/CustomScrollbar';

interface MaintenanceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  mode?: 'create' | 'assign' | 'pending';
  initialData?: any;
  submitError?: string | null;
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  mode = 'create',
  initialData,
  submitError
}) => {
  const [formData, setFormData] = useState({
    title: '',
    issue: '',
    priority: '',
    dueDate: '',
    files: [] as File[],
    staffAccountId: '',
    assignedTo: '',
    remarks: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [assignedOptions, setAssignedOptions] = useState<{ value: string; label: string }[]>([]);
  const [priorityOptions, setPriorityOptions] = useState<{ value: string; label: string }[]>([]); // ✅ Add state

  useEffect(() => {
    if (isOpen) {
      // ✅ Fetch priorities from database
      maintenanceService.getPriorities()
        .then((priorities) => {
          const options = priorities.map((p) => ({
            value: p.Priority,
            label: p.Priority,
          }));
          setPriorityOptions(options);
        })
        .catch((error) => {
          console.error('Error fetching priorities:', error);
          setPriorityOptions([
            { value: 'Critical', label: 'Critical' },
            { value: 'Urgent', label: 'Urgent' },
            { value: 'Mild', label: 'Mild' },
          ]);
        });

      if (mode === 'assign') {
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

      if (initialData) {
        setFormData({
          title: initialData.Title || '',
          issue: initialData.Details || '',
          priority: initialData.Priority || '',
          dueDate: initialData.Due_date ? new Date(initialData.Due_date).toISOString().split('T')[0] : '',
          files: [],
          staffAccountId: initialData.CreatedByName || 'Unknown', // ✅ Changed to display name
          assignedTo: initialData.Assigned_to ? String(initialData.Assigned_to) : '',
          remarks: '',
        });
      } else {
        setFormData({
          title: '',
          issue: '',
          priority: '',
          dueDate: '',
          files: [],
          staffAccountId: formData.staffAccountId,
          assignedTo: '',
          remarks: '',
        });
      }

      if (mode === 'assign') {
        userService.getOperators()
          .then((operators) => {
            const options = operators
              .filter(op => op.value && op.label) // ✅ Filter out invalid entries
              .map((operator) => ({
                value: String(operator.value),
                label: operator.label,
              }));
            setAssignedOptions(options);
          })
          .catch((error) => {
            console.error('Error fetching operators:', error);
            setFormError('Failed to load operators');
          });
      }
    }
  }, [isOpen, initialData, mode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({ 
        ...prev, 
        files: [...prev.files, ...newFiles] 
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (mode === 'create') {
      if (!formData.title.trim() || !formData.issue.trim() || !formData.priority || !formData.dueDate) {
        setFormError('Please fill in all required fields');
        return;
      }
    } else if (mode === 'assign') {
      if (!formData.assignedTo) {
        setFormError('Please assign an operator');
        return;
      }
    }

    onSubmit(formData);
  };

  const handleClose = () => {
    setFormError(null);
    setFormData({
      title: '',
      issue: '',
      priority: '',
      dueDate: '',
      files: [], // CHANGED
      staffAccountId: '',
      assignedTo: '',
      remarks: '',
    });
    onClose();
  };

  const noOpChange = () => {};

  const isCreateMode = mode === 'create';
  const isAssignMode = mode === 'assign';
  const isPendingMode = mode === 'pending';

  return (
    <FormModal isOpen={isOpen} onClose={handleClose} title={
      isCreateMode ? "Request Maintenance" :
      isAssignMode ? "Accept & Assign Maintenance" :
      isPendingMode ? "View Pending Maintenance" :
      "Maintenance Details"
    }>
      <div className="flex flex-col h-full">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {(formError || submitError) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm flex-shrink-0">
              {formError || submitError}
            </div>
          )}

          <CustomScrollbar className="flex-1 overflow-y-auto pr-2">
            <div className="pb-4">
              {isCreateMode ? (
                <div className="space-y-4">
                  <FormField
                    label="Title *"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Broken conveyor belt"
                    required
                  />

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Issue Description *
                    </label>
                    <textarea
                      name="issue"
                      value={formData.issue}
                      onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                      placeholder="Describe the issue in detail..."
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#355842] focus:border-transparent"
                    />
                  </div>

                  <FormField
                    label="Priority"
                    name="priority"
                    type="select"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    options={priorityOptions}
                  />

                  <DatePicker
                    label="Due Date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Attachments (Optional)
                    </label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*,.pdf,.doc,.docx"
                      multiple
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#355842] focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#355842] file:text-white hover:file:bg-[#2e4a36]"
                    />
                    {formData.files.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {formData.files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-600 truncate">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-600 hover:text-red-800 ml-2 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : isAssignMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <FormField
                      label="Requested By" // ✅ Changed label
                      name="staffAccountId"
                      type="text"
                      value={formData.staffAccountId}
                      onChange={noOpChange}
                      placeholder="Loading..."
                      disabled={true}
                    />

                    <FormField
                      label="Assigned to *"
                      name="assignedTo"
                      type="select"
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                      options={assignedOptions}
                      required
                    />

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Issue Description
                      </label>
                      <textarea
                        name="issue"
                        value={formData.issue}
                        onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                        placeholder="Describe the issue..."
                        rows={5}
                        disabled={true}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>

                    <FormField
                      label="Priority (editable)"
                      name="priority"
                      type="select"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      options={priorityOptions}
                    />
                  </div>

                  <div className="space-y-4">
                    <DatePicker
                      label="Due Date (editable)"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />

                    {initialData?.Attachment && (
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Attachment
                        </label>
                        <a
                          href={initialData.Attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 text-sm text-white bg-[#355842] rounded-md hover:bg-[#2e4a36]"
                        >
                          View Attachment
                        </a>
                        <p className="text-xs text-gray-500 break-all">{initialData.Attachment}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : isPendingMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-semibold" style={{ color: '#E67E22' }}>
                        {initialData?.Priority || "—"}
                      </div>
                    </div>

                    <FormField
                      label="Assigned Operator"
                      name="assignedOperator"
                      type="text"
                      value={initialData?.AssignedOperatorName || "Unassigned"}
                      onChange={noOpChange}
                      disabled={true}
                    />

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Issue Description
                      </label>
                      <textarea
                        name="issue"
                        value={formData.issue}
                        disabled={true}
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <DatePicker
                      label="Due Date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={noOpChange}
                      disabled={true}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm">
                        <span className="inline-block px-2 py-1 rounded text-white text-xs font-semibold" style={{ backgroundColor: '#355842' }}>
                          {initialData?.Status || "—"}
                        </span>
                      </div>
                    </div>

                    {initialData?.Attachment && (
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Attachment
                        </label>
                        <a
                          href={initialData.Attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 text-sm text-white bg-[#355842] rounded-md hover:bg-[#2e4a36]"
                        >
                          View Attachment
                        </a>
                        <p className="text-xs text-gray-500 break-all">{initialData.Attachment}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {isPendingMode && (
                <div className="border-t pt-4 space-y-3">
                  <h3 className="font-semibold text-sm" style={{ color: '#2E523A' }}>Remarks</h3>
                  
                  {initialData?.Remarks && (
                    <div className="p-3 rounded bg-blue-50 border border-blue-200">
                      <p className="text-xs text-gray-600 mb-1">Previous Remarks:</p>
                      <p className="text-sm text-gray-800">{initialData.Remarks}</p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Add Remarks
                    </label>
                    <textarea
                      name="remarks"
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      placeholder="Add your remarks about the maintenance..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#355842] focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
          </CustomScrollbar>

          <div className="flex justify-center gap-3 pt-4 border-t mt-6 flex-shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {isPendingMode ? "Close" : "Cancel"}
            </button>
            
            {isPendingMode ? (
              <button
                type="submit"
                className="px-6 py-2 text-sm text-white rounded-md hover:opacity-90"
                style={{ backgroundColor: '#355842' }}
              >
                Add Remarks
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2 text-sm text-white rounded-md hover:opacity-90"
                style={{ backgroundColor: '#355842' }}
              >
                {isCreateMode ? "Submit Request" : isAssignMode ? "Accept & Assign" : "Submit"}
              </button>
            )}
          </div>
        </form>
      </div>
    </FormModal>
  );
};

export default MaintenanceForm;
