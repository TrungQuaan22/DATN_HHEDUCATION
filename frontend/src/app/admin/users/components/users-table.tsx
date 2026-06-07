"use client";

import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { AdminUserItem, UserStatus } from "@/features/users/types";
import UserRow from "./user-row";

function TableSkeleton({ limit }: { limit: number }) {
  return (
    <div className="divide-y divide-admin-border/10 animate-pulse">
      {[...Array(limit)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4">
          <div className="w-10 h-10 rounded-full bg-admin-surface-low/50 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-admin-surface-low/50 rounded w-1/3" />
            <div className="h-3 bg-admin-surface-low/50 rounded w-1/4" />
          </div>
          <div className="h-4 bg-admin-surface-low/50 rounded w-20 hidden md:block" />
          <div className="h-4 bg-admin-surface-low/50 rounded w-24" />
          <div className="h-8 bg-admin-surface-low/50 rounded w-24" />
        </div>
      ))}
    </div>
  );
}

type UsersTableProps = {
  usersList: AdminUserItem[];
  isLoading: boolean;
  isFetching: boolean;
  isActionPending?: boolean;
  currentPage: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onToggleStatus: (userId: string, currentStatus: UserStatus) => Promise<void>;
  onEnrollClick: (user: AdminUserItem) => void;
  onProgressClick: (user: AdminUserItem) => void;
};

export default function UsersTable({
  usersList,
  isLoading,
  isFetching,
  isActionPending = false,
  currentPage,
  limit,
  totalPages,
  totalItems,
  onPageChange,
  onLimitChange,
  onToggleStatus,
  onEnrollClick,
  onProgressClick,
}: UsersTableProps) {
  const emptyRowsCount = limit - usersList.length;

  return (
    <div className="bg-admin-deep border border-admin-border/30 rounded shadow-sm overflow-hidden text-admin-cream">
      {isLoading ? (
        <TableSkeleton limit={limit} />
      ) : usersList.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center">
          <User size={40} className="text-admin-muted mb-4" />
          <h3 className="text-lg font-bold text-admin-cream">
            Không tìm thấy người dùng nào
          </h3>
          <p className="text-admin-muted text-sm mt-1 max-w-sm">
            Không có kết quả khớp với bộ lọc tìm kiếm hoặc hệ thống chưa có dữ liệu.
          </p>
        </div>
      ) : (
        <div
          className={`overflow-x-auto custom-scrollbar transition-opacity duration-200 ${
            isFetching ? "opacity-60" : "opacity-100"
          }`}
        >
          <table className="w-full border-collapse text-left min-w-[900px]">
            <thead className="bg-admin-surface-low/50 border-b border-admin-border/30">
              <tr className="text-admin-muted text-[12px] font-bold uppercase tracking-wider">
                <th className="pl-6 py-4 w-[300px]">Người dùng</th>
                <th className="py-4 w-[150px]">Vai trò</th>
                <th className="py-4 w-[150px]">Trạng thái</th>
                <th className="py-4 w-[150px]">Ngày tạo</th>
                <th className="pr-6 py-4 text-right sticky right-0 bg-admin-surface-low border-l border-admin-border/10 z-20 w-[180px]">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border/10">
              {usersList.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  isActionPending={isActionPending}
                  onToggleStatus={onToggleStatus}
                  onEnrollClick={onEnrollClick}
                  onProgressClick={onProgressClick}
                />
              ))}
              {emptyRowsCount > 0 &&
                Array.from({ length: emptyRowsCount }).map((_, idx) => (
                  <tr
                    key={`empty-${idx}`}
                    className="border-b border-transparent text-[14px]"
                  >
                    <td className="pl-6 py-4">
                      <div className="h-10" />
                    </td>
                    <td className="py-4">&nbsp;</td>
                    <td className="py-4">&nbsp;</td>
                    <td className="py-4">&nbsp;</td>
                    <td className="pr-6 py-4 text-right sticky right-0 bg-admin-deep border-l border-admin-border/10">
                      &nbsp;
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination & Limit Selector Footer */}
      {totalItems > 0 && (
        <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-admin-border/30 bg-admin-surface-low/30">
          <div className="flex items-center gap-4 text-xs text-admin-muted">
            <p>
              Hiển thị <span className="font-bold text-admin-cream">{usersList.length}</span> trên{" "}
              <span className="font-bold text-admin-cream">{totalItems}</span> người dùng
            </p>
            <div className="h-4 w-px bg-admin-border/20" />
            <div className="flex items-center gap-2">
              <span>Số lượng mỗi trang:</span>
              <select
                value={limit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
                className="bg-admin-deep border border-admin-border/30 focus:border-admin-pink focus:outline-none rounded px-2 py-1 text-xs text-admin-cream transition-all appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23AF9DA6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.4rem center",
                  backgroundSize: "0.7rem",
                  paddingRight: "1.4rem",
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                className="p-2 border border-admin-border/30 rounded-lg text-admin-muted hover:bg-admin-surface-low hover:text-admin-cream disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => onPageChange(i + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-[12px] transition-all cursor-pointer ${
                    currentPage === i + 1
                      ? "bg-admin-pink text-white shadow-sm"
                      : "border border-admin-border/30 text-admin-muted hover:bg-admin-surface-low hover:text-admin-cream"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                className="p-2 border border-admin-border/30 rounded-lg text-admin-muted hover:bg-admin-surface-low hover:text-admin-cream disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
