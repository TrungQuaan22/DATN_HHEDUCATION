"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "@/stores/toast-store";

export function useCartState() {
  const { items, removeItem } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [isPromoApplied, setIsPromoApplied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate totals
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price, 0);
  }, [items]);

  const saleSubtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.salePrice ?? item.price), 0);
  }, [items]);

  const automaticDiscount = useMemo(() => {
    return subtotal - saleSubtotal;
  }, [subtotal, saleSubtotal]);

  const total = saleSubtotal;

  const handleApplyPromo = useCallback(() => {
    if (!promoCode.trim()) return;
    toast.error("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
  }, [promoCode]);

  const handleRemoveItem = useCallback((id: string, title: string) => {
    removeItem(id);
    toast.success(`Đã xóa "${title}" khỏi giỏ hàng.`);
  }, [removeItem]);

  return {
    items,
    mounted,
    promoCode,
    setPromoCode,
    isPromoApplied,
    subtotal,
    automaticDiscount,
    total,
    handleApplyPromo,
    handleRemoveItem,
  };
}
