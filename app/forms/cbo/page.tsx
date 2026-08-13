import Link from "next/link";
import { CboInformationSheet } from "@/components/forms/cbo/cbo-information-sheet";
import { PageShell } from "@/components/layout/page-shell";

export const metadata = {
  title: "CBO Information Sheet",
};

export default function CboFormPage() {
  return (
    <PageShell
      backHref="/"
      backLabel="Home"
      actions={
        <Link
          href="/records"
          className="rounded-md border border-white/35 px-3 py-2 font-medium text-white transition hover:bg-white/10"
        >
          Saved records
        </Link>
      }
      showDefaultNav={false}
      mainClassName="mx-auto w-full max-w-5xl flex-1 px-3 py-6 sm:px-4 sm:py-10"
    >
      <CboInformationSheet />
    </PageShell>
  );
}
