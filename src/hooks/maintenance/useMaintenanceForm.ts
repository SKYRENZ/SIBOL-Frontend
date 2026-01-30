import { useEffect, useRef, useState } from 'react';
import * as maintenanceService from '../../services/maintenanceService';
import * as userService from '../../services/userService';
import { useAppSelector } from '../../store/hooks';
import { getUserRole } from '../../utils/roleUtils';
import type { MaintenanceAttachment, MaintenanceEvent, MaintenanceRemark } from '../../types/maintenance';

const getAccountIdFromUser = (u: any): number | null => {
  if (!u) return null;
  const candidates = [
    u.Account_id,
    u.account_id,
    u.AccountId,
    u.accountId,
    u.id,
    u.ID,
  ];
  for (const v of candidates) {
    if (v == null) continue;
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string') {
      const n = Number(v.trim());
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
};

interface UseMaintenanceFormParams {
  isOpen: boolean;
  initialData?: any;
  mode?: 'create' | 'assign' | 'pending' | 'completed';
  onSubmit: (formData: any) => Promise<any> | any;
  onClose: () => void;
  readOnly?: boolean;
}

export function useMaintenanceForm({
  isOpen,
  initialData,
  mode = 'create',
  onSubmit,
  onClose,
  readOnly = false,
}: UseMaintenanceFormParams) {
  const reduxUser = useAppSelector((s) => s.auth.user);

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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [assignedOptions, setAssignedOptions] = useState<{ value: string; label: string }[]>([]);
  const [priorityOptions, setPriorityOptions] = useState<{ value: string; label: string }[]>([]);
  const [attachments, setAttachments] = useState<MaintenanceAttachment[]>([]);
  const [selectedAttachment, setSelectedAttachment] = useState<MaintenanceAttachment | null>(null);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [remarks, setRemarks] = useState<MaintenanceRemark[]>([]);
  const [loadingRemarks, setLoadingRemarks] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [events, setEvents] = useState<MaintenanceEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [remarksMaxOpen, setRemarksMaxOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const remarksEndRef = useRef<HTMLDivElement | null>(null);

  const getPriorityTextClass = (priority?: string | null) => {
    const p = (priority || '').toString().trim().toLowerCase();
    if (p === 'mild') return 'text-blue-600';
    if (p === 'urgent') return 'text-orange-600';
    if (p === 'critical') return 'text-red-600';
    return 'text-gray-700';
  };

  useEffect(() => {
    if (!isOpen) return;

    const accountId = getAccountIdFromUser(reduxUser);
    if (accountId) {
      setCurrentUserId(accountId);
      if (mode === 'assign') (window as any).__currentStaffId = accountId;
    } else {
      setCurrentUserId(null);
    }

    maintenanceService.getPriorities()
      .then((priorities: any[]) => {
        const options = priorities.map((p) => ({ value: p.Priority, label: p.Priority }));
        setPriorityOptions(options);
      })
      .catch(() => {
        setPriorityOptions([
          { value: 'Critical', label: 'Critical' },
          { value: 'Urgent', label: 'Urgent' },
          { value: 'Mild', label: 'Mild' },
        ]);
      });

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
      setFormData((prev) => ({
        title: '',
        issue: '',
        priority: '',
        dueDate: '',
        files: [],
        staffAccountId: prev.staffAccountId,
        assignedTo: '',
        remarks: '',
      }));
    }

    if (mode === 'assign') {
      userService.getOperators()
        .then((operators) => {
          const options = (operators || [])
            .filter((op: any) => op.value && op.label)
            .map((operator: any) => ({ value: String(operator.value), label: operator.label }));
          setAssignedOptions(options);
        })
        .catch(() => setFormError('Failed to load operators'));
    }

    const requestId = initialData?.Request_Id || initialData?.request_id;
    if (requestId) {
      maintenanceService.getTicketAttachments(requestId)
        .then((data) => setAttachments(data || []))
        .catch(() => setAttachments([]));
    } else {
      setAttachments([]);
    }

    if (requestId && (mode === 'pending' || mode === 'completed' || mode === 'assign')) {
      setLoadingEvents(true);
      maintenanceService.getTicketEvents(requestId)
        .then((data) => setEvents(data || []))
        .catch(() => setEvents([]))
        .finally(() => setLoadingEvents(false));
    } else {
      setEvents([]);
    }

    if (requestId && (mode === 'pending' || mode === 'completed' || mode === 'assign')) {
      setLoadingRemarks(true);
      maintenanceService.getTicketRemarks(requestId)
        .then((data) => setRemarks(data || []))
        .catch(() => setRemarks([]))
        .finally(() => setLoadingRemarks(false));
    } else {
      setRemarks([]);
    }
  }, [isOpen, initialData, mode, reduxUser]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData((prev) => ({ ...prev, files: [...prev.files, ...newFiles] }));
    }
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }));
  };

  const handleRemarkSubmit = async (remarkText: string, files: File[]) => {
    try {
      const requestId = initialData?.Request_Id || initialData?.request_id || (initialData?.requestId ?? null);
      if (!requestId) throw new Error('Request ID not found');
      const userId = currentUserId ?? getAccountIdFromUser(reduxUser);
      if (!userId) throw new Error('User ID not found (not signed in)');

      const userRole = getUserRole(reduxUser);

      if (remarkText.trim()) {
        await maintenanceService.addRemark(requestId, remarkText, userId, userRole);
      }

      if (files.length > 0) {
        await Promise.all(files.map((file) => maintenanceService.uploadAttachment(requestId, userId, file)));
      }

      const [updatedRemarks, updatedAttachments, updatedEvents] = await Promise.all([
        maintenanceService.getTicketRemarks(requestId),
        maintenanceService.getTicketAttachments(requestId),
        maintenanceService.getTicketEvents(requestId),
      ]);

      setRemarks(updatedRemarks);
      setAttachments(updatedAttachments || []);
      setEvents(updatedEvents);
    } catch (error) {
      console.error('Failed to add remark:', error);
      throw error;
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (readOnly || isSubmitting) return;
    setFormError(null);

    const errors: Record<string, string> = {};
    if (!formData.title || formData.title.trim().length === 0) errors.title = 'This is required';
    if (!formData.issue || formData.issue.trim().length === 0) errors.issue = 'This is required';
    if (!formData.priority || String(formData.priority).trim().length === 0) errors.priority = 'This is required';
    if (!formData.dueDate || String(formData.dueDate).trim().length === 0) errors.dueDate = 'This is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err: any) {
      console.error('MaintenanceForm submit error', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to submit';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = readOnly || isSubmitting;

  const handleClose = () => {
    setFormError(null);
    setFormErrors({});
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
  const isDetailsMode = isPendingMode || isCompletedMode || isAssignMode;
  const isViewMode = isPendingMode || isCompletedMode;
  const modalHeightClass = isDetailsMode ? 'h-[72vh] max-h-[72vh]' : 'h-[60vh] max-h-[60vh]';

  const ticketStatus = (initialData?.Status ?? '').toString().trim();
  const cancelReasonText =
    typeof initialData?.Cancel_reason === 'string' ? initialData.Cancel_reason.trim() : '';

  const deletionReasonText =
    typeof initialData?.Deleted_reason === 'string'
      ? initialData.Deleted_reason.trim()
      : typeof initialData?.Delete_reason === 'string'
        ? initialData.Delete_reason.trim()
        : '';

  const isDeletedTicket =
    !!initialData &&
    (
      initialData?.IsDeleted === 1 ||
      initialData?.IsDeleted === true ||
      ticketStatus.toLowerCase() === 'deleted'
    );

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

  const showOperatorReasonBox =
    !!cancelReasonText && (ticketStatus === 'Cancel Requested' || ticketStatus === 'Cancelled');

  const operatorDisplayName = (initialData?.AssignedOperatorName || 'Operator').trim();

  return {
    // state
    formData,
    setFormData,
    formError,
    formErrors,
    setFormErrors,
    assignedOptions,
    priorityOptions,
    attachments,
    selectedAttachment,
    setSelectedAttachment,
    showAttachmentModal,
    setShowAttachmentModal,
    remarks,
    loadingRemarks,
    currentUserId,
    events,
    loadingEvents,
    remarksMaxOpen,
    setRemarksMaxOpen,
    isSubmitting,
    remarksEndRef,
    // helpers & handlers
    getPriorityTextClass,
    handleFileChange,
    removeFile,
    handleRemarkSubmit,
    handleSubmit,
    isDisabled,
    handleClose,
    handleDownloadAttachment,
    noOpChange,
    // derived flags
    isCreateMode,
    isAssignMode,
    isPendingMode,
    isCompletedMode,
    isDetailsMode,
    isViewMode,
    modalHeightClass,
    ticketStatus,
    cancelReasonText,
    deletionReasonText,
    isDeletedTicket,
    cancelRequestedByDisplay,
    cancelledByDisplay,
    showOperatorReasonBox,
    operatorDisplayName,
  } as const;
}

export default useMaintenanceForm;