import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-brand-dark pt-20">
      <div className="relative z-20 mx-auto grid w-full max-w-[1200px] grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-12">
        <div className="space-y-6 text-left lg:col-span-8">
          <div className="inline-block rounded-sm border border-brand-pink/20 bg-brand-pink/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-pink">
            Luyện thi lớp 9-12
          </div>

          <h1 className="max-w-4xl text-balance text-5xl font-[800] leading-[1.12] text-cream md:text-6xl">
            HH Education - nền tảng luyện thi cho học sinh{" "}
            <span className="text-brand-pink">9, 10, 11, 12</span>
          </h1>

          <p className="max-w-xl text-base font-normal leading-[1.6] text-muted-taupe md:text-lg">
            Học theo khóa học có cấu trúc, xem video bài giảng, luyện đề,
            làm assessment và hỏi AI Tutor dựa trên học liệu nội bộ.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/courses"
              className="cursor-pointer rounded-lg bg-brand-pink px-8 py-4 text-sm font-semibold text-white shadow-l4 transition-all hover:opacity-90 active:scale-95"
            >
              Khám phá khóa học
            </Link>
            <Link
              href="/practice"
              className="cursor-pointer rounded-lg border border-border-dark bg-surface-input/50 px-8 py-4 text-sm font-semibold text-cream backdrop-blur-sm transition-all hover:border-brand-pink/40"
            >
              Luyện đề miễn phí
            </Link>
          </div>
        </div>

        <div className="hidden lg:col-span-4 lg:block">
          <div className="relative space-y-6 rounded border border-border-dark bg-deep-black/60 p-8 backdrop-blur-md">
            <h3 className="border-b border-border-dark pb-3 text-lg font-bold text-cream">
              Lộ trình ôn luyện
            </h3>

            <div className="space-y-4">
              <div className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-pink/15 text-xs font-bold text-brand-pink">
                  1
                </span>
                <div>
                  <h4 className="text-sm font-bold text-cream">
                    Chọn khóa theo lớp và mục tiêu
                  </h4>
                  <p className="text-xs text-muted-taupe">
                    Phù hợp cho học sinh lớp 9, 10, 11, 12 và các kỳ thi quan trọng.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-orange/15 text-xs font-bold text-accent-orange">
                  2
                </span>
                <div>
                  <h4 className="text-sm font-bold text-cream">
                    Học qua video và học liệu
                  </h4>
                  <p className="text-xs text-muted-taupe">
                    Bài giảng được tổ chức theo chương, bài học và tài liệu đi kèm.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-blue/15 text-xs font-bold text-sky-blue">
                  3
                </span>
                <div>
                  <h4 className="text-sm font-bold text-cream">
                    Luyện đề và theo dõi tiến độ
                  </h4>
                  <p className="text-xs text-muted-taupe">
                    Làm assessment, xem kết quả và tiếp tục học theo tiến độ thực tế.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
