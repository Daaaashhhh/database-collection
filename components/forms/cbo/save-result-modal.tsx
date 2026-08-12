"use client";

import Link from "next/link";
import { useEffect } from "react";

export type SaveModalState = {
  open: boolean;
  ok: boolean;
  title: string;
  message: string;
  recordId?: string | null;
};

export function SaveResultModal({
  state,
  onClose,
}: {
  state: SaveModalState;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!state.open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state.open, onClose]);

  if (!state.open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-result-title"
        className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`mb-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
            state.ok
              ? "bg-emerald-50 text-emerald-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {state.ok ? "Success" : "Failed"}
        </div>
        <h2
          id="save-result-title"
          className="text-xl font-semibold tracking-tight text-zinc-900"
        >
          {state.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          {state.message}
        </p>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          {state.ok && state.recordId ? (
            <Link
              href={`/records/${state.recordId}`}
              className="inline-flex h-10 items-center rounded-md border border-zinc-300 px-4 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
              onClick={onClose}
            >
              View record
            </Link>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className={`inline-flex h-10 items-center rounded-md px-4 text-sm font-medium text-white transition ${
              state.ok
                ? "bg-zinc-900 hover:bg-zinc-800"
                : "bg-red-700 hover:bg-red-600"
            }`}
          >
            {state.ok ? "OK" : "Try again"}
          </button>
        </div>
      </div>
    </div>
  );
}
