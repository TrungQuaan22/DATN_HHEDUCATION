"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  CheckCheck,
  ClipboardPenLine,
  FileCheck2,
  Loader2,
} from "lucide-react";

import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from "@/features/notifications/hooks";
import type {
  NotificationType,
  UserNotification,
} from "@/features/notifications/types";

interface NotificationBellProps {
  className?: string;
  dotClassName?: string;
  dropdownClassName?: string;
}

const TYPE_ICONS: Record<NotificationType, typeof Bell> = {
  new_lesson: BookOpen,
  graded: FileCheck2,
  new_assignment: ClipboardPenLine,
  upcoming_assessment: Bell,
  essay_submission: ClipboardPenLine,
};

export function NotificationBell({
  className,
  dotClassName,
  dropdownClassName,
}: NotificationBellProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const notificationsQuery = useNotificationsQuery();
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllMutation = useMarkAllNotificationsReadMutation();
  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const openNotification = async (notification: UserNotification) => {
    if (!notification.isRead)
      await markReadMutation.mutateAsync(notification.id);
    setIsOpen(false);
    if (notification.linkUrl) router.push(notification.linkUrl);
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-label={`Thông báo${unreadCount ? `, ${unreadCount} chưa đọc` : ""}`}
        aria-expanded={isOpen}
        className={
          className ||
          "relative flex h-9 w-9 items-center justify-center rounded-lg border border-border-dark bg-surface-input text-cream transition-colors hover:border-brand-pink hover:text-brand-pink"
        }
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span
            className={
              dotClassName ||
              "absolute right-0 top-0 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-brand-pink px-1 text-[10px] font-bold text-deep-black"
            }
          >
            {dotClassName ? null : unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 z-50 mt-2 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border-dark bg-brand-dark text-cream shadow-lg ${dropdownClassName || ""}`}
        >
          <div className="flex items-center justify-between border-b border-border-dark/60 px-4 py-3">
            <div>
              <p className="text-sm font-bold">Thông báo</p>
              <p className="mt-0.5 text-xs text-muted-text">
                {unreadCount
                  ? `${unreadCount} thông báo chưa đọc`
                  : "Bạn đã xem tất cả"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                disabled={markAllMutation.isPending}
                onClick={() => markAllMutation.mutate()}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-pink hover:underline disabled:opacity-50"
              >
                <CheckCheck size={13} /> Đọc tất cả
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {notificationsQuery.isLoading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-muted-text">
                <Loader2 size={16} className="animate-spin" /> Đang tải...
              </div>
            ) : notificationsQuery.isError ? (
              <p className="px-4 py-8 text-center text-sm text-red-300">
                Không thể tải thông báo.
              </p>
            ) : notificationsQuery.data?.items.length ? (
              notificationsQuery.data.items.map((notification) => {
                const Icon = TYPE_ICONS[notification.type];
                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => openNotification(notification)}
                    className={`flex w-full gap-3 border-b border-border-dark/40 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-surface-input ${notification.isRead ? "opacity-75" : "bg-brand-pink/[0.04]"}`}
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-pink/10 text-brand-pink">
                      <Icon size={15} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="text-sm font-semibold leading-5 text-cream">
                          {notification.title}
                        </span>
                        {!notification.isRead && (
                          <span
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-pink"
                            aria-label="Chưa đọc"
                          />
                        )}
                      </span>
                      {notification.content && (
                        <span className="mt-1 block text-xs leading-5 text-muted-text">
                          {notification.content}
                        </span>
                      )}
                      <span className="mt-1.5 block text-xs text-muted-text">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="px-5 py-10 text-center">
                <Bell size={22} className="mx-auto text-muted-text" />
                <p className="mt-2 text-sm font-semibold">Chưa có thông báo</p>
                <p className="mt-1 text-xs text-muted-text">
                  Các cập nhật học tập và bài chấm sẽ xuất hiện tại đây.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatRelativeTime(value: string) {
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat("vi", { numeric: "auto" });
  if (Math.abs(seconds) < 60) return formatter.format(seconds, "second");
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return formatter.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return formatter.format(hours, "hour");
  return formatter.format(Math.round(hours / 24), "day");
}
