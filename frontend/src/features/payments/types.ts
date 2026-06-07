export type PaymentTransactionDirection = "in" | "out";

export type PaymentTransactionMatchStatus =
  | "matched"
  | "unmatched"
  | "manual_review"
  | "ignored";

export type ListAdminPaymentTransactionsParams = {
  page?: number;
  limit?: number;
  provider?: string;
  matchStatus?: PaymentTransactionMatchStatus;
  direction?: PaymentTransactionDirection;
  orderId?: string;
  paymentId?: string;
  orderInvoiceNumber?: string;
  transactionRef?: string;
  search?: string;
  createdFrom?: string;
  createdTo?: string;
};

export type AdminPaymentTransactionListItem = {
  id: string;
  paymentId: string | null;
  orderId: string | null;
  provider: string;
  providerEventId: string | null;
  transactionRef: string | null;
  orderInvoiceNumber: string | null;
  amount: number;
  currency: string;
  direction: PaymentTransactionDirection;
  transactionDate: string | null;
  matchStatus: PaymentTransactionMatchStatus;
  metadata: any;
  createdAt: string;
  order: {
    id: string;
    orderInvoiceNumber: string;
    status: string;
    totalAmount: number;
    user: {
      id: string;
      email: string;
      fullName: string;
    };
  } | null;
  payment: {
    id: string;
    provider: string;
    status: string;
    amount: number;
    currency: string;
    paidAt: string | null;
  } | null;
};

export type AdminPaymentTransactionDetail = AdminPaymentTransactionListItem & {
  rawPayload: any;
};

export type ListAdminPaymentTransactionsResponse = {
  items: AdminPaymentTransactionListItem[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
};
