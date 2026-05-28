import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, size = 'max-w-lg' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${size} bg-white/80 backdrop-blur-xl rounded-xl border border-blue-100 shadow-2xl shadow-blue-200/50 p-4 sm:p-6 animate-fade-in max-h-[90vh] overflow-y-auto mx-2 sm:mx-0`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-blue-600 pr-4">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors shrink-0">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}