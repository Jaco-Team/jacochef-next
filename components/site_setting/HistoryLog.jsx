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
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { memo, useMemo } from "react";

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
            <Table>
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
                      {item.event_type === "upload" ? (
                        <DiffImgView
                          diffJson={item.diff_json}
                          type={item.meta_json?.type}
                          size={item.meta_json?.size}
                        />
                      ) : (
                        <DiffView diffJson={item.diff_json} />
                      )}
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
          )}
          {!history?.length && <Typography>Нет данных</Typography>}
        </AccordionDetails>
      </Accordion>
    </>
  );
}
export default memo(HistoryLog);

function DiffView({ diffJson }) {
  if (!diffJson) return null;

  const diff = useMemo(() => {
    try {
      return JSON.parse(diffJson);
    } catch (e) {
      console.error("Invalid diff JSON", e);
      return {};
    }
  }, [diffJson]);

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

function DiffImgView({ diffJson, type, size = "full" }) {
  const diff = useMemo(() => {
    try {
      return JSON.parse(diffJson);
    } catch (e) {
      console.error("Invalid diff JSON", e);
      return {};
    }
  }, [diffJson]);
  const basePath = "https://storage.yandexcloud.net/site-home-img/";

  const renderMedia = (name) => {
    if (!name) return null;

    if (type === "video") {
      return (
        <Box
          component="video"
          controls
          sx={{ width: "100%", height: 300, borderRadius: 2 }}
        >
          <source src={`${basePath}${name}`} />
        </Box>
      );
    }

    return (
      <Box
        component="img"
        src={`${basePath}${name}?date_update=${Date.now()}`}
        alt=""
        sx={{ width: "100%", height: "auto", borderRadius: 2 }}
      />
    );
  };

  return (
    <Stack spacing={1}>
      {Object.entries(diff)
        .slice(0, 1)
        .map(([field, v]) => {
          const from = typeof v?.from === "string" ? v.from : "";
          const to = typeof v?.to === "string" ? v.to : "";

          return (
            <Stack
              key={field}
              spacing={1}
            >
              <Typography
                variant="body2"
                fontWeight={600}
              >
                {field}
              </Typography>

              <Stack
                direction="row"
                spacing={2}
                alignItems="flex-start"
                flexWrap="wrap"
              >
                <Stack
                  spacing={0.5}
                  sx={{ minWidth: 240, flex: 1, opacity: 0.75 }}
                >
                  {renderMedia(to)}
                </Stack>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ pt: 2 }}
                >
                  →
                </Typography>

                <Stack
                  spacing={0.5}
                  sx={{ minWidth: 240, flex: 1 }}
                >
                  {renderMedia(from)}
                </Stack>
              </Stack>
            </Stack>
          );
        })}
    </Stack>
  );
}
