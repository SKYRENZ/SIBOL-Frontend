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
          .then((data) => setAttachments(data || []))
          .catch((error) => {
            console.error('Error fetching attachments:', error);
            setAttachments([]);
          });
      } else {
        setAttachments([]);
      }

      // Fetch remarks for pending/completed/assign (view remarks too)
      if (requestId && (mode === 'pending' || mode === 'completed' || mode === 'assign')) {
        setLoadingRemarks(true);
        maintenanceService.getTicketRemarks(requestId)
          .then((data) => setRemarks(data || []))
          .catch((error) => {
            console.error('Error fetching remarks:', error);
            setRemarks([]);
          })
          .finally(() => setLoadingRemarks(false));
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

  // ✅ New handler for remarks submission (used by Pending view only)
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

  // ✅ FIX: define these (they are used later in JSX)
  const isDetailsMode = isPendingMode || isCompletedMode || isAssignMode;

  // ✅ “view-only” modes (no submit button)
  const isViewMode = isPendingMode || isCompletedMode;

  // ✅ modal height used in wrapper div
  const modalHeightClass = isDetailsMode
    ? 'h-[72vh] max-h-[72vh]'
    : 'h-[60vh] max-h-[60vh]';

  // ✅ NEW: helpful derived values
  const ticketStatus = (initialData?.Status ?? '').trim();
  const cancelReasonText =
    typeof initialData?.Cancel_reason === 'string' ? initialData.Cancel_reason.trim() : '';

  // ✅ NEW: cancel actor display (Name + Role)
  const cancelRequestedByName = (initialData?.CancelRequestedByName ?? '').trim();
  const cancelRequestedByRole = (initialData?.CancelRequestedByRole ?? '').trim();
  const cancelledByName = (initialData?.CancelledByName ?? '').trim();
  const cancelledByRole = (initialData?.CancelledByRole ?? '').trim();

  const cancelRequestedByDisplay = cancelRequestedByName
    ? `${cancelRequestedByName}${cancelRequestedByRole ? ` (${cancelRequestedByRole})` : ''}`
    : 'Unknown';

  const cancelledByDisplay = cancelledByName
    ? `${cancelledByName}${cancelledByRole ? ` (${cancelledByRole})` : ''}`
    : 'Unknown';

  // ✅ keep your reason box logic
  const showOperatorReasonBox =
    !!cancelReasonText && (ticketStatus === 'Cancel Requested' || ticketStatus === 'Cancelled');

  const operatorDisplayName = (initialData?.AssignedOperatorName || 'Operator').trim();

  // ✅ CHANGED: remove the old “bookmark at the top” source (we now put it in the logs)
  const remarksBookmarkText = null;

  // ✅ Attachments block (right side)
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

  // ✅ Assign controls (shown inside the details layout LEFT column for Assign mode)
  const assignControls = isAssignMode ? (
    <div className="space-y-4 rounded-lg p-4 bg-[#355842]/5 border border-[#355842]/30 ring-1 ring-[#355842]/10">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#2E523A]">Accept & Assign</p>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-white border border-[#355842]/20 text-[#2E523A]">
          Editable
        </span>
      </div>

      <div className="border-t border-[#355842]/20 pt-3">
        <FormField
          label="Requested By"
          name="staffAccountId"
          type="text"
          value={formData.staffAccountId}
          onChange={noOpChange}
          disabled
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
  ) : null;

  // ✅ LEFT SIDE details (same as pending), plus assign controls when assign mode
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

      {/* Priority: show read-only badge in Pending/Completed, editable select in Assign */}
      {!isAssignMode ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <div
            className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-semibold"
            style={{ color: '#E67E22' }}
          >
            {initialData?.Priority || '—'}
          </div>
        </div>
      ) : null}

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

      {/* ✅ NEW: Operator reason is shown here (left side), not in CancelConfirmModal */}
      {showOperatorReasonBox && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-xs font-semibold text-red-800 mb-1">Operator Reason</p>
          <p className="text-sm text-red-900 whitespace-pre-wrap break-words">
            {cancelReasonText}
          </p>
        </div>
      )}

      {/* Due Date: read-only in Pending/Completed; editable in Assign via assignControls */}
      {!isAssignMode ? (
        <DatePicker
          label="Due Date"
          name="dueDate"
          value={formData.dueDate}
          onChange={noOpChange}
          disabled={true}
        />
      ) : null}

      {/* ✅ Requirement #3:
          Hide "Previously Assigned Operator" if Status is "Requested" AND in assign mode */}
      {!(isAssignMode && ticketStatus === 'Requested') && (
        <FormField
          label="Previously Assigned Operator"
          name="assignedOperator"
          type="text"
          value={initialData?.AssignedOperatorName || 'Unassigned'}
          onChange={noOpChange}
          disabled={true}
        />
      )}

      {/* ✅ more noticeable “slice” before assignControls */}
      {isAssignMode && <div className="border-t-2 border-[#355842]/20 pt-2" />}

      {/* ✅ Accept & Assign controls inside the same details UI */}
      {assignControls}
    </div>
  );

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
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
  };

  // ✅ Combine remarks + attachments + bookmark into one timeline (sorted)
  type TimelineItem =
    | {
        kind: 'bookmark';
        key: string;
        createdAt: string;
        text: string;
      }
    | {
        kind: 'remark';
        key: string;
        createdAt: string;
        isCurrentUser: boolean;
        authorName: string;
        text: string;
      }
    | {
        kind: 'attachment';
        key: string;
        createdAt: string;
        isCurrentUser: boolean;
        authorName: string;
        attachment: MaintenanceAttachment;
        isImage: boolean;
      };

  const timelineItems: TimelineItem[] = (() => {
    const remarkItems: TimelineItem[] = (remarks || []).map((r) => ({
      kind: 'remark',
      key: `r-${r.Remark_Id}`,
      createdAt: r.Created_at,
      isCurrentUser: r.Created_by === currentUserId,
      authorName: r.CreatedByName || 'Unknown',
      text: r.Remark_text,
    }));

    const attachmentItems: TimelineItem[] = (attachments || []).map((a) => {
      const createdAt =
        (a as any).Uploaded_at ||
        (a as any).uploaded_at ||
        new Date().toISOString();

      const isImage = !!a.File_type?.startsWith('image/');

      return {
        kind: 'attachment',
        key: `a-${a.Attachment_Id ?? a.File_path}`,
        createdAt,
        isCurrentUser: (a as any).Uploaded_by === currentUserId,
        authorName: (a as any).UploaderName || (a as any).CreatedByName || 'Unknown',
        attachment: a,
        isImage,
      };
    });

    // ✅ Requirement #1 + #2: Bookmark INSIDE message logs and uses Name+Role rules
    let bookmark: TimelineItem | null = null;

    if (ticketStatus === 'Completed') {
      bookmark = {
        kind: 'bookmark',
        key: 'bm-completed',
        createdAt: initialData?.Completed_at || new Date().toISOString(),
        text: `Completed Request by ${operatorDisplayName}`,
      };
    } else if (ticketStatus === 'Cancel Requested') {
      bookmark = {
        kind: 'bookmark',
        key: 'bm-cancel-requested',
        createdAt: initialData?.Cancel_requested_at || new Date().toISOString(),
        text: `Cancel Requested by ${cancelRequestedByDisplay}`,
      };
    } else if (ticketStatus === 'Cancelled') {
      // ✅ If NO reason => direct cancel by staff/admin => show Cancelled by
      // ✅ If reason EXISTS => comes from operator cancel request flow => show Cancel Requested by
      const text =
        cancelReasonText.length === 0
          ? `Cancelled by ${cancelledByDisplay}`
          : `Cancel Requested by ${cancelRequestedByDisplay}`;

      bookmark = {
        kind: 'bookmark',
        key: 'bm-cancelled',
        createdAt: initialData?.Cancelled_at || new Date().toISOString(),
        text,
      };
    }

    const combined = bookmark
      ? [...remarkItems, ...attachmentItems, bookmark]
      : [...remarkItems, ...attachmentItems];

    return combined.sort((x, y) => new Date(x.createdAt).getTime() - new Date(y.createdAt).getTime());
  })();

  const remarksMessagesBody = loadingRemarks ? (
    <div className="text-center py-8">
      <p className="text-sm text-gray-500">Loading remarks...</p>
    </div>
  ) : timelineItems.length === 0 ? (
    <p className="text-sm text-gray-500 italic text-center py-8">No remarks yet</p>
  ) : (
    <div className="space-y-3">
      {timelineItems.map((item) => {
        if (item.kind === 'bookmark') {
          return (
            <div key={item.key} className="flex justify-center">
              <div className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs text-gray-700">
                {item.text}
              </div>
            </div>
          );
        }

        return (
          <div
            key={item.key}
            className={`flex ${item.isCurrentUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                item.isCurrentUser
                  ? 'bg-[#355842] text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}
            >
              <div className="flex items-baseline gap-2 mb-1">
                <span
                  className={`text-xs font-semibold ${
                    item.isCurrentUser ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {item.authorName}
                </span>
                <span
                  className={`text-xs ${
                    item.isCurrentUser ? 'text-white/70' : 'text-gray-500'
                  }`}
                >
                  {formatRelativeTime(item.createdAt)}
                </span>
              </div>

              {item.kind === 'remark' ? (
                <p className="text-sm whitespace-pre-wrap break-words">{item.text}</p>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAttachment(item.attachment);
                    setShowAttachmentModal(true);
                  }}
                  className="block text-left bg-transparent p-0 m-0 border-0 outline-none focus:outline-none focus:ring-0 active:outline-none active:ring-0 hover:outline-none hover:ring-0"
                  title="View attachment"
                >
                  {item.isImage ? (
                    <img
                      src={item.attachment.File_path}
                      alt="Attachment"
                      className="w-44 h-44 object-cover rounded-lg border border-black/10 block select-none pointer-events-none"
                      loading="lazy"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-44 h-24 rounded-lg border border-black/10 bg-transparent flex items-center justify-center">
                      <span className={`text-sm ${item.isCurrentUser ? 'text-white' : 'text-gray-700'}`}>
                        Attachment
                      </span>
                    </div>
                  )}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ✅ only Pending mode can add remarks in this modal
  const canAddRemarksHere = isPendingMode;

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
      width={isDetailsMode ? '960px' : '720px'}
    >
      <div className={`flex flex-col ${modalHeightClass}`}>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {(formError || submitError) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex-shrink-0">
              {formError || submitError}
            </div>
          )}

          {/* ✅ header block for Pending/Completed/Assign */}
          {isDetailsMode && initialData && (
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
            {isDetailsMode ? (
              <div className="h-full min-h-0">
                {/* ✅ MOBILE */}
                <CustomScrollbar className="h-full min-h-0 pr-2 md:hidden" maxHeight="max-h-full">
                  <div className="space-y-6">
                    <div>{leftDetailsContent}</div>
                    <div>{attachmentsContent}</div>

                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm flex-shrink-0" style={{ color: '#2E523A' }}>
                        Remarks History
                      </h3>

                      {/* ✅ NEW: bookmark line */}
                      {remarksBookmarkText && (
                        <div className="rounded-md border-l-4 border-[#355842] bg-[#355842]/5 px-3 py-2 text-sm text-[#2E523A]">
                          {remarksBookmarkText}
                        </div>
                      )}

                      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white flex flex-col">
                        <div className="flex flex-col h-[32vh] min-h-[240px] max-h-[360px]">
                          <div className="flex-1 min-h-0 overflow-hidden">
                            <CustomScrollbar
                              className="h-full min-h-0 overflow-y-auto overscroll-contain"
                              maxHeight="max-h-full"
                            >
                              <div className="p-3">{remarksMessagesBody}</div>
                            </CustomScrollbar>
                          </div>

                          {canAddRemarksHere && (
                            <div className="p-3 bg-white border-t border-gray-200 flex-shrink-0">
                              <RemarksForm onSubmit={handleRemarkSubmit} disabled={false} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CustomScrollbar>

                {/* ✅ DESKTOP */}
                <div className="hidden md:grid md:grid-cols-2 gap-6 h-full min-h-0">
                  {/* LEFT */}
                  <div className="min-h-0 h-full overflow-hidden">
                    <CustomScrollbar className="h-full min-h-0 pr-2 overflow-x-hidden" maxHeight="max-h-full">
                      {leftDetailsContent}
                    </CustomScrollbar>
                  </div>

                  {/* RIGHT */}
                  <div className="min-h-0 h-full overflow-hidden">
                    <div className="min-h-0 h-full flex flex-col border-l pl-4 gap-4">
                      {attachmentsContent}

                      <h3 className="font-semibold text-sm flex-shrink-0" style={{ color: '#2E523A' }}>
                        Remarks History
                      </h3>

                      {/* ✅ NEW: bookmark line */}
                      {remarksBookmarkText && (
                        <div className="rounded-md border-l-4 border-[#355842] bg-[#355842]/5 px-3 py-2 text-sm text-[#2E523A]">
                          {remarksBookmarkText}
                        </div>
                      )}

                      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white flex flex-col">
                        <div className="flex-1 min-h-0 flex flex-col">
                          <div className="flex-1 min-h-0 overflow-hidden">
                            <CustomScrollbar className="h-full min-h-0 overflow-y-auto" maxHeight="max-h-full">
                              <div className="p-3">{remarksMessagesBody}</div>
                            </CustomScrollbar>
                          </div>

                          {canAddRemarksHere && (
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

            {/* ✅ show submit for create + assign */}
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
