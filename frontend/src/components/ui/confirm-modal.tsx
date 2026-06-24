import React from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-deep-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Opaque card without any glass-panel or opacity modifiers */}
      <div className="p-6 rounded-2xl border border-outline-variant/40 max-w-sm w-full mx-4 shadow-2xl bg-surface-container-high flex flex-col gap-4 animate-scaleUp">
        <div>
          <h3 className="text-base font-bold text-cream flex items-center gap-2">
            <AlertTriangle className="text-warning shrink-0" size={20} />
            {title}
          </h3>
          <p className="text-sm text-muted-text mt-2 font-medium leading-relaxed">
            {message}
          </p>
        </div>
        <div className="flex justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-bold text-cream bg-surface-container hover:bg-surface-container-highest border border-outline-variant/30 transition active:scale-95 cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-deep-black hover:brightness-110 shadow-md shadow-primary/10 transition active:scale-95 cursor-pointer"
          >
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
}
