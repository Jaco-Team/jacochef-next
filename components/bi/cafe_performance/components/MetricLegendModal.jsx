"use client";

import { Box, Button, DialogActions, DialogContent, Stack, Typography } from "@mui/material";
import MyModal from "@/ui/MyModal";
import { CP_PADDING, CP_RADIUS, CP_SPACE } from "../layout";

const VALUE_TONE_STYLES = {
  primary: {
    backgroundColor: "primary.50",
    color: "primary.main",
  },
  success: {
    backgroundColor: "success.50",
    color: "success.main",
  },
  warning: {
    backgroundColor: "warning.50",
    color: "warning.dark",
  },
  error: {
    backgroundColor: "error.50",
    color: "error.main",
  },
  neutral: {
    backgroundColor: "grey.100",
    color: "text.secondary",
  },
};

function MetricLegendSection({ title, items }) {
  if (!items?.length) return null;

  return (
    <Box
      sx={{
        borderRadius: CP_RADIUS.card,
        backgroundColor: "background.paper",
        px: CP_PADDING.card,
        py: CP_PADDING.card,
      }}
    >
      <Stack spacing={CP_SPACE.component}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, color: "primary.main" }}
        >
          {title}
        </Typography>
        <Stack spacing={CP_SPACE.related}>
          {items.map((item) => (
            <Stack
              key={item}
              direction="row"
              spacing={CP_SPACE.related}
              alignItems="center"
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "primary.main",
                  flexShrink: 0,
                }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {item}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}

export default function MetricLegendModal({ open, onClose, metric }) {
  const valueToneStyles = VALUE_TONE_STYLES[metric?.valueTone] || VALUE_TONE_STYLES.primary;

  return (
    <MyModal
      open={open}
      onClose={onClose}
      title={metric?.title || "Описание метрики"}
      maxWidth="md"
    >
      <DialogContent
        sx={{
          px: { xs: 2, sm: 3 },
          pb: 3,
          backgroundColor: "grey.50",
        }}
      >
        {metric ? (
          <Stack spacing={CP_SPACE.group}>
            <Box
              sx={{
                borderRadius: CP_RADIUS.card,
                backgroundColor: "background.paper",
                px: CP_PADDING.panel,
                py: CP_PADDING.panel,
              }}
            >
              <Stack spacing={CP_SPACE.component}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={CP_SPACE.component}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "flex-start" }}
                >
                  <Stack spacing={CP_SPACE.related}>
                    <Typography
                      variant="overline"
                      sx={{
                        color: "primary.main",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                      }}
                    >
                      Как считается
                    </Typography>
                    <Typography variant="body1">{metric.description}</Typography>
                  </Stack>
                  <Box
                    sx={{
                      minWidth: { xs: "100%", sm: 208 },
                      borderRadius: 2,
                      backgroundColor: valueToneStyles.backgroundColor,
                      px: CP_SPACE.component,
                      py: CP_SPACE.compact,
                    }}
                  >
                    {metric.highlights?.length ? (
                      <Stack spacing={CP_SPACE.related}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Ключевые значения
                        </Typography>
                        {metric.highlights.map((item) => (
                          <Stack
                            key={item.label}
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            spacing={CP_SPACE.related}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              {item.label}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 700, color: item.toneColor || "text.primary" }}
                            >
                              {item.value}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    ) : (
                      <Stack spacing={CP_SPACE.micro}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Текущее значение
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{ fontWeight: 700, color: valueToneStyles.color }}
                        >
                          {metric.value}
                        </Typography>
                        {metric.caption ? (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {metric.caption}
                          </Typography>
                        ) : null}
                      </Stack>
                    )}
                  </Box>
                </Stack>

                {metric.summaryNote ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {metric.summaryNote}
                  </Typography>
                ) : null}

                {metric.comparisonSource ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {metric.comparisonSource}
                  </Typography>
                ) : null}
              </Stack>
            </Box>

            <MetricLegendSection
              title="Формула и логика"
              items={metric.formula}
            />

            <MetricLegendSection
              title="Что сильнее всего влияет"
              items={metric.drivers}
            />

            <MetricLegendSection
              title="Как читать метрику"
              items={metric.interpretation}
            />
          </Stack>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: 3, pt: 0 }}>
        <Button
          variant="contained"
          onClick={onClose}
        >
          Закрыть
        </Button>
      </DialogActions>
    </MyModal>
  );
}
