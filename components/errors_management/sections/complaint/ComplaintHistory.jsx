"use client";

import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Stack,
  Typography,
} from "@mui/material";
import { formatPlural } from "@/src/helpers/utils/i18n";
import {
  historyChanges,
  historySummaryLines,
  historyTimestamp,
} from "../../errorsManagementViewModel.mjs";

export default function ComplaintHistory({ history = [] }) {
  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: "12px !important",
        overflow: "hidden",
        backgroundColor: "background.paper",
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack
          direction="row"
          spacing={1.25}
          sx={{ alignItems: "center" }}
        >
          <CalendarTodayOutlinedIcon
            color="action"
            fontSize="small"
          />
          <Box>
            <Typography
              variant="subtitle2"
              fontWeight={700}
            >
              История изменений
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              {formatPlural(history.length, ["запись", "записи", "записей"])}
            </Typography>
          </Box>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0 }}>
        <Stack spacing={0}>
          {history.map((item, index) => {
            const changeLines = historySummaryLines(historyChanges(item));
            const last = index === history.length - 1;
            return (
              <Box
                key={item.id}
                sx={{
                  position: "relative",
                  pl: 2.5,
                  pb: last ? 0 : 2,
                  "&:before": {
                    content: '""',
                    position: "absolute",
                    left: "5px",
                    top: "10px",
                    bottom: last ? 0 : "-2px",
                    width: "1px",
                    backgroundColor: "divider",
                  },
                  "&:after": {
                    content: '""',
                    position: "absolute",
                    left: "1px",
                    top: "6px",
                    width: "9px",
                    height: "9px",
                    borderRadius: "50%",
                    backgroundColor: "primary.main",
                  },
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={700}
                >
                  {item.entity_label || item.event_type}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {item.actor_name || "Система"} · {historyTimestamp(item.created_at)}
                </Typography>
                {changeLines.length ? (
                  <Stack
                    spacing={0.25}
                    sx={{ mt: 0.5 }}
                  >
                    {changeLines.map((change) => (
                      <Typography
                        key={change.label}
                        variant="body2"
                        color="text.secondary"
                      >
                        {change.label}: {change.value}
                      </Typography>
                    ))}
                  </Stack>
                ) : null}
              </Box>
            );
          })}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
