"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  PaymentTransactionDirection,
  PaymentTransactionMatchStatus,
} from "../types";
import { getAdminPaymentTransactions } from "../api";

export function useAdminPaymentTransactions() {
  const queryClient = useQueryClient();

  // Filters State
  const [search, setSearch] = useState("");
  const [provider, setProvider] = useState("");
  const [matchStatus, setMatchStatus] = useState<PaymentTransactionMatchStatus | "all">("all");
  const [direction, setDirection] = useState<PaymentTransactionDirection | "all">("all");
  const [orderInvoiceNumber, setOrderInvoiceNumber] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Handlers
  const handleSearchChange = useCallback((val: string) => {
    setSearch(val);
    setCurrentPage(1);
  }, []);

  const handleProviderChange = useCallback((val: string) => {
    setProvider(val);
    setCurrentPage(1);
  }, []);

  const handleMatchStatusChange = useCallback((val: PaymentTransactionMatchStatus | "all") => {
    setMatchStatus(val);
    setCurrentPage(1);
  }, []);

  const handleDirectionChange = useCallback((val: PaymentTransactionDirection | "all") => {
    setDirection(val);
    setCurrentPage(1);
  }, []);

  const handleOrderInvoiceNumberChange = useCallback((val: string) => {
    setOrderInvoiceNumber(val);
    setCurrentPage(1);
  }, []);

  const handleTransactionRefChange = useCallback((val: string) => {
    setTransactionRef(val);
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
      provider: provider.trim() || undefined,
      matchStatus: matchStatus === "all" ? undefined : matchStatus,
      direction: direction === "all" ? undefined : direction,
      orderInvoiceNumber: orderInvoiceNumber.trim() || undefined,
      transactionRef: transactionRef.trim() || undefined,
      search: search.trim() || undefined,
      createdFrom: fromDate,
      createdTo: toDate,
    };
  }, [
    currentPage,
    limit,
    provider,
    matchStatus,
    direction,
    orderInvoiceNumber,
    transactionRef,
    search,
    createdFrom,
    createdTo,
  ]);

  // Query
  const transactionsQuery = useQuery({
    queryKey: ["admin-payment-transactions", queryParams],
    queryFn: () => getAdminPaymentTransactions(queryParams),
    placeholderData: (prev) => prev,
  });

  const transactionsList = transactionsQuery.data?.items || [];
  const totalItems = transactionsQuery.data?.pagination.totalItems ?? 0;
  const totalPages = transactionsQuery.data?.pagination.totalPages ?? 1;

  const handleRefreshList = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["admin-payment-transactions"] });
  }, [queryClient]);

  return {
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
    handleRefreshList,
  };
}
