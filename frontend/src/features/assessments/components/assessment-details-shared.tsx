"use client";

import React, { useMemo } from "react";
import {
  Clock,
  Award,
  History,
  Info,
  Calendar,
  AlertTriangle,
  CircleDot
} from "lucide-react";
import { type RuntimeAssessment } from "../types";
import { SUBJECT_LABELS } from "@/types/common";

const formatDate = (dateString: string | null, fallback: string) => {
  if (!dateString) return fallback;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("vi-VN") + " " + date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

const getGradingTypeLabel = (gradingType: string) => {
  switch (gradingType) {
    case "auto":
      return "Tự động chấm";
    case "manual":
      return "Giáo viên chấm";
    case "mixed":
      return "Tự động & Giáo viên chấm";
    default:
      return "Tự động chấm";
  }
};

// 1. Badge Header Component
export function AssessmentHeaderBadges({ assessment }: { assessment: RuntimeAssessment }) {
  const isQuiz = assessment.assessment.type === "quiz";
  const totalQuestions = useMemo(() => {
    return assessment.sections?.flatMap((s) => s.items).length || 0;
  }, [assessment]);

  return (
    <div className="flex flex-wrap gap-2">
      <span className="px-4 py-1 rounded-full bg-surface-container-highest border border-outline-variant text-cream text-xs font-semibold">
        {SUBJECT_LABELS[assessment.assessment.subject] || assessment.assessment.subject}
      </span>
      <span className="px-4 py-1 rounded-full bg-surface-container-highest border border-outline-variant text-cream text-xs font-semibold">
        Lớp {assessment.assessment.grade}
      </span>
      <span className="px-4 py-1 rounded-full bg-surface-container-highest border border-outline-variant text-cream text-xs font-semibold">
        {isQuiz ? "Quiz Trắc Nghiệm" : "Exam PDF"}
      </span>
      <span className="px-4 py-1 rounded-full bg-surface-container-highest border border-outline-variant text-cream text-xs font-semibold">
        {totalQuestions} câu hỏi
      </span>
    </div>
  );
}

// 2. Bento Metadata Grid Component
export function AssessmentMetadataGrid({ assessment }: { assessment: RuntimeAssessment }) {
  const max = assessment.maxAttempts ?? null;
  const timeLimit = assessment.timeLimitMinutes;

  const totalScore = useMemo(() => {
    const items = assessment.sections?.flatMap((section) => section.items) || [];
    if (items.length === 0) return 10;
    return items.reduce((sum, item) => sum + Number(item.maxScore || 0), 0);
  }, [assessment]);

  const items = [
    {
      icon: Clock,
      label: "Thời gian làm bài",
      value: timeLimit ? `${timeLimit} phút` : "Tự do",
      colorClass: "text-primary bg-primary/10",
    },
    {
      icon: Award,
      label: "Điểm tối đa",
      value: `${totalScore} điểm`,
      colorClass: "text-secondary bg-secondary/10",
    },
    {
      icon: History,
      label: "Số lượt tối đa",
      value: max ? `${max} lần` : "Không giới hạn",
      colorClass: "text-warning bg-warning/10",
    },
    {
      icon: CircleDot,
      label: "Hình thức chấm",
      value: getGradingTypeLabel(assessment.assessment.gradingType),
      colorClass: "text-info bg-info/10",
    },
    {
      icon: Calendar,
      label: "Ngày mở đề",
      value: formatDate(assessment.openTime, "Bất cứ lúc nào"),
      colorClass: "text-success bg-success/10",
    },
    {
      icon: AlertTriangle,
      label: "Hạn kết thúc",
      value: formatDate(assessment.closeTime, "Không giới hạn"),
      colorClass: "text-error bg-error/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map((item, idx) => {
        const IconComponent = item.icon;
        return (
          <div key={idx} className="glass-panel p-4 rounded-xl flex items-center gap-4 border border-outline-variant/20">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${item.colorClass}`}>
              <IconComponent size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-muted-text text-xs uppercase tracking-wider font-semibold truncate">
                {item.label}
              </p>
              <p className="text-cream font-bold text-body-md sm:text-lg truncate">
                {item.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 3. Rules & Warnings Callout Component
export function AssessmentRulesInstructions() {
  return (
    <div className="bg-warning/5 border border-warning/20 p-4 rounded-xl flex gap-3 items-start shadow-md">
      <Info className="text-warning shrink-0 mt-0.5" size={20} />
      <div className="text-on-surface-variant text-body-md leading-relaxed space-y-2">
        <p className="font-bold text-warning text-sm uppercase tracking-wider">
          Quy tắc và hướng dẫn làm bài:
        </p>
        <ul className="space-y-1.5 text-xs text-muted-text list-disc list-inside">
          <li>
            Bấm <span className="font-bold text-warning">&quot;Lưu tạm&quot;</span> sau mỗi câu trả lời để đảm bảo không mất dữ liệu khi mất kết nối mạng đột ngột.
          </li>
          <li>
            Khi đã bắt đầu lượt thi, đồng hồ đếm ngược sẽ chạy liên tục và không thể tạm dừng.
          </li>
          <li>
            Bạn có thể nộp bài bất kỳ lúc nào hoặc hệ thống sẽ tự động nộp khi hết giờ.
          </li>
          <li>
            Hãy chắc chắn thiết bị của bạn có kết nối internet ổn định trước khi bắt đầu.
          </li>
        </ul>
      </div>
    </div>
  );
}
