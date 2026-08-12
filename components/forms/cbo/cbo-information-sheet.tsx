"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { exportCboExcelAction } from "@/lib/actions/export-cbo-excel";

function downloadBase64Excel(base64: string, filename: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  const blob = new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function RequiredMark() {
  return <span className="text-[#c00000]">*</span>;
}

function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <div className="border-b border-black bg-[var(--form-header)] px-3 py-2 text-center text-[13px] font-bold uppercase tracking-wide text-black">
      {children}
    </div>
  );
}

function FieldLabel({
  code,
  title,
  required,
  hint,
}: {
  code?: string;
  title: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="mb-1.5">
      <p className="text-[12.5px] font-bold leading-snug text-black">
        {code ? <span>{code} </span> : null}
        {title}
        {required ? <RequiredMark /> : null}
      </p>
      {hint ? (
        <p className="mt-0.5 text-[11px] italic leading-snug text-zinc-600">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function TextInput({
  name,
  placeholder,
  type = "text",
}: {
  name: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      className="h-8 w-full border-0 border-b border-zinc-400 bg-transparent px-0 text-[13px] text-black outline-none placeholder:text-zinc-400 focus:border-black"
    />
  );
}

function CheckboxOption({
  name,
  value,
  label,
  type = "checkbox",
}: {
  name: string;
  value: string;
  label: string;
  type?: "checkbox" | "radio";
}) {
  return (
    <label className="inline-flex cursor-pointer items-start gap-2 text-[12.5px] leading-snug text-black">
      <input
        type={type}
        name={name}
        value={value}
        className="mt-0.5 size-3.5 shrink-0 accent-black"
      />
      <span>{label}</span>
    </label>
  );
}

const SECTORAL_FIELDS = [
  { name: "sectoral_general_public", label: "General Public" },
  { name: "sectoral_senior_citizen", label: "Senior Citizen" },
  {
    name: "sectoral_pwd",
    label: "Persons with Disability (PWD)",
  },
  { name: "sectoral_ip", label: "Indigenous People (IP)" },
  { name: "sectoral_solo_parents", label: "Solo Parents" },
  { name: "sectoral_4ps_member", label: "4Ps member" },
] as const;

const PRODUCTION_ROW_COUNT = 8;

type ProductionRow = {
  product: string;
  type: string;
  quantity: string;
  unit: string;
  marketValue: string;
};

function emptyProductionRow(): ProductionRow {
  return {
    product: "",
    type: "",
    quantity: "",
    unit: "",
    marketValue: "",
  };
}

function parseAmount(value: string) {
  const n = Number(value.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function formatAmount(value: number) {
  if (!value) return "";
  return value.toLocaleString("en-PH", {
    maximumFractionDigits: 2,
  });
}

const PROCUREMENT_ROWS = [
  {
    key: "competitive_bidding",
    label: "Competitive Bidding",
    kind: "item" as const,
  },
  {
    key: "alt_header",
    label: "Alternative Modes of Procurement:",
    kind: "header" as const,
  },
  {
    key: "negotiated_community_participation",
    label: "Negotiated Procurement - Community Participation",
    kind: "item" as const,
  },
  {
    key: "direct_contracting",
    label: "Direct Contracting",
    kind: "item" as const,
  },
  {
    key: "shopping",
    label: "Shopping",
    kind: "item" as const,
  },
  {
    key: "small_value_procurement",
    label: "Small Value Procurement",
    kind: "item" as const,
  },
  {
    key: "others",
    label: "Others",
    kind: "others" as const,
  },
] as const;

type ProcurementRowState = {
  selected: boolean;
  participation: string;
  contractsWon: string;
  successfulImplementation: string;
  otherText?: string;
};

function emptyProcurementRow(): ProcurementRowState {
  return {
    selected: false,
    participation: "",
    contractsWon: "",
    successfulImplementation: "",
  };
}

function ProcurementExperienceTable() {
  const [noExperience, setNoExperience] = useState(false);
  const [rows, setRows] = useState<Record<string, ProcurementRowState>>(() => {
    const initial: Record<string, ProcurementRowState> = {};
    for (const row of PROCUREMENT_ROWS) {
      if (row.kind === "header") continue;
      initial[row.key] = emptyProcurementRow();
      if (row.kind === "others") {
        initial[row.key].otherText = "";
      }
    }
    return initial;
  });

  function updateRow(
    key: string,
    patch: Partial<ProcurementRowState>,
  ) {
    setRows((current) => ({
      ...current,
      [key]: { ...current[key], ...patch },
    }));
  }

  function handleNoExperience(checked: boolean) {
    setNoExperience(checked);
    if (checked) {
      setRows((current) => {
        const next: Record<string, ProcurementRowState> = {};
        for (const [key, row] of Object.entries(current)) {
          next[key] = {
            ...emptyProcurementRow(),
            otherText: key === "others" ? "" : row.otherText,
          };
        }
        return next;
      });
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-[12px]">
        <thead>
          <tr className="bg-zinc-50">
            <th className="border border-black px-2 py-2 text-left font-bold">
              Procurement Type
            </th>
            <th className="border border-black px-2 py-2 text-left font-bold">
              B.13.1 Number of participation
            </th>
            <th className="border border-black px-2 py-2 text-left font-bold">
              B.13.2 Number of Contracts Won
            </th>
            <th className="border border-black px-2 py-2 text-left font-bold">
              B.13.3 Number of Successful Implementation
            </th>
          </tr>
        </thead>
        <tbody>
          {PROCUREMENT_ROWS.map((row) => {
            if (row.kind === "header") {
              return (
                <tr key={row.key}>
                  <td
                    colSpan={4}
                    className="border border-black bg-[#eef5e8] px-2 py-2 text-[12px] font-semibold italic text-black"
                  >
                    {row.label}
                  </td>
                </tr>
              );
            }

            const state = rows[row.key];
            const disabled = noExperience || !state.selected;

            return (
              <tr key={row.key}>
                <td className="border border-black px-2 py-2 align-middle">
                  <label className="flex items-start gap-2 text-[12.5px] text-black">
                    <input
                      type="checkbox"
                      name={`procurement_${row.key}_selected`}
                      checked={state.selected}
                      disabled={noExperience}
                      onChange={(e) =>
                        updateRow(row.key, {
                          selected: e.target.checked,
                          ...(e.target.checked
                            ? {}
                            : {
                                participation: "",
                                contractsWon: "",
                                successfulImplementation: "",
                              }),
                        })
                      }
                      className="mt-0.5 size-3.5 shrink-0 accent-black disabled:opacity-40"
                    />
                    <span className="leading-snug">
                      {row.label}
                      {row.kind === "others" ? (
                        <>
                          :{" "}
                          <input
                            name={`procurement_${row.key}_other`}
                            type="text"
                            value={state.otherText ?? ""}
                            disabled={noExperience || !state.selected}
                            onChange={(e) =>
                              updateRow(row.key, { otherText: e.target.value })
                            }
                            className="ml-1 inline-block h-7 w-36 border-0 border-b border-zinc-400 bg-transparent px-0 text-[12.5px] outline-none focus:border-black disabled:opacity-40"
                          />
                        </>
                      ) : null}
                    </span>
                  </label>
                </td>
                {(
                  [
                    ["participation", "participation"],
                    ["contracts_won", "contractsWon"],
                    ["successful_implementation", "successfulImplementation"],
                  ] as const
                ).map(([suffix, field]) => (
                  <td key={suffix} className="border border-black p-1">
                    <input
                      name={`procurement_${row.key}_${suffix}`}
                      type="number"
                      min={0}
                      value={state[field]}
                      disabled={disabled}
                      onChange={(e) =>
                        updateRow(row.key, { [field]: e.target.value })
                      }
                      className="h-8 w-full bg-transparent px-1 text-[12.5px] outline-none disabled:bg-zinc-50 disabled:opacity-40"
                    />
                  </td>
                ))}
              </tr>
            );
          })}
          <tr>
            <td colSpan={4} className="border border-black px-2 py-2">
              <label className="inline-flex items-center gap-2 text-[12.5px] text-black">
                <input
                  type="checkbox"
                  name="procurement_no_experience"
                  checked={noExperience}
                  onChange={(e) => handleNoExperience(e.target.checked)}
                  className="size-3.5 accent-black"
                />
                No experience
              </label>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function AnnualProductionTable() {
  const [rows, setRows] = useState<ProductionRow[]>(() =>
    Array.from({ length: PRODUCTION_ROW_COUNT }, emptyProductionRow),
  );

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.quantity += parseAmount(row.quantity);
        acc.marketValue += parseAmount(row.marketValue);
        return acc;
      },
      { quantity: 0, marketValue: 0 },
    );
  }, [rows]);

  function updateRow(
    index: number,
    field: keyof ProductionRow,
    value: string,
  ) {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-[12px]">
        <thead>
          <tr className="bg-zinc-50">
            <th className="border border-black px-2 py-2 text-left font-bold">
              B.7.1 Product
              <RequiredMark />
            </th>
            <th className="border border-black px-2 py-2 text-left font-bold">
              B.7.2 Type of Product
              <RequiredMark />
            </th>
            <th className="border border-black px-2 py-2 text-left font-bold">
              B.7.3 Quantity
              <RequiredMark />
            </th>
            <th className="border border-black px-2 py-2 text-left font-bold">
              B.7.4 Unit
              <RequiredMark />
            </th>
            <th className="border border-black px-2 py-2 text-left font-bold">
              B.7.5 Market Value (in PhP)
              <RequiredMark />
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td className="border border-black p-1">
                <input
                  name={`production[${index}][product]`}
                  value={row.product}
                  onChange={(e) => updateRow(index, "product", e.target.value)}
                  className="h-8 w-full bg-transparent px-1 text-[12.5px] outline-none"
                />
              </td>
              <td className="border border-black p-1">
                <input
                  name={`production[${index}][type]`}
                  value={row.type}
                  onChange={(e) => updateRow(index, "type", e.target.value)}
                  className="h-8 w-full bg-transparent px-1 text-[12.5px] outline-none"
                />
              </td>
              <td className="border border-black p-1">
                <input
                  name={`production[${index}][quantity]`}
                  type="number"
                  inputMode="decimal"
                  value={row.quantity}
                  onChange={(e) => updateRow(index, "quantity", e.target.value)}
                  className="h-8 w-full bg-transparent px-1 text-[12.5px] outline-none"
                />
              </td>
              <td className="border border-black p-1">
                <input
                  name={`production[${index}][unit]`}
                  value={row.unit}
                  onChange={(e) => updateRow(index, "unit", e.target.value)}
                  className="h-8 w-full bg-transparent px-1 text-[12.5px] outline-none"
                />
              </td>
              <td className="border border-black p-1">
                <input
                  name={`production[${index}][market_value]`}
                  type="number"
                  inputMode="decimal"
                  value={row.marketValue}
                  onChange={(e) =>
                    updateRow(index, "marketValue", e.target.value)
                  }
                  className="h-8 w-full bg-transparent px-1 text-[12.5px] outline-none"
                />
              </td>
            </tr>
          ))}
          <tr className="bg-zinc-50 font-bold">
            <td className="border border-black px-2 py-2" colSpan={2}>
              <span className="float-right pr-2">TOTAL</span>
            </td>
            <td className="border border-black px-2 py-2">
              {formatAmount(totals.quantity)}
              <input
                type="hidden"
                name="production_total_quantity"
                value={totals.quantity || ""}
              />
            </td>
            <td className="border border-black px-2 py-2 text-right">TOTAL</td>
            <td className="border border-black px-2 py-2">
              {formatAmount(totals.marketValue)}
              <input
                type="hidden"
                name="production_total_market_value"
                value={totals.marketValue || ""}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function CboInformationSheet() {
  const formRef = useRef<HTMLFormElement>(null);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState("");

  async function handleDownloadExcel() {
    if (!formRef.current) return;

    setExporting(true);
    setExportMessage("");

    try {
      const formData = new FormData(formRef.current);
      const result = await exportCboExcelAction(formData);
      downloadBase64Excel(result.base64, result.filename);
      setExportMessage("Excel file downloaded.");
    } catch (error) {
      console.error(error);
      setExportMessage("Could not generate Excel. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <form
      ref={formRef}
      className="overflow-hidden border border-black bg-white shadow-[0_8px_30px_rgba(24,24,27,0.08)]"
      onSubmit={(e) => {
        e.preventDefault();
        void handleDownloadExcel();
      }}
      noValidate
    >
      {/* Header */}
      <div className="grid grid-cols-[auto_1fr] gap-4 border-b border-black p-4 sm:gap-6 sm:p-5">
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className="flex size-14 items-center justify-center rounded-full border border-zinc-300 bg-zinc-50 text-center text-[9px] font-semibold leading-tight text-zinc-500 sm:size-16"
            aria-hidden
          >
            DSWD
            <br />
            Logo
          </div>
          <div
            className="flex size-14 items-center justify-center rounded-full border border-[#6b8f4e] bg-[#e8f2df] text-center text-[8px] font-semibold leading-tight text-[#3f5d2a] sm:size-16"
            aria-hidden
          >
            EPAHP
            <br />
            Seal
          </div>
          <div
            className="hidden size-14 items-center justify-center rounded-full border border-red-300 bg-red-50 text-center text-[8px] font-semibold leading-tight text-red-700 sm:flex sm:size-16"
            aria-hidden
          >
            Bagong
            <br />
            Pilipinas
          </div>
        </div>

        <div className="text-right">
          <p className="text-[11px] font-bold uppercase leading-tight tracking-wide text-black sm:text-[12px]">
            Enhanced Partnership Against Hunger and Poverty:
          </p>
          <h1 className="mt-1 text-[15px] font-bold uppercase leading-tight text-black sm:text-[18px]">
            Community-Based Organization Information Sheet
          </h1>
          <p className="mt-1 text-[12px] font-semibold text-black">(Version 3.0)</p>
          <p className="mt-3 text-[11px] leading-snug text-zinc-700">
            Note: Fields marked with an asterisk (<RequiredMark />) are required.
            If not applicable, put N/A.
          </p>
        </div>
      </div>

      {/* A. Data Privacy Consent */}
      <SectionHeader>A. Data Privacy Consent</SectionHeader>
      <div className="grid border-b border-black md:grid-cols-[1.6fr_1fr]">
        <div className="border-b border-black p-3 text-[11.5px] leading-relaxed text-black md:border-b-0 md:border-r md:p-4">
          <p>
            I hereby agree and give my free and voluntary consent to the
            Department of Social Welfare and Development (DSWD) to collect,
            process, and store my personal information, as required under the
            Data Privacy Act (DPA) of 2012, for the purpose of the Enhanced
            Partnership Against Hunger and Poverty (EPAHP) Digital Mapping
            System (DMS).
          </p>
          <p className="mt-2">
            I understand that my information will be used solely for official
            EPAHP program purposes, including validation, monitoring, and
            reporting. For more information, visit{" "}
            <a
              href="http://epahp.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              http://epahp.org
            </a>
            .
          </p>
        </div>

        <div className="grid grid-rows-2">
          <div className="flex min-h-24 flex-col border-b border-black p-3">
            <div className="flex flex-1 items-center justify-center rounded-sm border border-dashed border-zinc-400 bg-zinc-50/60">
              <span className="text-[11px] text-zinc-500">Thumbmark area</span>
            </div>
            <p className="mt-2 text-center text-[11px] text-black">
              (Thumbmark if unable to write)
            </p>
          </div>
          <div className="flex min-h-24 flex-col justify-end p-3">
            <input
              name="signature_name"
              type="text"
              className="h-8 w-full border-0 border-b border-black bg-transparent text-center text-[13px] outline-none"
              aria-label="Signature over printed name"
            />
            <p className="mt-2 text-center text-[11px] font-medium text-black">
              Signature over printed name
              <RequiredMark />
            </p>
          </div>
        </div>
      </div>

      {/* Collection metadata */}
      <div className="grid border-b border-black md:grid-cols-[1.35fr_1fr_0.9fr_0.75fr_0.75fr]">
        <div className="border-b border-black p-3 md:border-b-0 md:border-r">
          <FieldLabel title="Mode of Collection" />
          <div className="mt-2 flex flex-col gap-2">
            <CheckboxOption
              type="radio"
              name="mode_of_collection"
              value="actual"
              label="Actual (Field Visit, etc.)"
            />
            <CheckboxOption
              type="radio"
              name="mode_of_collection"
              value="virtual"
              label="Virtual (Phone Interview, Virtual Mtg, etc.)"
            />
          </div>
        </div>

        <div className="border-b border-black p-3 md:border-b-0 md:border-r">
          <FieldLabel
            title="Number of validation activities conducted"
            required
            hint="(Identify the number of times did the RPMO/RCT conducted validation activities)"
          />
          <TextInput name="validation_activities_count" placeholder="0" />
        </div>

        <div className="border-b border-black p-3 md:border-b-0 md:border-r">
          <FieldLabel title="Date of Accomplishment" required />
          <TextInput
            name="date_of_accomplishment"
            type="date"
            placeholder="mm/dd/yyyy"
          />
          <p className="mt-1 text-[10px] text-zinc-500">(mm/dd/yyyy)</p>
        </div>

        <div className="border-b border-black p-3 md:border-b-0 md:border-r">
          <FieldLabel title="Time started" />
          <TextInput name="time_started" type="time" />
          <p className="mt-1 text-[10px] text-zinc-500">(HH:mm AM/PM)</p>
        </div>

        <div className="p-3">
          <FieldLabel title="Time ended" />
          <TextInput name="time_ended" type="time" />
          <p className="mt-1 text-[10px] text-zinc-500">(HH:mm AM/PM)</p>
        </div>
      </div>

      {/* B. CBO Information */}
      <SectionHeader>B. Community-Based Organization Information</SectionHeader>
      <div className="border-b border-black bg-[#d9e8cb] px-3 py-2 text-center text-[12.5px] font-bold uppercase tracking-wide text-black">
        Step 1: Basic Information
      </div>

      {/* A.1 + A.2 */}
      <div className="grid border-b border-black md:grid-cols-[1.7fr_1fr]">
        <div className="border-b border-black p-3 md:border-b-0 md:border-r md:p-4">
          <FieldLabel
            code="A.1"
            title="Name of Organization"
            required
            hint="(Enter the official or registered name of the organization)"
          />
          <TextInput name="organization_name" />
        </div>
        <div className="p-3 md:p-4">
          <FieldLabel
            code="A.2"
            title="Short Name"
            required
            hint="(Acronym)"
          />
          <TextInput name="organization_short_name" />
        </div>
      </div>

      {/* A.3 */}
      <div className="border-b border-black p-3 md:p-4">
        <FieldLabel
          code="A.3"
          title="Office Address"
          required
          hint="(Complete office address of the organization - House & Lot No. Street, Barangay, City/Municipality, Province, Region, Postal Code)"
        />
        <textarea
          name="office_address"
          rows={3}
          className="mt-1 w-full resize-y border border-zinc-300 bg-white px-2 py-1.5 text-[13px] text-black outline-none focus:border-black"
        />
      </div>

      {/* A.4 + A.5 */}
      <div className="grid border-b border-black md:grid-cols-2">
        <div className="border-b border-black p-3 md:border-b-0 md:border-r md:p-4">
          <FieldLabel code="A.4" title="CBO Representation" required />
          <div className="mt-3 flex flex-wrap gap-6">
            <CheckboxOption
              type="radio"
              name="cbo_representation"
              value="main"
              label="Main"
            />
            <CheckboxOption
              type="radio"
              name="cbo_representation"
              value="branch"
              label="Branch"
            />
          </div>
        </div>
        <div className="p-3 md:p-4">
          <FieldLabel code="A.5" title="Congressional District" required />
          <TextInput name="congressional_district" />
        </div>
      </div>

      {/* Step 2 — page 1 */}
      <div className="border-b border-black bg-[var(--form-header)] px-3 py-2 text-center text-[12.5px] font-bold uppercase tracking-wide text-black">
        Step 2: Operations
      </div>

      {/* B.1 | B.2/B.4 | B.3 */}
      <div className="grid border-b border-black md:grid-cols-3">
        <div className="border-b border-black p-3 md:row-span-2 md:border-b-0 md:border-r md:p-4">
          <FieldLabel code="B.1" title="Organization Registration" required />
          <p className="mb-2 text-[11px] italic text-zinc-600">Choose one:</p>
          <div className="flex flex-col gap-2">
            <CheckboxOption
              type="radio"
              name="organization_registration"
              value="cooperative"
              label="Cooperative"
            />
            <CheckboxOption
              type="radio"
              name="organization_registration"
              value="stock_corporation"
              label="Stock Corporation"
            />
            <CheckboxOption
              type="radio"
              name="organization_registration"
              value="non_stock_corporation"
              label="Non-stock Corporation"
            />
            <CheckboxOption
              type="radio"
              name="organization_registration"
              value="unregistered"
              label="Unregistered"
            />
            <label className="inline-flex cursor-pointer items-center gap-2 text-[12.5px] text-black">
              <input
                type="radio"
                name="organization_registration"
                value="others"
                className="size-3.5 shrink-0 accent-black"
              />
              <span className="shrink-0">Others:</span>
              <input
                name="organization_registration_other"
                type="text"
                className="h-7 min-w-0 flex-1 border-0 border-b border-zinc-400 bg-transparent px-0 text-[13px] outline-none focus:border-black"
              />
            </label>
          </div>
        </div>

        <div className="border-b border-black p-3 md:border-r md:p-4">
          <FieldLabel
            code="B.2"
            title="Date Established"
            required
            hint="(Date when the organization was first established)"
          />
          <TextInput name="date_established" type="date" />
        </div>

        <div className="border-b border-black p-3 md:row-span-2 md:border-b-0 md:p-4">
          <FieldLabel
            code="B.3"
            title="Philippine Statistical Industry Classification"
            required
            hint="(Enter the official PSIC classification code of your organization if available)"
          />
          <TextInput name="psic_classification" />
        </div>

        <div className="border-b border-black p-3 md:col-start-2 md:border-b-0 md:border-r md:p-4">
          <FieldLabel
            code="B.4"
            title="Target Members"
            required
            hint="(Select primary demographic targeted by the organization as members)"
          />
          <TextInput name="target_members" />
        </div>
      </div>

      {/* B.5 + B.5.1 */}
      <div className="grid border-b border-black md:grid-cols-[2fr_1fr]">
        <div className="border-b border-black p-3 md:border-b-0 md:border-r md:p-4">
          <FieldLabel
            code="B.5"
            title="Name of CBO President/Lead"
            required
          />
          <TextInput name="cbo_president_name" />
        </div>
        <div className="p-3 md:p-4">
          <FieldLabel
            code="B.5.1"
            title="Is the organization female-led?"
            required
            hint="Check yes if the highest leadership position (ex. President, Chairperson) is held by a woman"
          />
          <div className="mt-3 flex flex-wrap gap-6">
            <CheckboxOption
              type="radio"
              name="female_led"
              value="yes"
              label="Yes"
            />
            <CheckboxOption
              type="radio"
              name="female_led"
              value="no"
              label="No"
            />
          </div>
        </div>
      </div>

      {/* B.6A + B.6A.1 / B.6A.2 */}
      <div className="grid border-b border-black md:grid-cols-[2fr_1fr]">
        <div className="border-b border-black p-3 md:border-b-0 md:border-r md:p-4">
          <FieldLabel
            code="B.6A"
            title="Total Number of Members involved in agricultural sector"
            required
          />
          <TextInput
            name="members_agricultural_total"
            type="number"
            placeholder="0"
          />
        </div>
        <div className="grid">
          <div className="border-b border-black p-3 md:p-4">
            <FieldLabel
              code="B.6A.1"
              title="Male members in the agricultural sector"
              required
            />
            <TextInput
              name="members_agricultural_male"
              type="number"
              placeholder="0"
            />
          </div>
          <div className="p-3 md:p-4">
            <FieldLabel
              code="B.6A.2"
              title="Female members in the agricultural sector"
              required
            />
            <TextInput
              name="members_agricultural_female"
              type="number"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* B.6B */}
      <div className="border-b border-black p-3 md:p-4">
        <FieldLabel
          code="B.6B"
          title="Total Number of Members involved in the other Sectors related to food e.g condiments, packed goods, grocery items"
          required
        />
        <TextInput
          name="members_other_food_sectors_total"
          type="number"
          placeholder="0"
        />
      </div>

      {/* B.6C Sectoral Data */}
      <div className="border-b border-black p-3 md:p-4">
        <FieldLabel
          code="B.6C"
          title="Sectoral Data"
          required
          hint="(Kindly put the number of individuals per category if they belong to the sector.)"
        />
        <div className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {SECTORAL_FIELDS.map((field) => (
            <label
              key={field.name}
              className="grid grid-cols-[minmax(0,1fr)_5.5rem] items-end gap-3 text-[12.5px] text-black"
            >
              <span className="pb-1 font-medium">{field.label}</span>
              <input
                name={field.name}
                type="number"
                min={0}
                placeholder="0"
                className="h-8 w-full border-0 border-b border-zinc-400 bg-transparent px-0 text-right text-[13px] outline-none focus:border-black"
              />
            </label>
          ))}
        </div>
      </div>

      {/* B.7 Annual Production */}
      <div className="border-b border-black p-3 md:p-4">
        <FieldLabel
          code="B.7"
          title="Annual Production"
          required
          hint="(Estimated quantity and market value of the organization's primary product/s and service/s. Use a separate paper if more than the provided space.)"
        />
        <div className="mt-3">
          <AnnualProductionTable />
        </div>
      </div>

      {/* B.8–B.12 */}
      <div className="grid border-b border-black md:grid-cols-[1.15fr_1.35fr_1fr]">
        <div className="border-b border-black p-3 md:border-b-0 md:border-r md:p-4">
          <FieldLabel
            code="B.8"
            title="Area/Scope of Production"
            required
            hint="(City/Municipality)"
          />
          <TextInput name="area_scope_production" />
        </div>

        <div className="border-b border-black p-3 md:border-b-0 md:border-r md:p-4">
          <FieldLabel
            code="B.9"
            title="Estimated Amount of Current Assets (in PhP)"
            required
            hint="(total amount of physical assets, operating assets, equipment, machineries etc. upon joining the EPAHP program)"
          />
          <TextInput name="current_assets_amount" type="number" />
        </div>

        <div className="row-span-1 border-b border-black p-3 md:row-span-2 md:border-b-0 md:p-4">
          <FieldLabel
            code="B.12"
            title="Annual Gross Income"
            required
            hint="(Annual gross sales of the organization)"
          />
          <TextInput name="annual_gross_income" type="number" />
        </div>

        <div className="border-b border-black p-3 md:col-start-1 md:border-b-0 md:border-r md:p-4">
          <FieldLabel
            code="B.10"
            title="Area/Scope of Sales"
            required
            hint="(City/Municipality)"
          />
          <TextInput name="area_scope_sales" />
        </div>

        <div className="border-b border-black p-3 md:col-start-2 md:border-b-0 md:border-r md:p-4">
          <FieldLabel
            code="B.11"
            title="Total Liabilities (in PhP)"
            required
          />
          <TextInput name="total_liabilities" type="number" />
        </div>
      </div>

      {/* B.13 Experience in Procurement */}
      <div className="border-b border-black p-3 md:p-4">
        <FieldLabel
          code="B.13"
          title="Experience in Procurement"
          required
          hint="(Range: last 2 years) Please check (✓) all that applies"
        />
        <div className="mt-3">
          <ProcurementExperienceTable />
        </div>
      </div>

      {/* B.14 + B.15 */}
      <div className="grid border-b border-black md:grid-cols-2">
        <div className="border-b border-black p-3 md:border-b-0 md:border-r md:p-4">
          <FieldLabel
            code="B.14"
            title="Sponsor Agency"
            required
            hint="(The main EPAHP partner agency/ies supporting the organization)"
          />
          <textarea
            name="sponsor_agency"
            rows={4}
            className="mt-1 w-full resize-y border border-zinc-300 bg-white px-2 py-1.5 text-[13px] text-black outline-none focus:border-black"
          />
        </div>
        <div className="p-3 md:p-4">
          <FieldLabel
            code="B.15"
            title="Other Sponsor Agency/ies"
            hint="(Other EPAHP partner agency/ies supporting the organization)"
          />
          <textarea
            name="other_sponsor_agencies"
            rows={4}
            className="mt-1 w-full resize-y border border-zinc-300 bg-white px-2 py-1.5 text-[13px] text-black outline-none focus:border-black"
          />
        </div>
      </div>

      {/* Step 3 */}
      <div className="border-b border-black bg-[var(--form-header)] px-3 py-2 text-center text-[12.5px] font-bold uppercase tracking-wide text-black">
        Step 3: Available Registrations/Documents (This will be uploaded to the
        EPAHP DMS)
      </div>
      <div className="border-b border-black p-3 md:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-4 sm:gap-y-3">
          {(
            [
              ["doc_board_resolution", "Board Resolution"],
              ["doc_registration_certificate", "Registration Certificate"],
              ["doc_business_permit", "Business Permit"],
              ["doc_bank_account_certificate", "Bank Account Certificate"],
              ["doc_bir_certificate", "BIR Certificate"],
            ] as const
          ).map(([name, label]) => (
            <CheckboxOption
              key={name}
              type="checkbox"
              name={name}
              value="yes"
              label={label}
            />
          ))}
        </div>
      </div>

      {/* Step 4 */}
      <div className="border-b border-black bg-[var(--form-header)] px-3 py-2 text-center text-[12.5px] font-bold uppercase tracking-wide text-black">
        Step 4: Contact Information
      </div>

      {/* D.1 + D.2 */}
      <div className="grid border-b border-black md:grid-cols-[1.7fr_1fr]">
        <div className="border-b border-black p-3 md:border-b-0 md:border-r md:p-4">
          <FieldLabel
            code="D.1"
            title="Complete Name of the CBO Contact Person (Primary)"
          />
          <TextInput name="primary_contact_name" />
        </div>
        <div className="p-3 md:p-4">
          <FieldLabel
            code="D.2"
            title="Designation"
            required
            hint="(Position of the contact person)"
          />
          <TextInput name="primary_contact_designation" />
        </div>
      </div>

      {/* D.3 + D.4 + D.5 */}
      <div className="grid border-b border-black md:grid-cols-3">
        <div className="border-b border-black p-3 md:border-b-0 md:border-r md:p-4">
          <FieldLabel
            code="D.3"
            title="Email Address"
            required
            hint="(Office email address of the contact person)"
          />
          <TextInput name="primary_contact_email" type="email" />
        </div>
        <div className="border-b border-black p-3 md:border-b-0 md:border-r md:p-4">
          <FieldLabel
            code="D.4"
            title="Telephone No."
            required
            hint="(Direct office number)"
          />
          <TextInput name="primary_contact_telephone" type="tel" />
        </div>
        <div className="p-3 md:p-4">
          <FieldLabel
            code="D.5"
            title="Mobile No."
            required
            hint="(Office mobile number of the contact person)"
          />
          <TextInput name="primary_contact_mobile" type="tel" />
        </div>
      </div>

      {/* D.6 + D.7 */}
      <div className="grid border-b border-black md:grid-cols-[1.7fr_1fr]">
        <div className="border-b border-black p-3 md:border-b-0 md:border-r md:p-4">
          <FieldLabel
            code="D.6"
            title="Complete Name of the CBO Contact Person (Secondary)"
          />
          <TextInput name="secondary_contact_name" />
        </div>
        <div className="p-3 md:p-4">
          <FieldLabel
            code="D.7"
            title="Designation"
            hint="(Position of the contact person)"
          />
          <TextInput name="secondary_contact_designation" />
        </div>
      </div>

      {/* D.8 + D.9 + D.10 */}
      <div className="grid border-b border-black md:grid-cols-3">
        <div className="border-b border-black p-3 md:border-b-0 md:border-r md:p-4">
          <FieldLabel
            code="D.8"
            title="Email Address"
            hint="(Office email address of the contact person)"
          />
          <TextInput name="secondary_contact_email" type="email" />
        </div>
        <div className="border-b border-black p-3 md:border-b-0 md:border-r md:p-4">
          <FieldLabel
            code="D.9"
            title="Telephone No."
            hint="(Direct office number)"
          />
          <TextInput name="secondary_contact_telephone" type="tel" />
        </div>
        <div className="p-3 md:p-4">
          <FieldLabel
            code="D.10"
            title="Mobile No"
            hint="(Office mobile number of the contact person)"
          />
          <TextInput name="secondary_contact_mobile" type="tel" />
        </div>
      </div>

      {/* Step 5 */}
      <div className="border-b border-black bg-[var(--form-header)] px-3 py-2 text-center text-[12.5px] font-bold uppercase tracking-wide text-black">
        Step 5: EPAHP Digital Mapping System Certification
      </div>
      <div className="grid md:grid-cols-[1.6fr_1fr]">
        <div className="border-b border-black p-3 text-[11.5px] leading-relaxed text-black md:border-b-0 md:border-r md:p-4">
          <p>
            I hereby affirm that the information provided is accurate to the
            best of my knowledge and belief. I certify that I am the original
            source of the provided information. In cases where I am not the
            original source, I have obtained explicit permission to share this
            information and am authorized to do so. Additionally, I understand
            that the content shared does not infringe upon any copyright or
            intellectual property rights, and I have the legal right to submit
            this information.
          </p>
        </div>

        <div className="grid grid-rows-2">
          <div className="flex min-h-28 flex-col justify-end border-b border-black p-3">
            <input
              name="cbo_representative_signature_name"
              type="text"
              className="h-8 w-full border-0 border-b border-black bg-transparent text-center text-[13px] outline-none"
              aria-label="Signature over printed name of the CBO Representative"
            />
            <p className="mt-2 text-center text-[11px] font-medium text-black">
              Signature over printed name of the CBO Representative
              <RequiredMark />
            </p>
          </div>
          <div className="flex min-h-28 flex-col p-3">
            <div className="flex flex-1 items-center justify-center rounded-sm border border-dashed border-zinc-400 bg-zinc-50/60">
              <span className="text-[11px] text-zinc-500">Thumbmark area</span>
            </div>
            <p className="mt-2 text-center text-[11px] text-black">
              (Thumbmark if unable to write)
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-black bg-zinc-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs text-zinc-500">
            Download Excel uses the same form layout (sections, grids, and your
            answers filled in).
          </p>
          {exportMessage ? (
            <p className="text-xs text-zinc-700" aria-live="polite">
              {exportMessage}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleDownloadExcel()}
            disabled={exporting}
            className="h-10 rounded-md border border-zinc-300 bg-white px-5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {exporting ? "Preparing Excel…" : "Download Excel"}
          </button>
          <button
            type="submit"
            disabled={exporting}
            className="h-10 rounded-md bg-zinc-900 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {exporting ? "Preparing Excel…" : "Submit & Download Excel"}
          </button>
        </div>
      </div>
    </form>
  );
}
