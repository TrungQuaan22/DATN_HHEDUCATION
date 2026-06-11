"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { BuilderItem, AssessmentType } from "../types";

interface TrueFalseEditorProps {
  item: BuilderItem;
  assessmentType: AssessmentType;
  onUpdateItem: (updates: Partial<BuilderItem>) => void;
}

export function TrueFalseEditor({ item, assessmentType, onUpdateItem }: TrueFalseEditorProps) {
  const statements = item.statements || [];

  const handleUpdateStatementLabel = (sIdx: number, label: string) => {
    const nextStmts = [...statements];
    nextStmts[sIdx] = { ...nextStmts[sIdx], label };
    onUpdateItem({ statements: nextStmts });
  };

  const handleUpdateStatementValue = (sIdx: number, correctValue: boolean) => {
    const nextStmts = [...statements];
    nextStmts[sIdx] = { ...nextStmts[sIdx], correctValue };
    onUpdateItem({ statements: nextStmts });
  };

  const handleDeleteStatement = (sIdx: number) => {
    const nextStmts = statements.filter((_, idx) => idx !== sIdx);
    onUpdateItem({ statements: nextStmts });
  };

  const handleAddStatement = () => {
    const nextStmts = [
      ...statements,
      {
        label: `Mệnh đề ${statements.length + 1}`,
        correctValue: true,
      },
    ];
    onUpdateItem({ statements: nextStmts });
  };

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] leading-relaxed text-amber-100">
        <div className="font-bold text-amber-300">Quy tắc chấm đúng/sai</div>
        <div className="mt-0.5 text-amber-100/90">
          Mặc định 4 mệnh đề: đúng 4 được 100%, đúng 3 được 50%, đúng 2 được 25%, đúng 1 được 10%.
          Nếu số mệnh đề khác 4, hệ thống chấm theo tỉ lệ số câu đúng.
        </div>
      </div>
      {statements.map((stmt, sIdx) => (
        <div
          key={sIdx}
          className="grid grid-cols-[1fr_80px_28px] gap-2 items-center bg-admin-deep p-2.5 rounded-lg border border-admin-border/60"
        >
          {assessmentType === "quiz" ? (
            <input
              type="text"
              value={stmt.label}
              onChange={(e) => handleUpdateStatementLabel(sIdx, e.target.value)}
              className="bg-transparent text-xs text-admin-cream outline-none"
            />
          ) : (
            <div className="text-xs font-bold text-admin-cream">Mệnh đề {sIdx + 1}</div>
          )}
          <div className="flex rounded border border-admin-border overflow-hidden text-[10px] font-bold">
            <button
              type="button"
              onClick={() => handleUpdateStatementValue(sIdx, true)}
              className={`px-2 py-1 flex-1 cursor-pointer ${
                stmt.correctValue ? "bg-admin-pink text-admin-bg" : "text-admin-muted hover:text-admin-cream"
              }`}
            >
              Đúng
            </button>
            <button
              type="button"
              onClick={() => handleUpdateStatementValue(sIdx, false)}
              className={`px-2 py-1 flex-1 cursor-pointer ${
                !stmt.correctValue ? "bg-admin-pink text-admin-bg" : "text-admin-muted hover:text-admin-cream"
              }`}
            >
              Sai
            </button>
          </div>
          <button
            type="button"
            title="Xóa mệnh đề"
            onClick={() => handleDeleteStatement(sIdx)}
            disabled={statements.length <= 1}
            className="flex h-7 w-7 items-center justify-center rounded border border-admin-border text-admin-muted transition hover:border-red-400/60 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] text-admin-muted">Hiện có {statements.length} mệnh đề.</div>
        <button
          type="button"
          onClick={handleAddStatement}
          className="text-xs font-bold text-admin-pink flex items-center gap-1 hover:underline cursor-pointer"
        >
          + Thêm mệnh đề
        </button>
      </div>
    </div>
  );
}
