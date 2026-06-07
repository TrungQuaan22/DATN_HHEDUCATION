"use client";

import React from "react";
import { Book, Clock, Calendar, Check, FileText } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { SUBJECT_LABELS } from "@/features/courses/assessments-mock";
import { useStudentAssessments } from "@/features/courses/hooks/use-student-assessments";
import { StartAssessmentModal } from "@/features/courses/components/start-assessment-modal";
import { AssessmentResultModal } from "@/features/courses/components/assessment-result-modal";
import { AssessmentStats } from "@/features/courses/components/assessment-stats";
import { getSubjectBadgeStyles } from "@/lib/utils/subject";

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
};

export default function AssessmentsPage() {
  const {
    assessmentFilter,
    setAssessmentFilter,
    selectedAssessment,
    activeModal,
    stats,
    filteredAssessments,
    openStartModal,
    openResultModal,
    closeModal,
  } = useStudentAssessments();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div>
        <h2 className="text-[22px] font-extrabold text-cream">
          Danh sách bài kiểm tra
        </h2>
        <p className="text-[13px] text-muted-text mt-1">
          Quản lý, thực hiện và theo dõi kết quả các bài kiểm tra lớp học
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Filters and Cards List */}
        <div className="lg:col-span-8 space-y-5">
          {/* Navigation Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1.5 hide-scrollbar">
            {(["all", "upcoming", "not_done", "completed"] as const).map(
              (filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setAssessmentFilter(filter)}
                  className={`px-4 py-2 rounded text-[12px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    assessmentFilter === filter
                      ? "bg-brand-pink text-brand-dark shadow-sm"
                      : "bg-deep-black text-cream border border-border-dark hover:border-brand-pink/50 hover:text-brand-pink"
                  }`}
                >
                  {filter === "all" && "Tất cả"}
                  {filter === "upcoming" && "Sắp diễn ra"}
                  {filter === "not_done" && "Chưa làm / Trễ hạn"}
                  {filter === "completed" && "Đã hoàn thành"}
                </button>
              )
            )}
          </div>

          {/* Cards List */}
          <div className="space-y-4">
            {filteredAssessments.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Không tìm thấy bài kiểm tra nào"
                description="Hiện tại không có bài kiểm tra nào trong mục này. Vui lòng chọn bộ lọc khác."
                className="p-12"
              />
            ) : (
              filteredAssessments.map((assessment) => {
                let cardBorder = "border-brand-pink/20";
                if (assessment.status === "completed")
                  cardBorder = "border-emerald-500/20";
                if (assessment.status === "expired")
                  cardBorder = "border-red-500/20";
                if (assessment.status === "upcoming")
                  cardBorder = "border-amber-500/20";

                return (
                  <div
                    key={assessment.id}
                    className={`bg-deep-black rounded p-5 border ${cardBorder} flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between group hover:border-brand-pink/40 hover:shadow-[0_0_15px_rgba(52,211,153,0.05)] transition-all`}
                  >
                    <div className="space-y-2 flex-grow min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Type Tag */}
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                            assessment.type === "exam"
                              ? "text-brand-dark bg-amber-400"
                              : "text-muted-text bg-off-black"
                          }`}
                        >
                          {assessment.type === "exam"
                            ? "Quan trọng"
                            : "Luyện tập"}
                        </span>

                        {/* Status Badge */}
                        {assessment.status === "completed" && (
                          <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                            Đã nộp bài
                          </span>
                        )}
                        {assessment.status === "not_done" && (
                          <span className="text-[9px] font-extrabold text-brand-pink bg-brand-pink/10 px-2 py-0.5 rounded uppercase tracking-wider">
                            Chưa làm
                          </span>
                        )}
                        {assessment.status === "upcoming" && (
                          <span className="text-[9px] font-extrabold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                            Sắp diễn ra
                          </span>
                        )}
                        {assessment.status === "expired" && (
                          <span className="text-[9px] font-extrabold text-red-400 bg-red-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                            Trễ hạn
                          </span>
                        )}

                        {/* Subject Badge */}
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${getSubjectBadgeStyles(
                            assessment.subject
                          )}`}
                        >
                          {SUBJECT_LABELS[assessment.subject]}
                        </span>
                      </div>

                      <h3 className="text-[16px] font-bold text-cream group-hover:text-brand-pink transition-colors truncate">
                        {assessment.title}
                      </h3>

                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-text font-medium mt-1">
                        <span className="flex items-center gap-1.5">
                          <Book size={13} /> {assessment.courseTitle}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={13} /> {assessment.durationMinutes} phút
                        </span>

                        {assessment.status === "completed" &&
                        assessment.completedAt ? (
                          <span className="flex items-center gap-1.5 text-emerald-400">
                            <Check size={13} /> Nộp lúc{" "}
                            {formatDate(assessment.completedAt)}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <Calendar size={13} /> Hạn:{" "}
                            {formatDate(assessment.closeTime)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="w-full sm:w-auto shrink-0 mt-3 sm:mt-0">
                      {assessment.status === "not_done" && (
                        <button
                          type="button"
                          onClick={() => openStartModal(assessment)}
                          className="w-full sm:w-auto bg-brand-pink text-brand-dark hover:scale-105 active:scale-95 font-bold text-[12px] px-5 py-2.5 rounded transition-all cursor-pointer text-center"
                        >
                          Làm bài ngay
                        </button>
                      )}
                      {assessment.status === "completed" && (
                        <button
                          type="button"
                          onClick={() => openResultModal(assessment)}
                          className="w-full sm:w-auto border border-border-dark bg-off-black text-cream hover:border-brand-pink hover:text-brand-pink font-bold text-[12px] px-5 py-2.5 rounded transition-all cursor-pointer text-center"
                        >
                          Xem kết quả
                        </button>
                      )}
                      {assessment.status === "upcoming" && (
                        <button
                          type="button"
                          disabled
                          className="w-full sm:w-auto border border-border-dark text-muted-text font-bold text-[12px] px-5 py-2.5 rounded cursor-not-allowed opacity-60 text-center"
                        >
                          {assessment.remainingTimeText}
                        </button>
                      )}
                      {assessment.status === "expired" && (
                        <button
                          type="button"
                          disabled
                          className="w-full sm:w-auto border border-red-500/20 text-red-400/60 font-bold text-[12px] px-5 py-2.5 rounded cursor-not-allowed opacity-60 text-center"
                        >
                          Không thể nộp
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Statistics Summary */}
        <AssessmentStats stats={stats} />
      </div>

      {/* Start Confirmation Modal */}
      <StartAssessmentModal
        isOpen={activeModal === "start"}
        assessment={selectedAssessment}
        onClose={closeModal}
      />

      {/* Result Details Modal */}
      <AssessmentResultModal
        isOpen={activeModal === "result"}
        assessment={selectedAssessment}
        onClose={closeModal}
      />
    </div>
  );
}
