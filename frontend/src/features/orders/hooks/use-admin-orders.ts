"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { OrderStatus, PaymentStatus } from "../types";
import { getAdminOrders } from "../api";

export function useAdminOrders() {
  const queryClient = useQueryClient();

  // Filters State
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "all">("all");
  const [provider, setProvider] = useState("");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Handlers
  const handleSearchChange = useCallback((val: string) => {
    setSearch(val);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((val: OrderStatus | "all") => {
    setStatus(val);
    setCurrentPage(1);
  }, []);

  const handlePaymentStatusChange = useCallback((val: PaymentStatus | "all") => {
    setPaymentStatus(val);
    setCurrentPage(1);
  }, []);

  const handleProviderChange = useCallback((val: string) => {
    setProvider(val);
    setCurrentPage(1);
  }, []);

  const handleDateRangeChange = useCallback((from: string, to: string) => {
    setCreatedFrom(from);
    setCreatedTo(to);
    setCurrentPage(1);
  }, []);

  const handleLimitChange = useCallback((val: number) => {
    setLimit(val);
    setCurrentPage(1);
  }, []);

  // API query params
  const queryParams = useMemo(() => {
    const fromDate = createdFrom ? new Date(createdFrom).toISOString() : undefined;
    const toDate = createdTo ? new Date(createdTo).toISOString() : undefined;

    return {
      page: currentPage,
      limit,
      status: status === "all" ? undefined : status,
      paymentStatus: paymentStatus === "all" ? undefined : paymentStatus,
      provider: provider.trim() || undefined,
      search: search.trim() || undefined,
      createdFrom: fromDate,
      createdTo: toDate,
    };
  }, [currentPage, limit, status, paymentStatus, provider, search, createdFrom, createdTo]);

  // Query
  const ordersQuery = useQuery({
    queryKey: ["admin-orders", queryParams],
    queryFn: () => getAdminOrders(queryParams),
    placeholderData: (prev) => prev,
  });

  const ordersList = ordersQuery.data?.items || [];
  const totalItems = ordersQuery.data?.pagination.totalItems ?? 0;
  const totalPages = ordersQuery.data?.pagination.totalPages ?? 1;

  const handleRefreshList = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
  }, [queryClient]);

  // Tính toán KPI nhanh dựa trên dữ liệu hiện tại
  const stats = useMemo(() => {
    return {
      total: totalItems,
      pending: ordersList.filter((o) => o.status === "pending").length,
      completed: ordersList.filter((o) => o.status === "completed").length,
    };
  }, [totalItems, ordersList]);

  return {
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
    handleRefreshList,
    stats,
  };
}
