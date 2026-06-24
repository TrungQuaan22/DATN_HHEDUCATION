"use client";

import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { X, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { SearchableTeacherSelect } from "@/features/courses/components/SearchableTeacherSelect";
import { SearchableCourseSelect } from "./SearchableCourseSelect";
import { getAdminCourses } from "@/features/courses/api";
import { createManualEnrollment } from "@/features/users/api";
import { AdminUserItem } from "@/features/users/types";
import { getApiErrorMessage } from "@/lib/constants/messages";
import { toast } from "@/stores/toast-store";

type EnrollStudentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  student: AdminUserItem | null;
};

const enrollStudentSchema = z.object({
  teacherId: z.string().min(1, "Vui lòng chọn giảng viên phụ trách để hiển thị khóa học"),
  courseId: z.string().min(1, "Vui lòng chọn khóa học muốn gán"),
  manualReason: z.string().max(500, "Lý do tối đa 500 ký tự").optional().default(""),
});

type EnrollStudentFormValues = z.infer<typeof enrollStudentSchema>;

export default function EnrollStudentModal({
  isOpen,
  onClose,
  student,
}: EnrollStudentModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EnrollStudentFormValues>({
    resolver: zodResolver(enrollStudentSchema),
    defaultValues: {
      teacherId: "",
      courseId: "",
      manualReason: "",
    },
  });

  const teacherId = watch("teacherId");
  const courseId = watch("courseId");
  const manualReason = watch("manualReason");

  // Reset course selection when teacher changes
  useEffect(() => {
    setValue("courseId", "");
  }, [teacherId, setValue]);

  // Fetch published courses assigned to the selected teacher to filter options locally
  const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["admin-courses-published", teacherId],
    queryFn: () =>
      getAdminCourses({
        teacherId: teacherId || undefined,
        status: "published",
        limit: 100,
      }),
    enabled: isOpen && !!teacherId,
  });

  const coursesList = coursesData?.items || [];

  const enrollMutation = useMutation({
    mutationFn: createManualEnrollment,
    onSuccess: () => {
      toast.success(`Gán khóa học cho học sinh ${student?.fullName} thành công!`);
      handleClose();
    },
    onError: (err: unknown) => {
      console.error("Error manual enrollment:", err);
      const errMsg = getApiErrorMessage(err, "Gán khóa học thủ công thất bại.");
      toast.error(errMsg);
    },
  });

  const isSaving = enrollMutation.isPending;

  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  if (!isOpen || !student) return null;

  const onFormSubmit = (data: EnrollStudentFormValues) => {
    enrollMutation.mutate({
      userId: student.id,
      courseId: data.courseId,
      manualReason: data.manualReason.trim() || undefined,
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-admin-deep/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-admin-deep w-full max-w-lg rounded shadow-2xl border border-admin-border/30 relative flex flex-col my-auto max-h-[90vh] overflow-hidden text-admin-cream animate-in fade-in zoom-in duration-200">
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
            Gán Khóa Học Thủ Công
          </h3>
          <p className="text-sm text-admin-muted mt-2 max-w-sm mx-auto">
            Gán khóa học đã phát hành cho học sinh{" "}
            <span className="font-bold text-admin-cream">{student.fullName}</span> ({student.email})
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex-grow overflow-y-auto px-8 py-6 space-y-4 custom-scrollbar"
        >
          {/* Teacher Select for local filtering */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-admin-muted block uppercase tracking-wider">
              Chọn giảng viên để lọc khóa học <span className="text-admin-pink">*</span>
            </label>
            <SearchableTeacherSelect
              value={teacherId}
              onChange={(val) => setValue("teacherId", val, { shouldValidate: true })}
              error={!!errors.teacherId}
            />
            {errors.teacherId && (
              <p className="text-red-400 text-xs mt-1">{errors.teacherId.message}</p>
            )}
          </div>

          {/* Course Select */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-admin-muted block uppercase tracking-wider">
              Chọn khóa học <span className="text-admin-pink">*</span>
            </label>
            <SearchableCourseSelect
              value={courseId}
              onChange={(val) => setValue("courseId", val, { shouldValidate: true })}
              coursesList={coursesList}
              isLoading={isLoadingCourses}
              disabled={!teacherId || isLoadingCourses}
              error={!!errors.courseId}
            />
            {errors.courseId && (
              <p className="text-red-400 text-xs mt-1">{errors.courseId.message}</p>
            )}
            {!teacherId && (
              <p className="text-xs text-admin-muted italic mt-1">
                * Vui lòng chọn giảng viên phụ trách trước để xem danh sách khóa học.
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-admin-muted block uppercase tracking-wider">
              Lý do thêm thủ công <span className="text-admin-muted/50">(Tùy chọn)</span>
            </label>
            <textarea
              {...register("manualReason")}
              placeholder="Nhập lý do cấp quyền học tập (Ví dụ: Học bổng nội bộ, hỗ trợ đặc biệt...)"
              rows={3}
              maxLength={500}
              className="w-full bg-admin-surface-low border border-admin-border/30 focus:border-admin-pink focus:outline-none focus:ring-1 focus:ring-admin-pink rounded px-4 py-3 text-admin-cream placeholder:text-admin-muted/40 transition-all font-medium text-sm resize-none"
            />
            {errors.manualReason && (
              <p className="text-red-400 text-xs mt-1">{errors.manualReason.message}</p>
            )}
            <div className="text-right text-xs text-admin-muted">
              {(manualReason || "").length}/500 ký tự
            </div>
          </div>

          {/* Form submit button in the form for semantic structure */}
          <button type="submit" className="hidden" id="enroll-student-submit-btn">
            Submit
          </button>
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
            type="button"
            onClick={() => document.getElementById("enroll-student-submit-btn")?.click()}
            disabled={isSaving}
            className="bg-admin-pink text-white px-6 py-2.5 text-sm font-bold rounded shadow-lg shadow-admin-pink/20 hover:brightness-110 transition-all flex items-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? "Đang xử lý..." : "Gán học viên"}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
