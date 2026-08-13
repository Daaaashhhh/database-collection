"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteCboRecordAction } from "@/lib/actions/save-cbo-record";

export function DeleteRecordButton({
  recordId,
  organizationLabel,
  variant = "default",
}: {
  recordId: string;
  organizationLabel: string;
  variant?: "default" | "header";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleDelete() {
    const ok = window.confirm(
      `Delete “${organizationLabel}”? This cannot be undone.`,
    );
    if (!ok) return;

    setError("");
    startTransition(async () => {
      const result = await deleteCboRecordAction(recordId);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.push("/records");
      router.refresh();
    });
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className={
          variant === "header"
            ? "rounded-md border border-red-300/50 bg-red-900/25 px-3 py-1.5 text-sm font-medium text-red-100 transition hover:bg-red-900/40 disabled:opacity-60"
            : "rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
        }
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
