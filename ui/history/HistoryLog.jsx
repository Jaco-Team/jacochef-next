"use client";

import { ExpandMore, Restore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { memo } from "react";
import SmartDiff from "./SmartDiff";

function HistoryLog({ history, title = "История изменений", restoreFunc = null }) {
  return (
    <>
      <Accordion
        component={Paper}
        variant="outlined"
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>{title}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {!!history?.length && (
            <TableContainer sx={{ maxHeight: "50dvh" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Дата изменения</TableCell>
                    <TableCell>Автор</TableCell>
                    <TableCell>Изменения</TableCell>
                    {!!restoreFunc && <TableCell>Откатить</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history?.map((item, index) => (
                    <TableRow key={item.id || index}>
                      <TableCell>{dayjs(item.created_at)?.format("DD.MM.YYYY HH:mm")}</TableCell>
                      <TableCell>{item.actor_name}</TableCell>
                      <TableCell>
                        <SmartDiff item={item} />
                      </TableCell>
                      {!!restoreFunc && (
                        <TableCell>
                          <IconButton onClick={() => restoreFunc(item)}>
                            <Restore />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {!history?.length && <Typography>Нет данных</Typography>}
        </AccordionDetails>
      </Accordion>
    </>
  );
}
export default memo(HistoryLog);
