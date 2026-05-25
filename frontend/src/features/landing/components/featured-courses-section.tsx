'use client';

import Link from 'next/link';
import { mockCourses } from '@/data/mock-data';
import CourseCard from '@/features/courses/components/course-card';
import { ArrowRight } from 'lucide-react';

export default function FeaturedCoursesSection() {
  return (
    <section className="py-24 bg-deep-black" id="courses">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-4">
          <div className="text-center md:text-left">
            <h2 className="text-[36px] font-[700] text-cream mb-2">Khóa học tiêu biểu</h2>
            <p className="text-[16px] text-muted-taupe">Lộ trình học tập từ lớp 10 đến lớp 12</p>
          </div>
          <Link
            href="/courses"
            className="bg-surface-input border border-border-dark px-6 py-2 rounded-full text-cream text-[14px] font-medium flex items-center gap-2 hover:bg-brand-pink/10 hover:border-brand-pink transition-all"
          >
            Xem tất cả <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="courseCarousel">
          {mockCourses.slice(0, 3).map((course) => (
            <div key={course.id} className="h-full">
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
