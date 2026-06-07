"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Save, Loader2 } from "lucide-react";
import { UI_MESSAGES } from "@/lib/constants/messages";

type ChapterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string) => Promise<void>;
  initialTitle?: string;
};

const chapterSchema = z.object({
  title: z.string().trim().min(1, UI_MESSAGES.chapters.titleRequired),
});

type ChapterInput = z.infer<typeof chapterSchema>;

export default function ChapterModal({
  isOpen,
  onClose,
  onSave,
  initialTitle = "",
}: ChapterModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChapterInput>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      title: initialTitle,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ title: initialTitle });
    }
  }, [isOpen, initialTitle, reset]);

  if (!isOpen) return null;

  const onFormSubmit = async (data: ChapterInput) => {
    try {
      await onSave(data.title.trim());
      handleClose();
    } catch (err: unknown) {
      // Form sets error inside form scope
      console.error(err);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-admin-deep/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-admin-deep w-full max-w-lg rounded shadow-2xl border border-admin-border/30 relative flex flex-col my-auto overflow-hidden text-admin-cream animate-in fade-in zoom-in duration-200">
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 text-admin-muted hover:text-admin-cream transition-colors"
          type="button"
          disabled={isSubmitting}
        >
          <X size={20} />
        </button>

        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold font-serif text-admin-cream">
            {initialTitle ? "Chỉnh sửa chương" : "Thêm chương mới"}
          </h2>
        </div>

        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="px-8 pb-8 space-y-6"
        >
          <div className="space-y-2">
            <label
              htmlFor="chapter-title-input"
              className="text-xs font-bold text-admin-muted block uppercase tracking-widest"
            >
              Tên chương <span className="text-admin-pink">*</span>
            </label>
            <input
              id="chapter-title-input"
              type="text"
              disabled={isSubmitting}
              {...register("title")}
              placeholder="Ví dụ: Chương 1: Khảo sát Hàm số"
              className="w-full bg-admin-surface-low border border-admin-border/30 focus:border-admin-pink focus:outline-none focus:ring-1 focus:ring-admin-pink rounded px-4 py-3 text-admin-cream placeholder:text-admin-muted/40 transition-all font-medium text-[14px]"
            />
            {errors.title && (
              <p className="text-red-400 text-xs mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="pt-4 flex items-center justify-end gap-4 border-t border-admin-border/10">
            <button
              onClick={handleClose}
              className="px-6 py-2.5 text-xs font-bold text-admin-muted hover:text-admin-cream transition-all uppercase tracking-widest cursor-pointer"
              type="button"
              disabled={isSubmitting}
            >
              Hủy bỏ
            </button>
            <button
              className="px-8 py-3 bg-admin-pink hover:brightness-110 text-white font-bold text-xs rounded transition-all shadow-lg shadow-admin-pink/20 flex items-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
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

