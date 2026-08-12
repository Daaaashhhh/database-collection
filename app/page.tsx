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
              href="/login"
              className="rounded-md px-3 py-1.5 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-zinc-900 px-3 py-1.5 font-medium text-white transition hover:bg-zinc-800"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-16">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-zinc-500">
          Foundation ready
        </p>
        <h1 className="mt-3 max-w-2xl font-sans text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
          Collect form data into PostgreSQL.
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-zinc-600">
          EPAHP CBO Information Sheet Step 1 UI is ready. Database save and
          authentication are not wired yet.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/forms/cbo"
            className="inline-flex h-11 items-center rounded-md bg-zinc-900 px-5 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Open CBO form
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center rounded-md border border-zinc-300 bg-white px-5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
          >
            Sign in
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <h2 className="font-medium text-zinc-900">PostgreSQL</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              Connection helper in <code className="text-zinc-800">lib/db.ts</code>{" "}
              and schema in <code className="text-zinc-800">db/schema.sql</code>.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <h2 className="font-medium text-zinc-900">Auth UI</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              Login and signup forms validate input and are ready to connect to
              real auth later.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <h2 className="font-medium text-zinc-900">CBO form</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              Full CBO Information Sheet UI (Steps 1–5) at{" "}
              <code className="text-zinc-800">/forms/cbo</code>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
