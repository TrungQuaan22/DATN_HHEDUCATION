"use client";

import React from "react";
import { useAdminOrders } from "@/features/orders/hooks/use-admin-orders";
import OrdersFilters from "./components/orders-filters";
import OrdersTable from "./components/orders-table";
import OrdersStats from "./components/orders-stats";

export default function OrdersListClient() {
  const {
    search,
    handleSearchChange,
    status,
    handleStatusChange,
    paymentStatus,
    handlePaymentStatusChange,
    provider,
    handleProviderChange,
    createdFrom,
    createdTo,
    handleDateRangeChange,
    currentPage,
    setCurrentPage,
    limit,
    handleLimitChange,
    ordersQuery,
    ordersList,
    totalItems,
    totalPages,
    stats,
  } = useAdminOrders();

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h2 className="text-3xl font-bold font-serif text-admin-cream">
          Quản Lý Đơn Hàng
        </h2>
        <p className="text-sm text-admin-muted mt-1">
          Xem danh sách hóa đơn, kiểm tra trạng thái thanh toán và lịch sử giao dịch.
        </p>
      </div>

      {/* Filters Toolbar */}
      <OrdersFilters
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        paymentStatus={paymentStatus}
        onPaymentStatusChange={handlePaymentStatusChange}
        provider={provider}
        onProviderChange={handleProviderChange}
        createdFrom={createdFrom}
        createdTo={createdTo}
        onDateRangeChange={handleDateRangeChange}
      />

      {/* Main Table */}
      <OrdersTable
        ordersList={ordersList}
        isLoading={ordersQuery.isLoading}
        isFetching={ordersQuery.isFetching}
        currentPage={currentPage}
        limit={limit}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onLimitChange={handleLimitChange}
      />

      {/* Stats Summary */}
      <OrdersStats stats={stats} />
    </div>
  );
}
