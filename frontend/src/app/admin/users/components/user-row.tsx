"use client";

import React from "react";
import Image from "next/image";
import { Shield, GraduationCap, User, UserPlus, BookOpen, UserCheck, UserX } from "lucide-react";
import { AdminUserItem, UserStatus } from "@/features/users/types";

interface UserRowProps {
  user: AdminUserItem;
  isActionPending: boolean;
  onToggleStatus: (userId: string, currentStatus: UserStatus) => Promise<void>;
  onEnrollClick: (user: AdminUserItem) => void;
  onProgressClick: (user: AdminUserItem) => void;
}

const ROLE_LABELS = {
  admin: { text: "Quản trị viên", class: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  teacher: { text: "Giảng viên", class: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  student: { text: "Học sinh", class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
};

const STATUS_LABELS = {
  active: { text: "Hoạt động", class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  banned: { text: "Bị khóa", class: "bg-red-500/10 text-red-400 border-red-500/20" },
  pending_verification: { text: "Chờ xác minh", class: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
};

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

export default function UserRow({
  user,
  isActionPending,
  onToggleStatus,
  onEnrollClick,
  onProgressClick,
}: UserRowProps) {
  const roleConfig = ROLE_LABELS[user.role] || {
    text: user.role,
    class: "bg-admin-surface-low text-admin-muted border-admin-border/20",
  };
  const statusConfig = STATUS_LABELS[user.status] || {
    text: user.status,
    class: "bg-admin-surface-low text-admin-muted border-admin-border/20",
  };

  return (
    <tr className="group hover:bg-admin-surface-low/20 transition-colors text-[14px]">
      {/* User Info (Avatar, Name, Email) */}
      <td className="pl-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full border border-admin-border/20 flex-shrink-0 overflow-hidden bg-admin-surface-low flex items-center justify-center">
            {user.avatarUrl ? (
              <Image
                alt={user.fullName}
                fill
                sizes="40px"
                className="object-cover"
                src={user.avatarUrl}
              />
            ) : user.role === "admin" ? (
              <Shield className="text-rose-400 w-5 h-5" />
            ) : user.role === "teacher" ? (
              <GraduationCap className="text-blue-400 w-5 h-5" />
            ) : (
              <User className="text-emerald-400 w-5 h-5" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-admin-cream truncate max-w-[200px]" title={user.fullName}>
              {user.fullName}
            </p>
            <p className="text-xs text-admin-muted truncate max-w-[200px]" title={user.email}>
              {user.email}
            </p>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="py-4">
        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${roleConfig.class}`}>
          {roleConfig.text}
        </span>
      </td>

      {/* Status */}
      <td className="py-4">
        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusConfig.class}`}>
          {statusConfig.text}
        </span>
      </td>

      {/* Created Date */}
      <td className="py-4 text-admin-muted text-xs">
        {formatDate(user.createdAt)}
      </td>

      {/* Actions */}
      <td className="pr-6 py-4 text-right sticky right-0 bg-admin-deep group-hover:bg-admin-surface-low/20 transition-colors z-10 border-l border-admin-border/10">
        <div className="flex items-center justify-end gap-2">
          {/* Student Specific Actions */}
          {user.role === "student" && (
            <>
              <button
                onClick={() => onEnrollClick(user)}
                disabled={isActionPending}
                className="p-1.5 text-admin-muted hover:text-admin-cream hover:bg-admin-surface-low/50 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                title="Gán khóa học thủ công"
              >
                <UserPlus size={16} />
              </button>
              <button
                onClick={() => onProgressClick(user)}
                disabled={isActionPending}
                className="p-1.5 text-admin-muted hover:text-admin-cream hover:bg-admin-surface-low/50 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                title="Xem tiến độ học tập"
              >
                <BookOpen size={16} />
              </button>
            </>
          )}

          {/* Ban / Active status toggler */}
          {user.role !== "admin" && (
            <button
              onClick={() => onToggleStatus(user.id, user.status)}
              disabled={isActionPending}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${
                user.status === "banned"
                  ? "text-emerald-500/70 hover:text-emerald-400 hover:bg-emerald-500/10"
                  : "text-red-500/70 hover:text-red-400 hover:bg-red-500/10"
              }`}
              title={user.status === "banned" ? "Mở khóa tài khoản" : "Khóa tài khoản"}
            >
              {user.status === "banned" ? <UserCheck size={16} /> : <UserX size={16} />}
            </button>
          )}

          {/* Admin placeholder to keep layout alignment */}
          {user.role === "admin" && (
            <div className="w-[28px] h-7 shrink-0" />
          )}
        </div>
      </td>
    </tr>
  );
}
