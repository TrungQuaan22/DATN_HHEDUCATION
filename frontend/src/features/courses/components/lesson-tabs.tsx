"use client";

import React from "react";
import { FileText, Download, Eye, BookOpen } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { LearningCourseMaterial } from "../types";

interface LessonTabsProps {
  activeTab: "description" | "materials";
  setActiveTab: (tab: "description" | "materials") => void;
  description?: string | null;
  materials?: LearningCourseMaterial[];
}

export function LessonTabs({
  activeTab,
  setActiveTab,
  description,
  materials = [],
}: LessonTabsProps) {
  const formatBytes = (bytes: number | null | undefined) => {
    if (bytes === null || bytes === undefined) return "";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getFileBadgeColor = (t: string) => {
    switch (t) {
      case "pdf":
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "docx":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "pptx":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default:
        return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
    }
  };

  return (
    <div className="border border-border-dark bg-deep-black/30 rounded-lg overflow-hidden flex flex-col">
      <div className="flex border-b border-border-dark bg-off-black">
        <button
          onClick={() => setActiveTab("description")}
          className={`px-5 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer uppercase tracking-wider ${
            activeTab === "description"
              ? "text-brand-pink border-brand-pink bg-deep-black/40"
              : "text-muted-text hover:text-cream border-transparent"
          }`}
        >
          Mô tả bài học
        </button>
        <button
          onClick={() => setActiveTab("materials")}
          className={`px-5 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer uppercase tracking-wider ${
            activeTab === "materials"
              ? "text-brand-pink border-brand-pink bg-deep-black/40"
              : "text-muted-text hover:text-cream border-transparent"
          }`}
        >
          Tài liệu học tập ({materials.length})
        </button>
      </div>

      <div className="p-5 min-h-[120px]">
        {activeTab === "description" ? (
          <div className="text-sm text-cream leading-relaxed whitespace-pre-wrap">
            {description || "Bài học chưa có mô tả chi tiết."}
          </div>
        ) : materials.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-8 h-8 text-muted-text/40 mb-2" />}
            title="Không có tài liệu"
            description="Bài học này chưa có tài liệu học tập công khai."
            className="border-none bg-transparent min-h-0 py-2 max-w-sm mx-auto"
          />
        ) : (
          <div className="space-y-4">
            {materials.map((material) => (
              <div
                key={material.id}
                className="bg-deep-black/45 border border-border-dark/60 rounded-lg p-4 flex flex-col space-y-3"
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-brand-pink/10 text-brand-pink flex items-center justify-center flex-shrink-0">
                      <FileText size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-cream">
                          {material.title}
                        </h4>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${getFileBadgeColor(
                            material.type,
                          )}`}
                        >
                          {material.type}
                        </span>
                      </div>

                      {/* Display original filename / size if file */}
                      {["pdf", "docx", "pptx"].includes(material.type) && (
                        <p className="text-xs text-muted-text mt-0.5">
                          Tên tệp:{" "}
                          {material.media?.originalName || "document.file"}
                          {material.media?.sizeBytes && (
                            <span className="ml-1 font-semibold text-muted-text/75">
                              ({formatBytes(material.media.sizeBytes)})
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions for File materials */}
                  {["pdf", "docx", "pptx"].includes(material.type) &&
                    material.downloadUrl && (
                      <a
                        href={material.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-brand-pink text-brand-dark px-3 py-1.5 rounded font-bold text-xs hover:brightness-105 active:scale-95 transition-all cursor-pointer"
                      >
                        <Download size={13} />
                        Tải xuống
                      </a>
                    )}
                </div>

                {/* Direct content reader for Text / Markdown materials */}
                {["text", "markdown"].includes(material.type) &&
                  material.contentText && (
                    <div className="p-4 bg-deep-black/60 border border-border-dark/65 rounded text-cream text-xs leading-relaxed whitespace-pre-wrap font-sans overflow-y-auto max-h-[300px] custom-scrollbar">
                      {material.contentText}
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

