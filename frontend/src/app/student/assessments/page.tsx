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
  Calendar,
  AlertTriangle,
  PlayCircle,
} from "lucide-react";
import { useStudentAssessmentsQuery } from "@/features/assessments/hooks";
import { StudentAssessmentSummary } from "@/features/assessments/types";

export default function StudentAssessmentsPage() {
  const [activeTab, setActiveTab] = useState<
    "upcoming" | "past_due" | "completed"
  >("upcoming");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch assessments list directly from GET /learning/assessments
  const { data, isLoading } = useStudentAssessmentsQuery();

  const rawItems = useMemo(() => data?.items || [], [data]);

  // Extract unique courses student is enrolled in from the raw assessments list
  const registeredCourses = useMemo(() => {
    const coursesMap = new Map<string, { id: string; title: string }>();
    rawItems.forEach((item) => {
      if (item.course) {
        coursesMap.set(item.course.id, {
          id: item.course.id,
          title: item.course.title,
        });
      }
    });
    return Array.from(coursesMap.values());
  }, [rawItems]);

  // Apply search query and course filters
  const filteredItems = useMemo(() => {
    return rawItems.filter((item) => {
      // 1. Search Query filter (title or course title)
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.course.title.toLowerCase().includes(q);

      // 2. Course Filter
      const matchCourse =
        courseFilter === "all" || item.course.id === courseFilter;

      return matchSearch && matchCourse;
    });
  }, [rawItems, searchQuery, courseFilter]);

  // Categorize assessments into MS Teams-like tabs: Upcoming, Past Due, Completed
  const tabsData = useMemo(() => {
    const now = new Date();
    const upcoming: StudentAssessmentSummary[] = [];
    const pastDue: StudentAssessmentSummary[] = [];
    const completed: StudentAssessmentSummary[] = [];

    filteredItems.forEach((item) => {
      const used = item.attempt.usedAttempts;
      const max = item.maxAttempts;
      const latest = item.attempt.latestSubmission;

      const isCompleted =
        (latest && latest.status !== "doing") || (max !== null && used >= max);

      const isClosed = item.closeTime ? new Date(item.closeTime) < now : false;

      if (isCompleted) {
        completed.push(item);
      } else if (isClosed) {
        pastDue.push(item);
      } else {
        upcoming.push(item);
      }
    });

    return { upcoming, past_due: pastDue, completed };
  }, [filteredItems]);

  const currentList = tabsData[activeTab];

  // Group current tab items by Course for structured display
  const groupedByCourse = useMemo(() => {
    const groups: Record<
      string,
      { title: string; items: StudentAssessmentSummary[] }
    > = {};
    currentList.forEach((item) => {
      const cId = item.course.id;
      if (!groups[cId]) {
        groups[cId] = { title: item.course.title, items: [] };
      }
      groups[cId].items.push(item);
    });
    return Object.values(groups);
  }, [currentList]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-outline-variant/30 pb-6">
        <div>
          <nav className="mb-2">
            <ul className="flex items-center gap-2 text-caption text-muted-text">
              <li>
                <Link
                  href="/student"
                  className="hover:text-primary transition-colors"
                >
                  Không gian học tập
                </Link>
              </li>
              <li>
                <ChevronRight size={14} className="text-muted-text/60" />
              </li>
              <li className="text-cream font-medium">
                Đánh giá & Bài kiểm tra
              </li>
            </ul>
          </nav>
          <h1 className="font-headline-h2 text-headline-h2 text-cream flex items-center gap-3">
            <Award className="text-primary animate-pulse" size={32} />
            Đánh giá của tôi
          </h1>
          <p className="mt-1 text-label-md text-muted-text">
            Thực hiện các bài kiểm tra định kỳ, bài tập lộ trình và nhận đánh
            giá học tập theo khóa học.
          </p>
        </div>
      </div>

      {/* Tabs Navigation (MS Teams-like) */}
      <div className="flex border-b border-outline-variant/20 gap-6">
        {[
          {
            key: "upcoming",
            label: "Đang & Sắp diễn ra",
            count: tabsData.upcoming.length,
          },
          {
            key: "past_due",
            label: "Quá hạn",
            count: tabsData.past_due.length,
          },
          {
            key: "completed",
            label: "Đã hoàn thành",
            count: tabsData.completed.length,
          },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`pb-4 text-sm font-bold relative transition-all active:scale-95 cursor-pointer flex items-center gap-2 ${
              activeTab === t.key
                ? "text-primary"
                : "text-muted-text hover:text-cream"
            }`}
          >
            <span>{t.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-xs font-extrabold bg-surface-container-high border border-outline-variant/30 ${
                activeTab === t.key
                  ? "text-primary border-primary/30"
                  : "text-muted-text"
              }`}
            >
              {t.count}
            </span>
            {activeTab === t.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-slideIn" />
            )}
          </button>
        ))}
      </div>

      {/* Search and Course Filters */}
      <div className="glass-panel p-4 rounded-xl grid gap-4 md:grid-cols-12 items-center">
        {/* Search */}
        <div className="relative md:col-span-6">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text"
          />
          <input
            type="text"
            placeholder="Tìm kiếm bài tập, bài kiểm tra..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container text-cream rounded-xl pl-10 pr-4 py-2 text-label-md border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
          />
        </div>

        {/* Lọc theo khóa học */}
        <div className="md:col-span-6">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="w-full bg-surface-container text-cream rounded-xl px-3 py-2 text-label-md border border-outline-variant/30 focus:border-primary outline-none cursor-pointer transition"
          >
            <option value="all">Tất cả khóa học đã đăng ký</option>
            {registeredCourses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main List Section */}
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-outline-variant/20 bg-surface-container-low">
          <div className="text-center space-y-2">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <p className="text-label-md text-muted-text">
              Đang tải danh sách bài tập...
            </p>
          </div>
        </div>
      ) : currentList.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-outline-variant/20">
          <BookOpenCheck
            className="mx-auto text-muted-text/30 mb-4"
            size={48}
          />
          <h3 className="text-body-lg font-bold text-cream">
            Không có bài tập nào
          </h3>
          <p className="mt-2 text-label-md text-muted-text max-w-md mx-auto">
            Không tìm thấy bài tập nào trong mục này.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedByCourse.map((group) => {
            return (
              <section key={group.title} className="space-y-4">
                {/* Course Group Title */}
                <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-2">
                  <span className="w-1.5 h-6 rounded-full bg-primary" />
                  <h2 className="text-body-lg font-extrabold text-cream uppercase tracking-wide">
                    {group.title} ({group.items.length})
                  </h2>
                </div>

                {/* Placements Cards Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((item) => {
                    const isQuiz = item.assessmentType === "quiz";
                    const used = item.attempt.usedAttempts;
                    const max = item.maxAttempts;
                    const latest = item.attempt.latestSubmission;

                    // Compute Status Label and Badge Styling
                    let statusLabel = "Chưa bắt đầu";
                    let badgeClass = "bg-surface-container text-muted-text";

                    if (used > 0 && latest) {
                      if (latest.status === "doing") {
                        statusLabel = "Đang làm";
                        badgeClass =
                          "bg-warning/20 text-warning border border-warning/30";
                      } else if (
                        latest.status === "submitted" ||
                        (latest.status === "auto_submitted" &&
                          latest.finalScore === null)
                      ) {
                        statusLabel = "Đã nộp (Chờ chấm)";
                        badgeClass =
                          "bg-secondary-container/20 text-secondary border border-secondary-container/30";
                      } else if (
                        latest.status === "completed" ||
                        latest.status === "auto_submitted"
                      ) {
                        statusLabel = latest.finalScore
                          ? `Đạt ${latest.finalScore}/10`
                          : "Đã hoàn thành";
                        badgeClass =
                          "bg-success/20 text-success border border-success/30";
                      }
                    }

                    // Date range checks
                    const now = new Date();
                    const isOpen = item.openTime
                      ? new Date(item.openTime) <= now
                      : true;
                    const isClosed = item.closeTime
                      ? new Date(item.closeTime) < now
                      : false;

                    return (
                      <div
                        key={item.placementId}
                        className="glass-panel p-5 rounded-2xl flex flex-col justify-between border border-outline-variant/30 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 relative group"
                      >
                        <div>
                          {/* Top row: Badges */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-xs uppercase font-bold text-primary tracking-wider">
                              Lớp {item.grade} •{" "}
                              {isQuiz ? "Quiz Trắc Nghiệm" : "Exam PDF"}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-bold ${badgeClass}`}
                            >
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
                              <BookOpen
                                size={12}
                                className="text-muted-text/70"
                              />
                              <span>Khóa: {item.course.title}</span>
                            </div>
                            {item.lesson && (
                              <div className="flex items-center gap-1.5 truncate">
                                <BookOpenCheck
                                  size={12}
                                  className="text-muted-text/70"
                                />
                                <span>
                                  Bài: {item.lesson.title} (
                                  {item.lesson.chapterTitle})
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Metadata grid */}
                          <div className="mt-4 grid grid-cols-2 gap-2 text-caption bg-surface-container/40 p-2.5 rounded-lg border border-outline-variant/15">
                            <div className="flex items-center gap-1">
                              <Clock size={11} className="text-muted-text" />
                              <span>
                                {item.timeLimitMinutes
                                  ? `${item.timeLimitMinutes} phút`
                                  : "Tự do"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 justify-end">
                              <PlayCircle
                                size={11}
                                className="text-muted-text"
                              />
                              <span>
                                Lượt: {used}/{max ?? "∞"}
                              </span>
                            </div>
                          </div>

                          {/* Time constraints info */}
                          {item.closeTime && (
                            <div className="mt-3 flex items-center gap-1 text-xs text-muted-text">
                              <Calendar size={11} className="text-muted-text" />
                              <span className="truncate">
                                Hạn:{" "}
                                {new Date(item.closeTime).toLocaleDateString(
                                  "vi-VN",
                                )}
                              </span>
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
                            <Link
                              href={`/student/assessments/${item.placementId}`}
                              className="w-full bg-surface-container border border-outline-variant/50 text-cream hover:bg-surface-container-high font-bold py-2 rounded-xl flex items-center justify-center gap-1 text-label-md transition-all transform active:scale-95"
                            >
                              Xem chi tiết (Chưa mở)
                              <ChevronRight size={14} />
                            </Link>
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
                              {used > 0
                                ? `Làm lại (Lượt #${used + 1})`
                                : "Vào làm bài"}
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
