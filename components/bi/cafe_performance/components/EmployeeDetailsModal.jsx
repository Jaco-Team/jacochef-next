"use client";

import {
  Box,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
} from "@mui/material";
import MyModal from "@/ui/MyModal";
import EmployeeAvatar from "./EmployeeAvatar";
import SlaChip from "./SlaChip";
import { getSlaTone } from "./SlaProgressBar";
import { CP_PADDING, CP_RADIUS, CP_SPACE } from "../layout";

const TONE_COLOR = {
  success: "success.dark",
  warning: "warning.dark",
  danger: "error.dark",
  neutral: "text.secondary",
};

const getStabilityTone = (value) => {
  if (value == null) return "neutral";
  const numeric = Number(value);
  if (numeric >= 80) return "success";
  if (numeric >= 60) return "warning";
  return "danger";
};

function DetailMetric({ label, value, accent = "text.primary" }) {
  return (
    <Stack spacing={CP_SPACE.micro}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textTransform: "uppercase", letterSpacing: 0.4, fontWeight: 600 }}
      >
        {label}
      </Typography>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 700, color: accent }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

function StageMetricRow({ stage, formatters }) {
  const slaTone = getSlaTone(stage?.sla);
  const stabilityTone = getStabilityTone(stage?.stability);

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
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={CP_SPACE.component}
        >
          <Stack spacing={CP_SPACE.micro}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700 }}
            >
              {stage?.stage_name || "—"}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {stage?.stage_type || "—"}
            </Typography>
          </Stack>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {formatters.integer(stage?.sample_size)} заказов
          </Typography>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              sm: "repeat(5, minmax(0, 1fr))",
            },
            gap: CP_SPACE.component,
          }}
        >
          <DetailMetric
            label="P50"
            value={formatters.duration(stage?.p50)}
          />
          <DetailMetric
            label="P90"
            value={formatters.duration(stage?.p90)}
          />
          <Stack spacing={CP_SPACE.micro}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: "uppercase", letterSpacing: 0.4, fontWeight: 600 }}
            >
              SLA
            </Typography>
            <Box>
              <SlaChip
                value={stage?.sla}
                formatter={formatters.percent}
              />
            </Box>
          </Stack>
          <DetailMetric
            label="Стабильность"
            value={formatters.percent(stage?.stability)}
            accent={TONE_COLOR[stabilityTone]}
          />
          <DetailMetric
            label="Длинные"
            value={formatters.percent(stage?.share_long_stage_percent)}
            accent={TONE_COLOR[slaTone]}
          />
        </Box>
      </Stack>
    </Box>
  );
}

export default function EmployeeDetailsModal({ open, onClose, loading, data, formatters }) {
  const employeeName = data?.employee?.employee_name || data?.summary?.employee_name || "Сотрудник";
  const summary = data?.summary || null;
  const stages = data?.stages || [];
  const stabilityTone = getStabilityTone(summary?.stability);

  return (
    <MyModal
      open={open}
      onClose={onClose}
      title={employeeName}
      maxWidth="md"
    >
      <DialogContent
        sx={{
          px: { xs: 2, sm: 3 },
          pb: 3,
          backgroundColor: "grey.50",
        }}
      >
        {loading ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ minHeight: 240 }}
          >
            <CircularProgress size={28} />
          </Stack>
        ) : summary ? (
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
                  direction="row"
                  spacing={CP_SPACE.component}
                  alignItems="center"
                >
                  <EmployeeAvatar
                    name={employeeName}
                    size={48}
                  />
                  <Stack spacing={CP_SPACE.micro}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700 }}
                    >
                      {employeeName}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Этап: {summary?.stage_name || summary?.stage_type || "—"}
                    </Typography>
                  </Stack>
                </Stack>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "repeat(2, minmax(0, 1fr))",
                      sm: "repeat(5, minmax(0, 1fr))",
                    },
                    gap: CP_SPACE.component,
                  }}
                >
                  <DetailMetric
                    label="P50"
                    value={formatters.duration(summary?.p50)}
                  />
                  <DetailMetric
                    label="P90"
                    value={formatters.duration(summary?.p90)}
                  />
                  <Stack spacing={CP_SPACE.micro}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ textTransform: "uppercase", letterSpacing: 0.4, fontWeight: 600 }}
                    >
                      SLA
                    </Typography>
                    <Box>
                      <SlaChip
                        value={summary?.sla}
                        formatter={formatters.percent}
                      />
                    </Box>
                  </Stack>
                  <DetailMetric
                    label="Стабильность"
                    value={formatters.percent(summary?.stability)}
                    accent={TONE_COLOR[stabilityTone]}
                  />
                  <DetailMetric
                    label="Заказов"
                    value={formatters.integer(summary?.sample_size)}
                  />
                </Box>
              </Stack>
            </Box>

            <Stack spacing={CP_SPACE.related}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: "primary.main" }}
              >
                Все этапы сотрудника
              </Typography>
              <Stack spacing={CP_SPACE.component}>
                {stages.length ? (
                  stages.map((stage) => (
                    <StageMetricRow
                      key={`${stage.stage_type}-${stage.employee_id}`}
                      stage={stage}
                      formatters={formatters}
                    />
                  ))
                ) : (
                  <Box
                    sx={{
                      borderRadius: CP_RADIUS.card,
                      backgroundColor: "background.paper",
                      px: CP_PADDING.card,
                      py: CP_PADDING.card,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Нет данных по этапам.
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Stack>
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
