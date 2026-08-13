import Link from "next/link";
import { notFound } from "next/navigation";
import { CboInformationSheet } from "@/components/forms/cbo/cbo-information-sheet";
import { DeleteRecordButton } from "@/components/records/delete-record-button";
import {
  headerActionClass,
  PageShell,
} from "@/components/layout/page-shell";
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
    <PageShell
      backHref="/records"
      backLabel="Saved records"
      showDefaultNav={false}
      actions={
        record ? (
          <>
            <span className="mr-1 hidden text-white/70 sm:inline">
              {formatDate(record.created_at)}
            </span>
            <Link
              href={`/records/${record.id}/edit`}
              className={headerActionClass.primary}
            >
              Edit
            </Link>
            <DeleteRecordButton
              recordId={record.id}
              organizationLabel={label}
              variant="header"
            />
          </>
        ) : null
      }
      mainClassName="mx-auto w-full max-w-5xl flex-1 px-3 py-6 sm:px-4 sm:py-10"
    >
      {loadError ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {loadError}
        </p>
      ) : null}

      {record && payload ? (
        <>
          <h1 className="mb-3 text-xl font-bold text-[#0a3d1f]">{label}</h1>
          <div className="mb-4 rounded-md border border-[#c5dfc9] bg-[#e9f5ec] px-4 py-3 text-sm text-[#3d5c47]">
            <span className="font-semibold text-[#0d6b38]">Read</span> — viewing
            saved record in the original form layout (read-only). Use{" "}
            <Link
              href={`/records/${record.id}/edit`}
              className="font-semibold text-[#0d6b38] underline underline-offset-2"
            >
              Edit
            </Link>{" "}
            to make changes.
          </div>
          <CboInformationSheet mode="view" initialData={payload} />
        </>
      ) : null}
    </PageShell>
  );
}
