import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import { getHistoryEventTitle, getItemStatusLabel } from "./closeBuyUtils";

export default function HistoryEvent({ event }) {
  return (
    <Accordion
      disableGutters
      sx={{
        border: "1px solid #E5E5E5",
        borderRadius: "18px !important",
        overflow: "hidden",
        boxShadow: "none",
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack
          spacing={0.5}
          sx={{ minWidth: 0 }}
        >
          <Typography sx={{ fontWeight: 700, color: "#2B2B2B" }}>
            {getHistoryEventTitle(event)}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#6B6B6B" }}
          >
            {event.time || "Без времени"} • {event.user_name || "Неизвестный пользователь"}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#8A8A8A" }}
          >
            Точка ID: {event.point_id}
          </Typography>
        </Stack>
      </AccordionSummary>

      <AccordionDetails sx={{ pt: 0 }}>
        <Stack spacing={1.25}>
          {event.items.map((item) => (
            <Paper
              key={item.id}
              variant="outlined"
              sx={{ p: 1.25, borderRadius: "14px", borderColor: "#F0F0F0" }}
            >
              <Typography sx={{ fontWeight: 600 }}>
                {item.name || `Товар ${item.item_id}`}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#6B6B6B" }}
              >
                ID: {item.item_id}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#6B6B6B" }}
              >
                {getItemStatusLabel(item.old_is_active)} → {getItemStatusLabel(item.new_is_active)}
              </Typography>
            </Paper>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
