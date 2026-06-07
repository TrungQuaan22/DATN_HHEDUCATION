"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useMeQuery } from "@/features/auth/hooks";
import { Menu, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { NotificationBell } from "@/components/layout/notification-bell";
import { UserDropdown } from "@/components/layout/user-dropdown";
import StudentSidebar from "./components/student-sidebar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const { data: user } = useMeQuery();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Authentication check
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push("/login");
    }
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <p className="text-muted-text animate-pulse">
          Đang kiểm tra quyền truy cập...
        </p>
      </div>
    );
  }

  // Get active breadcrumb name
  const getBreadcrumbName = () => {
    if (pathname === "/student" || pathname === "/student/overview")
      return "Tổng quan";
    if (pathname.startsWith("/student/courses"))
      return "Khóa học của tôi";
    if (pathname.startsWith("/student/assessments"))
      return "Bài kiểm tra";
    if (pathname.startsWith("/student/practice"))
      return "Phòng luyện tập";
    return "Tổng quan";
  };

  const isLearningPage = /^\/student\/courses\/[^/]+$/.test(pathname);

  if (isLearningPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-brand-dark text-cream flex font-sans transition-colors duration-200">
      <StudentSidebar
        user={user}
        pathname={pathname}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* -------------------- MAIN PAGE WRAPPER -------------------- */}
      <div className="flex-1 md:ml-[260px] flex flex-col min-w-0">
        {/* -------------------- TOPNAVBAR -------------------- */}
        <header className="fixed top-0 right-0 h-[64px] left-0 md:left-[260px] bg-brand-dark/95 backdrop-blur-md z-20 border-b border-border-dark/60 px-6 flex items-center justify-between transition-colors duration-200">
          {/* Mobile Sidebar Toggle & Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 -ml-1 rounded-lg border border-border-dark bg-surface-input text-cream md:hidden hover:text-brand-pink transition-all active:scale-95"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-[12px] font-semibold text-muted-text">
              <span>Không gian học tập</span>
              <ChevronRight size={14} className="text-muted-text/60" />
              <span className="text-brand-pink uppercase tracking-wider font-extrabold">
                {getBreadcrumbName()}
              </span>
            </div>
          </div>

          {/* Action Buttons & Profile */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <ThemeToggle className="w-10 h-10 rounded-lg flex items-center justify-center border border-border-dark bg-surface-input text-cream hover:text-brand-pink hover:border-brand-pink transition-all active:scale-95 cursor-pointer" />

            {/* Notification Bell Icon */}
            <NotificationBell className="w-10 h-10 rounded-lg flex items-center justify-center border border-border-dark bg-surface-input text-cream hover:text-brand-pink hover:border-brand-pink transition-all active:scale-95 cursor-pointer" />

            {/* User Dropdown */}
            <UserDropdown sizeClassName="w-10 h-10" />
          </div>
        </header>

        {/* -------------------- MAIN CANVAS -------------------- */}
        <main className="flex-1 pt-[88px] px-6 pb-12 max-w-[1200px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
