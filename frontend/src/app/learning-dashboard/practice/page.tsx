"use client";

import React, { useState, useEffect } from "react";
import { Brain, Sparkles, History, ArrowRight, BookOpen, Award, Clock, ArrowLeft, Check, X, HelpCircle, AlertCircle } from "lucide-react";

interface MockQuestion {
  id: string;
  content: string;
  options: { key: "A" | "B" | "C" | "D"; text: string }[];
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
}

interface HistoryItem {
  id: string;
  title: string;
  score: number;
  totalScore: number;
  questionCount: number;
  date: string;
}

const mockQuestionsData: Record<string, MockQuestion[]> = {
  math: [
    {
      id: "q-math-1",
      content: "Tìm tập xác định D của hàm số y = log2(x - 3).",
      options: [
        { key: "A", text: "D = (3; +∞)" },
        { key: "B", text: "D = [3; +∞)" },
        { key: "C", text: "D = R \\ {3}" },
        { key: "D", text: "D = (0; +∞)" }
      ],
      correctAnswer: "A",
      explanation: "Điều kiện xác định của hàm số logarit y = log2(u) là u > 0. Do đó x - 3 > 0 <=> x > 3. Vậy D = (3; +∞)."
    },
    {
      id: "q-math-2",
      content: "Tính đạo hàm của hàm số y = e^(2x).",
      options: [
        { key: "A", text: "y' = e^(2x)" },
        { key: "B", text: "y' = 2e^(2x)" },
        { key: "C", text: "y' = 2x * e^(2x-1)" },
        { key: "D", text: "y' = 0.5e^(2x)" }
      ],
      correctAnswer: "B",
      explanation: "Công thức đạo hàm hàm hợp (e^u)' = u' * e^u. Với u = 2x thì u' = 2. Vậy y' = 2 * e^(2x)."
    },
    {
      id: "q-math-3",
      content: "Cho khối chóp có diện tích đáy B = 6 và chiều cao h = 4. Thể tích V của khối chóp đã cho bằng bao nhiêu?",
      options: [
        { key: "A", text: "V = 24" },
        { key: "B", text: "V = 12" },
        { key: "C", text: "V = 8" },
        { key: "D", text: "V = 72" }
      ],
      correctAnswer: "C",
      explanation: "Thể tích khối chóp V = 1/3 * B * h = 1/3 * 6 * 4 = 8."
    }
  ],
  literature: [
    {
      id: "q-lit-1",
      content: "Từ Hán Việt 'Vọng phu' có nghĩa là gì?",
      options: [
        { key: "A", text: "Người vợ mong ngóng chồng" },
        { key: "B", text: "Người chồng mong ngóng vợ" },
        { key: "C", text: "Tên một địa danh nổi tiếng" },
        { key: "D", text: "Người con nhớ thương cha mẹ" }
      ],
      correctAnswer: "A",
      explanation: "'Vọng' có nghĩa là trông ngóng, 'phu' có nghĩa là người chồng. Vọng phu nghĩa là người vợ ngóng trông chồng đi lính hoặc đi xa không về."
    },
    {
      id: "q-lit-2",
      content: "Tác phẩm 'Chữ người tử tù' của Nguyễn Tuân thuộc tập truyện nào sau đây?",
      options: [
        { key: "A", text: "Sông Đà" },
        { key: "B", text: "Vang bóng một thời" },
        { key: "C", text: "Chiếc lư đồng mắt cua" },
        { key: "D", text: "Đường vui" }
      ],
      correctAnswer: "B",
      explanation: "'Chữ người tử tù' ban đầu có tên là 'Dòng chữ cuối cùng', đăng trên tạp chí Tao Đàn năm 1939, sau đó được in trong tập truyện 'Vang bóng một thời' (1940)."
    },
    {
      id: "q-lit-3",
      content: "Biện pháp tu từ nào được sử dụng chủ yếu trong câu thơ: 'Mặt trời của bắp thì nằm trên đồi / Mặt trời của mẹ, em nằm trên lưng'?",
      options: [
        { key: "A", text: "So sánh" },
        { key: "B", text: "Ẩn dụ" },
        { key: "C", text: "Hoán dụ" },
        { key: "D", text: "Nhân hóa" }
      ],
      correctAnswer: "B",
      explanation: "Hình ảnh 'Mặt trời của mẹ' là hình ảnh ẩn dụ chỉ đứa con - nguồn sáng, nguồn sống và niềm hy vọng lớn lao nhất đời người mẹ."
    }
  ],
  english: [
    {
      id: "q-eng-1",
      content: "She ________ in Hanoi since she graduated from university.",
      options: [
        { key: "A", text: "lives" },
        { key: "B", text: "has lived" },
        { key: "C", text: "lived" },
        { key: "D", text: "is living" }
      ],
      correctAnswer: "B",
      explanation: "Dấu hiệu nhận biết 'since + mốc thời gian quá khứ' chia động từ ở thì Hiện tại hoàn thành (Present Perfect): S + has/have + V3/ed."
    },
    {
      id: "q-eng-2",
      content: "Find the synonym of the word 'INTELLIGENT'.",
      options: [
        { key: "A", text: "Smart" },
        { key: "B", text: "Lazy" },
        { key: "C", text: "Beautiful" },
        { key: "D", text: "Slow" }
      ],
      correctAnswer: "A",
      explanation: "'Intelligent' có nghĩa là thông minh, đồng nghĩa với 'Smart'."
    },
    {
      id: "q-eng-3",
      content: "If it ________ tomorrow, we will cancel the outdoor picnic.",
      options: [
        { key: "A", text: "rain" },
        { key: "B", text: "rains" },
        { key: "C", text: "will rain" },
        { key: "D", text: "rained" }
      ],
      correctAnswer: "B",
      explanation: "Đây là câu điều kiện loại 1 (Conditional Sentence Type 1). Mệnh đề If chia ở thì Hiện tại đơn: If + S + V(s/es). Chủ ngữ 'it' đi với động từ thêm 's': rains."
    }
  ]
};

const SUBJECT_LABELS: Record<string, string> = {
  math: "Toán Học",
  literature: "Ngữ Văn",
  english: "Anh Văn"
};

export default function PracticeRoomPage() {
  const [activeScreen, setActiveScreen] = useState<"config" | "quiz" | "result">("config");
  
  // Config state
  const [selectedSubject, setSelectedSubject] = useState<"math" | "literature" | "english">("literature");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [questionCount, setQuestionCount] = useState<number>(3); // Standard length of mock questions

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<MockQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes
  
  // Results state
  const [finalScore, setFinalScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);

  // History state
  const [historyList, setHistoryList] = useState<HistoryItem[]>([
    {
      id: "hist-1",
      title: "Luyện tập Từ Hán Việt & Thuật ngữ",
      score: 8.0,
      totalScore: 10,
      questionCount: 10,
      date: "25/05/2026"
    },
    {
      id: "hist-2",
      title: "Luyện tập Liên kết câu trong văn bản",
      score: 9.0,
      totalScore: 10,
      questionCount: 10,
      date: "22/05/2026"
    }
  ]);

  // Timer logic for quiz
  useEffect(() => {
    if (activeScreen !== "quiz") return;
    
    if (timeLeft <= 0) {
      handleQuizSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, activeScreen]);

  const handleStartPractice = (subject = selectedSubject) => {
    const questions = mockQuestionsData[subject] || [];
    setQuizQuestions(questions);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setTimeLeft(300); // 5 minutes
    setActiveScreen("quiz");
  };

  const selectAnswer = (questionId: string, optionKey: "A" | "B" | "C" | "D") => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey
    }));
  };

  const handleQuizSubmit = () => {
    let scoreCount = 0;
    quizQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) {
        scoreCount++;
      }
    });

    const computedScore = parseFloat(((scoreCount / quizQuestions.length) * 10).toFixed(1));
    setCorrectCount(scoreCount);
    setFinalScore(computedScore);

    // Save to history list
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    const newHistoryItem: HistoryItem = {
      id: `hist-${Date.now()}`,
      title: `Luyện tập AI: ${SUBJECT_LABELS[selectedSubject]}`,
      score: computedScore,
      totalScore: 10,
      questionCount: quizQuestions.length,
      date: formattedDate
    };

    setHistoryList((prev) => [newHistoryItem, ...prev]);
    setActiveScreen("result");
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
      
      {/* -------------------- CONFIG SCREEN -------------------- */}
      {activeScreen === "config" && (
        <>
          <div>
            <h2 className="text-[22px] font-extrabold text-cream">Phòng luyện tập tự do</h2>
            <p className="text-[13px] text-muted-text mt-1">Nâng cao kỹ năng tự học với hệ thống câu hỏi thông minh AI</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Config Panel */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Banner AI */}
              <div className="bg-gradient-to-r from-brand-pink/15 via-brand-pink/5 to-transparent border border-border-dark p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-2.5 text-brand-pink">
                  <Brain size={22} className="drop-shadow-[0_0_8px_rgba(255,105,180,0.4)]" />
                  <h3 className="text-[16px] font-extrabold">Luyện tập chủ động cùng AI</h3>
                </div>
                <p className="text-xs text-muted-text max-w-xl leading-relaxed">
                  Hệ thống tự động thiết kế câu hỏi trắc nghiệm dựa theo đúng nội dung bài học và năng lực hiện tại của bạn. Thử sức ngay để củng cố và thăng tiến điểm số!
                </p>
              </div>

              {/* Form Config AI */}
              <div className="bg-[#121215] border border-[#202024] rounded-2xl p-6 space-y-6">
                <h4 className="text-[14px] font-bold text-cream flex items-center gap-2">
                  <Sparkles size={16} className="text-brand-pink" />
                  Cấu hình đề tự luyện AI
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Select Subject */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-muted-text uppercase tracking-wider">Chọn môn học</label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value as any)}
                      className="w-full bg-brand-dark text-cream border border-border-dark rounded-xl px-4 py-3 text-[13px] font-bold outline-none cursor-pointer hover:border-brand-pink/50 transition-colors"
                    >
                      <option value="literature">Ngữ Văn (3 câu)</option>
                      <option value="math">Toán Học (3 câu)</option>
                      <option value="english">Anh Văn (3 câu)</option>
                    </select>
                  </div>

                  {/* Select Difficulty */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-muted-text uppercase tracking-wider">Chọn độ khó</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["easy", "medium", "hard"] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => setDifficulty(level)}
                          className={`py-3 rounded-xl text-[12px] font-bold border transition-all cursor-pointer ${
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
                    onClick={() => handleStartPractice()}
                    className="bg-brand-pink text-brand-dark font-extrabold text-[12px] px-6 py-3 rounded-xl hover:scale-105 transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Brain size={14} />
                    Tạo đề & Làm bài ngay
                  </button>
                </div>
              </div>

              {/* Recommendation lists */}
              <div className="space-y-4">
                <h3 className="text-[14px] font-bold text-cream">Gợi ý ôn luyện hôm nay</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Topic card 1 */}
                  <div className="bg-[#121215] p-5 rounded-2xl border border-[#202024] space-y-4 flex flex-col justify-between hover:border-brand-pink/20 transition-all group">
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-extrabold text-brand-pink bg-brand-pink/10 px-2 py-0.5 rounded border border-brand-pink/20 uppercase tracking-wider w-fit block">
                        Đọc hiểu Văn học
                      </span>
                      <h4 className="text-[14px] font-bold text-cream group-hover:text-brand-pink transition-colors leading-snug">
                        Luyện tập kiến thức từ Hán Việt & Văn học
                      </h4>
                      <p className="text-[11px] text-muted-text leading-relaxed">
                        Củng cố từ vựng, ngữ nghĩa Hán Việt và các điển tích điển cố trong văn học hiện đại.
                      </p>
                    </div>
                    <button
                      onClick={() => handleStartPractice("literature")}
                      className="w-full text-center bg-brand-dark border border-border-dark text-[11px] font-bold py-2.5 rounded-xl hover:border-brand-pink hover:text-brand-pink transition-all cursor-pointer"
                    >
                      Bắt đầu ôn Ngữ Văn
                    </button>
                  </div>

                  {/* Topic card 2 */}
                  <div className="bg-[#121215] p-5 rounded-2xl border border-[#202024] space-y-4 flex flex-col justify-between hover:border-brand-pink/20 transition-all group">
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider w-fit block">
                        Giải tích nâng cao
                      </span>
                      <h4 className="text-[14px] font-bold text-cream group-hover:text-emerald-400 transition-colors leading-snug">
                        Luyện tập Hàm số & Khối đa diện
                      </h4>
                      <p className="text-[11px] text-muted-text leading-relaxed">
                        Cực trị hàm số, các dạng bài về thể tích hình chóp, khối lăng trụ tròn.
                      </p>
                    </div>
                    <button
                      onClick={() => handleStartPractice("math")}
                      className="w-full text-center bg-brand-dark border border-border-dark text-[11px] font-bold py-2.5 rounded-xl hover:border-emerald-500 hover:text-emerald-400 transition-all cursor-pointer"
                    >
                      Bắt đầu ôn Toán học
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Right panel: History */}
            <div className="lg:col-span-4">
              <div className="bg-[#121215] rounded-2xl p-5 border border-[#202024] space-y-5 sticky top-[88px]">
                <h3 className="text-[14px] font-bold text-cream flex items-center gap-2 border-b border-border-dark/40 pb-3">
                  <History size={16} className="text-brand-pink" />
                  Lịch sử luyện tập
                </h3>
                
                <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                  {historyList.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-1 rounded-lg hover:bg-brand-dark/30 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-brand-pink/10 flex items-center justify-center text-brand-pink shrink-0 border border-brand-pink/10">
                        <Brain size={18} />
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="text-[13px] font-bold text-cream truncate">{item.title}</div>
                        <div className="text-[10px] text-muted-text mt-0.5">
                          {item.score} / {item.totalScore} • {item.questionCount} câu • {item.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border-dark/40 pt-4 text-center">
                  <button className="text-[11px] font-bold text-brand-pink hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer">
                    Xem tất cả lịch sử
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </>
      )}

      {/* -------------------- ACTIVE QUIZ SCREEN -------------------- */}
      {activeScreen === "quiz" && quizQuestions.length > 0 && (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
          
          {/* Header Progress and Timer */}
          <div className="bg-[#121215] border border-[#202024] rounded-2xl p-5 flex items-center justify-between gap-4">
            <button
              onClick={() => {
                if (confirm("Bạn có chắc muốn thoát? Kết quả bài luyện tập này sẽ không được lưu.")) {
                  setActiveScreen("config");
                }
              }}
              className="flex items-center gap-1 text-[12px] font-bold text-muted-text hover:text-brand-pink transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              Thoát luyện tập
            </button>

            <div className="flex items-center gap-4">
              <span className="text-[12px] font-bold text-cream">
                Môn: <span className="text-brand-pink">{SUBJECT_LABELS[selectedSubject]}</span>
              </span>
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-cream bg-brand-dark px-3 py-1.5 rounded-lg border border-border-dark">
                <Clock size={14} className="text-brand-pink" />
                <span className="font-mono text-brand-pink">{formatTimer(timeLeft)}</span>
              </div>
            </div>
          </div>

          {/* Question Navigator bar */}
          <div className="flex gap-2 justify-center flex-wrap">
            {quizQuestions.map((_, index) => {
              const isAnswered = userAnswers[quizQuestions[index].id] !== undefined;
              return (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-9 h-9 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    currentQuestionIndex === index
                      ? "bg-brand-pink border-brand-pink text-brand-dark font-black"
                      : isAnswered
                      ? "bg-brand-pink/10 border-brand-pink/30 text-brand-pink"
                      : "bg-[#121215] border-[#202024] text-cream"
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          {/* Active Question Box */}
          <div className="bg-[#121215] border border-[#202024] rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center text-xs font-bold text-muted-text border-b border-border-dark/40 pb-3">
              <span>CÂU HỎI {currentQuestionIndex + 1} / {quizQuestions.length}</span>
              <span className="text-brand-pink uppercase tracking-widest text-[9px] bg-brand-pink/5 border border-brand-pink/10 px-2 py-0.5 rounded">
                {difficulty === "easy" ? "Cơ bản" : difficulty === "medium" ? "Khá" : "Nâng cao"}
              </span>
            </div>

            <p className="text-[16px] font-bold text-cream leading-relaxed">
              {quizQuestions[currentQuestionIndex].content}
            </p>

            {/* Answer Options list */}
            <div className="grid grid-cols-1 gap-3.5 pt-2">
              {quizQuestions[currentQuestionIndex].options.map((opt) => {
                const isSelected = userAnswers[quizQuestions[currentQuestionIndex].id] === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => selectAnswer(quizQuestions[currentQuestionIndex].id, opt.key)}
                    className={`p-4 rounded-xl text-left border text-[13px] font-bold flex items-center gap-3.5 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-brand-pink/10 border-brand-pink text-brand-pink shadow-[0_0_12px_rgba(255,105,180,0.08)]"
                        : "bg-brand-dark border-border-dark text-cream hover:border-[#303038] hover:bg-[#1a1a20]"
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-black shrink-0 ${
                      isSelected
                        ? "bg-brand-pink text-brand-dark"
                        : "bg-[#202024] text-muted-text border border-border-dark/60"
                    }`}>
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
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className={`px-5 py-2.5 rounded-xl border border-border-dark bg-[#121215] text-[12px] font-bold text-cream hover:text-brand-pink transition-colors cursor-pointer flex items-center gap-1 ${
                currentQuestionIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <ArrowLeft size={13} />
              Câu trước
            </button>

            {currentQuestionIndex < quizQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                className="px-5 py-2.5 rounded-xl bg-brand-pink text-brand-dark hover:scale-105 active:scale-95 font-bold text-[12px] transition-all cursor-pointer flex items-center gap-1"
              >
                Câu tiếp theo
                <ArrowRight size={13} />
              </button>
            ) : (
              <button
                onClick={handleQuizSubmit}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 text-brand-dark hover:scale-105 active:scale-95 font-extrabold text-[12px] transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              >
                Nộp bài tự luyện
              </button>
            )}
          </div>

        </div>
      )}

      {/* -------------------- RESULT SCREEN -------------------- */}
      {activeScreen === "result" && quizQuestions.length > 0 && (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
          
          {/* Result Score Banner */}
          <div className="bg-[#121215] border border-[#202024] rounded-3xl p-6 md:p-8 text-center space-y-4 relative overflow-hidden">
            <div className="absolute w-44 h-44 bg-brand-pink/5 rounded-full blur-3xl pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="inline-flex p-3 rounded-full bg-brand-pink/10 text-brand-pink mb-1">
              <Award size={36} className="drop-shadow-[0_0_8px_rgba(255,105,180,0.3)]" />
            </div>
            
            <div className="space-y-1 relative z-10">
              <h3 className="text-[15px] font-bold text-muted-text uppercase tracking-widest">KẾT QUẢ TỰ LUYỆN AI</h3>
              <div className="text-[52px] font-black text-brand-pink leading-none drop-shadow-[0_0_15px_rgba(255,105,180,0.4)]">
                {finalScore} <span className="text-[20px] text-muted-text font-bold">/ 10</span>
              </div>
              <p className="text-xs text-muted-text max-w-sm mx-auto pt-2">
                Bạn trả lời đúng <span className="text-emerald-400 font-extrabold">{correctCount} / {quizQuestions.length}</span> câu hỏi. Đã cập nhật kết quả vào Lịch sử.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setActiveScreen("config")}
                className="bg-brand-pink text-brand-dark font-extrabold text-[12px] px-6 py-2.5 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
              >
                Quay lại Phòng luyện tập
              </button>
            </div>
          </div>

          {/* Details list of questions with answers and explanation */}
          <div className="space-y-5">
            <h4 className="text-[14px] font-bold text-cream px-1">Chi tiết đáp án & giải thích</h4>

            {quizQuestions.map((q, idx) => {
              const userAns = userAnswers[q.id];
              const isCorrect = userAns === q.correctAnswer;

              return (
                <div key={q.id} className="bg-[#121215] border border-[#202024] rounded-2xl p-5 md:p-6 space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-muted-text border-b border-border-dark/40 pb-2">
                    <span>CÂU HỎI {idx + 1}</span>
                    <span className={isCorrect ? "text-emerald-400 flex items-center gap-1" : "text-red-400 flex items-center gap-1"}>
                      {isCorrect ? <Check size={14} className="stroke-[3]" /> : <X size={14} className="stroke-[3]" />}
                      {isCorrect ? "Đúng" : "Sai"}
                    </span>
                  </div>

                  <p className="text-[14px] font-bold text-cream leading-relaxed">
                    {q.content}
                  </p>

                  {/* Options display with results check */}
                  <div className="grid grid-cols-1 gap-2.5 pt-1">
                    {q.options.map((opt) => {
                      const isCorrectOpt = opt.key === q.correctAnswer;
                      const isUserSelected = opt.key === userAns;

                      let btnStyle = "bg-brand-dark border-border-dark text-cream";
                      let badgeStyle = "bg-[#202024] text-muted-text";

                      if (isCorrectOpt) {
                        btnStyle = "bg-emerald-500/10 border-emerald-500/40 text-emerald-400";
                        badgeStyle = "bg-emerald-500 text-brand-dark font-extrabold";
                      } else if (isUserSelected && !isCorrect) {
                        btnStyle = "bg-red-500/10 border-red-500/40 text-red-400";
                        badgeStyle = "bg-red-500 text-brand-dark font-extrabold";
                      }

                      return (
                        <div
                          key={opt.key}
                          className={`p-3.5 rounded-xl text-[12.5px] font-semibold border flex items-center gap-3 ${btnStyle}`}
                        >
                          <span className={`w-5.5 h-5.5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${badgeStyle}`}>
                            {opt.key}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation card */}
                  <div className="p-4 rounded-xl bg-brand-dark border border-[#202024] flex gap-3 text-xs leading-relaxed">
                    <HelpCircle size={18} className="text-brand-pink shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-brand-pink">Giải thích đáp án:</span>{" "}
                      <span className="text-muted-text font-medium">{q.explanation}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
}
