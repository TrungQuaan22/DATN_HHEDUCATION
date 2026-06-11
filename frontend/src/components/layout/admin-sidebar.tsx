"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  FileQuestion,
  FileText,
  Users,
  ShoppingCart,
  CreditCard,
  Settings,
  HelpCircle,
  ChevronLeft,
} from "lucide-react";
import { ROUTES } from "@/lib/constants/routes";
import { useAuthStore } from "@/stores/auth-store";

type SidebarItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const bottomItems: SidebarItem[] = [
  { label: "Cài đặt", href: ROUTES.ADMIN.SETTINGS, icon: Settings },
  { label: "Hỗ trợ", href: ROUTES.ADMIN.SUPPORT, icon: HelpCircle },
];

type AdminSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
};

export default function AdminSidebar({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { role } = useAuthStore();

  const navigationItems = React.useMemo((): SidebarItem[] => {
    const items: SidebarItem[] = [
      { label: "Tổng quan", href: ROUTES.ADMIN.DASHBOARD, icon: LayoutDashboard },
      {
        label: "Quản lý khóa học",
        href: ROUTES.ADMIN.COURSES,
        icon: GraduationCap,
      },
      {
        label: "Quản lý bài kiểm tra",
        href: ROUTES.ADMIN.ASSESSMENTS,
        icon: FileQuestion,
      },
      { label: "Quản lý bài viết", href: ROUTES.ADMIN.BLOG_POSTS, icon: FileText },
    ];

    if (role === "admin") {
      items.push(
        { label: "Quản lý người dùng", href: ROUTES.ADMIN.USERS, icon: Users },
        { label: "Quản lý đơn hàng", href: ROUTES.ADMIN.ORDERS, icon: ShoppingCart },
        { label: "Quản lý giao dịch", href: ROUTES.ADMIN.PAYMENT_TRANSACTIONS, icon: CreditCard }
      );
    }

    return items;
  }, [role]);

  return (
    <>
      {/* Backdrop overlay for mobile screen sizes when sidebar is toggled open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed left-0 top-0 h-screen bg-admin-deep border-r border-admin-border/30 flex flex-col py-6 z-50 text-admin-cream transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        {/* Brand logo & Close button */}
        <div className={`flex items-center mb-8 justify-between relative transition-all duration-300 ${isCollapsed ? "px-2" : "px-6"}`}>
          <div className="flex items-center overflow-hidden w-full relative h-10">
            {/* Collapsed HH Logo */}
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
              isCollapsed ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
            }`}>
              <h1 className="text-[20px] font-black text-admin-pink tracking-tighter font-serif select-none animate-pulse">
                HH
              </h1>
            </div>
            {/* Expanded Full Logo */}
            <div className={`transition-all duration-300 transform origin-left ${
              isCollapsed ? "opacity-0 scale-75 translate-x-4 pointer-events-none" : "opacity-100 scale-100 translate-x-0"
            }`}>
              <h1 className="text-[20px] font-bold text-admin-cream tracking-tight font-serif whitespace-nowrap">
                 HH <span className="text-admin-pink">Education</span>
              </h1>
              <p className="text-[10px] text-admin-muted font-semibold uppercase tracking-widest mt-0.5 whitespace-nowrap">
                Admin Terminal
              </p>
            </div>
          </div>
          {/* Close button inside sidebar on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-admin-muted hover:text-admin-pink hover:bg-admin-surface-low/50 transition-colors cursor-pointer"
            aria-label="Close Sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Main navigation tabs */}
        <nav className={`flex-1 space-y-1 transition-all duration-300 ${isCollapsed ? "px-2" : "px-3"}`}>
          {navigationItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className={`flex items-center rounded transition-all duration-300 overflow-hidden h-11 relative ${
                    isActive
                      ? "bg-admin-pink text-white shadow-lg shadow-admin-pink/20 font-bold"
                      : "text-admin-muted hover:text-admin-cream hover:bg-admin-surface-low/50"
                  }`}
                >
                  <div className={`flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isCollapsed ? "w-full" : "w-11"
                  }`}>
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-all duration-300 ${isActive ? "text-white" : "text-admin-muted"} group-hover:scale-110`}
                    />
                  </div>
                  <span
                    className={`text-[14px] whitespace-nowrap transition-all duration-300 ease-in-out origin-left absolute left-14 ${
                      isCollapsed
                        ? "opacity-0 -translate-x-4 pointer-events-none"
                        : "opacity-100 translate-x-0"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>

                {/* Tooltip on hover (only when collapsed) */}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-admin-deep border border-admin-border/40 text-admin-cream text-[11px] font-black rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[100] pointer-events-none select-none">
                    {item.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-admin-deep mr-[-1px]"></div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer navigation */}
        <div className={`mt-auto space-y-1 border-t border-admin-border/20 pt-4 transition-all duration-300 ${isCollapsed ? "px-2" : "px-3"}`}>
          {/* Toggle Collapse Button (Desktop only, positioned above settings/support footer items) */}
          <div className="hidden lg:block group relative mb-2">
            <button
              onClick={onToggleCollapse}
              className="flex items-center rounded transition-all duration-300 overflow-hidden h-11 relative w-full text-admin-muted hover:text-admin-cream hover:bg-admin-surface-low/50 cursor-pointer text-left"
              aria-label={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            >
              <div className={`flex items-center justify-center shrink-0 transition-all duration-300 ${
                isCollapsed ? "w-full" : "w-11"
              }`}>
                <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
              </div>
              <span
                className={`text-[14px] whitespace-nowrap transition-all duration-300 ease-in-out origin-left absolute left-14 ${
                  isCollapsed
                    ? "opacity-0 -translate-x-4 pointer-events-none"
                    : "opacity-100 translate-x-0"
                }`}
              >
                Thu gọn
              </span>
            </button>

            {/* Tooltip on hover (only when collapsed) */}
            {isCollapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-admin-deep border border-admin-border/40 text-admin-cream text-[11px] font-black rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[100] pointer-events-none select-none">
                Mở rộng
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-admin-deep mr-[-1px]"></div>
              </div>
            )}
          </div>

          {bottomItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className={`flex items-center rounded transition-all duration-300 overflow-hidden h-11 relative ${
                    isActive
                      ? "bg-admin-pink text-white font-bold"
                      : "text-admin-muted hover:text-admin-cream hover:bg-admin-surface-low/50"
                  }`}
                >
                  <div className={`flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isCollapsed ? "w-full" : "w-11"
                  }`}>
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-all duration-300 ${isActive ? "text-white" : "text-admin-muted"} group-hover:scale-110`}
                    />
                  </div>
                  <span
                    className={`text-[14px] whitespace-nowrap transition-all duration-300 ease-in-out origin-left absolute left-14 ${
                      isCollapsed
                        ? "opacity-0 -translate-x-4 pointer-events-none"
                        : "opacity-100 translate-x-0"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>

                {/* Tooltip on hover (only when collapsed) */}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-admin-deep border border-admin-border/40 text-admin-cream text-[11px] font-black rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[100] pointer-events-none select-none">
                    {item.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-admin-deep mr-[-1px]"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}


