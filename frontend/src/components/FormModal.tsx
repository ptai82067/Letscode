import { useEffect } from 'react';

type Props = {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export default function FormModal({ isOpen, title, onClose, children }: Props) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 overflow-y-auto">
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* MODAL */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full mx-4 mb-4">
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 rounded-t-3xl flex items-center justify-between border-b border-indigo-700/20">
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="text-indigo-100 text-sm mt-1">Điền đầy đủ thông tin để tạo bài học hoàn chỉnh</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition"
            aria-label="Đóng"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-8 max-h-[calc(100vh-200px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
