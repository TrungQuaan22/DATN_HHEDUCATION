"use client";

import Link from "next/link";
import { useCatalogCoursesQuery } from "@/features/courses/hooks";
import CourseCard from "@/features/courses/components/course-card";
import { ArrowRight } from "lucide-react";

export default function FeaturedCoursesSection() {
  const { data, isLoading } = useCatalogCoursesQuery({ featured: true, limit: 3 });
  const courses = data?.items || [];

  return (
    <section className="py-24 bg-deep-black" id="courses">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-4">
          <div className="text-center md:text-left">
            <h2 className="text-[36px] font-[700] text-cream mb-2">
              Khóa học tiêu biểu
            </h2>
            <p className="text-[16px] text-muted-taupe">
              Lộ trình học tập từ lớp 10 đến lớp 12
            </p>
          </div>
          <Link
            href="/courses"
            className="bg-surface-input border border-border-dark px-6 py-2 rounded-full text-cream text-[14px] font-medium flex items-center gap-2 hover:bg-brand-pink/10 hover:border-brand-pink transition-all"
          >
            Xem tất cả <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            id="courseCarousel"
          >
            {courses.map((course) => (
              <div key={course.id} className="h-full">
                <CourseCard course={course} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
