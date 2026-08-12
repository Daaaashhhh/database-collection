import Link from "next/link";
import { CboInformationSheet } from "@/components/forms/cbo/cbo-information-sheet";

export const metadata = {
  title: "CBO Information Sheet",
};

export default function CboFormPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
          >
            ← Database Collection
          </Link>
          <span className="text-sm text-zinc-500">Steps 1–5 · UI only</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-3 py-6 sm:px-4 sm:py-10">
        <CboInformationSheet />
      </main>
    </div>
  );
}
