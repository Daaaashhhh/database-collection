import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
          >
            ← Database Collection
          </Link>
          <h1 className="mt-4 font-sans text-3xl font-semibold tracking-tight text-zinc-900">
            Sign in
          </h1>
          <p className="mt-2 text-zinc-600">
            Auth is skipped for now — this form is ready to wire up later.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
