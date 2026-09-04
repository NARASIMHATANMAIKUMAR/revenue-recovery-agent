import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '1.25rem',
        right: '1.25rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        maxWidth: '380px',
        width: 'calc(100vw - 2.5rem)',
        pointerEvents: 'none'
      }}
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        const bgColor = isSuccess ? '#ecfdf5' : isError ? '#fef2f2' : '#eff6ff';
        const borderColor = isSuccess ? '#a7f3d0' : isError ? '#fecaca' : '#bfdbfe';
        const textColor = isSuccess ? '#065f46' : isError ? '#991b1b' : '#1e40af';
        const iconColor = isSuccess ? '#10b981' : isError ? '#ef4444' : '#3b82f6';

        return (
          <div
            key={toast.id}
            style={{
              backgroundColor: bgColor,
              border: `1px solid ${borderColor}`,
              color: textColor,
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              pointerEvents: 'auto',
              animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div style={{ marginTop: '2px', flexShrink: 0 }}>
              {isSuccess && <CheckCircle2 size={18} color={iconColor} />}
              {isError && <AlertTriangle size={18} color={iconColor} />}
              {!isSuccess && !isError && <Info size={18} color={iconColor} />}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{toast.title}</div>
              {toast.message && (
                <div style={{ fontSize: '0.82rem', marginTop: '0.15rem', opacity: 0.9, lineHeight: 1.4 }}>
                  {toast.message}
                </div>
              )}
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: textColor,
                opacity: 0.6,
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
