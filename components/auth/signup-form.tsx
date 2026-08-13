"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signupAction, type AuthFormState } from "@/lib/actions/auth";

const initialState: AuthFormState = {
  ok: false,
  message: "",
};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(
    signupAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium text-zinc-700">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className="h-11 rounded-md border border-[#c5dfc9] bg-white px-3 text-[#0a3d1f] outline-none ring-[#0d6b38]/30 transition focus:ring-2"
          placeholder="Your name"
        />
        {state.fieldErrors?.name?.[0] ? (
          <p className="text-sm text-red-600">{state.fieldErrors.name[0]}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-zinc-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-11 rounded-md border border-[#c5dfc9] bg-white px-3 text-[#0a3d1f] outline-none ring-[#0d6b38]/30 transition focus:ring-2"
          placeholder="you@example.com"
        />
        {state.fieldErrors?.email?.[0] ? (
          <p className="text-sm text-red-600">{state.fieldErrors.email[0]}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium text-zinc-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="h-11 rounded-md border border-[#c5dfc9] bg-white px-3 text-[#0a3d1f] outline-none ring-[#0d6b38]/30 transition focus:ring-2"
          placeholder="At least 8 characters"
        />
        {state.fieldErrors?.password?.[0] ? (
          <p className="text-sm text-red-600">{state.fieldErrors.password[0]}</p>
        ) : null}
      </div>

      {state.message ? (
        <p
          className={`rounded-md px-3 py-2 text-sm ${
            state.ok
              ? "bg-emerald-50 text-emerald-800"
              : "bg-amber-50 text-amber-900"
          }`}
          aria-live="polite"
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-md bg-[#0d6b38] text-sm font-semibold text-white transition hover:bg-[#0a5a2f] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-sm text-zinc-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[#0d6b38] underline-offset-2 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
