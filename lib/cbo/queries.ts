import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { CboRecordExportRow } from "@/lib/cbo/tabular-export";
import type { CboRecordListItem, CboRecordRow } from "@/lib/cbo/types";

const LIST_COLUMNS =
  "id, organization_name, organization_short_name, congressional_district, cbo_assessment_status, created_at";

function applySearchFilter<T extends { or: (filters: string) => T }>(
  query: T,
  searchQuery?: string,
) {
  const q = searchQuery?.trim();
  if (!q) return query;

  const safe = q.replace(/[%_,()"]/g, " ").replace(/\s+/g, " ").trim();
  if (!safe) return query;

  const pattern = `"%${safe}%"`;
  return query.or(
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

export async function listCboRecords(searchQuery?: string) {
  const supabase = getSupabaseServerClient();

  let query = supabase
    .from("cbo_records")
    .select(LIST_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(100);

  query = applySearchFilter(query, searchQuery);

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CboRecordListItem[];
}

export async function listCboRecordsForExport(searchQuery?: string) {
  const supabase = getSupabaseServerClient();

  let query = supabase
    .from("cbo_records")
    .select("id, created_at, updated_at, payload")
    .order("created_at", { ascending: false });

  query = applySearchFilter(query, searchQuery);

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CboRecordExportRow[];
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
