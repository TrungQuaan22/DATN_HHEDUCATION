"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  useAdminGradingSubmissionQuery,
  useGradeEssayMutation,
  useFinalizeSubmissionMutation,
} from "../hooks";

interface EssayGradingModalProps {
  submissionId: string;
  onClose: () => void;
}

export function EssayGradingModal({ submissionId, onClose }: EssayGradingModalProps) {
  const { data: selectedSubmission, isLoading } = useAdminGradingSubmissionQuery(submissionId);
  const gradeEssayMutation = useGradeEssayMutation();
  const finalizeMutation = useFinalizeSubmissionMutation();

  const [gradeDraft, setGradeDraft] = useState<Record<string, { score: string; note: string }>>({});

  useEffect(() => {
    if (selectedSubmission) {
      const draftByItem = selectedSubmission.essayAnswers.reduce<Record<string, { score: string; note: string }>>(
        (acc, answer) => {
          acc[answer.itemId] = {
            score: answer.teacherScore ?? "",
            note: answer.teacherNote ?? "",
          };
          return acc;
        },
        {}
      );
      setGradeDraft(draftByItem);
    }
  }, [selectedSubmission]);

  const handleSaveGrade = async (itemId: string, maxScore: number) => {
    if (!selectedSubmission) return;

    const draftValue = gradeDraft[itemId];
    const score = Number(draftValue?.score);

    if (isNaN(score) || score < 0 || score > maxScore) {
      toast.error(`Điểm số phải là số từ 0 đến ${maxScore}.`);
      return;
    }

    try {
      await gradeEssayMutation.mutateAsync({
        submissionId: selectedSubmission.id,
        payload: {
          itemId,
          teacherScore: score,
          teacherNote: draftValue?.note || null,
        },
      });
      toast.success("Lưu điểm tự luận thành công.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể lưu điểm.";
      toast.error(message);
    }
  };

  const handleFinalizeSubmission = async () => {
    if (!selectedSubmission) return;

    try {
      await finalizeMutation.mutateAsync(selectedSubmission.id);
      toast.success("Hoàn thành chấm điểm bài làm.");
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể hoàn tất bài chấm.";
      toast.error(message);
    }
  };

  const isMutating = gradeEssayMutation.isPending || finalizeMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl border border-admin-border bg-admin-surface-low shadow-2xl flex flex-col">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-admin-pink border-t-transparent"></div>
            <p className="text-sm font-bold text-admin-muted">Đang tải chi tiết bài làm...</p>
          </div>
        ) : !selectedSubmission ? (
          <div className="p-8 text-center text-sm text-admin-muted">
            Không tìm thấy bài làm.
            <button onClick={onClose} className="mt-4 block mx-auto text-admin-pink underline">
              Đóng
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4 border-b border-admin-border/60 px-6 py-4 bg-admin-bg/30">
              <div>
                <h3 className="text-base font-bold text-admin-cream">
                  Chấm điểm tự luận: {selectedSubmission.assessment.title}
                </h3>
                <p className="mt-1 text-xs text-admin-muted">
                  Học sinh:{" "}
                  <span className="text-admin-cream">{selectedSubmission.student.fullName}</span>{" "}
                  ({selectedSubmission.student.email}) | Điểm trắc nghiệm:{" "}
                  <span className="text-admin-pink font-bold">
                    {selectedSubmission.autoScore ?? "0"}đ
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-admin-border bg-admin-bg px-3 py-1.5 text-xs font-bold text-admin-cream hover:border-admin-pink hover:text-admin-pink active:scale-95 transition"
              >
                Đóng
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {selectedSubmission.essayAnswers.map((answer) => {
                const gradingItems = selectedSubmission.sections.flatMap((section) => section.items);
                const item = gradingItems.find((entry) => entry.id === answer.itemId);
                const draftValue = gradeDraft[answer.itemId] ?? { score: "", note: "" };

                // Extract query/question label
                let contentLabel = "Câu hỏi tự luận";
                if (item?.question?.content) {
                  if (typeof item.question.content === "string") {
                    contentLabel = item.question.content;
                  } else if (
                    typeof item.question.content === "object" &&
                    "label" in item.question.content
                  ) {
                    contentLabel = (item.question.content as any).label || "";
                  }
                }

                const maxScore = Number(item?.maxScore ?? 0);

                return (
                  <div
                    key={answer.id}
                    className="rounded-xl border border-admin-border bg-admin-bg p-5 space-y-4 shadow-inner"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-admin-border/30 pb-3">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-admin-pink">
                          Câu {item?.questionNumber || "-"} | Điểm tối đa: {maxScore}đ
                        </div>
                        <h4 className="mt-1 text-sm font-bold text-admin-cream">{contentLabel}</h4>
                      </div>
                      {answer.teacherScore !== null && (
                        <span className="rounded-full bg-admin-pink/10 px-3 py-1 text-xs font-bold text-admin-pink border border-admin-pink/20">
                          Đã chấm: {answer.teacherScore}đ
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-bold text-admin-muted">
                        Bài làm của học sinh:
                      </div>
                      <div className="whitespace-pre-wrap rounded-lg border border-admin-border bg-admin-deep p-4 text-sm leading-relaxed text-admin-cream">
                        {answer.answer}
                      </div>
                    </div>

                    {/* Grading Form */}
                    <div className="grid gap-3 sm:grid-cols-[140px_1fr_120px] items-end pt-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-admin-muted">Nhập điểm:</label>
                        <input
                          type="number"
                          min={0}
                          max={maxScore}
                          step={0.1}
                          value={draftValue.score}
                          onChange={(e) =>
                            setGradeDraft((prev) => ({
                              ...prev,
                              [answer.itemId]: {
                                ...draftValue,
                                score: e.target.value,
                              },
                            }))
                          }
                          placeholder="0.0"
                          className="w-full rounded-lg border border-admin-border bg-admin-surface-low px-3 py-2 text-sm text-admin-cream outline-none focus:border-admin-pink"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-admin-muted">
                          Nhận xét của giáo viên:
                        </label>
                        <input
                          type="text"
                          value={draftValue.note}
                          onChange={(e) =>
                            setGradeDraft((prev) => ({
                              ...prev,
                              [answer.itemId]: {
                                ...draftValue,
                                note: e.target.value,
                              },
                            }))
                          }
                          placeholder="Nhận xét bài làm..."
                          className="w-full rounded-lg border border-admin-border bg-admin-surface-low px-3 py-2 text-sm text-admin-cream outline-none focus:border-admin-pink"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={isMutating}
                        onClick={() => handleSaveGrade(answer.itemId, maxScore)}
                        className="w-full rounded-lg bg-admin-pink px-4 py-2 text-xs font-bold text-admin-bg transition hover:brightness-110 active:scale-95 disabled:opacity-50"
                      >
                        {gradeEssayMutation.isPending &&
                        gradeEssayMutation.variables?.payload.itemId === answer.itemId
                          ? "Đang lưu..."
                          : "Lưu điểm câu này"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 border-t border-admin-border/60 px-6 py-4 bg-admin-bg/30">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-admin-border px-4 py-2 text-xs font-bold text-admin-cream hover:border-admin-pink transition active:scale-95"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleFinalizeSubmission}
                disabled={isMutating}
                className="rounded-lg bg-admin-pink px-5 py-2 text-xs font-bold text-admin-bg transition hover:brightness-110 active:scale-95 disabled:opacity-50"
              >
                {finalizeMutation.isPending ? "Đang khóa..." : "Hoàn tất & Khóa điểm"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
