"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BookOpenCheck, X, Upload, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { SUBJECT_LABELS, Subject } from "@/types/common";
import { useCreateAssessmentMutation } from "../hooks";
import {
  createPresignedUpload,
  uploadFileDirectly,
  completeUpload,
} from "@/features/media/api";

const createAssessmentSchema = z.object({
  title: z
    .string()
    .min(1, "Tiêu đề không được để trống")
    .max(255, "Tiêu đề tối đa 255 ký tự"),
  subject: z.string().min(1, "Vui lòng chọn môn học"),
  grade: z.coerce.number().min(1).max(12),
  type: z.enum(["quiz", "exam"]),
  gradingType: z.enum(["auto", "manual", "mixed"]),
  timeLimitMinutes: z.coerce
    .number()
    .min(1, "Thời gian tối thiểu 1 phút")
    .max(600, "Thời gian tối đa 600 phút"),
});

type CreateAssessmentFormValues = z.infer<typeof createAssessmentSchema>;

interface AssessmentCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AssessmentCreateModal({
  isOpen,
  onClose,
}: AssessmentCreateModalProps) {
  const router = useRouter();
  const createAssessmentMutation = useCreateAssessmentMutation();

  const [mediaId, setMediaId] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateAssessmentFormValues>({
    resolver: zodResolver(createAssessmentSchema),
    defaultValues: {
      title: "",
      subject: "math",
      grade: 12,
      type: "quiz",
      gradingType: "auto",
      timeLimitMinutes: 90,
    },
  });

  const selectedType = watch("type");
  const selectedGradingType = watch("gradingType");

  // Sync grading type options when type changes
  useEffect(() => {
    if (selectedType === "quiz" && selectedGradingType === "manual") {
      setValue("gradingType", "auto");
    }
  }, [selectedType, selectedGradingType, setValue]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      reset();
      setMediaId(null);
      setPdfFileName(null);
      setUploadProgress(null);
    }
  }, [isOpen, reset]);

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Vui lòng tải tệp tin dạng PDF.");
      return;
    }

    setPdfFileName(file.name);
    setUploadProgress(0);

    try {
      const presign = await createPresignedUpload({
        resourceType: "document",
        fileName: file.name,
        contentType: file.type || "application/pdf",
        fileSize: file.size,
      });

      await uploadFileDirectly(presign.uploadUrl, file, setUploadProgress);
      await completeUpload({ mediaId: presign.mediaId });

      setMediaId(presign.mediaId);
      toast.success("Tải tài liệu đính kèm thành công.");
    } catch (err) {
      toast.error("Không thể tải tài liệu đính kèm.");
      setPdfFileName(null);
    } finally {
      setUploadProgress(null);
    }
  };

  const onSubmit = async (data: CreateAssessmentFormValues) => {
    if (data.type === "exam" && !mediaId) {
      toast.error("Đề thi dạng Exam PDF yêu cầu phải tải lên tệp tin PDF trước khi tạo.");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createAssessmentMutation.mutateAsync({
        title: data.title.trim(),
        subject: data.subject as Subject,
        grade: data.grade,
        type: data.type,
        gradingType: data.gradingType,
        timeLimitMinutes: data.timeLimitMinutes || null,
        sourceMediaId: data.type === "exam" ? mediaId : null,
      });

      toast.success("Đã khởi tạo đề thi nháp thành công!");
      onClose();
      router.push(`/admin/assessments/builder?id=${created.id}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Khởi tạo đề thi thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-admin-border bg-admin-surface-low p-6 shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 duration-200 text-admin-cream">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-lg border border-admin-border bg-admin-bg text-admin-cream hover:border-admin-pink/60 flex items-center justify-center transition cursor-pointer"
        >
          <X size={14} className="text-admin-cream hover:text-admin-pink" />
        </button>

        <h3 className="text-lg font-bold uppercase tracking-wider text-admin-pink flex items-center gap-1.5 border-b border-admin-border/60 pb-3">
          <BookOpenCheck size={18} /> Thiết lập đề thi mới
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-admin-muted block">
              Tiêu đề đề thi
            </label>
            <input
              type="text"
              {...register("title")}
              placeholder="Nhập tiêu đề (Ví dụ: Đề kiểm tra Toán 15 phút)"
              className="w-full rounded-lg border border-admin-border bg-admin-deep px-3 py-2 text-xs text-admin-cream outline-none focus:border-admin-pink font-bold"
            />
            {errors.title && (
              <p className="text-red-400 text-xs font-semibold">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Subject */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-admin-muted block">
                Môn học
              </label>
              <select
                {...register("subject")}
                className="w-full rounded-lg border border-admin-border bg-admin-deep px-3 py-2 text-xs text-admin-cream outline-none focus:border-admin-pink font-bold cursor-pointer"
              >
                {Object.entries(SUBJECT_LABELS).map(([value, label]) => (
                  <option key={value} value={value} className="bg-admin-surface-low">
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Grade */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-admin-muted block">
                Khối lớp
              </label>
              <select
                {...register("grade")}
                className="w-full rounded-lg border border-admin-border bg-admin-deep px-3 py-2 text-xs text-admin-cream outline-none focus:border-admin-pink font-bold cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                  <option key={g} value={g} className="bg-admin-surface-low">
                    Lớp {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Type */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-admin-muted block">
                Loại đề
              </label>
              <div className="grid grid-cols-2 rounded-lg bg-admin-deep p-0.5 border border-admin-border/80 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setValue("type", "quiz")}
                  className={`py-1.5 rounded-md transition-all cursor-pointer ${
                    selectedType === "quiz"
                      ? "bg-admin-pink text-admin-bg"
                      : "text-admin-muted hover:text-admin-cream"
                  }`}
                >
                  Quiz
                </button>
                <button
                  type="button"
                  onClick={() => setValue("type", "exam")}
                  className={`py-1.5 rounded-md transition-all cursor-pointer ${
                    selectedType === "exam"
                      ? "bg-admin-pink text-admin-bg"
                      : "text-admin-muted hover:text-admin-cream"
                  }`}
                >
                  Exam PDF
                </button>
              </div>
            </div>

            {/* Grading Type */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-admin-muted block">
                Hình thức chấm
              </label>
              <select
                {...register("gradingType")}
                className="w-full rounded-lg border border-admin-border bg-admin-deep px-3 py-2 text-xs text-admin-cream outline-none focus:border-admin-pink font-bold cursor-pointer"
              >
                <option value="auto" className="bg-admin-surface-low">Tự động chấm</option>
                {selectedType === "exam" && (
                  <option value="manual" className="bg-admin-surface-low">Tự luận chấm tay</option>
                )}
                <option value="mixed" className="bg-admin-surface-low">Hỗn hợp (Trắc nghiệm + Tự luận)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Time Limit */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-admin-muted block">
                Thời gian (phút)
              </label>
              <input
                type="number"
                {...register("timeLimitMinutes")}
                className="w-full rounded-lg border border-admin-border bg-admin-deep px-3 py-2 text-xs text-admin-cream outline-none focus:border-admin-pink font-bold"
              />
              {errors.timeLimitMinutes && (
                <p className="text-red-400 text-xs font-semibold">
                  {errors.timeLimitMinutes.message}
                </p>
              )}
            </div>
          </div>

          {/* Exam PDF Uploader */}
          {selectedType === "exam" && (
            <div className="space-y-2 border border-admin-border/40 rounded-xl bg-admin-deep/40 p-4">
              <label className="text-xs font-bold uppercase text-admin-muted block">
                Đính kèm đề thi PDF gốc
              </label>
              {pdfFileName ? (
                <div className="flex items-center justify-between rounded-lg border border-admin-border bg-admin-deep px-3 py-2 text-xs font-bold text-admin-cream">
                  <span className="truncate max-w-[200px]">{pdfFileName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaId(null);
                      setPdfFileName(null);
                    }}
                    className="text-red-400 hover:text-red-300 font-bold"
                  >
                    Xóa
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-admin-border hover:border-admin-pink/60 rounded-lg p-5 cursor-pointer transition text-admin-muted hover:text-admin-cream">
                  <Upload size={20} className="mb-2" />
                  <span className="text-xs font-bold">Tải lên tệp PDF</span>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handlePdfUpload}
                    disabled={uploadProgress !== null}
                  />
                </label>
              )}
              {uploadProgress !== null && (
                <div className="w-full bg-admin-border rounded-full h-1.5 overflow-hidden mt-2">
                  <div
                    className="bg-admin-pink h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-admin-border/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-admin-border text-xs font-bold text-admin-cream hover:bg-admin-deep transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (selectedType === "exam" && !mediaId)}
              className="px-4 py-2 rounded bg-admin-pink text-xs font-bold text-admin-bg hover:brightness-110 active:scale-95 disabled:opacity-40 transition cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? "Đang khởi tạo..." : "Tạo & Vào Builder"}
              <ArrowRight size={13} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
