"use client";

import React from "react";
import { ArrowLeft, Clock, ArrowRight } from "lucide-react";
import { MockQuestion, SUBJECT_LABELS } from "../practice-mock";

interface PracticeQuizProps {
  quizQuestions: MockQuestion[];
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  userAnswers: Record<string, "A" | "B" | "C" | "D">;
  selectAnswer: (questionId: string, optionKey: "A" | "B" | "C" | "D") => void;
  timeLeft: number;
  difficulty: "easy" | "medium" | "hard";
  selectedSubject: "math" | "literature" | "english";
  handleQuizSubmit: () => void;
  quitPractice: () => void;
}

const formatTimer = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export function PracticeQuiz({
  quizQuestions,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  userAnswers,
  selectAnswer,
  timeLeft,
  difficulty,
  selectedSubject,
  handleQuizSubmit,
  quitPractice,
}: PracticeQuizProps) {
  if (quizQuestions.length === 0) return null;

  const handleQuitConfirm = () => {
    if (
      confirm(
        "Bạn có chắc muốn thoát? Kết quả bài luyện tập này sẽ không được lưu."
      )
    ) {
      quitPractice();
    }
  };

  const activeQuestion = quizQuestions[currentQuestionIndex];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header Progress and Timer */}
      <div className="bg-deep-black border border-border-dark rounded p-5 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handleQuitConfirm}
          className="flex items-center gap-1 text-xs font-bold text-muted-text hover:text-brand-pink transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          Thoát luyện tập
        </button>

        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-cream">
            Môn:{" "}
            <span className="text-brand-pink">
              {SUBJECT_LABELS[selectedSubject]}
            </span>
          </span>
          <div className="flex items-center gap-1.5 text-xs font-bold text-cream bg-brand-dark px-3 py-1.5 rounded-lg border border-border-dark">
            <Clock size={14} className="text-brand-pink" />
            <span className="font-mono text-brand-pink">
              {formatTimer(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Question Navigator bar */}
      <div className="flex gap-2 justify-center flex-wrap">
        {quizQuestions.map((_, index) => {
          const isAnswered =
            userAnswers[quizQuestions[index].id] !== undefined;
          return (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-9 h-9 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                currentQuestionIndex === index
                  ? "bg-brand-pink border-brand-pink text-brand-dark font-black"
                  : isAnswered
                  ? "bg-brand-pink/10 border-brand-pink/30 text-brand-pink"
                  : "bg-deep-black border-border-dark text-cream"
              }`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {/* Active Question Box */}
      <div className="bg-deep-black border border-border-dark rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex justify-between items-center text-xs font-bold text-muted-text border-b border-border-dark/40 pb-3">
          <span>
            CÂU HỎI {currentQuestionIndex + 1} / {quizQuestions.length}
          </span>
          <span className="text-brand-pink uppercase tracking-widest text-xs bg-brand-pink/5 border border-brand-pink/10 px-2 py-0.5 rounded">
            {difficulty === "easy"
              ? "Cơ bản"
              : difficulty === "medium"
              ? "Khá"
              : "Nâng cao"}
          </span>
        </div>

        <p className="text-base font-bold text-cream leading-relaxed">
          {activeQuestion.content}
        </p>

        {/* Answer Options list */}
        <div className="grid grid-cols-1 gap-3.5 pt-2">
          {activeQuestion.options.map((opt) => {
            const isSelected = userAnswers[activeQuestion.id] === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => selectAnswer(activeQuestion.id, opt.key)}
                className={`p-4 rounded text-left border text-sm font-bold flex items-center gap-3.5 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-brand-pink/10 border-brand-pink text-brand-pink shadow-[0_0_12px_rgba(255,105,180,0.08)]"
                    : "bg-brand-dark border-border-dark text-cream hover:border-[#303038] hover:bg-off-black"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-black shrink-0 ${
                    isSelected
                      ? "bg-brand-pink text-brand-dark"
                      : "bg-off-black text-muted-text border border-border-dark/60"
                  }`}
                >
                  {opt.key}
                </span>
                <span>{opt.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center gap-4">
        <button
          type="button"
          onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
          className={`px-5 py-2.5 rounded border border-border-dark bg-deep-black text-xs font-bold text-cream hover:text-brand-pink transition-colors cursor-pointer flex items-center gap-1 ${
            currentQuestionIndex === 0
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          <ArrowLeft size={13} />
          Câu trước
        </button>

        {currentQuestionIndex < quizQuestions.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
            className="px-5 py-2.5 rounded bg-brand-pink text-brand-dark hover:scale-105 active:scale-95 font-bold text-xs transition-all cursor-pointer flex items-center gap-1"
          >
            Câu tiếp theo
            <ArrowRight size={13} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleQuizSubmit}
            className="px-6 py-2.5 rounded bg-emerald-500 text-brand-dark hover:scale-105 active:scale-95 font-extrabold text-xs transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            Nộp bài tự luyện
          </button>
        )}
      </div>
    </div>
  );
}
