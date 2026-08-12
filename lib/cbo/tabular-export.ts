import type { CboFormPayload } from "@/lib/cbo/parse-form-data";
import {
  CBO_ADDITIONAL_ITEMS,
  CBO_DOCUMENT_KEYS,
  CBO_FINANCIAL_ITEMS,
  CBO_INTERVENTION_ROW_COUNT,
  CBO_PROCUREMENT_KEYS,
  CBO_PRODUCTION_ROW_COUNT,
  CBO_REGISTRATION_AGENCIES,
  CBO_SECTORAL_KEYS,
} from "@/lib/cbo/parse-form-data";
import type { CboRecordRow } from "@/lib/cbo/types";

export type TabularColumn = {
  key: string;
  header: string;
};

export type CboRecordExportRow = Pick<
  CboRecordRow,
  "id" | "created_at" | "updated_at" | "payload"
>;

function col(key: string, header: string): TabularColumn {
  return { key, header };
}

function boolValue(value: boolean | undefined | null): string {
  return value ? "Yes" : "No";
}

function str(value: string | null | undefined): string {
  return value ?? "";
}

function buildColumns(): TabularColumn[] {
  const columns: TabularColumn[] = [
    col("id", "Record ID"),
    col("created_at", "Created At"),
    col("updated_at", "Updated At"),

    col("mode_of_collection", "Mode of Collection"),
    col("validation_activities_count", "Validation Activities Count"),
    col("date_of_accomplishment", "Date of Accomplishment"),
    col("time_started", "Time Started"),
    col("time_ended", "Time Ended"),

    col("organization_name", "A.1 Organization Name"),
    col("organization_short_name", "A.2 Organization Short Name"),
    col("office_address", "A.3 Office Address"),
    col("cbo_representation", "A.4 CBO Representation"),
    col("congressional_district", "A.5 Congressional District"),

    col("organization_registration", "Organization Registration"),
    col("organization_registration_other", "Organization Registration (Other)"),
    col("date_established", "Date Established"),
    col("psic_classification", "PSIC Classification"),
    col("target_members", "Target Members"),
    col("cbo_president_name", "CBO President Name"),
    col("female_led", "Female Led"),
    col("members_agricultural_total", "Members Agricultural Total"),
    col("members_agricultural_male", "Members Agricultural Male"),
    col("members_agricultural_female", "Members Agricultural Female"),
    col("members_other_food_sectors_total", "Members Other Food Sectors Total"),
  ];

  for (const key of CBO_SECTORAL_KEYS) {
    columns.push(col(`sectoral_${key}`, `Sectoral ${key.replaceAll("_", " ")}`));
  }

  for (let i = 1; i <= CBO_PRODUCTION_ROW_COUNT; i += 1) {
    for (const field of [
      "product",
      "type",
      "quantity",
      "unit",
      "market_value",
    ] as const) {
      columns.push(
        col(
          `production_${i}_${field}`,
          `Production ${i} ${field.replaceAll("_", " ")}`,
        ),
      );
    }
  }

  columns.push(
    col("production_total_quantity", "Production Total Quantity"),
    col("production_total_market_value", "Production Total Market Value"),
    col("area_scope_production", "Area Scope of Production"),
    col("current_assets_amount", "Current Assets Amount"),
    col("annual_gross_income", "Annual Gross Income"),
    col("area_scope_sales", "Area Scope of Sales"),
    col("total_liabilities", "Total Liabilities"),
    col("procurement_no_experience", "Procurement No Experience"),
  );

  for (const key of CBO_PROCUREMENT_KEYS) {
    columns.push(
      col(`procurement_${key}_selected`, `Procurement ${key} Selected`),
      col(`procurement_${key}_participation`, `Procurement ${key} Participation`),
      col(
        `procurement_${key}_contracts_won`,
        `Procurement ${key} Contracts Won`,
      ),
      col(
        `procurement_${key}_successful_implementation`,
        `Procurement ${key} Successful Implementation`,
      ),
    );
    if (key === "others") {
      columns.push(col("procurement_others_other", "Procurement Others Detail"));
    }
  }

  columns.push(
    col("sponsor_agency", "Sponsor Agency"),
    col("other_sponsor_agencies", "Other Sponsor Agencies"),
  );

  for (const key of CBO_DOCUMENT_KEYS) {
    columns.push(col(`documents_${key}`, `Document ${key.replaceAll("_", " ")}`));
  }

  columns.push(
    col("primary_contact_name", "A.6 Contact Person (Primary) Name"),
    col("primary_contact_designation", "A.7 Contact Person (Primary) Designation"),
    col("primary_contact_email", "A.8 Contact Person (Primary) Email"),
    col("primary_contact_telephone", "A.9 Contact Person (Primary) Telephone"),
    col("primary_contact_mobile", "A.10 Contact Person (Primary) Mobile"),
    col("secondary_contact_name", "A.11 Contact Person (Secondary) Name"),
    col("secondary_contact_designation", "A.12 Contact Person (Secondary) Designation"),
    col("secondary_contact_email", "A.13 Contact Person (Secondary) Email"),
    col("secondary_contact_telephone", "A.14 Contact Person (Secondary) Telephone"),
    col("secondary_contact_mobile", "A.15 Contact Person (Secondary) Mobile"),
    col(
      "legal_certificate_of_registration",
      "Legal Certificate of Registration",
    ),
  );

  for (const [agencyKey, fields] of Object.entries(CBO_REGISTRATION_AGENCIES)) {
    columns.push(
      col(
        `registration_${agencyKey}_selected`,
        `Registration ${agencyKey.toUpperCase()} Selected`,
      ),
    );
    for (const field of fields) {
      columns.push(
        col(
          `registration_${agencyKey}_${field}`,
          `Registration ${agencyKey.toUpperCase()} ${field.replaceAll("_", " ")}`,
        ),
      );
    }
  }

  for (const [itemKey, fields] of Object.entries(CBO_FINANCIAL_ITEMS)) {
    columns.push(
      col(`financial_${itemKey}_selected`, `Financial ${itemKey} Selected`),
    );
    for (const field of fields) {
      columns.push(
        col(
          `financial_${itemKey}_${field}`,
          `Financial ${itemKey} ${field.replaceAll("_", " ")}`,
        ),
      );
    }
  }

  for (const [itemKey, fields] of Object.entries(CBO_ADDITIONAL_ITEMS)) {
    columns.push(
      col(`additional_${itemKey}_selected`, `Additional ${itemKey} Selected`),
    );
    for (const field of fields) {
      columns.push(
        col(
          `additional_${itemKey}_${field}`,
          `Additional ${itemKey} ${field.replaceAll("_", " ")}`,
        ),
      );
    }
  }

  for (let i = 1; i <= CBO_INTERVENTION_ROW_COUNT; i += 1) {
    for (const field of [
      "partner_agency",
      "intervention",
      "ppas",
      "amount",
      "date_received",
    ] as const) {
      columns.push(
        col(
          `intervention_${i}_${field}`,
          `Intervention ${i} ${field.replaceAll("_", " ")}`,
        ),
      );
    }
  }

  columns.push(
    col("cbo_assessment_status", "CBO Assessment Status"),
    col("rct_deliberation", "RCT Deliberation"),
    col("date_confirmed_epahp_qualified", "Date Confirmed EPAHP Qualified"),
    col("validator_field_pdo_name", "Validator Field PDO Name"),
    col("validator_rpc_name", "Validator RPC Name"),
    col("validator_approval_date", "Validator Approval Date"),
  );

  return columns;
}

export const CBO_TABULAR_COLUMNS = buildColumns();

function emptyPayload(): CboFormPayload {
  return {
    signature_name: "",
    mode_of_collection: "",
    validation_activities_count: "",
    date_of_accomplishment: "",
    time_started: "",
    time_ended: "",
    organization_name: "",
    organization_short_name: "",
    office_address: "",
    cbo_representation: "",
    congressional_district: "",
    organization_registration: "",
    organization_registration_other: "",
    date_established: "",
    psic_classification: "",
    target_members: "",
    cbo_president_name: "",
    female_led: "",
    members_agricultural_total: "",
    members_agricultural_male: "",
    members_agricultural_female: "",
    members_other_food_sectors_total: "",
    sectoral: {
      general_public: "",
      senior_citizen: "",
      pwd: "",
      ip: "",
      solo_parents: "",
      four_ps_member: "",
    },
    production: [],
    production_total_quantity: "",
    production_total_market_value: "",
    area_scope_production: "",
    current_assets_amount: "",
    annual_gross_income: "",
    area_scope_sales: "",
    total_liabilities: "",
    procurement_no_experience: false,
    procurement: {},
    sponsor_agency: "",
    other_sponsor_agencies: "",
    documents: {
      board_resolution: false,
      registration_certificate: false,
      business_permit: false,
      bank_account_certificate: false,
      bir_certificate: false,
    },
    primary_contact_name: "",
    primary_contact_designation: "",
    primary_contact_email: "",
    primary_contact_telephone: "",
    primary_contact_mobile: "",
    secondary_contact_name: "",
    secondary_contact_designation: "",
    secondary_contact_email: "",
    secondary_contact_telephone: "",
    secondary_contact_mobile: "",
    cbo_representative_signature_name: "",
    legal_certificate_of_registration: false,
    registrations: {},
    financial: {},
    additional: {},
    intervention: [],
    issues_concerns_challenges: "",
    action_taken: "",
    recommendation: "",
    cbo_assessment_status: "",
    cbo_assessment_remarks: "",
    date_of_assessment: "",
    cbo_other_remarks: "",
    rct_deliberation: "",
    assessment_narrative: "",
    date_confirmed_epahp_qualified: "",
    validator_field_pdo_name: "",
    validator_rpc_name: "",
    validator_approval_date: "",
  };
}

export function flattenCboRecord(record: CboRecordExportRow): Record<string, string> {
  const payload = {
    ...emptyPayload(),
    ...(record.payload ?? {}),
    sectoral: {
      ...emptyPayload().sectoral,
      ...(record.payload?.sectoral ?? {}),
    },
    documents: {
      ...emptyPayload().documents,
      ...(record.payload?.documents ?? {}),
    },
  };

  const row: Record<string, string> = {
    id: record.id,
    created_at: record.created_at,
    updated_at: record.updated_at,

    mode_of_collection: str(payload.mode_of_collection),
    validation_activities_count: str(payload.validation_activities_count),
    date_of_accomplishment: str(payload.date_of_accomplishment),
    time_started: str(payload.time_started),
    time_ended: str(payload.time_ended),

    organization_name: str(payload.organization_name),
    organization_short_name: str(payload.organization_short_name),
    office_address: str(payload.office_address),
    cbo_representation: str(payload.cbo_representation),
    congressional_district: str(payload.congressional_district),

    organization_registration: str(payload.organization_registration),
    organization_registration_other: str(payload.organization_registration_other),
    date_established: str(payload.date_established),
    psic_classification: str(payload.psic_classification),
    target_members: str(payload.target_members),
    cbo_president_name: str(payload.cbo_president_name),
    female_led: str(payload.female_led),
    members_agricultural_total: str(payload.members_agricultural_total),
    members_agricultural_male: str(payload.members_agricultural_male),
    members_agricultural_female: str(payload.members_agricultural_female),
    members_other_food_sectors_total: str(payload.members_other_food_sectors_total),
  };

  for (const key of CBO_SECTORAL_KEYS) {
    row[`sectoral_${key}`] = str(payload.sectoral[key]);
  }

  for (let i = 1; i <= CBO_PRODUCTION_ROW_COUNT; i += 1) {
    const item = payload.production[i - 1];
    row[`production_${i}_product`] = str(item?.product);
    row[`production_${i}_type`] = str(item?.type);
    row[`production_${i}_quantity`] = str(item?.quantity);
    row[`production_${i}_unit`] = str(item?.unit);
    row[`production_${i}_market_value`] = str(item?.market_value);
  }

  row.production_total_quantity = str(payload.production_total_quantity);
  row.production_total_market_value = str(payload.production_total_market_value);
  row.area_scope_production = str(payload.area_scope_production);
  row.current_assets_amount = str(payload.current_assets_amount);
  row.annual_gross_income = str(payload.annual_gross_income);
  row.area_scope_sales = str(payload.area_scope_sales);
  row.total_liabilities = str(payload.total_liabilities);
  row.procurement_no_experience = boolValue(payload.procurement_no_experience);

  for (const key of CBO_PROCUREMENT_KEYS) {
    const item = payload.procurement[key];
    row[`procurement_${key}_selected`] = boolValue(item?.selected);
    row[`procurement_${key}_participation`] = str(item?.participation);
    row[`procurement_${key}_contracts_won`] = str(item?.contracts_won);
    row[`procurement_${key}_successful_implementation`] = str(
      item?.successful_implementation,
    );
    if (key === "others") {
      row.procurement_others_other = str(item?.other);
    }
  }

  row.sponsor_agency = str(payload.sponsor_agency);
  row.other_sponsor_agencies = str(payload.other_sponsor_agencies);

  for (const key of CBO_DOCUMENT_KEYS) {
    row[`documents_${key}`] = boolValue(payload.documents[key]);
  }

  row.primary_contact_name = str(payload.primary_contact_name);
  row.primary_contact_designation = str(payload.primary_contact_designation);
  row.primary_contact_email = str(payload.primary_contact_email);
  row.primary_contact_telephone = str(payload.primary_contact_telephone);
  row.primary_contact_mobile = str(payload.primary_contact_mobile);
  row.secondary_contact_name = str(payload.secondary_contact_name);
  row.secondary_contact_designation = str(payload.secondary_contact_designation);
  row.secondary_contact_email = str(payload.secondary_contact_email);
  row.secondary_contact_telephone = str(payload.secondary_contact_telephone);
  row.secondary_contact_mobile = str(payload.secondary_contact_mobile);
  row.legal_certificate_of_registration = boolValue(
    payload.legal_certificate_of_registration,
  );

  for (const [agencyKey, fields] of Object.entries(CBO_REGISTRATION_AGENCIES)) {
    const item = payload.registrations[agencyKey];
    row[`registration_${agencyKey}_selected`] = boolValue(item?.selected);
    for (const field of fields) {
      row[`registration_${agencyKey}_${field}`] = str(item?.fields[field]);
    }
  }

  for (const [itemKey, fields] of Object.entries(CBO_FINANCIAL_ITEMS)) {
    const item = payload.financial[itemKey];
    row[`financial_${itemKey}_selected`] = boolValue(item?.selected);
    for (const field of fields) {
      row[`financial_${itemKey}_${field}`] = str(item?.fields[field]);
    }
  }

  for (const [itemKey, fields] of Object.entries(CBO_ADDITIONAL_ITEMS)) {
    const item = payload.additional[itemKey];
    row[`additional_${itemKey}_selected`] = boolValue(item?.selected);
    for (const field of fields) {
      row[`additional_${itemKey}_${field}`] = str(item?.fields[field]);
    }
  }

  for (let i = 1; i <= CBO_INTERVENTION_ROW_COUNT; i += 1) {
    const item = payload.intervention[i - 1];
    row[`intervention_${i}_partner_agency`] = str(item?.partner_agency);
    row[`intervention_${i}_intervention`] = str(item?.intervention);
    row[`intervention_${i}_ppas`] = str(item?.ppas);
    row[`intervention_${i}_amount`] = str(item?.amount);
    row[`intervention_${i}_date_received`] = str(item?.date_received);
  }

  row.issues_concerns_challenges = str(payload.issues_concerns_challenges);
  row.action_taken = str(payload.action_taken);
  row.recommendation = str(payload.recommendation);
  row.cbo_assessment_status = str(payload.cbo_assessment_status);
  row.cbo_assessment_remarks = str(payload.cbo_assessment_remarks);
  row.date_of_assessment = str(payload.date_of_assessment);
  row.cbo_other_remarks = str(payload.cbo_other_remarks);
  row.rct_deliberation = str(payload.rct_deliberation);
  row.assessment_narrative = str(payload.assessment_narrative);
  row.date_confirmed_epahp_qualified = str(payload.date_confirmed_epahp_qualified);
  row.validator_field_pdo_name = str(payload.validator_field_pdo_name);
  row.validator_rpc_name = str(payload.validator_rpc_name);
  row.validator_approval_date = str(payload.validator_approval_date);

  return row;
}
