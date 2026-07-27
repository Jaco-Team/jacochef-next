import React from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";

import {
  END_ANALYTICS_COLUMNS,
  END_ANALYTICS_COLUMN_GROUPS,
} from "@/components/end_analytics/endAnalyticsColumns";

export default function EndAnalyticsColumnsDialog({
  open,
  visibleColumns,
  onClose,
  onToggle,
  onSetAll,
  onReset,
}) {
  const allVisible = END_ANALYTICS_COLUMNS.every((column) => visibleColumns[column.key] !== false);
  const hasVisible = END_ANALYTICS_COLUMNS.some((column) => visibleColumns[column.key] !== false);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Колонки таблицы</DialogTitle>
      <DialogContent>
        <FormControlLabel
          control={
            <Checkbox
              checked={allVisible}
              indeterminate={hasVisible && !allVisible}
              onChange={(event) => onSetAll(event.target.checked)}
            />
          }
          label="Все колонки"
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
            gap: 2,
            mt: 1,
          }}
        >
          {END_ANALYTICS_COLUMN_GROUPS.map((group) => (
            <Box
              key={group.key}
              sx={{
                border: "1px solid #eeeeee",
                borderRadius: 1.5,
                p: 1.5,
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ mb: 0.5 }}
              >
                {group.label}
              </Typography>
              {END_ANALYTICS_COLUMNS.filter((column) => column.group === group.key).map(
                (column) => (
                  <FormControlLabel
                    key={column.key}
                    sx={{ display: "flex", m: 0 }}
                    control={
                      <Checkbox
                        checked={visibleColumns[column.key] !== false}
                        onChange={() => onToggle(column.key)}
                      />
                    }
                    label={column.settingLabel}
                  />
                ),
              )}
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onSetAll(false)}>Снять все</Button>
        <Button onClick={onReset}>Сбросить</Button>
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
