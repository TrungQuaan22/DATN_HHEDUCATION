"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  ChevronRight,
  Loader2,
  BookOpenCheck,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  FileText,
  PlayCircle
} from "lucide-react";
import { useStudentAssessmentsQuery } from "@/features/assessments/hooks";
import { SUBJECT_LABELS, Subject } from "@/types/common";
import { StudentAssessmentSummary } from "@/features/assessments/types";

const subjects: Array<{ value: Subject | "all"; label: string }> = [
  { value: "all", label: "Tất cả môn" },
  { value: "math", label: "Toán học" },
  { value: "physics", label: "Vật lý" },
  { value: "chemistry", label: "Hóa học" },
  { value: "literature", label: "Ngữ văn" },
  { value: "english", label: "Tiếng Anh" },
  { value: "biology", label: "Sinh học" },
  { value: "history", label: "Lịch sử" },
  { value: "geography", label: "Địa lý" },
];

export default function StudentAssessmentsPage() {
  const [subjectFilter, setSubjectFilter] = useState<Subject | "all">("all");
  const [gradeFilter, setGradeFilter] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch assessments list directly from GET /learning/assessments
  const { data, isLoading } = useStudentAssessmentsQuery({
    subject: subjectFilter === "all" ? undefined : subjectFilter,
    grade: gradeFilter === "all" ? undefined : gradeFilter,
  });

  const rawItems = useMemo(() => data?.items || [], [data]);

  // Apply frontend-side filters for status & search query
  const filteredItems = useMemo(() => {
    return rawItems.filter((item) => {
      // 1. Search Query filter (title or course title)
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.course.title.toLowerCase().includes(q);

      // 2. Status Filter
      // "not_started" (usedAttempts === 0)
      // "doing" (latestSubmission.status === 'doing')
      // "submitted" (latestSubmission.status === 'submitted')
      // "completed" (latestSubmission.status === 'completed' or 'auto_submitted')
      let matchStatus = true;
      if (statusFilter !== "all") {
        const latestStatus = item.attempt.latestSubmission?.status;
        const used = item.attempt.usedAttempts;

        if (statusFilter === "not_started") {
          matchStatus = used === 0;
        } else if (statusFilter === "doing") {
          matchStatus = latestStatus === "doing";
        } else if (statusFilter === "submitted") {
          matchStatus = latestStatus === "submitted";
        } else if (statusFilter === "completed") {
          matchStatus = latestStatus === "completed" || latestStatus === "auto_submitted";
        }
      }

      return matchSearch && matchStatus;
    });
  }, [rawItems, searchQuery, statusFilter]);

  // Group filtered assessments by subject
  const groupedAssessments = useMemo(() => {
    const groups: Record<Subject, StudentAssessmentSummary[]> = {} as Record<Subject, StudentAssessmentSummary[]>;
    
    filteredItems.forEach((item) => {
      const sub = item.subject;
      if (!groups[sub]) {
        groups[sub] = [];
      }
      groups[sub].push(item);
    });

    return groups;
  }, [filteredItems]);

  const activeSubjects = useMemo(() => {
    return Object.keys(groupedAssessments) as Subject[];
  }, [groupedAssessments]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-outline-variant/30 pb-6">
        <div>
          <nav className="mb-2">
            <ul className="flex items-center gap-2 text-caption text-muted-text">
              <li><Link href="/student" className="hover:text-primary transition-colors">Không gian học tập</Link></li>
              <li><ChevronRight size={14} className="text-muted-text/60" /></li>
              <li className="text-cream font-medium">Đánh giá & Bài kiểm tra</li>
            </ul>
          </nav>
          <h1 className="font-headline-h2 text-headline-h2 text-cream flex items-center gap-3">
            <Award className="text-primary animate-pulse" size={32} />
            Đánh giá của tôi
          </h1>
          <p className="mt-1 text-label-md text-muted-text">
            Thực hiện các bài kiểm tra định kỳ, bài tập lộ trình và nhận đánh giá học tập.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-comp-md rounded-xl grid gap-4 md:grid-cols-12 items-center">
        {/* Search */}
        <div className="relative md:col-span-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" />
          <input
            type="text"
            placeholder="Tìm kiếm bài tập..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container text-cream rounded-xl pl-10 pr-4 py-2 text-label-md border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
          />
        </div>

        {/* Môn học */}
        <div className="md:col-span-3">
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value as Subject | "all")}
            className="w-full bg-surface-container text-cream rounded-xl px-3 py-2 text-label-md border border-outline-variant/30 focus:border-primary outline-none cursor-pointer transition"
          >
            {subjects.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* Khối lớp */}
        <div className="md:col-span-2">
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="w-full bg-surface-container text-cream rounded-xl px-3 py-2 text-label-md border border-outline-variant/30 focus:border-primary outline-none cursor-pointer transition"
          >
            <option value="all">Khối lớp</option>
            {[9, 10, 11, 12].map((value) => (
              <option key={value} value={value}>
                Lớp {value}
              </option>
            ))}
          </select>
        </div>

        {/* Trạng thái */}
        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-surface-container text-cream rounded-xl px-3 py-2 text-label-md border border-outline-variant/30 focus:border-primary outline-none cursor-pointer transition"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="not_started">Chưa bắt đầu</option>
            <option value="doing">Đang làm</option>
            <option value="submitted">Đã nộp (Chờ chấm)</option>
            <option value="completed">Đã hoàn thành</option>
          </select>
        </div>
      </div>

      {/* Main List Section */}
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-outline-variant/20 bg-surface-container-low">
          <div className="text-center space-y-2">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <p className="text-label-md text-muted-text">Đang tải danh sách bài kiểm tra...</p>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-outline-variant/20">
          <BookOpenCheck className="mx-auto text-muted-text/30 mb-4" size={48} />
          <h3 className="text-body-lg font-bold text-cream">Không có bài kiểm tra nào</h3>
          <p className="mt-2 text-label-md text-muted-text max-w-md mx-auto">
            Không tìm thấy bài kiểm tra nào phù hợp với bộ lọc hiện tại hoặc chưa được giáo viên giao.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {activeSubjects.map((subKey) => {
            const list = groupedAssessments[subKey];
            const subjectLabel = SUBJECT_LABELS[subKey] || subKey;

            return (
              <section key={subKey} className="space-y-4">
                {/* Subject Group Title */}
                <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-2">
                  <span className="w-1.5 h-6 rounded-full bg-primary" />
                  <h2 className="text-body-lg font-extrabold text-cream uppercase tracking-wide">
                    {subjectLabel} ({list.length})
                  </h2>
                </div>

                {/* Placements Cards Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {list.map((item) => {
                    const isQuiz = item.assessmentType === "quiz";
                    const isMixed = item.gradingType === "mixed" || item.gradingType === "manual";
                    const used = item.attempt.usedAttempts;
                    const max = item.maxAttempts;
                    const latest = item.attempt.latestSubmission;

                    // Compute Status Label and Badge Styling
                    let statusLabel = "Chưa bắt đầu";
                    let badgeClass = "bg-surface-container text-muted-text";

                    if (used > 0 && latest) {
                      if (latest.status === "doing") {
                        statusLabel = "Đang làm";
                        badgeClass = "bg-warning/20 text-warning border border-warning/30";
                      } else if (latest.status === "submitted") {
                        statusLabel = "Đã nộp (Chờ chấm)";
                        badgeClass = "bg-secondary-container/20 text-secondary border border-secondary-container/30";
                      } else if (latest.status === "completed" || latest.status === "auto_submitted") {
                        statusLabel = latest.finalScore ? `Đạt ${latest.finalScore}/10` : "Đã hoàn thành";
                        badgeClass = "bg-success/20 text-success border border-success/30";
                      }
                    }

                    // Date range checks
                    const now = new Date();
                    const isOpen = item.openTime ? new Date(item.openTime) <= now : true;
                    const isClosed = item.closeTime ? new Date(item.closeTime) < now : false;
                    const isLocked = !isOpen || isClosed;

                    return (
                      <div
                        key={item.placementId}
                        className="glass-panel p-5 rounded-2xl flex flex-col justify-between border border-outline-variant/30 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 relative group"
                      >
                        <div>
                          {/* Top row: Badges */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                              Lớp {item.grade} • {isQuiz ? "Quiz Trắc Nghiệm" : "Exam PDF"}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${badgeClass}`}>
                              {statusLabel}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-label-bold font-bold text-cream group-hover:text-primary transition-colors line-clamp-2 min-h-[40px]">
                            {item.title}
                          </h3>

                          {/* Context info (Course & Lesson) */}
                          <div className="mt-3 space-y-1 text-caption text-muted-text border-t border-outline-variant/10 pt-3">
                            <div className="flex items-center gap-1.5 truncate">
                              <BookOpen size={12} className="text-muted-text/70" />
                              <span>Khóa: {item.course.title}</span>
                            </div>
                            {item.lesson && (
                              <div className="flex items-center gap-1.5 truncate">
                                <BookOpenCheck size={12} className="text-muted-text/70" />
                                <span>Bài: {item.lesson.title} ({item.lesson.chapterTitle})</span>
                              </div>
                            )}
                          </div>

                          {/* Metadata grid */}
                          <div className="mt-4 grid grid-cols-2 gap-2 text-caption bg-surface-container/40 p-2.5 rounded-lg border border-outline-variant/15">
                            <div className="flex items-center gap-1">
                              <Clock size={11} className="text-muted-text" />
                              <span>{item.timeLimitMinutes ? `${item.timeLimitMinutes} phút` : "Tự do"}</span>
                            </div>
                            <div className="flex items-center gap-1 justify-end">
                              <PlayCircle size={11} className="text-muted-text" />
                              <span>Lượt: {used}/{max ?? "∞"}</span>
                            </div>
                          </div>

                          {/* Time constraints info */}
                          {item.closeTime && (
                            <div className="mt-3 flex items-center gap-1 text-[11px] text-muted-text">
                              <Calendar size={11} className="text-muted-text" />
                              <span className="truncate">Hạn: {new Date(item.closeTime).toLocaleDateString("vi-VN")}</span>
                            </div>
                          )}
                        </div>

                        {/* CTA button */}
                        <div className="mt-5 pt-3 border-t border-outline-variant/10">
                          {isClosed ? (
                            <div className="w-full bg-surface-container text-muted-text py-2 rounded-xl text-center text-caption font-bold flex items-center justify-center gap-1.5 cursor-not-allowed">
                              <AlertTriangle size={13} className="text-error" />
                              Đã hết hạn làm bài
                            </div>
                          ) : !isOpen ? (
                            <div className="w-full bg-surface-container text-muted-text py-2 rounded-xl text-center text-caption font-bold flex items-center justify-center gap-1.5 cursor-not-allowed">
                              <Calendar size={13} />
                              Chưa đến giờ mở đề
                            </div>
                          ) : latest?.status === "doing" ? (
                            <Link
                              href={`/student/assessments/${item.placementId}`}
                              className="w-full bg-warning text-deep-black hover:bg-warning/95 font-bold py-2 rounded-xl flex items-center justify-center gap-1 text-label-md transition-all transform active:scale-95 shadow-md shadow-warning/10"
                            >
                              Làm tiếp Lượt #{used}
                              <ChevronRight size={14} />
                            </Link>
                          ) : max && used >= max ? (
                            <Link
                              href={`/student/assessments/${item.placementId}`}
                              className="w-full bg-surface-container border border-outline-variant/50 text-cream hover:bg-surface-container-high font-bold py-2 rounded-xl flex items-center justify-center gap-1 text-label-md transition-all transform active:scale-95"
                            >
                              Xem kết quả
                              <ChevronRight size={14} />
                            </Link>
                          ) : (
                            <Link
                              href={`/student/assessments/${item.placementId}`}
                              className="w-full bg-primary-container text-white hover:brightness-115 font-bold py-2 rounded-xl flex items-center justify-center gap-1 text-label-md transition-all transform active:scale-95 shadow-md shadow-primary/10"
                            >
                              {used > 0 ? `Làm lại (Lượt #${used + 1})` : "Vào làm bài"}
                              <ChevronRight size={14} />
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
