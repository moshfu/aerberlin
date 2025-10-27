"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email(),
});

export function NewsletterForm({
  submitLabel,
  placeholder,
  successMessage,
  errorMessage,
}: {
  submitLabel: string;
  placeholder: string;
  successMessage: string;
  errorMessage: string;
}) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = schema.safeParse({ email });
    if (!result.success) {
      toast.error(errorMessage);
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, locale: navigator.language }),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      toast.success(successMessage);
      setEmail("");
    } catch (err) {
      console.error(err);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 sm:flex-row">
      <Input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder={placeholder}
        required
        className="sm:flex-1"
      />
      <Button type="submit" disabled={isSubmitting} variant="accent">
        {isSubmitting ? "…" : submitLabel}
      </Button>
    </form>
  );
}
