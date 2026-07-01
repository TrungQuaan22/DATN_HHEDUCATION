"use client";

import React from "react";
import { Search } from "lucide-react";
import type { OrderStatus, PaymentStatus } from "@/features/orders/types";

type OrdersFiltersProps = {
  search: string;
  onSearchChange: (val: string) => void;
  status: OrderStatus | "all";
  onStatusChange: (val: OrderStatus | "all") => void;
  paymentStatus: PaymentStatus | "all";
  onPaymentStatusChange: (val: PaymentStatus | "all") => void;
  provider: string;
  onProviderChange: (val: string) => void;
  createdFrom: string;
  createdTo: string;
  onDateRangeChange: (from: string, to: string) => void;
};

export default function OrdersFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  paymentStatus,
  onPaymentStatusChange,
  provider,
  onProviderChange,
  createdFrom,
  createdTo,
  onDateRangeChange,
}: OrdersFiltersProps) {
  return (
    <div className="bg-admin-deep border border-admin-border/30 rounded p-4 space-y-4 text-admin-cream font-sans">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-muted" />
          <input
            type="text"
            placeholder="Tìm theo mã hóa đơn, email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-admin-bg border border-admin-border/30 rounded pl-9 pr-4 py-2 text-sm text-admin-cream placeholder:text-admin-muted focus:border-admin-pink focus:outline-none transition-colors"
          />
        </div>

        {/* Order Status Select */}
        <div className="flex flex-col gap-1.5">
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as OrderStatus | "all")}
            className="w-full bg-admin-bg border border-admin-border/30 rounded px-3 py-2 text-sm text-admin-cream focus:border-admin-pink focus:outline-none transition-colors appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23AF9DA6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.75rem center",
              backgroundSize: "0.9rem",
              paddingRight: "2rem",
            }}
          >
            <option value="all">Tất cả trạng thái đơn</option>
            <option value="pending">Chờ thanh toán</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
            <option value="expired">Đã hết hạn</option>
          </select>
        </div>

        {/* Payment Status Select */}
        <div className="flex flex-col gap-1.5">
          <select
            value={paymentStatus}
            onChange={(e) => onPaymentStatusChange(e.target.value as PaymentStatus | "all")}
            className="w-full bg-admin-bg border border-admin-border/30 rounded px-3 py-2 text-sm text-admin-cream focus:border-admin-pink focus:outline-none transition-colors appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23AF9DA6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.75rem center",
              backgroundSize: "0.9rem",
              paddingRight: "2rem",
            }}
          >
            <option value="all">Tất cả trạng thái thanh toán</option>
            <option value="pending">Chờ thanh toán</option>
            <option value="success">Thành công</option>
            <option value="failed">Thất bại</option>
            <option value="cancelled">Đã hủy</option>
            <option value="late_success">Thành công muộn</option>
            <option value="manual_review">Cần kiểm tra thủ công</option>
          </select>
        </div>

        {/* Provider Select */}
        <div className="flex flex-col gap-1.5">
          <select
            value={provider}
            onChange={(e) => onProviderChange(e.target.value)}
            className="w-full bg-admin-bg border border-admin-border/30 rounded px-3 py-2 text-sm text-admin-cream focus:border-admin-pink focus:outline-none transition-colors appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23AF9DA6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.75rem center",
              backgroundSize: "0.9rem",
              paddingRight: "2rem",
            }}
          >
            <option value="">Tất cả cổng thanh toán</option>
            <option value="sepay">SePay</option>
            <option value="momo">MoMo</option>
            <option value="vnpay">VNPay</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-admin-border/10 pt-4">
        {/* Date From */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-admin-muted">Từ ngày:</span>
          <input
            type="date"
            value={createdFrom}
            onChange={(e) => onDateRangeChange(e.target.value, createdTo)}
            className="bg-admin-bg border border-admin-border/30 rounded px-3 py-1.5 text-xs text-admin-cream focus:border-admin-pink focus:outline-none transition-colors"
          />
        </div>

        {/* Date To */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-admin-muted">Đến ngày:</span>
          <input
            type="date"
            value={createdTo}
            onChange={(e) => onDateRangeChange(createdFrom, e.target.value)}
            className="bg-admin-bg border border-admin-border/30 rounded px-3 py-1.5 text-xs text-admin-cream focus:border-admin-pink focus:outline-none transition-colors"
          />
        </div>

        {/* Clear filters button */}
        {(search || status !== "all" || paymentStatus !== "all" || provider || createdFrom || createdTo) && (
          <button
            onClick={() => {
              onSearchChange("");
              onStatusChange("all");
              onPaymentStatusChange("all");
              onProviderChange("");
              onDateRangeChange("", "");
            }}
            className="text-xs text-admin-pink hover:underline ml-auto cursor-pointer"
            type="button"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>
    </div>
  );
}
