"use client";

import React from "react";
import { BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useMyLearningCoursesQuery } from "@/features/courses/hooks";
import StudentCourseCard from "./components/student-course-card";

export default function MyCoursesPage() {
  const { data: courses, isLoading } = useMyLearningCoursesQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-cream animate-pulse">
            Khóa học của tôi
          </h2>
          <div className="h-4 bg-muted-text/20 w-48 rounded mt-2 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-deep-black rounded border border-border-dark overflow-hidden flex flex-col h-96 animate-pulse"
            >
              <div className="h-40 bg-off-black" />
              <div className="p-5 flex-grow space-y-4">
                <div className="h-4 bg-muted-text/20 w-1/3 rounded" />
                <div className="h-6 bg-muted-text/20 w-3/4 rounded" />
                <div className="h-4 bg-muted-text/20 w-full rounded mt-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-cream">
            Khóa học của tôi
          </h2>
          <p className="text-sm text-muted-text mt-1">
            Danh sách các lộ trình học tập bạn đã đăng ký
          </p>
        </div>
        <div className="flex flex-col items-center justify-center text-center p-12 bg-deep-black rounded border border-border-dark min-h-[350px]">
          <BookOpen size={48} className="text-brand-pink/50 mb-4" />
          <h3 className="text-base font-bold text-cream">
            Bạn chưa đăng ký khóa học nào
          </h3>
          <p className="text-sm text-muted-text max-w-sm mt-2">
            Hãy khám phá các khóa học bứt phá điểm số chất lượng cao tại HH Education!
          </p>
          <Link
            href="/courses"
            className="mt-6 inline-flex items-center gap-2 bg-brand-pink text-brand-dark px-6 py-2.5 rounded font-bold text-xs hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            Khám phá ngay
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div>
        <h2 className="text-2xl font-extrabold text-cream">
          Khóa học của tôi
        </h2>
        <p className="text-sm text-muted-text mt-1">
          Danh sách các lộ trình học tập bạn đã đăng ký
        </p>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <StudentCourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
