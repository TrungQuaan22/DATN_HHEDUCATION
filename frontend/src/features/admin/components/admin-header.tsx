'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { Sun, Moon, Bell, Search, User, LogOut } from 'lucide-react';

export default function AdminHeader() {
  const { user, clearSession } = useAuthStore();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const isLight = document.documentElement.classList.contains('light');
    setTheme(isLight ? 'light' : 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.admin-profile-dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-admin-deep border-b border-admin-border/30 flex justify-between items-center px-8 z-40 text-admin-cream">
      {/* Search box */}
      <div className="flex items-center gap-4 w-1/3">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted group-focus-within:text-admin-pink w-4 h-4 transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm hệ thống..."
            className="w-full bg-admin-surface-low border border-admin-border/30 rounded-xl pl-10 pr-4 py-2 text-[14px] text-admin-cream placeholder:text-admin-muted/50 focus:border-admin-pink focus:outline-none focus:ring-1 focus:ring-admin-pink transition-all"
          />
        </div>
      </div>

      {/* Action buttons & profile */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg flex items-center justify-center border border-admin-border/30 bg-admin-surface-low text-admin-muted hover:text-admin-pink hover:border-admin-pink transition-all active:scale-95 cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Notifications */}
          <button
            className="relative w-9 h-9 rounded-lg flex items-center justify-center border border-admin-border/30 bg-admin-surface-low text-admin-muted hover:text-admin-pink hover:border-admin-pink transition-all active:scale-95 cursor-pointer"
            aria-label="Notifications"
          >
            <Bell size={16} />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-admin-pink rounded-full"></span>
          </button>
        </div>

        {/* Vertical divider */}
        <div className="h-8 w-px bg-admin-border/20"></div>

        {/* Profile info & Dropdown */}
        <div className="flex items-center gap-3 relative admin-profile-dropdown-container">
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-bold text-admin-cream leading-tight">
              {user?.fullName || 'Quản trị viên HH'}
            </p>
            <p className="text-[10px] text-admin-pink uppercase font-semibold tracking-wider">
              {user?.role === 'admin' ? 'Super Administrator' : 'Instructor'}
            </p>
          </div>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-10 h-10 rounded-full border-2 border-admin-pink overflow-hidden hover:opacity-85 transition-all cursor-pointer bg-admin-surface-low flex items-center justify-center"
          >
            <img
              alt="Profile"
              className="w-full h-full object-cover"
              src={
                user?.avatarUrl ||
                'https://lh3.googleusercontent.com/aida-public/AB6AXuAGuA46dM9ofJOmtVCw4AMz8_whqj-2oCYdfE_v3mqHdlFmalFobUoD7sVror_gmNvr7HU2ruEqEghBfMiyTX9nRBNpBqhJX_GEx6KVLiEqu88W8TVbu1T2F03bshwyMWzPgOHMt9sh-5uOHlO_t2xK92c8WJHzkt_c0wwco1GuSUaWysUMin6PwpnDkru6nZT880_hkN7dKnKyA2IA0CgvZIepP9zEL6vFSovA_FwlsSqTJzFuhyBw2RHdY5ao61-Tgemu4OUWzY0'
              }
              onError={(e) => {
                e.currentTarget.src = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGuA46dM9ofJOmtVCw4AMz8_whqj-2oCYdfE_v3mqHdlFmalFobUoD7sVror_gmNvr7HU2ruEqEghBfMiyTX9nRBNpBqhJX_GEx6KVLiEqu88W8TVbu1T2F03bshwyMWzPgOHMt9sh-5uOHlO_t2xK92c8WJHzkt_c0wwco1GuSUaWysUMin6PwpnDkru6nZT880_hkN7dKnKyA2IA0CgvZIepP9zEL6vFSovA_FwlsSqTJzFuhyBw2RHdY5ao61-Tgemu4OUWzY0';
              }}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-12 mt-2 w-56 rounded-xl border border-admin-border/30 bg-admin-deep shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-admin-cream">
              <div className="px-4 py-2 border-b border-admin-border/20">
                <p className="text-sm font-bold text-admin-cream truncate">
                  {user?.fullName || 'Quản trị viên HH'}
                </p>
                <p className="text-xs text-admin-muted truncate mt-0.5">
                  {user?.email || 'admin@hheducation.com'}
                </p>
              </div>
              <div className="p-1">
                <Link
                  href="/admin/settings"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium hover:bg-admin-surface-low hover:text-admin-pink transition-colors cursor-pointer"
                >
                  <User size={15} />
                  Thông tin cá nhân
                </Link>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    clearSession();
                    window.location.href = '/login';
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
    </header>
  );
}
