import React, { useState, useEffect } from 'react';
import FormModal from '../common/FormModal';
import FormField from '../common/FormField';
import DatePicker from '../common/DatePicker';
import * as userService from '../../services/userService';
import * as maintenanceService from '../../services/maintenanceService';
import type { MaintenanceRemark, MaintenanceAttachment } from '../../types/maintenance';
import CustomScrollbar from '../common/CustomScrollbar';

// ✅ Import new separated components
import AttachmentsList from './attachments/AttachmentsList';
import AttachmentsViewer from './attachments/AttachmentsViewer';
import AttachmentsUpload from './attachments/AttachmentsUpload';
import RemarksForm from './remarks/RemarksForm'; // ✅ keep
// ❌ remove: import RemarksList from './remarks/RemarksList';

interface MaintenanceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  mode?: 'create' | 'assign' | 'pending' | 'completed';
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
  const [priorityOptions, setPriorityOptions] = useState<{ value: string; label: string }[]>([]);
  const [attachments, setAttachments] = useState<MaintenanceAttachment[]>([]);
  const [selectedAttachment, setSelectedAttachment] = useState<MaintenanceAttachment | null>(null);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [remarks, setRemarks] = useState<MaintenanceRemark[]>([]);
  const [loadingRemarks, setLoadingRemarks] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Load user data
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userData = JSON.parse(user);
          const accountId = userData.Account_id ?? userData.account_id;
          setCurrentUserId(accountId);

          if (mode === 'assign') {
            setFormData(prev => ({ ...prev, staffAccountId: '' }));
            (window as any).__currentStaffId = accountId;
          }
        } catch (err) {
          console.error('Error parsing user data:', err);
        }
      }

      // Fetch priorities
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

      // Set initial form data
      if (initialData) {
        setFormData({
          title: initialData.Title || '',
          issue: initialData.Details || '',
          priority: initialData.Priority || '',
          dueDate: initialData.Due_date ? new Date(initialData.Due_date).toISOString().split('T')[0] : '',
          files: [],
          staffAccountId: initialData.CreatedByName || 'Unknown',
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

      // Fetch operators for assign mode
      if (mode === 'assign') {
        userService.getOperators()
          .then((operators) => {
            const options = operators
              .filter(op => op.value && op.label)
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

      // Fetch attachments
      const requestId = initialData?.Request_Id || initialData?.request_id;
      if (requestId) {
        maintenanceService.getTicketAttachments(requestId)
          .then((data) => {
            setAttachments(data || []);
          })
          .catch((error) => {
            console.error('Error fetching attachments:', error);
            setAttachments([]);
          });
      } else {
        setAttachments([]);
      }

      // Fetch remarks for pending/completed mode
      if (requestId && (mode === 'pending' || mode === 'completed' || mode === 'assign')) {
        setLoadingRemarks(true);
        maintenanceService.getTicketRemarks(requestId)
          .then((data) => {
            setRemarks(data || []);
          })
          .catch((error) => {
            console.error('Error fetching remarks:', error);
            setRemarks([]);
          })
          .finally(() => {
            setLoadingRemarks(false);
          });
      } else {
        setRemarks([]);
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

  // ✅ New handler for remarks submission
  const handleRemarkSubmit = async (remarkText: string, files: File[]) => {
    try {
      const requestId = initialData?.Request_Id || initialData?.request_id;
      if (!requestId || !currentUserId) {
        throw new Error('Request ID or User ID not found');
      }

      // Add remark if there's text
      if (remarkText.trim()) {
        await maintenanceService.addRemark(
          requestId,
          remarkText,
          currentUserId,
          '' // Role can be fetched from localStorage if needed
        );
      }

      // Upload files if any
      if (files.length > 0) {
        await Promise.all(
          files.map((file: File) =>
            maintenanceService.uploadAttachment(requestId, currentUserId, file)
          )
        );
      }

      // Refresh remarks and attachments
      const updatedRemarks = await maintenanceService.getTicketRemarks(requestId);
      setRemarks(updatedRemarks);
      
      const updatedAttachments = await maintenanceService.getTicketAttachments(requestId);
      setAttachments(updatedAttachments || []);
    } catch (error: any) {
      console.error('Failed to add remark:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      files: [],
      staffAccountId: '',
      assignedTo: '',
      remarks: '',
    });
    onClose();
  };

  const handleDownloadAttachment = async () => {
    if (selectedAttachment?.File_path) {
      try {
        const response = await fetch(selectedAttachment.File_path);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = selectedAttachment.File_name || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download failed:', error);
        window.open(selectedAttachment.File_path, '_blank');
      }
    }
  };

  const noOpChange = () => {};
  const isCreateMode = mode === 'create';
  const isAssignMode = mode === 'assign';
  const isPendingMode = mode === 'pending';
  const isCompletedMode = mode === 'completed';
  const isViewMode = isPendingMode || isCompletedMode;

  const modalHeightClass = isViewMode
    ? 'h-[72vh] max-h-[72vh]'
    : 'h-[60vh] max-h-[60vh]';

  // ✅ Attachments block (reused in mobile + desktop, right side)
  const attachmentsContent = (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">Attachments</label>
      <AttachmentsList
        attachments={attachments}
        onView={(attachment) => {
          setSelectedAttachment(attachment);
          setShowAttachmentModal(true);
        }}
        isReadOnly={true}
        size="sm"
      />
    </div>
  );

  // ✅ Reuse the same content in mobile + desktop layouts (LEFT SIDE — no attachments here anymore)
  const leftDetailsContent = (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Issue Description</label>
        <textarea
          name="issue"
          value={formData.issue}
          disabled={true}
          rows={5}
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
        <div
          className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-semibold"
          style={{ color: '#E67E22' }}
        >
          {initialData?.Priority || '—'}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm">
          <span
            className="inline-block px-2 py-1 rounded text-white text-xs font-semibold"
            style={{ backgroundColor: '#355842' }}
          >
            {initialData?.Status || '—'}
          </span>
        </div>
      </div>

      <DatePicker
        label="Due Date"
        name="dueDate"
        value={formData.dueDate}
        onChange={noOpChange}
        disabled={true}
      />

      <FormField
        label="Assigned Operator"
        name="assignedOperator"
        type="text"
        value={initialData?.AssignedOperatorName || 'Unassigned'}
        onChange={noOpChange}
        disabled={true}
      />
    </div>
  );

  const remarksMessagesBody = loadingRemarks ? (
    <div className="text-center py-8">
      <p className="text-sm text-gray-500">Loading remarks...</p>
    </div>
  ) : remarks.length === 0 ? (
    <p className="text-sm text-gray-500 italic text-center py-8">No remarks yet</p>
  ) : (
    <div className="space-y-3">
      {remarks.map((remark) => (
        <div
          key={remark.Remark_Id}
          className={`flex ${remark.Created_by === currentUserId ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[75%] rounded-2xl px-4 py-2 ${
              remark.Created_by === currentUserId
                ? 'bg-[#355842] text-white rounded-br-sm'
                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
            }`}
          >
            <div className="flex items-baseline gap-2 mb-1">
              <span
                className={`text-xs font-semibold ${
                  remark.Created_by === currentUserId ? 'text-white' : 'text-gray-900'
                }`}
              >
                {remark.CreatedByName || 'Unknown'}
              </span>
              <span
                className={`text-xs ${
                  remark.Created_by === currentUserId ? 'text-white/70' : 'text-gray-500'
                }`}
              >
                {(() => {
                  const date = new Date(remark.Created_at);
                  const now = new Date();
                  const diff = now.getTime() - date.getTime();
                  const minutes = Math.floor(diff / 60000);
                  const hours = Math.floor(diff / 3600000);
                  const days = Math.floor(diff / 86400000);

                  if (minutes < 1) return 'Just now';
                  if (minutes < 60) return `${minutes}m ago`;
                  if (hours < 24) return `${hours}h ago`;
                  if (days < 7) return `${days}d ago`;
                  return date.toLocaleDateString();
                })()}
              </span>
            </div>
            <p className="text-sm whitespace-pre-wrap break-words">{remark.Remark_text}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        isCreateMode ? "Request Maintenance" :
        isAssignMode ? "Accept & Assign Maintenance" :
        isPendingMode ? "View Pending Maintenance" :
        isCompletedMode ? "View Completed Maintenance" :
        "Maintenance Details"
      }
      width={isViewMode ? '960px' : '720px'}
    >
      <div className={`flex flex-col ${modalHeightClass}`}>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {(formError || submitError) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex-shrink-0">
              {formError || submitError}
            </div>
          )}

          {isViewMode && initialData && (
            <div className="mb-6 pb-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xl font-bold text-[#2E523A] mb-3">
                    Request No: {initialData.Request_date 
                      ? `${new Date(initialData.Request_date).getFullYear()}${String(new Date(initialData.Request_date).getMonth() + 1).padStart(2, '0')}${initialData.Request_Id || initialData.request_id}`
                      : `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${initialData.Request_Id || initialData.request_id}`
                    }
                  </p>
                  <p className="text-base text-gray-900">
                    {initialData.Title}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-xs text-gray-500 mb-1">Request Date</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {initialData.Request_date 
                      ? new Date(initialData.Request_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 min-h-0">
            {isViewMode ? (
              <div className="h-full min-h-0">
                {/* ✅ MOBILE: single scroll, stacked; attachments ABOVE remarks history */}
                <CustomScrollbar className="h-full min-h-0 pr-2 md:hidden" maxHeight="max-h-full">
                  <div className="space-y-6">
                    <div>{leftDetailsContent}</div>

                    {/* ✅ Attachments moved here (right-side equivalent on mobile) */}
                    <div>{attachmentsContent}</div>

                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm flex-shrink-0" style={{ color: '#2E523A' }}>
                        Remarks History
                      </h3>

                      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white flex flex-col">
                        {/* ✅ smaller messages so "Add Remark" stays visible */}
                        <div className="flex flex-col h-[32vh] min-h-[240px] max-h-[360px]">
                          <div className="flex-1 min-h-0 overflow-hidden">
                            <CustomScrollbar
                              className="h-full min-h-0 overflow-y-auto overscroll-contain"
                              maxHeight="max-h-full"
                            >
                              <div className="p-3">{remarksMessagesBody}</div>
                            </CustomScrollbar>
                          </div>

                        {!isCompletedMode && (
                          <div className="p-3 bg-white border-t border-gray-200 flex-shrink-0">
                            <RemarksForm onSubmit={handleRemarkSubmit} disabled={false} />
                          </div>
                        )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CustomScrollbar>

                {/* ✅ DESKTOP: two columns */}
                <div className="hidden md:grid md:grid-cols-2 gap-6 h-full min-h-0">
                  {/* LEFT COLUMN */}
                  <div className="min-h-0 h-full overflow-hidden">
                    <CustomScrollbar className="h-full min-h-0 pr-2 overflow-x-hidden" maxHeight="max-h-full">
                      {leftDetailsContent}
                    </CustomScrollbar>
                  </div>

                  {/* RIGHT COLUMN (NOT scrollable as a whole) */}
                  <div className="min-h-0 h-full overflow-hidden">
                    <div className="min-h-0 h-full flex flex-col border-l pl-4 gap-4">
                      {/* ✅ Attachments moved to right, above remarks history */}
                      {attachmentsContent}

                      <h3 className="font-semibold text-sm flex-shrink-0" style={{ color: '#2E523A' }}>
                        Remarks History
                      </h3>

                      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white flex flex-col">
                        {/* ✅ smaller messages so input is visible */}
                        <div className="flex-1 min-h-0 flex flex-col">
                          <div className="flex-1 min-h-0 overflow-hidden">
                            <CustomScrollbar className="h-full min-h-0 overflow-y-auto" maxHeight="max-h-full">
                              <div className="p-3">{remarksMessagesBody}</div>
                            </CustomScrollbar>
                          </div>

                        {!isCompletedMode && (
                          <div className="p-3 bg-white border-t border-gray-200 flex-shrink-0">
                            <RemarksForm onSubmit={handleRemarkSubmit} disabled={false} />
                          </div>
                        )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // ✅ Prevent CustomScrollbar default max-h-96 from constraining height
              <CustomScrollbar className="h-full min-h-0 overflow-y-auto pr-2" maxHeight="max-h-full">
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

                      <AttachmentsUpload
                        files={formData.files}
                        onChange={handleFileChange}
                        onRemove={removeFile}
                        label="Attachments (Optional)"
                        required={false}
                      />
                    </div>
                  ) : isAssignMode ? (
                    <div className="space-y-6">
                      <FormField
                        label="Requested By"
                        name="staffAccountId"
                        type="text"
                        value={formData.staffAccountId}
                        onChange={noOpChange}
                        placeholder="Loading..."
                        disabled
                      />

                      <FormField
                        label="Title"
                        name="title"
                        type="text"
                        value={formData.title}
                        onChange={noOpChange}
                        placeholder="Loading..."
                        disabled
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Issue Description
                        </label>
                        <textarea
                          name="issue"
                          value={formData.issue}
                          onChange={noOpChange}
                          rows={5}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                        />
                      </div>

                      <FormField
                        label="Priority (Editable)"
                        name="priority"
                        type="select"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        options={priorityOptions}
                      />

                      <DatePicker
                        label="Due Date (Editable)"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Attachments
                        </label>
                        <AttachmentsList
                          attachments={attachments}
                          onView={(attachment) => {
                            setSelectedAttachment(attachment);
                            setShowAttachmentModal(true);
                          }}
                          isReadOnly={true}
                        />
                      </div>

                      <FormField
                        label="Assign To *"
                        name="assignedTo"
                        type="select"
                        value={formData.assignedTo}
                        onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                        options={assignedOptions}
                        required
                      />
                    </div>
                  ) : null}
                </div>
              </CustomScrollbar>
            )}
          </div>

          <div className="flex justify-center gap-3 pt-4 border-t mt-6 flex-shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {isViewMode ? "Close" : "Cancel"}
            </button>
            
            {!isViewMode && (
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

      <AttachmentsViewer
        attachment={selectedAttachment}
        isOpen={showAttachmentModal}
        onClose={() => setShowAttachmentModal(false)}
        onDownload={handleDownloadAttachment}
      />
    </FormModal>
  );
};

export default MaintenanceForm;
