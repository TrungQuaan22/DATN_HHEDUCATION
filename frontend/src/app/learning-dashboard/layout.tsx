"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import {
  Menu,
  X,
  Sun,
  Moon,
  Bell,
  User,
  LogOut,
  Layout,
  BookOpen,
  Award,
  Sparkles,
  Home,
  ChevronRight
} from "lucide-react";

export default function LearningDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, clearSession } = useAuthStore();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Sync theme state with DOM
  useEffect(() => {
    const isLight = document.documentElement.classList.contains("light");
    setTheme(isLight ? "light" : "dark");
  }, []);

  // Dropdown closing handler
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".profile-dropdown-container")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    if (newTheme === "light") {
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <p className="text-muted-text animate-pulse">Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  // Mock Notification list
  const mockNotifications = [
    { id: 1, title: "Kiểm tra giữa kỳ Ngữ Văn sắp mở", time: "Còn 2 ngày", unread: true },
    { id: 2, title: "Bài viết blog mới: Cách phân tích văn xuôi", time: "Hôm nay", unread: false },
    { id: 3, title: "Giáo viên đã chấm bài tập Luyện viết", time: "Hôm qua", unread: false },
  ];

  // Helper for Vietnamese role mapping
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

  // Helper to check active route
  const isActive = (path: string) => {
    if (path === "/learning-dashboard") {
      return pathname === "/learning-dashboard" || pathname === "/learning-dashboard/overview";
    }
    return pathname.startsWith(path);
  };

  // Get active breadcrumb name
  const getBreadcrumbName = () => {
    if (pathname === "/learning-dashboard" || pathname === "/learning-dashboard/overview") return "Tổng quan";
    if (pathname.startsWith("/learning-dashboard/courses")) return "Khóa học của tôi";
    if (pathname.startsWith("/learning-dashboard/assessments")) return "Bài kiểm tra";
    if (pathname.startsWith("/learning-dashboard/practice")) return "Phòng luyện tập";
    return "Tổng quan";
  };

  return (
    <div className="min-h-screen bg-brand-dark text-cream flex font-sans transition-colors duration-200">
      
      {/* -------------------- SIDEBAR -------------------- */}
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-[260px] bg-deep-black border-r border-border-dark z-30">
        {/* Brand Logo Header */}
        <div className="px-6 py-6 border-b border-border-dark/50 flex flex-col gap-1.5">
          <Link href="/" className="text-xl font-bold text-cream tracking-tight hover:opacity-90">
            HH <span className="text-brand-pink font-extrabold">Education</span>
          </Link>
          <span className="text-xs font-semibold text-brand-pink bg-brand-pink/10 px-2 py-0.5 rounded-full w-fit">
            {getRoleLabel(user?.role)}
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-grow px-4 py-6 space-y-1">
          <Link
            href="/learning-dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              isActive("/learning-dashboard") && (pathname === "/learning-dashboard" || pathname.endsWith("overview"))
                ? "bg-brand-pink text-brand-dark shadow-l2 scale-[1.02]"
                : "text-cream hover:bg-surface-input hover:text-brand-pink"
            }`}
          >
            <Layout size={18} />
            Overview
          </Link>
          <Link
            href="/learning-dashboard/courses"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              isActive("/learning-dashboard/courses")
                ? "bg-brand-pink text-brand-dark shadow-l2 scale-[1.02]"
                : "text-cream hover:bg-surface-input hover:text-brand-pink"
            }`}
          >
            <BookOpen size={18} />
            My Courses
          </Link>
          <Link
            href="/learning-dashboard/assessments"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              isActive("/learning-dashboard/assessments")
                ? "bg-brand-pink text-brand-dark shadow-l2 scale-[1.02]"
                : "text-cream hover:bg-surface-input hover:text-brand-pink"
            }`}
          >
            <Award size={18} />
            Assessments
          </Link>
          <Link
            href="/learning-dashboard/practice"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              isActive("/learning-dashboard/practice")
                ? "bg-brand-pink text-brand-dark shadow-l2 scale-[1.02]"
                : "text-cream hover:bg-surface-input hover:text-brand-pink"
            }`}
          >
            <Sparkles size={18} />
            Practice Room
          </Link>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border-dark/50 space-y-4">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-border-dark bg-surface-input text-sm font-semibold text-cream hover:border-brand-pink hover:text-brand-pink transition-all active:scale-95"
          >
            <Home size={15} />
            Trở về trang chủ
          </Link>
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full border border-brand-pink/30 overflow-hidden bg-brand-dark">
              <img
                alt="Avatar"
                className="w-full h-full object-cover"
                src={user?.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuAGuA46dM9ofJOmtVCw4AMz8_whqj-2oCYdfE_v3mqHdlFmalFobUoD7sVror_gmNvr7HU2ruEqEghBfMiyTX9nRBNpBqhJX_GEx6KVLiEqu88W8TVbu1T2F03bshwyMWzPgOHMt9sh-5uOHlO_t2xK92c8WJHzkt_c0wwco1GuSUaWysUMin6PwpnDkru6nZT880_hkN7dKnKyA2IA0CgvZIepP9zEL6vFSovA_FwlsSqTJzFuhyBw2RHdY5ao61-Tgemu4OUWzY0"}
              />
            </div>
            <div className="truncate flex-grow">
              <p className="text-xs font-bold text-cream truncate">{user?.fullName || "Nguyễn Văn A"}</p>
              <p className="text-xs text-muted-text uppercase font-semibold mt-0.5">{getRoleLabel(user?.role)}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Sidebar Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Mobile Drawer Panel */}
      <aside
        className={`fixed left-0 top-0 h-full w-[260px] bg-deep-black border-r border-border-dark z-50 flex flex-col md:hidden transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 py-6 border-b border-border-dark/50 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-cream tracking-tight">
            HH <span className="text-brand-pink font-extrabold">Education</span>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="text-cream hover:text-brand-pink">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-grow px-4 py-6 space-y-1">
          <Link
            href="/learning-dashboard"
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              isActive("/learning-dashboard") && (pathname === "/learning-dashboard" || pathname.endsWith("overview"))
                ? "bg-brand-pink text-brand-dark"
                : "text-cream hover:bg-surface-input hover:text-brand-pink"
            }`}
          >
            <Layout size={18} />
            Overview
          </Link>
          <Link
            href="/learning-dashboard/courses"
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              isActive("/learning-dashboard/courses")
                ? "bg-brand-pink text-brand-dark"
                : "text-cream hover:bg-surface-input hover:text-brand-pink"
            }`}
          >
            <BookOpen size={18} />
            My Courses
          </Link>
          <Link
            href="/learning-dashboard/assessments"
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              isActive("/learning-dashboard/assessments")
                ? "bg-brand-pink text-brand-dark"
                : "text-cream hover:bg-surface-input hover:text-brand-pink"
            }`}
          >
            <Award size={18} />
            Assessments
          </Link>
          <Link
            href="/learning-dashboard/practice"
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              isActive("/learning-dashboard/practice")
                ? "bg-brand-pink text-brand-dark"
                : "text-cream hover:bg-surface-input hover:text-brand-pink"
            }`}
          >
            <Sparkles size={18} />
            Practice Room
          </Link>
        </nav>

        <div className="p-4 border-t border-border-dark/50 space-y-4">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-border-dark bg-surface-input text-sm font-semibold text-cream"
          >
            <Home size={15} />
            Trở về trang chủ
          </Link>
          <div className="flex items-center gap-3 px-2">
            <img
              alt="Avatar"
              className="w-9 h-9 rounded-full border border-brand-pink/30 object-cover bg-brand-dark"
              src={user?.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuAGuA46dM9ofJOmtVCw4AMz8_whqj-2oCYdfE_v3mqHdlFmalFobUoD7sVror_gmNvr7HU2ruEqEghBfMiyTX9nRBNpBqhJX_GEx6KVLiEqu88W8TVbu1T2F03bshwyMWzPgOHMt9sh-5uOHlO_t2xK92c8WJHzkt_c0wwco1GuSUaWysUMin6PwpnDkru6nZT880_hkN7dKnKyA2IA0CgvZIepP9zEL6vFSovA_FwlsSqTJzFuhyBw2RHdY5ao61-Tgemu4OUWzY0"}
            />
            <div className="truncate">
              <p className="text-xs font-bold text-cream truncate">{user?.fullName || "Nguyễn Văn A"}</p>
              <p className="text-xs text-muted-text uppercase font-semibold">{getRoleLabel(user?.role)}</p>
            </div>
          </div>
        </div>
      </aside>

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
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-muted-text">
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
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-lg flex items-center justify-center border border-border-dark bg-surface-input text-cream hover:text-brand-pink hover:border-brand-pink transition-all active:scale-95 cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notification Bell Icon */}
            <div className="relative group">
              <button
                className="w-10 h-10 rounded-lg flex items-center justify-center border border-border-dark bg-surface-input text-cream hover:text-brand-pink hover:border-brand-pink transition-all active:scale-95 cursor-pointer"
                aria-label="Notifications"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-brand-pink rounded-full shadow-l1" />
              </button>
              
              {/* Simple dropdown hover notifications */}
              <div className="absolute right-0 mt-2.5 w-72 rounded-xl border border-border-dark bg-brand-dark shadow-l4 py-2 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all z-50">
                <div className="px-4 py-1.5 border-b border-border-dark/40 flex justify-between items-center">
                  <span className="text-xs font-bold text-cream">Thông báo mới</span>
                  <span className="text-xs text-brand-pink cursor-pointer font-semibold">Đánh dấu tất cả đã đọc</span>
                </div>
                <div className="p-1 space-y-1">
                  {mockNotifications.map((n) => (
                    <div key={n.id} className="p-2 rounded-lg hover:bg-surface-input transition-colors flex flex-col gap-0.5 cursor-pointer">
                      <div className="flex items-center gap-1.5">
                        {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-brand-pink shrink-0" />}
                        <p className="text-xs font-bold text-cream truncate">{n.title}</p>
                      </div>
                      <span className="text-xs text-muted-text pl-3">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* User Dropdown */}
            <div className="relative profile-dropdown-container">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-brand-pink/50 overflow-hidden hover:border-brand-pink transition-all cursor-pointer"
              >
                <img
                  alt="Avatar"
                  className="w-full h-full object-cover bg-brand-dark"
                  src={user?.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuAGuA46dM9ofJOmtVCw4AMz8_whqj-2oCYdfE_v3mqHdlFmalFobUoD7sVror_gmNvr7HU2ruEqEghBfMiyTX9nRBNpBqhJX_GEx6KVLiEqu88W8TVbu1T2F03bshwyMWzPgOHMt9sh-5uOHlO_t2xK92c8WJHzkt_c0wwco1GuSUaWysUMin6PwpnDkru6nZT880_hkN7dKnKyA2IA0CgvZIepP9zEL6vFSovA_FwlsSqTJzFuhyBw2RHdY5ao61-Tgemu4OUWzY0"}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-56 rounded-xl border border-border-dark bg-brand-dark shadow-l4 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-border-dark/40">
                    <p className="text-sm font-bold text-cream truncate">{user?.fullName || "Nguyễn Văn A"}</p>
                    <p className="text-xs text-muted-text truncate mt-0.5">{user?.email || "hocsinh@hheducation.com"}</p>
                  </div>
                  <div className="p-1">
                    <Link
                      href="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-cream hover:bg-surface-input hover:text-brand-pink transition-colors cursor-pointer"
                    >
                      <User size={15} />
                      Cập nhật thông tin cá nhân
                    </Link>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        clearSession();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
                    >
                      <LogOut size={15} />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
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
