"use client";

import React from "react";
import { toast } from "sonner";
import { BuilderItem, AssessmentType, McqMode } from "../types";

interface McqEditorProps {
  item: BuilderItem;
  assessmentType: AssessmentType;
  onUpdateItem: (updates: Partial<BuilderItem>) => void;
}

export function McqEditor({ item, assessmentType, onUpdateItem }: McqEditorProps) {
  if (assessmentType === "quiz") {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <label className="text-[10px] font-bold text-admin-muted">Lựa chọn chế độ:</label>
          <select
            value={item.mode || "single"}
            onChange={(e) =>
              onUpdateItem({
                mode: e.target.value as McqMode,
              })
            }
            className="bg-admin-bg border border-admin-border text-[11px] text-admin-cream rounded px-1.5 py-0.5 font-bold cursor-pointer"
          >
            <option value="single">Chọn một đáp án đúng</option>
            <option value="multiple">Chọn nhiều đáp án đúng</option>
          </select>
        </div>
        {item.options?.map((opt, oIdx) => (
          <div
            key={oIdx}
            className="flex items-center gap-2 bg-admin-deep p-2.5 rounded-lg border border-admin-border/60"
          >
            <button
              type="button"
              onClick={() => {
                const nextOpts = [...(item.options || [])];
                nextOpts[oIdx] = {
                  ...opt,
                  isCorrect: !opt.isCorrect,
                };

                if (item.mode === "single") {
                  nextOpts.forEach((option, index) => {
                    option.isCorrect = index === oIdx;
                  });
                }

                onUpdateItem({
                  options: nextOpts,
                });
              }}
              className={`h-4 w-4 flex items-center justify-center rounded border transition cursor-pointer ${
                opt.isCorrect
                  ? "bg-admin-pink border-admin-pink text-admin-bg"
                  : "border-admin-muted"
              }`}
            >
              {opt.isCorrect && <span className="text-[9px] font-black">✓</span>}
            </button>
            <span className="w-5 text-[11px] font-black text-admin-muted">
              {String.fromCharCode(65 + oIdx)}
            </span>
            <input
              type="text"
              value={opt.content}
              onChange={(e) => {
                const nextOpts = [...(item.options || [])];
                nextOpts[oIdx] = {
                  ...opt,
                  content: e.target.value,
                };
                onUpdateItem({
                  options: nextOpts,
                });
              }}
              className="bg-transparent text-xs text-admin-cream outline-none flex-1"
            />
          </div>
        ))}
      </div>
    );
  } else {
    // Exam PDF Mode
    const optionCount = item.optionCount || 4;
    const correctOptions = item.correctOptions || ["A"];

    return (
      <div className="space-y-3 rounded-lg border border-admin-border/70 bg-admin-bg p-3">
        <div className="grid grid-cols-[1fr_90px] gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-admin-muted">Số lựa chọn</label>
            <input
              type="number"
              min={2}
              max={26}
              step={1}
              value={optionCount}
              onChange={(e) => {
                const nextCount = Math.max(2, Math.min(26, Number(e.target.value) || 4));
                const validLabels = new Set(
                  Array.from({ length: nextCount }, (_, index) => String.fromCharCode(65 + index))
                );
                const nextCorrect = correctOptions.filter((label) => validLabels.has(label));
                onUpdateItem({
                  optionCount: nextCount,
                  correctOptions: nextCorrect.length > 0 ? nextCorrect : ["A"],
                });
              }}
              className="w-full rounded border border-admin-border bg-admin-deep px-2 py-1.5 text-xs text-admin-cream outline-none focus:border-admin-pink font-semibold"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-admin-muted">Đáp án</label>
            <div className="rounded border border-admin-border bg-admin-deep px-2 py-1.5 text-xs font-black text-admin-cream">
              {correctOptions.join(", ") || "-"}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: optionCount }, (_, index) => {
            const label = String.fromCharCode(65 + index);
            const isCorrect = correctOptions.includes(label);

            return (
              <button
                key={label}
                type="button"
                onClick={() => {
                  const isCorrectNow = isCorrect;
                  const nextCorrect = isCorrectNow
                    ? correctOptions.filter((val) => val !== label)
                    : item.mode === "multiple"
                    ? [...correctOptions, label]
                    : [label];
                  onUpdateItem({
                    correctOptions: nextCorrect.length > 0 ? nextCorrect : [label],
                  });
                }}
                className={`rounded border px-3 py-2 text-sm font-black transition cursor-pointer ${
                  isCorrect
                    ? "border-admin-pink bg-admin-pink text-admin-bg"
                    : "border-admin-border bg-admin-deep text-admin-muted hover:border-admin-pink/70 hover:text-admin-cream"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-admin-muted">
          <span>Chế độ:</span>
          <select
            value={item.mode || "single"}
            onChange={(e) => {
              const nextMode = e.target.value as McqMode;
              onUpdateItem({
                mode: nextMode,
                correctOptions:
                  nextMode === "single" && correctOptions.length > 1
                    ? [correctOptions[0]]
                    : correctOptions,
              });
            }}
            className="rounded border border-admin-border bg-admin-deep px-2 py-1 text-admin-cream outline-none cursor-pointer"
          >
            <option value="single">Một đáp án</option>
            <option value="multiple">Nhiều đáp án</option>
          </select>
        </div>
      </div>
    );
  }
}
