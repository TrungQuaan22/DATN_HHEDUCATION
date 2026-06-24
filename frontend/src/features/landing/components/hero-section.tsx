"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function HeroSection() {
  const rotateTerms = [
    {
      prefix: "Luyện thi học sinh giỏi, khơi dậy ",
      highlight: "tài năng văn học lớp 9",
    },
    {
      prefix: "Học vững kiến thức, bứt phá ",
      highlight: "điểm số 9+ Thủ khoa toàn quốc",
    },
    {
      prefix: "Khám phá vẻ đẹp ngôn từ cùng ",
      highlight: "Cô Hiền Hiền xinh đẹp đáng yêu",
    },
  ];

  const [termIdx, setTermIdx] = useState(0);
  const [typingText, setTypingText] = useState("");

  // Typewriter effect (types character by character, clears instantly after hold)
  useEffect(() => {
    const current = rotateTerms[termIdx];
    const fullText = current.prefix + current.highlight;

    // If fully typed, set a timeout to clear and switch to next
    if (typingText === fullText) {
      const holdTimeout = setTimeout(() => {
        setTypingText("");
        setTermIdx((prev) => (prev + 1) % rotateTerms.length);
      }, 2000); // hold time: 2 seconds

      return () => clearTimeout(holdTimeout);
    }

    // Otherwise, type character by character
    const typeTimeout = setTimeout(() => {
      setTypingText(fullText.substring(0, typingText.length + 1));
    }, 80); // typing speed: 80ms per character

    return () => clearTimeout(typeTimeout);
  }, [typingText, termIdx]);

  const current = rotateTerms[termIdx];
  const typedPrefix = typingText.substring(0, current.prefix.length);
  const typedHighlight = typingText.substring(current.prefix.length);

  return (
    <section className="relative overflow-hidden pt-20 min-h-[90vh] flex items-center bg-brand-dark">
      {/* Content wrapper */}
      <div className="relative z-20 max-w-[1200px] mx-auto px-6 py-16 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-8 space-y-6 text-left">
          <div className="inline-block px-3 py-1 bg-brand-pink/10 text-brand-pink rounded-sm text-xs font-bold uppercase tracking-wider border border-brand-pink/20">
            Nền tảng học văn nghệ thuật & truyền cảm hứng
          </div>

          <h1 className="text-5xl md:text-5xl font-[800] leading-[1.15] text-cream min-h-[6.2em] sm:min-h-[4.8em] md:min-h-[3.6em]">
            <span className="text-cream">{typedPrefix}</span>
            <span className="text-brand-pink typing-cursor font-[800]">
              {typedHighlight}
            </span>
          </h1>

          <p className="text-base md:text-lg font-normal text-muted-taupe max-w-xl leading-[1.6]">
            Hệ thống bài giảng video chất lượng cao, lộ trình ôn thi cá nhân hóa
            cùng không gian học tập mang đầy tính nghệ thuật và văn học sâu sắc.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/register"
              className="bg-brand-pink text-white px-8 py-4 rounded-lg text-sm font-semibold shadow-l4 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              Bắt đầu học ngay
            </Link>
            <Link
              href="/courses"
              className="bg-surface-input/50 backdrop-blur-sm border border-border-dark text-cream px-8 py-4 rounded-lg text-sm font-semibold hover:border-brand-pink/40 transition-all cursor-pointer"
            >
              Xem bản demo
            </Link>
          </div>
        </div>

        {/* Path details card on the right */}
        <div className="hidden lg:block lg:col-span-4">
          <div className="relative p-8 rounded border border-border-dark bg-deep-black/60 backdrop-blur-md space-y-6">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-pink/5 rounded-full filter blur-xl pointer-events-none" />

            <h3 className="text-lg font-bold text-cream border-b border-border-dark pb-3">
              Lộ trình học Ngữ Văn
            </h3>

            <div className="space-y-4">
              <div className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-brand-pink/15 text-brand-pink text-xs font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <h4 className="text-sm font-bold text-cream">
                    Cảm thụ văn học
                  </h4>
                  <p className="text-xs text-muted-taupe">
                    Hiểu sâu tác phẩm qua lăng kính cảm xúc nghệ thuật.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-accent-orange/15 text-accent-orange text-xs font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <h4 className="text-sm font-bold text-cream">
                    Phương pháp làm bài
                  </h4>
                  <p className="text-xs text-muted-taupe">
                    Nắm chắc tư duy viết văn nghị luận xã hội và nghị luận văn
                    học.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-sky-blue/15 text-sky-blue text-xs font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <h4 className="text-sm font-bold text-cream">
                    Luyện đề bám sát
                  </h4>
                  <p className="text-xs text-muted-taupe">
                    Rèn luyện phản xạ phòng thi và kỹ năng phân bố thời gian
                    hiệu quả.
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
