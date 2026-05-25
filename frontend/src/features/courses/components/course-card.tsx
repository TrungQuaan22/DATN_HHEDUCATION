"use client";

import Link from "next/link";
import { CourseSummary, SUBJECT_LABELS } from "@/types/common";
import { formatVND } from "@/lib/utils/format-money";
import { Star, ShoppingCart } from "lucide-react";

type CourseCardProps = {
  course: CourseSummary;
  aspectRatio?: "video" | "portrait";
};

export default function CourseCard({
  course,
  aspectRatio = "video",
}: CourseCardProps) {
  // Safe parsing of subject uppercase labels
  const subjectLabel =
    SUBJECT_LABELS[course.subject] || course.subject.toUpperCase();

  // Calculate discount percentage
  const discountPercent =
    course.salePrice && course.price
      ? Math.round(((course.price - course.salePrice) / course.price) * 100)
      : 0;

  // Mock rating fallback
  const rating = 4.8;

  const aspectClass = aspectRatio === "video" ? "aspect-video" : "aspect-[3/4]";

  return (
    <div className="bg-deep-black border border-border-dark rounded-xl overflow-hidden hover:border-brand-pink/40 hover:shadow-[0_0_25px_rgba(52,211,153,0.22)] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group flex flex-col h-full">
      {/* Thumbnail */}
      <div
        className={`relative overflow-hidden ${aspectClass} bg-brand-dark/50`}
      >
        <img
          alt={course.title}
          className="w-full h-full object-cover transition-all duration-300"
          src={course.thumbnailUrl || ""}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="100%" height="100%" fill="%231D0C14"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23AF9DA6" font-family="sans-serif">No Image</text></svg>';
          }}
        />

        {/* Subject Tag */}
        <div className="absolute top-3 left-3 bg-brand-pink text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
          {subjectLabel}
        </div>

        {/* Sale Discount Tag */}
        {discountPercent > 0 && (
          <div className="absolute top-3 right-3 bg-accent-orange text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-brand-dark/20 flex items-center gap-1">
            -{discountPercent}%
          </div>
        )}
      </div>

      {/* Info Body */}
      <div className="p-6 flex flex-col flex-grow justify-between">
        <div>
          {/* Grade & Rating Row */}
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-[12px] font-bold text-muted-taupe uppercase">
              Khối {course.grade} • {course.lessonsCount || 0} bài học
            </span>
            <div className="flex items-center gap-1 text-accent-orange">
              <Star
                size={13}
                className="fill-accent-orange stroke-accent-orange"
              />
              <span className="text-[12px] font-bold">{rating}</span>
            </div>
          </div>

          {/* Title */}
          <Link href={`/courses/${course.slug}`}>
            <h3 className="text-[16px] md:text-[18px] font-bold text-cream mb-4 leading-tight group-hover:text-brand-pink transition-colors line-clamp-2 min-h-[44px]">
              {course.title}
            </h3>
          </Link>
        </div>

        <div>
          {/* Teacher Info */}
          <div className="flex items-center gap-3 mb-6">
            <img
              alt={course.teacher.fullName}
              className="w-10 h-10 rounded-full object-cover border border-border-dark"
              src={
                course.teacher.avatarUrl ||
                "https://lh3.googleusercontent.com/aida/ADBb0uiIek7P62jjJQjU84PIV6GsfsuyN4KmS9fL8kB6kpryaM4TkPT2F2LhGKwuC3hvfNQf_zY87X2K48fs4HvQljJNxRMwZ0xpYwr6hQldNlJiBXSZp2yCTCYv_id9QoLVARzshzEmPSCMWPAx8CKPpdvEPKzvbSJ8ma_FqeGFH5P-fWBGMyad5cxcucjCmlBAFqfbFcgGPrdQvqFI1VOucL5mtyjpHhjgUZVyiTybciyZyXUfQcNa1aVypgY"
              }
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="20" cy="20" r="20" fill="%232E1F26"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23AF9DA6" font-size="12">Teacher</text></svg>';
              }}
            />
            <div className="flex flex-col">
              <span className="text-[12px] font-bold text-cream">
                {course.teacher.fullName}
              </span>
              <span className="text-[10px] text-muted-taupe">
                Giảng viên chuyên môn
              </span>
            </div>
          </div>

          {/* Pricing & Add to Cart */}
          <div className="flex items-end justify-between border-t border-border-dark pt-4">
            <div className="flex flex-col">
              {course.salePrice ? (
                <>
                  <span className="text-[12px] text-muted-taupe line-through font-medium leading-none mb-1">
                    {formatVND(course.price)}
                  </span>
                  <span className="text-[18px] font-extrabold text-brand-pink leading-none">
                    {formatVND(course.salePrice)}
                  </span>
                </>
              ) : (
                <span className="text-[18px] font-extrabold text-brand-pink leading-none">
                  {formatVND(course.price)}
                </span>
              )}
            </div>

            <button
              className="p-2.5 rounded-lg bg-off-black border border-border-dark text-cream hover:bg-brand-pink hover:text-white hover:border-brand-pink transition-all active:scale-90 cursor-pointer"
              title="Thêm vào giỏ hàng"
            >
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

