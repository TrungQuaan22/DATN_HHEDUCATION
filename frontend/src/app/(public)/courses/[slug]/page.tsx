import { getCourseDetail } from "@/data/mock-data";
import { SUBJECT_LABELS } from "@/types/common";
import { formatVND } from "@/lib/utils/format-money";
import CurriculumAccordion from "@/features/courses/components/curriculum-accordion";
import Link from "next/link";
import {
  PlayCircle,
  Clock,
  BookOpen,
  ShieldCheck,
  GraduationCap,
  Phone,
} from "lucide-react";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const course = getCourseDetail(slug);
  if (!course) {
    return {
      title: "Khóa học không tìm thấy | HH Education",
    };
  }

  return {
    title: `${course.title} | HH Education`,
    description:
      course.description ||
      "Chi tiết khóa học chất lượng cao tại HH Education.",
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const course = getCourseDetail(slug);

  if (!course) {
    notFound();
  }

  // Calculate discount percentage
  const discountPercent =
    course.salePrice && course.price
      ? Math.round(((course.price - course.salePrice) / course.price) * 100)
      : 0;

  const relatedCourses = course.relatedCourses;

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
              <div className="inline-flex items-center gap-2 bg-brand-pink/10 text-brand-pink px-4 py-1.5 rounded-full border border-brand-pink/20 text-[11px] font-bold tracking-wider uppercase">
                <GraduationCap size={14} />
                <span>
                  {SUBJECT_LABELS[course.subject]} • Lớp {course.grade}
                </span>
              </div>

              <h1 className="text-[36px] md:text-[54px] font-extrabold text-cream leading-tight tracking-tight">
                {course.title}
              </h1>

              <p className="text-[16px] md:text-[18px] text-muted-taupe leading-relaxed">
                {course.description ||
                  "Chương trình ôn luyện toàn diện được thiết kế giúp học sinh ôn thi đạt kết quả tốt nhất."}
              </p>

              <div className="flex items-center gap-4 py-4">
                <img
                  alt={course.teacher.fullName}
                  className="w-14 h-14 rounded-full border-2 border-brand-pink object-cover"
                  src={
                    course.teacher.avatarUrl ||
                    "https://lh3.googleusercontent.com/aida/ADBb0uiIek7P62jjJQjU84PIV6GsfsuyN4KmS9fL8kB6kpryaM4TkPT2F2LhGKwuC3hvfNQf_zY87X2K48fs4HvQljJNxRMwZ0xpYwr6hQldNlJiBXSZp2yCTCYv_id9QoLVARzshzEmPSCMWPAx8CKPpdvEPKzvbSJ8ma_FqeGFH5P-fWBGMyad5cxcucjCmlBAFqfbFcgGPrdQvqFI1VOucL5mtyjpHhjgUZVyiTybciyZyXUfQcNa1aVypgY"
                  }
                />
                <div>
                  <p className="text-[10px] font-bold text-muted-taupe uppercase tracking-widest">
                    Giảng viên chuyên môn
                  </p>
                  <p className="text-[18px] font-bold text-cream mt-0.5">
                    {course.teacher.fullName}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Card */}
            <div className="lg:col-span-5 w-full">
              <div className="bg-deep-black rounded-2xl border border-border-dark shadow-2xl overflow-hidden transition-colors duration-200">
                <div className="relative group aspect-video overflow-hidden">
                  <img
                    alt={course.title}
                    className="w-full h-full object-cover transition-all duration-300"
                    src={
                      course.thumbnailUrl ||
                      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="100%" height="100%" fill="%231D0C14"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23AF9DA6" font-family="sans-serif">Preview Image</text></svg>'
                    }
                  />
                  <div className="absolute inset-0 bg-deep-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <PlayCircle size={60} className="text-brand-pink" />
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  {/* Prices */}
                  <div className="flex items-baseline gap-3">
                    {course.salePrice ? (
                      <>
                        <span className="text-[32px] font-extrabold text-cream">
                          {formatVND(course.salePrice)}
                        </span>
                        <span className="text-[16px] text-muted-taupe line-through">
                          {formatVND(course.price)}
                        </span>
                        <span className="text-[11px] font-bold text-white bg-brand-pink px-2 py-0.5 rounded uppercase">
                          -{discountPercent}%
                        </span>
                      </>
                    ) : (
                      <span className="text-[32px] font-extrabold text-cream">
                        {formatVND(course.price)}
                      </span>
                    )}
                  </div>

                  <button className="w-full bg-brand-pink text-white font-bold text-[14px] py-4 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg cursor-pointer">
                    ĐĂNG KÝ NGAY
                  </button>

                  <div className="space-y-4 pt-4 border-t border-border-dark">
                    <div className="flex items-center gap-3 text-muted-taupe text-[13px]">
                      <Clock size={18} className="text-sky-blue" />
                      <span>{course.lessonsCount || 0} bài học chuyên sâu</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-taupe text-[13px]">
                      <BookOpen size={18} className="text-sky-blue" />
                      <span>Tài liệu & bài kiểm tra bám sát ôn luyện</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-taupe text-[13px]">
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
                <h2 className="text-[24px] font-bold text-cream mb-6">
                  Mô tả khóa học
                </h2>
                <div className="text-[15px] text-muted-taupe leading-relaxed space-y-4">
                  <p>
                    Chào mừng bạn đến với khóa học chuyên sâu được thiết kế
                    riêng dành cho học sinh chuẩn bị bứt phá điểm số và ôn luyện
                    xét tuyển đại học. Đây không chỉ là việc ghi nhớ công thức
                    đơn thuần mà là một hành trình rèn luyện kỹ năng giải bài và
                    khai phá tư duy bản chất.
                  </p>
                  <p>
                    Hệ thống bài giảng được phân loại khoa học từ cơ bản đến
                    nâng cao, đi kèm bài tập tự luyện và chấm thi tự động giúp
                    bạn liên tục củng cố kiến thức và phát hiện lỗ hổng kịp
                    thời.
                  </p>
                </div>
              </div>

              {/* Curriculum Outline */}
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
                  <div>
                    <h2 className="text-[24px] font-bold text-cream mb-2">
                      Nội dung chương trình
                    </h2>
                    <p className="text-[13px] text-muted-taupe">
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
              <div className="bg-deep-black border border-border-dark rounded-xl p-8 text-center shadow-lg transition-colors duration-200">
                <img
                  alt={course.teacher.fullName}
                  className="w-24 h-24 rounded-full mx-auto mb-6 object-cover border-4 border-brand-dark"
                  src={
                    course.teacher.avatarUrl ||
                    "https://lh3.googleusercontent.com/aida/ADBb0uiIek7P62jjJQjU84PIV6GsfsuyN4KmS9fL8kB6kpryaM4TkPT2F2LhGKwuC3hvfNQf_zY87X2K48fs4HvQljJNxRMwZ0xpYwr6hQldNlJiBXSZp2yCTCYv_id9QoLVARzshzEmPSCMWPAx8CKPpdvEPKzvbSJ8ma_FqeGFH5P-fWBGMyad5cxcucjCmlBAFqfbFcgGPrdQvqFI1VOucL5mtyjpHhjgUZVyiTybciyZyXUfQcNa1aVypgY"
                  }
                />
                <h3 className="text-[18px] font-bold text-cream">
                  {course.teacher.fullName}
                </h3>
                <p className="text-brand-pink text-[13px] font-semibold mt-1">
                  Giảng viên chuyên môn
                </p>

                <div className="flex justify-center gap-4 mt-6">
                  <div className="text-center px-4">
                    <p className="font-extrabold text-cream text-[16px]">10+</p>
                    <p className="text-[9px] text-muted-taupe uppercase tracking-widest font-bold mt-1">
                      Năm kinh nghiệm
                    </p>
                  </div>
                  <div className="w-px h-10 bg-border-dark"></div>
                  <div className="text-center px-4">
                    <p className="font-extrabold text-cream text-[16px]">
                      5000+
                    </p>
                    <p className="text-[9px] text-muted-taupe uppercase tracking-widest font-bold mt-1">
                      Học viên đạt điểm 9+
                    </p>
                  </div>
                </div>

                <p className="text-[13px] text-muted-taupe mt-6 leading-relaxed">
                  Đội ngũ giáo viên giàu kinh nghiệm luyện thi, tốt nghiệp sư
                  phạm đầu ngành luôn tận tâm sát cánh cùng học sinh vượt qua
                  mọi khó khăn.
                </p>
                <button className="mt-6 text-[12px] font-bold text-brand-pink border border-brand-pink hover:bg-brand-pink hover:text-white w-full py-2.5 rounded-lg transition-colors cursor-pointer">
                  Xem hồ sơ chi tiết
                </button>
              </div>

              {/* Related Courses Widget */}
              {relatedCourses.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-[12px] font-bold text-muted-taupe uppercase tracking-widest">
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
                          <img
                            alt={rel.title}
                            className="w-full h-full object-cover transition-all duration-300"
                            src={rel.thumbnailUrl || ""}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-[13px] font-bold text-cream line-clamp-2 leading-snug group-hover:text-brand-pink transition-colors">
                            {rel.title}
                          </h4>
                          <p className="text-brand-pink font-bold text-[13px] mt-1">
                            {formatVND(rel.price)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Sticky Info CTA */}
              <div className="bg-deep-black border border-border-dark p-6 rounded-xl text-cream shadow-2xl space-y-4">
                <p className="text-[11px] font-bold text-accent-orange uppercase tracking-wider flex items-center gap-1.5">
                  <Phone size={12} /> Hotline đăng ký gấp
                </p>
                <h4 className="text-[18px] font-bold">
                  Sẵn sàng để bứt phá điểm số?
                </h4>
                <button className="w-full bg-brand-pink text-white py-3.5 rounded-lg font-bold text-[13px] hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer">
                  Đăng ký ghi danh ngay
                </button>
                <p className="text-[10px] text-center text-muted-taupe leading-relaxed">
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
