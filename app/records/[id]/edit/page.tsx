import Link from "next/link";
import { notFound } from "next/navigation";
import { CboInformationSheet } from "@/components/forms/cbo/cbo-information-sheet";
import { headerActionClass, PageShell } from "@/components/layout/page-shell";
import { getCboRecordById } from "@/lib/cbo/queries";
import type { CboFormPayload } from "@/lib/cbo/parse-form-data";

type EditRecordPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata = {
  title: "Edit CBO record",
};

export default async function EditRecordPage({ params }: EditRecordPageProps) {
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

  return (
    <PageShell
      backHref={`/records/${id}`}
      backLabel="Back to view"
      showDefaultNav={false}
      actions={
        <Link href="/records" className={headerActionClass.secondary}>
          All records
        </Link>
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
          <div className="mb-4 rounded-md border border-[#f5c518]/50 bg-[#fef9e7] px-4 py-3 text-sm text-[#5c4a12]">
            <span className="font-semibold text-[#0d6b38]">Edit</span> — changes
            are saved over this existing record when you click Update.
          </div>
          <CboInformationSheet
            mode="edit"
            recordId={record.id}
            initialData={payload}
          />
        </>
      ) : null}
    </PageShell>
  );
}
