import * as XLSX from "xlsx";
import { GROUPS, OPERATIONS } from "../config";

export function parseArticlesFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

        // Extract only column B (1)
        const colB = rows.map((r) => r[1]).filter(Boolean);

        const items = [];
        let currentGroup = null;

        colB.forEach((text) => {
          const trimmed = String(text).trim();

          // Group header?
          const g = GROUPS.find((g) => g.name === trimmed);
          if (g) {
            currentGroup = g.id;
            return;
          }

          if (!currentGroup) return; // ignore garbage before group

          const operation_id = OPERATIONS.filter((o) => o.group_id === currentGroup)?.[0]?.id;

          items.push({
            name: trimmed,
            group_id: currentGroup,
            operation_id,
          });
        });

        resolve(items);
      } catch (err) {
        reject(err);
      }
    };

    reader.readAsBinaryString(file);
  });
}
