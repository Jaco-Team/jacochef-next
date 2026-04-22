"use client";

import {
  Box,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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

function StageMetricRow({ stage, formatters }) {
  const slaTone = getSlaTone(stage?.sla);
  const stabilityTone = getStabilityTone(stage?.stability);

  return (
    <TableRow hover>
      <TableCell align="left">
        <Typography
          variant="body2"
          sx={{ fontWeight: 600 }}
        >
          {stage?.stage_name || "—"}
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Typography
          variant="body2"
          sx={{ fontWeight: 700 }}
        >
          {formatters.duration(stage?.p50)}
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Typography
          variant="body2"
          color="text.secondary"
        >
          {formatters.duration(stage?.p90)}
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <SlaChip
            value={stage?.sla}
            formatter={formatters.percent}
          />
        </Box>
      </TableCell>
      <TableCell align="center">
        <Typography
          variant="body2"
          sx={{ color: TONE_COLOR[stabilityTone], fontWeight: 700 }}
        >
          {formatters.percent(stage?.stability)}
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Typography
          variant="body2"
          sx={{ color: TONE_COLOR[slaTone], fontWeight: 700 }}
        >
          {formatters.percent(stage?.share_long_stage_percent)}
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Typography
          variant="body2"
          color="text.secondary"
        >
          {formatters.integer(stage?.sample_size)}
        </Typography>
      </TableCell>
    </TableRow>
  );
}

export default function EmployeeDetailsModal({ open, onClose, loading, data, formatters }) {
  const employeeName = data?.employee?.employee_name || data?.summary?.employee_name || "Сотрудник";
  const stages = data?.stages || [];
  const imageUrl = data?.employee?.user_image || "";

  return (
    <MyModal
      open={open}
      onClose={onClose}
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
        ) : employeeName ? (
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
                    size={56}
                    src={imageUrl}
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
                      Детализация по этапам за выбранный период
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Box>

            <Stack spacing={CP_SPACE.related}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700 }}
              >
                Все этапы
              </Typography>
              <Box
                sx={{
                  borderRadius: CP_RADIUS.card,
                  backgroundColor: "background.paper",
                  overflow: "hidden",
                }}
              >
                {stages.length ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell align="center">Этап</TableCell>
                          <TableCell align="center">P50</TableCell>
                          <TableCell align="center">P90</TableCell>
                          <TableCell align="center">SLA</TableCell>
                          <TableCell align="center">Стабильность</TableCell>
                          <TableCell align="center">Длинные</TableCell>
                          <TableCell align="center">Заказов</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stages.map((stage) => (
                          <StageMetricRow
                            key={`${stage.stage_type}-${stage.employee_id}`}
                            stage={stage}
                            formatters={formatters}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box
                    sx={{
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
              </Box>
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
