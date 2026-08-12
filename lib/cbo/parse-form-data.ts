export type ProductionRowPayload = {
  product: string;
  type: string;
  quantity: string;
  unit: string;
  market_value: string;
};

export type InterventionRowPayload = {
  partner_agency: string;
  intervention: string;
  ppas: string;
  amount: string;
  date_received: string;
};

export type ProcurementRowPayload = {
  selected: boolean;
  other?: string;
  participation: string;
  contracts_won: string;
  successful_implementation: string;
};

export type AgencyRegistrationPayload = {
  selected: boolean;
  fields: Record<string, string>;
};

export type ChecklistItemPayload = {
  selected: boolean;
  fields: Record<string, string>;
};

export type CboFormPayload = {
  signature_name: string;
  mode_of_collection: string;
  validation_activities_count: string;
  date_of_accomplishment: string;
  time_started: string;
  time_ended: string;

  organization_name: string;
  organization_short_name: string;
  office_address: string;
  cbo_representation: string;
  congressional_district: string;

  organization_registration: string;
  organization_registration_other: string;
  date_established: string;
  psic_classification: string;
  target_members: string;
  cbo_president_name: string;
  female_led: string;
  members_agricultural_total: string;
  members_agricultural_male: string;
  members_agricultural_female: string;
  members_other_food_sectors_total: string;

  sectoral: {
    general_public: string;
    senior_citizen: string;
    pwd: string;
    ip: string;
    solo_parents: string;
    four_ps_member: string;
  };

  production: ProductionRowPayload[];
  production_total_quantity: string;
  production_total_market_value: string;

  area_scope_production: string;
  current_assets_amount: string;
  annual_gross_income: string;
  area_scope_sales: string;
  total_liabilities: string;

  procurement_no_experience: boolean;
  procurement: Record<string, ProcurementRowPayload>;

  sponsor_agency: string;
  other_sponsor_agencies: string;

  documents: {
    board_resolution: boolean;
    registration_certificate: boolean;
    business_permit: boolean;
    bank_account_certificate: boolean;
    bir_certificate: boolean;
  };

  primary_contact_name: string;
  primary_contact_designation: string;
  primary_contact_email: string;
  primary_contact_telephone: string;
  primary_contact_mobile: string;
  secondary_contact_name: string;
  secondary_contact_designation: string;
  secondary_contact_email: string;
  secondary_contact_telephone: string;
  secondary_contact_mobile: string;

  cbo_representative_signature_name: string;

  legal_certificate_of_registration: boolean;
  registrations: Record<string, AgencyRegistrationPayload>;
  financial: Record<string, ChecklistItemPayload>;
  additional: Record<string, ChecklistItemPayload>;

  intervention: InterventionRowPayload[];

  issues_concerns_challenges: string;
  action_taken: string;
  recommendation: string;

  cbo_assessment_status: string;
  cbo_assessment_remarks: string;
  date_of_assessment: string;
  cbo_other_remarks: string;

  rct_deliberation: string;
  assessment_narrative: string;
  date_confirmed_epahp_qualified: string;

  validator_field_pdo_name: string;
  validator_rpc_name: string;
  validator_approval_date: string;
};

function getString(data: FormData, name: string) {
  const value = data.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function isChecked(data: FormData, name: string) {
  return data.has(name);
}

export const CBO_PRODUCTION_ROW_COUNT = 8;
export const CBO_INTERVENTION_ROW_COUNT = 10;

export const CBO_DOCUMENT_KEYS = [
  "board_resolution",
  "registration_certificate",
  "business_permit",
  "bank_account_certificate",
  "bir_certificate",
] as const;

export const CBO_SECTORAL_KEYS = [
  "general_public",
  "senior_citizen",
  "pwd",
  "ip",
  "solo_parents",
  "four_ps_member",
] as const;

export const CBO_PROCUREMENT_KEYS = [
  "competitive_bidding",
  "negotiated_community_participation",
  "direct_contracting",
  "shopping",
  "small_value_procurement",
  "others",
] as const;

export const CBO_REGISTRATION_AGENCIES: Record<string, string[]> = {
  dti: [
    "territorial_scope",
    "registry_no",
    "date_of_issuance",
    "date_of_validity",
  ],
  sec: [
    "type_of_registration",
    "registry_no",
    "date_of_issuance",
    "date_of_validity",
  ],
  cda: [
    "type_of_cooperative",
    "registry_no",
    "date_of_issuance",
    "date_of_validity",
  ],
  cso: ["agency_issuer", "registry_no", "date_of_issuance", "date_of_validity"],
};

export const CBO_FINANCIAL_ITEMS: Record<string, string[]> = {
  dole: ["registry_no", "date_of_issuance", "date_of_validity"],
  bank_book: [],
  afs: ["year"],
  itr: ["year"],
  sales_invoice: [],
};

export const CBO_ADDITIONAL_ITEMS: Record<string, string[]> = {
  business_permit: ["registry_no", "date_of_issuance", "date_of_validity"],
  ffedis: ["registry_no", "date_of_issuance", "date_of_validity"],
  bir: [
    "type_of_bir_registration",
    "registry_no",
    "date_of_issuance",
    "date_of_validity",
  ],
  philgeps: [
    "type_of_registration",
    "registry_no",
    "date_of_issuance",
    "date_of_validity",
  ],
  rsbsa: ["registry_no", "date_of_issuance", "date_of_validity"],
  fish_ar: ["registry_no", "date_of_issuance", "date_of_validity"],
  fda: ["registry_no", "date_of_issuance", "date_of_validity"],
  arbo: ["registry_no", "date_of_issuance", "date_of_validity"],
  farmers_association: ["registry_no", "date_of_issuance", "date_of_validity"],
  irrigators_association: [
    "registry_no",
    "date_of_issuance",
    "date_of_validity",
  ],
  labor_unions: ["registry_no", "date_of_issuance", "date_of_validity"],
  slpa: ["registry_no", "date_of_issuance", "date_of_validity"],
};

function parseChecklistGroup(
  data: FormData,
  prefix: string,
  items: Record<string, string[]>,
) {
  const result: Record<string, ChecklistItemPayload> = {};
  for (const [key, fields] of Object.entries(items)) {
    const fieldValues: Record<string, string> = {};
    for (const field of fields) {
      fieldValues[field] = getString(data, `${prefix}_${key}_${field}`);
    }
    result[key] = {
      selected: isChecked(data, `${prefix}_${key}_selected`),
      fields: fieldValues,
    };
  }
  return result;
}

export function parseCboFormData(data: FormData): CboFormPayload {
  const production: ProductionRowPayload[] = [];
  for (let i = 0; i < 8; i += 1) {
    const row = {
      product: getString(data, `production[${i}][product]`),
      type: getString(data, `production[${i}][type]`),
      quantity: getString(data, `production[${i}][quantity]`),
      unit: getString(data, `production[${i}][unit]`),
      market_value: getString(data, `production[${i}][market_value]`),
    };
    if (
      row.product ||
      row.type ||
      row.quantity ||
      row.unit ||
      row.market_value
    ) {
      production.push(row);
    }
  }

  const intervention: InterventionRowPayload[] = [];
  for (let i = 0; i < 10; i += 1) {
    const row = {
      partner_agency: getString(data, `intervention[${i}][partner_agency]`),
      intervention: getString(data, `intervention[${i}][intervention]`),
      ppas: getString(data, `intervention[${i}][ppas]`),
      amount: getString(data, `intervention[${i}][amount]`),
      date_received: getString(data, `intervention[${i}][date_received]`),
    };
    if (
      row.partner_agency ||
      row.intervention ||
      row.ppas ||
      row.amount ||
      row.date_received
    ) {
      intervention.push(row);
    }
  }

  const procurement: Record<string, ProcurementRowPayload> = {};
  for (const key of CBO_PROCUREMENT_KEYS) {
    procurement[key] = {
      selected: isChecked(data, `procurement_${key}_selected`),
      other:
        key === "others"
          ? getString(data, `procurement_${key}_other`)
          : undefined,
      participation: getString(data, `procurement_${key}_participation`),
      contracts_won: getString(data, `procurement_${key}_contracts_won`),
      successful_implementation: getString(
        data,
        `procurement_${key}_successful_implementation`,
      ),
    };
  }

  const registrations: Record<string, AgencyRegistrationPayload> = {};
  for (const [key, fields] of Object.entries(CBO_REGISTRATION_AGENCIES)) {
    const fieldValues: Record<string, string> = {};
    for (const field of fields) {
      fieldValues[field] = getString(data, `registration_${key}_${field}`);
    }
    registrations[key] = {
      selected: isChecked(data, `registration_${key}_selected`),
      fields: fieldValues,
    };
  }

  return {
    signature_name: getString(data, "signature_name"),
    mode_of_collection: getString(data, "mode_of_collection"),
    validation_activities_count: getString(data, "validation_activities_count"),
    date_of_accomplishment: getString(data, "date_of_accomplishment"),
    time_started: getString(data, "time_started"),
    time_ended: getString(data, "time_ended"),

    organization_name: getString(data, "organization_name"),
    organization_short_name: getString(data, "organization_short_name"),
    office_address: getString(data, "office_address"),
    cbo_representation: getString(data, "cbo_representation"),
    congressional_district: getString(data, "congressional_district"),

    organization_registration: getString(data, "organization_registration"),
    organization_registration_other: getString(
      data,
      "organization_registration_other",
    ),
    date_established: getString(data, "date_established"),
    psic_classification: getString(data, "psic_classification"),
    target_members: getString(data, "target_members"),
    cbo_president_name: getString(data, "cbo_president_name"),
    female_led: getString(data, "female_led"),
    members_agricultural_total: getString(data, "members_agricultural_total"),
    members_agricultural_male: getString(data, "members_agricultural_male"),
    members_agricultural_female: getString(
      data,
      "members_agricultural_female",
    ),
    members_other_food_sectors_total: getString(
      data,
      "members_other_food_sectors_total",
    ),

    sectoral: {
      general_public: getString(data, "sectoral_general_public"),
      senior_citizen: getString(data, "sectoral_senior_citizen"),
      pwd: getString(data, "sectoral_pwd"),
      ip: getString(data, "sectoral_ip"),
      solo_parents: getString(data, "sectoral_solo_parents"),
      four_ps_member: getString(data, "sectoral_4ps_member"),
    },

    production,
    production_total_quantity: getString(data, "production_total_quantity"),
    production_total_market_value: getString(
      data,
      "production_total_market_value",
    ),

    area_scope_production: getString(data, "area_scope_production"),
    current_assets_amount: getString(data, "current_assets_amount"),
    annual_gross_income: getString(data, "annual_gross_income"),
    area_scope_sales: getString(data, "area_scope_sales"),
    total_liabilities: getString(data, "total_liabilities"),

    procurement_no_experience: isChecked(data, "procurement_no_experience"),
    procurement,

    sponsor_agency: getString(data, "sponsor_agency"),
    other_sponsor_agencies: getString(data, "other_sponsor_agencies"),

    documents: {
      board_resolution: isChecked(data, "doc_board_resolution"),
      registration_certificate: isChecked(data, "doc_registration_certificate"),
      business_permit: isChecked(data, "doc_business_permit"),
      bank_account_certificate: isChecked(data, "doc_bank_account_certificate"),
      bir_certificate: isChecked(data, "doc_bir_certificate"),
    },

    primary_contact_name: getString(data, "primary_contact_name"),
    primary_contact_designation: getString(data, "primary_contact_designation"),
    primary_contact_email: getString(data, "primary_contact_email"),
    primary_contact_telephone: getString(data, "primary_contact_telephone"),
    primary_contact_mobile: getString(data, "primary_contact_mobile"),
    secondary_contact_name: getString(data, "secondary_contact_name"),
    secondary_contact_designation: getString(
      data,
      "secondary_contact_designation",
    ),
    secondary_contact_email: getString(data, "secondary_contact_email"),
    secondary_contact_telephone: getString(data, "secondary_contact_telephone"),
    secondary_contact_mobile: getString(data, "secondary_contact_mobile"),

    cbo_representative_signature_name: getString(
      data,
      "cbo_representative_signature_name",
    ),

    legal_certificate_of_registration: isChecked(
      data,
      "legal_certificate_of_registration",
    ),
    registrations,
    financial: parseChecklistGroup(data, "financial", CBO_FINANCIAL_ITEMS),
    additional: parseChecklistGroup(data, "additional", CBO_ADDITIONAL_ITEMS),

    intervention,

    issues_concerns_challenges: getString(data, "issues_concerns_challenges"),
    action_taken: getString(data, "action_taken"),
    recommendation: getString(data, "recommendation"),

    cbo_assessment_status: getString(data, "cbo_assessment_status"),
    cbo_assessment_remarks: getString(data, "cbo_assessment_remarks"),
    date_of_assessment: getString(data, "date_of_assessment"),
    cbo_other_remarks: getString(data, "cbo_other_remarks"),

    rct_deliberation: getString(data, "rct_deliberation"),
    assessment_narrative: getString(data, "assessment_narrative"),
    date_confirmed_epahp_qualified: getString(
      data,
      "date_confirmed_epahp_qualified",
    ),

    validator_field_pdo_name: getString(data, "validator_field_pdo_name"),
    validator_rpc_name: getString(data, "validator_rpc_name"),
    validator_approval_date: getString(data, "validator_approval_date"),
  };
}
