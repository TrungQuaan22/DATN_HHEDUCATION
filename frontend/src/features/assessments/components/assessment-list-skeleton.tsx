"use client";

import React from "react";

export function AssessmentListSkeleton() {
  return (
    <div className="rounded-xl border border-admin-border bg-admin-surface-low overflow-hidden shadow-sm animate-pulse">
      {/* Header bar placeholder */}
      <div className="flex items-center justify-between border-b border-admin-border/60 px-5 py-4 bg-admin-surface-low/50">
        <div className="h-5 w-48 bg-admin-border rounded" />
        <div className="h-7 w-20 bg-admin-border rounded-md" />
      </div>

      {/* Row placeholders */}
      <div className="divide-y divide-admin-border/60">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="grid gap-4 items-center p-5 md:grid-cols-[1fr_auto_140px] bg-admin-surface-low/20"
          >
            {/* Left Column: Metadata & Title */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="h-4 w-24 bg-admin-border rounded" />
                <div className="h-4 w-28 bg-admin-border rounded" />
                <div className="h-4 w-16 bg-admin-border rounded" />
              </div>
              <div className="h-5 w-2/3 bg-admin-border rounded" />
              <div className="h-4.5 w-1/2 bg-admin-border rounded" />
            </div>

            {/* Middle Column: Placement Label */}
            <div>
              <div className="h-6 w-32 bg-admin-border rounded-full hidden md:block" />
            </div>

            {/* Right Column: Actions */}
            <div className="flex items-center justify-end gap-2">
              <div className="h-8 w-16 bg-admin-border rounded" />
              <div className="h-8 w-20 bg-admin-border rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
