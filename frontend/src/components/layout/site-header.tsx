"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Menu, X, Sun, Moon, Bell, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";

export default function SiteHeader() {
  const pathname = usePathname();
  const { isAuthenticated, user, setTokens, clearSession } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const isLight = document.documentElement.classList.contains("light");
    setTheme(isLight ? "light" : "dark");
  }, []);

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

  const toggleLoginState = () => {
    if (isAuthenticated) {
      clearSession();
    } else {
      setTokens({
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
      });
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-brand-dark/90 backdrop-blur-md border-b border-deep-black transition-all duration-300 h-20">
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-12 items-center h-full">
        {/* Logo */}
        <div className="col-span-6 md:col-span-3">
          <Link
            href="/"
            className="text-[24px] font-bold text-cream tracking-tight"
          >
            HH <span className="text-brand-pink font-extrabold">Education</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="col-span-6 hidden md:flex items-center justify-center gap-10">
          <Link
            href="/"
            className="text-[14px] font-medium text-brand-pink border-b-2 border-brand-pink pb-1"
          >
            Home
          </Link>
          <Link
            href="/courses"
            className="text-[14px] font-medium text-cream hover:text-brand-pink transition-colors"
          >
            Courses
          </Link>
          <Link
            href="#teachers"
            className="text-[14px] font-medium text-cream hover:text-brand-pink transition-colors"
          >
            Teachers
          </Link>
          <Link
            href="#blog"
            className="text-[14px] font-medium text-cream hover:text-brand-pink transition-colors"
          >
            Blog
          </Link>
        </div>

        {/* Buttons/Profile */}
        <div className="col-span-6 md:col-span-3 flex items-center justify-end gap-3 md:gap-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-lg flex items-center justify-center border border-border-dark bg-surface-input text-cream hover:text-brand-pink hover:border-brand-pink transition-all active:scale-95 cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              {/* Notification Icon */}
              <button
                className="relative w-10 h-10 rounded-lg flex items-center justify-center border border-border-dark bg-surface-input text-cream hover:text-brand-pink hover:border-brand-pink transition-all active:scale-95 cursor-pointer"
                aria-label="Notifications"
              >
                <Bell size={18} />
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-brand-pink text-brand-dark rounded-full flex items-center justify-center text-[10px] font-extrabold shadow-l1">
                  2
                </span>
              </button>

              <Link
                href="/learning-dashboard"
                className="bg-brand-pink text-brand-dark px-3 py-2.5 rounded-md text-[14px] font-bold shadow-l1 hover:scale-105 active:scale-95 transition-all"
              >
                Bắt đầu học
              </Link>

              {/* Profile dropdown container */}
              <div className="relative profile-dropdown-container">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-brand-pink overflow-hidden hover:opacity-85 transition-all cursor-pointer"
                  title="Tài khoản"
                >
                  <img
                    alt="Profile"
                    className="w-full h-full object-cover"
                    src={
                      user?.avatarUrl ||
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuAGuA46dM9ofJOmtVCw4AMz8_whqj-2oCYdfE_v3mqHdlFmalFobUoD7sVror_gmNvr7HU2ruEqEghBfMiyTX9nRBNpBqhJX_GEx6KVLiEqu88W8TVbu1T2F03bshwyMWzPgOHMt9sh-5uOHlO_t2xK92c8WJHzkt_c0wwco1GuSUaWysUMin6PwpnDkru6nZT880_hkN7dKnKyA2IA0CgvZIepP9zEL6vFSovA_FwlsSqTJzFuhyBw2RHdY5ao61-Tgemu4OUWzY0"
                    }
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-56 rounded-xl border border-border-dark bg-brand-dark shadow-l4 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-border-dark/40">
                      <p className="text-sm font-bold text-cream truncate">
                        {user?.fullName || "Học sinh HH"}
                      </p>
                      <p className="text-xs text-muted-text truncate mt-0.5">
                        {user?.email || "hocsinh@hheducation.com"}
                      </p>
                    </div>
                    <div className="p-1">
                      <Link
                        href="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-cream hover:bg-surface-input hover:text-brand-pink transition-colors cursor-pointer"
                      >
                        <User size={15} />
                        Cập nhật thông tin cá nhân
                      </Link>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          clearSession();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
                      >
                        <LogOut size={15} />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={toggleLoginState}
                className="text-cream hover:text-brand-pink text-[14px] font-medium transition-colors hidden lg:block cursor-pointer"
              >
                Sign In
              </button>
              <Link
                href="/register"
                className="bg-brand-pink text-white px-5 py-2.5 rounded-md text-[14px] font-semibold shadow-l1 hover:scale-105 active:scale-95 transition-all"
              >
                Enroll Now
              </Link>
            </div>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-cream hover:text-brand-pink cursor-pointer"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-20 left-0 w-full bg-brand-dark border-b border-deep-black py-4 px-6 md:hidden flex flex-col gap-4 shadow-l4 animate-in fade-in slide-in-from-top-5 duration-200">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-sm font-medium text-cream hover:text-brand-pink transition-colors"
          >
            Home
          </Link>
          <Link
            href="/courses"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-sm font-medium text-cream hover:text-brand-pink transition-colors"
          >
            Courses
          </Link>
          <Link
            href="#teachers"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-sm font-medium text-cream hover:text-brand-pink transition-colors"
          >
            Teachers
          </Link>
          <Link
            href="#blog"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-sm font-medium text-cream hover:text-brand-pink transition-colors"
          >
            Blog
          </Link>
          <div className="h-px bg-deep-black w-full" />
          <div className="flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-2 py-1">
                  <img
                    alt="Profile"
                    className="w-9 h-9 rounded-full border border-brand-pink object-cover"
                    src={
                      user?.avatarUrl ||
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuAGuA46dM9ofJOmtVCw4AMz8_whqj-2oCYdfE_v3mqHdlFmalFobUoD7sVror_gmNvr7HU2ruEqEghBfMiyTX9nRBNpBqhJX_GEx6KVLiEqu88W8TVbu1T2F03bshwyMWzPgOHMt9sh-5uOHlO_t2xK92c8WJHzkt_c0wwco1GuSUaWysUMin6PwpnDkru6nZT880_hkN7dKnKyA2IA0CgvZIepP9zEL6vFSovA_FwlsSqTJzFuhyBw2RHdY5ao61-Tgemu4OUWzY0"
                    }
                  />
                  <div>
                    <p className="text-sm font-bold text-cream truncate">
                      {user?.fullName || "Học sinh HH"}
                    </p>
                    <p className="text-[11px] text-muted-text truncate">
                      {user?.email || "hocsinh@hheducation.com"}
                    </p>
                  </div>
                </div>
                <Link
                  href="/learning-dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-brand-pink text-brand-dark px-3 py-2.5 rounded-md text-center text-sm font-bold"
                >
                  Bắt đầu học
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-cream text-center py-1.5 text-sm font-semibold flex items-center justify-center gap-1.5 hover:text-brand-pink transition-colors"
                >
                  <User size={15} />
                  Thông tin cá nhân
                </Link>
                <button
                  onClick={() => {
                    clearSession();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-red-400 text-center py-1.5 text-sm font-semibold flex items-center justify-center gap-1.5 hover:text-red-300 transition-colors"
                >
                  <LogOut size={15} />
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    toggleLoginState();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-cream text-center py-2 text-sm font-semibold"
                >
                  Sign In
                </button>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-brand-pink text-white py-2.5 rounded-md text-center text-sm font-semibold"
                >
                  Enroll Now
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

