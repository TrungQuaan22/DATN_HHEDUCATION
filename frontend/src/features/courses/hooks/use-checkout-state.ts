"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "@/stores/toast-store";
import { cancelOrder, createOrder, createPaymentAttempt } from "@/features/orders/api";
import type { Order } from "@/features/orders/types";

const CHECKOUT_ATTEMPT_PREFIX = "hh-checkout-attempt";
const PAYMENT_ATTEMPT_PREFIX = "hh-payment-attempt";
const ACTIVE_PAYMENT_PROVIDER = "sepay";

const createIdempotencyKey = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `checkout-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getCheckoutAttemptKey = (cartSignature: string) => {
  if (typeof window === "undefined") return createIdempotencyKey();

  const storageKey = `${CHECKOUT_ATTEMPT_PREFIX}:${cartSignature}`;
  const existing = window.sessionStorage.getItem(storageKey);

  if (existing) return existing;

  const next = createIdempotencyKey();
  window.sessionStorage.setItem(storageKey, next);
  return next;
};

const getPaymentAttemptKey = (orderId: string, provider: string) => {
  if (typeof window === "undefined") return createIdempotencyKey();

  const storageKey = `${PAYMENT_ATTEMPT_PREFIX}:${orderId}:${provider}`;
  const existing = window.sessionStorage.getItem(storageKey);

  if (existing) return existing;

  const next = createIdempotencyKey();
  window.sessionStorage.setItem(storageKey, next);
  return next;
};

export function useCheckoutState() {
  const { items } = useCartStore();
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("qr_transfer");
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && hasHydrated && !isAuthenticated) {
      toast.info("Vui lòng đăng nhập để thực hiện thanh toán.");
      router.replace("/login?redirect=/checkout");
    }
  }, [mounted, hasHydrated, isAuthenticated, router]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price, 0);
  }, [items]);

  const saleSubtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.salePrice ?? item.price), 0);
  }, [items]);

  const discount = useMemo(() => {
    return subtotal - saleSubtotal;
  }, [subtotal, saleSubtotal]);

  const total = saleSubtotal;

  const cartSignature = useMemo(() => {
    return items
      .map((item) => item.id)
      .sort()
      .join("|");
  }, [items]);

  const ensurePaymentAttempt = useCallback(async (order: Order) => {
    if (order.totalAmount === 0 || order.status !== "pending") return order;

    if (order.payment?.status === "pending") {
      return order;
    }

    const response = await createPaymentAttempt({
      orderId: order.id,
      provider: ACTIVE_PAYMENT_PROVIDER,
      idempotencyKey: getPaymentAttemptKey(order.id, ACTIVE_PAYMENT_PROVIDER),
    });

    return response.order;
  }, []);

  const handleCheckout = useCallback(() => {
    if (items.length === 0 || isCreatingOrder) return;

    const submit = async () => {
      setIsCreatingOrder(true);

      try {
        const response = await createOrder({
          courseIds: items.map((item) => item.id),
          idempotencyKey: getCheckoutAttemptKey(cartSignature),
        });

        if (response.code === "PENDING_ORDER_EXISTS") {
          const order = await ensurePaymentAttempt(response.order);
          setPendingOrder(order);
          toast.info("Bạn đang có đơn hàng chờ thanh toán.");
          return;
        }

        if (response.code === "FREE_ORDER_COMPLETED") {
          useCartStore.getState().clearCart();
          router.push(
            `/checkout/success?orderId=${response.order.id}&amount=${response.order.totalAmount}`
          );
          return;
        }

        toast.info("Đang mở trang thanh toán...");
        const order = await ensurePaymentAttempt(response.order);
        router.push(`/checkout/gateway?orderId=${order.id}`);
      } catch (error: any) {
        toast.error(error?.message || "Không thể tạo đơn hàng. Vui lòng thử lại.");
      } finally {
        setIsCreatingOrder(false);
      }
    };

    void submit();
  }, [cartSignature, ensurePaymentAttempt, isCreatingOrder, items, router]);

  const continuePendingOrder = useCallback(() => {
    if (!pendingOrder) return;

    const submit = async () => {
      try {
        const order = await ensurePaymentAttempt(pendingOrder);
        router.push(`/checkout/gateway?orderId=${order.id}`);
      } catch (error: any) {
        toast.error(error?.message || "Không thể mở lại thanh toán.");
      }
    };

    void submit();
  }, [ensurePaymentAttempt, pendingOrder, router]);

  const cancelPendingOrder = useCallback(() => {
    if (!pendingOrder || isCancellingOrder) return;

    const submit = async () => {
      setIsCancellingOrder(true);

      try {
        await cancelOrder({
          orderId: pendingOrder.id,
          idempotencyKey: createIdempotencyKey(),
        });
        toast.success("Đã hủy đơn hàng chờ thanh toán.");
        setPendingOrder(null);
      } catch (error: any) {
        toast.error(error?.message || "Không thể hủy đơn hàng. Vui lòng thử lại.");
      } finally {
        setIsCancellingOrder(false);
      }
    };

    void submit();
  }, [isCancellingOrder, pendingOrder]);

  return {
    items,
    isAuthenticated,
    hasHydrated,
    mounted,
    paymentMethod,
    setPaymentMethod,
    subtotal,
    discount,
    total,
    pendingOrder,
    isCreatingOrder,
    isCancellingOrder,
    handleCheckout,
    continuePendingOrder,
    cancelPendingOrder,
  };
}
