import React, { useEffect } from 'react';
import FormModal from '../common/FormModal';
import FormField from '../common/FormField';
import DatePicker from '../common/DatePicker';
import CustomScrollbar from '../common/CustomScrollbar';

import AttachmentsList from './attachments/AttachmentsList';
import AttachmentsViewer from './attachments/AttachmentsViewer';
import AttachmentsUpload from './attachments/AttachmentsUpload';
import RemarksForm from './remarks/RemarksForm';
import MaintenanceEventLog from "./eventLog/MaintenanceEventLog";
import { Maximize2 } from "lucide-react";
import RemarksMaxModal from "./remarks/RemarksMaxModal"; 
import useMaintenanceForm from '../../hooks/maintenance/useMaintenanceForm';

interface MaintenanceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  mode?: "create" | "assign" | "pending" | "completed";
  initialData?: any;
  submitError?: string | null;

  // ✅ NEW
  readOnly?: boolean;
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = (props) => {
  const {
    isOpen,
    onClose,
    onSubmit,
    mode = "create",
    initialData,
    submitError,
    readOnly = false,
  } = props;

  const {
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
    getPriorityTextClass,
    handleFileChange,
    removeFile,
    handleRemarkSubmit,
    handleSubmit,
    isDisabled,
    handleClose,
    handleDownloadAttachment,
    noOpChange,
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
  } = useMaintenanceForm({
    isOpen,
    initialData,
    mode,
    onSubmit,
    onClose,
    readOnly,
  });

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
          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-semibold">
            <span className={getPriorityTextClass(initialData?.Priority)}>
              {initialData?.Priority || '—'}
            </span>
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

      {/* ✅ NEW: Deletion Reason BELOW Status (left side) */}
      {isDeletedTicket && deletionReasonText && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-xs font-semibold text-red-800 mb-1">Deletion Reason</p>
          <p className="text-sm text-red-900 whitespace-pre-wrap break-words">
            {deletionReasonText}
          </p>
        </div>
      )}

      {/* ✅ existing: Operator Reason */}
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
          label={isPendingMode ? 'Assigned Operator' : 'Previously Assigned Operator'}
          name="assignedOperator"
          type="text"
          value={
            // ✅ If cancelled and no current assignment, show last assigned from cancel log
            initialData?.AssignedOperatorName || 
            initialData?.LastAssignedOperatorName || 
            'Unassigned'
          }
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

  // ✅ NEW: Build timeline from events AND standalone remarks
  const remarksMessagesBody = (
    <MaintenanceEventLog
      events={events}
      remarks={remarks}
      attachments={attachments}
      currentUserId={currentUserId}
      loading={loadingEvents}
      onAttachmentClick={(attachment) => {
        setSelectedAttachment(attachment);
        setShowAttachmentModal(true);
      }}
    />
  );

  // ✅ only Pending mode can add remarks in this modal
  const canAddRemarksHere = isPendingMode;

  // ✅ Better title logic: keep normal titles for other modes,
  // but use "View Deleted Maintenance" when it's a deleted ticket view.
  const modalTitle =
    mode === "create"
      ? "Request Maintenance"
      : mode === "assign"
        ? "Accept & Assign Maintenance"
        : mode === "pending"
          ? "View Pending Maintenance"
          : mode === "completed"
            ? (isDeletedTicket ? "View Deleted Maintenance" : "View Completed Maintenance")
            : "Maintenance";

  // ✅ NEW: auto-scroll to bottom when modal opens + when timeline changes
  useEffect(() => {
    if (!isOpen) return;
    if (!isDetailsMode) return;
    if (remarksMaxOpen) return; // don't fight the maximized view

    // next paint (ensures DOM has rendered the new items)
    requestAnimationFrame(() => {
      remarksEndRef.current?.scrollIntoView({ block: 'end' });
    });
  }, [isOpen, isDetailsMode, remarksMaxOpen, events.length, remarks.length, attachments.length]);

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title={modalTitle}
      headerTone={isDeletedTicket ? 'danger' : 'default'}
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
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm flex-shrink-0" style={{ color: '#2E523A' }}>
                          Remarks History
                        </h3>

                        <button
                          type="button"
                          onClick={() => setRemarksMaxOpen(true)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md border border-gray-200 hover:bg-gray-50"
                        >
                          <Maximize2 size={14} />
                          Maximize
                        </button>
                      </div>

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
                              <div className="p-3">
                                {remarksMessagesBody}
                                <div ref={remarksEndRef} />
                              </div>
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

                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm flex-shrink-0" style={{ color: '#2E523A' }}>
                          Remarks
                        </h3>

                        <button
                          type="button"
                          onClick={() => setRemarksMaxOpen(true)}
                          className="bg-transparent inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md border border-gray-200 hover:bg-gray-50"
                        >
                          <Maximize2 size={14} />
                          Maximize
                        </button>
                      </div>

                      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white flex flex-col">
                        <div className="flex-1 min-h-0 flex flex-col">
                          <div className="flex-1 min-h-0 overflow-hidden">
                            <CustomScrollbar className="h-full min-h-0 overflow-y-auto" maxHeight="max-h-full">
                              <div className="p-3">
                                {remarksMessagesBody}
                                <div ref={remarksEndRef} />
                              </div>
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
                      {/* Title */}
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                          <span>Title</span>
                          {!formData.title && <span className="ml-1 text-red-600">*</span>}
                        </label>
                        <input
                          name="title"
                          type="text"
                          value={formData.title}
                          onChange={(e) => {
                            setFormData({ ...formData, title: e.target.value });
                            if (formErrors.title) {
                              const newErrors = { ...formErrors };
                              delete (newErrors as any).title;
                              setFormErrors(newErrors);
                            }
                          }}
                          placeholder="e.g., Broken conveyor belt"
                          className={`w-full px-3 py-2 rounded-md focus:outline-none ${
                            formErrors.title ? 'border-red-500 ring-1 ring-red-200' : 'border border-gray-300 focus:ring-2 focus:ring-[#355842]'
                          }`}
                        />
                        {formErrors.title && <p className="mt-1 text-xs text-red-600">{formErrors.title}</p>}
                      </div>
      
                      {/* Issue Description */}
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                          <span>Issue Description</span>
                          {!formData.issue && <span className="ml-1 text-red-600">*</span>}
                        </label>
                        <textarea
                          name="issue"
                          value={formData.issue}
                          onChange={(e) => {
                            setFormData({ ...formData, issue: e.target.value });
                            if (formErrors.issue) {
                              const newErrors = { ...formErrors };
                              delete (newErrors as any).issue;
                              setFormErrors(newErrors);
                            }
                          }}
                          placeholder="Describe the issue in detail..."
                          rows={4}
                          className={`w-full px-3 py-2 rounded-md focus:outline-none ${
                            formErrors.issue ? 'border-red-500 ring-1 ring-red-200' : 'border border-gray-300 focus:ring-2 focus:ring-[#355842]'
                          }`}
                        />
                        {formErrors.issue && <p className="mt-1 text-xs text-red-600">{formErrors.issue}</p>}
                      </div>
      
                      {/* Priority */}
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                          <span>Priority</span>
                          {!formData.priority && <span className="ml-1 text-red-600">*</span>}
                        </label>
                        <select
                          name="priority"
                          value={formData.priority}
                          onChange={(e) => {
                            setFormData({ ...formData, priority: e.target.value });
                            if (formErrors.priority) {
                              const newErrors = { ...formErrors };
                              delete (newErrors as any).priority;
                              setFormErrors(newErrors);
                            }
                          }}
                          className={`w-full px-3 py-2 rounded-md focus:outline-none ${
                            formErrors.priority ? 'border-red-500 ring-1 ring-red-200' : 'border border-gray-300 focus:ring-2 focus:ring-[#355842]'
                          }`}
                        >
                          <option value="">Select priority</option>
                          {priorityOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        {formErrors.priority && <p className="mt-1 text-xs text-red-600">{formErrors.priority}</p>}
                      </div>
      
                      {/* Due Date (use DatePicker) */}
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                          <span>Due Date</span>
                          {!formData.dueDate && <span className="ml-1 text-red-600">*</span>}
                        </label>
                        <div className={formErrors.dueDate ? 'ring-1 ring-red-200 rounded-md' : ''}>
                          <DatePicker
                            label=""
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={(e: any) => {
                              // DatePicker may pass event or value; handle both
                              const val = typeof e === 'string' ? e : e?.target?.value;
                              setFormData({ ...formData, dueDate: val });
                              if (formErrors.dueDate) {
                                const newErrors = { ...formErrors };
                                delete (newErrors as any).dueDate;
                                setFormErrors(newErrors);
                              }
                            }}
                          />
                        </div>
                        {formErrors.dueDate && <p className="mt-1 text-xs text-red-600">{formErrors.dueDate}</p>}
                      </div>
      
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

          {/* ✅ hide footer submit when readOnly */}
          {!readOnly && (
            <div className="flex justify-center gap-3 pt-4 border-t mt-6 flex-shrink-0">
              {/* ✅ show submit for create + assign */}
              {!isViewMode && (
                <button
                  type="submit"
                  disabled={isDisabled}
                  className={`px-6 py-2 text-sm text-white rounded-md ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}`}
                  style={{ backgroundColor: '#355842', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  {isSubmitting && (
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.6)" strokeWidth="4" />
                      <path d="M22 12a10 10 0 00-10-10" stroke="white" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                  )}
                  <span>
                    {isSubmitting ? (isCreateMode ? 'Submitting...' : isAssignMode ? 'Assigning...' : 'Submitting...') :
                     (isCreateMode ? 'Submit Request' : isAssignMode ? 'Accept & Assign' : 'Submit')}
                  </span>
                </button>
              )}
            </div>
          )}
        </form>
      </div>

      {/* ✅ Maximize modal (mobile-like layout) */}
      <RemarksMaxModal
        isOpen={remarksMaxOpen}
        onClose={() => setRemarksMaxOpen(false)}
        title="Remarks"
        events={events}
        remarks={remarks}
        attachments={attachments}
        loading={loadingEvents || loadingRemarks}
        currentUserId={currentUserId}
        canAddRemarks={canAddRemarksHere}
        onSubmitRemark={handleRemarkSubmit}
        onAttachmentClick={(attachment) => {
          setSelectedAttachment(attachment);
          setShowAttachmentModal(true);
        }}
      />

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
