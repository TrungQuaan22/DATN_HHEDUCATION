"use client";

import React from "react";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface LessonTabsProps {
  activeTab: "description" | "materials";
  setActiveTab: (tab: "description" | "materials") => void;
  description?: string | null;
}

export function LessonTabs({
  activeTab,
  setActiveTab,
  description,
}: LessonTabsProps) {
  return (
    <div className="border border-border-dark bg-deep-black/30 rounded-lg overflow-hidden flex flex-col">
      <div className="flex border-b border-border-dark bg-off-black">
        <button
          onClick={() => setActiveTab("description")}
          className={`px-5 py-3 text-[12px] font-extrabold border-b-2 transition-all cursor-pointer ${
            activeTab === "description"
              ? "text-brand-pink border-brand-pink bg-deep-black/40"
              : "text-muted-text hover:text-cream border-transparent"
          }`}
        >
          Mô tả bài học
        </button>
        <button
          onClick={() => setActiveTab("materials")}
          className={`px-5 py-3 text-[12px] font-extrabold border-b-2 transition-all cursor-pointer ${
            activeTab === "materials"
              ? "text-brand-pink border-brand-pink bg-deep-black/40"
              : "text-muted-text hover:text-cream border-transparent"
          }`}
        >
          Tài liệu bài học (0)
        </button>
      </div>

      <div className="p-5 min-h-[120px]">
        {activeTab === "description" ? (
          <div className="text-[13px] text-cream leading-relaxed whitespace-pre-wrap">
            {description || "Bài học chưa có mô tả chi tiết."}
          </div>
        ) : (
          <EmptyState
            icon={<FileText className="w-8 h-8 text-muted-text/40 mb-2" />}
            title="Chưa có tài liệu"
            description="Nội dung tài liệu bài học sẽ được cập nhật ở Phase 2!"
            className="border-none bg-transparent min-h-0 py-2 max-w-sm mx-auto"
          />
        )}
      </div>
    </div>
  );
}
