'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

type ChapterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string) => Promise<void>;
  initialTitle?: string;
};

export default function ChapterModal({
  isOpen,
  onClose,
  onSave,
  initialTitle = '',
}: ChapterModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, initialTitle]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tên chương.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    try {
      await onSave(title.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi lưu chương.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-admin-deep/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-admin-deep w-full max-w-lg rounded-2xl shadow-2xl border border-admin-border/30 relative flex flex-col my-auto overflow-hidden text-admin-cream animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-admin-muted hover:text-admin-cream transition-colors"
          type="button"
          disabled={isSubmitting}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold font-serif text-admin-cream">
            {initialTitle ? 'Chỉnh sửa chương' : 'Thêm chương mới'}
          </h2>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
          {error && (
            <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Chapter Title Input */}
          <div className="space-y-2">
            <label htmlFor="chapter-title-input" className="text-xs font-bold text-admin-muted block uppercase tracking-widest">
              Tên chương <span className="text-admin-pink">*</span>
            </label>
            <input
              id="chapter-title-input"
              type="text"
              required
              disabled={isSubmitting}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Chương 1: Khảo sát Hàm số"
              className="w-full bg-admin-surface-low border border-admin-border/30 focus:border-admin-pink focus:outline-none focus:ring-1 focus:ring-admin-pink rounded-xl px-4 py-3 text-admin-cream placeholder:text-admin-muted/40 transition-all font-medium text-sm"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-4 border-t border-admin-border/10">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-xs font-bold text-admin-muted hover:text-admin-cream transition-all uppercase tracking-widest cursor-pointer"
              type="button"
              disabled={isSubmitting}
            >
              Hủy bỏ
            </button>
            <button
              className="px-8 py-3 bg-admin-pink hover:brightness-110 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-admin-pink/20 flex items-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              Lưu chương
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
