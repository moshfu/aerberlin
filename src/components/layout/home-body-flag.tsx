"use client";

import { useEffect } from "react";

export function HomeBodyFlag() {
  useEffect(() => {
    document.body.dataset.aerHome = "true";
    return () => {
      delete document.body.dataset.aerHome;
    };
  }, []);

  return null;
}
