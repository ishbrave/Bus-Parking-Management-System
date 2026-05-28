import { AlertTriangle, X } from 'lucide-react';
import { useUI } from '../hooks/useUI';

export default function ConfirmModal() {
  const { confirmModal, closeConfirm } = useUI();

  if (!confirmModal.open) return null;

  const handleConfirm = () => {
    if (confirmModal.onConfirm) confirmModal.onConfirm();
    closeConfirm();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={closeConfirm} />
      <div className="relative w-full max-w-sm mx-2 bg-white/80 backdrop-blur-xl rounded-xl border border-red-100 shadow-2xl shadow-red-200/50 p-4 sm:p-6 animate-fade-in">
        <button onClick={closeConfirm} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
          <X size={18} />
        </button>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-3 rounded-full bg-red-50 text-red-500">
            <AlertTriangle size={28} />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Confirm Action</h3>
          <p className="text-sm text-gray-500">{confirmModal.message}</p>
          <div className="flex gap-3 mt-2 w-full sm:w-auto">
            <button
              onClick={closeConfirm}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors shadow-md shadow-red-200"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}