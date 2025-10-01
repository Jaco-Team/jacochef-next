"use client";

import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

function HistDropDownTable({ histData, openHistModal }) {
  return (
    <Accordion style={{ width: "100%" }}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography style={{ fontWeight: "bold" }}>История изменений</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Дата / время</TableCell>
              <TableCell>Сотрудник</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {histData?.map((it, k) => (
              <TableRow
                hover
                key={k}
                style={{ cursor: "pointer" }}
                onClick={() => openHistModal(k)}
              >
                <TableCell>{k + 1}</TableCell>
                <TableCell>{it.date_time_update}</TableCell>
                <TableCell>{it.user_name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AccordionDetails>
    </Accordion>
  );
}
export default HistDropDownTable;
