"use client";

import Link from "next/link";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { SUBJECT_LABELS } from "@/types/common";
import { CourseSummary } from "../types";
import { formatVND } from "@/lib/utils/format-money";
import { ShoppingCart } from "lucide-react";
import { getCatalogCourse } from "@/features/courses/api";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "@/stores/toast-store";
import {
  isQueryFresh,
  PREFETCH_STALE_TIME_MS,
  useIntentPrefetch,
} from "@/lib/utils/prefetch";
import { SafeImage } from "@/components/media/safe-image";

const prefetchedCatalogCourseSlugs = new Set<string>();

type CourseCardProps = {
  course: CourseSummary;
  aspectRatio?: "video" | "portrait";
};

export default function CourseCard({
  course,
  aspectRatio = "video",
}: CourseCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);
  const isAlreadyInCart = items.some((item) => item.id === course.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAlreadyInCart) {
      toast.info("Khóa học đã có trong giỏ hàng!");
      return;
    }
    addItem(course);
    toast.success("Đã thêm khóa học vào giỏ hàng!");
  };

  // Safe parsing of subject uppercase labels
  const subjectLabel =
    SUBJECT_LABELS[course.subject] || course.subject.toUpperCase();

  // Calculate discount percentage
  const discountPercent =
    course.salePrice && course.price
      ? Math.round(((course.price - course.salePrice) / course.price) * 100)
      : 0;

  const aspectClass = aspectRatio === "video" ? "aspect-video" : "aspect-[3/4]";
  const courseHref = `/courses/${course.slug}`;

  const prefetchCourse = useCallback(async () => {
    if (!course.slug) {
      return;
    }

    const queryKey = ["catalog-course-detail", course.slug] as const;
    router.prefetch(courseHref);

    if (!isQueryFresh(queryClient, queryKey, PREFETCH_STALE_TIME_MS)) {
      await queryClient.prefetchQuery({
        queryKey,
        queryFn: () => getCatalogCourse(course.slug),
        staleTime: PREFETCH_STALE_TIME_MS,
      });
    }
  }, [course.slug, courseHref, queryClient, router]);

  const intentPrefetchHandlers = useIntentPrefetch({
    id: course.slug,
    prefetchedIds: prefetchedCatalogCourseSlugs,
    prefetch: prefetchCourse,
  });

  return (
    <div
      {...intentPrefetchHandlers}
      className="bg-deep-black border border-border-dark rounded overflow-hidden hover:border-brand-pink/40 hover:shadow-[0_0_25px_rgba(52,211,153,0.22)] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group flex flex-col h-full"
    >
      {/* Thumbnail */}
      <div
        className={`relative overflow-hidden ${aspectClass} bg-brand-dark/50`}
      >
        <SafeImage
          alt={course.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-all duration-300 group-hover:scale-105"
          src={course.thumbnailUrl}
        />

        {/* Subject Tag */}
        <div className="absolute top-3 left-3 bg-brand-pink text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm z-10">
          {subjectLabel}
        </div>

        {/* Sale Discount Tag */}
        {discountPercent > 0 && (
          <div className="absolute top-3 right-3 bg-accent-orange text-white text-xs font-bold px-2 py-1 rounded shadow-sm border border-brand-dark/20 flex items-center gap-1 z-10">
            -{discountPercent}%
          </div>
        )}
      </div>

      {/* Info Body */}
      <div className="p-6 flex flex-col flex-grow justify-between">
        <div>
          {/* Grade and lesson count */}
          <div className="mb-2.5">
            <span className="text-xs font-bold text-muted-taupe uppercase">
              Khối {course.grade} • {course.totalLessons || 0} bài học
            </span>
          </div>

          {/* Title */}
          <Link href={courseHref}>
            <h3 className="text-base md:text-lg font-bold text-cream mb-4 leading-tight group-hover:text-brand-pink transition-colors line-clamp-2 min-h-[44px]">
              {course.title}
            </h3>
          </Link>
        </div>

        <div>
          {/* Teacher Info */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border-dark flex-shrink-0">
              <SafeImage
                alt={course.teacher.fullName}
                fill
                sizes="40px"
                className="object-cover"
                src={course.teacher.avatarUrl}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-cream">
                {course.teacher.fullName}
              </span>
              <span className="text-xs text-muted-taupe">
                Giảng viên chuyên môn
              </span>
            </div>
          </div>

          {/* Pricing & Add to Cart */}
          <div className="flex items-end justify-between border-t border-border-dark pt-4">
            <div className="flex flex-col">
              {course.salePrice ? (
                <>
                  <span className="text-xs text-muted-taupe line-through font-medium leading-none mb-1">
                    {formatVND(course.price)}
                  </span>
                  <span className="text-lg font-extrabold text-brand-pink leading-none">
                    {formatVND(course.salePrice)}
                  </span>
                </>
              ) : (
                <span className="text-lg font-extrabold text-brand-pink leading-none">
                  {formatVND(course.price)}
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              className={`p-2.5 rounded-lg border transition-all active:scale-90 cursor-pointer ${
                isAlreadyInCart
                  ? "bg-brand-pink/10 border-brand-pink text-brand-pink hover:bg-brand-pink hover:text-white"
                  : "bg-off-black border-border-dark text-cream hover:bg-brand-pink hover:text-white hover:border-brand-pink"
              }`}
              title={
                isAlreadyInCart ? "Đã có trong giỏ hàng" : "Thêm vào giỏ hàng"
              }
            >
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
