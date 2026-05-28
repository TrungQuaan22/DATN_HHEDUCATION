"use client";

import React, { useState } from "react";
import { Book, Clock, Calendar, Check, Trophy, AlertTriangle, X, FileText, ChevronRight, CheckCircle2 } from "lucide-react";

interface AssessmentItem {
  id: string;
  title: string;
  courseTitle: string;
  subject: "math" | "physics" | "chemistry" | "literature" | "english" | "biology" | "history" | "geography";
  type: "exam" | "homework"; // exam: "Quan trọng", homework: "Luyện tập"
  status: "upcoming" | "not_done" | "completed" | "expired";
  durationMinutes: number;
  openTime: string;
  closeTime: string;
  remainingTimeText: string;
  score?: number;
  totalScore?: number;
  completedAt?: string;
}

const mockAssessments: AssessmentItem[] = [
  {
    id: "assess-1",
    title: "Kiểm tra giữa kỳ môn Ngữ Văn",
    courseTitle: "Tích chữ thành văn - Module 1",
    subject: "literature",
    type: "exam",
    status: "not_done",
    durationMinutes: 45,
    openTime: "2026-05-27T08:00:00Z",
    closeTime: "2026-05-29T23:59:59Z",
    remainingTimeText: "Còn 2 ngày"
  },
  {
    id: "assess-2",
    title: "Bài tập phân tích thơ hiện đại",
    courseTitle: "Tích chữ thành văn - Module 1",
    subject: "literature",
    type: "homework",
    status: "upcoming",
    durationMinutes: 30,
    openTime: "2026-06-01T08:00:00Z",
    closeTime: "2026-06-05T23:59:59Z",
    remainingTimeText: "Mở sau 5 ngày"
  },
  {
    id: "assess-3",
    title: "Trắc nghiệm: Phép liên kết văn bản",
    courseTitle: "Tích chữ thành văn - Module 1",
    subject: "literature",
    type: "homework",
    status: "completed",
    durationMinutes: 15,
    openTime: "2026-05-20T08:00:00Z",
    closeTime: "2026-05-24T23:59:59Z",
    remainingTimeText: "Đã nộp",
    score: 9.5,
    totalScore: 10,
    completedAt: "2026-05-22T10:30:00Z"
  },
  {
    id: "assess-4",
    title: "Kiểm tra Học kỳ I môn Toán học",
    courseTitle: "Giải tích 12 nâng cao",
    subject: "math",
    type: "exam",
    status: "completed",
    durationMinutes: 90,
    openTime: "2026-05-15T08:00:00Z",
    closeTime: "2026-05-20T23:59:59Z",
    remainingTimeText: "Đã nộp",
    score: 8.0,
    totalScore: 10,
    completedAt: "2026-05-18T14:20:00Z"
  },
  {
    id: "assess-5",
    title: "Bài tập Trắc nghiệm: Thì hiện tại hoàn thành",
    courseTitle: "Tiếng Anh THPT - Căn bản 11",
    subject: "english",
    type: "homework",
    status: "expired",
    durationMinutes: 20,
    openTime: "2026-05-10T08:00:00Z",
    closeTime: "2026-05-24T23:59:59Z",
    remainingTimeText: "Trễ hạn"
  },
  {
    id: "assess-6",
    title: "Đề khảo sát năng lực Tiếng Anh đầu năm lớp 11",
    courseTitle: "Tiếng Anh THPT - Căn bản 11",
    subject: "english",
    type: "exam",
    status: "completed",
    durationMinutes: 60,
    openTime: "2026-05-05T08:00:00Z",
    closeTime: "2026-05-10T23:59:59Z",
    remainingTimeText: "Đã nộp",
    score: 8.8,
    totalScore: 10,
    completedAt: "2026-05-08T09:15:00Z"
  }
];

const SUBJECT_LABELS: Record<string, string> = {
  math: "Toán Học",
  physics: "Vật Lý",
  chemistry: "Hóa Học",
  literature: "Ngữ Văn",
  english: "Anh Văn",
  biology: "Sinh Học",
  history: "Lịch Sử",
  geography: "Địa Lý"
};

type FilterId = "all" | "upcoming" | "not_done" | "completed";

export default function AssessmentsPage() {
  const [assessmentFilter, setAssessmentFilter] = useState<FilterId>("all");
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentItem | null>(null);
  const [activeModal, setActiveModal] = useState<"start" | "result" | null>(null);

  // Statistics calculation
  const totalAssessments = mockAssessments.length;
  const completedAssessments = mockAssessments.filter(a => a.status === "completed").length;
  const notDoneAssessments = mockAssessments.filter(a => a.status === "not_done" || a.status === "upcoming").length;
  const expiredAssessments = mockAssessments.filter(a => a.status === "expired").length;

  // GPA calculation for official exams
  const examGrades = mockAssessments.filter(a => a.status === "completed" && a.type === "exam" && a.score !== undefined);
  const averageGPA = examGrades.length > 0 
    ? (examGrades.reduce((sum, item) => sum + (item.score || 0), 0) / examGrades.length).toFixed(2)
    : "0.0";

  // Filter logic
  const filteredAssessments = mockAssessments.filter((item) => {
    if (assessmentFilter === "all") return true;
    if (assessmentFilter === "upcoming") return item.status === "upcoming";
    if (assessmentFilter === "not_done") return item.status === "not_done" || item.status === "expired";
    if (assessmentFilter === "completed") return item.status === "completed";
    return true;
  });

  const getSubjectBadgeStyles = (subject: string) => {
    switch (subject) {
      case "math":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "literature":
        return "text-brand-pink bg-brand-pink/10 border-brand-pink/20";
      case "english":
        return "text-sky-400 bg-sky-500/10 border-sky-500/20";
      default:
        return "text-muted-text bg-[#202024] border-border-dark";
    }
  };

  const openStartModal = (assessment: AssessmentItem) => {
    setSelectedAssessment(assessment);
    setActiveModal("start");
  };

  const openResultModal = (assessment: AssessmentItem) => {
    setSelectedAssessment(assessment);
    setActiveModal("result");
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div>
        <h2 className="text-[22px] font-extrabold text-cream">Danh sách bài kiểm tra</h2>
        <p className="text-[13px] text-muted-text mt-1">Quản lý, thực hiện và theo dõi kết quả các bài kiểm tra lớp học</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Filters and Cards List */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Navigation Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1.5 hide-scrollbar">
            {(["all", "upcoming", "not_done", "completed"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setAssessmentFilter(filter)}
                className={`px-4 py-2 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  assessmentFilter === filter
                    ? "bg-brand-pink text-brand-dark shadow-sm"
                    : "bg-[#121215] text-cream border border-[#202024] hover:border-brand-pink/50 hover:text-brand-pink"
                }`}
              >
                {filter === "all" && "Tất cả"}
                {filter === "upcoming" && "Sắp diễn ra"}
                {filter === "not_done" && "Chưa làm / Trễ hạn"}
                {filter === "completed" && "Đã hoàn thành"}
              </button>
            ))}
          </div>

          {/* Cards List */}
          <div className="space-y-4">
            {filteredAssessments.length === 0 ? (
              <div className="bg-[#121215] rounded-2xl p-12 border border-[#202024] text-center space-y-3">
                <FileText size={44} className="text-muted-text/40 mx-auto" />
                <h4 className="text-[14px] font-bold text-cream">Không tìm thấy bài kiểm tra nào</h4>
                <p className="text-xs text-muted-text max-w-xs mx-auto">
                  Hiện tại không có bài kiểm tra nào trong mục này. Vui lòng chọn bộ lọc khác.
                </p>
              </div>
            ) : (
              filteredAssessments.map((assessment) => {
                // Border styles based on state
                let statusBorder = "border-l-brand-pink";
                if (assessment.status === "completed") statusBorder = "border-l-emerald-500";
                if (assessment.status === "expired") statusBorder = "border-l-red-500";
                if (assessment.status === "upcoming") statusBorder = "border-l-amber-500";

                return (
                  <div
                    key={assessment.id}
                    className={`bg-[#121215] rounded-2xl p-5 border border-[#202024] border-l-4 ${statusBorder} flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between group hover:border-[#202024] hover:shadow-[0_0_15px_rgba(255,105,180,0.05)] transition-all`}
                  >
                    <div className="space-y-2 flex-grow min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Type Tag */}
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                          assessment.type === "exam" 
                            ? "text-brand-dark bg-amber-400" 
                            : "text-muted-text bg-[#202024]"
                        }`}>
                          {assessment.type === "exam" ? "Quan trọng" : "Luyện tập"}
                        </span>
                        
                        {/* Status Badge */}
                        {assessment.status === "completed" && (
                          <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                            Đã nộp bài
                          </span>
                        )}
                        {assessment.status === "not_done" && (
                          <span className="text-[9px] font-extrabold text-brand-pink bg-brand-pink/10 px-2 py-0.5 rounded uppercase tracking-wider">
                            Chưa làm
                          </span>
                        )}
                        {assessment.status === "upcoming" && (
                          <span className="text-[9px] font-extrabold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                            Sắp diễn ra
                          </span>
                        )}
                        {assessment.status === "expired" && (
                          <span className="text-[9px] font-extrabold text-red-400 bg-red-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                            Trễ hạn
                          </span>
                        )}

                        {/* Subject Badge */}
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${getSubjectBadgeStyles(assessment.subject)}`}>
                          {SUBJECT_LABELS[assessment.subject]}
                        </span>
                      </div>

                      <h3 className="text-[16px] font-bold text-cream group-hover:text-brand-pink transition-colors truncate">
                        {assessment.title}
                      </h3>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-text font-medium mt-1">
                        <span className="flex items-center gap-1.5"><Book size={13} /> {assessment.courseTitle}</span>
                        <span className="flex items-center gap-1.5"><Clock size={13} /> {assessment.durationMinutes} phút</span>
                        
                        {assessment.status === "completed" && assessment.completedAt ? (
                          <span className="flex items-center gap-1.5 text-emerald-400">
                            <Check size={13} /> Nộp lúc {formatDate(assessment.completedAt)}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5"><Calendar size={13} /> Hạn: {formatDate(assessment.closeTime)}</span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="w-full sm:w-auto shrink-0 mt-3 sm:mt-0">
                      {assessment.status === "not_done" && (
                        <button
                          onClick={() => openStartModal(assessment)}
                          className="w-full sm:w-auto bg-brand-pink text-brand-dark hover:scale-105 active:scale-95 font-bold text-[12px] px-5 py-2.5 rounded-xl transition-all cursor-pointer text-center"
                        >
                          Làm bài ngay
                        </button>
                      )}
                      {assessment.status === "completed" && (
                        <button
                          onClick={() => openResultModal(assessment)}
                          className="w-full sm:w-auto border border-[#202024] bg-[#1a1a20] text-cream hover:border-brand-pink hover:text-brand-pink font-bold text-[12px] px-5 py-2.5 rounded-xl transition-all cursor-pointer text-center"
                        >
                          Xem kết quả
                        </button>
                      )}
                      {assessment.status === "upcoming" && (
                        <button
                          disabled
                          className="w-full sm:w-auto border border-[#202024] text-muted-text font-bold text-[12px] px-5 py-2.5 rounded-xl cursor-not-allowed opacity-60 text-center"
                        >
                          {assessment.remainingTimeText}
                        </button>
                      )}
                      {assessment.status === "expired" && (
                        <button
                          disabled
                          className="w-full sm:w-auto border border-red-500/20 text-red-400/60 font-bold text-[12px] px-5 py-2.5 rounded-xl cursor-not-allowed opacity-60 text-center"
                        >
                          Không thể nộp
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Column: Statistics Summary */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* GPA Card */}
          <div className="bg-[#121215] rounded-2xl p-6 border border-[#202024] space-y-5">
            <h3 className="text-[14px] font-bold text-cream flex items-center gap-2 border-b border-border-dark/40 pb-3">
              <Trophy size={16} className="text-brand-pink" />
              Tổng kết kết quả
            </h3>

            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-brand-dark border border-[#202024] space-y-2 relative overflow-hidden group">
              <div className="absolute w-24 h-24 bg-brand-pink/5 rounded-full blur-2xl group-hover:bg-brand-pink/10 transition-colors duration-300"></div>
              <span className="text-[12px] font-bold text-muted-text uppercase tracking-wider">GPA Trung bình thi</span>
              <span className="text-[44px] font-extrabold text-brand-pink leading-none drop-shadow-[0_0_15px_rgba(255,105,180,0.3)]">
                {averageGPA}
              </span>
              <span className="text-[10px] text-muted-text font-semibold">tính trên các bài thi chính thức (thang 10)</span>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2 text-muted-text">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span>Đã hoàn thành</span>
                </div>
                <span className="text-cream font-bold">{completedAssessments} bài</span>
              </div>
              
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2 text-muted-text">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-pink"></div>
                  <span>Chưa làm / Chờ mở</span>
                </div>
                <span className="text-cream font-bold">{notDoneAssessments} bài</span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2 text-muted-text">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <span>Trễ hạn</span>
                </div>
                <span className="text-red-400 font-bold">{expiredAssessments} bài</span>
              </div>
            </div>

            <div className="border-t border-border-dark/40 pt-4 text-center">
              <div className="text-[11px] text-muted-text leading-relaxed">
                Tích cực hoàn thiện các bài thi đúng hạn để nâng cao điểm trung bình GPA nhé!
              </div>
            </div>
          </div>

          {/* Subject Breakdown Card */}
          <div className="bg-[#121215] rounded-2xl p-6 border border-[#202024] space-y-4">
            <h3 className="text-[13px] font-bold text-cream border-b border-border-dark/40 pb-3">
              Môn học của bạn
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cream">Ngữ Văn</span>
                <span className="text-xs font-bold text-brand-pink">GPA: 8.80</span>
              </div>
              <div className="w-full h-1 bg-brand-dark rounded-full overflow-hidden">
                <div className="h-full bg-brand-pink" style={{ width: "88%" }} />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-cream">Toán Học</span>
                <span className="text-xs font-bold text-emerald-400">GPA: 8.00</span>
              </div>
              <div className="w-full h-1 bg-brand-dark rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: "80%" }} />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-cream">Anh Văn</span>
                <span className="text-xs font-bold text-sky-400">GPA: 8.80</span>
              </div>
              <div className="w-full h-1 bg-brand-dark rounded-full overflow-hidden">
                <div className="h-full bg-sky-400" style={{ width: "88%" }} />
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* -------------------- MODAL: START EXAM -------------------- */}
      {activeModal === "start" && selectedAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#121215] border border-[#202024] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in scale-in-95 duration-200 flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-border-dark/40 flex justify-between items-center bg-[#1a1a20]">
              <h3 className="font-extrabold text-[16px] text-cream flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" />
                Xác nhận bắt đầu làm bài
              </h3>
              <button 
                onClick={() => { setActiveModal(null); setSelectedAssessment(null); }}
                className="text-muted-text hover:text-brand-pink transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-brand-pink bg-brand-pink/10 px-2 py-0.5 rounded border border-brand-pink/20 uppercase tracking-widest">
                  {SUBJECT_LABELS[selectedAssessment.subject]}
                </span>
                <h4 className="text-[18px] font-extrabold text-cream leading-tight">
                  {selectedAssessment.title}
                </h4>
                <p className="text-xs text-muted-text">
                  Thuộc khóa học: {selectedAssessment.courseTitle}
                </p>
              </div>

              {/* Rules and Info Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-brand-dark border border-[#202024]">
                <div>
                  <span className="text-[10px] text-muted-text block uppercase font-bold">Thời gian làm bài</span>
                  <span className="text-[15px] font-extrabold text-cream">{selectedAssessment.durationMinutes} phút</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-text block uppercase font-bold">Hình thức bài thi</span>
                  <span className="text-[15px] font-extrabold text-cream">
                    {selectedAssessment.type === "exam" ? "Thi chính thức (GPA)" : "Bài tập luyện tập"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-text block uppercase font-bold">Số lượng câu hỏi</span>
                  <span className="text-[15px] font-extrabold text-cream">20 câu trắc nghiệm</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-text block uppercase font-bold">Số lần làm tối đa</span>
                  <span className="text-[15px] font-extrabold text-cream">1 lần duy nhất</span>
                </div>
              </div>

              {/* Warning Alert */}
              <div className="flex gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed font-semibold">
                  <span className="font-extrabold uppercase">Cảnh báo quy chế thi:</span> Đây là bài kiểm tra tính vào điểm GPA của bạn. Hệ thống sẽ khóa bài làm nếu bạn chuyển tab hoặc rời khỏi màn hình quá 3 lần. Đảm bảo kết nối mạng ổn định trước khi bấm bắt đầu.
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-[#1a1a20] border-t border-border-dark/40 flex justify-end gap-3">
              <button
                onClick={() => { setActiveModal(null); setSelectedAssessment(null); }}
                className="px-5 py-2.5 rounded-xl border border-[#202024] bg-[#121215] text-[12px] font-bold text-cream hover:text-brand-pink transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  alert("Simulating starting the test... Dynamic test taker UI will open.");
                  setActiveModal(null);
                  setSelectedAssessment(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-brand-pink text-brand-dark hover:scale-105 active:scale-95 font-extrabold text-[12px] transition-all cursor-pointer"
              >
                Bắt đầu làm bài
              </button>
            </div>

          </div>
        </div>
      )}

      {/* -------------------- MODAL: EXAM RESULT DETAILS -------------------- */}
      {activeModal === "result" && selectedAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#121215] border border-[#202024] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in scale-in-95 duration-200 flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-border-dark/40 flex justify-between items-center bg-[#1a1a20]">
              <h3 className="font-extrabold text-[16px] text-cream flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-500" />
                Kết quả bài kiểm tra chi tiết
              </h3>
              <button 
                onClick={() => { setActiveModal(null); setSelectedAssessment(null); }}
                className="text-muted-text hover:text-brand-pink transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="space-y-1">
                <h4 className="text-[18px] font-extrabold text-cream leading-tight">
                  {selectedAssessment.title}
                </h4>
                <p className="text-xs text-muted-text">
                  Khóa học: {selectedAssessment.courseTitle}
                </p>
              </div>

              {/* Score Display Ring */}
              <div className="flex items-center gap-6 p-4 rounded-xl bg-brand-dark border border-[#202024]">
                <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[20px] font-black text-emerald-400">
                    {selectedAssessment.score?.toFixed(1)}
                  </span>
                  <span className="text-[9px] text-muted-text font-bold">/ 10</span>
                </div>
                <div className="space-y-1.5 flex-grow">
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider w-fit block">
                    Đã đạt yêu cầu
                  </span>
                  <p className="text-[12px] font-semibold text-cream leading-snug">
                    Bạn đã hoàn thành xuất sắc bài kiểm tra với số điểm nằm trong top 15% của lớp học.
                  </p>
                </div>
              </div>

              {/* Summary Stats Table */}
              <div className="grid grid-cols-2 gap-3.5 text-xs">
                <div className="p-3 rounded-lg bg-[#1a1a20] border border-border-dark/40">
                  <span className="text-[10px] text-muted-text block uppercase font-bold mb-0.5">Thời gian hoàn thành</span>
                  <span className="font-extrabold text-cream">24 phút 15 giây</span>
                </div>
                <div className="p-3 rounded-lg bg-[#1a1a20] border border-border-dark/40">
                  <span className="text-[10px] text-muted-text block uppercase font-bold mb-0.5">Số câu trả lời đúng</span>
                  <span className="font-extrabold text-emerald-400">18 / 20 câu</span>
                </div>
                <div className="p-3 rounded-lg bg-[#1a1a20] border border-border-dark/40">
                  <span className="text-[10px] text-muted-text block uppercase font-bold mb-0.5">Ngày hoàn thành</span>
                  <span className="font-bold text-cream">
                    {selectedAssessment.completedAt ? formatDate(selectedAssessment.completedAt) : "N/A"}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#1a1a20] border border-border-dark/40">
                  <span className="text-[10px] text-muted-text block uppercase font-bold mb-0.5">Hệ số tính điểm</span>
                  <span className="font-extrabold text-amber-400">15% tổng điểm</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-[#1a1a20] border-t border-border-dark/40 flex justify-end">
              <button
                onClick={() => { setActiveModal(null); setSelectedAssessment(null); }}
                className="px-6 py-2.5 rounded-xl bg-brand-pink text-brand-dark hover:scale-105 active:scale-95 font-extrabold text-[12px] transition-all cursor-pointer"
              >
                Đóng lại
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
