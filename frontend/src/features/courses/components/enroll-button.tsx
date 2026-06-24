"use client";

import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { useMyLearningCoursesQuery } from "../hooks";
import { toast } from "@/stores/toast-store";
import { useRouter } from "next/navigation";
import { CourseSummary } from "../types";

type EnrollButtonProps = {
  course: any; // Accept course data shape
};

export default function EnrollButton({ course }: EnrollButtonProps) {
  const { addItem, items } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const { data: enrolledCourses } = useMyLearningCoursesQuery({
    enabled: isAuthenticated,
  });

  const isEnrolled = enrolledCourses?.some((c) => c.id === course.id);
  const isAlreadyInCart = items.some((item) => item.id === course.id);

  const handleEnroll = () => {
    if (isEnrolled) {
      router.push(`/student/courses/${course.slug}`);
      return;
    }
    if (isAlreadyInCart) {
      router.push("/cart");
      return;
    }

    // Construct CourseSummary shape from the course object
    const courseSummary: CourseSummary = {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      subject: course.subject,
      grade: course.grade,
      teacher: {
        id: course.teacher.id,
        fullName: course.teacher.fullName,
        avatarUrl: course.teacher.avatarUrl,
      },
      thumbnailUrl: course.thumbnailUrl,
      price: course.price,
      salePrice: course.salePrice,
      status: course.status || "published",
      isFeatured: course.isFeatured || false,
      totalLessons: course.totalLessons || 0,
      createdAt: course.createdAt || new Date().toISOString(),
      updatedAt: course.updatedAt || new Date().toISOString(),
    };

    addItem(courseSummary);
    toast.success("Đã thêm khóa học vào giỏ hàng!");
    router.push("/cart");
  };

  let buttonText = "ĐĂNG KÝ NGAY";
  if (isEnrolled) {
    buttonText = "THAM GIA HỌC";
  } else if (isAlreadyInCart) {
    buttonText = "ĐẾN GIỎ HÀNG VÀ THANH TOÁN";
  }

  return (
    <button
      onClick={handleEnroll}
      className="w-full bg-brand-pink text-white font-bold text-sm py-4 rounded hover:opacity-90 active:scale-95 transition-all shadow-lg cursor-pointer uppercase text-center"
    >
      {buttonText}
    </button>
  );
}
