"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { X, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
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

export default function EnrollStudentModal({
  isOpen,
  onClose,
  student,
}: EnrollStudentModalProps) {
  const [teacherId, setTeacherId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [manualReason, setManualReason] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

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
      setFormError(errMsg);
      toast.error(errMsg);
    },
  });

  const isSaving = enrollMutation.isPending;

  useEffect(() => {
    if (isOpen) {
      setTeacherId("");
      setCourseId("");
      setManualReason("");
      setFormError(null);
    }
  }, [isOpen]);

  if (!isOpen || !student) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!teacherId) {
      setFormError("Vui lòng chọn giảng viên phụ trách để hiển thị khóa học");
      return;
    }
    if (!courseId) {
      setFormError("Vui lòng chọn khóa học muốn gán");
      return;
    }

    // Only send userId, courseId, and manualReason to the backend API
    enrollMutation.mutate({
      userId: student.id,
      courseId,
      manualReason: manualReason.trim() || undefined,
    });
  };

  const handleClose = () => {
    setTeacherId("");
    setCourseId("");
    setManualReason("");
    setFormError(null);
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
          <h3 className="text-2xl font-bold font-serif text-admin-cream flex items-center justify-center gap-2">
            Gán Khóa Học Thủ Công
          </h3>
          <p className="text-sm text-admin-muted mt-2 max-w-sm mx-auto">
            Gán khóa học đã phát hành cho học sinh <span className="font-bold text-admin-cream">{student.fullName}</span> ({student.email})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto px-8 py-6 space-y-4 custom-scrollbar">
          {formError && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Teacher Select for local filtering */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-admin-muted block uppercase tracking-wider">
              Chọn giảng viên để lọc khóa học <span className="text-admin-pink">*</span>
            </label>
            <SearchableTeacherSelect
              value={teacherId}
              onChange={(val) => {
                setTeacherId(val);
                setCourseId(""); // reset course when teacher changes
              }}
              error={!teacherId && !!formError}
            />
          </div>

          {/* Course Select */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-admin-muted block uppercase tracking-wider">
              Chọn khóa học <span className="text-admin-pink">*</span>
            </label>
            <SearchableCourseSelect
              value={courseId}
              onChange={setCourseId}
              coursesList={coursesList}
              isLoading={isLoadingCourses}
              disabled={!teacherId || isLoadingCourses}
              error={!courseId && !!formError}
            />
            {!teacherId && (
              <p className="text-xs text-admin-muted italic mt-1">
                * Vui lòng chọn giảng viên phụ trách trước để xem danh sách khóa học.
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-admin-muted block uppercase tracking-wider">
              Lý do thêm thủ công <span className="text-admin-muted/50">(Tùy chọn)</span>
            </label>
            <textarea
              value={manualReason}
              onChange={(e) => setManualReason(e.target.value)}
              placeholder="Nhập lý do cấp quyền học tập (Ví dụ: Học bổng nội bộ, hỗ trợ đặc biệt...)"
              rows={3}
              maxLength={500}
              className="w-full bg-admin-surface-low border border-admin-border/30 focus:border-admin-pink focus:outline-none focus:ring-1 focus:ring-admin-pink rounded px-4 py-3 text-admin-cream placeholder:text-admin-muted/40 transition-all font-medium text-[14px] resize-none"
            />
            <div className="text-right text-[11px] text-admin-muted">
              {manualReason.length}/500 ký tự
            </div>
          </div>
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
            onClick={handleSubmit}
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
