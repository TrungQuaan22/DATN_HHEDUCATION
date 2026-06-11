"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { BuilderItem, ItemType, Difficulty, McqMode } from "./types";

interface AnswerKeyTableProps {
  items: BuilderItem[];
  selectedItemId: string;
  onSelectItemId: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<BuilderItem>) => void;
  onDeleteItem: (id: string) => void;
  topicOptions: Array<{ id: string; name: string }>;
}

export function AnswerKeyTable({
  items,
  selectedItemId,
  onSelectItemId,
  onUpdateItem,
  onDeleteItem,
  topicOptions,
}: AnswerKeyTableProps) {
  const handleItemFieldChange = (id: string, updates: Partial<BuilderItem>) => {
    onUpdateItem(id, updates);
  };

  return (
    <div className="flex-1 overflow-auto pr-1">
      <table className="w-full min-w-[920px] table-fixed text-left border-collapse text-xs">
        <colgroup>
          <col className="w-[84px]" />
          <col className="w-[380px]" />
          <col />
          <col className="w-[148px]" />
          <col className="w-[88px]" />
          <col className="w-[44px]" />
        </colgroup>
        <thead>
          <tr className="border-b border-admin-border/60 text-admin-muted font-bold text-[10px] uppercase tracking-wider sticky top-0 bg-admin-surface-low z-10">
            <th className="px-2 pb-2 text-center">Câu</th>
            <th className="px-3 pb-2">Đáp án</th>
            <th className="px-2 pb-2">Chuyên đề</th>
            <th className="px-2 pb-2">Độ khó</th>
            <th className="px-2 pb-2 text-center">Điểm</th>
            <th className="px-2 pb-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-admin-border/40">
          {items.map((item) => (
            <tr
              key={item.id}
              onClick={() => onSelectItemId(item.id)}
              className={`hover:bg-admin-border/10 group transition-all cursor-pointer ${
                selectedItemId === item.id
                  ? "outline outline-1 outline-admin-pink/40 bg-admin-pink/[0.02] relative z-10"
                  : ""
              }`}
            >
              <td className="px-2 py-3 text-center">
                <div className="flex items-center gap-1 justify-center">
                  {selectedItemId === item.id && (
                    <span className="text-admin-pink animate-pulse font-black text-xs shrink-0">
                      •
                    </span>
                  )}
                  <span
                    className={`text-xs font-bold transition-colors ${
                      selectedItemId === item.id ? "text-admin-pink" : "text-admin-cream"
                    }`}
                  >
                    Câu {item.questionNumber}
                  </span>
                </div>
              </td>

              <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                {/* MCQ Mode Answer Row */}
                {item.itemType === "mcq" && (
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {Array.from({ length: item.optionCount || 4 }, (_, idx) => {
                      const label = String.fromCharCode(65 + idx);
                      const isCorrect = (item.correctOptions || []).includes(label);
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => {
                            const isCorrectNow = isCorrect;
                            const current = item.correctOptions || [];
                            const nextCorrect = isCorrectNow
                              ? current.filter((val) => val !== label)
                              : item.mode === "multiple"
                              ? [...current, label]
                              : [label];
                            handleItemFieldChange(item.id, {
                              correctOptions: nextCorrect.length > 0 ? nextCorrect : [label],
                            });
                          }}
                          className={`h-7 w-7 rounded-full text-xs font-black transition-all flex items-center justify-center border cursor-pointer ${
                            isCorrect
                              ? "bg-admin-pink border-admin-pink text-admin-bg shadow-sm shadow-admin-pink/20"
                              : "border-admin-border bg-admin-deep text-admin-muted hover:border-admin-pink/50 hover:text-admin-cream"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}

                    {/* Small mode indicator if multiple */}
                    <button
                      type="button"
                      onClick={() => {
                        const nextMode = item.mode === "multiple" ? "single" : "multiple";
                        handleItemFieldChange(item.id, {
                          mode: nextMode,
                          correctOptions:
                            nextMode === "single" &&
                            item.correctOptions &&
                            item.correctOptions.length > 1
                              ? [item.correctOptions[0]]
                              : item.correctOptions,
                        });
                        toast.info(
                          `Đã đổi câu ${item.questionNumber} sang chọn ${
                            nextMode === "multiple" ? "nhiều đáp án" : "một đáp án"
                          }`
                        );
                      }}
                      className={`ml-1 text-[8px] font-black uppercase px-1 py-0.5 rounded border border-admin-border cursor-pointer ${
                        item.mode === "multiple"
                          ? "text-admin-pink bg-admin-pink/10 border-admin-pink/30"
                          : "text-admin-muted hover:text-admin-cream bg-admin-deep"
                      }`}
                      title={
                        item.mode === "multiple"
                          ? "Đổi sang Single-choice MCQ"
                          : "Đổi sang Multi-choice MCQ"
                      }
                    >
                      {item.mode === "multiple" ? "Multi" : "Single"}
                    </button>
                  </div>
                )}

                {/* True/False Mode Answer Row */}
                {item.itemType === "true_false" && (
                  <div className="flex w-full max-w-[190px] flex-col gap-1.5">
                    {(item.statements || []).map((stmt, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex h-8 items-center justify-between gap-2 rounded border border-admin-border/50 bg-admin-bg/85 px-2"
                      >
                        <span className="w-10 shrink-0 text-[10px] font-bold text-admin-muted">
                          MĐ{sIdx + 1}:
                        </span>
                        <div className="flex overflow-hidden rounded border border-admin-border text-[10px] font-bold">
                          <button
                            type="button"
                            onClick={() => {
                              const nextStmts = [...(item.statements || [])];
                              nextStmts[sIdx] = {
                                ...stmt,
                                correctValue: true,
                              };
                              handleItemFieldChange(item.id, {
                                statements: nextStmts,
                              });
                            }}
                            className={`h-6 w-8 cursor-pointer transition ${
                              stmt.correctValue
                                ? "bg-admin-pink text-admin-bg"
                               : "text-admin-muted hover:bg-admin-border/40 hover:text-admin-cream"
                            }`}
                          >
                            Đ
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const nextStmts = [...(item.statements || [])];
                              nextStmts[sIdx] = {
                                ...stmt,
                                correctValue: false,
                              };
                              handleItemFieldChange(item.id, {
                                statements: nextStmts,
                              });
                            }}
                            className={`h-6 w-8 border-l border-admin-border cursor-pointer transition ${
                              !stmt.correctValue
                                ? "bg-admin-pink text-admin-bg"
                                : "text-admin-muted hover:bg-admin-border/40 hover:text-admin-cream"
                            }`}
                          >
                            S
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const nextStmts = [
                          ...(item.statements || []),
                          {
                            label: `Mệnh đề ${(item.statements || []).length + 1}`,
                            correctValue: true,
                          },
                        ];
                        handleItemFieldChange(item.id, {
                          statements: nextStmts,
                        });
                      }}
                      className="flex h-7 items-center justify-center rounded border border-dashed border-admin-border/60 px-2 text-[10px] font-bold text-admin-pink transition-all hover:border-admin-pink hover:bg-admin-pink/[0.02] cursor-pointer"
                    >
                      + Thêm MĐ
                    </button>
                  </div>
                )}

                {/* Numeric Mode Answer Row */}
                {item.itemType === "numeric" && (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={item.correctAnswer || 0}
                      onChange={(e) =>
                        handleItemFieldChange(item.id, {
                          correctAnswer: Number(e.target.value),
                        })
                      }
                      placeholder="Đáp án"
                      className="w-20 rounded border border-admin-border bg-admin-deep px-2 py-1 text-xs text-admin-cream outline-none focus:border-admin-pink font-semibold"
                    />
                  </div>
                )}

                {/* Essay Mode Answer Row */}
                {item.itemType === "essay" && (
                  <input
                    type="text"
                    value={item.rubric || ""}
                    onChange={(e) =>
                      handleItemFieldChange(item.id, {
                        rubric: e.target.value,
                      })
                    }
                    placeholder="Hướng dẫn chấm điểm tự luận..."
                    className="w-full max-w-[240px] rounded border border-admin-border bg-admin-deep px-2.5 py-1.5 text-xs text-admin-cream outline-none focus:border-admin-pink"
                  />
                )}
              </td>

              <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  list="assessment-builder-topic-options"
                  value={item.topicName || ""}
                  onChange={(e) =>
                    handleItemFieldChange(item.id, {
                      topicId: null,
                      topicName: e.target.value || null,
                    })
                  }
                  placeholder="Chuyên đề..."
                  className="w-full rounded border border-admin-border bg-admin-deep px-2 py-1.5 text-xs text-admin-cream outline-none focus:border-admin-pink"
                />
              </td>

              <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                <select
                  value={item.difficulty}
                  onChange={(e) =>
                    handleItemFieldChange(item.id, {
                      difficulty: e.target.value as Difficulty,
                    })
                  }
                  className="w-[136px] rounded border border-admin-border bg-admin-deep px-2 py-1.5 text-xs text-admin-cream outline-none focus:border-admin-pink font-semibold cursor-pointer"
                >
                  <option value="recognition">Nhận biết</option>
                  <option value="understanding">Thông hiểu</option>
                  <option value="application">Vận dụng</option>
                  <option value="advanced">Vận dụng cao</option>
                </select>
              </td>

              <td className="px-2 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                <input
                  type="number"
                  step={0.25}
                  min={0.01}
                  value={item.maxScore}
                  onChange={(e) =>
                    handleItemFieldChange(item.id, {
                      maxScore: Number(e.target.value),
                    })
                  }
                  className="w-16 rounded border border-admin-border bg-admin-deep px-1.5 py-1 text-xs text-admin-cream outline-none focus:border-admin-pink text-center font-bold"
                />
              </td>

              <td className="px-2 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1.5 text-admin-muted hover:text-red-400 hover:bg-red-400/10 rounded transition cursor-pointer"
                  title="Xóa câu hỏi"
                >
                  <Trash2 size={13} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <datalist id="assessment-builder-topic-options">
        {topicOptions.map((topic) => (
          <option key={topic.id} value={topic.name} />
        ))}
      </datalist>
    </div>
  );
}
