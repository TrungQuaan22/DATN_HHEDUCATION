"use client";

import React from "react";
import { BuilderItem } from "../types";

interface NumericEditorProps {
  item: BuilderItem;
  onUpdateItem: (updates: Partial<BuilderItem>) => void;
}

export function NumericEditor({ item, onUpdateItem }: NumericEditorProps) {
  return (
    <div className="bg-admin-deep p-4 rounded-lg border border-admin-border/60">
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-admin-muted uppercase block">
          Đáp án số chuẩn
        </label>
        <input
          type="number"
          value={item.correctAnswer ?? 0}
          onChange={(e) =>
            onUpdateItem({
              correctAnswer: Number(e.target.value),
            })
          }
          className="w-full rounded-lg border border-admin-border bg-admin-bg px-2.5 py-1.5 text-xs text-admin-cream outline-none focus:border-admin-pink"
        />
      </div>
    </div>
  );
}
