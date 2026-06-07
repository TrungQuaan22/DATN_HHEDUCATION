"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { AssessmentItem, SUBJECT_LABELS } from "../assessments-mock";

interface StartAssessmentModalProps {
  isOpen: boolean;
  assessment: AssessmentItem | null;
  onClose: () => void;
}

export function StartAssessmentModal({
  isOpen,
  assessment,
  onClose,
}: StartAssessmentModalProps) {
  if (!isOpen || !assessment) return null;

  const handleStartExam = () => {
    alert("Simulating starting the test... Dynamic test taker UI will open.");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-deep-black border border-border-dark rounded w-full max-w-lg overflow-hidden shadow-2xl animate-in scale-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-dark/40 flex justify-between items-center bg-off-black">
          <h3 className="font-extrabold text-[16px] text-cream flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            Xác nhận bắt đầu làm bài
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
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <span className="text-[10px] font-black text-brand-pink bg-brand-pink/10 px-2 py-0.5 rounded border border-brand-pink/20 uppercase tracking-widest">
              {SUBJECT_LABELS[assessment.subject]}
            </span>
            <h4 className="text-[18px] font-extrabold text-cream leading-tight">
              {assessment.title}
            </h4>
            <p className="text-xs text-muted-text">
              Thuộc khóa học: {assessment.courseTitle}
            </p>
          </div>

          {/* Rules and Info Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded bg-brand-dark border border-border-dark">
            <div>
              <span className="text-[10px] text-muted-text block uppercase font-bold">
                Thời gian làm bài
              </span>
              <span className="text-[15px] font-extrabold text-cream">
                {assessment.durationMinutes} phút
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-text block uppercase font-bold">
                Hình thức bài thi
              </span>
              <span className="text-[15px] font-extrabold text-cream">
                {assessment.type === "exam"
                  ? "Thi chính thức (GPA)"
                  : "Bài tập luyện tập"}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-text block uppercase font-bold">
                Số lượng câu hỏi
              </span>
              <span className="text-[15px] font-extrabold text-cream">
                20 câu trắc nghiệm
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-text block uppercase font-bold">
                Số lần làm tối đa
              </span>
              <span className="text-[15px] font-extrabold text-cream">
                1 lần duy nhất
              </span>
            </div>
          </div>

          {/* Warning Alert */}
          <div className="flex gap-3 p-3.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <AlertTriangle size={20} className="shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed font-semibold">
              <span className="font-extrabold uppercase">
                Cảnh báo quy chế thi:
              </span>{" "}
              Đây là bài kiểm tra tính vào điểm GPA của bạn. Hệ thống sẽ khóa
              bài làm nếu bạn chuyển tab hoặc rời khỏi màn hình quá 3 lần. Đảm
              bảo kết nối mạng ổn định trước khi bấm bắt đầu.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-off-black border-t border-border-dark/40 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded border border-border-dark bg-deep-black text-[12px] font-bold text-cream hover:text-brand-pink transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleStartExam}
            className="px-5 py-2.5 rounded bg-brand-pink text-brand-dark hover:scale-105 active:scale-95 font-extrabold text-[12px] transition-all cursor-pointer"
          >
            Bắt đầu làm bài
          </button>
        </div>
      </div>
    </div>
  );
}
