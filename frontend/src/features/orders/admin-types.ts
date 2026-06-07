import type { OrderStatus, PaymentStatus } from "./types";

export type ListAdminOrdersParams = {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  provider?: string;
  userId?: string;
  search?: string;
  createdFrom?: string;
  createdTo?: string;
};

export type AdminOrderPayment = {
  id: string;
  provider: string;
  providerPaymentId: string | null;
  amount: number;
  currency: string;
  transactionRef: string | null;
  checkoutUrl: string | null;
  qrCodeUrl: string | null;
  expiresAt: string | null;
  metadata: any;
  status: PaymentStatus;
  createdAt: string;
  paidAt: string | null;
};

export type AdminOrderItem = {
  id: string;
  courseId: string;
  priceAtPurchase: number;
  course: {
    title: string;
    slug: string;
  };
};

export type AdminOrderListItem = {
  id: string;
  orderInvoiceNumber: string;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  items: AdminOrderItem[];
  payments: AdminOrderPayment[];
  _count: {
    enrollments: number;
    paymentTransactions: number;
  };
};

export type AdminOrderTransaction = {
  id: string;
  provider: string;
  providerEventId: string | null;
  transactionRef: string | null;
  orderInvoiceNumber: string | null;
  amount: number;
  currency: string;
  direction: "in" | "out";
  transactionDate: string | null;
  matchStatus: "matched" | "unmatched" | "manual_review" | "ignored";
  metadata: any;
  createdAt: string;
  paymentId: string | null;
};

export type AdminOrderEnrollment = {
  id: string;
  userId: string;
  courseId: string;
  source: string;
  manualReason: string | null;
  enrolledAt: string;
};

export type AdminOrderDetail = AdminOrderListItem & {
  paymentTransactions: AdminOrderTransaction[];
  enrollments: AdminOrderEnrollment[];
};

export type ListAdminOrdersResponse = {
  items: AdminOrderListItem[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
};
