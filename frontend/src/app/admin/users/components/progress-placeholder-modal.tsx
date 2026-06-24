"use client";

import { X, Award, BookOpen, Clock, Calendar, CheckCircle2 } from "lucide-react";
import { AdminUserItem } from "@/features/users/types";

type ProgressPlaceholderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  student: AdminUserItem | null;
};

// Mock data to demonstrate visual excellence
const MOCK_COURSES_PROGRESS = [
  {
    id: "1",
    title: "Toán học giải tích lớp 12 nâng cao",
    teacher: "Nguyễn Văn Thầy",
    completed: 8,
    total: 10,
    progress: 80,
    lastActive: "2 giờ trước",
    status: "active",
  },
  {
    id: "2",
    title: "Vật lý hạt nhân và lượng tử ánh sáng lớp 12",
    teacher: "Trần Thế Vật Lý",
    completed: 3,
    total: 10,
    progress: 30,
    lastActive: "1 ngày trước",
    status: "active",
  },
  {
    id: "3",
    title: "Hóa học hữu cơ lớp 11 chuyên sâu",
    teacher: "Lê Kim Hóa",
    completed: 0,
    total: 8,
    progress: 0,
    lastActive: "Chưa bắt đầu",
    status: "not_started",
  },
];

export default function ProgressPlaceholderModal({
  isOpen,
  onClose,
  student,
}: ProgressPlaceholderModalProps) {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-admin-deep/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-admin-deep w-full max-w-xl rounded shadow-2xl border border-admin-border/30 relative flex flex-col my-auto max-h-[90vh] overflow-hidden text-admin-cream animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-admin-muted hover:text-admin-cream transition-colors cursor-pointer"
          type="button"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-admin-border/20 bg-admin-surface-low/30">
          <h3 className="text-lg font-bold text-admin-cream flex items-center gap-2">
            <Award className="text-admin-pink w-6 h-6" />
            Tiến Độ Học Tập
          </h3>
          <p className="text-sm text-admin-muted mt-2">
            Hồ sơ học tập của học sinh: <span className="font-bold text-admin-cream">{student.fullName}</span> ({student.email})
          </p>
        </div>

        {/* Body Content */}
        <div className="flex-grow overflow-y-auto px-8 py-6 space-y-6 custom-scrollbar">
          {/* General KPIs mockup */}
          <div className="grid grid-cols-3 gap-4 bg-admin-surface-low/40 p-4 rounded-xl border border-admin-border/10">
            <div className="text-center">
              <p className="text-xs uppercase font-bold text-admin-muted tracking-wider">Khóa học</p>
              <p className="text-xl font-bold text-admin-cream mt-1">3</p>
            </div>
            <div className="text-center border-x border-admin-border/10">
              <p className="text-xs uppercase font-bold text-admin-muted tracking-wider">Đang học</p>
              <p className="text-xl font-bold text-amber-400 mt-1">2</p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase font-bold text-admin-muted tracking-wider">Hoàn thành</p>
              <p className="text-xl font-bold text-emerald-400 mt-1">0</p>
            </div>
          </div>

          {/* Detailed Course Progress List */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-admin-muted">
              Danh sách khóa học đã tham gia ({MOCK_COURSES_PROGRESS.length})
            </p>

            <div className="space-y-3">
              {MOCK_COURSES_PROGRESS.map((course) => (
                <div
                  key={course.id}
                  className="bg-admin-surface-low/30 border border-admin-border/20 rounded-xl p-4 space-y-3 hover:border-admin-pink/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-admin-cream line-clamp-1">
                        {course.title}
                      </h4>
                      <p className="text-xs text-admin-muted mt-0.5">
                        Giảng viên: <span className="font-semibold">{course.teacher}</span>
                      </p>
                    </div>
                    {course.progress === 100 && (
                      <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-admin-muted">Tiến trình học tập</span>
                      <span className="text-admin-cream">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-admin-surface-low rounded-full h-2 overflow-hidden border border-admin-border/10">
                      <div
                        className="bg-admin-pink h-full rounded-full transition-all duration-500"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Extra statistics */}
                  <div className="flex justify-between items-center text-xs text-admin-muted pt-1">
                    <div className="flex items-center gap-1">
                      <BookOpen size={12} />
                      <span>{course.completed}/{course.total} bài học</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>Hoạt động cuối: {course.lastActive}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Development Info Alert */}
          <div className="bg-admin-pink/10 border border-admin-pink/20 rounded-xl p-4 flex gap-3 text-admin-cream">
            <Calendar size={18} className="text-admin-pink flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-xs font-bold uppercase tracking-wider text-admin-pink">Dữ liệu thử nghiệm</h5>
              <p className="text-xs text-admin-muted leading-relaxed">
                Các số liệu tiến trình, thời gian hoạt động và danh sách khóa học ở trên hiện tại là dữ liệu giả lập (mockup) phục vụ hiển thị thiết kế UX. Tính năng thu thập dữ liệu học tập thời gian thực từ phía học sinh đang được phát triển ở bước tiếp theo.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-admin-border/20 bg-admin-surface-low/30 text-right rounded-b-2xl">
          <button
            onClick={onClose}
            className="bg-admin-surface-low border border-admin-border/30 hover:border-admin-pink/50 text-admin-cream px-6 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
