"use client";

import CloseIcon from "@mui/icons-material/Close";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import { Alert, Box, Chip, Drawer, Stack, Typography } from "@mui/material";
import { JacoButton, JacoIconButton, JacoSurface } from "@/design-system/shared/ui";
import {
  complaintStatusColor,
  complaintStatusLabel,
  historyTimestamp,
  workflowSourceLabel,
} from "../errorsManagementViewModel.mjs";
import ComplaintErrors from "./complaint/ComplaintErrors";
import ComplaintHistory from "./complaint/ComplaintHistory";
import ComplaintOrderAccordion from "./complaint/ComplaintOrderAccordion";
import ComplaintResolutionModal, { COMMAND_LABELS } from "./complaint/ComplaintResolutionModal";
import ComplaintSummary from "./complaint/ComplaintSummary";
import useComplaintDetail from "./complaint/useComplaintDetail";

export default function ComplaintDrawer({
  complaint,
  onClose,
  onChanged,
  onOpenOrder,
  api,
  cities,
  points,
  withLoading,
}) {
  const complaintDetail = useComplaintDetail({
    complaint,
    api,
    cities,
    points,
    onChanged,
    withLoading,
  });
  const {
    detail,
    error,
    pendingCommand,
    setPendingCommand,
    transitioning,
    resolutions,
    setResolutions,
    promoCode,
    setPromoCode,
    solutions,
    canResolve,
    cafeContext,
    executeTransition,
  } = complaintDetail;

  return (
    <Drawer
      anchor="right"
      open={Boolean(complaint)}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100dvw", sm: "clamp(600px, 40dvw, 760px)" },
            maxWidth: "100dvw",
            boxSizing: "border-box",
            overflow: "hidden",
            p: 0,
          },
        },
      }}
    >
      <Box
        sx={{
          height: "100%",
          display: "flex",
          minWidth: 0,
          flexDirection: "column",
          backgroundColor: "background.default",
        }}
      >
        <Box
          sx={{
            flex: "0 0 auto",
            px: { xs: 2, sm: 2.5, md: 3 },
            pt: { xs: 2, sm: 2.5 },
            pb: 2,
            borderBottom: 1,
            borderColor: "divider",
            backgroundColor: "background.paper",
          }}
        >
          <Stack spacing={1.5}>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ lineHeight: 1.2 }}
                >
                  Жалоба №{complaint?.id}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Заказ №{complaint?.order_id} · {historyTimestamp(complaint?.created_at)}
                </Typography>
              </Box>
              <JacoIconButton
                aria-label="Закрыть жалобу"
                onClick={onClose}
              >
                <CloseIcon fontSize="small" />
              </JacoIconButton>
            </Stack>
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{ flexWrap: "wrap" }}
            >
              <Chip
                size="small"
                color={complaintStatusColor(detail?.status || complaint?.status)}
                label={complaintStatusLabel(detail || complaint)}
              />
              <Chip
                size="small"
                variant="outlined"
                icon={<StorefrontOutlinedIcon />}
                label={workflowSourceLabel(detail?.source || complaint?.source)}
              />
            </Stack>
          </Stack>
        </Box>
        <Box
          sx={{
            flex: "1 1 auto",
            overflowY: "auto",
            overflowX: "hidden",
            p: { xs: 2, sm: 2.5, md: 3 },
            pb: "calc(env(safe-area-inset-bottom, 0px) + 24px)",
          }}
        >
          <Stack spacing={2.5}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            {detail ? (
              <>
                <ComplaintSummary
                  detail={detail}
                  cafeContext={cafeContext}
                />
                {(detail.available_commands || []).length ? (
                  <JacoSurface
                    variant="outlined"
                    sx={{ p: 1.5 }}
                  >
                    <Stack spacing={1.25}>
                      <Typography
                        variant="subtitle2"
                        fontWeight={700}
                      >
                        Следующее действие
                      </Typography>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                      >
                        {detail.available_commands.map((command) => (
                          <JacoButton
                            key={command}
                            onClick={() => setPendingCommand(command)}
                          >
                            {COMMAND_LABELS[command] || command}
                          </JacoButton>
                        ))}
                      </Stack>
                    </Stack>
                  </JacoSurface>
                ) : null}
                <ComplaintOrderAccordion
                  detail={detail}
                  onOpenOrder={onOpenOrder}
                />
                <ComplaintErrors errors={detail.errors} />
                <ComplaintHistory history={detail.history} />
              </>
            ) : null}
          </Stack>
        </Box>
      </Box>
      <ComplaintResolutionModal
        command={pendingCommand}
        detail={detail}
        cafeContext={cafeContext}
        solutions={solutions}
        resolutions={resolutions}
        promoCode={promoCode}
        transitioning={transitioning}
        canResolve={canResolve}
        onClose={() => setPendingCommand(null)}
        onConfirm={executeTransition}
        onResolutionsChange={setResolutions}
        onPromoCodeChange={setPromoCode}
      />
    </Drawer>
  );
}
