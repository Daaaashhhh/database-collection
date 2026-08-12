import Link from "next/link";
import { RecordsSearch } from "@/components/records/records-search";
import { DeleteRecordButton } from "@/components/records/delete-record-button";
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
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 px-4">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
          >
            ← Database Collection
          </Link>
          <Link
            href="/forms/cbo"
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            New CBO form
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Saved CBO records
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Search, view (read), edit, or delete saved CBO information sheets.
        </p>

        <div className="mt-6">
          <RecordsSearch initialQuery={q} />
        </div>

        {errorMessage ? (
          <p className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {errorMessage}
          </p>
        ) : null}

        {!errorMessage && records.length === 0 ? (
          <p className="mt-8 text-sm text-zinc-600">
            {q
              ? `No records matched “${q}”.`
              : "No saved records yet. Submit a CBO form to create one."}
          </p>
        ) : null}

        {records.length > 0 ? (
          <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 bg-white">
            <table className="w-full min-w-[860px] border-collapse text-sm">
              <thead className="bg-zinc-50 text-left">
                <tr>
                  <th className="border-b border-zinc-200 px-3 py-2 font-medium">
                    Organization
                  </th>
                  <th className="border-b border-zinc-200 px-3 py-2 font-medium">
                    Short name
                  </th>
                  <th className="border-b border-zinc-200 px-3 py-2 font-medium">
                    District
                  </th>
                  <th className="border-b border-zinc-200 px-3 py-2 font-medium">
                    Assessment
                  </th>
                  <th className="border-b border-zinc-200 px-3 py-2 font-medium">
                    Saved
                  </th>
                  <th className="border-b border-zinc-200 px-3 py-2 font-medium">
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
                    <tr key={record.id} className="hover:bg-zinc-50">
                      <td className="border-b border-zinc-100 px-3 py-3">
                        <Link
                          href={`/records/${record.id}`}
                          className="font-medium text-zinc-900 underline-offset-2 hover:underline"
                        >
                          {label}
                        </Link>
                      </td>
                      <td className="border-b border-zinc-100 px-3 py-3 text-zinc-700">
                        {record.organization_short_name || "—"}
                      </td>
                      <td className="border-b border-zinc-100 px-3 py-3 text-zinc-700">
                        {record.congressional_district || "—"}
                      </td>
                      <td className="border-b border-zinc-100 px-3 py-3 capitalize text-zinc-700">
                        {formatStatus(record.cbo_assessment_status)}
                      </td>
                      <td className="border-b border-zinc-100 px-3 py-3 text-zinc-600">
                        {formatDate(record.created_at)}
                      </td>
                      <td className="border-b border-zinc-100 px-3 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/records/${record.id}`}
                            className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
                          >
                            View
                          </Link>
                          <Link
                            href={`/records/${record.id}/edit`}
                            className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
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
      </main>
    </div>
  );
}
