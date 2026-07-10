"use client";

import React from "react";
import Link from "next/link";
import { User, LogOut } from "lucide-react";

interface SiteMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isActive: (path: string) => boolean;
  isAuthenticated: boolean;
  user: any;
  clearSession: () => void;
}

export default function SiteMobileMenu({
  isOpen,
  onClose,
  isActive,
  isAuthenticated,
  user,
  clearSession,
}: SiteMobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-20 left-0 w-full bg-brand-dark border-b border-deep-black py-4 px-6 md:hidden flex flex-col gap-4 shadow-l4 animate-in fade-in slide-in-from-top-5 duration-200">
      <Link
        href="/"
        onClick={onClose}
        className={`text-sm font-medium transition-colors ${
          isActive("/") ? "text-brand-pink" : "text-cream hover:text-brand-pink"
        }`}
      >
        Home
      </Link>
      <Link
        href="/courses"
        onClick={onClose}
        className={`text-sm font-medium transition-colors ${
          isActive("/courses")
            ? "text-brand-pink"
            : "text-cream hover:text-brand-pink"
        }`}
      >
        Courses
      </Link>
      <Link
        href="/practice"
        onClick={onClose}
        className={`text-sm font-medium transition-colors ${
          isActive("/practice")
            ? "text-brand-pink"
            : "text-cream hover:text-brand-pink"
        }`}
      >
        Thi Thử
      </Link>
      <Link
        href="/blog"
        onClick={onClose}
        className={`text-sm font-medium transition-colors ${
          isActive("/blog")
            ? "text-brand-pink"
            : "text-cream hover:text-brand-pink"
        }`}
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
                <p className="text-xs text-muted-text truncate">
                  {user?.email || "hocsinh@hheducation.com"}
                </p>
              </div>
            </div>
            <Link
              href="/student"
              onClick={onClose}
              className="bg-brand-pink text-brand-dark px-3 py-2.5 rounded-md text-center text-sm font-bold"
            >
              Vào học
            </Link>
            <Link
              href="/student/profile"
              onClick={onClose}
              className="text-cream text-center py-1.5 text-sm font-semibold flex items-center justify-center gap-1.5 hover:text-brand-pink transition-colors"
            >
              <User size={15} />
              Thông tin cá nhân
            </Link>
            <button
              onClick={() => {
                clearSession();
                onClose();
              }}
              className="text-red-400 text-center py-1.5 text-sm font-semibold flex items-center justify-center gap-1.5 hover:text-red-300 transition-colors cursor-pointer"
            >
              <LogOut size={15} />
              Đăng xuất
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              onClick={onClose}
              className="text-cream text-center py-2 text-sm font-semibold hover:text-brand-pink transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              onClick={onClose}
              className="bg-brand-pink text-white py-2.5 rounded-md text-center text-sm font-semibold"
            >
              Enroll Now
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
