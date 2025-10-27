"use client";

import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "rounded-3xl border border-border/60 bg-background/90 px-6 py-4 text-foreground shadow-lg backdrop-blur-xl",
          title: "text-sm font-medium",
          description: "text-xs text-muted-foreground",
          closeButton:
            "rounded-full border border-border/40 p-2 text-muted-foreground hover:border-accent hover:text-foreground",
        },
      }}
      {...props}
    />
  );
}
