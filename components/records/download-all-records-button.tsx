"use client";

import { useState } from "react";
import { exportAllCboTabularExcelAction } from "@/lib/actions/export-cbo-tabular-excel";
import { downloadBase64Excel } from "@/lib/download-excel";

type DownloadAllRecordsButtonProps = {
  searchQuery: string;
  disabled?: boolean;
};

export function DownloadAllRecordsButton({
  searchQuery,
  disabled = false,
}: DownloadAllRecordsButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleDownload() {
    setLoading(true);
    setMessage("");

    try {
      const result = await exportAllCboTabularExcelAction(
        searchQuery.trim() || undefined,
      );
      downloadBase64Excel(result.base64, result.filename);
      setMessage(
        result.count === 0
          ? "No records to export."
          : `Downloaded ${result.count} record${result.count === 1 ? "" : "s"} as columns.`,
      );
    } catch (error) {
      console.error(error);
      setMessage("Could not generate the export. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const label = searchQuery.trim()
    ? "Download filtered (columns)"
    : "Download all (columns)";

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => void handleDownload()}
        disabled={disabled || loading}
        className="inline-flex h-10 items-center rounded-md border border-[#0d6b38]/35 bg-white px-4 text-sm font-semibold text-[#0d6b38] transition hover:bg-[#e9f5ec] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Preparing export…" : label}
      </button>
      {message ? (
        <p className="text-xs text-zinc-600" aria-live="polite">
          {message}
        </p>
      ) : null}
    </div>
  );
}
