import React, { useState, useEffect, useMemo } from 'react';
import FormModal from '../common/FormModal';
import FormField from '../common/FormField';
import * as maintenanceService from '../../services/maintenanceService';

type Option = { value: string; label: string };

interface MaintenanceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  mode?: 'create' | 'assign' | 'pending';
  initialData?: any;
  highlightAssigned?: boolean;
  onAssignedChange?: () => void;
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  mode = 'create',
  initialData,
  highlightAssigned = false,
  onAssignedChange,
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
  const [priorityOptions, setPriorityOptions] = useState<Option[]>([]);
  const [assignedOptions, setAssignedOptions] = useState<Option[]>([]);
  const [assignedLoading, setAssignedLoading] = useState(false);
  const [assignedFetchError, setAssignedFetchError] = useState<string | null>(null);

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
    if (initialData && (mode === 'assign' || mode === 'pending')) {
      setFormData(prev => ({
        ...prev,
        issue: initialData.Details || initialData.details || '',
        priority:
          initialData.PriorityName ||
          initialData.Priority ||
          initialData.Priority_Id ||
          initialData.priority ||
          initialData.priority_id ||
          '',
        dueDate: initialData.Due_date
          ? initialData.Due_date.split('T')[0]
          : initialData.due_date
          ? initialData.due_date.split('T')[0]
          : '',
        remarks: initialData.Remarks || initialData.remarks || '',
        file: null,
      }));
    }
  }, [initialData, mode]);

  // Fetch priority options
  useEffect(() => {
    const fetchPriorities = async () => {
      try {
        const res = await fetch('/api/maintenance/priorities');
        if (res.ok) {
          const data = await res.json();
          setPriorityOptions(
            data.map((p: any) => ({ value: p.Priority, label: p.Priority }))
          );
        }
      } catch (err) {
        console.error('Failed to fetch priorities:', err);
        setPriorityOptions([
          { value: 'Urgent', label: 'Urgent' },
          { value: 'Critical', label: 'Critical' },
          { value: 'Mild', label: 'Mild' },
        ]);
      }
    };
    fetchPriorities();
  }, []);

  // Fetch assigned options (operators)
  useEffect(() => {
    if (!isOpen || mode !== 'assign') return;
    let active = true;

    const loadOperators = async () => {
      setAssignedLoading(true);
      setAssignedFetchError(null);

      try {
        const operators = await maintenanceService.listOperators();
        if (!active) return;
        setAssignedOptions(
          operators.map((operator) => ({
            value: String(operator.account_id),
            label: operator.display_name || `Operator #${operator.account_id}`,
          }))
        );
      } catch (err: any) {
        if (!active) return;
        console.error('Failed to load operators:', err);
        setAssignedOptions([]);
        setAssignedFetchError(err.message || 'Failed to load operators');
      } finally {
        if (active) setAssignedLoading(false);
      }
    };

    loadOperators();
    return () => {
      active = false;
    };
  }, [isOpen, mode]);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setAssignedOptions([]);
    setAssignedFetchError(null);
    setAssignedLoading(false);
    onClose();
  };

  const attachments = useMemo(() => {
    const value = initialData?.Attachment ?? initialData?.attachment;
    if (!value) return [] as string[];
    if (Array.isArray(value)) return value.filter((item) => !!item);
    if (typeof value === 'string') return value ? [value] : [];
    return [];
  }, [initialData]);

  const filesBaseUrl =
    ((import.meta as any).env?.VITE_FILES_BASE_URL as string | undefined) ??
    ((import.meta as any).env?.VITE_API_BASE_URL as string | undefined) ??
    "";

  const resolveAttachmentUrl = (path: string) => {
    if (!path) return '#';
    if (/^https?:\/\//i.test(path)) return path;
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return filesBaseUrl ? `${filesBaseUrl.replace(/\/$/, '')}${normalized}` : normalized;
  };

  const extractFileName = (path: string) => {
    if (!path) return 'Attachment';
    const parts = path.split(/[\\/]/);
    return parts[parts.length - 1] || path;
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

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title={modalTitle}
      subtitle={subtitle}
      width={isCreateMode ? "600px" : "900px"}
    >
      {(isAssignMode || isPendingMode) && (
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <div>
            <span className="font-bold text-lg" style={{ color: '#2E523A' }}>Request no. {requestNumber}</span>
            <p className="text-gray-600 text-sm mt-1">{title}</p>
          </div>
          <span className="text-gray-500 text-sm">Request date: {requestDate}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && <p className="text-sm text-red-600">{formError}</p>}

        {isCreateMode ? (
          // CREATE MODE
          <div className="space-y-3">
            <FormField
              label="Title"
              name="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter request title"
              required
              variant="transparent"
            />

            <FormField
              label="Details"
              name="issue"
              type="textarea"
              value={formData.issue}
              onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
              placeholder="Describe the issue"
              rows={4}
              variant="transparent"
            />

            <FormField
              label="Priority"
              name="priority"
              type="select"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              options={priorityOptions}
              variant="transparent"
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Attachment</label>
              <input
                type="file"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-600 border border-gray-300 rounded-md p-2 bg-white"
              />
              {formData.file && (
                <p className="text-xs text-gray-500">
                  Selected: <span className="font-medium">{formData.file.name}</span>
                </p>
              )}
            </div>

            <FormField
              label="Due Date"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              variant="transparent"
            />
          </div>
        ) : isAssignMode ? (
          // ASSIGN MODE
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left */}
            <div className="space-y-4">
              <FormField
                label="Staff Account ID"
                name="staffAccountId"
                type="text"
                value={formData.staffAccountId}
                placeholder="Loading..."
                variant="transparent"
                disabled={true}
              />

              {mode === 'assign' && (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Assigned to * *
                </label>
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={(e) => {
                    setFormData({ ...formData, assignedTo: e.target.value });
                    onAssignedChange?.();
                  }}
                  className={`w-full rounded-md border px-3 py-2 text-sm transition appearance-none focus:outline-none focus:ring-2 text-gray-800 placeholder:text-gray-500 bg-transparent ${
                    highlightAssigned
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-[#D8E3D8] focus:border-[#355842] focus:ring-[#355842]'
                  }`}
                  disabled={assignedLoading || (!assignedLoading && assignedOptions.length === 0 && !assignedFetchError)}
                >
                  <option value="">
                    {assignedLoading
                      ? 'Loading operators...'
                      : assignedOptions.length
                      ? 'Select Assigned to *'
                      : assignedFetchError
                      ? 'Failed to load operators'
                      : 'No operators available'}
                  </option>
                  {assignedOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {assignedFetchError && (
                  <p className="text-xs text-red-600">{assignedFetchError}</p>
                )}
                {highlightAssigned && !assignedLoading && (
                  <p className="text-xs text-red-600">Please select an operator.</p>
                )}
              </div>
              )}

              <FormField
                label="Issue Description"
                name="issue"
                type="textarea"
                value={formData.issue}
                onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                placeholder="Describe the issue..."
                rows={5}
                variant="transparent"
                disabled={true}
              />

              <FormField
                label="Priority (editable)"
                name="priority"
                type="select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                options={priorityOptions}
                variant="transparent"
              />
            </div>

            {/* Right */}
            <div className="space-y-4">
              <FormField
                label="Due Date (editable)"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                variant="transparent"
              />

              {attachments.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Attachments</label>
                  <div className="space-y-2">
                    {attachments.map((item) => (
                      <a
                        key={item}
                        href={resolveAttachmentUrl(item)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 border border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100 transition"
                      >
                        <svg
                          className="w-5 h-5 text-gray-500 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="text-sm text-[#355842] underline truncate">
                          {extractFileName(item)}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : isPendingMode ? (
          // PENDING MODE
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-semibold" style={{ color: '#E67E22' }}>
                  {formData.priority || "—"}
                </div>
              </div>

              <FormField
                label="Assigned Operator"
                name="assignedOperator"
                type="text"
                value={initialData?.Assigned_to || "Unassigned"}
                disabled={true}
                variant="transparent"
              />

              <FormField
                label="Issue Description"
                name="issue"
                type="textarea"
                value={formData.issue}
                disabled={true}
                rows={5}
                variant="transparent"
              />

              {attachments.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
                  <div className="rounded-md border border-gray-200 bg-gray-50 p-3 space-y-1">
                    {attachments.map((item) => (
                      <a
                        key={item}
                        href={resolveAttachmentUrl(item)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-[#355842] underline break-words"
                      >
                        {extractFileName(item)}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right */}
            <div className="space-y-4">
              <FormField
                label="Due Date"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                disabled={true}
                variant="transparent"
              />

              {/* Status Badge */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm">
                  <span className="inline-block px-2 py-1 rounded text-white text-xs font-semibold" style={{ backgroundColor: '#355842' }}>
                    {initialData?.Status || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Remarks Section - Only for Pending Mode */}
        {isPendingMode && (
          <div className="border-t pt-4 space-y-3">
            <h3 className="font-semibold text-sm" style={{ color: '#2E523A' }}>Remarks</h3>
            
            {/* Existing Remarks */}
            {initialData?.Remarks && (
              <div className="p-3 rounded bg-blue-50 border border-blue-200">
                <p className="text-xs text-gray-600 mb-1">Previous Remarks:</p>
                <p className="text-sm text-gray-800">{initialData.Remarks}</p>
              </div>
            )}

            {/* Add New Remarks */}
            <FormField
              label="Add Remarks"
              name="remarks"
              type="textarea"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Add your remarks about the maintenance..."
              rows={3}
              variant="transparent"
            />
          </div>
        )}

        <div className="flex justify-center gap-3 pt-4 border-t mt-6">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {isPendingMode ? "Close" : "Cancel"}
          </button>
          
          {isPendingMode ? (
            <>
              <button
                type="submit"
                className="px-6 py-2 text-sm text-white rounded-md hover:opacity-90"
                style={{ backgroundColor: '#355842' }}
              >
                Add Remarks
              </button>
            </>
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
    </FormModal>
  );
};

export default MaintenanceForm;
