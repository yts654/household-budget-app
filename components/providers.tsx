"use client";

import { SessionProvider } from "next-auth/react";
import { SWRConfig } from "swr";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/lib/i18n";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <SWRConfig
        value={{
          revalidateOnFocus: false,
          dedupingInterval: 5000,
        }}
      >
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <Toaster position="bottom-right" richColors />
      </SWRConfig>
    </SessionProvider>
  );
}
