"use server";

import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import { FORM_LOGO_FILES } from "@/lib/cbo/form-logos";
import { VALIDATOR_RPC_NAME } from "@/lib/cbo/validators";

const COLS = 12;

/** Long bond (PH 8.5"×13") — Excel Legal (5) is the closest standard size (8.5"×14"). */
const PRINT_PAPER_SIZE = 5;
/** Slightly narrower columns so 12 cols fit printable width without horizontal crop. */
const PRINT_COLUMN_WIDTH = 8.2;

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

function parseSignatureBase64(dataUrl: string): string | null {
  if (!dataUrl) return null;
  const match = dataUrl.match(/^data:image\/png;base64,(.+)$/i);
  if (match?.[1]) return match[1];
  return null;
}

function addSignatureImage(
  sheet: ExcelJS.Worksheet,
  dataUrl: string,
  startRow: number,
  startCol: number,
  colSpan: number,
) {
  const base64 = parseSignatureBase64(dataUrl);
  if (!base64) return;

  try {
    const imageId = sheet.workbook.addImage({ base64, extension: "png" });
    const imageWidth = Math.min(colSpan * 42, 128);
    const imageHeight = 20;
    const colOffset = Math.max(0.15, (colSpan - imageWidth / 68) / 2);

    // Sit in the blank line between the section label and the printed name.
    sheet.addImage(imageId, {
      tl: { col: startCol - 1 + colOffset, row: startRow - 1 + 0.68 },
      ext: { width: imageWidth, height: imageHeight },
    });
  } catch {
    // Ignore corrupt signature data so export still succeeds.
  }
}

function ensureBlockMinHeight(
  sheet: ExcelJS.Worksheet,
  startRow: number,
  endRow: number,
  minTotalHeight: number,
) {
  const rowCount = endRow - startRow + 1;
  const perRow = minTotalHeight / rowCount;
  for (let r = startRow; r <= endRow; r += 1) {
    const row = sheet.getRow(r);
    row.height = Math.max(row.height ?? 18, perRow);
  }
}

const LOGO_DIR = path.join(process.cwd(), "public", "logos");

function readLogoBase64(filename: string): string | null {
  try {
    return fs.readFileSync(path.join(LOGO_DIR, filename)).toString("base64");
  } catch {
    return null;
  }
}

function excelColumnLetter(col: number) {
  let letter = "";
  let n = col;
  while (n > 0) {
    const rem = (n - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    n = Math.floor((n - 1) / 26);
  }
  return letter;
}

function excelCellRange(
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number,
) {
  return `${excelColumnLetter(startCol)}${startRow}:${excelColumnLetter(endCol)}${endRow}`;
}

function applyWorksheetPrintSetup(sheet: ExcelJS.Worksheet, lastRow: number) {
  sheet.pageSetup.paperSize = PRINT_PAPER_SIZE;
  sheet.pageSetup.orientation = "portrait";
  sheet.pageSetup.fitToPage = true;
  sheet.pageSetup.fitToWidth = 1;
  sheet.pageSetup.fitToHeight = 0;
  sheet.pageSetup.scale = 100;
  sheet.pageSetup.horizontalCentered = true;
  sheet.pageSetup.showGridLines = false;
  sheet.pageSetup.margins = {
    left: 0.25,
    right: 0.25,
    top: 0.5,
    bottom: 0.5,
    header: 0.2,
    footer: 0.2,
  };
  sheet.pageSetup.printArea = excelCellRange(1, 1, lastRow, COLS);
}

function addHeaderLogos(sheet: ExcelJS.Worksheet, startRow: number) {
  const endRow = startRow + 1;
  const placements = [
    { file: FORM_LOGO_FILES.dswd, range: excelCellRange(startRow, 1, endRow, 2) },
    { file: FORM_LOGO_FILES.epahp, range: excelCellRange(startRow, 3, endRow, 3) },
    {
      file: FORM_LOGO_FILES.bagongPilipinas,
      range: excelCellRange(startRow, 4, endRow, 4),
    },
  ] as const;

  for (const placement of placements) {
    const base64 = readLogoBase64(placement.file);
    if (!base64) continue;

    try {
      const imageId = sheet.workbook.addImage({ base64, extension: "png" });
      sheet.addImage(imageId, placement.range);
    } catch {
      // Skip if a logo file cannot be embedded.
    }
  }
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
  options?: Parameters<typeof applyRange>[5] & { autoHeight?: boolean },
) {
  if (startRow !== endRow || startCol !== endCol) {
    sheet.mergeCells(startRow, startCol, endRow, endCol);
  }
  sheet.getCell(startRow, startCol).value = value;
  const { autoHeight = true, ...rangeOptions } = options ?? {};
  applyRange(sheet, startRow, startCol, endRow, endCol, rangeOptions);

  if (autoHeight) {
    const colSpan = endCol - startCol + 1;
    const fontSize = rangeOptions.size ?? 10;
    ensureRowHeights(
      sheet,
      startRow,
      endRow,
      neededHeightForText(value, colSpan, fontSize),
    );
  }

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

/** Approx. wrapped line count for our default column width (~9.8). */
function estimateWrappedLines(text: string, colSpan: number): number {
  const trimmed = text?.trim() ?? "";
  if (!trimmed) return 0;
  // Conservative: Excel wraps earlier than raw char width, especially with bold text.
  const charsPerLine = Math.max(8, Math.floor(colSpan * 6.5));
  let lines = 0;
  for (const paragraph of trimmed.split(/\r?\n/)) {
    if (!paragraph) {
      lines += 1;
      continue;
    }
    lines += Math.max(1, Math.ceil(paragraph.length / charsPerLine));
  }
  return lines;
}

function ensureRowHeights(
  sheet: ExcelJS.Worksheet,
  startRow: number,
  endRow: number,
  totalHeight: number,
  minPerRow = 18,
) {
  const rowSpan = Math.max(1, endRow - startRow + 1);
  const perRow = Math.max(minPerRow, totalHeight / rowSpan);
  for (let r = startRow; r <= endRow; r += 1) {
    const current = sheet.getRow(r).height ?? 15;
    sheet.getRow(r).height = Math.max(current, perRow);
  }
}

function neededHeightForText(
  text: string,
  colSpan: number,
  fontSize = 10,
  minHeight = 18,
): number {
  const lines = Math.max(1, estimateWrappedLines(text, colSpan));
  const linePt = Math.max(12, fontSize + 4);
  return Math.max(minHeight, lines * linePt + 8);
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
  sheet.mergeCells(startRow, startCol, endRow, endCol);
  const cell = sheet.getCell(startRow, startCol);
  cell.value = {
    richText: [
      { text: `${label}\n`, font: { bold: true, size: 10 } },
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

  const colSpan = endCol - startCol + 1;
  const combined = [label, hint ?? "", value || " "].filter(Boolean).join("\n");
  ensureRowHeights(
    sheet,
    startRow,
    endRow,
    neededHeightForText(combined, colSpan, 11, 36),
  );
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
  });

  for (let c = 1; c <= COLS; c += 1) {
    sheet.getColumn(c).width = PRINT_COLUMN_WIDTH;
  }

  let row = 1;

  sheet.getRow(row).height = 28;
  mergeSet(sheet, row, 1, row + 1, 2, "", {
    align: "center",
    valign: "middle",
    fill: LIGHT_FILL,
  });
  mergeSet(sheet, row, 3, row + 1, 3, "", {
    align: "center",
    valign: "middle",
    fill: LIGHT_FILL,
  });
  mergeSet(sheet, row, 4, row + 1, 4, "", {
    align: "center",
    valign: "middle",
    fill: LIGHT_FILL,
  });
  addHeaderLogos(sheet, row);
  mergeSet(
    sheet,
    row,
    5,
    row + 1,
    COLS,
    "ENHANCED PARTNERSHIP AGAINST HUNGER AND POVERTY:\nCOMMUNITY-BASED ORGANIZATION INFORMATION SHEET (Version 3.0)",
    { bold: true, size: 12, align: "right", valign: "middle" },
  );
  sheet.getRow(row + 1).height = 32;
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

  const mode = getValue(data, "mode_of_collection");
  // Mode of collection / metadata — let labeledBlock auto-size
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

  row = sectionBanner(sheet, row, "A. COMMUNITY-BASED ORGANIZATION INFORMATION");
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

  // A.6–A.10 Primary Contact
  labeledBlock(
    sheet, row, 1, row, 8,
    "A.6 Complete Name of the CBO Contact Person (Primary)",
    getValue(data, "primary_contact_name"),
  );
  labeledBlock(
    sheet, row, 9, row, COLS,
    "A.7 Designation*",
    getValue(data, "primary_contact_designation"),
    "(Position of the contact person)",
  );
  row += 1;

  labeledBlock(
    sheet, row, 1, row, 4,
    "A.8 Email Address*",
    getValue(data, "primary_contact_email"),
    "(Office email address of the contact person)",
  );
  labeledBlock(
    sheet, row, 5, row, 8,
    "A.9 Telephone No.*",
    getValue(data, "primary_contact_telephone"),
    "(Direct office number)",
  );
  labeledBlock(
    sheet, row, 9, row, COLS,
    "A.10 Mobile No.*",
    getValue(data, "primary_contact_mobile"),
    "(Office mobile number of the contact person)",
  );
  row += 1;

  // A.11–A.15 Secondary Contact
  labeledBlock(
    sheet, row, 1, row, 8,
    "A.11 Complete Name of the CBO Contact Person (Secondary)",
    getValue(data, "secondary_contact_name"),
  );
  labeledBlock(
    sheet, row, 9, row, COLS,
    "A.12 Designation",
    getValue(data, "secondary_contact_designation"),
    "(Position of the contact person)",
  );
  row += 1;

  labeledBlock(
    sheet, row, 1, row, 4,
    "A.13 Email Address",
    getValue(data, "secondary_contact_email"),
    "(Office email address of the contact person)",
  );
  labeledBlock(
    sheet, row, 5, row, 8,
    "A.14 Telephone No.",
    getValue(data, "secondary_contact_telephone"),
    "(Direct office number)",
  );
  labeledBlock(
    sheet, row, 9, row, COLS,
    "A.15 Mobile No",
    getValue(data, "secondary_contact_mobile"),
    "(Office mobile number of the contact person)",
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

  sheet.getRow(row).height = 40;
  mergeSet(sheet, row, 1, row, 3, "B.7.1 Product*", {
    bold: true,
    size: 9,
    fill: HEADER_FILL,
    align: "center",
    valign: "middle",
    wrap: true,
  });
  mergeSet(sheet, row, 4, row, 6, "B.7.2 Type of Product*", {
    bold: true,
    size: 9,
    fill: HEADER_FILL,
    align: "center",
    valign: "middle",
    wrap: true,
  });
  mergeSet(sheet, row, 7, row, 8, "B.7.3 Quantity*", {
    bold: true,
    size: 9,
    fill: HEADER_FILL,
    align: "center",
    valign: "middle",
    wrap: true,
  });
  mergeSet(sheet, row, 9, row, 10, "B.7.4 Unit*", {
    bold: true,
    size: 9,
    fill: HEADER_FILL,
    align: "center",
    valign: "middle",
    wrap: true,
  });
  mergeSet(sheet, row, 11, row, 12, "B.7.5 Market Value (in PhP)*", {
    bold: true,
    size: 9,
    fill: HEADER_FILL,
    align: "center",
    valign: "middle",
    wrap: true,
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

    sheet.getRow(row).height = Math.max(sheet.getRow(row).height ?? 15, 20);
    mergeSet(sheet, row, 1, row, 3, product, { size: 9, wrap: true });
    mergeSet(sheet, row, 4, row, 6, type, { size: 9, wrap: true });
    mergeSet(sheet, row, 7, row, 8, quantity, { size: 9, align: "right" });
    mergeSet(sheet, row, 9, row, 10, unit, { size: 9, wrap: true });
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

  sheet.getRow(row).height = Math.max(sheet.getRow(row).height ?? 15, 36);
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
  const docText = DOCUMENTS.map(
    (doc) => `${mark(isChecked(data, doc.name))} ${doc.label}`,
  ).join("     ");
  mergeSet(sheet, row, 1, row, COLS, docText, {
    size: 10,
    valign: "top",
    wrap: true,
  });
  row += 1;

  // B. NP-CP Requirement Checklist
  row = sectionBanner(sheet, row, "B. NP-CP REQUIREMENT CHECKLIST");
  row = mergeSet(sheet, row, 1, row, COLS, "I. LEGAL REQUIREMENTS", {
    bold: true,
    size: 11,
    fill: HEADER_FILL,
    valign: "middle",
  });
  row = mergeSet(
    sheet,
    row,
    1,
    row,
    COLS,
    `${mark(isChecked(data, "legal_certificate_of_registration"))} A. Certificate of Registration`,
    {
      bold: true,
      size: 10,
      fill: SUBHEADER_FILL,
      valign: "middle",
    },
  );

  const agencies = [
    {
      key: "dti",
      title: "Department of Trade and Industry (DTI)",
      fields: [
        ["Territorial scope", "territorial_scope"],
        ["Registry No.", "registry_no"],
        ["Date of Issuance", "date_of_issuance"],
        ["Date of Validity", "date_of_validity"],
      ],
    },
    {
      key: "sec",
      title: "Securities and Exchange Commission (SEC)",
      fields: [
        ["Type of Registration", "type_of_registration"],
        ["Registry No.", "registry_no"],
        ["Date of Issuance", "date_of_issuance"],
        ["Date of Validity", "date_of_validity"],
      ],
    },
    {
      key: "cda",
      title: "Cooperative Development Authority (CDA)",
      fields: [
        ["Type of Cooperative", "type_of_cooperative"],
        ["Registry No.", "registry_no"],
        ["Date of Issuance", "date_of_issuance"],
        ["Date of Validity", "date_of_validity"],
      ],
    },
    {
      key: "cso",
      title:
        "Civil Society Organization (CSO)/ Non-government Organizations (NGO)/ Peoples' Organization (PO)",
      fields: [
        ["Agency issuer", "agency_issuer"],
        ["Registry No.", "registry_no"],
        ["Date of Issuance", "date_of_issuance"],
        ["Date of Validity", "date_of_validity"],
      ],
    },
  ] as const;

  const agencyStart = row;
  const agencyRowCount = 5;
  for (let i = 0; i < agencies.length; i += 1) {
    const agency = agencies[i];
    const startCol = i * 3 + 1;
    const endCol = startCol + 2;
    const selected = isChecked(data, `registration_${agency.key}_selected`);
    const lines = [
      `${mark(selected)} ${agency.title}`,
      ...agency.fields.map(
        ([label, field]) =>
          `${label}: ${getValue(data, `registration_${agency.key}_${field}`)}`,
      ),
    ].join("\n");

    mergeSet(
      sheet,
      agencyStart,
      startCol,
      agencyStart + agencyRowCount - 1,
      endCol,
      lines,
      { size: 8, valign: "top" },
    );
  }
  row = agencyStart + agencyRowCount;

  row = mergeSet(sheet, row, 1, row, COLS, "II. FINANCIAL REQUIREMENTS", {
    bold: true,
    size: 11,
    fill: HEADER_FILL,
    valign: "middle",
  });

  const financialItems = [
    {
      key: "dole",
      title:
        "Department of Labor and Employment (DOLE) Registration under Rule 1020",
      fields: [
        ["Registry No.", "registry_no"],
        ["Date of Issuance", "date_of_issuance"],
        ["Date of Validity", "date_of_validity"],
      ],
      cols: 3,
    },
    {
      key: "bank_book",
      title: "Bank book / Books of Account",
      fields: [] as [string, string][],
      cols: 2,
    },
    {
      key: "afs",
      title: "Updated / Audited Financial Statement (AFS)",
      fields: [["Year", "year"]],
      cols: 2,
    },
    {
      key: "itr",
      title: "Latest Income Tax Return (ITR)",
      fields: [["Year", "year"]],
      cols: 2,
    },
    {
      key: "sales_invoice",
      title: "Sales Invoice",
      fields: [] as [string, string][],
      cols: 3,
    },
  ] as const;

  const finStart = row;
  let finCol = 1;
  for (const item of financialItems) {
    const selected = isChecked(data, `financial_${item.key}_selected`);
    const lines = [
      `${mark(selected)} ${item.title}`,
      ...item.fields.map(
        ([label, field]) =>
          `${label}: ${getValue(data, `financial_${item.key}_${field}`)}`,
      ),
    ].join("\n");
    const endCol = Math.min(finCol + item.cols - 1, COLS);
    mergeSet(sheet, finStart, finCol, finStart + 3, endCol, lines, {
      size: 8,
      valign: "top",
    });
    finCol = endCol + 1;
  }
  row = finStart + 4;

  row = mergeSet(
    sheet,
    row,
    1,
    row,
    COLS,
    "III. ADDITIONAL REGISTRATIONS/ACCREDITATIONS",
    {
      bold: true,
      size: 11,
      fill: HEADER_FILL,
      valign: "middle",
    },
  );

  const additionalItems = [
    {
      key: "business_permit",
      title: "Business Permit (Mayor's Permit)",
      fields: [
        ["Registry No.", "registry_no"],
        ["Date of Issuance", "date_of_issuance"],
        ["Date of Validity", "date_of_validity"],
      ],
    },
    {
      key: "ffedis",
      title:
        "Farmers and Fisherfolk Enterprise Development Information System (FFEDIS)",
      fields: [
        ["Registry No.", "registry_no"],
        ["Date of Issuance", "date_of_issuance"],
        ["Date of Validity", "date_of_validity"],
      ],
    },
    {
      key: "bir",
      title: "BIR Registration",
      fields: [
        ["Type of BIR Registration", "type_of_bir_registration"],
        ["Registry No.", "registry_no"],
        ["Date of Issuance", "date_of_issuance"],
        ["Date of Validity", "date_of_validity"],
      ],
    },
    {
      key: "philgeps",
      title: "Philippine Government Electronic Procurement (PhilGEPS)",
      fields: [
        ["Type of Registration", "type_of_registration"],
        ["Registry No.", "registry_no"],
        ["Date of Issuance", "date_of_issuance"],
        ["Date of Validity", "date_of_validity"],
      ],
    },
    {
      key: "rsbsa",
      title: "Registry System for Basic Sectors in Agriculture (RSBSA)",
      fields: [
        ["Registry No.", "registry_no"],
        ["Date of Issuance", "date_of_issuance"],
        ["Date of Validity", "date_of_validity"],
      ],
    },
    {
      key: "fish_ar",
      title: "Fisherfolk Registration (FISH-AR)",
      fields: [
        ["Registry No.", "registry_no"],
        ["Date of Issuance", "date_of_issuance"],
        ["Date of Validity", "date_of_validity"],
      ],
    },
    {
      key: "fda",
      title: "Food and Drug Administration (FDA)",
      fields: [
        ["Registry No.", "registry_no"],
        ["Date of Issuance", "date_of_issuance"],
        ["Date of Validity", "date_of_validity"],
      ],
    },
    {
      key: "arbo",
      title: "Agrarian Reform Beneficiaries Organizations",
      fields: [
        ["Registry No.", "registry_no"],
        ["Date of Issuance", "date_of_issuance"],
        ["Date of Validity", "date_of_validity"],
      ],
    },
    {
      key: "farmers_association",
      title: "Farmers' Association",
      fields: [
        ["Registry No.", "registry_no"],
        ["Date of Issuance", "date_of_issuance"],
        ["Date of Validity", "date_of_validity"],
      ],
    },
    {
      key: "irrigators_association",
      title: "Irrigators Association",
      fields: [
        ["Registry No.", "registry_no"],
        ["Date of Issuance", "date_of_issuance"],
        ["Date of Validity", "date_of_validity"],
      ],
    },
    {
      key: "labor_unions",
      title: "Labor Unions and Workers' Association",
      fields: [
        ["Registry No.", "registry_no"],
        ["Date of Issuance", "date_of_issuance"],
        ["Date of Validity", "date_of_validity"],
      ],
    },
    {
      key: "slpa",
      title: "Sustainable Livelihood Program Associations",
      fields: [
        ["Registry No.", "registry_no"],
        ["Date of Issuance", "date_of_issuance"],
        ["Date of Validity", "date_of_validity"],
      ],
    },
  ] as const;

  for (let i = 0; i < additionalItems.length; i += 4) {
    const blockStart = row;
    for (let c = 0; c < 4; c += 1) {
      const item = additionalItems[i + c];
      if (!item) continue;
      const selected = isChecked(data, `additional_${item.key}_selected`);
      const lines = [
        `${mark(selected)} ${item.title}`,
        ...item.fields.map(
          ([label, field]) =>
            `${label}: ${getValue(data, `additional_${item.key}_${field}`)}`,
        ),
      ].join("\n");
      const startCol = c * 3 + 1;
      mergeSet(sheet, blockStart, startCol, blockStart + 4, startCol + 2, lines, {
        size: 8,
        valign: "top",
      });
    }
    row = blockStart + 5;
  }

  row = mergeSet(sheet, row, 1, row, COLS, "IV. INTERVENTION RECEIVED", {
    bold: true,
    size: 11,
    fill: HEADER_FILL,
    valign: "middle",
  });

  const interventionHeader = row;
  sheet.getRow(interventionHeader).height = 42;
  mergeSet(sheet, interventionHeader, 1, interventionHeader, 3, "PARTNER AGENCY/STAKEHOLDER:", {
    bold: true,
    size: 8,
    fill: HEADER_FILL,
    align: "center",
    valign: "middle",
  });
  mergeSet(
    sheet,
    interventionHeader,
    4,
    interventionHeader,
    6,
    "INTERVENTION\n(e.g., livelihood assistance, training, equipment, or other support provided under the program)",
    {
      bold: true,
      size: 8,
      fill: HEADER_FILL,
      align: "center",
      valign: "middle",
    },
  );
  mergeSet(sheet, interventionHeader, 7, interventionHeader, 8, "PPAs", {
    bold: true,
    size: 8,
    fill: HEADER_FILL,
    align: "center",
    valign: "middle",
  });
  mergeSet(
    sheet,
    interventionHeader,
    9,
    interventionHeader,
    10,
    "AMOUNT (PhP)\n(for fund assistance only)",
    {
      bold: true,
      size: 8,
      fill: HEADER_FILL,
      align: "center",
      valign: "middle",
    },
  );
  mergeSet(
    sheet,
    interventionHeader,
    11,
    interventionHeader,
    12,
    "DATE RECEIVED\n(Indicate the date when the beneficiaries received the intervention.)",
    {
      bold: true,
      size: 8,
      fill: HEADER_FILL,
      align: "center",
      valign: "middle",
    },
  );
  row = interventionHeader + 1;

  for (let i = 0; i < 10; i += 1) {
    mergeSet(
      sheet,
      row,
      1,
      row,
      3,
      getValue(data, `intervention[${i}][partner_agency]`),
      { size: 9 },
    );
    mergeSet(
      sheet,
      row,
      4,
      row,
      6,
      getValue(data, `intervention[${i}][intervention]`),
      { size: 9 },
    );
    mergeSet(sheet, row, 7, row, 8, getValue(data, `intervention[${i}][ppas]`), {
      size: 9,
    });
    mergeSet(
      sheet,
      row,
      9,
      row,
      10,
      getValue(data, `intervention[${i}][amount]`),
      { size: 9, align: "right" },
    );
    mergeSet(
      sheet,
      row,
      11,
      row,
      12,
      getValue(data, `intervention[${i}][date_received]`),
      { size: 9, align: "center" },
    );
    row += 1;
  }

  // V. Issues, Actions and Recommendations
  row = mergeSet(
    sheet,
    row,
    1,
    row,
    COLS,
    "V. ISSUES, ACTIONS AND RECOMMENDATIONS (Use a separate sheet if space is insufficient.)",
    {
      bold: true,
      size: 10,
      fill: HEADER_FILL,
      valign: "middle",
    },
  );

  const issuesHeader = row;
  sheet.getRow(issuesHeader).height = 48;
  mergeSet(
    sheet,
    issuesHeader,
    1,
    issuesHeader,
    4,
    "ISSUES AND CONCERNS/CHALLENGES*\nTo be accomplished by the CBO, focusing on documentation and requirements, capacity to supply, production capacity, and supplier's experience.",
    {
      bold: true,
      size: 8,
      fill: HEADER_FILL,
      align: "center",
      valign: "middle",
    },
  );
  mergeSet(
    sheet,
    issuesHeader,
    5,
    issuesHeader,
    8,
    "ACTION TAKEN*\n(Actions undertaken by the CBO to address the issues or challenges)",
    {
      bold: true,
      size: 8,
      fill: HEADER_FILL,
      align: "center",
      valign: "middle",
    },
  );
  mergeSet(
    sheet,
    issuesHeader,
    9,
    issuesHeader,
    12,
    "RECOMMENDATION*\n(Suggestions or recommendations provided by the RPMO's)",
    {
      bold: true,
      size: 8,
      fill: HEADER_FILL,
      align: "center",
      valign: "middle",
    },
  );
  row = issuesHeader + 1;

  const issuesBody = row;
  mergeSet(
    sheet,
    issuesBody,
    1,
    issuesBody + 5,
    4,
    getValue(data, "issues_concerns_challenges"),
    { size: 9, valign: "top" },
  );
  mergeSet(
    sheet,
    issuesBody,
    5,
    issuesBody + 5,
    8,
    getValue(data, "action_taken"),
    { size: 9, valign: "top" },
  );
  mergeSet(
    sheet,
    issuesBody,
    9,
    issuesBody + 5,
    12,
    getValue(data, "recommendation"),
    { size: 9, valign: "top" },
  );
  row = issuesBody + 6;

  // VI. CBO Assessment
  row = mergeSet(
    sheet,
    row,
    1,
    row,
    COLS,
    "VI. CBO ASSESSMENT* (Kindly provide the details of the assessment of the CBO along with a narrative justification).",
    {
      bold: true,
      size: 10,
      fill: HEADER_FILL,
      valign: "middle",
    },
  );

  const assessHeader = row;
  sheet.getRow(assessHeader).height = 72;
  mergeSet(
    sheet,
    assessHeader,
    1,
    assessHeader,
    4,
    "CBO Assessment Status (Provide preliminary assessment of the CBO)*\n1. Qualified CBOs completed all requirements and can supply to institutional markets.\n2. Semi-qualified CBOs have incomplete requirements.\n3. Not Qualified CBOs have no existing requirements during latest validation (e.g. newly organized SLPAs).",
    {
      bold: true,
      size: 7,
      fill: HEADER_FILL,
      align: "left",
      valign: "top",
    },
  );
  mergeSet(
    sheet,
    assessHeader,
    5,
    assessHeader,
    7,
    "Remarks in terms of CBO Assessment*\n(indicate the specific reason why the CBO assessment is semi qualified or not qualified)",
    {
      bold: true,
      size: 7,
      fill: HEADER_FILL,
      align: "center",
      valign: "middle",
    },
  );
  mergeSet(
    sheet,
    assessHeader,
    8,
    assessHeader,
    9,
    "Date of Assessment*\n(Identify the specific date the RPMO/RCT provided the result of the preliminary assessment)",
    {
      bold: true,
      size: 7,
      fill: HEADER_FILL,
      align: "center",
      valign: "middle",
    },
  );
  mergeSet(
    sheet,
    assessHeader,
    10,
    assessHeader,
    12,
    "Remarks*\n(Input other relevant information on the CBO)",
    {
      bold: true,
      size: 7,
      fill: HEADER_FILL,
      align: "center",
      valign: "middle",
    },
  );
  row = assessHeader + 1;

  const assessmentStatus = getValue(data, "cbo_assessment_status");
  const statusLabel =
    assessmentStatus === "qualified"
      ? "Qualified"
      : assessmentStatus === "semi_qualified"
        ? "Semi-qualified"
        : assessmentStatus === "not_qualified"
          ? "Not Qualified"
          : "";

  const assessBody = row;
  mergeSet(sheet, assessBody, 1, assessBody + 4, 4, statusLabel, {
    size: 10,
    valign: "top",
  });
  mergeSet(
    sheet,
    assessBody,
    5,
    assessBody + 4,
    7,
    getValue(data, "cbo_assessment_remarks"),
    { size: 9, valign: "top" },
  );
  mergeSet(
    sheet,
    assessBody,
    8,
    assessBody + 4,
    9,
    getValue(data, "date_of_assessment"),
    { size: 9, valign: "top", align: "center" },
  );
  mergeSet(
    sheet,
    assessBody,
    10,
    assessBody + 4,
    12,
    getValue(data, "cbo_other_remarks"),
    { size: 9, valign: "top" },
  );
  row = assessBody + 5;

  // RCT deliberation + narrative
  row = mergeSet(
    sheet,
    row,
    1,
    row,
    COLS,
    "Kindly check and provide the result of the assessment of the CBO along with a narrative justification",
    { italic: true, size: 9 },
  );

  const rct = getValue(data, "rct_deliberation");
  row = mergeSet(
    sheet,
    row,
    1,
    row,
    COLS,
    `${radioMark(rct, "recommended")} RECOMMENDED FOR RCT DELIBERATION     ${radioMark(rct, "not_recommended")} NOT RECOMMENDED FOR RCT DELIBERATION`,
    { size: 10, bold: true },
  );

  row = mergeSet(sheet, row, 1, row, COLS, "NARRATIVE:", {
    bold: true,
    size: 10,
    fill: LIGHT_FILL,
  });

  const narrativeStart = row;
  mergeSet(
    sheet,
    narrativeStart,
    1,
    narrativeStart + 3,
    COLS,
    getValue(data, "assessment_narrative"),
    { size: 9, valign: "top" },
  );
  row = narrativeStart + 4;

  // Others - if qualified
  row = mergeSet(
    sheet,
    row,
    1,
    row,
    COLS,
    "OTHERS (if the CBO deemed as qualified)",
    {
      bold: true,
      size: 11,
      fill: HEADER_FILL,
      valign: "middle",
    },
  );
  sheet.getRow(row).height = 36;
  labeledBlock(
    sheet,
    row,
    1,
    row,
    COLS,
    "Date Confirmed as EPAHP Qualified CBO*",
    getValue(data, "date_confirmed_epahp_qualified"),
    "(Provide the date of confirmation as qualified CBO)",
  );
  row += 1;

  // Validators
  row = mergeSet(sheet, row, 1, row, COLS, "VALIDATORS", {
    bold: true,
    size: 11,
    fill: HEADER_FILL,
    align: "center",
    valign: "middle",
  });

  const validatorStart = row;
  mergeSet(
    sheet,
    validatorStart,
    1,
    validatorStart + 4,
    5,
    `Validate by:\n\n\n${getValue(data, "validator_field_pdo_name") || "________________________"}\nSignature over Printed Name of Field Validator (PDO)`,
    { size: 9, align: "center", valign: "top" },
  );
  addSignatureImage(
    sheet,
    getValue(data, "validator_field_pdo_signature"),
    validatorStart,
    1,
    5,
  );
  mergeSet(
    sheet,
    validatorStart,
    6,
    validatorStart + 4,
    9,
    `Reviewed and Approved by:\n\n\n${VALIDATOR_RPC_NAME}\nSignature over Printed Name of Regional Program Coordinator`,
    { size: 9, align: "center", valign: "top" },
  );
  addSignatureImage(
    sheet,
    getValue(data, "validator_rpc_signature"),
    validatorStart,
    6,
    4,
  );
  if (
    getValue(data, "validator_field_pdo_signature") ||
    getValue(data, "validator_rpc_signature")
  ) {
    ensureBlockMinHeight(sheet, validatorStart, validatorStart + 4, 92);
  }
  mergeSet(
    sheet,
    validatorStart,
    10,
    validatorStart + 4,
    12,
    `Date\n\n${getValue(data, "validator_approval_date") || "____________"}\nDate`,
    { size: 9, align: "center", valign: "bottom" },
  );
  row = validatorStart + 5;

  row = mergeSet(sheet, row, 1, row, COLS, "PAGE 5 of 5", {
    bold: true,
    size: 10,
    align: "center",
  });
  mergeSet(
    sheet,
    row,
    1,
    row + 1,
    COLS,
    "DSWD Field Office XI, Ramon Magsaysay Avenue corner Damaso Suazo Street, Davao City, Philippines 8000\nWebsite: fo11.dswd.gov.ph Tel. No.:(082) 227-1964",
    { size: 8, align: "center", italic: true },
  );

  applyWorksheetPrintSetup(sheet, row + 1);
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
