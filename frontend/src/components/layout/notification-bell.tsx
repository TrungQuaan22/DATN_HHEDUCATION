"use client";

import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";

interface NotificationBellProps {
  className?: string;
  dotClassName?: string;
  dropdownClassName?: string;
}

const mockNotifications = [
  {
    id: 1,
    title: "Kiểm tra giữa kỳ Ngữ Văn sắp mở",
    time: "Còn 2 ngày",
    unread: true,
  },
  {
    id: 2,
    title: "Bài viết blog mới: Cách phân tích văn xuôi",
    time: "Hôm nay",
    unread: false,
  },
  {
    id: 3,
    title: "Giáo viên đã chấm bài tập Luyện viết",
    time: "Hôm qua",
    unread: false,
  },
];

export function NotificationBell({
  className,
  dotClassName,
  dropdownClassName,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".notification-bell-container")) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className="relative notification-bell-container group shrink-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={
          className ||
          "w-9 h-9 rounded-lg flex items-center justify-center border border-border-dark bg-surface-input text-cream hover:text-brand-pink hover:border-brand-pink transition-all active:scale-95 cursor-pointer"
        }
        aria-label="Notifications"
      >
        <Bell size={16} />
        <span
          className={
            dotClassName ||
            "absolute top-1 right-1 w-2 h-2 bg-brand-pink rounded-full shadow-l1 animate-pulse"
          }
        />
      </button>

      {/* Simple dropdown notifications */}
      <div
        className={`absolute right-0 mt-2 w-72 rounded border border-border-dark bg-brand-dark shadow-l4 py-2 transition-all duration-150 z-50 ${
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        } ${dropdownClassName || ""}`}
      >
        <div className="px-4 py-1.5 border-b border-border-dark/40 flex justify-between items-center">
          <span className="text-xs font-bold text-cream">Thông báo mới</span>
          <span className="text-xs text-brand-pink cursor-pointer font-semibold">
            Đánh dấu tất cả đã đọc
          </span>
        </div>
        <div className="p-1 space-y-1">
          {mockNotifications.map((n) => (
            <div
              key={n.id}
              className="p-1.5 rounded hover:bg-surface-input transition-colors flex flex-col gap-0.5 cursor-pointer text-left"
            >
              <div className="flex items-center gap-1.5">
                {n.unread && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-pink shrink-0" />
                )}
                <p className="text-xs font-bold text-cream truncate">
                  {n.title}
                </p>
              </div>
              <span className="text-xs text-muted-text pl-3">{n.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
