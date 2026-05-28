"use client";

import React, { useState } from "react";
import { BookOpen, GraduationCap, ArrowRight } from "lucide-react";

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
}

const mockEnrolledCourses: EnrolledCourse[] = [
  {
    courseId: "course-1",
    title: "Tích chữ thành văn - Module 1",
    slug: "ngu-van-11-tich-chu-thanh-van",
    subject: "literature",
    grade: 11,
    teacherName: "Cô Nguyễn Minh Anh",
    completedLessons: 13,
    totalLessons: 20,
    progressPercentage: 65
  },
  {
    courseId: "course-2",
    title: "Phân tích tác phẩm văn học",
    slug: "ngu-van-11-phan-tich-tac-pham",
    subject: "literature",
    grade: 11,
    teacherName: "ThS. Nguyễn Thành Trung",
    completedLessons: 6,
    totalLessons: 20,
    progressPercentage: 30
  },
  {
    courseId: "course-3",
    title: "Giải tích 12 nâng cao",
    slug: "toan-hoc-12-giai-tich-nang-cao",
    subject: "math",
    grade: 12,
    teacherName: "GV. Nguyễn Thị Hiền",
    completedLessons: 9,
    totalLessons: 30,
    progressPercentage: 30
  },
  {
    courseId: "course-4",
    title: "Tiếng Anh THPT - Căn bản 11",
    slug: "tieng-anh-11-can-ban",
    subject: "english",
    grade: 11,
    teacherName: "Cô Trần Thị Lan",
    completedLessons: 0,
    totalLessons: 15,
    progressPercentage: 0
  }
];

export default function MyCoursesPage() {
  const [courses] = useState<EnrolledCourse[]>(mockEnrolledCourses);

  // Helper to format subject tag styles
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div>
        <h2 className="text-[22px] font-extrabold text-cream">Khóa học của tôi</h2>
        <p className="text-[13px] text-muted-text mt-1">Danh sách các lộ trình học tập bạn đã đăng ký</p>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.courseId}
            className="bg-[#121215] rounded-2xl border border-[#202024] overflow-hidden flex flex-col group hover:border-brand-pink/30 transition-all shadow-md"
          >
            {/* Thumbnail Header */}
            <div className="h-40 bg-[#1e1e24] bg-gradient-to-br from-brand-pink/10 to-brand-dark flex flex-col items-center justify-center p-6 relative">
              <BookOpen size={44} className="text-brand-pink opacity-80 group-hover:scale-110 transition-transform" />
              <span className={`absolute top-3 right-3 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border ${getSubjectBadgeStyles(course.subject)}`}>
                {getSubjectLabel(course.subject)}
              </span>
            </div>

            {/* Content body */}
            <div className="p-5 flex-grow flex flex-col gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-text">
                  <GraduationCap size={14} />
                  <span>Lớp {course.grade} • {course.teacherName}</span>
                </div>
                <h3 className="text-[15px] font-bold text-cream group-hover:text-brand-pink transition-colors line-clamp-2 mt-1">
                  {course.title}
                </h3>
              </div>

              {/* Progress Tracker */}
              <div className="space-y-1.5 mt-auto">
                <div className="flex justify-between text-[11px] font-semibold text-muted-text">
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

              <button className="w-full text-center bg-brand-pink text-brand-dark hover:scale-[1.02] active:scale-[0.98] font-bold text-[12px] py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1">
                Vào học ngay
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
