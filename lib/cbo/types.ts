import type { CboFormPayload } from "@/lib/cbo/parse-form-data";

export type CboRecordRow = {
  id: string;
  organization_name: string | null;
  organization_short_name: string | null;
  office_address: string | null;
  congressional_district: string | null;
  cbo_president_name: string | null;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  primary_contact_mobile: string | null;
  cbo_assessment_status: string | null;
  payload: CboFormPayload;
  created_at: string;
  updated_at: string;
};

export type CboRecordListItem = Pick<
  CboRecordRow,
  | "id"
  | "organization_name"
  | "organization_short_name"
  | "congressional_district"
  | "cbo_assessment_status"
  | "created_at"
>;
