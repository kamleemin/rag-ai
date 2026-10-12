"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ApiRequestError } from "@/lib/api-request-error";

const MAX_RETRIES = 3;

/**
 * Retry network blips and server errors, but not 4xx answers: a 404 or 400 won't change
 * on retry, and retrying would only delay the "not found" page by several seconds.
 */
function shouldRetry(failureCount: number, error: Error): boolean {
  if (error instanceof ApiRequestError && error.status >= 400 && error.status < 500) {
    return false;
  }
  return failureCount < MAX_RETRIES;
}

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: shouldRetry } } })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only in development — the package renders nothing in production builds. */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
