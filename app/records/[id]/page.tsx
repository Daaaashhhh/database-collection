import Link from "next/link";
import { notFound } from "next/navigation";
import { CboInformationSheet } from "@/components/forms/cbo/cbo-information-sheet";
import { DeleteRecordButton } from "@/components/records/delete-record-button";
import { getCboRecordById } from "@/lib/cbo/queries";
import type { CboFormPayload } from "@/lib/cbo/parse-form-data";

type RecordDetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default async function RecordDetailPage({
  params,
}: RecordDetailPageProps) {
  const { id } = await params;
  let record: Awaited<ReturnType<typeof getCboRecordById>> = null;
  let loadError = "";

  try {
    record = await getCboRecordById(id);
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Could not load this record.";
  }

  if (!loadError && !record) {
    notFound();
  }

  const payload = (record?.payload ?? null) as CboFormPayload | null;
  const label =
    record?.organization_name ||
    record?.organization_short_name ||
    "Untitled organization";

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 px-4">
          <Link
            href="/records"
            className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
          >
            ← Saved records
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <span className="mr-1 hidden text-zinc-500 sm:inline">
              {record ? formatDate(record.created_at) : null}
            </span>
            {record ? (
              <>
                <Link
                  href={`/records/${record.id}/edit`}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 font-medium text-zinc-800 transition hover:bg-zinc-50"
                >
                  Edit
                </Link>
                <DeleteRecordButton
                  recordId={record.id}
                  organizationLabel={label}
                />
              </>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-3 py-6 sm:px-4 sm:py-10">
        {loadError ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {loadError}
          </p>
        ) : null}

        {record && payload ? (
          <>
            <h1 className="mb-3 text-xl font-semibold text-zinc-900">{label}</h1>
            <div className="mb-4 rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600">
              <span className="font-medium text-zinc-800">Read</span> — viewing
              saved record in the original form layout (read-only). Use{" "}
              <Link
                href={`/records/${record.id}/edit`}
                className="font-medium underline underline-offset-2"
              >
                Edit
              </Link>{" "}
              to make changes.
            </div>
            <CboInformationSheet mode="view" initialData={payload} />
          </>
        ) : null}
      </main>
    </div>
  );
}
