import { AlertTriangle, Loader2 } from 'lucide-react';
import { useState } from 'react';

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="bg-zinc-900 border border-white/10 rounded-sm w-full max-w-sm overflow-hidden shadow-2xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="text-red-500" size={20} />
            </div>
            <h3 className="text-lg font-heading font-bold text-white leading-tight">
              {title}
            </h3>
          </div>
          
          <p className="text-gray-400 text-sm">
            {message}
          </p>
        </div>

        <div className="flex gap-3 px-6 py-4 bg-black/50 border-t border-white/5">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 py-2 px-4 border border-white/20 text-white text-sm font-semibold rounded-sm hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-sm transition-colors disabled:opacity-50"
          >
            {isProcessing && <Loader2 size={16} className="animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
