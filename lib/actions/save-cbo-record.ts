"use server";

import { parseCboFormData, type CboFormPayload } from "@/lib/cbo/parse-form-data";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type SaveCboResult =
  | { ok: true; id: string }
  | { ok: false; message: string };

export type DeleteCboResult =
  | { ok: true }
  | { ok: false; message: string };

function rowFromPayload(payload: CboFormPayload) {
  return {
    organization_name: payload.organization_name || null,
    organization_short_name: payload.organization_short_name || null,
    office_address: payload.office_address || null,
    congressional_district: payload.congressional_district || null,
    cbo_president_name: payload.cbo_president_name || null,
    primary_contact_name: payload.primary_contact_name || null,
    primary_contact_email: payload.primary_contact_email || null,
    primary_contact_mobile: payload.primary_contact_mobile || null,
    cbo_assessment_status: payload.cbo_assessment_status || null,
    payload,
    updated_at: new Date().toISOString(),
  };
}

export async function saveCboRecordAction(
  formData: FormData,
): Promise<SaveCboResult> {
  try {
    const payload = parseCboFormData(formData);

    if (!payload.organization_name && !payload.organization_short_name) {
      return {
        ok: false,
        message:
          "Enter at least the organization name or short name before saving.",
      };
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("cbo_records")
      .insert(rowFromPayload(payload))
      .select("id")
      .single();

    if (error) {
      console.error("saveCboRecordAction", error);
      return {
        ok: false,
        message:
          error.message || "Could not save the record. Check Supabase setup.",
      };
    }

    if (!data?.id) {
      return {
        ok: false,
        message: "Save succeeded but no record id was returned.",
      };
    }

    return { ok: true, id: data.id };
  } catch (error) {
    console.error("saveCboRecordAction", error);
    const message =
      error instanceof Error
        ? error.message
        : "Could not save the record. Please try again.";
    return { ok: false, message };
  }
}

export async function updateCboRecordAction(
  recordId: string,
  formData: FormData,
): Promise<SaveCboResult> {
  try {
    if (!recordId) {
      return { ok: false, message: "Missing record id." };
    }

    const payload = parseCboFormData(formData);

    if (!payload.organization_name && !payload.organization_short_name) {
      return {
        ok: false,
        message:
          "Enter at least the organization name or short name before saving.",
      };
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("cbo_records")
      .update(rowFromPayload(payload))
      .eq("id", recordId)
      .select("id")
      .single();

    if (error) {
      console.error("updateCboRecordAction", error);
      return {
        ok: false,
        message:
          error.message ||
          "Could not update the record. Run the update/delete SQL policies in Supabase.",
      };
    }

    if (!data?.id) {
      return { ok: false, message: "Update failed — record not found." };
    }

    return { ok: true, id: data.id };
  } catch (error) {
    console.error("updateCboRecordAction", error);
    const message =
      error instanceof Error
        ? error.message
        : "Could not update the record. Please try again.";
    return { ok: false, message };
  }
}

export async function deleteCboRecordAction(
  recordId: string,
): Promise<DeleteCboResult> {
  try {
    if (!recordId) {
      return { ok: false, message: "Missing record id." };
    }

    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from("cbo_records")
      .delete()
      .eq("id", recordId);

    if (error) {
      console.error("deleteCboRecordAction", error);
      return {
        ok: false,
        message:
          error.message ||
          "Could not delete the record. Run the update/delete SQL policies in Supabase.",
      };
    }

    return { ok: true };
  } catch (error) {
    console.error("deleteCboRecordAction", error);
    const message =
      error instanceof Error
        ? error.message
        : "Could not delete the record. Please try again.";
    return { ok: false, message };
  }
}
