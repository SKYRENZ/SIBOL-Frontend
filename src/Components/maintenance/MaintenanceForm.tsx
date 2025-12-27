import React, { useState, useEffect } from 'react';
import FormModal from '../common/FormModal';
import FormField from '../common/FormField';
import DatePicker from '../common/DatePicker';
import * as userService from '../../services/userService';
import * as maintenanceService from '../../services/maintenanceService';
import type { MaintenanceRemark } from '../../types/maintenance';
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
  const [attachments, setAttachments] = useState<any[]>([]);
  const [selectedAttachment, setSelectedAttachment] = useState<any>(null);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [remarks, setRemarks] = useState<MaintenanceRemark[]>([]); // ✅ NEW: Store remarks
  const [loadingRemarks, setLoadingRemarks] = useState(false); // ✅ NEW: Loading state
  const [currentUserRole, setCurrentUserRole] = useState<string>(''); // ✅ NEW: User role

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
            staffAccountId: '',
          }));
          
          (window as any).__currentStaffId = accountId;
        }
      }

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

      // ✅ FIX: Check if initialData exists before accessing Request_Id
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
        // ✅ Reset attachments if no initialData
        setAttachments([]);
      }

      // ✅ Load user role
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userData = JSON.parse(user);
          const roleId = userData.Roles || userData.role;
          
          // Map role IDs to names
          const roleMap: { [key: number]: string } = {
            1: 'Admin',
            2: 'Barangay_staff',
            3: 'Operator',
            4: 'Household'
          };
          
          setCurrentUserRole(roleMap[roleId] || 'Unknown');
        } catch (err) {
          console.error('Error parsing user data:', err);
        }
      }

      // ✅ Load remarks if in pending mode
      const requestIdForRemarks = initialData?.Request_Id || initialData?.request_id;
      if (requestIdForRemarks && (mode === 'pending' || mode === 'assign')) {
        setLoadingRemarks(true);
        maintenanceService.getTicketRemarks(requestIdForRemarks)
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
    } else if (mode === 'pending') {
      if (formData.remarks?.trim()) {
        try {
          const user = localStorage.getItem('user');
          if (!user) {
            setFormError('User not found');
            return;
          }
          
          const userData = JSON.parse(user);
          const accountId = userData.Account_id ?? userData.account_id;
          const requestId = initialData?.Request_Id || initialData?.request_id;

          if (!requestId) {
            setFormError('Request ID not found');
            return;
          }

          await maintenanceService.addRemark(
            requestId,
            formData.remarks,
            accountId,
            currentUserRole
          );

          const updatedRemarks = await maintenanceService.getTicketRemarks(requestId);
          setRemarks(updatedRemarks);
          
          setFormData(prev => ({ ...prev, remarks: '' }));

          // ✅ FIX: Replace Alert with alert
          alert('Remark added successfully');
          return;
        } catch (err: any) {
          setFormError(err.message || 'Failed to add remark');
          return;
        }
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

  const handleAttachmentClick = (attachment: any) => {
    setSelectedAttachment(attachment);
    setShowAttachmentModal(true);
  };

  const handleDownloadAttachment = async () => {
    if (selectedAttachment?.File_path) {
      try {
        // Fetch the file as a blob
        const response = await fetch(selectedAttachment.File_path);
        const blob = await response.blob();
        
        // Create a temporary URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // Create a temporary anchor element and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = selectedAttachment.File_name || 'download';
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download failed:', error);
        // Fallback to opening in new tab if download fails
        window.open(selectedAttachment.File_path, '_blank');
      }
    }
  };

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

          {/* ✅ Updated Request Info Header for Pending Mode */}
          {isPendingMode && initialData && (
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

                    {/* Attachments Section */}
                    {attachments.length > 0 && (
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Attachments
                        </label>
                        <div className="space-y-2">
                          {attachments.map((attachment) => (
                            <button
                              key={attachment.Attachment_Id}
                              type="button"
                              onClick={() => handleAttachmentClick(attachment)}
                              className="w-full text-left px-3 py-2 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-[#355842] truncate">
                                  {attachment.File_name}
                                </span>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </button>
                          ))}
                        </div>
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

                    {/* Attachments Section */}
                    {attachments.length > 0 && (
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Attachments
                        </label>
                        <div className="space-y-2">
                          {attachments.map((attachment) => (
                            <button
                              key={attachment.Attachment_Id}
                              type="button"
                              onClick={() => handleAttachmentClick(attachment)}
                              className="w-full text-left px-3 py-2 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-[#355842] truncate">
                                  {attachment.File_name}
                                </span>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {/* ✅ Remarks Section for Pending Mode */}
              {isPendingMode && (
                <div className="border-t pt-4 mt-4 space-y-3">
                  <h3 className="font-semibold text-sm" style={{ color: '#2E523A' }}>
                    Remarks History
                  </h3>
                  
                  {/* ✅ Display remarks */}
                  {loadingRemarks ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">Loading remarks...</p>
                    </div>
                  ) : remarks.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {remarks.map((remark) => (
                        <div
                          key={remark.Remark_Id}
                          className="p-3 rounded bg-gray-50 border border-gray-200"
                        >
                          <div className="flex items-start justify-between mb-1">
                            <p className="text-xs font-semibold text-gray-700">
                              {remark.CreatedByName || 'Unknown User'}
                              {remark.CreatedByRoleName && (
                                <span className="ml-2 text-xs text-gray-500">
                                  ({remark.CreatedByRoleName})
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(remark.Created_at).toLocaleString()}
                            </p>
                          </div>
                          <p className="text-sm text-gray-800">{remark.Remark_text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No remarks yet</p>
                  )}

                  {/* ✅ Add new remark */}
                  <div className="space-y-1 mt-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Add New Remark
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
            
            {isPendingMode && (
              <button
                type="submit"
                disabled={!formData.remarks?.trim()}
                className="px-6 py-2 text-sm text-white rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#355842' }}
              >
                Add Remark
              </button>
            )}
            
            {!isPendingMode && (
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

      {/* Attachment Preview Modal */}
      {showAttachmentModal && selectedAttachment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[300000]" onClick={() => setShowAttachmentModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 bg-gradient-to-r from-[#355842] to-[#4a7c5d] text-white flex items-center justify-between">
              <h3 className="font-semibold text-lg">{selectedAttachment.File_name}</h3>
              <button
                onClick={() => setShowAttachmentModal(false)}
                className="text-white hover:bg-white/10 transition-colors rounded-full w-8 h-8 flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {selectedAttachment.File_type?.startsWith('image/') ? (
                <img 
                  src={selectedAttachment.File_path} 
                  alt={selectedAttachment.File_name}
                  className="max-w-full h-auto mx-auto rounded"
                />
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600 mb-2">{selectedAttachment.File_name}</p>
                  <p className="text-sm text-gray-500">
                    {selectedAttachment.File_size ? `${(selectedAttachment.File_size / 1024).toFixed(2)} KB` : 'File preview not available'}
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowAttachmentModal(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={handleDownloadAttachment}
                className="px-4 py-2 text-sm text-white rounded-md hover:opacity-90"
                style={{ backgroundColor: '#355842' }}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </FormModal>
  );
};

export default MaintenanceForm;
