"use client";

import React from "react";
import { Award, Check, X, HelpCircle } from "lucide-react";
import { MockQuestion } from "../practice-mock";

interface PracticeResultProps {
  quizQuestions: MockQuestion[];
  userAnswers: Record<string, "A" | "B" | "C" | "D">;
  finalScore: number;
  correctCount: number;
  quitPractice: () => void;
}

export function PracticeResult({
  quizQuestions,
  userAnswers,
  finalScore,
  correctCount,
  quitPractice,
}: PracticeResultProps) {
  if (quizQuestions.length === 0) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Result Score Banner */}
      <div className="bg-deep-black border border-border-dark rounded-3xl p-6 md:p-8 text-center space-y-4 relative overflow-hidden">
        <div className="absolute w-44 h-44 bg-brand-pink/5 rounded-full blur-3xl pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>

        <div className="inline-flex p-3 rounded-full bg-brand-pink/10 text-brand-pink mb-1">
          <Award
            size={36}
            className="drop-shadow-[0_0_8px_rgba(255,105,180,0.3)]"
          />
        </div>

        <div className="space-y-1 relative z-10">
          <h3 className="text-base font-bold text-muted-text uppercase tracking-widest">
            KẾT QUẢ TỰ LUYỆN AI
          </h3>
          <div className="text-5xl font-black text-brand-pink leading-none drop-shadow-[0_0_15px_rgba(255,105,180,0.4)]">
            {finalScore}{" "}
            <span className="text-xl text-muted-text font-bold">/ 10</span>
          </div>
          <p className="text-xs text-muted-text max-w-sm mx-auto pt-2">
            Bạn trả lời đúng{" "}
            <span className="text-emerald-400 font-extrabold">
              {correctCount} / {quizQuestions.length}
            </span>{" "}
            câu hỏi. Đã cập nhật kết quả vào Lịch sử.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={quitPractice}
            className="bg-brand-pink text-brand-dark font-extrabold text-xs px-6 py-2.5 rounded hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            Quay lại Phòng luyện tập
          </button>
        </div>
      </div>

      {/* Details list of questions with answers and explanation */}
      <div className="space-y-5">
        <h4 className="text-sm font-bold text-cream px-1">
          Chi tiết đáp án & giải thích
        </h4>

        {quizQuestions.map((q, idx) => {
          const userAns = userAnswers[q.id];
          const isCorrect = userAns === q.correctAnswer;

          return (
            <div
              key={q.id}
              className="bg-deep-black border border-border-dark rounded p-5 md:p-6 space-y-4"
            >
              <div className="flex justify-between items-center text-xs font-bold text-muted-text border-b border-border-dark/40 pb-2">
                <span>CÂU HỎI {idx + 1}</span>
                <span
                  className={
                    isCorrect
                      ? "text-emerald-400 flex items-center gap-1"
                      : "text-red-400 flex items-center gap-1"
                  }
                >
                  {isCorrect ? (
                    <Check size={14} className="stroke-[3]" />
                  ) : (
                    <X size={14} className="stroke-[3]" />
                  )}
                  {isCorrect ? "Đúng" : "Sai"}
                </span>
              </div>

              <p className="text-sm font-bold text-cream leading-relaxed">
                {q.content}
              </p>

              {/* Options display with results check */}
              <div className="grid grid-cols-1 gap-2.5 pt-1">
                {q.options.map((opt) => {
                  const isCorrectOpt = opt.key === q.correctAnswer;
                  const isUserSelected = opt.key === userAns;

                  let btnStyle = "bg-brand-dark border-border-dark text-cream";
                  let badgeStyle = "bg-off-black text-muted-text";

                  if (isCorrectOpt) {
                    btnStyle =
                      "bg-emerald-500/10 border-emerald-500/40 text-emerald-400";
                    badgeStyle =
                      "bg-emerald-500 text-brand-dark font-extrabold";
                  } else if (isUserSelected && !isCorrect) {
                    btnStyle = "bg-red-500/10 border-red-500/40 text-red-400";
                    badgeStyle = "bg-red-500 text-brand-dark font-extrabold";
                  }

                  return (
                    <div
                      key={opt.key}
                      className={`p-3.5 rounded text-xs font-semibold border flex items-center gap-3 ${btnStyle}`}
                    >
                      <span
                        className={`w-5.5 h-5.5 rounded-md flex items-center justify-center text-xs font-black shrink-0 ${badgeStyle}`}
                      >
                        {opt.key}
                      </span>
                      <span>{opt.text}</span>
                    </div>
                  );
                })}
              </div>

              {/* Explanation card */}
              <div className="p-4 rounded bg-brand-dark border border-border-dark flex gap-3 text-xs leading-relaxed">
                <HelpCircle
                  size={18}
                  className="text-brand-pink shrink-0 mt-0.5"
                />
                <div>
                  <span className="font-bold text-brand-pink">
                    Giải thích đáp án:
                  </span>{" "}
                  <span className="text-muted-text font-medium">
                    {q.explanation}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
