export type OrderStatus = "pending" | "completed" | "cancelled" | "expired";
export type PaymentStatus =
  | "pending"
  | "success"
  | "failed"
  | "cancelled"
  | "late_success"
  | "manual_review";

export type OrderPayment = {
  id: string;
  provider: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  qrCodeUrl: string | null;
  checkoutUrl: string | null;
  expiresAt: string | null;
  paidAt: string | null;
};

export type OrderItem = {
  id: string;
  courseId: string;
  title: string;
  slug: string;
  priceAtPurchase: number;
};

export type Order = {
  id: string;
  orderInvoiceNumber: string;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  expiresAt: string;
  createdAt: string;
  items: OrderItem[];
  payment: OrderPayment | null;
};

export type CreateOrderResponse =
  | {
      code: "ORDER_CREATED" | "FREE_ORDER_COMPLETED";
      order: Order;
    }
  | {
      code: "PENDING_ORDER_EXISTS";
      order: Order;
    };

export type CancelOrderResponse = {
  order: Order;
};

export type CreatePaymentAttemptResponse = {
  order: Order;
};
