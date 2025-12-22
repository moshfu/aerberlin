"use client";

import { FormEvent, useState } from "react";
import type { Route } from "next";
import { signIn } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignInPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const localeFromPath = pathname?.split("/")[1] || "en";
  const rawCallbackUrl = searchParams.get("callbackUrl");
  const normalizeCallback = (value: string | null): string => {
    if (!value || !value.startsWith("/")) return `/${localeFromPath}/checkin`;
    // If callback is already locale-prefixed, use it; otherwise prepend locale.
    const segments = value.split("/");
    const hasLocalePrefix = segments[1]?.length === 2; // naive check, matches our locales
    return hasLocalePrefix ? value : `/${localeFromPath}${value}`;
  };
  const callbackUrl = normalizeCallback(rawCallbackUrl);
  const callbackRoute = callbackUrl as Route;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage(null);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl,
    });
    // With redirect: true, NextAuth will navigate on success.
    if (result?.error) {
      setStatus("error");
      setErrorMessage(result.error ?? "Invalid credentials. Try again.");
    }
  };

  return (
    <div className="aer-subpage">
      <div className="aer-subpage__inner flex min-h-[60vh] flex-col items-center justify-center gap-10 py-12">
        <div className="text-center">
          <p className="text-[0.62rem] uppercase tracking-[0.32em] text-[rgba(255,255,255,0.55)]">
            aer berlin access
          </p>
          <h1 className="mt-3 font-display text-[2.8rem] tracking-[0.08em] text-[rgba(255,255,255,0.92)]">
            Secure access
          </h1>
          <p className="mt-3 text-[0.72rem] uppercase tracking-[0.22em] text-[rgba(255,255,255,0.55)]">
            Sign in with staff credentials to unlock the restricted tools.
          </p>
        </div>
        <div className="aer-panel w-full max-w-md">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-left">
              <span className="text-[0.62rem] uppercase tracking-[0.26em] text-[rgba(255,255,255,0.6)]">
                Work email
              </span>
              <Input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="crew@aerberlin.de"
              />
            </label>
            <label className="flex flex-col gap-2 text-left">
              <span className="text-[0.62rem] uppercase tracking-[0.26em] text-[rgba(255,255,255,0.6)]">
                Password
              </span>
              <Input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••••••••"
              />
            </label>
            {status === "error" && errorMessage ? (
              <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[rgba(255,16,42,0.7)]">
                {errorMessage}
              </p>
            ) : null}
            <Button type="submit" variant="primary" disabled={status === "loading"}>
              {status === "loading" ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <Button variant="ghost" onClick={() => router.push(callbackRoute)} className="mt-4">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
