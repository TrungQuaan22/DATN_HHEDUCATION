"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useMeQuery } from "@/features/auth/hooks";
import { useCartStore } from "@/stores/cart-store";
import { Menu, ShoppingCart } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { ThemeToggle } from "./theme-toggle";
import { NotificationBell } from "./notification-bell";
import { UserDropdown } from "./user-dropdown";
import SiteNavLinks from "./site-nav-links";
import SiteMobileMenu from "./site-mobile-menu";

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, clearSession } = useAuthStore();
  const { data: user } = useMeQuery();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted && isAuthenticated && (user?.role === "admin" || user?.role === "teacher")) {
      router.push("/admin");
    }
  }, [mounted, isAuthenticated, user?.role, router]);

  const items = useCartStore((state) => state.items);
  const itemCount = mounted ? items.length : 0;

  const isActive = useCallback(
    (path: string) => {
      if (path === "/") {
        return pathname === "/";
      }
      return pathname.startsWith(path);
    },
    [pathname]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 bg-brand-dark/90 backdrop-blur-md border-b border-deep-black transition-all duration-300 h-20">
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-12 items-center h-full">
        {/* Logo */}
        <div className="col-span-6 md:col-span-3">
          <Link
            href="/"
            className="text-2xl font-bold text-cream tracking-tight"
          >
            HH <span className="text-brand-pink font-extrabold">Education</span>
          </Link>
        </div>

        {/* Navigation Links (Desktop) */}
        <div className="col-span-6 hidden md:block">
          <SiteNavLinks isActive={isActive} />
        </div>

        {/* Buttons/Profile */}
        <div className="col-span-6 md:col-span-3 flex items-center justify-end gap-3 md:gap-4">
          {/* Theme Toggle Button */}
          <ThemeToggle className="w-10 h-10 rounded-lg flex items-center justify-center border border-border-dark bg-surface-input text-cream hover:text-brand-pink hover:border-brand-pink transition-all active:scale-95 cursor-pointer" />

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative w-10 h-10 rounded-lg flex items-center justify-center border border-border-dark bg-surface-input text-cream hover:text-brand-pink hover:border-brand-pink transition-all active:scale-95 cursor-pointer"
            aria-label="Giỏ hàng"
          >
            <ShoppingCart size={18} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-brand-pink text-brand-dark rounded-full flex items-center justify-center text-xs font-extrabold shadow-l1 animate-in zoom-in duration-200">
                {itemCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              {/* Notification Icon */}
              <NotificationBell className="relative min-w-10 h-10 rounded-lg flex items-center justify-center border border-border-dark bg-surface-input text-cream hover:text-brand-pink hover:border-brand-pink transition-all active:scale-95 cursor-pointer" />

              <Link
                href="/student"
                className="bg-brand-pink text-brand-dark px-3 py-2.5 rounded-md text-sm font-bold shadow-l1 hover:scale-105 active:scale-95 transition-all min-w-fit"
              >
                Vào học
              </Link>

              {/* Profile dropdown container */}
              <UserDropdown sizeClassName="w-10 h-10" />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-cream hover:text-brand-pink text-sm font-medium transition-colors hidden lg:block cursor-pointer"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-brand-pink text-white px-5 py-2.5 rounded-md text-sm font-semibold shadow-l1 hover:scale-105 active:scale-95 transition-all"
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

      <SiteMobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isActive={isActive}
        isAuthenticated={isAuthenticated}
        user={user}
        clearSession={clearSession}
      />
    </nav>
  );
}
