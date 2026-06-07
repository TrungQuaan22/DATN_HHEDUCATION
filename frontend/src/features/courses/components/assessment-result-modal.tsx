"use client";

import React from "react";
import { CheckCircle2, X } from "lucide-react";
import { AssessmentItem } from "../assessments-mock";

interface AssessmentResultModalProps {
  isOpen: boolean;
  assessment: AssessmentItem | null;
  onClose: () => void;
}

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
};

export function AssessmentResultModal({
  isOpen,
  assessment,
  onClose,
}: AssessmentResultModalProps) {
  if (!isOpen || !assessment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-deep-black border border-border-dark rounded w-full max-w-lg overflow-hidden shadow-2xl animate-in scale-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-dark/40 flex justify-between items-center bg-off-black">
          <h3 className="font-extrabold text-[16px] text-cream flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-500" />
            Kết quả bài kiểm tra chi tiết
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-text hover:text-brand-pink transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="space-y-1">
            <h4 className="text-[18px] font-extrabold text-cream leading-tight">
              {assessment.title}
            </h4>
            <p className="text-xs text-muted-text">
              Khóa học: {assessment.courseTitle}
            </p>
          </div>

          {/* Score Display Ring */}
          <div className="flex items-center gap-6 p-4 rounded bg-brand-dark border border-border-dark">
            <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 flex flex-col items-center justify-center shrink-0">
              <span className="text-[20px] font-black text-emerald-400">
                {assessment.score?.toFixed(1)}
              </span>
              <span className="text-[9px] text-muted-text font-bold">/ 10</span>
            </div>
            <div className="space-y-1.5 flex-grow">
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider w-fit block">
                Đã đạt yêu cầu
              </span>
              <p className="text-[12px] font-semibold text-cream leading-snug">
                Bạn đã hoàn thành xuất sắc bài kiểm tra với số điểm nằm trong
                top 15% của lớp học.
              </p>
            </div>
          </div>

          {/* Summary Stats Table */}
          <div className="grid grid-cols-2 gap-3.5 text-xs">
            <div className="p-3 rounded-lg bg-off-black border border-border-dark/40">
              <span className="text-[10px] text-muted-text block uppercase font-bold mb-0.5">
                Thời gian hoàn thành
              </span>
              <span className="font-extrabold text-cream">24 phút 15 giây</span>
            </div>
            <div className="p-3 rounded-lg bg-off-black border border-border-dark/40">
              <span className="text-[10px] text-muted-text block uppercase font-bold mb-0.5">
                Số câu trả lời đúng
              </span>
              <span className="font-extrabold text-emerald-400">
                18 / 20 câu
              </span>
            </div>
            <div className="p-3 rounded-lg bg-off-black border border-border-dark/40">
              <span className="text-[10px] text-muted-text block uppercase font-bold mb-0.5">
                Ngày hoàn thành
              </span>
              <span className="font-bold text-cream">
                {assessment.completedAt ? formatDate(assessment.completedAt) : "N/A"}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-off-black border border-border-dark/40">
              <span className="text-[10px] text-muted-text block uppercase font-bold mb-0.5">
                Hệ số tính điểm
              </span>
              <span className="font-extrabold text-amber-400">
                15% tổng điểm
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-off-black border-t border-border-dark/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded bg-brand-pink text-brand-dark hover:scale-105 active:scale-95 font-extrabold text-[12px] transition-all cursor-pointer"
          >
            Đóng lại
          </button>
        </div>
      </div>
    </div>
  );
}
