import {
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { JacoModal, uiColors, uiTableColors, uiTypography } from "@/design-system/shared/ui";

/** Окно истории правок: columns — [{ key, label, render(row) }]. */
export default function HistoryModal({ open, onClose, title, columns, rows, loading }) {
  return (
    <JacoModal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="lg"
      containedDesktopScroll
    >
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : rows.length === 0 ? (
        <Typography
          sx={{ ...uiTypography.body, color: uiColors.textMuted, py: 3, textAlign: "center" }}
        >
          Правок пока нет
        </Typography>
      ) : (
        <TableContainer>
          <Table
            size="small"
            stickyHeader
          >
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    sx={{ ...uiTypography.label, fontWeight: 500, color: uiColors.textStrong }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{ "&:hover": { backgroundColor: uiTableColors.rowHover } }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      sx={{ ...uiTypography.label, color: uiColors.text }}
                    >
                      {column.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </JacoModal>
  );
}
