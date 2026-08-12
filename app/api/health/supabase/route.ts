import { NextResponse } from "next/server";

/**
 * Production diagnostics — does not expose secret values.
 * Open /api/health/supabase on the deployed site.
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

  const configured = Boolean(url && key);

  let canQuery = false;
  let error: string | null = null;

  if (configured) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { error: queryError } = await supabase
        .from("cbo_records")
        .select("id")
        .limit(1);
      if (queryError) {
        error = queryError.message;
      } else {
        canQuery = true;
      }
    } catch (e) {
      error = e instanceof Error ? e.message : "Unknown connection error";
    }
  } else {
    error =
      "Missing NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY on this deployment.";
  }

  return NextResponse.json({
    configured,
    canQuery,
    urlHost: url ? new URL(url).host : null,
    error,
  });
}
