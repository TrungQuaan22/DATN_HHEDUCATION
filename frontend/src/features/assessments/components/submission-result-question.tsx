import {
  Check,
  CheckCircle2,
  CircleDashed,
  CircleX,
  Info,
  Split,
  X,
} from "lucide-react";

import type { StudentSubmissionResultItem } from "../types";
import { getAssessmentContentLabel } from "../utils/result-content";

const OUTCOME = {
  correct: {
    label: "Đúng",
    icon: CheckCircle2,
    style: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  },
  partial: {
    label: "Đúng một phần",
    icon: Split,
    style: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  },
  incorrect: {
    label: "Sai",
    icon: CircleX,
    style: "border-red-400/30 bg-red-400/10 text-red-300",
  },
  unanswered: {
    label: "Chưa trả lời",
    icon: CircleDashed,
    style: "border-admin-border/40 text-admin-muted",
  },
};

export function SubmissionResultQuestion({
  item,
  isPdfExam,
}: {
  item: StudentSubmissionResultItem;
  isPdfExam: boolean;
}) {
  const outcome = OUTCOME[item.outcome];
  const OutcomeIcon = outcome.icon;
  const explanation = getAssessmentContentLabel(item.explanation, "");

  return (
    <article className="rounded-xl border border-admin-border/30 bg-admin-surface-low">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-admin-border/25 px-5 py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-admin-muted">
            <span>Câu {item.questionNumber}</span>
            <span aria-hidden="true">·</span>
            <span>
              {item.pointEarned}/{item.maxScore} điểm
            </span>
          </div>
          <h3 className="mt-2 text-base font-semibold leading-7 text-admin-cream">
            {getAssessmentContentLabel(
              item.content,
              isPdfExam
                ? `Nội dung câu ${item.questionNumber} trong đề PDF`
                : "Câu hỏi",
            )}
          </h3>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${outcome.style}`}
        >
          <OutcomeIcon size={13} aria-hidden="true" /> {outcome.label}
        </span>
      </header>

      <div className="space-y-4 px-5 py-5">
        {item.itemType === "mcq" && (
          <div className="space-y-2">
            {item.options.map((option, index) => {
              const selectedWrong = option.isSelected && !option.isCorrect;
              const style = option.isCorrect
                ? "border-emerald-400/35 bg-emerald-400/10"
                : selectedWrong
                  ? "border-red-400/35 bg-red-400/10"
                  : "border-admin-border/30 bg-admin-deep";
              return (
                <div
                  key={option.id}
                  className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${style}`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${option.isCorrect ? "border-emerald-400/40 text-emerald-300" : selectedWrong ? "border-red-400/40 text-red-300" : "border-admin-border/40 text-admin-muted"}`}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  <p className="min-w-0 flex-1 pt-0.5 text-sm leading-6 text-admin-cream">
                    {getAssessmentContentLabel(
                      option.content,
                      `Lựa chọn ${String.fromCharCode(65 + index)}`,
                    )}
                  </p>
                  <div className="flex shrink-0 flex-wrap justify-end gap-1.5 text-xs font-semibold">
                    {option.isSelected && (
                      <span
                        className={
                          selectedWrong ? "text-red-300" : "text-emerald-300"
                        }
                      >
                        Bạn chọn
                      </span>
                    )}
                    {option.isCorrect && (
                      <span className="inline-flex items-center gap-1 text-emerald-300">
                        <Check size={12} /> Đáp án đúng
                      </span>
                    )}
                    {selectedWrong && (
                      <X
                        size={13}
                        className="text-red-300"
                        aria-label="Đáp án sai"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {item.itemType === "true_false" && (
          <div className="space-y-2">
            {item.trueFalseStatements.map((statement, index) => (
              <div
                key={statement.id}
                className={`flex flex-col gap-2 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${statement.isCorrect ? "border-emerald-400/30 bg-emerald-400/10" : statement.selectedValue === null ? "border-admin-border/30 bg-admin-deep" : "border-red-400/30 bg-red-400/10"}`}
              >
                <p className="text-sm leading-6 text-admin-cream">
                  <span className="mr-2 font-semibold text-admin-muted">
                    {String.fromCharCode(97 + index)})
                  </span>
                  {getAssessmentContentLabel(
                    statement.content,
                    `Mệnh đề ${index + 1}`,
                  )}
                </p>
                <div className="flex shrink-0 gap-3 text-xs font-semibold">
                  <span
                    className={
                      statement.isCorrect ? "text-emerald-300" : "text-red-300"
                    }
                  >
                    Bạn chọn:{" "}
                    {statement.selectedValue === null
                      ? "—"
                      : statement.selectedValue
                        ? "Đúng"
                        : "Sai"}
                  </span>
                  <span className="text-emerald-300">
                    Đáp án: {statement.correctValue ? "Đúng" : "Sai"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {item.itemType === "numeric" && item.numericAnswer && (
          <div className="grid gap-3 sm:grid-cols-2">
            <AnswerValue
              label="Câu trả lời của bạn"
              value={item.numericAnswer.submittedValue ?? "Chưa trả lời"}
              tone={item.outcome === "correct" ? "success" : "error"}
            />
            <AnswerValue
              label="Đáp án đúng"
              value={item.numericAnswer.correctValue ?? "Chưa cấu hình"}
              tone="success"
            />
          </div>
        )}

        {item.itemType === "essay" && item.essayAnswer && (
          <div className="space-y-3">
            <AnswerValue
              label="Bài làm của bạn"
              value={item.essayAnswer.answer || "Chưa trả lời"}
            />
            {item.essayAnswer.teacherNote && (
              <AnswerValue
                label="Nhận xét của giáo viên"
                value={item.essayAnswer.teacherNote}
                tone="info"
              />
            )}
          </div>
        )}

        {explanation && (
          <div className="rounded-lg border border-sky-400/25 bg-sky-400/10 px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-300">
              <Info size={14} aria-hidden="true" /> Hướng dẫn và lời giải
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-admin-cream">
              {explanation}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

function AnswerValue({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "success" | "error" | "info";
}) {
  const style =
    tone === "success"
      ? "border-emerald-400/30 bg-emerald-400/10"
      : tone === "error"
        ? "border-red-400/30 bg-red-400/10"
        : tone === "info"
          ? "border-sky-400/25 bg-sky-400/10"
          : "border-admin-border/30 bg-admin-deep";
  return (
    <div className={`rounded-lg border px-4 py-3 ${style}`}>
      <p className="text-xs font-semibold text-admin-muted">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-admin-cream">
        {value}
      </p>
    </div>
  );
}
