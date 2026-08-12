import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { CboRecordListItem, CboRecordRow } from "@/lib/cbo/types";

const LIST_COLUMNS =
  "id, organization_name, organization_short_name, congressional_district, cbo_assessment_status, created_at";

export async function listCboRecords(searchQuery?: string) {
  const supabase = getSupabaseServerClient();
  const q = searchQuery?.trim();

  let query = supabase
    .from("cbo_records")
    .select(LIST_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(100);

  if (q) {
    // Strip characters that break PostgREST `.or()` filter syntax.
    const safe = q.replace(/[%_,()"]/g, " ").replace(/\s+/g, " ").trim();
    if (safe) {
      const pattern = `"%${safe}%"`;
      query = query.or(
        [
          `organization_name.ilike.${pattern}`,
          `organization_short_name.ilike.${pattern}`,
          `office_address.ilike.${pattern}`,
          `cbo_president_name.ilike.${pattern}`,
          `primary_contact_name.ilike.${pattern}`,
          `primary_contact_email.ilike.${pattern}`,
        ].join(","),
      );
    }
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CboRecordListItem[];
}

export async function getCboRecordById(id: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("cbo_records")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as CboRecordRow | null) ?? null;
}
