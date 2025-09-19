import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/**
 * @typedef {Object} Column
 * @property {string} key - Field name in the row object.
 * @property {string} label - Column header text.
 * @property {(row: Object) => any} [format] - Optional formatter for cell value.
 */

/**
 * Hook that returns an export function for creating Excel (.xlsx) files.
 *
 * @returns {(rows: Array<Object>, columns: Array<Column>, filename?: string) => void}
 *   Export function: call with your data, column defs, and filename.
 *
 * @example
 * const exportXLS = useXLSExport();
 * exportXLS(data, columns, "report.xlsx");
 */
export default function useXLSExport() {
  /**
   * Makes and downloads Excel file.
   *
   * @param {Array<Object>} rows - Data rows to export.
   * @param {Array<Column>} columns - Column definitions.
   * @param {string} [filename="export.xlsx"] - Name of the exported file.
   */
  const exportXLS = (rows, columns, filename = "export.xlsx") => {
    if (!rows || !rows.length) return;

    // Header
    const header = columns.map((c) => c.label);

    // Body with formatters
    const data = rows.map((row) =>
      columns.map((c) => {
        if (typeof c.format === "function") {
          return c.format(row);
        }
        return String(row[c.key]) ?? "-";
      })
    );

    const worksheet = XLSX.utils.aoa_to_sheet([header, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), filename);
  };

  return exportXLS;
}
