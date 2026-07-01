"use client";

import React from "react";
import { Copy, Trash2 } from "lucide-react";
import {
  BuilderItem,
  AssessmentType,
  ItemType,
  Difficulty,
  createBuilderItem,
  defaultMaxScoreByItemType,
} from "../types";
import { McqEditor } from "./mcq-editor";
import { TrueFalseEditor } from "./true-false-editor";
import { NumericEditor } from "./numeric-editor";
import { EssayEditor } from "./essay-editor";

interface QuestionEditorProps {
  item: BuilderItem | null;
  assessmentType: AssessmentType;
  topicOptions: Array<{ id: string; name: string }>;
  onUpdateItem: (id: string, updates: Partial<BuilderItem>) => void;
  onDeleteItem: (id: string) => void;
  onCloneItem: (item: BuilderItem) => void;
  heightClass?: string;
}

export function QuestionEditor({
  item,
  assessmentType,
  topicOptions,
  onUpdateItem,
  onDeleteItem,
  onCloneItem,
  heightClass = "h-[600px]",
}: QuestionEditorProps) {
  if (!item) {
    return (
      <div
        className={`bg-admin-surface-low border border-admin-border rounded-xl p-5 flex items-center justify-center text-admin-muted ${heightClass}`}
      >
        Vui lòng chọn hoặc thêm câu hỏi để biên soạn.
      </div>
    );
  }

  const handleFieldChange = (updates: Partial<BuilderItem>) => {
    onUpdateItem(item.id, updates);
  };

  return (
    <div
      className={`bg-admin-surface-low border border-admin-border rounded-xl p-5 space-y-4 ${heightClass} flex flex-col justify-between overflow-y-auto`}
    >
      <div className="space-y-4">
        {/* Top card header */}
        <div className="flex items-center justify-between border-b border-admin-border/50 pb-3">
          <h3 className="font-bold text-sm text-admin-cream">
            Biên soạn Câu {item.questionNumber}
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onCloneItem(item)}
              className="p-1.5 rounded bg-admin-bg hover:text-admin-pink text-admin-muted border border-admin-border/60 transition cursor-pointer"
              title="Nhân bản câu này"
            >
              <Copy size={13} />
            </button>
            <button
              type="button"
              onClick={() => onDeleteItem(item.id)}
              className="p-1.5 rounded bg-admin-bg hover:text-red-400 text-admin-muted border border-admin-border/60 transition cursor-pointer"
              title="Xóa câu này"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* General Configs row */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-admin-muted uppercase">
              Độ khó
            </label>
            <select
              value={item.difficulty}
              onChange={(e) =>
                handleFieldChange({
                  difficulty: e.target.value as Difficulty,
                })
              }
              className="w-full rounded-lg border border-admin-border bg-admin-bg px-2.5 py-1.5 text-xs text-admin-cream outline-none focus:border-admin-pink cursor-pointer"
            >
              <option value="recognition">Nhận biết</option>
              <option value="understanding">Thông hiểu</option>
              <option value="application">Vận dụng</option>
              <option value="advanced">Vận dụng cao</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-admin-muted uppercase">
              Điểm số
            </label>
            <input
              type="number"
              step={0.25}
              min={0.01}
              inputMode="decimal"
              value={item.maxScore}
              onChange={(e) =>
                handleFieldChange({
                  maxScore: Number(e.target.value),
                })
              }
              className="w-full rounded-lg border border-admin-border bg-admin-bg px-2.5 py-1.5 text-xs text-admin-cream outline-none focus:border-admin-pink"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-admin-muted uppercase">
              Dạng câu hỏi
            </label>
            <select
              value={item.itemType}
              disabled
              onChange={(e) => {
                const nextType = e.target.value as ItemType;
                const template = createBuilderItem(
                  nextType,
                  item.questionNumber,
                  defaultMaxScoreByItemType[nextType],
                  item.id,
                  assessmentType,
                );
                handleFieldChange({
                  ...template,
                  contentLabel:
                    assessmentType === "quiz" ? item.contentLabel : "",
                });
              }}
              className="w-full rounded-lg border border-admin-border bg-admin-bg px-2.5 py-1.5 text-xs text-admin-cream outline-none font-bold disabled:cursor-not-allowed disabled:opacity-70"
            >
              <option value="mcq">Trắc nghiệm</option>
              <option value="true_false">Đúng / Sai</option>
              <option value="numeric">Điền số</option>
              <option value="essay">Tự luận</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-admin-muted uppercase">
              Chuyên đề
            </label>
            <input
              type="text"
              list="assessment-builder-topic-options"
              value={item.topicName || ""}
              onChange={(e) =>
                handleFieldChange({
                  topicId: null,
                  topicName: e.target.value,
                })
              }
              placeholder="Ví dụ: Hàm số"
              className="w-full rounded-lg border border-admin-border bg-admin-bg px-2.5 py-1.5 text-xs text-admin-cream outline-none focus:border-admin-pink"
            />
          </div>
        </div>

        <datalist id="assessment-builder-topic-options">
          {topicOptions.map((topic) => (
            <option key={topic.id} value={topic.name} />
          ))}
        </datalist>

        {assessmentType === "quiz" ? (
          <div className="space-y-1">
            <label className="text-xs font-bold text-admin-muted uppercase">
              Nội dung câu hỏi (Markdown / Rich-text)
            </label>
            <textarea
              rows={4}
              value={item.contentLabel}
              onChange={(e) =>
                handleFieldChange({
                  contentLabel: e.target.value,
                })
              }
              placeholder="Nhập đề bài câu hỏi..."
              className="w-full rounded-lg border border-admin-border bg-admin-bg px-3 py-2.5 text-xs text-admin-cream outline-none focus:border-admin-pink"
            />
          </div>
        ) : (
          <div className="rounded-lg border border-admin-border/70 bg-admin-bg px-3 py-2.5 text-xs text-admin-muted">
            Nội dung câu {item.questionNumber} nằm trong PDF gốc. Builder chỉ
            lưu answer key và điểm số cho câu này.
          </div>
        )}

        {/* Answers config according to type */}
        <div className="space-y-2 pt-2 border-t border-admin-border/40">
          <span className="text-xs font-bold text-admin-muted block">
            Đáp án chính xác
          </span>

          {/* Sub Editors Dispatch */}
          {item.itemType === "mcq" && (
            <McqEditor
              item={item}
              assessmentType={assessmentType}
              onUpdateItem={handleFieldChange}
            />
          )}
          {item.itemType === "true_false" && (
            <TrueFalseEditor
              item={item}
              assessmentType={assessmentType}
              onUpdateItem={handleFieldChange}
            />
          )}
          {item.itemType === "numeric" && (
            <NumericEditor item={item} onUpdateItem={handleFieldChange} />
          )}
          {item.itemType === "essay" && (
            <EssayEditor item={item} onUpdateItem={handleFieldChange} />
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-admin-muted uppercase">
            Hướng dẫn và lời giải
          </label>
          <textarea
            rows={3}
            value={item.explanation || ""}
            onChange={(e) =>
              handleFieldChange({
                explanation: e.target.value,
              })
            }
            placeholder="Trình bày cách làm, lý do chọn đáp án hoặc các bước tính toán..."
            className="w-full rounded-lg border border-admin-border bg-admin-bg px-3 py-2.5 text-xs text-admin-cream outline-none focus:border-admin-pink"
          />
        </div>
      </div>

      <div className="text-xs text-admin-muted text-center italic mt-4 shrink-0">
        Đề thi tự lưu trên giao diện. Bấm nút &quot;Lưu &amp; Xuất bản&quot; ở
        trên đầu để lưu vĩnh viễn vào CSDL.
      </div>
    </div>
  );
}
