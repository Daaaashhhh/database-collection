import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          <Link href="/" className="font-semibold tracking-tight text-zinc-900">
            Database Collection
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/records"
              className="rounded-md px-3 py-1.5 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
            >
              Saved records
            </Link>
            <Link
              href="/forms/cbo"
              className="rounded-md bg-zinc-900 px-3 py-1.5 font-medium text-white transition hover:bg-zinc-800"
            >
              New CBO form
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-16">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-zinc-500">
          EPAHP · CBO
        </p>
        <h1 className="mt-3 max-w-2xl font-sans text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
          Collect and search CBO information sheets.
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-zinc-600">
          Fill the Community-Based Organization form, save to Supabase, and
          browse records with search. Excel download remains available on the
          form.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/forms/cbo"
            className="inline-flex h-11 items-center rounded-md bg-zinc-900 px-5 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Open CBO form
          </Link>
          <Link
            href="/records"
            className="inline-flex h-11 items-center rounded-md border border-zinc-300 bg-white px-5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
          >
            Saved records
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <h2 className="font-medium text-zinc-900">Supabase</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              Records store in <code className="text-zinc-800">cbo_records</code>{" "}
              — run{" "}
              <code className="text-zinc-800">db/supabase-cbo-records.sql</code>{" "}
              once.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <h2 className="font-medium text-zinc-900">CBO form</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              Full information sheet at{" "}
              <code className="text-zinc-800">/forms/cbo</code> with Save and
              Download Excel.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <h2 className="font-medium text-zinc-900">Search</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              Browse and search saved organizations at{" "}
              <code className="text-zinc-800">/records</code>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
