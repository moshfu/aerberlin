"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    const result = await signIn("email", {
      email,
      redirect: false,
      callbackUrl,
    });
    if (result?.ok) {
      setStatus("sent");
    } else {
      setStatus("idle");
      alert("Unable to send sign-in link. Please try again.");
    }
  };

  return (
    <div className="aer-subpage">
      <div className="aer-subpage__inner flex min-h-[60vh] flex-col items-center justify-center gap-10 py-12">
        <div className="text-center">
          <p className="text-[0.62rem] uppercase tracking-[0.32em] text-[rgba(255,255,255,0.55)]">
            aer berlin admin
          </p>
          <h1 className="mt-3 font-display text-[2.8rem] uppercase tracking-[0.08em] text-[rgba(255,255,255,0.92)]">
            Secure access
          </h1>
          <p className="mt-3 text-[0.72rem] uppercase tracking-[0.22em] text-[rgba(255,255,255,0.55)]">
            Request a one-time link to open the operations console.
          </p>
        </div>
        <div className="aer-panel w-full max-w-md">
          {status === "sent" ? (
            <p className="text-[0.72rem] uppercase tracking-[0.24em] text-[rgba(255,255,255,0.6)]">
              Link sent — check your inbox and this tab can be closed.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-2 text-left">
                <span className="text-[0.62rem] uppercase tracking-[0.26em] text-[rgba(255,255,255,0.6)]">
                  Admin email
                </span>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </label>
              <Button type="submit" variant="primary" disabled={status === "loading"}>
                {status === "loading" ? "Sending…" : "Send login link"}
              </Button>
            </form>
          )}
          <Button variant="ghost" onClick={() => router.push(callbackUrl)} className="mt-4">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
