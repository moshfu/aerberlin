"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ReactNode, useMemo, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppProviders({
  children,
  session,
}: {
  children: ReactNode;
  session: Session | null;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const contextValue = useMemo(
    () => ({
      session,
    }),
    [session],
  );

  return (
    <SessionProvider session={contextValue.session}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={80}>{children}</TooltipProvider>
        <Toaster richColors theme="dark" closeButton position="top-right" />
      </QueryClientProvider>
    </SessionProvider>
  );
}
