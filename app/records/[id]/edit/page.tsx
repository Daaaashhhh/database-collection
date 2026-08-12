import Link from "next/link";
import { notFound } from "next/navigation";
import { CboInformationSheet } from "@/components/forms/cbo/cbo-information-sheet";
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
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 px-4">
          <Link
            href={`/records/${id}`}
            className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
          >
            ← Back to view
          </Link>
          <Link
            href="/records"
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
          >
            All records
          </Link>
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
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <span className="font-medium">Edit</span> — changes are saved over
              this existing record when you click Update.
            </div>
            <CboInformationSheet
              mode="edit"
              recordId={record.id}
              initialData={payload}
            />
          </>
        ) : null}
      </main>
    </div>
  );
}
