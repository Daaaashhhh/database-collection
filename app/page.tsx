import Link from "next/link";
import { FORM_LOGO_PATHS } from "@/lib/cbo/form-logos";
import { AppFooter, AppHeader } from "@/components/layout/page-shell";

const QUICK_LINKS = [
  {
    href: "/forms/cbo",
    title: "New CBO form",
    description:
      "Fill the Community-Based Organization Information Sheet, save to Supabase, and download Excel.",
    primary: true,
  },
  {
    href: "/records",
    title: "Saved records",
    description:
      "Browse, search, view, edit, and export saved CBO records.",
    primary: false,
  },
] as const;

const FEATURES = [
  {
    title: "Digital CBO form",
    description:
      "Full EPAHP information sheet with validation, signatures, and draft autosave.",
  },
  {
    title: "Supabase storage",
    description:
      "Records persist in cbo_records — run db/supabase-cbo-records.sql once to set up.",
  },
  {
    title: "Excel export",
    description:
      "Download form-layout or merged-column exports for printing and reporting.",
  },
] as const;

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader showDefaultNav />

      <main className="flex flex-1 flex-col">
        <section className="border-b border-[#c5dfc9] bg-gradient-to-br from-[#e9f5ec] via-[#f4faf5] to-[#fef9e7]">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-4 py-12 sm:flex-row sm:items-center sm:py-16">
            <div className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={FORM_LOGO_PATHS.dashboard}
                alt="Enhanced Partnership Against Hunger and Poverty"
                className="size-36 rounded-full shadow-lg ring-4 ring-[#0d6b38]/15 sm:size-44"
              />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0d6b38]">
                Enhanced Partnership Against Hunger and Poverty
              </p>
              <h1 className="mt-2 text-3xl font-bold leading-tight text-[#0a3d1f] sm:text-4xl">
                Community-Based Organization
                <span className="block text-[#0d6b38]">Information System</span>
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-[#3d5c47]">
                Collect, store, and manage CBO information sheets for DSWD Field
                Office XI — with search, Excel export, and print-ready downloads.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
                <Link
                  href="/forms/cbo"
                  className="inline-flex h-11 items-center rounded-lg bg-[#0d6b38] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0a5a2f]"
                >
                  Open CBO form
                </Link>
                <Link
                  href="/records"
                  className="inline-flex h-11 items-center rounded-lg border-2 border-[#0d6b38] bg-white px-6 text-sm font-semibold text-[#0d6b38] transition hover:bg-[#e9f5ec]"
                >
                  View saved records
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
          <div className="grid gap-4 sm:grid-cols-2">
            {QUICK_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`group rounded-2xl border p-6 transition hover:-translate-y-0.5 hover:shadow-md ${
                  item.primary
                    ? "border-[#0d6b38]/25 bg-[#0d6b38] text-white hover:border-[#0d6b38]"
                    : "border-[#c5dfc9] bg-white hover:border-[#0d6b38]/40"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2
                    className={`text-lg font-semibold ${
                      item.primary ? "text-white" : "text-[#0a3d1f]"
                    }`}
                  >
                    {item.title}
                  </h2>
                  <span
                    className={`text-lg transition group-hover:translate-x-0.5 ${
                      item.primary ? "text-[#f5c518]" : "text-[#0d6b38]"
                    }`}
                    aria-hidden
                  >
                    →
                  </span>
                </div>
                <p
                  className={`mt-2 text-sm leading-relaxed ${
                    item.primary ? "text-white/85" : "text-[#4a6352]"
                  }`}
                >
                  {item.description}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-[#c5dfc9] bg-white p-5 shadow-sm"
              >
                <div className="mb-3 h-1 w-10 rounded-full bg-[#f5c518]" />
                <h3 className="font-semibold text-[#0a3d1f]">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4a6352]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}
