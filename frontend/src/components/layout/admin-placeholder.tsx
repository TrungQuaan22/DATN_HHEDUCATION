"use client";

import { Construction } from "lucide-react";

type AdminPlaceholderProps = {
  title: string;
};

export default function AdminPlaceholder({ title }: AdminPlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-admin-deep rounded border border-admin-border/20 text-admin-cream">
      <div className="w-16 h-16 bg-admin-pink/10 rounded-full flex items-center justify-center text-admin-pink mb-6 animate-pulse">
        <Construction size={32} />
      </div>
      <h2 className="text-2xl font-bold text-admin-cream mb-2 font-serif">
        {title}
      </h2>
      <p className="text-admin-muted text-sm max-w-sm leading-relaxed">
        Tính năng này đang được phát triển theo lộ trình của HH Education. Vui
        lòng quay lại sau!
      </p>
    </div>
  );
}

