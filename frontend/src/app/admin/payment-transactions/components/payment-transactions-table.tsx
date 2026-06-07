"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, CreditCard, Loader2, ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { AdminPaymentTransactionListItem, AdminPaymentTransactionDetail } from "@/features/payments/types";
import { getAdminPaymentTransactionDetail } from "@/features/payments/api";

type PaymentTransactionsTableProps = {
  transactionsList: AdminPaymentTransactionListItem[];
  isLoading: boolean;
  isFetching: boolean;
  currentPage: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

// Định nghĩa màu cho Trạng thái Đối soát
const getMatchStatusBadge = (status: string) => {
  switch (status) {
    case "matched":
      return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">Đã khớp</span>;
    case "unmatched":
      return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase tracking-wider">Chưa khớp</span>;
    case "manual_review":
      return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase tracking-wider">Cần đối soát</span>;
    case "ignored":
      return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 uppercase tracking-wider">Bỏ qua</span>;
    default:
      return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 uppercase tracking-wider">{status}</span>;
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

// Subcomponent cho Dòng Mở Rộng tự load chi tiết transaction kèm JSON thô
function TransactionExpandedRow({ transactionId, colSpan }: { transactionId: string; colSpan: number }) {
  const { data: detail, isLoading } = useQuery<AdminPaymentTransactionDetail>({
    queryKey: ["admin-payment-transactions", "detail", transactionId],
    queryFn: () => getAdminPaymentTransactionDetail(transactionId),
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <tr>
        <td colSpan={colSpan} className="bg-admin-surface-low/30 px-6 py-8 text-center text-admin-muted text-sm font-sans">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-admin-pink" />
            <span>Đang tải JSON payload và thông tin chi tiết giao dịch...</span>
          </div>
        </td>
      </tr>
    );
  }

  if (!detail) {
    return (
      <tr>
        <td colSpan={colSpan} className="bg-admin-surface-low/30 px-6 py-4 text-center text-rose-500 text-sm font-sans">
          Không tìm thấy thông tin chi tiết giao dịch.
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td colSpan={colSpan} className="bg-admin-surface-low/30 border-t border-b border-admin-border/20 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm text-admin-cream font-sans">
          
          {/* Cột 1 & 2: JSON Payload thô từ Webhook */}
          <div className="lg:col-span-2 bg-admin-deep/50 rounded border border-admin-border/20 p-4 space-y-2">
            <div className="flex justify-between items-center border-b border-admin-border/10 pb-2 mb-2">
              <h4 className="text-xs font-bold text-admin-pink uppercase tracking-widest">
                JSON Payload thô (Webhook ngân hàng)
              </h4>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(detail.rawPayload, null, 2));
                  alert("Đã sao chép JSON Payload!");
                }}
                className="text-[10px] text-admin-muted hover:text-admin-cream bg-admin-bg px-2 py-0.5 rounded border border-admin-border/20 cursor-pointer"
              >
                Copy JSON
              </button>
            </div>
            <pre className="bg-admin-bg p-4 rounded border border-admin-border/30 overflow-x-auto text-[11px] text-admin-pink font-mono max-h-[300px] custom-scrollbar">
              {JSON.stringify(detail.rawPayload, null, 2)}
            </pre>
          </div>

          {/* Cột 3: Trạng thái đối soát & Liên kết */}
          <div className="bg-admin-deep/50 rounded border border-admin-border/20 p-4 space-y-4">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-admin-pink uppercase tracking-widest border-b border-admin-border/10 pb-2">
                Thông tin Đối soát
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-admin-muted">Trạng thái khớp:</span>
                  <span>{getMatchStatusBadge(detail.matchStatus)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-admin-muted">ID Giao dịch hệ thống:</span>
                  <span className="font-mono text-[11px]">{detail.id}</span>
                </div>
                {detail.providerEventId && (
                  <div className="flex justify-between">
                    <span className="text-admin-muted">ID Sự kiện cổng:</span>
                    <span className="font-mono text-[11px]">{detail.providerEventId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-admin-muted">Thời gian nhận callback:</span>
                  <span>{formatDate(detail.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Liên kết đơn hàng */}
            <div className="space-y-3 border-t border-admin-border/10 pt-4">
              <h4 className="text-xs font-bold text-admin-pink uppercase tracking-widest">
                Đơn hàng được khớp
              </h4>
              {detail.order ? (
                <div className="bg-admin-bg p-3 rounded border border-admin-border/10 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-admin-muted">Mã hóa đơn:</span>
                    <span className="font-bold text-admin-cream">{detail.order.orderInvoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-admin-muted">Học viên:</span>
                    <span className="font-semibold text-admin-cream">{detail.order.user.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-admin-muted">Trạng thái đơn:</span>
                    <span className="capitalize">{detail.order.status}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-admin-border/5 font-bold text-admin-pink">
                    <span>Tổng tiền đơn:</span>
                    <span>{formatPrice(detail.order.totalAmount)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-admin-muted italic">Không có đơn hàng nào khớp với giao dịch này (giao dịch tự do hoặc lỗi đối soát).</p>
              )}
            </div>

            {/* Đợt thanh toán */}
            {detail.payment && (
              <div className="space-y-3 border-t border-admin-border/10 pt-4">
                <h4 className="text-xs font-bold text-admin-pink uppercase tracking-widest">
                  Nỗ lực thanh toán liên quan
                </h4>
                <div className="bg-admin-bg p-3 rounded border border-admin-border/10 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-admin-muted">Cổng:</span>
                    <span>{detail.payment.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-admin-muted">Trạng thái:</span>
                    <span>{detail.payment.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-admin-muted">Số tiền ghi nhận:</span>
                    <span>{formatPrice(detail.payment.amount)}</span>
                  </div>
                  {detail.payment.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-admin-muted">Ngày xác nhận thanh toán:</span>
                      <span>{formatDate(detail.payment.paidAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function PaymentTransactionsTable({
  transactionsList,
  isLoading,
  isFetching,
  currentPage,
  limit,
  totalPages,
  totalItems,
  onPageChange,
  onLimitChange,
}: PaymentTransactionsTableProps) {
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  const toggleExpandTx = (txId: string) => {
    if (expandedTxId === txId) {
      setExpandedTxId(null);
    } else {
      setExpandedTxId(txId);
    }
  };

  const emptyRowsCount = limit - transactionsList.length;
  const colSpan = 8;

  return (
    <div className="bg-admin-deep border border-admin-border/30 rounded shadow-sm overflow-hidden text-admin-cream font-sans">
      {isLoading ? (
        <TableSkeleton limit={limit} />
      ) : transactionsList.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center">
          <CreditCard size={40} className="text-admin-muted mb-4" />
          <h3 className="text-lg font-bold text-admin-cream">Không tìm thấy giao dịch nào</h3>
          <p className="text-admin-muted text-sm mt-1 max-w-sm">
            Không có kết quả khớp với bộ lọc tìm kiếm hoặc chưa nhận được callback nào từ webhook ngân hàng.
          </p>
        </div>
      ) : (
        <div className={`overflow-x-auto custom-scrollbar transition-opacity duration-200 ${isFetching ? "opacity-60" : "opacity-100"}`}>
          <table className="w-full border-collapse text-left min-w-[1000px]">
            <thead className="bg-admin-surface-low/50 border-b border-admin-border/30">
              <tr className="text-admin-muted text-[12px] font-bold uppercase tracking-wider">
                <th className="pl-6 py-4 w-[40px]"></th>
                <th className="py-4 w-[120px]">Nhà cung cấp</th>
                <th className="py-4 w-[180px]">Mã GD ngân hàng</th>
                <th className="py-4 w-[150px]">Mã hóa đơn khớp</th>
                <th className="py-4 w-[130px]">Số tiền</th>
                <th className="py-4 w-[90px]">Hướng</th>
                <th className="py-4 w-[160px]">Trạng thái khớp</th>
                <th className="pr-6 py-4 text-right w-[150px]">Ngày giao dịch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border/10">
              {transactionsList.map((tx) => {
                const isExpanded = expandedTxId === tx.id;

                return (
                  <React.Fragment key={tx.id}>
                    <tr 
                      onClick={() => toggleExpandTx(tx.id)}
                      className={`hover:bg-admin-surface-low/30 transition-colors cursor-pointer text-[14px] ${isExpanded ? "bg-admin-surface-low/20" : ""}`}
                    >
                      <td className="pl-6 py-4 text-center">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-admin-pink animate-pulse" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-admin-muted hover:text-admin-cream" />
                        )}
                      </td>
                      <td className="py-4 font-bold text-admin-cream capitalize">
                        {tx.provider}
                      </td>
                      <td className="py-4 font-semibold text-admin-cream break-all pr-2">
                        {tx.transactionRef || "N/A"}
                      </td>
                      <td className="py-4 pr-2 font-mono text-[13px] text-zinc-300">
                        {tx.orderInvoiceNumber || (
                          <span className="text-admin-muted italic text-[11px]">Chưa khớp</span>
                        )}
                      </td>
                      <td className="py-4 font-bold text-admin-cream text-[13px]">
                        {formatPrice(tx.amount)}
                      </td>
                      <td className="py-4">
                        {tx.direction === "in" ? (
                          <span className="flex items-center gap-1 text-emerald-500 font-bold text-xs">
                            <ArrowDownRight className="w-3.5 h-3.5" />
                            <span>IN</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-rose-500 font-bold text-xs">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span>OUT</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4">
                        {getMatchStatusBadge(tx.matchStatus)}
                      </td>
                      <td className="pr-6 py-4 text-right text-xs text-admin-muted">
                        {tx.transactionDate ? formatDate(tx.transactionDate) : formatDate(tx.createdAt)}
                      </td>
                    </tr>
                    {isExpanded && (
                      <TransactionExpandedRow transactionId={tx.id} colSpan={colSpan} />
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
              Hiển thị <span className="font-bold text-admin-cream">{transactionsList.length}</span> trên{" "}
              <span className="font-bold text-admin-cream">{totalItems}</span> giao dịch
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
