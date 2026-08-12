"use server";

import ExcelJS from "exceljs";

const COLS = 12;

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFC1D7AE" },
};

const SUBHEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFD9E8CB" },
};

const WHITE_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFFFFFFF" },
};

const LIGHT_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFF7F7F7" },
};

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FF000000" } },
  left: { style: "thin", color: { argb: "FF000000" } },
  bottom: { style: "thin", color: { argb: "FF000000" } },
  right: { style: "thin", color: { argb: "FF000000" } },
};

const REGISTRATION_OPTIONS = [
  { value: "cooperative", label: "Cooperative" },
  { value: "stock_corporation", label: "Stock Corporation" },
  { value: "non_stock_corporation", label: "Non-stock Corporation" },
  { value: "unregistered", label: "Unregistered" },
  { value: "others", label: "Others" },
] as const;

const PROCUREMENT_TYPES = [
  { key: "competitive_bidding", label: "Competitive Bidding" },
  {
    key: "negotiated_community_participation",
    label: "Negotiated Procurement - Community Participation",
  },
  { key: "direct_contracting", label: "Direct Contracting" },
  { key: "shopping", label: "Shopping" },
  { key: "small_value_procurement", label: "Small Value Procurement" },
  { key: "others", label: "Others" },
] as const;

const DOCUMENTS = [
  { name: "doc_board_resolution", label: "Board Resolution" },
  { name: "doc_registration_certificate", label: "Registration Certificate" },
  { name: "doc_business_permit", label: "Business Permit" },
  { name: "doc_bank_account_certificate", label: "Bank Account Certificate" },
  { name: "doc_bir_certificate", label: "BIR Certificate" },
] as const;

function getValue(data: FormData, name: string) {
  const value = data.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function isChecked(data: FormData, name: string) {
  return data.has(name);
}

function mark(checked: boolean) {
  return checked ? "☑" : "☐";
}

function radioMark(selected: string, value: string) {
  return mark(selected === value);
}

function sanitizeFilename(value: string) {
  return value
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

function applyRange(
  sheet: ExcelJS.Worksheet,
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number,
  options?: {
    fill?: ExcelJS.Fill;
    bold?: boolean;
    size?: number;
    align?: ExcelJS.Alignment["horizontal"];
    valign?: ExcelJS.Alignment["vertical"];
    wrap?: boolean;
    italic?: boolean;
    color?: string;
  },
) {
  for (let r = startRow; r <= endRow; r += 1) {
    for (let c = startCol; c <= endCol; c += 1) {
      const cell = sheet.getCell(r, c);
      cell.border = THIN_BORDER;
      cell.fill = options?.fill ?? WHITE_FILL;
      cell.alignment = {
        horizontal: options?.align ?? "left",
        vertical: options?.valign ?? "top",
        wrapText: options?.wrap ?? true,
      };
      if (options?.bold || options?.size || options?.italic || options?.color) {
        cell.font = {
          bold: options.bold,
          size: options.size ?? 10,
          italic: options.italic,
          color: options.color ? { argb: options.color } : undefined,
        };
      }
    }
  }
}

function mergeSet(
  sheet: ExcelJS.Worksheet,
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number,
  value: string,
  options?: Parameters<typeof applyRange>[5],
) {
  if (startRow !== endRow || startCol !== endCol) {
    sheet.mergeCells(startRow, startCol, endRow, endCol);
  }
  sheet.getCell(startRow, startCol).value = value;
  applyRange(sheet, startRow, startCol, endRow, endCol, options);
  return endRow + 1;
}

function sectionBanner(sheet: ExcelJS.Worksheet, row: number, title: string) {
  return mergeSet(sheet, row, 1, row, COLS, title, {
    fill: HEADER_FILL,
    bold: true,
    size: 11,
    align: "center",
    valign: "middle",
  });
}

function stepBanner(sheet: ExcelJS.Worksheet, row: number, title: string) {
  return mergeSet(sheet, row, 1, row, COLS, title, {
    fill: SUBHEADER_FILL,
    bold: true,
    size: 11,
    align: "center",
    valign: "middle",
  });
}

function labeledBlock(
  sheet: ExcelJS.Worksheet,
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number,
  label: string,
  value: string,
  hint?: string,
) {
  const labelText = hint ? `${label}\n${hint}` : label;
  sheet.mergeCells(startRow, startCol, endRow, endCol);
  const cell = sheet.getCell(startRow, startCol);
  cell.value = {
    richText: [
      { text: labelText.split("\n")[0] + "\n", font: { bold: true, size: 10 } },
      ...(hint
        ? [{ text: `${hint}\n`, font: { italic: true, size: 8, color: { argb: "FF555555" } } }]
        : []),
      { text: value || " ", font: { size: 11 } },
    ],
  };
  applyRange(sheet, startRow, startCol, endRow, endCol, {
    valign: "top",
    wrap: true,
  });
}

async function buildCboWorkbook(data: FormData) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Database Collection";
  workbook.created = new Date();

  // Full form-layout sheet written below via dedicated builder
  buildCompleteFormSheet(workbook, data);

  return workbook;
}

function buildCompleteFormSheet(workbook: ExcelJS.Workbook, data: FormData) {
  // Prefer one clean builder (avoids the half-built path above)
  const sheet = workbook.addWorksheet("CBO Information Sheet", {
    properties: { defaultRowHeight: 18 },
    pageSetup: {
      paperSize: 9,
      orientation: "portrait",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.4, right: 0.4, top: 0.4, bottom: 0.4, header: 0.2, footer: 0.2 },
    },
  });

  for (let c = 1; c <= COLS; c += 1) {
    sheet.getColumn(c).width = 9.8;
  }

  let row = 1;

  sheet.getRow(row).height = 24;
  mergeSet(sheet, row, 1, row + 1, 3, "DSWD / EPAHP / Bagong Pilipinas", {
    bold: true,
    size: 9,
    align: "center",
    valign: "middle",
    fill: LIGHT_FILL,
  });
  mergeSet(
    sheet,
    row,
    4,
    row + 1,
    COLS,
    "ENHANCED PARTNERSHIP AGAINST HUNGER AND POVERTY:\nCOMMUNITY-BASED ORGANIZATION INFORMATION SHEET (Version 3.0)",
    { bold: true, size: 12, align: "right", valign: "middle" },
  );
  sheet.getRow(row + 1).height = 28;
  row += 2;

  row = mergeSet(
    sheet,
    row,
    1,
    row,
    COLS,
    "Note: Fields marked with an asterisk (*) are required. If not applicable, put N/A.",
    { size: 9, italic: true },
  );

  row = sectionBanner(sheet, row, "A. DATA PRIVACY CONSENT");
  const consentStart = row;
  sheet.getRow(consentStart).height = 68;
  sheet.getRow(consentStart + 1).height = 52;
  mergeSet(
    sheet,
    consentStart,
    1,
    consentStart + 1,
    8,
    "I hereby agree and give my free and voluntary consent to the Department of Social Welfare and Development (DSWD) to collect, process, and store my personal information, as required under the Data Privacy Act (DPA) of 2012, for the purpose of the Enhanced Partnership Against Hunger and Poverty (EPAHP) Digital Mapping System (DMS). For more information, visit http://epahp.org.",
    { size: 9, valign: "top" },
  );
  mergeSet(sheet, consentStart, 9, consentStart, COLS, "(Thumbmark if unable to write)", {
    size: 9,
    align: "center",
    valign: "middle",
    fill: LIGHT_FILL,
  });
  mergeSet(
    sheet,
    consentStart + 1,
    9,
    consentStart + 1,
    COLS,
    `${getValue(data, "signature_name") || "________________________"}\nSignature over printed name*`,
    { size: 10, align: "center", valign: "middle" },
  );
  row = consentStart + 2;

  const mode = getValue(data, "mode_of_collection");
  sheet.getRow(row).height = 52;
  labeledBlock(
    sheet,
    row,
    1,
    row,
    3,
    "Mode of Collection",
    `${radioMark(mode, "actual")} Actual (Field Visit, etc.)\n${radioMark(mode, "virtual")} Virtual (Phone Interview, Virtual Mtg, etc.)`,
  );
  labeledBlock(
    sheet,
    row,
    4,
    row,
    6,
    "Number of validation activities conducted*",
    getValue(data, "validation_activities_count"),
    "(Identify the number of times did the RPMO/RCT conducted validation activities)",
  );
  labeledBlock(
    sheet,
    row,
    7,
    row,
    8,
    "Date of Accomplishment*",
    getValue(data, "date_of_accomplishment"),
    "(mm/dd/yyyy)",
  );
  labeledBlock(
    sheet,
    row,
    9,
    row,
    10,
    "Time started",
    getValue(data, "time_started"),
    "(HH:mm AM/PM)",
  );
  labeledBlock(
    sheet,
    row,
    11,
    row,
    12,
    "Time ended",
    getValue(data, "time_ended"),
    "(HH:mm AM/PM)",
  );
  row += 1;

  row = sectionBanner(sheet, row, "B. COMMUNITY-BASED ORGANIZATION INFORMATION");
  row = stepBanner(sheet, row, "STEP 1: BASIC INFORMATION");

  sheet.getRow(row).height = 44;
  labeledBlock(
    sheet,
    row,
    1,
    row,
    8,
    "A.1 Name of Organization*",
    getValue(data, "organization_name"),
    "(Enter the official or registered name of the organization)",
  );
  labeledBlock(
    sheet,
    row,
    9,
    row,
    COLS,
    "A.2 Short Name*",
    getValue(data, "organization_short_name"),
    "(Acronym)",
  );
  row += 1;

  sheet.getRow(row).height = 50;
  labeledBlock(
    sheet,
    row,
    1,
    row,
    COLS,
    "A.3 Office Address*",
    getValue(data, "office_address"),
    "(Complete office address of the organization - House & Lot No. Street, Barangay, City/Municipality, Province, Region, Postal Code)",
  );
  row += 1;

  const rep = getValue(data, "cbo_representation");
  sheet.getRow(row).height = 36;
  labeledBlock(
    sheet,
    row,
    1,
    row,
    6,
    "A.4 CBO Representation*",
    `${radioMark(rep, "main")} Main     ${radioMark(rep, "branch")} Branch`,
  );
  labeledBlock(
    sheet,
    row,
    7,
    row,
    COLS,
    "A.5 Congressional District*",
    getValue(data, "congressional_district"),
  );
  row += 1;

  row = stepBanner(sheet, row, "STEP 2: OPERATIONS");

  const reg = getValue(data, "organization_registration");
  const regLines = REGISTRATION_OPTIONS.map((opt) => {
    if (opt.value === "others") {
      return `${radioMark(reg, "others")} Others: ${getValue(data, "organization_registration_other")}`;
    }
    return `${radioMark(reg, opt.value)} ${opt.label}`;
  }).join("\n");

  sheet.getRow(row).height = 40;
  sheet.getRow(row + 1).height = 48;
  labeledBlock(
    sheet,
    row,
    1,
    row + 1,
    4,
    "B.1 Organization Registration*",
    `Choose one:\n${regLines}`,
  );
  labeledBlock(
    sheet,
    row,
    5,
    row,
    8,
    "B.2 Date Established*",
    getValue(data, "date_established"),
    "(Date when the organization was first established)",
  );
  labeledBlock(
    sheet,
    row,
    9,
    row + 1,
    COLS,
    "B.3 Philippine Statistical Industry Classification*",
    getValue(data, "psic_classification"),
    "(Enter the official PSIC classification code of your organization if available)",
  );
  labeledBlock(
    sheet,
    row + 1,
    5,
    row + 1,
    8,
    "B.4 Target Members*",
    getValue(data, "target_members"),
    "(Select primary demographic targeted by the organization as members)",
  );
  row += 2;

  const femaleLed = getValue(data, "female_led");
  sheet.getRow(row).height = 44;
  labeledBlock(
    sheet,
    row,
    1,
    row,
    8,
    "B.5 Name of CBO President/Lead*",
    getValue(data, "cbo_president_name"),
  );
  labeledBlock(
    sheet,
    row,
    9,
    row,
    COLS,
    "B.5.1 Is the organization female-led?*",
    `${radioMark(femaleLed, "yes")} Yes     ${radioMark(femaleLed, "no")} No`,
    "Check yes if the highest leadership position (ex. President, Chairperson) is held by a woman",
  );
  row += 1;

  sheet.getRow(row).height = 34;
  sheet.getRow(row + 1).height = 34;
  labeledBlock(
    sheet,
    row,
    1,
    row + 1,
    8,
    "B.6A Total Number of Members involved in agricultural sector*",
    getValue(data, "members_agricultural_total"),
  );
  labeledBlock(
    sheet,
    row,
    9,
    row,
    COLS,
    "B.6A.1 Male members in the agricultural sector*",
    getValue(data, "members_agricultural_male"),
  );
  labeledBlock(
    sheet,
    row + 1,
    9,
    row + 1,
    COLS,
    "B.6A.2 Female members in the agricultural sector*",
    getValue(data, "members_agricultural_female"),
  );
  row += 2;

  sheet.getRow(row).height = 36;
  labeledBlock(
    sheet,
    row,
    1,
    row,
    COLS,
    "B.6B Total Number of Members involved in the other Sectors related to food e.g condiments, packed goods, grocery items*",
    getValue(data, "members_other_food_sectors_total"),
  );
  row += 1;

  row = mergeSet(sheet, row, 1, row, COLS, "B.6C Sectoral Data*", {
    bold: true,
    size: 10,
    fill: LIGHT_FILL,
  });
  row = mergeSet(
    sheet,
    row,
    1,
    row,
    COLS,
    "(Kindly put the number of individuals per category if they belong to the sector.)",
    { italic: true, size: 8 },
  );

  const sectoral = [
    ["General Public", "sectoral_general_public"],
    ["Senior Citizen", "sectoral_senior_citizen"],
    ["Persons with Disability (PWD)", "sectoral_pwd"],
    ["Indigenous People (IP)", "sectoral_ip"],
    ["Solo Parents", "sectoral_solo_parents"],
    ["4Ps member", "sectoral_4ps_member"],
  ] as const;

  for (let i = 0; i < sectoral.length; i += 2) {
    sheet.getRow(row).height = 28;
    labeledBlock(sheet, row, 1, row, 6, sectoral[i][0], getValue(data, sectoral[i][1]));
    labeledBlock(
      sheet,
      row,
      7,
      row,
      COLS,
      sectoral[i + 1][0],
      getValue(data, sectoral[i + 1][1]),
    );
    row += 1;
  }

  row = mergeSet(sheet, row, 1, row, COLS, "B.7 Annual Production*", {
    bold: true,
    size: 10,
    fill: LIGHT_FILL,
  });
  row = mergeSet(
    sheet,
    row,
    1,
    row,
    COLS,
    "(Estimated quantity and market value of the organization's primary product/s and service/s. Use a separate paper if more than the provided space.)",
    { italic: true, size: 8 },
  );

  mergeSet(sheet, row, 1, row, 3, "B.7.1 Product*", {
    bold: true,
    size: 9,
    fill: HEADER_FILL,
    align: "center",
    valign: "middle",
  });
  mergeSet(sheet, row, 4, row, 6, "B.7.2 Type of Product*", {
    bold: true,
    size: 9,
    fill: HEADER_FILL,
    align: "center",
    valign: "middle",
  });
  mergeSet(sheet, row, 7, row, 8, "B.7.3 Quantity*", {
    bold: true,
    size: 9,
    fill: HEADER_FILL,
    align: "center",
    valign: "middle",
  });
  mergeSet(sheet, row, 9, row, 10, "B.7.4 Unit*", {
    bold: true,
    size: 9,
    fill: HEADER_FILL,
    align: "center",
    valign: "middle",
  });
  mergeSet(sheet, row, 11, row, 12, "B.7.5 Market Value (in PhP)*", {
    bold: true,
    size: 9,
    fill: HEADER_FILL,
    align: "center",
    valign: "middle",
  });
  row += 1;

  let totalQty = 0;
  let totalMv = 0;
  for (let i = 0; i < 8; i += 1) {
    const product = getValue(data, `production[${i}][product]`);
    const type = getValue(data, `production[${i}][type]`);
    const quantity = getValue(data, `production[${i}][quantity]`);
    const unit = getValue(data, `production[${i}][unit]`);
    const marketValue = getValue(data, `production[${i}][market_value]`);
    totalQty += Number(quantity) || 0;
    totalMv += Number(marketValue) || 0;

    mergeSet(sheet, row, 1, row, 3, product, { size: 9 });
    mergeSet(sheet, row, 4, row, 6, type, { size: 9 });
    mergeSet(sheet, row, 7, row, 8, quantity, { size: 9, align: "right" });
    mergeSet(sheet, row, 9, row, 10, unit, { size: 9 });
    mergeSet(sheet, row, 11, row, 12, marketValue, { size: 9, align: "right" });
    row += 1;
  }

  mergeSet(sheet, row, 1, row, 6, "TOTAL", {
    bold: true,
    size: 10,
    align: "right",
    fill: SUBHEADER_FILL,
    valign: "middle",
  });
  mergeSet(sheet, row, 7, row, 8, totalQty ? String(totalQty) : "", {
    bold: true,
    size: 10,
    align: "right",
    fill: SUBHEADER_FILL,
    valign: "middle",
  });
  mergeSet(sheet, row, 9, row, 10, "TOTAL", {
    bold: true,
    size: 10,
    align: "right",
    fill: SUBHEADER_FILL,
    valign: "middle",
  });
  mergeSet(sheet, row, 11, row, 12, totalMv ? String(totalMv) : "", {
    bold: true,
    size: 10,
    align: "right",
    fill: SUBHEADER_FILL,
    valign: "middle",
  });
  row += 1;

  sheet.getRow(row).height = 42;
  sheet.getRow(row + 1).height = 42;
  labeledBlock(
    sheet,
    row,
    1,
    row,
    4,
    "B.8 Area/Scope of Production*",
    getValue(data, "area_scope_production"),
    "(City/Municipality)",
  );
  labeledBlock(
    sheet,
    row,
    5,
    row,
    8,
    "B.9 Estimated Amount of Current Assets (in PhP)*",
    getValue(data, "current_assets_amount"),
    "(total amount of physical assets, operating assets, equipment, machineries etc. upon joining the EPAHP program)",
  );
  labeledBlock(
    sheet,
    row,
    9,
    row + 1,
    COLS,
    "B.12 Annual Gross Income*",
    getValue(data, "annual_gross_income"),
    "(Annual gross sales of the organization)",
  );
  labeledBlock(
    sheet,
    row + 1,
    1,
    row + 1,
    4,
    "B.10 Area/Scope of Sales*",
    getValue(data, "area_scope_sales"),
    "(City/Municipality)",
  );
  labeledBlock(
    sheet,
    row + 1,
    5,
    row + 1,
    8,
    "B.11 Total Liabilities (in PhP)*",
    getValue(data, "total_liabilities"),
  );
  row += 2;

  row = mergeSet(
    sheet,
    row,
    1,
    row,
    COLS,
    "B.13 Experience in Procurement* (Range: last 2 years) Please check (✓) all that applies",
    { bold: true, size: 10, fill: LIGHT_FILL },
  );

  mergeSet(sheet, row, 1, row, 5, "Procurement Type", {
    bold: true,
    size: 9,
    fill: HEADER_FILL,
    align: "center",
    valign: "middle",
  });
  mergeSet(sheet, row, 6, row, 7, "B.13.1 Number of participation", {
    bold: true,
    size: 8,
    fill: HEADER_FILL,
    align: "center",
    valign: "middle",
  });
  mergeSet(sheet, row, 8, row, 9, "B.13.2 Number of Contracts Won", {
    bold: true,
    size: 8,
    fill: HEADER_FILL,
    align: "center",
    valign: "middle",
  });
  mergeSet(sheet, row, 10, row, 12, "B.13.3 Number of Successful Implementation", {
    bold: true,
    size: 8,
    fill: HEADER_FILL,
    align: "center",
    valign: "middle",
  });
  row += 1;

  // Competitive Bidding
  {
    const key = "competitive_bidding";
    const selected = isChecked(data, `procurement_${key}_selected`);
    mergeSet(sheet, row, 1, row, 5, `${mark(selected)} Competitive Bidding`, { size: 9 });
    mergeSet(sheet, row, 6, row, 7, getValue(data, `procurement_${key}_participation`), {
      size: 9,
      align: "center",
    });
    mergeSet(sheet, row, 8, row, 9, getValue(data, `procurement_${key}_contracts_won`), {
      size: 9,
      align: "center",
    });
    mergeSet(
      sheet,
      row,
      10,
      row,
      12,
      getValue(data, `procurement_${key}_successful_implementation`),
      { size: 9, align: "center" },
    );
    row += 1;
  }

  row = mergeSet(sheet, row, 1, row, COLS, "Alternative Modes of Procurement:", {
    italic: true,
    size: 9,
    fill: SUBHEADER_FILL,
  });

  for (const item of PROCUREMENT_TYPES) {
    if (item.key === "competitive_bidding") continue;
    const selected = isChecked(data, `procurement_${item.key}_selected`);
    const label =
      item.key === "others"
        ? `${mark(selected)} Others: ${getValue(data, `procurement_${item.key}_other`)}`
        : `${mark(selected)} ${item.label}`;

    mergeSet(sheet, row, 1, row, 5, label, { size: 9 });
    mergeSet(sheet, row, 6, row, 7, getValue(data, `procurement_${item.key}_participation`), {
      size: 9,
      align: "center",
    });
    mergeSet(sheet, row, 8, row, 9, getValue(data, `procurement_${item.key}_contracts_won`), {
      size: 9,
      align: "center",
    });
    mergeSet(
      sheet,
      row,
      10,
      row,
      12,
      getValue(data, `procurement_${item.key}_successful_implementation`),
      { size: 9, align: "center" },
    );
    row += 1;
  }

  mergeSet(
    sheet,
    row,
    1,
    row,
    COLS,
    `${mark(isChecked(data, "procurement_no_experience"))} No experience`,
    { size: 9 },
  );
  row += 1;

  sheet.getRow(row).height = 56;
  labeledBlock(
    sheet,
    row,
    1,
    row,
    6,
    "B.14 Sponsor Agency*",
    getValue(data, "sponsor_agency"),
    "(The main EPAHP partner agency/ies supporting the organization)",
  );
  labeledBlock(
    sheet,
    row,
    7,
    row,
    COLS,
    "B.15 Other Sponsor Agency/ies",
    getValue(data, "other_sponsor_agencies"),
    "(Other EPAHP partner agency/ies supporting the organization)",
  );
  row += 1;

  // Step 3
  row = stepBanner(
    sheet,
    row,
    "STEP 3: AVAILABLE REGISTRATIONS/DOCUMENTS (This will be uploaded to the EPAHP DMS)",
  );
  sheet.getRow(row).height = 34;
  const docText = DOCUMENTS.map(
    (doc) => `${mark(isChecked(data, doc.name))} ${doc.label}`,
  ).join("     ");
  mergeSet(sheet, row, 1, row, COLS, docText, { size: 10, valign: "middle" });
  row += 1;

  // Step 4
  row = stepBanner(sheet, row, "STEP 4: CONTACT INFORMATION");

  sheet.getRow(row).height = 40;
  labeledBlock(
    sheet,
    row,
    1,
    row,
    8,
    "D.1 Complete Name of the CBO Contact Person (Primary)",
    getValue(data, "primary_contact_name"),
  );
  labeledBlock(
    sheet,
    row,
    9,
    row,
    COLS,
    "D.2 Designation*",
    getValue(data, "primary_contact_designation"),
    "(Position of the contact person)",
  );
  row += 1;

  sheet.getRow(row).height = 40;
  labeledBlock(
    sheet,
    row,
    1,
    row,
    4,
    "D.3 Email Address*",
    getValue(data, "primary_contact_email"),
    "(Office email address of the contact person)",
  );
  labeledBlock(
    sheet,
    row,
    5,
    row,
    8,
    "D.4 Telephone No.*",
    getValue(data, "primary_contact_telephone"),
    "(Direct office number)",
  );
  labeledBlock(
    sheet,
    row,
    9,
    row,
    COLS,
    "D.5 Mobile No.*",
    getValue(data, "primary_contact_mobile"),
    "(Office mobile number of the contact person)",
  );
  row += 1;

  sheet.getRow(row).height = 40;
  labeledBlock(
    sheet,
    row,
    1,
    row,
    8,
    "D.6 Complete Name of the CBO Contact Person (Secondary)",
    getValue(data, "secondary_contact_name"),
  );
  labeledBlock(
    sheet,
    row,
    9,
    row,
    COLS,
    "D.7 Designation",
    getValue(data, "secondary_contact_designation"),
    "(Position of the contact person)",
  );
  row += 1;

  sheet.getRow(row).height = 40;
  labeledBlock(
    sheet,
    row,
    1,
    row,
    4,
    "D.8 Email Address",
    getValue(data, "secondary_contact_email"),
    "(Office email address of the contact person)",
  );
  labeledBlock(
    sheet,
    row,
    5,
    row,
    8,
    "D.9 Telephone No.",
    getValue(data, "secondary_contact_telephone"),
    "(Direct office number)",
  );
  labeledBlock(
    sheet,
    row,
    9,
    row,
    COLS,
    "D.10 Mobile No",
    getValue(data, "secondary_contact_mobile"),
    "(Office mobile number of the contact person)",
  );
  row += 1;

  // Step 5
  row = stepBanner(sheet, row, "STEP 5: EPAHP DIGITAL MAPPING SYSTEM CERTIFICATION");
  const certStart = row;
  sheet.getRow(certStart).height = 60;
  sheet.getRow(certStart + 1).height = 52;
  mergeSet(
    sheet,
    certStart,
    1,
    certStart + 1,
    8,
    "I hereby affirm that the information provided is accurate to the best of my knowledge and belief. I certify that I am the original source of the provided information. In cases where I am not the original source, I have obtained explicit permission to share this information and am authorized to do so. Additionally, I understand that the content shared does not infringe upon any copyright or intellectual property rights, and I have the legal right to submit this information.",
    { size: 9, valign: "top" },
  );
  mergeSet(
    sheet,
    certStart,
    9,
    certStart,
    COLS,
    `${getValue(data, "cbo_representative_signature_name") || "________________________"}\nSignature over printed name of the CBO Representative*`,
    { size: 9, align: "center", valign: "middle" },
  );
  mergeSet(sheet, certStart + 1, 9, certStart + 1, COLS, "(Thumbmark if unable to write)", {
    size: 9,
    align: "center",
    valign: "middle",
    fill: LIGHT_FILL,
  });
}

export async function exportCboExcelAction(formData: FormData): Promise<{
  filename: string;
  base64: string;
}> {
  const workbook = await buildCboWorkbook(formData);
  const buffer = await workbook.xlsx.writeBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  const org =
    getValue(formData, "organization_short_name") ||
    getValue(formData, "organization_name") ||
    "CBO";
  const dateStamp = new Date().toISOString().slice(0, 10);
  const filename = `CBO-Information-Sheet-${sanitizeFilename(org)}-${dateStamp}.xlsx`;

  return { filename, base64 };
}
