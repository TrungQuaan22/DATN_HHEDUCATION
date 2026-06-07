"use client";

import React from "react";
import Link from "next/link";
import { Layout, BookOpen, Award, Sparkles, Home, X } from "lucide-react";

interface StudentSidebarProps {
  user: any;
  pathname: string;
  isOpen: boolean;
  onClose: () => void;
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
}: StudentSidebarProps) {
  const isActive = (path: string) => {
    if (path === "/student") {
      return pathname === "/student" || pathname === "/student/overview";
    }
    return pathname.startsWith(path);
  };

  const navLinks = [
    { href: "/student", label: "Overview", icon: Layout },
    { href: "/student/courses", label: "My Courses", icon: BookOpen },
    { href: "/student/assessments", label: "Assessments", icon: Award },
    { href: "/student/practice", label: "Practice Room", icon: Sparkles },
  ];

  const sidebarContent = (isMobile: boolean = false) => {
    const handleLinkClick = () => {
      if (isMobile) {
        onClose();
      }
    };

    return (
      <>
        {/* Brand Logo Header */}
        <div className="px-6 py-6 border-b border-border-dark/50 flex flex-col gap-1.5 relative">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              onClick={handleLinkClick}
              className="text-[20px] font-bold text-cream tracking-tight hover:opacity-90"
            >
              HH <span className="text-brand-pink font-extrabold">Education</span>
            </Link>
            {isMobile && (
              <button
                onClick={onClose}
                className="text-cream hover:text-brand-pink md:hidden"
              >
                <X size={20} />
              </button>
            )}
          </div>
          <span className="text-[11px] font-semibold text-brand-pink bg-brand-pink/10 px-2 py-0.5 rounded-full w-fit">
            {getRoleLabel(user?.role)}
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-grow px-4 py-6 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href) && (link.href !== "/student" || pathname === "/student" || pathname.endsWith("overview"));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-4 py-3 rounded text-[14px] font-semibold transition-all ${
                  active
                    ? "bg-brand-pink text-brand-dark shadow-l2 scale-[1.02]"
                    : "text-cream hover:bg-surface-input hover:text-brand-pink"
                }`}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border-dark/50 space-y-4">
          <Link
            href="/"
            onClick={handleLinkClick}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded border border-border-dark bg-surface-input text-[13px] font-semibold text-cream hover:border-brand-pink hover:text-brand-pink transition-all active:scale-95"
          >
            <Home size={15} />
            Trở về trang chủ
          </Link>
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full border border-brand-pink/30 overflow-hidden bg-brand-dark flex-shrink-0">
              <img
                alt="Avatar"
                className="w-full h-full object-cover"
                src={
                  user?.avatarUrl ||
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuAGuA46dM9ofJOmtVCw4AMz8_whqj-2oCYdfE_v3mqHdlFmalFobUoD7sVror_gmNvr7HU2ruEqEghBfMiyTX9nRBNpBqhJX_GEx6KVLiEqu88W8TVbu1T2F03bshwyMWzPgOHMt9sh-5uOHlO_t2xK92c8WJHzkt_c0wwco1GuSUaWysUMin6PwpnDkru6nZT880_hkN7dKnKyA2IA0CgvZIepP9zEL6vFSovA_FwlsSqTJzFuhyBw2RHdY5ao61-Tgemu4OUWzY0"
                }
              />
            </div>
            <div className="truncate flex-grow">
              <p className="text-xs font-bold text-cream truncate">
                {user?.fullName || "Nguyễn Văn A"}
              </p>
              <p className="text-[10px] text-muted-text uppercase font-semibold mt-0.5">
                {getRoleLabel(user?.role)}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-[260px] bg-deep-black border-r border-border-dark z-30">
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
