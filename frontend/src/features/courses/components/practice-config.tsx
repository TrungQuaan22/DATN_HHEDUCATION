"use client";

import React from "react";
import { Brain, Sparkles, History, ArrowRight, AlertCircle } from "lucide-react";
import { HistoryItem } from "../practice-mock";

interface PracticeConfigProps {
  selectedSubject: "math" | "literature" | "english";
  setSelectedSubject: (sub: "math" | "literature" | "english") => void;
  difficulty: "easy" | "medium" | "hard";
  setDifficulty: (diff: "easy" | "medium" | "hard") => void;
  historyList: HistoryItem[];
  handleStartPractice: (subject?: "math" | "literature" | "english") => void;
}

export function PracticeConfig({
  selectedSubject,
  setSelectedSubject,
  difficulty,
  setDifficulty,
  historyList,
  handleStartPractice,
}: PracticeConfigProps) {
  return (
    <>
      <div>
        <h2 className="text-[22px] font-extrabold text-cream">
          Phòng luyện tập tự do
        </h2>
        <p className="text-[13px] text-muted-text mt-1">
          Nâng cao kỹ năng tự học với hệ thống câu hỏi thông minh AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Config Panel */}
        <div className="lg:col-span-8 space-y-6">
          {/* Banner AI */}
          <div className="bg-gradient-to-r from-brand-pink/15 via-brand-pink/5 to-transparent border border-border-dark p-6 rounded space-y-4">
            <div className="flex items-center gap-2.5 text-brand-pink">
              <Brain
                size={22}
                className="drop-shadow-[0_0_8px_rgba(255,105,180,0.4)]"
              />
              <h3 className="text-[16px] font-extrabold">
                Luyện tập chủ động cùng AI
              </h3>
            </div>
            <p className="text-xs text-muted-text max-w-xl leading-relaxed">
              Hệ thống tự động thiết kế câu hỏi trắc nghiệm dựa theo đúng
              nội dung bài học và năng lực hiện tại của bạn. Thử sức ngay để
              củng cố và thăng tiến điểm số!
            </p>
          </div>

          {/* Form Config AI */}
          <div className="bg-deep-black border border-border-dark rounded p-6 space-y-6">
            <h4 className="text-[14px] font-bold text-cream flex items-center gap-2">
              <Sparkles size={16} className="text-brand-pink" />
              Cấu hình đề tự luyện AI
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Select Subject */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-text uppercase tracking-wider">
                  Chọn môn học
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) =>
                    setSelectedSubject(e.target.value as any)
                  }
                  className="w-full bg-brand-dark text-cream border border-border-dark rounded px-4 py-3 text-[13px] font-bold outline-none cursor-pointer hover:border-brand-pink/50 transition-colors"
                >
                  <option value="literature">Ngữ Văn (3 câu)</option>
                  <option value="math">Toán Học (3 câu)</option>
                  <option value="english">Anh Văn (3 câu)</option>
                </select>
              </div>

              {/* Select Difficulty */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-text uppercase tracking-wider">
                  Chọn độ khó
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["easy", "medium", "hard"] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficulty(level)}
                      className={`py-3 rounded text-[12px] font-bold border transition-all cursor-pointer ${
                        difficulty === level
                          ? "bg-brand-pink border-brand-pink text-brand-dark shadow-sm"
                          : "bg-brand-dark border-border-dark text-cream hover:border-brand-pink/30 hover:text-brand-pink"
                      }`}
                    >
                      {level === "easy" && "Dễ"}
                      {level === "medium" && "Vừa"}
                      {level === "hard" && "Khó"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-border-dark/40 pt-5 flex items-center justify-between">
              <div className="text-[11px] text-muted-text flex items-center gap-1.5">
                <AlertCircle size={14} className="text-brand-pink" />
                <span>Thời gian làm bài mặc định: 5 phút</span>
              </div>
              <button
                type="button"
                onClick={() => handleStartPractice()}
                className="bg-brand-pink text-brand-dark font-extrabold text-[12px] px-6 py-3 rounded hover:scale-105 transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Brain size={14} />
                Tạo đề & Làm bài ngay
              </button>
            </div>
          </div>

          {/* Recommendation lists */}
          <div className="space-y-4">
            <h3 className="text-[14px] font-bold text-cream">
              Gợi ý ôn luyện hôm nay
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Topic card 1 */}
              <div className="bg-deep-black p-5 rounded border border-border-dark space-y-4 flex flex-col justify-between hover:border-brand-pink/20 transition-all group">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-extrabold text-brand-pink bg-brand-pink/10 px-2 py-0.5 rounded border border-brand-pink/20 uppercase tracking-wider w-fit block">
                    Đọc hiểu Văn học
                  </span>
                  <h4 className="text-[14px] font-bold text-cream group-hover:text-brand-pink transition-colors leading-snug">
                    Luyện tập kiến thức từ Hán Việt & Văn học
                  </h4>
                  <p className="text-[11px] text-muted-text leading-relaxed">
                    Củng cố từ vựng, ngữ nghĩa Hán Việt và các điển tích
                    điển cố trong văn học hiện đại.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleStartPractice("literature")}
                  className="w-full text-center bg-brand-dark border border-border-dark text-[11px] font-bold py-2.5 rounded hover:border-brand-pink hover:text-brand-pink transition-all cursor-pointer"
                >
                  Bắt đầu ôn Ngữ Văn
                </button>
              </div>

              {/* Topic card 2 */}
              <div className="bg-deep-black p-5 rounded border border-border-dark space-y-4 flex flex-col justify-between hover:border-brand-pink/20 transition-all group">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider w-fit block">
                    Giải tích nâng cao
                  </span>
                  <h4 className="text-[14px] font-bold text-cream group-hover:text-emerald-400 transition-colors leading-snug">
                    Luyện tập Hàm số & Khối đa diện
                  </h4>
                  <p className="text-[11px] text-muted-text leading-relaxed">
                    Cực trị hàm số, các dạng bài về thể tích hình chóp, khối
                    lăng trụ tròn.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleStartPractice("math")}
                  className="w-full text-center bg-brand-dark border border-border-dark text-[11px] font-bold py-2.5 rounded hover:border-emerald-500 hover:text-emerald-400 transition-all cursor-pointer"
                >
                  Bắt đầu ôn Toán học
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel: History */}
        <div className="lg:col-span-4">
          <div className="bg-deep-black rounded p-5 border border-border-dark space-y-5 sticky top-[88px]">
            <h3 className="text-[14px] font-bold text-cream flex items-center gap-2 border-b border-border-dark/40 pb-3">
              <History size={16} className="text-brand-pink" />
              Lịch sử luyện tập
            </h3>

            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
              {historyList.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-1 rounded-lg hover:bg-brand-dark/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded bg-brand-pink/10 flex items-center justify-center text-brand-pink shrink-0 border border-brand-pink/10">
                    <Brain size={18} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="text-[13px] font-bold text-cream truncate">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-muted-text mt-0.5">
                      {item.score} / {item.totalScore} •{" "}
                      {item.questionCount} câu • {item.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border-dark/40 pt-4 text-center">
              <button
                type="button"
                className="text-[11px] font-bold text-brand-pink hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                Xem tất cả lịch sử
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
