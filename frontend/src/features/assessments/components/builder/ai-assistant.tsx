"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface AiAssistantProps {
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  onAiGeneration: () => void;
  isGeneratingAi: boolean;
}

export function AiAssistant({
  aiPrompt,
  setAiPrompt,
  onAiGeneration,
  isGeneratingAi,
}: AiAssistantProps) {
  return (
    <div className="rounded-xl border border-admin-border bg-admin-surface-low p-4 space-y-3 h-fit">
      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 border-b border-admin-border/60 pb-2 flex items-center gap-1.5">
        <Sparkles size={13} className="animate-pulse" />
        AI Assistant Soạn đề
      </h3>
      <p className="text-xs text-admin-muted leading-relaxed">
        Nhập mô tả đề thi (ví dụ: &quot;Tạo 3 câu trắc nghiệm Toán lớp 12 khảo sát hàm số&quot;), AI sẽ sinh
        câu hỏi tương thích lắp trực tiếp vào bảng bên trái.
      </p>
      <textarea
        rows={3}
        value={aiPrompt}
        onChange={(e) => setAiPrompt(e.target.value)}
        placeholder="Nhập yêu cầu đề thi cho AI..."
        className="w-full rounded-lg border border-admin-border bg-admin-bg px-3 py-2 text-xs text-admin-cream outline-none focus:border-admin-pink"
      />
      <button
        type="button"
        onClick={onAiGeneration}
        disabled={isGeneratingAi}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-500 text-admin-bg py-2 text-xs font-bold hover:brightness-110 active:scale-95 transition disabled:opacity-50 cursor-pointer"
      >
        <Sparkles size={12} />
        Tạo câu hỏi bằng AI
      </button>
    </div>
  );
}
