import React from "react";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

import { REPORT_REVENUE_COLUMN_OPTIONS } from "@/components/report_revenue/reportRevenueColumns";

export default function ReportRevenueColumnsDialog({
  open,
  onClose,
  isColumnVisible,
  setAllColumns,
  toggleColumn,
}) {
  const allColumnsVisible = REPORT_REVENUE_COLUMN_OPTIONS.every((item) =>
    isColumnVisible(item.key),
  );
  const hasVisibleColumns = REPORT_REVENUE_COLUMN_OPTIONS.some((item) => isColumnVisible(item.key));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Колонки таблицы</DialogTitle>
      <DialogContent>
        <FormControlLabel
          control={
            <Checkbox
              checked={allColumnsVisible}
              indeterminate={hasVisibleColumns && !allColumnsVisible}
              onChange={(event) => setAllColumns(event.target.checked)}
            />
          }
          label="Все колонки"
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "4px 16px",
            marginTop: 8,
          }}
        >
          {REPORT_REVENUE_COLUMN_OPTIONS.map((item) => (
            <FormControlLabel
              key={item.key}
              control={
                <Checkbox
                  checked={isColumnVisible(item.key)}
                  onChange={() => toggleColumn(item.key)}
                />
              }
              label={item.label}
            />
          ))}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setAllColumns(true)}>Сбросить</Button>
        <Button
          variant="contained"
          onClick={onClose}
        >
          Готово
        </Button>
      </DialogActions>
    </Dialog>
  );
}
