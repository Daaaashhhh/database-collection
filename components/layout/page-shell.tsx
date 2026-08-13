import Link from "next/link";
import type { ReactNode } from "react";
import { FORM_LOGO_PATHS } from "@/lib/cbo/form-logos";

type AppHeaderProps = {
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
  /** Show default Saved records / New CBO form links (default: true when no custom actions). */
  showDefaultNav?: boolean;
};

export function AppHeader({
  backHref,
  backLabel = "Back",
  actions,
  showDefaultNav = true,
}: AppHeaderProps) {
  return (
    <header className="border-b border-[#084a24] bg-[#0d6b38] text-white shadow-md">
      <div className="mx-auto flex min-h-16 w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-2">
        <div className="flex min-w-0 flex-wrap items-center gap-3 sm:gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={FORM_LOGO_PATHS.dashboard}
              alt="EPAHP"
              className="size-11 rounded-full ring-2 ring-[#f5c518]/80 ring-offset-2 ring-offset-[#0d6b38]"
            />
            <div className="leading-tight">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#f5e6a8]">
                EPAHP
              </p>
              <p className="text-sm font-semibold sm:text-base">
                Database Collection
              </p>
            </div>
          </Link>
          {backHref ? (
            <>
              <span className="hidden text-white/30 sm:inline" aria-hidden>
                |
              </span>
              <Link
                href={backHref}
                className="text-sm font-medium text-white/85 transition hover:text-white"
              >
                ← {backLabel}
              </Link>
            </>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          {actions}
          {showDefaultNav && !actions ? (
            <>
              <Link
                href="/records"
                className="rounded-md px-3 py-2 text-white/90 transition hover:bg-white/10 hover:text-white"
              >
                Saved records
              </Link>
              <Link
                href="/forms/cbo"
                className="rounded-md bg-[#f5c518] px-3 py-2 font-semibold text-[#0a3d1f] transition hover:bg-[#ffcf33]"
              >
                New CBO form
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-[#c5dfc9] bg-[#0d6b38] py-4 text-center text-xs text-white/80">
      DSWD Field Office XI · EPAHP · Community-Based Organization Database
    </footer>
  );
}

type PageShellProps = {
  children: ReactNode;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
  showDefaultNav?: boolean;
  mainClassName?: string;
};

export function PageShell({
  children,
  backHref,
  backLabel,
  actions,
  showDefaultNav,
  mainClassName = "mx-auto w-full max-w-5xl flex-1 px-4 py-8",
}: PageShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader
        backHref={backHref}
        backLabel={backLabel}
        actions={actions}
        showDefaultNav={showDefaultNav}
      />
      <main className={mainClassName}>{children}</main>
      <AppFooter />
    </div>
  );
}

/** Shared header action button styles for use in page actions slots. */
export const headerActionClass = {
  primary:
    "rounded-md bg-[#f5c518] px-3 py-2 font-semibold text-[#0a3d1f] transition hover:bg-[#ffcf33]",
  secondary:
    "rounded-md border border-white/35 px-3 py-2 font-medium text-white transition hover:bg-white/10",
  danger:
    "rounded-md border border-red-300/50 bg-red-900/25 px-3 py-1.5 font-medium text-red-100 transition hover:bg-red-900/40",
} as const;
