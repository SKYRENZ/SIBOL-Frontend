import React, { useState, useEffect } from 'react';
import FormModal from '../common/FormModal';
import FormField from '../common/FormField';
import * as userService from '../../services/userService'; // Import the user service
import CustomScrollbar from '../common/CustomScrollbar'; // Import the scrollbar component

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
    file: null as File | null,
    staffAccountId: '',
    assignedTo: '',
    remarks: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [assignedOptions, setAssignedOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    // This effect runs when the modal opens or the mode changes.
    if (isOpen) {
      // Set the staff account ID when in 'assign' mode
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

        // Fetch the list of operators for the dropdown
        const fetchOperators = async () => {
          try {
            const operators = await userService.getOperators();
            // Add a default, non-selectable option at the beginning
            const optionsWithDefault = [{ value: '', label: 'Select an option' }, ...operators];
            setAssignedOptions(optionsWithDefault);
          } catch (error) {
            console.error("Failed to fetch operators", error);
            setFormError("Could not load the list of operators.");
          }
        };
        fetchOperators();
      }
    }
  }, [isOpen, mode]);

  useEffect(() => {
    if (initialData && (mode === 'assign' || mode === 'pending')) {
      setFormData(prev => ({
        ...prev,
        issue: initialData.Details || '',
        priority: initialData.Priority || '', // Use the Priority string
        dueDate: initialData.Due_date ? initialData.Due_date.split('T')[0] : '',
        remarks: initialData.Remarks || '',
      }));
    }
  }, [initialData, mode]);

  const priorityOptions = [
    { value: 'Urgent', label: 'Urgent' },
    { value: 'Critical', label: 'Critical' },
    { value: 'Mild', label: 'Mild' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (mode === 'create') {
      if (!formData.title.trim()) {
        setFormError('Title is required');
        return;
      }
    } else if (mode === 'assign') {
      if (!formData.staffAccountId.trim()) {
        setFormError('Staff Account ID is required');
        return;
      }
    }

    onSubmit(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleClose = () => {
    setFormError(null);
    setFormData({
      title: '',
      issue: '',
      priority: '',
      dueDate: '',
      file: null,
      staffAccountId: '',
      assignedTo: '',
      remarks: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  const isCreateMode = mode === 'create';
  const isAssignMode = mode === 'assign';
  const isPendingMode = mode === 'pending';
  const requestNumber = initialData?.Request_Id || Math.floor(Math.random() * 100000) + 100000;
  const requestDate = initialData?.Request_date 
    ? new Date(initialData.Request_date).toLocaleDateString() 
    : new Date().toLocaleDateString();
  const title = initialData?.Title || '';

  const getTitleAndSubtitle = () => {
    if (isCreateMode) return { title: "Request Maintenance", subtitle: "Provide the details below." };
    if (isAssignMode) return { title: "View Request & Accept", subtitle: "Review details and assign to operator" };
    if (isPendingMode) return { title: "Pending Maintenance", subtitle: "Review details and manage maintenance request" };
    return { title: "Maintenance", subtitle: "" };
  };

  const { title: modalTitle, subtitle } = getTitleAndSubtitle();

  // Empty handler for disabled fields
  const noOpChange = () => {};

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title={modalTitle}
      subtitle={subtitle}
      width={isCreateMode ? "600px" : "900px"}
    >
      {/* This container will use flexbox to manage layout */}
      <div className="flex flex-col h-full">
        {(isAssignMode || isPendingMode) && (
          <div className="flex justify-between items-center mb-6 pb-4 border-b flex-shrink-0">
            <div>
              <span className="font-bold text-lg" style={{ color: '#2E523A' }}>Request no. {requestNumber}</span>
              <p className="text-gray-600 text-sm mt-1">{title}</p>
            </div>
            <span className="text-gray-500 text-sm">Request date: {requestDate}</span>
          </div>
        )}

        {/* This form will also use flexbox and contain the scrollable area */}
        <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-hidden w-full">
          {/* The CustomScrollbar will take up the available space and scroll when needed */}
          <CustomScrollbar className="flex-grow pr-2">
            <div className="space-y-4">
              {submitError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{submitError}</p>}
              {formError && <p className="text-sm text-red-600">{formError}</p>}

              {isCreateMode ? (
                <div className="space-y-3">
                  <FormField
                    label="Title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter request title"
                    required
                  />

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Details
                    </label>
                    <textarea
                      name="issue"
                      value={formData.issue}
                      onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                      placeholder="Describe the issue"
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

                  <FormField
                    label="Due Date"
                    name="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Attachment (Optional)
                    </label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*,.pdf,.doc,.docx"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#355842] focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#355842] file:text-white hover:file:bg-[#2e4a36]"
                    />
                    {formData.file && (
                      <p className="text-sm text-gray-600 mt-1">
                        Selected: {formData.file.name}
                      </p>
                    )}
                  </div>
                </div>
              ) : isAssignMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <FormField
                      label="Staff Account ID"
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
                    <FormField
                      label="Due Date (editable)"
                      name="dueDate"
                      type="date"
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
                    <FormField
                      label="Due Date"
                      name="dueDate"
                      type="date"
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

          {/* The buttons are pushed to the bottom */}
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
