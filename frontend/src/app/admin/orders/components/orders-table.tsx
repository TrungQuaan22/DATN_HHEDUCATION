"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ShoppingCart, Loader2 } from "lucide-react";
import type { AdminOrderListItem, AdminOrderDetail } from "@/features/orders/admin-types";
import { getAdminOrderDetail } from "@/features/orders/api";

type OrdersTableProps = {
  ordersList: AdminOrderListItem[];
  isLoading: boolean;
  isFetching: boolean;
  currentPage: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

// Định nghĩa màu cho Trạng thái Đơn hàng
const getOrderStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider">Chờ TT</span>;
    case "completed":
      return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">Hoàn thành</span>;
    case "cancelled":
      return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase tracking-wider">Đã hủy</span>;
    case "expired":
      return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 uppercase tracking-wider">Hết hạn</span>;
    default:
      return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 uppercase tracking-wider">{status}</span>;
  }
};

// Định nghĩa màu cho Trạng thái Thanh toán
const getPaymentStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">Chờ TT</span>;
    case "success":
      return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Thành công</span>;
    case "failed":
      return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">Thất bại</span>;
    case "cancelled":
      return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-500/10 text-zinc-500 border border-zinc-500/20">Đã hủy</span>;
    case "late_success":
      return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20">TT Muộn</span>;
    case "manual_review":
      return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">Đối soát thủ công</span>;
    default:
      return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-500/10 text-zinc-500 border border-zinc-500/20">{status}</span>;
  }
};

// Định dạng tiền tệ VND
const formatPrice = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Định dạng ngày giờ
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function TableSkeleton({ limit }: { limit: number }) {
  return (
    <div className="divide-y divide-admin-border/10 animate-pulse">
      {[...Array(limit)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4">
          <div className="h-4 bg-admin-surface-low/50 rounded w-1/4" />
          <div className="h-4 bg-admin-surface-low/50 rounded w-1/4" />
          <div className="h-4 bg-admin-surface-low/50 rounded w-12 hidden md:block" />
          <div className="h-4 bg-admin-surface-low/50 rounded w-20" />
          <div className="h-4 bg-admin-surface-low/50 rounded w-20" />
          <div className="h-4 bg-admin-surface-low/50 rounded w-20 ml-auto" />
        </div>
      ))}
    </div>
  );
}

// Subcomponent cho Dòng Mở Rộng tự load chi tiết
function OrderExpandedRow({ orderId, colSpan }: { orderId: string; colSpan: number }) {
  const { data: detail, isLoading } = useQuery<AdminOrderDetail>({
    queryKey: ["admin-orders", "detail", orderId],
    queryFn: () => getAdminOrderDetail(orderId),
    staleTime: 30000, // cache 30s
  });

  if (isLoading) {
    return (
      <tr>
        <td colSpan={colSpan} className="bg-admin-surface-low/30 px-6 py-8 text-center text-admin-muted text-sm">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-admin-pink" />
            <span>Đang tải thông tin chi tiết đơn hàng...</span>
          </div>
        </td>
      </tr>
    );
  }

  if (!detail) {
    return (
      <tr>
        <td colSpan={colSpan} className="bg-admin-surface-low/30 px-6 py-4 text-center text-rose-500 text-sm">
          Không tìm thấy thông tin chi tiết đơn hàng.
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td colSpan={colSpan} className="bg-admin-surface-low/30 border-t border-b border-admin-border/20 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm text-admin-cream font-sans">
          
          {/* Cột 1: Danh sách khóa học */}
          <div className="bg-admin-deep/50 rounded border border-admin-border/20 p-4 space-y-3">
            <h4 className="text-xs font-bold text-admin-pink uppercase tracking-widest border-b border-admin-border/10 pb-2">
              Khóa học đã mua ({detail.items.length})
            </h4>
            <div className="divide-y divide-admin-border/10">
              {detail.items.map((item) => (
                <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex justify-between items-start gap-4">
                  <div>
                    <p className="font-semibold text-admin-cream text-[13px]">{item.course.title}</p>
                    <p className="text-[11px] text-admin-muted">Slug: {item.course.slug}</p>
                  </div>
                  <span className="font-bold text-admin-cream text-[13px] flex-shrink-0">
                    {formatPrice(item.priceAtPurchase)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-admin-border/10 pt-2.5 flex justify-between font-bold text-admin-pink">
              <span>Tổng tiền đơn hàng:</span>
              <span>{formatPrice(detail.totalAmount)}</span>
            </div>
          </div>

          {/* Cột 2: Lần thanh toán (Payment Attempts) */}
          <div className="bg-admin-deep/50 rounded border border-admin-border/20 p-4 space-y-3">
            <h4 className="text-xs font-bold text-admin-pink uppercase tracking-widest border-b border-admin-border/10 pb-2">
              Lịch sử Thanh toán ({detail.payments.length})
            </h4>
            {detail.payments.length === 0 ? (
              <p className="text-xs text-admin-muted py-2">Chưa có bản ghi thanh toán nào.</p>
            ) : (
              <div className="space-y-3 divide-y divide-admin-border/10 max-h-[200px] overflow-y-auto custom-scrollbar">
                {detail.payments.map((p, idx) => (
                  <div key={p.id} className="pt-3 first:pt-0 space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[13px] text-admin-cream">Lần {detail.payments.length - idx}: {p.provider}</span>
                      {getPaymentStatusBadge(p.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[11px] text-admin-muted">
                      <div>Số tiền: <span className="text-admin-cream font-medium">{formatPrice(p.amount)}</span></div>
                      <div>Mã tham chiếu: <span className="text-admin-cream font-medium break-all">{p.transactionRef || "N/A"}</span></div>
                      <div>Tạo lúc: <span>{formatDate(p.createdAt)}</span></div>
                      <div>Thanh toán lúc: <span>{p.paidAt ? formatDate(p.paidAt) : "Chưa thanh toán"}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cột 3: Kích hoạt học tập (Enrollments) & Giao dịch thô liên kết */}
          <div className="bg-admin-deep/50 rounded border border-admin-border/20 p-4 space-y-3">
            <h4 className="text-xs font-bold text-admin-pink uppercase tracking-widest border-b border-admin-border/10 pb-2">
              Kích hoạt học tập ({detail.enrollments.length})
            </h4>
            {detail.enrollments.length === 0 ? (
              <p className="text-xs text-admin-muted py-2">Chưa được kích hoạt học tập (Chưa ghi danh).</p>
            ) : (
              <div className="space-y-3 divide-y divide-admin-border/10">
                {detail.enrollments.map((e) => (
                  <div key={e.id} className="pt-2 first:pt-0 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="font-semibold text-admin-cream">Nguồn: <span className="text-admin-pink uppercase tracking-wider">{e.source}</span></span>
                      <span className="text-admin-muted">{formatDate(e.enrolledAt)}</span>
                    </div>
                    {e.manualReason && (
                      <p className="text-[11px] text-amber-500 italic bg-amber-500/5 px-2 py-1 rounded border border-amber-500/10">
                        Lý do thủ công: {e.manualReason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-admin-border/10 pt-3 space-y-2">
              <h4 className="text-xs font-bold text-admin-pink uppercase tracking-widest">
                Giao dịch ngân hàng khớp ({detail.paymentTransactions.length})
              </h4>
              {detail.paymentTransactions.length === 0 ? (
                <p className="text-[11px] text-admin-muted">Không tìm thấy giao dịch ngân hàng khớp.</p>
              ) : (
                <div className="space-y-2 max-h-[120px] overflow-y-auto custom-scrollbar">
                  {detail.paymentTransactions.map((tx) => (
                    <div key={tx.id} className="bg-admin-deep p-2 rounded border border-admin-border/10 text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="font-semibold text-admin-cream break-all">{tx.transactionRef || "N/A"}</span>
                        <span className="text-emerald-500 font-bold">+{formatPrice(tx.amount)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-admin-muted">
                        <span>Cổng: {tx.provider}</span>
                        <span>{tx.transactionDate ? formatDate(tx.transactionDate) : ""}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function OrdersTable({
  ordersList,
  isLoading,
  isFetching,
  currentPage,
  limit,
  totalPages,
  totalItems,
  onPageChange,
  onLimitChange,
}: OrdersTableProps) {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const toggleExpandOrder = (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  const emptyRowsCount = limit - ordersList.length;
  const colSpan = 7;

  return (
    <div className="bg-admin-deep border border-admin-border/30 rounded shadow-sm overflow-hidden text-admin-cream font-sans">
      {isLoading ? (
        <TableSkeleton limit={limit} />
      ) : ordersList.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center">
          <ShoppingCart size={40} className="text-admin-muted mb-4" />
          <h3 className="text-lg font-bold text-admin-cream">Không tìm thấy đơn hàng nào</h3>
          <p className="text-admin-muted text-sm mt-1 max-w-sm">
            Không có kết quả khớp với bộ lọc tìm kiếm hoặc hệ thống chưa có đơn hàng nào.
          </p>
        </div>
      ) : (
        <div className={`overflow-x-auto custom-scrollbar transition-opacity duration-200 ${isFetching ? "opacity-60" : "opacity-100"}`}>
          <table className="w-full border-collapse text-left min-w-[900px]">
            <thead className="bg-admin-surface-low/50 border-b border-admin-border/30">
              <tr className="text-admin-muted text-[12px] font-bold uppercase tracking-wider">
                <th className="pl-6 py-4 w-[40px]"></th>
                <th className="py-4 w-[160px]">Mã hóa đơn</th>
                <th className="py-4 w-[220px]">Học viên</th>
                <th className="py-4 w-[200px]">Khóa học</th>
                <th className="py-4 w-[130px]">Tổng tiền</th>
                <th className="py-4 w-[220px]">Trạng thái (Đơn / TT)</th>
                <th className="pr-6 py-4 text-right w-[150px]">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border/10">
              {ordersList.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                
                // Rút gọn hiển thị khóa học
                let coursesText = "";
                if (order.items.length > 0) {
                  coursesText = order.items[0].course.title;
                  if (order.items.length > 1) {
                    coursesText += ` (+${order.items.length - 1})`;
                  }
                }

                // Cổng thanh toán cuối cùng thử dùng
                const latestPaymentProvider = order.payments && order.payments.length > 0 
                  ? order.payments[0].provider 
                  : "N/A";

                return (
                  <React.Fragment key={order.id}>
                    <tr 
                      onClick={() => toggleExpandOrder(order.id)}
                      className={`hover:bg-admin-surface-low/30 transition-colors cursor-pointer text-[14px] ${isExpanded ? "bg-admin-surface-low/20" : ""}`}
                    >
                      <td className="pl-6 py-4 text-center">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-admin-pink animate-pulse" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-admin-muted hover:text-admin-cream" />
                        )}
                      </td>
                      <td className="py-4 font-bold text-admin-cream tracking-tight break-all pr-2">
                        {order.orderInvoiceNumber}
                      </td>
                      <td className="py-4 pr-2">
                        <p className="font-semibold text-admin-cream text-[13px]">{order.user.fullName}</p>
                        <p className="text-[11px] text-admin-muted">{order.user.email}</p>
                      </td>
                      <td className="py-4 text-admin-cream text-[13px] pr-2 max-w-[200px] truncate" title={order.items.map(i => i.course.title).join(", ")}>
                        {coursesText}
                      </td>
                      <td className="py-4 font-bold text-admin-pink text-[13px]">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="py-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {getOrderStatusBadge(order.status)}
                          <span className="text-admin-muted text-xs">/</span>
                          {order.payments && order.payments.length > 0 ? (
                            getPaymentStatusBadge(order.payments[0].status)
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-500/10 text-zinc-500 border border-zinc-500/20">Chưa TT</span>
                          )}
                          <span className="text-[10px] text-admin-muted">({latestPaymentProvider})</span>
                        </div>
                      </td>
                      <td className="pr-6 py-4 text-right text-xs text-admin-muted">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                    {isExpanded && (
                      <OrderExpandedRow orderId={order.id} colSpan={colSpan} />
                    )}
                  </React.Fragment>
                );
              })}
              {emptyRowsCount > 0 &&
                Array.from({ length: emptyRowsCount }).map((_, idx) => (
                  <tr key={`empty-${idx}`} className="border-b border-transparent text-[14px]">
                    <td colSpan={colSpan} className="py-4">&nbsp;</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {totalItems > 0 && (
        <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-admin-border/30 bg-admin-surface-low/30">
          <div className="flex items-center gap-4 text-xs text-admin-muted">
            <p>
              Hiển thị <span className="font-bold text-admin-cream">{ordersList.length}</span> trên{" "}
              <span className="font-bold text-admin-cream">{totalItems}</span> đơn hàng
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
