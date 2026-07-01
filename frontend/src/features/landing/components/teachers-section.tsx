"use client";

import React, { useState } from "react";
import TeacherStickyShowcase from "./teacher-showcase";

interface TimelineItem {
  stage: string;
  stageColorClass: string;
  nodeColorClass: string;
  title: string;
  desc: string;
}

interface Teacher {
  name: string;
  badge: string;
  badgeColorClass: string;
  quote: string;
  avatarUrl: string;
  timeline: TimelineItem[];
}

const teachers: Teacher[] = [
  {
    name: "Cô Hiền Hiền",
    badge: "Giảng viên tiêu biểu",
    badgeColorClass: "bg-brand-pink/10 text-brand-pink border-brand-pink/20",
    quote:
      '"Giáo dục không phải là việc đổ đầy một chiếc bình, mà là việc thắp sáng một ngọn lửa."',
    avatarUrl:
      "https://scontent.fhan18-1.fna.fbcdn.net/v/t39.30808-6/626027687_934967042325550_3654724351854008020_n.jpg?stp=dst-jpg_tt6&cstp=mx1152x1152&ctp=s1152x1152&_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=KKlPZDJzrcAQ7kNvwEaFtMo&_nc_oc=AdrZyCsRUmGxkOAwPREoKkMBMFsi4Lec4DuWzwB-lHp09ujWjdUCaCiUcTNfh92TsXc&_nc_zt=23&_nc_ht=scontent.fhan18-1.fna&_nc_gid=fg_QCfrw8dtEQgu7yN6cvQ&_nc_ss=7b2a8&oh=00_AQBUjqKEMAiYAjEgnoF60CgXVZfX66_lODUq67QK2dsR7Q&oe=6A4965B2",
    timeline: [
      {
        stage: "Hiện tại",
        stageColorClass: "text-brand-pink",
        nodeColorClass: "bg-brand-pink",
        title: "Hành trình Học văn Chuyên Văn",
        desc: "K22 Chuyên Văn – THPT Chuyên Vĩnh Phúc; K75 HNUE – ĐH Sư phạm Hà Nội.",
      },
      {
        stage: "Thành tích Cấp 2",
        stageColorClass: "text-sky-blue",
        nodeColorClass: "bg-sky-blue",
        title: "Giải Nhất Ngữ văn cấp tỉnh",
        desc: "Giải Nhất Ngữ văn lớp 6, 7; Giải Nhất cấp tỉnh lớp 9.",
      },
      {
        stage: "Thành tích Cấp 3",
        stageColorClass: "text-brand-pink",
        nodeColorClass: "bg-brand-pink",
        title: "Giải Nhì HSG Quốc gia (2019-2020)",
        desc: "Thủ khoa đầu vào Chuyên Văn; Huy chương Vàng Trại hè Hùng Vương; Điểm tốt nghiệp: 9,75.",
      },
    ],
  },
  {
    name: "Thầy Minh Đức",
    badge: "Thạc sĩ",
    badgeColorClass: "bg-sky-blue/10 text-sky-blue border-sky-blue/20",
    quote:
      '"Toán học là ngôn ngữ của vũ trụ, hãy cùng tôi khám phá những điều kỳ diệu."',
    avatarUrl: "", // Fallback SVG
    timeline: [
      {
        stage: "Kinh nghiệm",
        stageColorClass: "text-sky-blue",
        nodeColorClass: "bg-sky-blue",
        title: "GV Toán khối A, A1",
        desc: "Hơn 10 năm kinh nghiệm luyện thi đại học môn Toán khối A, A1.",
      },
      {
        stage: "Tác phẩm",
        stageColorClass: "text-brand-pink",
        nodeColorClass: "bg-brand-pink",
        title: 'Tác giả sách "Toán học Tư duy"',
        desc: "Bộ sách giúp học sinh mất gốc lấy lại căn bản trong 30 ngày.",
      },
    ],
  },
];

export default function TeachersSection() {
  const [activeTeacherIdx, setActiveTeacherIdx] = useState(0);

  return (
    <section className="py-24 bg-brand-dark" id="teachers">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h2 className="text-4xl font-[700] text-cream mb-4 tracking-tight">
            Đội ngũ Giảng viên
          </h2>
          <p className="text-base text-muted-taupe leading-relaxed mb-8">
            Những người thắp sáng ngọn lửa tri thức và chắp cánh ước mơ cho hàng
            nghìn học sinh.
          </p>

          {/* Teacher selector tabs */}
          <div className="inline-flex p-1 bg-deep-black/60 border border-border-dark/80 rounded-full gap-1 shadow-2xl">
            {teachers.map((t, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTeacherIdx(idx)}
                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 cursor-pointer ${
                  activeTeacherIdx === idx
                    ? "bg-brand-pink text-brand-dark shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                    : "text-muted-taupe hover:text-cream"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <TeacherStickyShowcase
            key={activeTeacherIdx}
            teacher={teachers[activeTeacherIdx]}
          />
        </div>
      </div>
    </section>
  );
}
