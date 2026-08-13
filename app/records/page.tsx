import Link from "next/link";
import { DownloadAllRecordsButton } from "@/components/records/download-all-records-button";
import { RecordsSearch } from "@/components/records/records-search";
import { DeleteRecordButton } from "@/components/records/delete-record-button";
import { PageShell } from "@/components/layout/page-shell";
import { listCboRecords } from "@/lib/cbo/queries";

export const metadata = {
  title: "Saved CBO records",
};

type RecordsPageProps = {
  searchParams: Promise<{ q?: string }>;
};

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function formatStatus(value: string | null) {
  if (!value) return "—";
  return value.replaceAll("_", " ");
}

export default async function RecordsPage({ searchParams }: RecordsPageProps) {
  const { q = "" } = await searchParams;
  let records: Awaited<ReturnType<typeof listCboRecords>> = [];
  let errorMessage = "";

  try {
    records = await listCboRecords(q);
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "Could not load records. Check Supabase env vars and migration.";
  }

  return (
    <PageShell backHref="/" backLabel="Home">
      <h1 className="text-2xl font-bold tracking-tight text-[#0a3d1f]">
        Saved CBO records
      </h1>
      <p className="mt-2 text-sm text-[#4a6352]">
        Search, view (read), edit, or delete saved CBO information sheets. Use{" "}
        <strong className="font-medium text-[#0d6b38]">
          Download all (columns)
        </strong>{" "}
        for a spreadsheet with one row per CBO.
      </p>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1">
          <RecordsSearch initialQuery={q} />
        </div>
        <DownloadAllRecordsButton
          searchQuery={q}
          disabled={Boolean(errorMessage)}
        />
      </div>

      {errorMessage ? (
        <p className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {errorMessage}
        </p>
      ) : null}

      {!errorMessage && records.length === 0 ? (
        <p className="mt-8 text-sm text-[#4a6352]">
          {q
            ? `No records matched “${q}”.`
            : "No saved records yet. Submit a CBO form to create one."}
        </p>
      ) : null}

      {records.length > 0 ? (
        <div className="mt-6 overflow-x-auto rounded-lg border border-[#c5dfc9] bg-white shadow-sm">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead className="bg-[#e9f5ec] text-left text-[#0a3d1f]">
              <tr>
                <th className="border-b border-[#c5dfc9] px-3 py-2 font-semibold">
                  Organization
                </th>
                <th className="border-b border-[#c5dfc9] px-3 py-2 font-semibold">
                  Short name
                </th>
                <th className="border-b border-[#c5dfc9] px-3 py-2 font-semibold">
                  District
                </th>
                <th className="border-b border-[#c5dfc9] px-3 py-2 font-semibold">
                  Assessment
                </th>
                <th className="border-b border-[#c5dfc9] px-3 py-2 font-semibold">
                  Saved
                </th>
                <th className="border-b border-[#c5dfc9] px-3 py-2 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => {
                const label =
                  record.organization_name ||
                  record.organization_short_name ||
                  "Untitled organization";
                return (
                  <tr key={record.id} className="hover:bg-[#f4faf5]">
                    <td className="border-b border-[#e9f5ec] px-3 py-3">
                      <Link
                        href={`/records/${record.id}`}
                        className="font-medium text-[#0d6b38] underline-offset-2 hover:underline"
                      >
                        {label}
                      </Link>
                    </td>
                    <td className="border-b border-[#e9f5ec] px-3 py-3 text-[#4a6352]">
                      {record.organization_short_name || "—"}
                    </td>
                    <td className="border-b border-[#e9f5ec] px-3 py-3 text-[#4a6352]">
                      {record.congressional_district || "—"}
                    </td>
                    <td className="border-b border-[#e9f5ec] px-3 py-3 capitalize text-[#4a6352]">
                      {formatStatus(record.cbo_assessment_status)}
                    </td>
                    <td className="border-b border-[#e9f5ec] px-3 py-3 text-[#4a6352]">
                      {formatDate(record.created_at)}
                    </td>
                    <td className="border-b border-[#e9f5ec] px-3 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/records/${record.id}`}
                          className="rounded-md border border-[#0d6b38]/30 px-2.5 py-1 text-xs font-medium text-[#0d6b38] hover:bg-[#e9f5ec]"
                        >
                          View
                        </Link>
                        <Link
                          href={`/records/${record.id}/edit`}
                          className="rounded-md border border-[#0d6b38]/30 px-2.5 py-1 text-xs font-medium text-[#0d6b38] hover:bg-[#e9f5ec]"
                        >
                          Edit
                        </Link>
                        <DeleteRecordButton
                          recordId={record.id}
                          organizationLabel={label}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </PageShell>
  );
}
