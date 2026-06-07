"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { UserRole, UserStatus } from "@/features/users/types";

type UsersFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  role: UserRole | "all";
  onRoleChange: (value: UserRole | "all") => void;
  status: UserStatus | "all";
  onStatusChange: (value: UserStatus | "all") => void;
};

export default function UsersFilters({
  search,
  onSearchChange,
  role,
  onRoleChange,
  status,
  onStatusChange,
}: UsersFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);

  // Debounce search state changes by 500ms
  useEffect(() => {
    if (localSearch === search) return;

    const handler = setTimeout(() => {
      onSearchChange(localSearch);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [localSearch, search, onSearchChange]);

  // Sync localSearch if search is reset externally (e.g. if the search is cleared)
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  return (
    <div className="bg-admin-surface-low p-6 rounded border border-admin-border/30 flex flex-wrap items-center gap-4 shadow-sm text-admin-cream">
      {/* Search input */}
      <div className="flex-grow min-w-[250px]">
        <label className="block text-[10px] font-bold uppercase text-admin-muted mb-2 tracking-wider">
          Tìm kiếm
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted w-4 h-4" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Họ tên, email người dùng..."
            className="w-full bg-admin-deep border border-admin-border/30 focus:border-admin-pink focus:outline-none focus:ring-1 focus:ring-admin-pink rounded-full pl-9 pr-4 py-2 text-[14px] text-admin-cream placeholder:text-admin-muted/40"
          />
        </div>
      </div>

      {/* Role Filter */}
      <div className="w-48">
        <label className="block text-[10px] font-bold uppercase text-admin-muted mb-2 tracking-wider">
          Vai trò
        </label>
        <select
          value={role}
          onChange={(e) => onRoleChange(e.target.value as UserRole | "all")}
          className="w-full bg-admin-deep border border-admin-border/30 focus:border-admin-pink focus:outline-none focus:ring-0 py-2 px-3 rounded-2xl text-[14px] text-admin-cream appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23AF9DA6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0.75rem center",
            backgroundSize: "0.85rem",
          }}
        >
          <option value="all">Tất cả vai trò</option>
          <option value="student">Học sinh</option>
          <option value="teacher">Giảng viên</option>
          <option value="admin">Quản trị viên</option>
        </select>
      </div>

      {/* Status Filter */}
      <div className="w-48">
        <label className="block text-[10px] font-bold uppercase text-admin-muted mb-2 tracking-wider">
          Trạng thái
        </label>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as UserStatus | "all")}
          className="w-full bg-admin-deep border border-admin-border/30 focus:border-admin-pink focus:outline-none focus:ring-0 py-2 px-3 rounded-2xl text-[14px] text-admin-cream appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23AF9DA6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0.75rem center",
            backgroundSize: "0.85rem",
          }}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Hoạt động (Active)</option>
          <option value="banned">Bị khóa (Banned)</option>
          <option value="pending_verification">Chờ xác minh</option>
        </select>
      </div>
    </div>
  );
}
