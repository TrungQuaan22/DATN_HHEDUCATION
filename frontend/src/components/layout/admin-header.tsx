"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useMeQuery } from "@/features/auth/hooks";
import { Search, Menu } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { NotificationBell } from "./notification-bell";
import { UserDropdown } from "./user-dropdown";

type AdminHeaderProps = {
  onToggleSidebar: () => void;
};

export default function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
  const { data: user } = useMeQuery();

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-admin-deep border-b border-admin-border/30 flex justify-between items-center px-4 sm:px-8 z-40 text-admin-cream">
      {/* Menu toggle for mobile + Search box */}
      <div className="flex items-center gap-4 w-1/2 sm:w-1/3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 -ml-2 rounded-lg text-admin-muted hover:text-admin-pink hover:bg-admin-surface-low/50 transition-colors cursor-pointer"
          aria-label="Open Sidebar"
        >
          <Menu size={20} />
        </button>
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted group-focus-within:text-admin-pink w-4 h-4 transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm hệ thống..."
            className="w-full bg-admin-surface-low border border-admin-border/30 rounded pl-10 pr-4 py-2 text-[14px] text-admin-cream placeholder:text-admin-muted/50 focus:border-admin-pink focus:outline-none focus:ring-1 focus:ring-admin-pink transition-all"
          />
        </div>
      </div>

      {/* Action buttons & profile */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          {/* Theme toggle */}
          <ThemeToggle className="w-9 h-9 rounded-lg flex items-center justify-center border border-admin-border/30 bg-admin-surface-low text-admin-muted hover:text-admin-pink hover:border-admin-pink transition-all active:scale-95 cursor-pointer" />

          {/* Notifications */}
          <NotificationBell
            className="relative w-9 h-9 rounded-lg flex items-center justify-center border border-admin-border/30 bg-admin-surface-low text-admin-muted hover:text-admin-pink hover:border-admin-pink transition-all active:scale-95 cursor-pointer"
            dotClassName="absolute top-0.5 right-0.5 w-2 h-2 bg-admin-pink rounded-full"
            dropdownClassName="border-admin-border/30 bg-admin-deep text-admin-cream"
          />
        </div>

        {/* Vertical divider */}
        <div className="h-8 w-px bg-admin-border/20"></div>

        {/* Profile info & Dropdown */}
        <div className="flex items-center gap-3 relative admin-profile-dropdown-container">
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-bold text-admin-cream leading-tight">
              {user?.fullName || "Quản trị viên HH"}
            </p>
            <p className="text-[10px] text-admin-pink uppercase font-semibold tracking-wider">
              {user?.role === "admin" ? "Super Administrator" : "Instructor"}
            </p>
          </div>
          <UserDropdown isAdmin sizeClassName="w-10 h-10" />
        </div>
      </div>
    </header>
  );
}

