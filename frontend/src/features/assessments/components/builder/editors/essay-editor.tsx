"use client";

import React from "react";
import { BuilderItem } from "../types";

interface EssayEditorProps {
  item: BuilderItem;
  onUpdateItem: (updates: Partial<BuilderItem>) => void;
}

export function EssayEditor({ item, onUpdateItem }: EssayEditorProps) {
  return (
    <div className="space-y-1.5 bg-admin-deep p-4 rounded-lg border border-admin-border/60">
      <label className="text-[10px] font-bold text-admin-muted uppercase block">
        Rubric hướng dẫn chấm bài
      </label>
      <textarea
        rows={4}
        value={item.rubric || ""}
        onChange={(e) =>
          onUpdateItem({
            rubric: e.target.value,
          })
        }
        placeholder="Nhập gợi ý hướng dẫn giáo viên chấm điểm..."
        className="w-full rounded-lg border border-admin-border bg-admin-bg px-3 py-2 text-xs text-admin-cream outline-none focus:border-admin-pink"
      />
    </div>
  );
}
