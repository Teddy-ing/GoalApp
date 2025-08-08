import React, { useEffect } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonStyle?: 'danger' | 'primary' | 'warning';
  icon?: 'warning' | 'danger' | 'question' | 'info';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonStyle = 'primary',
  icon = 'question',
  loading = false,
}) => {
  console.log('🎪 ConfirmDialog rendered with isOpen:', isOpen, 'title:', title);
  
  const handleConfirm = () => {
    console.log('🔄 ConfirmDialog handleConfirm called, loading:', loading);
    
    if (!loading) {
      console.log('📞 Calling onConfirm prop function');
      onConfirm();
    } else {
      console.log('⏳ Skipping onConfirm - loading is true');
    }
  };

  const handleCancel = () => {
    if (!loading) {
      onClose();
    }
  };

  const getIconElement = () => {
    const iconClasses = "w-5 h-5";
    
    switch (icon) {
      case 'warning':
        return (
          <div className="flex items-center justify-center w-10 h-10 mx-auto bg-yellow-100 rounded-full">
            <svg className={`${iconClasses} text-yellow-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case 'danger':
        return (
          <div className="flex items-center justify-center w-10 h-10 mx-auto bg-red-100 rounded-full">
            <svg className={`${iconClasses} text-red-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'info':
        return (
          <div className="flex items-center justify-center w-10 h-10 mx-auto bg-indigo-100 rounded-full">
            <svg className={`${iconClasses} text-indigo-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'question':
      default:
        return (
          <div className="flex items-center justify-center w-10 h-10 mx-auto bg-gray-100 rounded-full">
            <svg className={`${iconClasses} text-gray-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getConfirmButtonClasses = () => {
    const baseClasses = "inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
    
    switch (confirmButtonStyle) {
      case 'danger':
        return `${baseClasses} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`;
      case 'warning':
        return `${baseClasses} bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500`;
      case 'primary':
      default:
        return `${baseClasses} bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500`;
    }
  };

  const getCancelButtonClasses = () => {
    const baseClasses = "inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50";

    if (loading) {
      return `${baseClasses} bg-slate-100 dark:bg-slate-800 cursor-not-allowed`;
    }

    return `${baseClasses} hover:bg-slate-50 dark:hover:bg-slate-800/60`;
  };

  // Keyboard shortcuts for quick confirm/cancel
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
      if (e.key === 'Enter' && !loading) onConfirm();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, loading, onClose, onConfirm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={handleCancel} />
      
      {/* Dialog Container */}
      <div className="relative min-h-full flex items-center justify-center p-3">
        <div className="relative w-full max-w-md max-h-[85vh] transform overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 p-5 text-left align-middle shadow-xl border border-slate-200 dark:border-slate-700">
          {/* Icon */}
          <div className="mb-3">
            {getIconElement()}
          </div>

          {/* Title */}
          <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-slate-100 text-center mb-3">
            {title}
          </h3>

          {/* Message */}
          <div className="mb-4">
            <p className="text-sm text-slate-600 dark:text-slate-300 text-center leading-relaxed">
              {message}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end sticky bottom-0 pt-2 bg-white dark:bg-slate-900">
            <button
              type="button"
              className={getCancelButtonClasses()}
              onClick={handleCancel}
              disabled={loading}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className={getConfirmButtonClasses()}
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading...
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog; 