"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, AlertCircle, ArrowRight } from "lucide-react";
import ImageUploadField from "@/components/media/image-upload-field";
import { Subject, SUBJECT_LABELS } from "@/types/common";
import { createAdminCourse, updateAdminCourse } from "../api";
import { CreateCourseRequest, AdminCourseSummary } from "../types";
import { useMeQuery } from "@/features/auth/hooks";
import { useTeacherOptionsQuery } from "../hooks";
import { SearchableTeacherSelect } from "./SearchableTeacherSelect";
import { getApiErrorMessage, UI_MESSAGES } from "@/lib/constants/messages";
import { toast } from "@/stores/toast-store";
import {
  courseCreateSchema,
  CourseCreateFormInput,
  CourseCreateInput,
} from "../validation";

type CourseCreateEditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: AdminCourseSummary | null;
};

export default function CourseCreateEditModal({
  isOpen,
  onClose,
  onSuccess,
  initialData = null,
}: CourseCreateEditModalProps) {
  const [generalError, setGeneralError] = useState<string | null>(null);

  const { data: currentUser } = useMeQuery();
  const { data: teacherOptions = [] } = useTeacherOptionsQuery();
  const userRole = currentUser?.role;
  const isTeacher = userRole === "teacher";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CourseCreateFormInput, unknown, CourseCreateInput>({
    resolver: zodResolver(courseCreateSchema),
    defaultValues: {
      title: "",
      subject: "math",
      grade: 12,
      teacherId: "",
      price: 0,
      salePrice: null,
      description: "",
      isFeatured: false,
      thumbnailMediaId: null,
    },
  });

  const selectedTeacherId = watch("teacherId");

  const createMutation = useMutation({
    mutationFn: createAdminCourse,
    onSuccess: () => {
      toast.success(UI_MESSAGES.courses.createSuccess);
      onSuccess();
      handleClose();
    },
    onError: (err: unknown) => {
      console.error("Error creating course:", err);
      const errMsg = getApiErrorMessage(err, UI_MESSAGES.courses.createFailed);
      setGeneralError(errMsg);
      toast.error(errMsg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateCourseRequest>;
    }) => updateAdminCourse(id, payload),
    onSuccess: () => {
      toast.success("Cập nhật khóa học thành công.");
      onSuccess();
      handleClose();
    },
    onError: (err: unknown) => {
      console.error("Error updating course:", err);
      const errMsg = getApiErrorMessage(err, "Cập nhật khóa học thất bại.");
      setGeneralError(errMsg);
      toast.error(errMsg);
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (isOpen) {
      setGeneralError(null);

      if (initialData) {
        reset({
          title: initialData.title,
          subject: initialData.subject,
          grade: initialData.grade,
          teacherId: initialData.teacherId,
          price: initialData.price,
          salePrice: initialData.salePrice,
          description: initialData.description || "",
          isFeatured: initialData.isFeatured || false,
          thumbnailMediaId: initialData.thumbnailMediaId,
        });
      } else {
        // Dynamically select default teacherId
        let defaultTeacherId = "";
        if (isTeacher && currentUser) {
          defaultTeacherId = currentUser.id;
        } else if (teacherOptions.length > 0) {
          defaultTeacherId = teacherOptions[0].id;
        }

        reset({
          title: "",
          subject: "math",
          grade: 12,
          teacherId: defaultTeacherId,
          price: 0,
          salePrice: null,
          description: "",
          isFeatured: false,
          thumbnailMediaId: null,
        });
      }
    }
  }, [isOpen, currentUser, userRole, teacherOptions, initialData, reset]);

  if (!isOpen) return null;

  const onFormSubmit = async (data: CourseCreateInput) => {
    setGeneralError(null);

    const payload: CreateCourseRequest = {
      title: data.title,
      subject: data.subject as Subject,
      grade: data.grade,
      teacherId: isTeacher && currentUser ? currentUser.id : data.teacherId,
      description: data.description?.trim() || undefined,
      price: data.price,
      salePrice: data.salePrice !== null ? data.salePrice : undefined,
      isFeatured: data.isFeatured,
      thumbnailMediaId: data.thumbnailMediaId || undefined,
    };

    if (initialData) {
      updateMutation.mutate({ id: initialData.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleClose = () => {
    reset();
    setGeneralError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-admin-deep/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-admin-deep w-full max-w-2xl rounded shadow-2xl border border-admin-border/30 relative flex flex-col my-auto max-h-[90vh] overflow-hidden text-admin-cream animate-in fade-in zoom-in duration-200">
        <button
          onClick={handleClose}
          disabled={isSaving}
          className="absolute top-6 right-6 text-admin-muted hover:text-admin-cream transition-colors disabled:opacity-40 disabled:pointer-events-none"
          type="button"
        >
          <X size={20} />
        </button>

        <div className="px-8 pt-8 pb-6 text-center border-b border-admin-border/20 bg-admin-surface-low/30">
          <h3 className="text-lg font-bold text-admin-cream flex items-center justify-center gap-2">
            {initialData ? "Chỉnh sửa Khóa học" : "Tạo Khóa Học Mới"}
          </h3>
          <p className="text-sm text-admin-muted mt-2 max-w-md mx-auto">
            {initialData
              ? "Cập nhật các thông tin cơ bản của khóa học."
              : "Thiết lập thông tin cơ bản để bắt đầu xây dựng nội dung học tập."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex-grow overflow-y-auto px-8 py-6 space-y-5 custom-scrollbar"
        >
          {generalError && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-admin-muted block uppercase tracking-wider">
              Tên khóa học <span className="text-admin-pink">*</span>
            </label>
            <input
              type="text"
              {...register("title")}
              placeholder="Ví dụ: Toán giải tích 12 nâng cao"
              className={`w-full bg-admin-surface-low border focus:outline-none focus:ring-1 rounded px-4 py-3 text-admin-cream placeholder:text-admin-muted/40 transition-all font-medium text-sm ${
                errors.title
                  ? "border-red-500/50 focus:border-red-500 focus:ring-red-500"
                  : "border-admin-border/30 focus:border-admin-pink focus:ring-admin-pink"
              }`}
            />
            {errors.title && (
              <p className="text-red-400 text-xs mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-admin-muted block uppercase tracking-wider">
                Môn học
              </label>
              <select
                {...register("subject")}
                className={`w-full bg-admin-surface-low border focus:outline-none focus:ring-1 rounded px-4 py-3 text-admin-cream transition-all font-medium text-sm appearance-none ${
                  errors.subject
                    ? "border-red-500/50 focus:border-red-500 focus:ring-red-500"
                    : "border-admin-border/30 focus:border-admin-pink focus:ring-admin-pink"
                }`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23AF9DA6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 1rem center",
                  backgroundSize: "1rem",
                }}
              >
                {Object.entries(SUBJECT_LABELS).map(([key, value]) => (
                  <option
                    key={key}
                    value={key}
                    className="bg-admin-deep text-admin-cream"
                  >
                    {value}
                  </option>
                ))}
              </select>
              {errors.subject && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.subject.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-admin-muted block uppercase tracking-wider">
                Khối lớp
              </label>
              <select
                {...register("grade")}
                className={`w-full bg-admin-surface-low border focus:outline-none focus:ring-1 rounded px-4 py-3 text-admin-cream transition-all font-medium text-sm appearance-none ${
                  errors.grade
                    ? "border-red-500/50 focus:border-red-500 focus:ring-red-500"
                    : "border-admin-border/30 focus:border-admin-pink focus:ring-admin-pink"
                }`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23AF9DA6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 1rem center",
                  backgroundSize: "1rem",
                }}
              >
                {[9, 10, 11, 12].map((g) => (
                  <option
                    key={g}
                    value={g}
                    className="bg-admin-deep text-admin-cream"
                  >
                    Lớp {g}
                  </option>
                ))}
              </select>
              {errors.grade && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.grade.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-admin-muted block uppercase tracking-wider">
              Giảng viên phụ trách
            </label>
            <SearchableTeacherSelect
              value={selectedTeacherId}
              onChange={(val) =>
                setValue("teacherId", val, { shouldValidate: true })
              }
              disabled={isTeacher}
              isTeacher={isTeacher}
              currentUser={currentUser}
              error={!!errors.teacherId}
            />
            <input type="hidden" {...register("teacherId")} />
            {errors.teacherId && (
              <p className="text-red-400 text-xs mt-1">
                {errors.teacherId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-admin-muted block uppercase tracking-wider">
                Giá gốc (VND) <span className="text-admin-pink">*</span>
              </label>
              <input
                type="number"
                min="0"
                {...register("price")}
                className={`w-full bg-admin-surface-low border focus:outline-none focus:ring-1 rounded px-4 py-3 text-admin-cream placeholder:text-admin-muted/40 transition-all font-medium text-sm ${
                  errors.price
                    ? "border-red-500/50 focus:border-red-500 focus:ring-red-500"
                    : "border-admin-border/30 focus:border-admin-pink focus:ring-admin-pink"
                }`}
              />
              {errors.price && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-admin-muted block uppercase tracking-wider">
                Giá khuyến mãi (VND)
              </label>
              <input
                type="number"
                min="0"
                {...register("salePrice", {
                  setValueAs: (v) => (v === "" ? null : Number(v)),
                })}
                placeholder="Để trống nếu không giảm giá"
                className={`w-full bg-admin-surface-low border focus:outline-none focus:ring-1 rounded px-4 py-3 text-admin-cream placeholder:text-admin-muted/40 transition-all font-medium text-sm ${
                  errors.salePrice
                    ? "border-red-500/50 focus:border-red-500 focus:ring-red-500"
                    : "border-admin-border/30 focus:border-admin-pink focus:ring-admin-pink"
                }`}
              />
              {errors.salePrice && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.salePrice.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-admin-muted block uppercase tracking-wider">
              Mô tả ngắn
            </label>
            <textarea
              {...register("description")}
              placeholder="Nhập tóm tắt nội dung chính của khóa học..."
              rows={3}
              className={`w-full bg-admin-surface-low border focus:outline-none focus:ring-1 rounded px-4 py-3 text-admin-cream placeholder:text-admin-muted/40 transition-all font-medium text-sm resize-none ${
                errors.description
                  ? "border-red-500/50 focus:border-red-500 focus:ring-red-500"
                  : "border-admin-border/30 focus:border-admin-pink focus:ring-admin-pink"
              }`}
            />
            {errors.description && (
              <p className="text-red-400 text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-admin-muted block uppercase tracking-wider">
              Ảnh bìa khóa học
            </label>
            <ImageUploadField
              value={watch("thumbnailMediaId")}
              onChange={(val) =>
                setValue("thumbnailMediaId", val, { shouldValidate: true })
              }
              initialUrl={initialData?.thumbnailUrl}
              error={errors.thumbnailMediaId?.message}
            />
          </div>

          <div className="flex items-center justify-between py-3 border-t border-admin-border/20">
            <div>
              <p className="text-sm font-bold text-admin-cream">
                Khóa học nổi bật (Featured)
              </p>
              <p className="text-xs text-admin-muted mt-0.5">
                Hiển thị khóa học này ở trang chủ và danh sách nổi bật.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register("isFeatured")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-admin-surface-low border border-admin-border/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-admin-muted after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-pink peer-checked:after:bg-white peer-checked:border-admin-pink"></div>
            </label>
          </div>

          {/* Hidden field to link schema state */}
          <input type="hidden" {...register("thumbnailMediaId")} />
        </form>

        <div className="px-8 py-5 border-t border-admin-border/20 bg-admin-surface-low/30 flex items-center justify-between rounded-b-2xl">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="px-6 py-2.5 text-sm font-bold text-admin-muted hover:text-admin-cream transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
          >
            Hủy
          </button>

          <button
            type="submit"
            onClick={handleSubmit(onFormSubmit)}
            disabled={isSaving}
            className="bg-admin-pink text-white px-8 py-3 text-sm font-bold rounded shadow-lg shadow-admin-pink/20 hover:brightness-110 transition-all flex items-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isSaving
              ? "Đang lưu..."
              : initialData
              ? "Lưu thay đổi"
              : "Tạo khóa học & Tiếp tục"}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
