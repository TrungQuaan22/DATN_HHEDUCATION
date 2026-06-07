"use client";

import React from "react";
import { Search } from "lucide-react";
import type {
  PaymentTransactionDirection,
  PaymentTransactionMatchStatus,
} from "@/features/payments/types";

type PaymentTransactionsFiltersProps = {
  search: string;
  onSearchChange: (val: string) => void;
  provider: string;
  onProviderChange: (val: string) => void;
  matchStatus: PaymentTransactionMatchStatus | "all";
  onMatchStatusChange: (val: PaymentTransactionMatchStatus | "all") => void;
  direction: PaymentTransactionDirection | "all";
  onDirectionChange: (val: PaymentTransactionDirection | "all") => void;
  orderInvoiceNumber: string;
  onOrderInvoiceNumberChange: (val: string) => void;
  transactionRef: string;
  onTransactionRefChange: (val: string) => void;
  createdFrom: string;
  createdTo: string;
  onDateRangeChange: (from: string, to: string) => void;
};

export default function PaymentTransactionsFilters({
  search,
  onSearchChange,
  provider,
  onProviderChange,
  matchStatus,
  onMatchStatusChange,
  direction,
  onDirectionChange,
  orderInvoiceNumber,
  onOrderInvoiceNumberChange,
  transactionRef,
  onTransactionRefChange,
  createdFrom,
  createdTo,
  onDateRangeChange,
}: PaymentTransactionsFiltersProps) {
  return (
    <div className="bg-admin-deep border border-admin-border/30 rounded p-4 space-y-4 text-admin-cream font-sans">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-muted" />
          <input
            type="text"
            placeholder="Tìm mã GD, hóa đơn, email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-admin-bg border border-admin-border/30 rounded pl-9 pr-4 py-2 text-sm text-admin-cream placeholder:text-admin-muted focus:border-admin-pink focus:outline-none transition-colors"
          />
        </div>

        {/* Match Status Select */}
        <div className="flex flex-col gap-1.5">
          <select
            value={matchStatus}
            onChange={(e) => onMatchStatusChange(e.target.value as PaymentTransactionMatchStatus | "all")}
            className="w-full bg-admin-bg border border-admin-border/30 rounded px-3 py-2 text-sm text-admin-cream focus:border-admin-pink focus:outline-none transition-colors appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23AF9DA6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.75rem center",
              backgroundSize: "0.9rem",
              paddingRight: "2rem",
            }}
          >
            <option value="all">Tất cả trạng thái khớp</option>
            <option value="matched">Đã khớp</option>
            <option value="unmatched">Chưa khớp</option>
            <option value="manual_review">Cần kiểm tra thủ công</option>
            <option value="ignored">Bỏ qua</option>
          </select>
        </div>

        {/* Direction Select */}
        <div className="flex flex-col gap-1.5">
          <select
            value={direction}
            onChange={(e) => onDirectionChange(e.target.value as PaymentTransactionDirection | "all")}
            className="w-full bg-admin-bg border border-admin-border/30 rounded px-3 py-2 text-sm text-admin-cream focus:border-admin-pink focus:outline-none transition-colors appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23AF9DA6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.75rem center",
              backgroundSize: "0.9rem",
              paddingRight: "2rem",
            }}
          >
            <option value="all">Tất cả hướng GD</option>
            <option value="in">Tiền vào (In)</option>
            <option value="out">Tiền ra (Out)</option>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-admin-border/10 pt-4">
        {/* Order Invoice Number */}
        <div className="relative">
          <input
            type="text"
            placeholder="Mã hóa đơn chính xác"
            value={orderInvoiceNumber}
            onChange={(e) => onOrderInvoiceNumberChange(e.target.value)}
            className="w-full bg-admin-bg border border-admin-border/30 rounded px-4 py-2 text-sm text-admin-cream placeholder:text-admin-muted focus:border-admin-pink focus:outline-none transition-colors"
          />
        </div>

        {/* Transaction Ref */}
        <div className="relative">
          <input
            type="text"
            placeholder="Mã tham chiếu ngân hàng chính xác"
            value={transactionRef}
            onChange={(e) => onTransactionRefChange(e.target.value)}
            className="w-full bg-admin-bg border border-admin-border/30 rounded px-4 py-2 text-sm text-admin-cream placeholder:text-admin-muted focus:border-admin-pink focus:outline-none transition-colors"
          />
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-admin-muted">Từ:</span>
            <input
              type="date"
              value={createdFrom}
              onChange={(e) => onDateRangeChange(e.target.value, createdTo)}
              className="bg-admin-bg border border-admin-border/30 rounded px-2 py-1 text-xs text-admin-cream focus:border-admin-pink focus:outline-none transition-colors"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-admin-muted">Đến:</span>
            <input
              type="date"
              value={createdTo}
              onChange={(e) => onDateRangeChange(createdFrom, e.target.value)}
              className="bg-admin-bg border border-admin-border/30 rounded px-2 py-1 text-xs text-admin-cream focus:border-admin-pink focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {(search || provider || matchStatus !== "all" || direction !== "all" || orderInvoiceNumber || transactionRef || createdFrom || createdTo) && (
        <div className="flex justify-end border-t border-admin-border/10 pt-2">
          <button
            onClick={() => {
              onSearchChange("");
              onProviderChange("");
              onMatchStatusChange("all");
              onDirectionChange("all");
              onOrderInvoiceNumberChange("");
              onTransactionRefChange("");
              onDateRangeChange("", "");
            }}
            className="text-xs text-admin-pink hover:underline cursor-pointer"
            type="button"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}
