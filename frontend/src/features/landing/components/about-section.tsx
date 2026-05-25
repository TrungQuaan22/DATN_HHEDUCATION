'use client';

import { CheckCircle, School, Video, FileText, BarChart2, BookOpen } from 'lucide-react';

export default function AboutSection() {
  const pillars = [
    'Đội ngũ chuyên gia',
    'Bài giảng trực quan',
    'Luyện đề bám sát',
    'Hỗ trợ 24/7',
  ];

  const services = [
    {
      title: 'Khóa học Video',
      desc: 'Bài giảng 4K sắc nét, trình bày khoa học, dễ hiểu, xem lại mọi lúc.',
      icon: <Video size={24} className="text-brand-pink" />,
      iconBgClass: 'bg-brand-pink/10',
      hoverBorderClass: 'hover:border-brand-pink/50',
    },
    {
      title: 'Luyện đề & Kiểm tra',
      desc: 'Kho đề thi khổng lồ, lời giải chi tiết và chấm điểm tự động.',
      icon: <BookOpen size={24} className="text-accent-orange" />,
      iconBgClass: 'bg-accent-orange/10',
      hoverBorderClass: 'hover:border-accent-orange/50',
    },
    {
      title: 'Theo dõi tiến độ',
      desc: 'Báo cáo học tập hàng tuần giúp nắm rõ lỗ hổng kiến thức.',
      icon: <BarChart2 size={24} className="text-sky-blue" />,
      iconBgClass: 'bg-sky-blue/10',
      hoverBorderClass: 'hover:border-sky-blue/50',
    },
    {
      title: 'Tài liệu học tập',
      desc: 'Ebook độc quyền, sơ đồ tư duy biên soạn bởi đội ngũ chuyên gia.',
      icon: <FileText size={24} className="text-cream" />,
      iconBgClass: 'bg-cream/10',
      hoverBorderClass: 'hover:border-brand-pink/50',
    },
  ];

  return (
    <section className="py-24 bg-brand-dark border-t border-border-dark" id="about">
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
        <div className="space-y-6">
          <div className="inline-block px-3 py-1 bg-brand-pink/10 text-brand-pink rounded-sm text-[11px] font-semibold uppercase tracking-wider">
            Chúng tôi là ai
          </div>
          <h2 className="text-[36px] font-[700] text-cream leading-tight">
            Đồng hành cùng khát vọng vươn xa của thế hệ trẻ
          </h2>
          <p className="text-[16px] text-muted-taupe leading-relaxed">
            HH Education mang đến môi trường học tập kỷ luật và nhân văn. Chúng tôi tin rằng mỗi học sinh đều có tiềm năng vô hạn nếu được dẫn dắt bởi một lộ trình học tập được thiết kế tỉ mỉ.
          </p>

          <div className="grid grid-cols-2 gap-6 pt-2">
            {pillars.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckCircle size={18} className="text-accent-orange shrink-0" />
                <span className="text-[14px] text-cream">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-deep-black border border-border-dark rounded-xl p-12 relative overflow-hidden group shadow-l2">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--color-brand-pink)_0%,transparent_70%)] pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-brand-dark border border-border-dark rounded-lg flex items-center justify-center shadow-l1 transform group-hover:rotate-6 transition-transform duration-300">
              <School size={36} className="text-brand-pink" />
            </div>
            <h3 className="text-[20px] font-bold text-cream">Học thuật vững chắc</h3>
            <p className="text-[14px] text-muted-taupe leading-relaxed">
              Xây dựng nền tảng tư duy logic và sự say mê học tập bền vững cho tương lai.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-[36px] font-[700] text-cream mb-4">Chúng tôi cung cấp gì</h2>
          <p className="text-[16px] text-muted-taupe max-w-2xl mx-auto">
            Giải pháp học tập toàn diện tích hợp công nghệ giúp tối ưu hóa thời gian.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((serv, idx) => (
            <div
              key={idx}
              className={`bg-deep-black p-8 rounded-lg border border-border-dark transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group ${serv.hoverBorderClass}`}
            >
              <div className={`w-12 h-12 rounded-md flex items-center justify-center mb-6 ${serv.iconBgClass}`}>
                {serv.icon}
              </div>
              <h3 className="text-[18px] font-bold text-cream mb-3">{serv.title}</h3>
              <p className="text-[14px] text-muted-taupe leading-relaxed">{serv.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
