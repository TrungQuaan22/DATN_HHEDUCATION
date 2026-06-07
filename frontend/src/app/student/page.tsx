"use client";

import React from "react";
import { Construction } from "lucide-react";

export default function StudentOverviewPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-deep-black rounded border border-border-dark text-cream space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="w-16 h-16 bg-brand-pink/10 rounded-full flex items-center justify-center text-brand-pink animate-pulse">
        <Construction size={32} />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-cream">
          Tổng quan học tập
        </h2>
        <p className="text-muted-text text-sm max-w-sm leading-relaxed mt-2 mx-auto">
          Trang tổng quan kết quả học tập đang được cập nhật dữ liệu. Vui lòng quay lại sau!
        </p>
      </div>
    </div>
  );
}
