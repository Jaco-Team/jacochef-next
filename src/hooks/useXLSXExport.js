import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/**
 * @typedef {Object} Column
 * @property {string} key - Field name in the row object.
 * @property {string} label - Column header text.
 * @property {(row: Object) => any} [format] - Optional formatter for cell value.
 * @property {(row: Object) => any} [formatRaw] - Optional raw formatter for cell value no JSX.
 */

/**
 * Hook that returns an export function for creating Excel (.xlsx) files.
 *
 * @returns {(rows: Array<Object>, columns: Array<Column>, filename?: string, title?: string) => void}
 *   Export function: call with your data, column defs, and filename.
 *
 * @example
 * const exportXLS = useXLSExport();
 * exportXLS(data, columns, "report.xlsx", "Заголовок файла");
 */
export default function useXLSExport() {
  /**
   * Makes and downloads Excel file.
   *
   * @param {Array<Object>} rows - Data rows to export.
   * @param {Array<Column>} columns - Column definitions.
   * @param {string} filename - Name of the exported file.
   * @param {string} title - Title of the exported file.
   */
  const exportXLS = (rows, columns, filename = "export.xlsx", title = "") => {
    if (!rows?.length || !columns?.length) return;

    // Header
    const header = columns.map((c) => c.label);

    // Body with formatters
    const data = rows.map((row) =>
      columns.map((c) => {
        const v = row[c.key];
        if (typeof c.formatRaw === "function") {
          return String(c.formatRaw(v)) ?? "-";
        }
        if (typeof c.format === "function") {
          return String(c.format(v)) ?? "-";
        }

        if (typeof v === "number") return v;
        return String(v) ?? "-";
      }),
    );

    const allRows = title ? [[title], header, ...data] : [header, ...data];

    const worksheet = XLSX.utils.aoa_to_sheet(allRows);
    const workbook = XLSX.utils.book_new();
    // merge + style A1 if title is set
    if (title) {
      worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: header.length - 1 } }];

      worksheet["A1"].s = {
        font: { bold: true },
        alignment: { horizontal: "center" },
      };
    }
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), filename);
  };

  return exportXLS;
}
