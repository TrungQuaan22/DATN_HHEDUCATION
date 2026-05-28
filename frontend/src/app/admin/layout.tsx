'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import AdminSidebar from '@/features/admin/components/admin-sidebar';
import AdminHeader from '@/features/admin/components/admin-header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setTokens, setUser } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Auto-seed admin session for development if not logged in
    if (!isAuthenticated) {
      setTokens({
        accessToken: 'mock-admin-token',
        refreshToken: 'mock-admin-refresh-token',
      });
      setUser({
        id: 'admin-id-123',
        email: 'admin@hheducation.com',
        fullName: 'Admin HH',
        avatarMediaId: null,
        avatarUrl: null,
        role: 'admin',
        status: 'active',
      });
    }
  }, [isAuthenticated, setTokens, setUser]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-admin-bg text-admin-cream font-sans">
      <AdminSidebar />
      <div className="flex flex-col min-h-screen">
        <AdminHeader />
        <main className="ml-64 mt-16 p-6 md:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
