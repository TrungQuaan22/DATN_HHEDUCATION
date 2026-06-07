import { api } from "@/lib/api/axios";
import type {
  ListAdminPaymentTransactionsParams,
  ListAdminPaymentTransactionsResponse,
  AdminPaymentTransactionDetail,
} from "./types";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

const unwrap = <T>(response: { data: ApiEnvelope<T> }) => response.data.data;

export const getAdminPaymentTransactions = async (
  params: ListAdminPaymentTransactionsParams
): Promise<ListAdminPaymentTransactionsResponse> => {
  const response = await api.get<ApiEnvelope<ListAdminPaymentTransactionsResponse>>(
    "/admin/payment-transactions",
    { params }
  );
  return unwrap(response);
};

export const getAdminPaymentTransactionDetail = async (
  transactionId: string
): Promise<AdminPaymentTransactionDetail> => {
  const response = await api.get<ApiEnvelope<AdminPaymentTransactionDetail>>(
    `/admin/payment-transactions/${transactionId}`
  );
  return unwrap(response);
};
