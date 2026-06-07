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
};

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
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
        className={`fixed left-0 top-0 h-screen w-64 bg-admin-deep border-r border-admin-border/30 flex flex-col py-6 z-50 text-admin-cream transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand logo & Close button */}
        <div className="px-6 mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-[20px] font-bold text-admin-cream tracking-tight font-serif">
               HH <span className="text-admin-pink">Education</span>
            </h1>
            <p className="text-[10px] text-admin-muted font-semibold uppercase tracking-widest mt-0.5">
              Admin Terminal
            </p>
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
        <nav className="flex-1 space-y-1 px-3">
          {navigationItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded transition-all duration-200 ${
                  isActive
                    ? "bg-admin-pink text-white shadow-lg shadow-admin-pink/20 font-bold"
                    : "text-admin-muted hover:text-admin-cream hover:bg-admin-surface-low/50"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? "text-white" : "text-admin-muted"}`}
                />
                <span className="text-[14px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer navigation */}
        <div className="mt-auto space-y-1 border-t border-admin-border/20 pt-4 px-3">
          {bottomItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded transition-colors ${
                  isActive
                    ? "bg-admin-pink text-white font-bold"
                    : "text-admin-muted hover:text-admin-cream"
                }`}
              >
                <Icon className="w-5 h-5 text-admin-muted" />
                <span className="text-[14px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}

