"use client";

import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import { Box, Stack, Typography } from "@mui/material";
import { JacoSurface } from "@/design-system/shared/ui";
import { historyTimestamp, workflowSourceLabel } from "../../errorsManagementViewModel.mjs";
import DetailField from "./DetailField";

export default function ComplaintSummary({ detail, cafeContext }) {
  return (
    <JacoSurface
      variant="outlined"
      sx={{ p: { xs: 1.5, sm: 2 } }}
    >
      <Stack spacing={1.5}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
            gap: 1.5,
          }}
        >
          <DetailField
            label="Кафе"
            value={cafeContext}
            emphasized
          />
          <DetailField
            label="Зарегистрировал"
            value={workflowSourceLabel(detail.source)}
          />
          <DetailField
            label="Зарегистрирована"
            value={historyTimestamp(detail.created_at)}
          />
          {detail.resolved_by_name ? (
            <DetailField
              label="Решил"
              value={detail.resolved_by_name}
            />
          ) : null}
        </Box>
        {detail.common_comment ? (
          <Box sx={{ borderLeft: 3, borderColor: "primary.main", pl: 1.25, py: 0.25 }}>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Общий комментарий
            </Typography>
            <Typography variant="body2">{detail.common_comment}</Typography>
          </Box>
        ) : null}
        {detail.resolution_promo_code ? (
          <Box
            sx={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 1.5,
            }}
          >
            <LocalOfferOutlinedIcon
              color="success"
              fontSize="small"
              sx={{ position: "absolute", top: 2, left: 0 }}
            />
            <Box sx={{ pl: 3.5 }}>
              <DetailField
                label="Промокод решения"
                value={detail.resolution_promo_code}
                emphasized
              />
            </Box>
            <DetailField
              label="Активаций"
              value={String(detail.resolution_promo_activations || 0)}
            />
          </Box>
        ) : null}
      </Stack>
    </JacoSurface>
  );
}
