import { api } from "@/lib/api/axios";

import type {
  CancelOrderResponse,
  CreateOrderResponse,
  CreatePaymentAttemptResponse,
  Order,
} from "./types";

import type {
  ListAdminOrdersParams,
  ListAdminOrdersResponse,
  AdminOrderDetail,
} from "./admin-types";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

const unwrap = <T>(response: { data: ApiEnvelope<T> }) => response.data.data;

export const createOrder = async (data: {
  courseIds: string[];
  idempotencyKey: string;
}): Promise<CreateOrderResponse> => {
  const response = await api.post<ApiEnvelope<CreateOrderResponse>>(
    "/orders",
    {
      courseIds: data.courseIds,
    },
    {
      headers: {
        "Idempotency-Key": data.idempotencyKey,
      },
    }
  );

  return unwrap(response);
};

export const createPaymentAttempt = async (data: {
  orderId: string;
  provider: string;
  idempotencyKey: string;
}): Promise<CreatePaymentAttemptResponse> => {
  const response = await api.post<ApiEnvelope<CreatePaymentAttemptResponse>>(
    `/orders/${data.orderId}/payments`,
    {
      provider: data.provider,
    },
    {
      headers: {
        "Idempotency-Key": data.idempotencyKey,
      },
    }
  );

  return unwrap(response);
};

export const getOrder = async (orderId: string): Promise<Order> => {
  const response = await api.get<ApiEnvelope<Order>>(`/orders/${orderId}`);
  return unwrap(response);
};

export const cancelOrder = async (data: {
  orderId: string;
  idempotencyKey: string;
}): Promise<CancelOrderResponse> => {
  const response = await api.post<ApiEnvelope<CancelOrderResponse>>(
    `/orders/${data.orderId}/cancel`,
    {},
    {
      headers: {
        "Idempotency-Key": data.idempotencyKey,
      },
    }
  );

  return unwrap(response);
};

export const getAdminOrders = async (
  params: ListAdminOrdersParams
): Promise<ListAdminOrdersResponse> => {
  const response = await api.get<ApiEnvelope<ListAdminOrdersResponse>>(
    "/admin/orders",
    { params }
  );
  return unwrap(response);
};

export const getAdminOrderDetail = async (
  orderId: string
): Promise<AdminOrderDetail> => {
  const response = await api.get<ApiEnvelope<AdminOrderDetail>>(
    `/admin/orders/${orderId}`
  );
  return unwrap(response);
};

