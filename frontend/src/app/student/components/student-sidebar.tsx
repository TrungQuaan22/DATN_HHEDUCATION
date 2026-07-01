"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Layout,
  BookOpen,
  Award,
  Sparkles,
  Home,
  X,
  ChevronLeft,
  User,
} from "lucide-react";
import type { AuthUser } from "@/types/auth";

interface StudentSidebarProps {
  user: AuthUser | undefined;
  pathname: string;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const getRoleLabel = (role?: string) => {
  switch (role) {
    case "student":
      return "Học sinh";
    case "teacher":
      return "Giáo viên";
    case "admin":
      return "Quản trị viên";
    default:
      return "Học viên";
  }
};

export default function StudentSidebar({
  user,
  pathname,
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: StudentSidebarProps) {
  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [user?.avatarUrl]);

  const isActive = (path: string) => {
    if (path === "/student") {
      return pathname === "/student" || pathname === "/student/overview";
    }
    return pathname.startsWith(path);
  };

  const navLinks = [
    { href: "/student", label: "Tổng quan", icon: Layout },
    { href: "/student/courses", label: "Khóa học của tôi", icon: BookOpen },
    { href: "/student/assessments", label: "Bài kiểm tra", icon: Award },
    { href: "/student/practice", label: "Phòng luyện tập", icon: Sparkles },
  ];

  const sidebarContent = (isMobile: boolean = false) => {
    const handleLinkClick = () => {
      if (isMobile) {
        onClose();
      }
    };

    const collapsed = !isMobile && isCollapsed;

    return (
      <>
        {/* Brand Logo Header */}
        <div
          className={`py-6 border-b border-border-dark/50 flex flex-col gap-1.5 relative transition-all duration-300 ${
            collapsed ? "px-2" : "px-6"
          }`}
        >
          <div className="flex items-center overflow-hidden w-full relative h-10">
            {/* Collapsed HH Logo */}
            <div
              className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                collapsed
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-75 pointer-events-none"
              }`}
            >
              <Link
                href="/"
                onClick={handleLinkClick}
                className="text-xl font-black text-brand-pink tracking-tighter font-serif select-none animate-pulse"
              >
                HH
              </Link>
            </div>
            {/* Expanded Full Logo */}
            <div
              className={`transition-all duration-300 transform origin-left flex items-center justify-between w-full ${
                collapsed
                  ? "opacity-0 scale-75 translate-x-4 pointer-events-none"
                  : "opacity-100 scale-100 translate-x-0"
              }`}
            >
              <Link
                href="/"
                onClick={handleLinkClick}
                className="text-xl font-bold text-cream tracking-tight hover:opacity-90 font-serif whitespace-nowrap"
              >
                HH{" "}
                <span className="text-brand-pink font-extrabold">
                  Education
                </span>
              </Link>
              {isMobile && (
                <button
                  onClick={onClose}
                  className="text-cream hover:text-brand-pink md:hidden cursor-pointer"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>
          <span
            className={`text-xs font-semibold text-brand-pink bg-brand-pink/10 px-2 py-0.5 rounded-full w-fit transition-all duration-300 ${
              collapsed
                ? "opacity-0 scale-75 pointer-events-none h-0 py-0 overflow-hidden mt-0"
                : "opacity-100 scale-100 mt-0"
            }`}
          >
            {getRoleLabel(user?.role)}
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav
          className={`flex-grow py-6 space-y-1 transition-all duration-300 ${collapsed ? "px-2" : "px-4"}`}
        >
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active =
              isActive(link.href) &&
              (link.href !== "/student" ||
                pathname === "/student" ||
                pathname.endsWith("overview"));
            return (
              <div key={link.href} className="group relative">
                <Link
                  href={link.href}
                  onClick={handleLinkClick}
                  className={`flex items-center rounded transition-all duration-300 overflow-hidden h-11 relative ${
                    active
                      ? "bg-brand-pink text-brand-dark shadow-l2 font-bold"
                      : "text-cream hover:bg-surface-input hover:text-brand-pink"
                  }`}
                >
                  <div
                    className={`flex items-center justify-center shrink-0 transition-all duration-300 ${
                      collapsed ? "w-full" : "w-11"
                    }`}
                  >
                    <Icon
                      size={18}
                      className="shrink-0 group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <span
                    className={`text-sm whitespace-nowrap transition-all duration-300 ease-in-out origin-left absolute left-14 ${
                      collapsed
                        ? "opacity-0 -translate-x-4 pointer-events-none"
                        : "opacity-100 translate-x-0"
                    }`}
                  >
                    {link.label}
                  </span>
                </Link>

                {/* Tooltip on hover (only when collapsed) */}
                {collapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-deep-black border border-border-dark text-cream text-xs font-black rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[100] pointer-events-none select-none">
                    {link.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-deep-black mr-[-1px]"></div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div
          className={`border-t border-border-dark/50 pt-4 pb-6 transition-all duration-300 space-y-3 ${
            collapsed ? "px-2" : "px-4"
          }`}
        >
          {/* Toggle Collapse Button (Desktop only) */}
          {!isMobile && (
            <div className="group relative">
              <button
                onClick={onToggleCollapse}
                className="flex items-center rounded transition-all duration-300 overflow-hidden h-11 relative w-full text-cream/70 hover:text-brand-pink hover:bg-surface-input cursor-pointer text-left font-semibold text-sm"
                aria-label={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
              >
                <div
                  className={`flex items-center justify-center shrink-0 transition-all duration-300 ${
                    collapsed ? "w-full" : "w-11"
                  }`}
                >
                  <ChevronLeft
                    className={`w-5 h-5 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
                  />
                </div>
                <span
                  className={`whitespace-nowrap transition-all duration-300 ease-in-out origin-left absolute left-14 ${
                    collapsed
                      ? "opacity-0 -translate-x-4 pointer-events-none"
                      : "opacity-100 translate-x-0"
                  }`}
                >
                  Thu gọn
                </span>
              </button>

              {/* Tooltip on hover (only when collapsed) */}
              {collapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-deep-black border border-border-dark text-cream text-xs font-black rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[100] pointer-events-none select-none">
                  Mở rộng
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-deep-black mr-[-1px]"></div>
                </div>
              )}
            </div>
          )}

          {/* Home Link */}
          <div className="group relative">
            <Link
              href="/"
              onClick={handleLinkClick}
              className="flex items-center rounded transition-all duration-300 overflow-hidden h-11 relative border border-border-dark bg-surface-input text-sm font-semibold text-cream hover:border-brand-pink hover:text-brand-pink active:scale-95"
            >
              <div
                className={`flex items-center justify-center shrink-0 transition-all duration-300 ${
                  collapsed ? "w-full" : "w-11"
                }`}
              >
                <Home size={15} />
              </div>
              <span
                className={`whitespace-nowrap transition-all duration-300 ease-in-out origin-left absolute left-14 ${
                  collapsed
                    ? "opacity-0 -translate-x-4 pointer-events-none"
                    : "opacity-100 translate-x-0"
                }`}
              >
                Trở về trang chủ
              </span>
            </Link>

            {/* Tooltip on hover (only when collapsed) */}
            {collapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-deep-black border border-border-dark text-cream text-xs font-black rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[100] pointer-events-none select-none">
                Trở về trang chủ
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-deep-black mr-[-1px]"></div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="group relative pt-2">
            <div
              className={`flex items-center transition-all duration-300 ${collapsed ? "px-0 justify-center" : "gap-3 px-2"}`}
            >
              <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-brand-pink/30 bg-brand-dark">
                {user?.avatarUrl && !imageError ? (
                  <Image
                    alt={`Ảnh đại diện của ${user.fullName}`}
                    fill
                    sizes="36px"
                    className="object-cover"
                    src={user.avatarUrl}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <User
                    size={16}
                    className="text-muted-text"
                    aria-hidden="true"
                  />
                )}
              </div>
              <div
                className={`truncate transition-all duration-300 ${
                  collapsed
                    ? "opacity-0 w-0 pointer-events-none"
                    : "flex-grow opacity-100"
                }`}
              >
                <p className="text-xs font-bold text-cream truncate">
                  {user?.fullName || "Học viên"}
                </p>
                <p className="text-xs text-muted-text uppercase font-semibold mt-0.5">
                  {getRoleLabel(user?.role)}
                </p>
              </div>
            </div>

            {/* Tooltip on hover (only when collapsed) */}
            {collapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-deep-black border border-border-dark text-cream text-xs font-black rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[100] pointer-events-none select-none">
                {user?.fullName || "Học viên"} ({getRoleLabel(user?.role)})
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-deep-black mr-[-1px]"></div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      {/* Sidebar Desktop */}
      <aside
        className={`hidden md:flex flex-col fixed left-0 top-0 h-full bg-deep-black border-r border-border-dark z-30 transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-[260px]"
        }`}
      >
        {sidebarContent(false)}
      </aside>

      {/* Sidebar Mobile Drawer Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Mobile Drawer Panel */}
      <aside
        className={`fixed left-0 top-0 h-full w-[260px] bg-deep-black border-r border-border-dark z-50 flex flex-col md:hidden transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent(true)}
      </aside>
    </>
  );
}
