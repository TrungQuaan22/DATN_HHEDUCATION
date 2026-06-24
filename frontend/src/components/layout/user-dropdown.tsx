"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useMeQuery } from "@/features/auth/hooks";
import { User, LogOut } from "lucide-react";

interface UserDropdownProps {
  isAdmin?: boolean;
  sizeClassName?: string;
  className?: string;
}

export function UserDropdown({
  isAdmin = false,
  sizeClassName = "w-10 h-10",
  className = "",
}: UserDropdownProps) {
  const router = useRouter();
  const { clearSession } = useAuthStore();
  const { data: user } = useMeQuery();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);

  // Reset image error state when avatarUrl changes
  useEffect(() => {
    setImageError(false);
  }, [user?.avatarUrl]);

  // Click outside detection
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    clearSession();
    // Force direct redirect to ensure clean auth state reload
    window.location.href = "/login";
  };

  // Define style mappings based on isAdmin status
  const profileLink = isAdmin ? "/admin/settings" : "/profile";
  
  const triggerButtonClasses = isAdmin
    ? `rounded-full border-2 border-admin-pink overflow-hidden hover:opacity-85 transition-all cursor-pointer bg-admin-surface-low flex items-center justify-center ${sizeClassName}`
    : `flex items-center justify-center rounded-full border-2 border-brand-pink/50 overflow-hidden hover:border-brand-pink transition-all cursor-pointer ${sizeClassName}`;

  const dropdownContainerClasses = isAdmin
    ? "absolute right-0 top-12 mt-2 w-56 rounded border border-admin-border/30 bg-admin-deep shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-admin-cream"
    : "absolute right-0 mt-2.5 w-56 rounded border border-border-dark bg-brand-dark shadow-l4 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-cream";

  const headerBorderClasses = isAdmin
    ? "px-4 py-2 border-b border-admin-border/20"
    : "px-4 py-2 border-b border-border-dark/40";

  const nameTextClasses = isAdmin
    ? "text-sm font-bold text-admin-cream truncate"
    : "text-sm font-bold text-cream truncate";

  const emailTextClasses = isAdmin
    ? "text-xs text-admin-muted truncate mt-0.5"
    : "text-xs text-muted-text truncate mt-0.5";

  const linkItemClasses = isAdmin
    ? "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-admin-surface-low hover:text-admin-pink transition-colors cursor-pointer"
    : "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-cream hover:bg-surface-input hover:text-brand-pink transition-colors cursor-pointer";

  const logoutButtonClasses = isAdmin
    ? "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
    : "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer text-left";

  return (
    <div
      ref={dropdownRef}
      className={`relative shrink-0 ${isAdmin ? "admin-profile-dropdown-container" : "profile-dropdown-container"} ${className}`}
    >
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={triggerButtonClasses}
        title="Tài khoản"
        type="button"
      >
        {!user?.avatarUrl || imageError ? (
          <div className={`w-full h-full flex items-center justify-center ${isAdmin ? "bg-admin-pink/15 text-admin-pink" : "bg-brand-pink/15 text-brand-pink"}`}>
            <User size={18} />
          </div>
        ) : (
          <img
            alt="Profile Avatar"
            className="w-full h-full object-cover bg-brand-dark"
            src={user.avatarUrl}
            onError={() => setImageError(true)}
          />
        )}
      </button>

      {isDropdownOpen && (
        <div className={dropdownContainerClasses}>
          <div className={headerBorderClasses}>
            <p className={nameTextClasses}>
              {user?.fullName || (isAdmin ? "Quản trị viên HH" : "Học sinh HH")}
            </p>
            <p className={emailTextClasses}>
              {user?.email || (isAdmin ? "admin@hheducation.com" : "hocsinh@hheducation.com")}
            </p>
          </div>
          <div className="p-1">
            <Link
              href={profileLink}
              onClick={() => setIsDropdownOpen(false)}
              className={linkItemClasses}
            >
              <User size={15} />
              Cập nhật thông tin cá nhân
            </Link>
            <button
              onClick={handleLogout}
              className={logoutButtonClasses}
              type="button"
            >
              <LogOut size={15} />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
