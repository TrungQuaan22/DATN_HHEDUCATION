'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import AdminSidebar from '@/components/layout/admin-sidebar';
import AdminHeader from '@/components/layout/admin-header';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, role, hasHydrated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("admin-sidebar-collapsed");
      setIsSidebarCollapsed(stored === "true");
    }
  }, []);

  const handleToggleCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("admin-sidebar-collapsed", String(next));
      return next;
    });
  };

  useEffect(() => {
    if (mounted && hasHydrated && (!isAuthenticated || (role !== 'admin' && role !== 'teacher'))) {
      router.push('/login');
    }
  }, [mounted, hasHydrated, isAuthenticated, role, router]);

  if (!mounted || !hasHydrated) return null;

  if (!isAuthenticated || (role !== 'admin' && role !== 'teacher')) {
    return (
      <div className="min-h-screen bg-admin-bg flex items-center justify-center text-admin-cream font-sans">
        <p className="animate-pulse">Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-admin-bg text-admin-cream font-sans">
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />
      <div className="flex flex-col min-h-screen min-w-0">
        <AdminHeader
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        <main className={`ml-0 mt-16 p-4 md:p-6 lg:p-8 flex-1 min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}>
          {children}
        </main>
      </div>
    </div>
  );
}
