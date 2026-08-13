import type { CboFormPayload } from "@/lib/cbo/parse-form-data";

function append(fd: FormData, name: string, value: string) {
  if (value !== "") {
    fd.append(name, value);
  }
}

function appendCheck(fd: FormData, name: string, checked: boolean) {
  if (checked) {
    fd.append(name, "yes");
  }
}

/** Rebuild FormData from a saved payload (for Excel export in view mode). */
export function payloadToFormData(payload: CboFormPayload): FormData {
  const fd = new FormData();

  append(fd, "signature_name", payload.signature_name);
  append(fd, "mode_of_collection", payload.mode_of_collection);
  append(fd, "validation_activities_count", payload.validation_activities_count);
  append(fd, "date_of_accomplishment", payload.date_of_accomplishment);
  append(fd, "time_started", payload.time_started);
  append(fd, "time_ended", payload.time_ended);

  append(fd, "organization_name", payload.organization_name);
  append(fd, "organization_short_name", payload.organization_short_name);
  append(fd, "office_address", payload.office_address);
  append(fd, "cbo_representation", payload.cbo_representation);
  append(fd, "congressional_district", payload.congressional_district);

  append(fd, "organization_registration", payload.organization_registration);
  append(
    fd,
    "organization_registration_other",
    payload.organization_registration_other,
  );
  append(fd, "date_established", payload.date_established);
  append(fd, "psic_classification", payload.psic_classification);
  append(fd, "target_members", payload.target_members);
  append(fd, "cbo_president_name", payload.cbo_president_name);
  append(fd, "female_led", payload.female_led);
  append(fd, "members_agricultural_total", payload.members_agricultural_total);
  append(fd, "members_agricultural_male", payload.members_agricultural_male);
  append(
    fd,
    "members_agricultural_female",
    payload.members_agricultural_female,
  );
  append(
    fd,
    "members_other_food_sectors_total",
    payload.members_other_food_sectors_total,
  );

  append(fd, "sectoral_general_public", payload.sectoral?.general_public ?? "");
  append(fd, "sectoral_senior_citizen", payload.sectoral?.senior_citizen ?? "");
  append(fd, "sectoral_pwd", payload.sectoral?.pwd ?? "");
  append(fd, "sectoral_ip", payload.sectoral?.ip ?? "");
  append(fd, "sectoral_solo_parents", payload.sectoral?.solo_parents ?? "");
  append(fd, "sectoral_4ps_member", payload.sectoral?.four_ps_member ?? "");

  (payload.production ?? []).forEach((row, i) => {
    append(fd, `production[${i}][product]`, row.product);
    append(fd, `production[${i}][type]`, row.type);
    append(fd, `production[${i}][quantity]`, row.quantity);
    append(fd, `production[${i}][unit]`, row.unit);
    append(fd, `production[${i}][market_value]`, row.market_value);
  });
  append(fd, "production_total_quantity", payload.production_total_quantity);
  append(
    fd,
    "production_total_market_value",
    payload.production_total_market_value,
  );

  append(fd, "area_scope_production", payload.area_scope_production);
  append(fd, "current_assets_amount", payload.current_assets_amount);
  append(fd, "annual_gross_income", payload.annual_gross_income);
  append(fd, "area_scope_sales", payload.area_scope_sales);
  append(fd, "total_liabilities", payload.total_liabilities);

  appendCheck(fd, "procurement_no_experience", payload.procurement_no_experience);
  for (const [key, row] of Object.entries(payload.procurement ?? {})) {
    appendCheck(fd, `procurement_${key}_selected`, row.selected);
    if (row.other) {
      append(fd, `procurement_${key}_other`, row.other);
    }
    append(fd, `procurement_${key}_participation`, row.participation);
    append(fd, `procurement_${key}_contracts_won`, row.contracts_won);
    append(
      fd,
      `procurement_${key}_successful_implementation`,
      row.successful_implementation,
    );
  }

  append(fd, "sponsor_agency", payload.sponsor_agency);
  append(fd, "other_sponsor_agencies", payload.other_sponsor_agencies);

  appendCheck(fd, "doc_board_resolution", !!payload.documents?.board_resolution);
  appendCheck(
    fd,
    "doc_registration_certificate",
    !!payload.documents?.registration_certificate,
  );
  appendCheck(fd, "doc_business_permit", !!payload.documents?.business_permit);
  appendCheck(
    fd,
    "doc_bank_account_certificate",
    !!payload.documents?.bank_account_certificate,
  );
  appendCheck(fd, "doc_bir_certificate", !!payload.documents?.bir_certificate);

  append(fd, "primary_contact_name", payload.primary_contact_name);
  append(fd, "primary_contact_designation", payload.primary_contact_designation);
  append(fd, "primary_contact_email", payload.primary_contact_email);
  append(fd, "primary_contact_telephone", payload.primary_contact_telephone);
  append(fd, "primary_contact_mobile", payload.primary_contact_mobile);
  append(fd, "secondary_contact_name", payload.secondary_contact_name);
  append(
    fd,
    "secondary_contact_designation",
    payload.secondary_contact_designation,
  );
  append(fd, "secondary_contact_email", payload.secondary_contact_email);
  append(fd, "secondary_contact_telephone", payload.secondary_contact_telephone);
  append(fd, "secondary_contact_mobile", payload.secondary_contact_mobile);

  append(
    fd,
    "cbo_representative_signature_name",
    payload.cbo_representative_signature_name,
  );

  appendCheck(
    fd,
    "legal_certificate_of_registration",
    payload.legal_certificate_of_registration,
  );

  for (const [key, item] of Object.entries(payload.registrations ?? {})) {
    appendCheck(fd, `registration_${key}_selected`, item.selected);
    for (const [field, value] of Object.entries(item.fields ?? {})) {
      append(fd, `registration_${key}_${field}`, value);
    }
  }

  for (const [key, item] of Object.entries(payload.financial ?? {})) {
    appendCheck(fd, `financial_${key}_selected`, item.selected);
    for (const [field, value] of Object.entries(item.fields ?? {})) {
      append(fd, `financial_${key}_${field}`, value);
    }
  }

  for (const [key, item] of Object.entries(payload.additional ?? {})) {
    appendCheck(fd, `additional_${key}_selected`, item.selected);
    for (const [field, value] of Object.entries(item.fields ?? {})) {
      append(fd, `additional_${key}_${field}`, value);
    }
  }

  (payload.intervention ?? []).forEach((row, i) => {
    append(fd, `intervention[${i}][partner_agency]`, row.partner_agency);
    append(fd, `intervention[${i}][intervention]`, row.intervention);
    append(fd, `intervention[${i}][ppas]`, row.ppas);
    append(fd, `intervention[${i}][amount]`, row.amount);
    append(fd, `intervention[${i}][date_received]`, row.date_received);
  });

  append(fd, "issues_concerns_challenges", payload.issues_concerns_challenges);
  append(fd, "action_taken", payload.action_taken);
  append(fd, "recommendation", payload.recommendation);

  append(fd, "cbo_assessment_status", payload.cbo_assessment_status);
  append(fd, "cbo_assessment_remarks", payload.cbo_assessment_remarks);
  append(fd, "date_of_assessment", payload.date_of_assessment);
  append(fd, "cbo_other_remarks", payload.cbo_other_remarks);

  append(fd, "rct_deliberation", payload.rct_deliberation);
  append(fd, "assessment_narrative", payload.assessment_narrative);
  append(
    fd,
    "date_confirmed_epahp_qualified",
    payload.date_confirmed_epahp_qualified,
  );

  append(fd, "validator_field_pdo_name", payload.validator_field_pdo_name);
  append(
    fd,
    "validator_field_pdo_signature",
    payload.validator_field_pdo_signature,
  );
  append(fd, "validator_rpc_name", payload.validator_rpc_name);
  append(fd, "validator_rpc_signature", payload.validator_rpc_signature);
  append(fd, "validator_approval_date", payload.validator_approval_date);

  return fd;
}

/** Apply saved payload values onto an existing form element (uncontrolled fields). */
export function applyPayloadToForm(
  form: HTMLFormElement,
  payload: CboFormPayload,
) {
  const fd = payloadToFormData(payload);

  for (const el of Array.from(form.elements)) {
    if (!("name" in el) || !(el as HTMLElement & { name?: string }).name) {
      continue;
    }

    if (el instanceof HTMLSelectElement) {
      const value = fd.get(el.name);
      el.value = typeof value === "string" ? value : "";
      continue;
    }

    if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) {
      continue;
    }
    if (!el.name) continue;

    if (el instanceof HTMLInputElement && el.type === "checkbox") {
      el.checked = fd.has(el.name);
      continue;
    }

    const value = fd.get(el.name);
    el.value = typeof value === "string" ? value : "";
  }
}
