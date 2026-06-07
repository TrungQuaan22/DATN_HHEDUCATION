import { toast as sonnerToast } from 'sonner';

export const toast = {
  success: (message: string, duration?: number) => {
    return sonnerToast.success(message, duration !== undefined ? { duration } : undefined);
  },
  error: (message: string, duration?: number) => {
    return sonnerToast.error(message, duration !== undefined ? { duration } : undefined);
  },
  info: (message: string, duration?: number) => {
    return sonnerToast.info(message, duration !== undefined ? { duration } : undefined);
  },
  warning: (message: string, duration?: number) => {
    return sonnerToast.warning(message, duration !== undefined ? { duration } : undefined);
  },
};
