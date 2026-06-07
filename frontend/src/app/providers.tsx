'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FetchingIndicator from '@/components/common/fetching-indicator';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            // Custom smart retry logic: false for 4xx client errors, up to 3 times for network or 5xx server errors
            retry: (failureCount, error: any) => {
              const status = error?.response?.status || error?.status;
              
              if (status && status >= 400 && status < 500) {
                return false;
              }
              
              return failureCount < 3;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <FetchingIndicator />
      {children}
    </QueryClientProvider>
  );
}

