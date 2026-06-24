"use client";

import React, { useState } from "react";
import { Book, Clock, Calendar, Check, Trophy, AlertTriangle, X, FileText, ChevronRight, CheckCircle2, Loader2 } from "lucide-react";
import { useStudentAssessmentsQuery, useStartAttemptMutation } from "@/features/assessments/hooks";
import { useRouter } from "next/navigation";

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
  isPlaceholder?: boolean;
}

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
  const router = useRouter();
  const [assessmentFilter, setAssessmentFilter] = useState<FilterId>("all");
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentItem | null>(null);
  const [activeModal, setActiveModal] = useState<"start" | "result" | null>(null);

  const { data, isLoading } = useStudentAssessmentsQuery();
  const startMutation = useStartAttemptMutation();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div>
          <div className="h-8 w-48 bg-[#1e1e24] rounded-lg"></div>
          <div className="h-4 w-72 bg-[#1e1e24] rounded-lg mt-2"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          <div className="lg:col-span-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#121215] rounded-2xl border border-[#202024]/50 h-28"></div>
            ))}
          </div>
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#121215] rounded-2xl border border-[#202024]/50 h-64"></div>
          </div>
        </div>
      </div>
    );
  }

  const rawItems = data?.items || [];
  const mappedAssessments: AssessmentItem[] = rawItems.map((item) => {
    const isExam = item.assessmentType === "exam";
    const latest = item.attempt.latestSubmission;
    
    // Status resolution
    let status: "upcoming" | "not_done" | "completed" | "expired" = "not_done";
    const now = new Date();
    const isCompleted = latest && (latest.status === "completed" || latest.status === "auto_submitted");
    const isClosed = item.closeTime ? new Date(item.closeTime) < now : false;
    const isNotYetOpen = item.openTime ? new Date(item.openTime) > now : false;

    if (isCompleted) {
      status = "completed";
    } else if (isNotYetOpen) {
      status = "upcoming";
    } else if (isClosed) {
      status = "expired";
    } else {
      status = "not_done";
    }

    // Remaining time text
    let remainingTimeText = "";
    if (status === "completed") {
      remainingTimeText = "Đã nộp";
    } else if (status === "upcoming" && item.openTime) {
      const diff = new Date(item.openTime).getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      remainingTimeText = `Mở sau ${days} ngày`;
    } else if (status === "expired") {
      remainingTimeText = "Trễ hạn";
    } else if (item.closeTime) {
      const diff = new Date(item.closeTime).getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      remainingTimeText = days > 0 ? `Còn ${days} ngày` : "Sắp hết hạn";
    } else {
      remainingTimeText = "Không giới hạn";
    }

    // GPA / Score extraction
    let score: number | undefined;
    if (latest && latest.finalScore) {
      score = parseFloat(latest.finalScore);
    }

    // Handle course title and lesson titles
    let courseTitle = item.course?.title || "Khóa học chưa đặt tên";
    if (item.lesson) {
      courseTitle += ` - ${item.lesson.chapterTitle || "Bài học"}`;
    }

    return {
      id: item.placementId,
      title: item.title,
      courseTitle,
      subject: (item.subject as any) || "literature",
      type: isExam ? "exam" : "homework",
      status,
      durationMinutes: item.timeLimitMinutes || 45,
      openTime: item.openTime || "",
      closeTime: item.closeTime || "",
      remainingTimeText,
      score,
      totalScore: 10,
      completedAt: latest?.submitTime || undefined,
    };
  });

  // Pad to at least 3 items with premium placeholders if count is less than 3
  const displayAssessments = [...mappedAssessments];
  if (displayAssessments.length < 3) {
    const needed = 3 - displayAssessments.length;
    const placeholders: Omit<AssessmentItem, "id">[] = [
      {
        title: "Đề ôn tập nâng cao chuyên đề học kỳ II",
        courseTitle: "Hệ thống bài tập tự luyện HH",
        subject: "math",
        type: "homework",
        status: "upcoming",
        durationMinutes: 45,
        openTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        closeTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        remainingTimeText: "Sắp diễn ra",
        isPlaceholder: true,
      },
      {
        title: "Khảo sát chất lượng năng lực học sinh tháng sau",
        courseTitle: "Chương trình kiểm tra định kỳ",
        subject: "english",
        type: "exam",
        status: "upcoming",
        durationMinutes: 60,
        openTime: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        closeTime: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        remainingTimeText: "Sắp diễn ra",
        isPlaceholder: true,
      },
      {
        title: "Đề khảo sát năng lực Hóa học hữu cơ",
        courseTitle: "Chuyên đề nâng cao lớp 11",
        subject: "chemistry",
        type: "homework",
        status: "upcoming",
        durationMinutes: 30,
        openTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        closeTime: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        remainingTimeText: "Sắp diễn ra",
        isPlaceholder: true,
      }
    ];

    for (let i = 0; i < needed; i++) {
      const ph = placeholders[i % placeholders.length];
      displayAssessments.push({
        ...ph,
        id: `placeholder-assessment-${i}`,
      });
    }
  }

  // Statistics calculation on REAL assessments
  const totalAssessments = mappedAssessments.length;
  const completedAssessments = mappedAssessments.filter(a => a.status === "completed").length;
  const notDoneAssessments = mappedAssessments.filter(a => a.status === "not_done" || a.status === "upcoming").length;
  const expiredAssessments = mappedAssessments.filter(a => a.status === "expired").length;

  // GPA calculation for official exams on REAL assessments
  const examGrades = mappedAssessments.filter(a => a.status === "completed" && a.type === "exam" && a.score !== undefined);
  const averageGPA = examGrades.length > 0 
    ? (examGrades.reduce((sum, item) => sum + (item.score || 0), 0) / examGrades.length).toFixed(2)
    : "0.0";

  // Filter logic on display (including placeholder cards to pad the UI)
  const filteredAssessments = displayAssessments.filter((item) => {
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
      case "chemistry":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "physics":
        return "text-purple-400 bg-purple-500/10 border-purple-500/20";
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
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // GPA subject breakdown
  const subjectExams = mappedAssessments.filter(a => a.status === "completed" && a.type === "exam" && a.score !== undefined);
  const subjectGPAMap: Record<string, { sum: number; count: number }> = {};
  subjectExams.forEach((exam) => {
    const sub = exam.subject;
    if (!subjectGPAMap[sub]) {
      subjectGPAMap[sub] = { sum: 0, count: 0 };
    }
    subjectGPAMap[sub].sum += exam.score || 0;
    subjectGPAMap[sub].count += 1;
  });

  const subjectGPAList = Object.entries(subjectGPAMap).map(([sub, data]) => {
    const avg = data.sum / data.count;
    return {
      subject: sub,
      label: SUBJECT_LABELS[sub] || sub,
      gpa: avg.toFixed(2),
      percentage: Math.round(avg * 10) + "%"
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div>
        <h2 className="text-2xl font-extrabold text-cream">Danh sách bài kiểm tra</h2>
        <p className="text-sm text-muted-text mt-1">Quản lý, thực hiện và theo dõi kết quả các bài kiểm tra lớp học</p>
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
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
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
                <h4 className="text-sm font-bold text-cream">Không tìm thấy bài kiểm tra nào</h4>
                <p className="text-xs text-muted-text max-w-xs mx-auto">
                  Hiện tại không có bài kiểm tra nào trong mục này. Vui lòng chọn bộ lọc khác.
                </p>
              </div>
            ) : (
              filteredAssessments.map((assessment) => {
                // Styles based on state
                let statusStyle = "border-brand-pink/20 bg-brand-pink/[0.02] hover:border-brand-pink/40";
                if (assessment.status === "completed") {
                  statusStyle = "border-emerald-500/20 bg-emerald-500/[0.02] hover:border-emerald-500/40";
                } else if (assessment.status === "expired") {
                  statusStyle = "border-red-500/20 bg-red-500/[0.02] hover:border-red-500/40";
                } else if (assessment.status === "upcoming") {
                  statusStyle = "border-amber-500/20 bg-amber-500/[0.02] hover:border-amber-500/40";
                }

                if (assessment.isPlaceholder) {
                  statusStyle = "border-dashed border-[#202024] bg-[#121215]/30 opacity-60";
                }

                return (
                  <div
                    key={assessment.id}
                    className={`rounded-2xl p-5 border ${statusStyle} flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between group hover:shadow-[0_0_15px_rgba(255,105,180,0.02)] transition-all duration-300`}
                  >
                    <div className="space-y-2 flex-grow min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Type Tag */}
                        <span className={`text-xs font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                          assessment.type === "exam" 
                            ? "text-brand-dark bg-amber-400" 
                            : "text-muted-text bg-[#202024]"
                        }`}>
                          {assessment.isPlaceholder ? "Đang chuẩn bị" : assessment.type === "exam" ? "Quan trọng" : "Luyện tập"}
                        </span>
                        
                        {/* Status Badge */}
                        {!assessment.isPlaceholder && (
                          <>
                            {assessment.status === "completed" && (
                              <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                                Đã nộp bài
                              </span>
                            )}
                            {assessment.status === "not_done" && (
                              <span className="text-xs font-extrabold text-brand-pink bg-brand-pink/10 px-2 py-0.5 rounded uppercase tracking-wider">
                                Chưa làm
                              </span>
                            )}
                            {assessment.status === "upcoming" && (
                              <span className="text-xs font-extrabold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                                Sắp diễn ra
                              </span>
                            )}
                            {assessment.status === "expired" && (
                              <span className="text-xs font-extrabold text-red-400 bg-red-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                                Trễ hạn
                              </span>
                            )}
                          </>
                        )}

                        {assessment.isPlaceholder && (
                          <span className="text-xs font-extrabold text-muted-text bg-[#202024] px-2 py-0.5 rounded uppercase tracking-wider">
                            Coming soon
                          </span>
                        )}

                        {/* Subject Badge */}
                        <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${getSubjectBadgeStyles(assessment.subject)}`}>
                          {SUBJECT_LABELS[assessment.subject]}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-cream group-hover:text-brand-pink transition-colors truncate">
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
                          assessment.closeTime && (
                            <span className="flex items-center gap-1.5"><Calendar size={13} /> Hạn: {formatDate(assessment.closeTime)}</span>
                          )
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="w-full sm:w-auto shrink-0 mt-3 sm:mt-0">
                      {assessment.isPlaceholder ? (
                        <button
                          disabled
                          className="w-full sm:w-auto border border-dashed border-[#202024] text-muted-text/60 font-bold text-sm px-5 py-2.5 rounded-xl cursor-not-allowed text-center"
                        >
                          Chưa mở làm
                        </button>
                      ) : (
                        <>
                          {assessment.status === "not_done" && (
                            <button
                              onClick={() => openStartModal(assessment)}
                              className="w-full sm:w-auto bg-brand-pink text-brand-dark hover:scale-105 active:scale-95 font-bold text-sm px-5 py-2.5 rounded-xl transition-all cursor-pointer text-center"
                            >
                              Làm bài ngay
                            </button>
                          )}
                          {assessment.status === "completed" && (
                            <button
                              onClick={() => openResultModal(assessment)}
                              className="w-full sm:w-auto border border-[#202024] bg-[#1a1a20] text-cream hover:border-brand-pink hover:text-brand-pink font-bold text-sm px-5 py-2.5 rounded-xl transition-all cursor-pointer text-center"
                            >
                              Xem kết quả
                            </button>
                          )}
                          {assessment.status === "upcoming" && (
                            <button
                              disabled
                              className="w-full sm:w-auto border border-[#202024] text-muted-text font-bold text-sm px-5 py-2.5 rounded-xl cursor-not-allowed opacity-60 text-center"
                            >
                              {assessment.remainingTimeText}
                            </button>
                          )}
                          {assessment.status === "expired" && (
                            <button
                              disabled
                              className="w-full sm:w-auto border border-red-500/20 text-red-400/60 font-bold text-sm px-5 py-2.5 rounded-xl cursor-not-allowed opacity-60 text-center"
                            >
                              Không thể nộp
                            </button>
                          )}
                        </>
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
            <h3 className="text-sm font-bold text-cream flex items-center gap-2 border-b border-border-dark/40 pb-3">
              <Trophy size={16} className="text-brand-pink" />
              Tổng kết kết quả
            </h3>

            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-brand-dark border border-[#202024] space-y-2 relative overflow-hidden group">
              <div className="absolute w-24 h-24 bg-brand-pink/5 rounded-full blur-2xl group-hover:bg-brand-pink/10 transition-colors duration-300"></div>
              <span className="text-sm font-bold text-muted-text uppercase tracking-wider">GPA Trung bình thi</span>
              <span className="text-4xl font-extrabold text-brand-pink leading-none drop-shadow-[0_0_15px_rgba(255,105,180,0.3)]">
                {averageGPA}
              </span>
              <span className="text-xs text-muted-text font-semibold">tính trên các bài thi chính thức (thang 10)</span>
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
              <div className="text-xs text-muted-text leading-relaxed">
                Tích cực hoàn thiện các bài thi đúng hạn để nâng cao điểm trung bình GPA nhé!
              </div>
            </div>
          </div>

          {/* Subject Breakdown Card */}
          <div className="bg-[#121215] rounded-2xl p-6 border border-[#202024] space-y-4">
            <h3 className="text-sm font-bold text-cream border-b border-border-dark/40 pb-3">
              Môn học của bạn
            </h3>
            {subjectGPAList.length === 0 ? (
              <p className="text-xs text-muted-text text-center py-4">
                Chưa có dữ liệu GPA môn học. Hãy hoàn thành bài kiểm tra chính thức!
              </p>
            ) : (
              <div className="space-y-3">
                {subjectGPAList.map((item) => (
                  <div key={item.subject} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cream">{item.label}</span>
                      <span className="text-xs font-bold text-brand-pink">GPA: {item.gpa}</span>
                    </div>
                    <div className="w-full h-1 bg-brand-dark rounded-full overflow-hidden">
                      <div className="h-full bg-brand-pink" style={{ width: item.percentage }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* -------------------- MODAL: START EXAM -------------------- */}
      {activeModal === "start" && selectedAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#121215] border border-[#202024] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in scale-in-95 duration-200 flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-border-dark/40 flex justify-between items-center bg-[#1a1a20]">
              <h3 className="font-extrabold text-xl text-cream flex items-center gap-2">
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
                <span className="text-xs font-black text-brand-pink bg-brand-pink/10 px-2 py-0.5 rounded border border-brand-pink/20 uppercase tracking-widest">
                  {SUBJECT_LABELS[selectedAssessment.subject]}
                </span>
                <h4 className="text-lg font-extrabold text-cream leading-tight">
                  {selectedAssessment.title}
                </h4>
                <p className="text-xs text-muted-text">
                  Thuộc khóa học: {selectedAssessment.courseTitle}
                </p>
              </div>

              {/* Rules and Info Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-brand-dark border border-[#202024]">
                <div>
                  <span className="text-xs text-muted-text block uppercase font-bold">Thời gian làm bài</span>
                  <span className="text-sm font-extrabold text-cream">{selectedAssessment.durationMinutes} phút</span>
                </div>
                <div>
                  <span className="text-xs text-muted-text block uppercase font-bold">Hình thức bài thi</span>
                  <span className="text-sm font-extrabold text-cream">
                    {selectedAssessment.type === "exam" ? "Thi chính thức (GPA)" : "Bài tập luyện tập"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-text block uppercase font-bold">Số lượng câu hỏi</span>
                  <span className="text-sm font-extrabold text-cream">20 câu trắc nghiệm</span>
                </div>
                <div>
                  <span className="text-xs text-muted-text block uppercase font-bold">Số lần làm tối đa</span>
                  <span className="text-sm font-extrabold text-cream">1 lần duy nhất</span>
                </div>
              </div>

              {/* Warning Alert */}
              <div className="flex gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed font-semibold">
                  <span className="font-extrabold uppercase">Cảnh báo quy chế thi:</span> Đây là bài kiểm tra tính vào điểm GPA của bạn. Đảm bảo kết nối mạng ổn định trước khi bấm bắt đầu.
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-[#1a1a20] border-t border-border-dark/40 flex justify-end gap-3">
              <button
                onClick={() => { setActiveModal(null); setSelectedAssessment(null); }}
                className="px-5 py-2.5 rounded-xl border border-[#202024] bg-[#121215] text-sm font-bold text-cream hover:text-brand-pink transition-colors cursor-pointer"
                disabled={startMutation.isPending}
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  if (selectedAssessment.isPlaceholder) return;
                  startMutation.mutate(selectedAssessment.id, {
                    onSuccess: (submission) => {
                      setActiveModal(null);
                      setSelectedAssessment(null);
                      router.push(`/student/assessments/${selectedAssessment.id}/workspace/${submission.id}`);
                    },
                    onError: (err) => {
                      alert(`Không thể bắt đầu làm bài: ${err.message}`);
                    }
                  });
                }}
                disabled={startMutation.isPending}
                className="px-5 py-2.5 rounded-xl bg-brand-pink text-brand-dark hover:scale-105 active:scale-95 font-extrabold text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {startMutation.isPending && <Loader2 size={14} className="animate-spin" />}
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
              <h3 className="font-extrabold text-xl text-cream flex items-center gap-2">
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
                <h4 className="text-lg font-extrabold text-cream leading-tight">
                  {selectedAssessment.title}
                </h4>
                <p className="text-xs text-muted-text">
                  Khóa học: {selectedAssessment.courseTitle}
                </p>
              </div>

              {/* Score Display Ring */}
              <div className="flex items-center gap-6 p-4 rounded-xl bg-brand-dark border border-[#202024]">
                <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 flex flex-col items-center justify-center shrink-0">
                  <span className="text-xl font-black text-emerald-400">
                    {selectedAssessment.score?.toFixed(1) || "0.0"}
                  </span>
                  <span className="text-xs text-muted-text font-bold">/ 10</span>
                </div>
                <div className="space-y-1.5 flex-grow">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider w-fit block">
                    Đã hoàn thành
                  </span>
                  <p className="text-sm font-semibold text-cream leading-snug">
                    Bạn đã hoàn thành bài kiểm tra này. Hãy tiếp tục ôn luyện để nâng cao kết quả học tập!
                  </p>
                </div>
              </div>

              {/* Summary Stats Table */}
              <div className="grid grid-cols-2 gap-3.5 text-xs">
                <div className="p-3 rounded-lg bg-[#1a1a20] border border-border-dark/40">
                  <span className="text-xs text-muted-text block uppercase font-bold mb-0.5">Thời gian làm bài</span>
                  <span className="font-extrabold text-cream">{selectedAssessment.durationMinutes} phút</span>
                </div>
                <div className="p-3 rounded-lg bg-[#1a1a20] border border-border-dark/40">
                  <span className="text-xs text-muted-text block uppercase font-bold mb-0.5">Thang điểm</span>
                  <span className="font-extrabold text-emerald-400">10 / 10 điểm</span>
                </div>
                <div className="p-3 rounded-lg bg-[#1a1a20] border border-border-dark/40">
                  <span className="text-xs text-muted-text block uppercase font-bold mb-0.5">Ngày hoàn thành</span>
                  <span className="font-bold text-cream">
                    {selectedAssessment.completedAt ? formatDate(selectedAssessment.completedAt) : "N/A"}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#1a1a20] border border-border-dark/40">
                  <span className="text-xs text-muted-text block uppercase font-bold mb-0.5">Hệ số tính điểm</span>
                  <span className="font-extrabold text-amber-400">Thi định kỳ</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-[#1a1a20] border-t border-border-dark/40 flex justify-end">
              <button
                onClick={() => { setActiveModal(null); setSelectedAssessment(null); }}
                className="px-6 py-2.5 rounded-xl bg-brand-pink text-brand-dark hover:scale-105 active:scale-95 font-extrabold text-sm transition-all cursor-pointer"
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
