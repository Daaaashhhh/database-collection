import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { PageShell } from "@/components/layout/page-shell";

export const metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <PageShell
      backHref="/"
      backLabel="Home"
      showDefaultNav={false}
      mainClassName="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12"
    >
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-[#0a3d1f]">
          Sign in
        </h1>
        <p className="mt-2 text-[#4a6352]">
          Auth is skipped for now — this form is ready to wire up later.
        </p>
      </div>
      <div className="rounded-xl border border-[#c5dfc9] bg-white p-6 shadow-sm">
        <LoginForm />
      </div>
      <p className="mt-6 text-center text-sm text-[#4a6352]">
        <Link
          href="/"
          className="font-medium text-[#0d6b38] underline-offset-2 hover:underline"
        >
          ← Back to dashboard
        </Link>
      </p>
    </PageShell>
  );
}
