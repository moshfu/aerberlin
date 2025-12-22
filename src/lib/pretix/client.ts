import { cache } from "react";
import { serverConfig } from "@/server/config";
import type { PretixListResponse } from "@/lib/pretix/types";

const BASE_URL = serverConfig.pretixApiUrl.replace(/\/$/, "");

async function pretixFetch<T>(
  endpoint: string,
  init?: RequestInit,
  options?: { allowErrorResponses?: boolean },
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Token ${serverConfig.pretixApiToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    if (options?.allowErrorResponses) {
      try {
        const data = (await response.json()) as T;
        return data;
      } catch {
        // fallthrough to error
      }
    }
    const errorText = await response.text();
    console.error("Pretix API error", response.status, errorText);
    throw new Error(`Pretix API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const getPretixList = cache(async <T,>(endpoint: string) => {
  const data = await pretixFetch<PretixListResponse<T>>(endpoint);
  return data.results;
});

export async function postPretix<T>(
  endpoint: string,
  body: unknown,
  options?: { allowErrorResponses?: boolean },
) {
  return pretixFetch<T>(
    endpoint,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    options,
  );
}

export async function patchPretix<T>(endpoint: string, body: unknown) {
  return pretixFetch<T>(endpoint, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function getPretix<T>(endpoint: string) {
  return pretixFetch<T>(endpoint);
}
