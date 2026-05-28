'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  GraduationCap, 
  FileQuestion, 
  FileText, 
  Users, 
  ShoppingCart, 
  Settings, 
  HelpCircle 
} from 'lucide-react';

type SidebarItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navigationItems: SidebarItem[] = [
  { label: 'Tổng quan', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Quản lý khóa học', href: '/admin/courses', icon: GraduationCap },
  { label: 'Quản lý bài kiểm tra', href: '/admin/assessments', icon: FileQuestion },
  { label: 'Quản lý bài viết', href: '/admin/blogs', icon: FileText },
  { label: 'Quản lý người dùng', href: '/admin/users', icon: Users },
  { label: 'Quản lý đơn hàng', href: '/admin/orders', icon: ShoppingCart },
];

const bottomItems: SidebarItem[] = [
  { label: 'Cài đặt', href: '/admin/settings', icon: Settings },
  { label: 'Hỗ trợ', href: '/admin/support', icon: HelpCircle },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-admin-deep border-r border-admin-border/30 flex flex-col py-6 z-50 text-admin-cream">
      {/* Brand logo */}
      <div className="px-6 mb-8">
        <h1 className="text-[20px] font-bold text-admin-cream tracking-tight font-serif">
          HH <span className="text-admin-pink">Education</span>
        </h1>
        <p className="text-[10px] text-admin-muted font-semibold uppercase tracking-widest mt-0.5">
          Admin Terminal
        </p>
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
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-admin-pink text-white shadow-lg shadow-admin-pink/20 font-bold'
                  : 'text-admin-muted hover:text-admin-cream hover:bg-admin-surface-low/50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-admin-muted'}`} />
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
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? 'bg-admin-pink text-white font-bold'
                  : 'text-admin-muted hover:text-admin-cream'
              }`}
            >
              <Icon className="w-5 h-5 text-admin-muted" />
              <span className="text-[14px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
