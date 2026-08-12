"use server";

import ExcelJS from "exceljs";
import { listCboRecordsForExport } from "@/lib/cbo/queries";
import {
  CBO_TABULAR_COLUMNS,
  flattenCboRecord,
} from "@/lib/cbo/tabular-export";

export type ExportAllCboTabularResult = {
  filename: string;
  base64: string;
  count: number;
};

export async function exportAllCboTabularExcelAction(
  searchQuery?: string,
): Promise<ExportAllCboTabularResult> {
  const records = await listCboRecordsForExport(searchQuery);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Database Collection";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("CBO Records", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.addRow(CBO_TABULAR_COLUMNS.map((column) => column.header));

  for (const record of records) {
    const flat = flattenCboRecord(record);
    sheet.addRow(CBO_TABULAR_COLUMNS.map((column) => flat[column.key] ?? ""));
  }

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: "middle", wrapText: true };

  for (let i = 0; i < CBO_TABULAR_COLUMNS.length; i += 1) {
    const column = sheet.getColumn(i + 1);
    column.width = Math.min(
      36,
      Math.max(14, CBO_TABULAR_COLUMNS[i].header.length + 2),
    );
  }

  if (CBO_TABULAR_COLUMNS.length > 0) {
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: CBO_TABULAR_COLUMNS.length },
    };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const dateStamp = new Date().toISOString().slice(0, 10);
  const scope = searchQuery?.trim() ? "filtered" : "all";
  const filename = `CBO-Records-${scope}-${dateStamp}.xlsx`;

  return {
    filename,
    base64,
    count: records.length,
  };
}
