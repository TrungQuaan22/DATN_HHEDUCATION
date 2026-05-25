'use client';

import { useState } from 'react';

export default function TeachersSection() {
  const [activeTeacher, setActiveTeacher] = useState(0); // 0: Cô Hiền Hiền, 1: Thầy Minh Đức

  const teachers = [
    {
      name: 'Cô Hiền Hiền',
      badge: 'Giảng viên tiêu biểu',
      badgeColorClass: 'bg-brand-pink/10 text-brand-pink',
      quote: '"Giáo dục không phải là việc đổ đầy một chiếc bình, mà là việc thắp sáng một ngọn lửa."',
      avatarUrl: 'https://lh3.googleusercontent.com/aida/ADBb0uipGD9YTcedf9TvwqfWUdXUVv_JPcxYj981ljzVDnNxdRswLnWip7Fwo05-KOZIwm-mAAg5SA7aD_k0J8GUZdn5eZiaCYGzY_2NoRM_3nv_x7FZ3PmdbJ-pnvdVBunYiXrfacfkjga_QgO8E8uTmgKXvqw0HbyAPLHX2x9ecQAoAKnomXV4CoDildwIDGMx_YkcDMo6Spn8QJIVtmCBm67HL6aQBe8YpNGt9ZyQTdP3u9QWLJlJNw9aU0CIBW6R5POz6pIVFB7IgQ',
      timeline: [
        {
          stage: 'Hiện tại',
          stageColorClass: 'text-brand-pink',
          nodeColorClass: 'bg-brand-pink',
          title: 'Hành trình Học văn Chuyên Văn',
          desc: 'K22 Chuyên Văn – THPT Chuyên Vĩnh Phúc; K75 HNUE – ĐH Sư phạm Hà Nội.',
        },
        {
          stage: 'Thành tích Cấp 2',
          stageColorClass: 'text-sky-blue',
          nodeColorClass: 'bg-sky-blue',
          title: 'Giải Nhất Ngữ văn cấp tỉnh',
          desc: 'Giải Nhất Ngữ văn lớp 6, 7; Giải Nhất cấp tỉnh lớp 9.',
        },
        {
          stage: 'Thành tích Cấp 3',
          stageColorClass: 'text-brand-pink',
          nodeColorClass: 'bg-brand-pink',
          title: 'Giải Nhì HSG Quốc gia (2019-2020)',
          desc: 'Thủ khoa đầu vào Chuyên Văn; Huy chương Vàng Trại hè Hùng Vương; Điểm tốt nghiệp: 9,75.',
        },
      ],
    },
    {
      name: 'Thầy Minh Đức',
      badge: 'Thạc sĩ',
      badgeColorClass: 'bg-sky-blue/10 text-sky-blue',
      quote: '"Toán học là ngôn ngữ của vũ trụ, hãy cùng tôi khám phá những điều kỳ diệu."',
      avatarUrl: '', // Fallback SVG user icon
      timeline: [
        {
          stage: 'Kinh nghiệm',
          stageColorClass: 'text-sky-blue',
          nodeColorClass: 'bg-sky-blue',
          title: 'Giảng viên tại ĐH Bách Khoa',
          desc: 'Hơn 10 năm kinh nghiệm luyện thi đại học môn Toán khối A, A1.',
        },
        {
          stage: 'Tác phẩm',
          stageColorClass: 'text-brand-pink',
          nodeColorClass: 'bg-brand-pink',
          title: 'Tác giả sách "Toán học Tư duy"',
          desc: 'Bộ sách giúp học sinh mất gốc lấy lại căn bản trong 30 ngày.',
        },
      ],
    },
  ];

  return (
    <section className="py-24 bg-brand-dark" id="teachers">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="mb-12 flex justify-between items-end">
          <div>
            <h2 className="text-[36px] font-[700] text-cream mb-4">Đội ngũ Giảng viên</h2>
            <p className="text-[16px] text-muted-taupe">Những người thắp sáng ngọn lửa tri thức.</p>
          </div>
          <div className="flex gap-2 pb-2">
            {teachers.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTeacher(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${
                  activeTeacher === idx ? 'bg-brand-pink' : 'bg-muted-taupe/30'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="relative">
          {teachers.map((t, idx) => (
            <div
              key={idx}
              className={`transition-all duration-500 ${
                activeTeacher === idx ? 'opacity-100 block' : 'opacity-0 hidden pointer-events-none'
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start bg-deep-black/30 p-8 rounded-2xl border border-border-dark">
                <div className="lg:col-span-5 w-full">
                  <div className="relative border border-border-dark rounded-xl overflow-hidden shadow-l4 aspect-[4/5] bg-deep-black/60 flex items-center justify-center">
                    {t.avatarUrl ? (
                      <img
                        alt={t.name}
                        className="w-full h-full object-cover"
                        src={t.avatarUrl}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-taupe gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                        <span className="text-sm font-medium">No Image</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-8">
                  <div>
                    <div className={`inline-block px-3 py-1 rounded-sm text-[11px] font-semibold uppercase tracking-wider mb-2 ${t.badgeColorClass}`}>
                      {t.badge}
                    </div>
                    <h3 className="text-[40px] font-bold text-cream">{t.name}</h3>
                    <p className="text-[18px] italic text-muted-taupe leading-relaxed mt-2">{t.quote}</p>
                  </div>

                  <div className="relative w-full mt-8">
                    <div className="absolute left-[11px] lg:left-1/2 top-2 bottom-2 w-0.5 -translate-x-0 lg:-translate-x-1/2 bg-brand-pink/20"></div>
                    <div className="space-y-10 lg:space-y-6">
                      {t.timeline.map((item, tIdx) => {
                        const isEven = tIdx % 2 === 0;
                        return (
                          <div
                            key={tIdx}
                            className={`relative flex flex-col lg:flex-row items-start lg:items-center w-full ${
                              isEven ? 'lg:flex-row-reverse' : ''
                            }`}
                          >
                            <div className={`w-full lg:w-1/2 pl-10 lg:pl-0 ${
                              isEven ? 'lg:pr-8 lg:text-right' : 'lg:pl-8 lg:text-left'
                            }`}>
                              <span className={`text-[12px] font-bold uppercase tracking-wider ${item.stageColorClass}`}>
                                {item.stage}
                              </span>
                              <h4 className="text-[18px] font-bold text-cream mt-0.5">{item.title}</h4>
                              <p className="text-[14px] text-muted-taupe mt-1 leading-relaxed">{item.desc}</p>
                            </div>
                            <div className={`absolute left-0 lg:left-1/2 top-1.5 lg:top-1/2 w-6 h-6 rounded-full border-4 border-deep-black shadow-l1 z-10 -translate-x-0 lg:-translate-x-1/2 lg:-translate-y-1/2 ${item.nodeColorClass}`} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
