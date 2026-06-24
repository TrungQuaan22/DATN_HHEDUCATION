"use client";

import React from "react";
import { Plus } from "lucide-react";
import { BuilderItem, ItemType, defaultMaxScoreByItemType, itemTypeLabels } from "./types";

interface QuestionSidebarProps {
  items: BuilderItem[];
  selectedItemId: string;
  onSelectItemId: (id: string) => void;
  bulkItemType: ItemType;
  setBulkItemType: (type: ItemType) => void;
  bulkCount: number;
  setBulkCount: (count: number) => void;
  bulkMaxScore: number;
  setBulkMaxScore: (score: number) => void;
  bulkTopicName: string;
  setBulkTopicName: (name: string) => void;
  onBulkAddItems: () => void;
  onAddItem: (type: ItemType) => void;
  topicOptions: Array<{ id: string; name: string }>;
  heightClass?: string;
}

export function QuestionSidebar({
  items,
  selectedItemId,
  onSelectItemId,
  bulkItemType,
  setBulkItemType,
  bulkCount,
  setBulkCount,
  bulkMaxScore,
  setBulkMaxScore,
  bulkTopicName,
  setBulkTopicName,
  onBulkAddItems,
  onAddItem,
  topicOptions,
  heightClass = "h-[600px]",
}: QuestionSidebarProps) {
  return (
    <div
      className={`bg-admin-surface-low border border-admin-border rounded-xl p-3 ${heightClass} flex flex-col`}
    >
      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
        <div className="text-xs font-bold text-admin-muted uppercase tracking-wider mb-2">
          Mục lục câu hỏi
        </div>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectItemId(item.id)}
            className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-bold text-left transition cursor-pointer ${
              selectedItemId === item.id
                ? "bg-admin-pink text-admin-bg"
                : "bg-admin-bg hover:bg-admin-border/20 text-admin-cream border border-admin-border/40"
            }`}
          >
            <span>Câu {item.questionNumber}</span>
            <span className="text-xs opacity-80 uppercase">
              {item.itemType === "mcq"
                ? "MCQ"
                : item.itemType === "true_false"
                ? "T/F"
                : item.itemType === "numeric"
                ? "NUM"
                : "ESS"}
            </span>
          </button>
        ))}
      </div>

      {/* Add question controls */}
      <div className="pt-3 border-t border-admin-border/60 space-y-2 shrink-0">
        <div className="text-xs font-bold text-admin-muted uppercase tracking-wider">
          Thêm mới
        </div>
        <div className="rounded-lg border border-admin-border/77 bg-admin-bg p-2.5 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-admin-muted">Dạng</label>
              <select
                value={bulkItemType}
                disabled
                onChange={(e) => {
                  const nextType = e.target.value as ItemType;
                  setBulkItemType(nextType);
                  setBulkMaxScore(defaultMaxScoreByItemType[nextType]);
                }}
                className="w-full rounded border border-admin-border bg-admin-deep px-2 py-1.5 text-xs font-bold text-admin-cream outline-none disabled:cursor-not-allowed disabled:opacity-70"
              >
                <option value="mcq">MCQ</option>
                <option value="true_false">Đúng/Sai</option>
                <option value="numeric">Điền số</option>
                <option value="essay">Tự luận</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-admin-muted">Số câu</label>
              <input
                type="number"
                min={1}
                max={100}
                step={1}
                value={bulkCount}
                onChange={(e) => setBulkCount(Number(e.target.value))}
                className="w-full rounded border border-admin-border bg-admin-deep px-2 py-1.5 text-xs font-bold text-admin-cream outline-none focus:border-admin-pink"
              />
            </div>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-admin-muted">
                Điểm mỗi câu
              </label>
              <input
                type="number"
                min={0.01}
                step={0.25}
                inputMode="decimal"
                value={bulkMaxScore}
                onChange={(e) => setBulkMaxScore(Number(e.target.value))}
                className="w-full rounded border border-admin-border bg-admin-deep px-2 py-1.5 text-xs font-bold text-admin-cream outline-none focus:border-admin-pink"
              />
            </div>
            <button
              type="button"
              onClick={onBulkAddItems}
              className="self-end rounded border border-admin-pink/50 bg-admin-pink px-2.5 py-1.5 text-xs font-black text-admin-bg transition hover:brightness-110 active:scale-95 cursor-pointer"
            >
              Thêm
            </button>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-admin-muted">Chuyên đề</label>
            <input
              type="text"
              list="assessment-builder-topic-options"
              value={bulkTopicName}
              onChange={(e) => setBulkTopicName(e.target.value)}
              placeholder="Ví dụ: Hàm số"
              className="w-full rounded border border-admin-border bg-admin-deep px-2 py-1.5 text-xs font-bold text-admin-cream outline-none focus:border-admin-pink"
            />
          </div>
          <div className="text-xs leading-relaxed text-admin-muted">
            Gợi ý: MCQ 0.25đ, đúng/sai 1đ, điền số 0.5đ. Nếu đề thuộc khóa học, chuyên đề sẽ được
            dùng lại hoặc tự tạo mới.
          </div>
        </div>
        <div>
          <button
            type="button"
            onClick={() => onAddItem(bulkItemType)}
            className="flex w-full items-center justify-center gap-1 rounded bg-admin-deep border border-admin-border py-1.5 text-xs font-bold text-admin-cream hover:border-admin-pink transition cursor-pointer"
          >
            + Thêm câu {itemTypeLabels[bulkItemType].toLowerCase()}
          </button>
        </div>
      </div>

      <datalist id="assessment-builder-topic-options">
        {topicOptions.map((topic) => (
          <option key={topic.id} value={topic.name} />
        ))}
      </datalist>
    </div>
  );
}
