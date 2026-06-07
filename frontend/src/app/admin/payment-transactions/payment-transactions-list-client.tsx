"use client";

import React from "react";
import { useAdminPaymentTransactions } from "@/features/payments/hooks/use-admin-payment-transactions";
import PaymentTransactionsFilters from "./components/payment-transactions-filters";
import PaymentTransactionsTable from "./components/payment-transactions-table";

export default function PaymentTransactionsListClient() {
  const {
    search,
    handleSearchChange,
    provider,
    handleProviderChange,
    matchStatus,
    handleMatchStatusChange,
    direction,
    handleDirectionChange,
    orderInvoiceNumber,
    handleOrderInvoiceNumberChange,
    transactionRef,
    handleTransactionRefChange,
    createdFrom,
    createdTo,
    handleDateRangeChange,
    currentPage,
    setCurrentPage,
    limit,
    handleLimitChange,
    transactionsQuery,
    transactionsList,
    totalItems,
    totalPages,
  } = useAdminPaymentTransactions();

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h2 className="text-3xl font-bold font-serif text-admin-cream">
          Quản Lý Giao Dịch
        </h2>
        <p className="text-sm text-admin-muted mt-1">
          Theo dõi các giao dịch ngân hàng thô (callback webhook), đối soát trạng thái khớp với đơn hàng.
        </p>
      </div>

      {/* Filters Toolbar */}
      <PaymentTransactionsFilters
        search={search}
        onSearchChange={handleSearchChange}
        provider={provider}
        onProviderChange={handleProviderChange}
        matchStatus={matchStatus}
        onMatchStatusChange={handleMatchStatusChange}
        direction={direction}
        onDirectionChange={handleDirectionChange}
        orderInvoiceNumber={orderInvoiceNumber}
        onOrderInvoiceNumberChange={handleOrderInvoiceNumberChange}
        transactionRef={transactionRef}
        onTransactionRefChange={handleTransactionRefChange}
        createdFrom={createdFrom}
        createdTo={createdTo}
        onDateRangeChange={handleDateRangeChange}
      />

      {/* Main Table */}
      <PaymentTransactionsTable
        transactionsList={transactionsList}
        isLoading={transactionsQuery.isLoading}
        isFetching={transactionsQuery.isFetching}
        currentPage={currentPage}
        limit={limit}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onLimitChange={handleLimitChange}
      />
    </div>
  );
}
