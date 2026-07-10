import { getCatalogCourse } from "@/features/courses/api";
import { SUBJECT_LABELS } from "@/types/common";
import { formatVND } from "@/lib/utils/format-money";
import CurriculumAccordion from "@/features/courses/components/curriculum-accordion";
import CoursePreviewThumbnail from "@/features/courses/components/course-preview-thumbnail";
import Link from "next/link";
import {
  Clock,
  BookOpen,
  ShieldCheck,
  GraduationCap,
  Phone,
} from "lucide-react";
import { notFound } from "next/navigation";
import EnrollButton from "@/features/courses/components/enroll-button";
import { SafeImg } from "@/components/media/safe-image";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  try {
    const course = await getCatalogCourse(slug);
    return {
      title: `${course.title} | HH Education`,
      description:
        course.description ||
        "Chi tiết khóa học chất lượng cao tại HH Education.",
    };
  } catch {
    return {
      title: "Khóa học không tìm thấy | HH Education",
    };
  }
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  
  let course;
  try {
    course = await getCatalogCourse(slug);
  } catch {
    notFound();
  }

  // Find the first preview video lesson with a youtubeUrl to use as the course intro video
  let previewVideoUrl: string | null = null;
  let previewLessonTitle: string | null = null;
  if (course.chapters) {
    for (const chapter of course.chapters) {
      const previewLesson = chapter.lessons.find(
        (l) => l.allowPreview && l.type === "video" && l.youtubeUrl,
      );
      if (previewLesson) {
        previewVideoUrl = previewLesson.youtubeUrl || null;
        previewLessonTitle = previewLesson.title;
        break;
      }
    }
  }

  // Calculate discount percentage
  const discountPercent =
    course.salePrice && course.price
      ? Math.round(((course.price - course.salePrice) / course.price) * 100)
      : 0;

  const relatedCourses = course.relatedCourses || [];

  // SEO Course JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    provider: {
      "@type": "Organization",
      name: "HH Education",
      sameAs: "http://localhost:3000",
    },
    offers: {
      "@type": "Offer",
      price: course.salePrice || course.price,
      priceCurrency: "VND",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen pt-20 bg-brand-dark transition-colors duration-200">
        {/* Hero Section */}
        <header className="bg-deep-black border-b border-border-dark py-16 md:py-24 transition-colors duration-200">
          <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-brand-pink/10 text-brand-pink px-4 py-1.5 rounded-full border border-brand-pink/20 text-xs font-bold tracking-wider uppercase">
                <GraduationCap size={14} />
                <span>
                  {SUBJECT_LABELS[course.subject]} • Lớp {course.grade}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold text-cream leading-tight tracking-tight">
                {course.title}
              </h1>

              <div className="flex items-center gap-4 py-4">
                <SafeImg
                  alt={course.teacher.fullName}
                  className="w-14 h-14 rounded-full border-2 border-brand-pink object-cover"
                  src={course.teacher.avatarUrl}
                />
                <div>
                  <p className="text-xs font-bold text-muted-taupe uppercase tracking-widest">
                    Giảng viên chuyên môn
                  </p>
                  <p className="text-lg font-bold text-cream mt-0.5">
                    {course.teacher.fullName}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Card */}
            <div className="lg:col-span-5 w-full">
              <div className="bg-deep-black rounded border border-border-dark shadow-2xl overflow-hidden transition-colors duration-200">
                <CoursePreviewThumbnail
                  thumbnailUrl={course.thumbnailUrl}
                  title={course.title}
                  previewVideoUrl={previewVideoUrl}
                  previewLessonTitle={previewLessonTitle}
                />

                <div className="p-8 space-y-6">
                  {/* Prices */}
                  <div className="flex items-baseline gap-3">
                    {course.salePrice ? (
                      <>
                        <span className="text-3xl font-extrabold text-cream">
                          {formatVND(course.salePrice)}
                        </span>
                        <span className="text-base text-muted-taupe line-through">
                          {formatVND(course.price)}
                        </span>
                        <span className="text-xs font-bold text-white bg-brand-pink px-2 py-0.5 rounded uppercase">
                          -{discountPercent}%
                        </span>
                      </>
                    ) : (
                      <span className="text-3xl font-extrabold text-cream">
                        {formatVND(course.price)}
                      </span>
                    )}
                  </div>

                  <EnrollButton course={course} />

                  <div className="space-y-4 pt-4 border-t border-border-dark">
                    <div className="flex items-center gap-3 text-muted-taupe text-sm">
                      <Clock size={18} className="text-sky-blue" />
                      <span>{course.totalLessons || 0} bài học chuyên sâu</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-taupe text-sm">
                      <BookOpen size={18} className="text-sky-blue" />
                      <span>Tài liệu & bài kiểm tra bám sát ôn luyện</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-taupe text-sm">
                      <ShieldCheck size={18} className="text-sky-blue" />
                      <span>Hỗ trợ hỏi đáp cùng đội ngũ giáo viên 24/7</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Layout Grid */}
        <section className="max-w-[1200px] mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-16">
              {/* Description */}
              <div>
                <h2 className="text-2xl font-bold text-cream mb-6">
                  Mô tả khóa học
                </h2>
                <div className="text-base text-muted-taupe leading-relaxed space-y-4 ">
                  <p>{course.description}</p>
                </div>
              </div>

              {/* Curriculum Outline */}
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-cream mb-2">
                      Nội dung chương trình
                    </h2>
                    <p className="text-sm text-muted-taupe">
                      {course.chapters.length} Chương •{" "}
                      {course.chapters.reduce(
                        (acc: number, c) => acc + c.lessons.length,
                        0,
                      )}{" "}
                      bài học
                    </p>
                  </div>
                </div>

                <CurriculumAccordion chapters={course.chapters} />
              </div>
            </div>

            {/* Right Column */}
            <aside className="lg:col-span-4 space-y-8">
              {/* Teacher bio card */}
              <div className="bg-deep-black border border-border-dark rounded p-8 text-center shadow-lg transition-colors duration-200">
                <SafeImg
                  alt={course.teacher.fullName}
                  className="w-24 h-24 rounded-full mx-auto mb-6 object-cover border-4 border-brand-dark"
                  src={course.teacher.avatarUrl}
                />
                <h3 className="text-lg font-bold text-cream">
                  {course.teacher.fullName}
                </h3>
                <p className="text-brand-pink text-sm font-semibold mt-1">
                  Giảng viên chuyên môn
                </p>

                <div className="flex justify-center gap-4 mt-6">
                  <div className="text-center px-4">
                    <p className="font-extrabold text-cream text-base">10+</p>
                    <p className="text-xs text-muted-taupe uppercase tracking-widest font-bold mt-1">
                      Năm kinh nghiệm
                    </p>
                  </div>
                  <div className="w-px h-10 bg-border-dark"></div>
                  <div className="text-center px-4">
                    <p className="font-extrabold text-cream text-base">
                      5000+
                    </p>
                    <p className="text-xs text-muted-taupe uppercase tracking-widest font-bold mt-1">
                      Học viên đạt điểm 9+
                    </p>
                  </div>
                </div>

                <p className="text-sm text-muted-taupe mt-6 leading-relaxed">
                  Đội ngũ giáo viên giàu kinh nghiệm luyện thi, tốt nghiệp sư
                  phạm đầu ngành luôn tận tâm sát cánh cùng học sinh vượt qua
                  mọi khó khăn.
                </p>
                <button className="mt-6 text-xs font-bold text-brand-pink border border-brand-pink hover:bg-brand-pink hover:text-white w-full py-2.5 rounded-lg transition-colors cursor-pointer">
                  Xem hồ sơ chi tiết
                </button>
              </div>

              {/* Related Courses Widget */}
              {relatedCourses.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-xs font-bold text-muted-taupe uppercase tracking-widest">
                    Khóa học liên quan
                  </h3>
                  <div className="space-y-4">
                    {relatedCourses.map((rel) => (
                      <Link
                        key={rel.id}
                        href={`/courses/${rel.slug}`}
                        className="flex gap-4 items-center p-3 rounded-lg hover:bg-deep-black border border-transparent hover:border-border-dark transition-all group"
                      >
                        <div className="w-20 h-15 rounded-lg overflow-hidden flex-shrink-0 bg-brand-dark/50">
                          <SafeImg
                            alt={rel.title}
                            className="w-full h-full object-cover transition-all duration-300"
                            src={rel.thumbnailUrl}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-cream line-clamp-2 leading-snug group-hover:text-brand-pink transition-colors">
                            {rel.title}
                          </h4>
                          <p className="text-brand-pink font-bold text-sm mt-1">
                            {formatVND(rel.price)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Sticky Info CTA */}
              <div className="bg-deep-black border border-border-dark p-6 rounded text-cream shadow-2xl space-y-4">
                <p className="text-xs font-bold text-accent-orange uppercase tracking-wider flex items-center gap-1.5">
                  <Phone size={12} /> Hotline đăng ký gấp
                </p>
                <h4 className="text-lg font-bold">
                  Sẵn sàng để bứt phá điểm số?
                </h4>
                <EnrollButton course={course} />
                <p className="text-xs text-center text-muted-taupe leading-relaxed">
                  Hotline tư vấn lộ trình: 1900 6789 (Hỗ trợ 24/7 miễn phí).
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </>
  );
}
