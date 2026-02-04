import React from 'react';

type Variant = 'success' | 'danger' | 'neutral';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;

  title: string;
  description: string;

  confirmText?: string;
  cancelText?: string;

  variant?: Variant;

  /** Extra content between description and buttons (e.g., textarea for delete reason) */
  children?: React.ReactNode;

  /** Disable confirm button (in addition to isLoading) */
  confirmDisabled?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'success',
  children,
  confirmDisabled = false,
}) => {
  if (!isOpen) return null;

  const styles: Record<Variant, { iconWrap: string; icon: string; confirmBtn: string; confirmHover: string }> = {
    success: {
      iconWrap: 'bg-green-100',
      icon: 'text-green-600',
      confirmBtn: 'bg-[#355842]',
      confirmHover: 'hover:bg-[#2e4a36]',
    },
    danger: {
      iconWrap: 'bg-red-100',
      icon: 'text-red-600',
      confirmBtn: 'bg-red-600',
      confirmHover: 'hover:bg-red-700',
    },
    neutral: {
      iconWrap: 'bg-blue-100',
      icon: 'text-blue-600',
      confirmBtn: 'bg-blue-600',
      confirmHover: 'hover:bg-blue-700',
    },
  };

  const { iconWrap, icon, confirmBtn, confirmHover } = styles[variant];

  const Icon = () => {
    if (variant === 'success') {
      return (
        <svg className={`w-6 h-6 ${icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    }

    if (variant === 'danger') {
      return (
        <svg className={`w-6 h-6 ${icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    }

    return (
      <svg className={`w-6 h-6 ${icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
        />
      </svg>
    );
  };

  const confirmIsDisabled = isLoading || confirmDisabled;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
        <div className={`flex items-center justify-center w-12 h-12 mx-auto rounded-full mb-4 ${iconWrap}`}>
          <Icon />
        </div>

        <h3 className="text-lg font-semibold text-center mb-2">{title}</h3>
        <p className="text-gray-600 text-center mb-4 text-sm">{description}</p>

        {children ? <div className="mb-5">{children}</div> : null}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-gray-200 text-sm text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmIsDisabled}
            className={`flex-1 px-4 py-2 text-white text-sm rounded-lg disabled:opacity-50 ${confirmBtn} ${confirmHover}`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;