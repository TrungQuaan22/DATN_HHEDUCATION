"use client";

import React from "react";
import { BookOpen, Send } from "lucide-react";

export default function BlogNewsletterBox() {
  return (
    <div className="bg-brand-pink/5 border border-brand-pink/20 p-6 rounded space-y-4 transition-colors duration-200">
      <p className="text-[14px] font-bold text-brand-pink flex items-center gap-1.5">
        <BookOpen size={16} /> Nhận bí quyết ôn thi
      </p>
      <p className="text-[13px] text-muted-taupe leading-relaxed">
        Gửi email của bạn để nhận sơ đồ tư duy văn học và tài liệu toán học miễn
        phí hàng tuần.
      </p>
      <div className="flex flex-col gap-2">
        <input
          className="bg-deep-black border border-border-dark rounded-lg text-[13px] focus:ring-1 focus:ring-brand-pink text-cream px-3 py-2.5 outline-none transition-all"
          placeholder="Email của bạn..."
          type="email"
        />
        <button className="bg-brand-pink text-white py-2.5 rounded-lg font-bold text-[13px] hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer">
          Đăng ký ngay <Send size={14} />
        </button>
      </div>
    </div>
  );
}
