"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

const DEBOUNCE_MS = 200;

export function RecordsSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setValue(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const trimmed = value.trim();
    const current = initialQuery.trim();
    if (trimmed === current) return;

    const timer = window.setTimeout(() => {
      const params = new URLSearchParams();
      if (trimmed) {
        params.set("q", trimmed);
      }
      const href = params.toString() ? `/records?${params}` : "/records";
      startTransition(() => {
        router.replace(href);
      });
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [value, initialQuery, router]);

  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
      <label className="sr-only" htmlFor="records-search">
        Search saved CBO records
      </label>
      <input
        id="records-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type to search by organization, contact, address…"
        autoComplete="off"
        className="h-11 w-full flex-1 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2"
      />
      <p className="text-xs text-zinc-500 sm:w-24 sm:text-right" aria-live="polite">
        {pending ? "Searching…" : "Live search"}
      </p>
    </div>
  );
}
