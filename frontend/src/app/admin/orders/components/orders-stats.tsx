"use client";

import React from "react";
import { ShoppingCart, CheckCircle, Clock } from "lucide-react";

type OrdersStatsProps = {
  stats?: {
    total: number;
    pending: number;
    completed: number;
  };
};

export default function OrdersStats({ stats }: OrdersStatsProps) {
  if (!stats) return null;

  const cards = [
    {
      label: "Tổng Đơn Hàng",
      value: stats.total,
      icon: ShoppingCart,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      label: "Chờ Thanh Toán",
      value: stats.pending,
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      label: "Đã Hoàn Thành",
      value: stats.completed,
      icon: CheckCircle,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-admin-cream">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`bg-admin-deep border ${card.borderColor} rounded p-4 flex items-center justify-between shadow-sm`}
          >
            <div>
              <p className="text-xs text-admin-muted uppercase tracking-wider font-semibold">
                {card.label}
              </p>
              <h3 className="text-2xl font-bold text-admin-cream mt-1">
                {card.value}
              </h3>
            </div>
            <div className={`p-3 rounded-full ${card.bgColor}`}>
              <Icon className={`w-5 h-5 ${card.color}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
