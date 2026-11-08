"use client";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { formatPlural } from "@/src/helpers/utils/i18n";
import { amountLabel, complaintObjectLabel } from "../../errorsManagementViewModel.mjs";
import DetailField from "./DetailField";

export default function ComplaintErrors({ errors = [] }) {
  return (
    <Stack spacing={1.25}>
      <Stack
        direction="row"
        sx={{ justifyContent: "space-between", alignItems: "center" }}
      >
        <Typography
          variant="subtitle1"
          fontWeight={700}
        >
          Состав жалобы
        </Typography>
        <Chip
          size="small"
          label={formatPlural(errors.length, ["ошибка", "ошибки", "ошибок"])}
        />
      </Stack>
      <Stack spacing={1}>
        {errors.map((item) => (
          <Accordion
            key={item.id}
            disableGutters
            elevation={0}
            sx={{
              border: 1,
              borderColor: "divider",
              borderLeft: 4,
              borderLeftColor: "error.main",
              borderRadius: "12px !important",
              overflow: "hidden",
              backgroundColor: "background.paper",
              "&:before": { display: "none" },
              "&:hover": { borderColor: "error.light" },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack
                spacing={0.75}
                sx={{ minWidth: 0, width: "100%" }}
              >
                <Chip
                  size="small"
                  variant="outlined"
                  label={complaintObjectLabel(item)}
                  sx={{ alignSelf: "flex-start" }}
                />
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                >
                  {item.error_name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {[item.position_name, item.error_type_name, item.stage_name]
                    .filter(Boolean)
                    .join(" · ")}
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                  gap: 1.25,
                }}
              >
                <DetailField
                  label="Категория"
                  value={item.category_name}
                />
                <DetailField
                  label="Этап"
                  value={item.stage_name}
                />
                <DetailField
                  label="Сумма ошибки"
                  value={item.error_amount != null ? amountLabel(item.error_amount) : null}
                />
                <DetailField
                  label="Сумма изменения"
                  value={item.changed_amount != null ? amountLabel(item.changed_amount) : null}
                />
                {item.solution_name ? (
                  <DetailField
                    fullWidth
                    label="Решение"
                    value={item.solution_name}
                    emphasized
                  />
                ) : null}
                {item.comment ? (
                  <DetailField
                    fullWidth
                    label="Комментарий к ошибке"
                    value={item.comment}
                  />
                ) : null}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    </Stack>
  );
}
