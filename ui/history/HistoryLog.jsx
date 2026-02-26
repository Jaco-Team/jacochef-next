"use client";

import { ExpandMore, Restore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { memo, useMemo } from "react";

function HistoryLog({ history, title = "История изменений", restoreFunc = null, customDiffView }) {
  const Diff = customDiffView ?? DiffView;
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
                        <Diff item={item} />
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

function DiffView({ item }) {
  if (!item?.diff_json) return null;

  const diff = useMemo(() => {
    try {
      return JSON.parse(item.diff_json);
    } catch (e) {
      console.error("Invalid diff JSON", e);
      return {};
    }
  }, [item.diff_json]);

  return (
    <Stack spacing={1}>
      {Object.entries(diff).map(([field, value]) => {
        const from = value?.from ?? "";
        const to = value?.to ?? "";

        return (
          <Stack
            key={field}
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
          >
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ minWidth: 70 }}
            >
              {field}:
            </Typography>

            <Typography
              variant="body2"
              sx={{
                textDecoration: "line-through",
                color: "text.secondary",
                wordBreak: "break-all",
              }}
            >
              {from}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              →
            </Typography>

            <Typography
              variant="body2"
              fontWeight={500}
              sx={{ wordBreak: "break-all" }}
            >
              {to}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}
