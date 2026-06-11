"use client";

import React from "react";
import { Sparkles, Eye } from "lucide-react";
import { AdminGradingSubmissionSummary } from "../types";

interface EssayGradingSidebarProps {
  submissions: AdminGradingSubmissionSummary[];
  onSelectSubmission: (submissionId: string) => void;
}

export function EssayGradingSidebar({
  submissions,
  onSelectSubmission,
}: EssayGradingSidebarProps) {
  return (
    <div className="rounded-xl border border-admin-border bg-admin-surface-low overflow-hidden shadow-sm h-fit">
      <div className="border-b border-admin-border/60 px-4 py-4 bg-admin-bg/35">
        <h3 className="text-sm font-bold text-admin-cream flex items-center gap-2">
          <Sparkles size={16} className="text-amber-500 animate-pulse" />
          Chờ chấm tự luận ({submissions.length})
        </h3>
        <p className="mt-1 text-xs text-admin-muted">
          Cần giáo viên vào xem và cho điểm thủ công các câu tự luận.
        </p>
      </div>
      <div className="divide-y divide-admin-border/60 max-h-[500px] overflow-y-auto">
        {submissions.length === 0 ? (
          <div className="p-8 text-center text-xs font-bold text-admin-muted">
            Không có bài làm nào chờ chấm điểm.
          </div>
        ) : (
          submissions.map((submission) => (
            <button
              key={submission.id}
              type="button"
              onClick={() => onSelectSubmission(submission.id)}
              className="w-full gap-3 p-4 text-left transition hover:bg-admin-bg/40 flex flex-col items-start"
            >
              <div className="flex w-full items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-admin-cream line-clamp-2">
                    {submission.assessment.title}
                  </h4>
                  <p className="mt-1 text-[11px] text-admin-muted">
                    Học sinh: {submission.student.fullName}
                  </p>
                  <p className="text-[10px] text-admin-muted">
                    Lượt làm: #{submission.attemptNumber}
                  </p>
                </div>
                <Eye size={14} className="shrink-0 text-admin-pink mt-0.5" />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="rounded bg-admin-bg px-2 py-0.5 text-[9px] font-bold text-admin-muted">
                  Đoạn trắc nghiệm: {submission.autoScore ?? "0"}đ
                </span>
                <span className="rounded bg-admin-bg px-2 py-0.5 text-[9px] font-bold text-admin-pink">
                  Tự luận: {submission.gradedEssayCount}/{submission.essayCount} câu
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
