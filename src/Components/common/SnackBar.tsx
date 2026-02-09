import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, Bell, CheckCircle, Info } from 'lucide-react';

export interface SnackBarProps {
  visible: boolean;
  message: string;
  onDismiss: () => void;
  duration?: number; // ms
  actionLabel?: string;
  onAction?: () => void;
  type?: 'error' | 'success' | 'info';
}

const ANIM_MS = 200;

const SnackBar: React.FC<SnackBarProps> = ({
  visible,
  message,
  onDismiss,
  duration = 3000,
  actionLabel,
  onAction,
  type = 'info',
}) => {
  const dismissTimerRef = useRef<number | null>(null);
  const unmountTimerRef = useRef<number | null>(null);

  const [shouldRender, setShouldRender] = useState<boolean>(visible);
  const [shown, setShown] = useState<boolean>(false);

  const { bgClass, IconComponent } = useMemo(() => {
    switch (type) {
      case 'error':
        return { bgClass: 'bg-red-600', IconComponent: AlertCircle };
      case 'success':
        return { bgClass: 'bg-green-600', IconComponent: CheckCircle };
      case 'info':
      default:
        return { bgClass: 'bg-neutral-800', IconComponent: Info };
    }
  }, [type]);

  useEffect(() => {
    const clearTimers = () => {
      if (dismissTimerRef.current) window.clearTimeout(dismissTimerRef.current);
      if (unmountTimerRef.current) window.clearTimeout(unmountTimerRef.current);
      dismissTimerRef.current = null;
      unmountTimerRef.current = null;
    };

    clearTimers();

    if (visible) {
      setShouldRender(true);
      requestAnimationFrame(() => setShown(true));

      dismissTimerRef.current = window.setTimeout(() => {
        onDismiss();
      }, duration);
    } else {
      setShown(false);
      unmountTimerRef.current = window.setTimeout(() => {
        setShouldRender(false);
      }, ANIM_MS);
    }

    return clearTimers;
  }, [visible, duration, onDismiss]);

  if (!shouldRender) return null;

  const showAction = Boolean(actionLabel && onAction);

  const node = (
    <div
      role="status"
      aria-live="polite"
      className={[
        // ✅ very high z-index so it sits above modals
        'fixed bottom-8 left-4 z-[999999]',
        'w-[calc(100vw-2rem)] sm:w-auto',
        'max-w-lg sm:min-w-[420px]',
        'flex items-center gap-3',
        'rounded-xl px-4 py-4 text-white shadow-lg',
        bgClass,
        'transition-all duration-200 ease-out',
        shown ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0',
      ].join(' ')}
    >
      <IconComponent className="h-5 w-5 shrink-0 text-white" />
      <div className="min-w-0 flex-1">{message}</div>

      {showAction && (
        <button
          type="button"
          onClick={onAction}
          className="ml-4 shrink-0 bg-transparent p-0 font-bold text-yellow-400 hover:text-yellow-300"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );

  // ✅ Portal prevents modal stacking contexts from hiding it
  if (typeof document === 'undefined') return node;
  return createPortal(node, document.body);
};

export default SnackBar;