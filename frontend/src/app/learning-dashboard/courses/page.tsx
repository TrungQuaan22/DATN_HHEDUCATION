"use client";

import React from "react";
import { BookOpen, GraduationCap, ArrowRight, Lock } from "lucide-react";
import { useMyLearningCoursesQuery } from "@/features/courses/hooks";
import { useRouter } from "next/navigation";

interface EnrolledCourse {
  courseId: string;
  title: string;
  slug: string;
  subject: string;
  grade: number;
  teacherName: string;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
  isPlaceholder?: boolean;
}

export default function MyCoursesPage() {
  const router = useRouter();
  const { data: learningCourses = [], isLoading } = useMyLearningCoursesQuery();

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

  const getSubjectLabel = (subject: string) => {
    switch (subject) {
      case "math": return "Toán Học";
      case "literature": return "Ngữ Văn";
      case "english": return "Anh Văn";
      default: return "Khác";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div>
          <div className="h-8 w-48 bg-[#1e1e24] rounded-lg"></div>
          <div className="h-4 w-72 bg-[#1e1e24] rounded-lg mt-2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#121215] rounded-2xl border border-[#202024]/50 h-80"></div>
          ))}
        </div>
      </div>
    );
  }

  // Map real courses
  const mappedCourses: EnrolledCourse[] = learningCourses.map((course) => {
    const total = course.totalLessons || 0;
    const completed = course.completedLessons || 0;
    return {
      courseId: course.id,
      title: course.title,
      slug: course.slug,
      subject: course.subject,
      grade: course.grade,
      teacherName: course.teacher?.fullName || "Giảng viên HH",
      completedLessons: completed,
      totalLessons: total,
      progressPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  });

  // Pad to 3 items using beautiful coming soon placeholders
  const displayCourses = [...mappedCourses];
  if (displayCourses.length < 3) {
    const needed = 3 - displayCourses.length;
    for (let i = 0; i < needed; i++) {
      displayCourses.push({
        courseId: `placeholder-${i}`,
        title: i === 0 
          ? "Khóa học định hướng & Phát triển tư duy sắp ra mắt" 
          : "Chuyên đề tổng ôn nâng cao đang được thiết kế",
        slug: "#",
        subject: i === 0 ? "english" : "math",
        grade: 12,
        teacherName: "HH Education Team",
        completedLessons: 0,
        totalLessons: 10,
        progressPercentage: 0,
        isPlaceholder: true,
      });
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div>
        <h2 className="text-2xl font-extrabold text-cream">Khóa học của tôi</h2>
        <p className="text-sm text-muted-text mt-1">Danh sách các lộ trình học tập bạn đã đăng ký</p>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayCourses.map((course) => {
          if (course.isPlaceholder) {
            return (
              <div
                key={course.courseId}
                className="bg-[#121215]/40 rounded-2xl border border-dashed border-[#202024] overflow-hidden flex flex-col opacity-60 transition-all shadow-sm"
              >
                {/* Thumbnail Header */}
                <div className="h-40 bg-[#151518] flex flex-col items-center justify-center p-6 relative">
                  <Lock size={40} className="text-muted-text/40" />
                  <span className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded bg-[#202024] border border-border-dark text-muted-text uppercase tracking-wider">
                    Sắp ra mắt
                  </span>
                </div>

                {/* Content body */}
                <div className="p-5 flex-grow flex flex-col gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs font-semibold text-muted-text">
                      <GraduationCap size={13} />
                      <span>Lớp {course.grade} • {course.teacherName}</span>
                    </div>
                    <h3 className="text-sm font-bold text-muted-text line-clamp-2 mt-1">
                      {course.title}
                    </h3>
                  </div>

                  {/* Progress Tracker */}
                  <div className="space-y-1.5 mt-auto">
                    <div className="flex justify-between text-xs font-semibold text-muted-text">
                      <span>Đang cập nhật bài học</span>
                      <span>0%</span>
                    </div>
                    <div className="w-full h-1 bg-brand-dark border border-border-dark rounded-full overflow-hidden">
                      <div className="h-full bg-border-dark rounded-full w-0" />
                    </div>
                  </div>

                  <button
                    disabled
                    className="w-full text-center border border-border-dark text-muted-text/40 font-bold text-xs py-2.5 rounded-xl cursor-not-allowed"
                  >
                    Chờ thông báo lớp
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={course.courseId}
              className="bg-[#121215] rounded-2xl border border-[#202024] overflow-hidden flex flex-col group hover:border-brand-pink/30 transition-all shadow-md"
            >
              {/* Thumbnail Header */}
              <div className="h-40 bg-[#1e1e24] bg-gradient-to-br from-brand-pink/10 to-brand-dark flex flex-col items-center justify-center p-6 relative">
                <BookOpen size={44} className="text-brand-pink opacity-80 group-hover:scale-110 transition-transform" />
                <span className={`absolute top-3 right-3 text-xs font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border ${getSubjectBadgeStyles(course.subject)}`}>
                  {getSubjectLabel(course.subject)}
                </span>
              </div>

              {/* Content body */}
              <div className="p-5 flex-grow flex flex-col gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs font-semibold text-muted-text">
                    <GraduationCap size={14} />
                    <span>Lớp {course.grade} • {course.teacherName}</span>
                  </div>
                  <h3 className="text-lg font-bold text-cream group-hover:text-brand-pink transition-colors line-clamp-2 mt-1">
                    {course.title}
                  </h3>
                </div>

                {/* Progress Tracker */}
                <div className="space-y-1.5 mt-auto">
                  <div className="flex justify-between text-xs font-semibold text-muted-text">
                    <span>
                      {course.completedLessons > 0
                        ? `Đã học ${course.completedLessons} / ${course.totalLessons} bài`
                        : "Chưa học bài nào"
                      }
                    </span>
                    <span className={course.progressPercentage > 0 ? "text-brand-pink" : "text-muted-text"}>
                      {course.progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-brand-dark border border-border-dark rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-pink rounded-full transition-all duration-500"
                      style={{
                        width: `${course.progressPercentage}%`,
                        backgroundColor: course.subject === "math" ? "#10B981" : course.subject === "english" ? "#38BDF8" : "#FF69B4"
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/learning-dashboard/courses/${course.slug}`)}
                  className="w-full text-center bg-brand-pink text-brand-dark hover:scale-[1.02] active:scale-[0.98] font-bold text-sm py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  Vào học ngay
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
