"use client";

import CloseIcon from "@mui/icons-material/Close";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import { Box, Drawer, Stack, Typography } from "@mui/material";
import {
  JacoAlert,
  JacoButton,
  JacoIconButton,
  JacoStatusChip,
  JacoSurface,
} from "@/design-system/shared/ui";
import { complaintStatusAppearance } from "../complaintStatusModel.mjs";
import { canRemoveError } from "../errorsManagementPermissions.mjs";
import {
  complaintStatusLabel,
  historyTimestamp,
  workflowSourceLabel,
} from "../errorsManagementViewModel.mjs";
import ComplaintErrors from "./complaint/ComplaintErrors";
import ComplaintHistory from "./complaint/ComplaintHistory";
import ComplaintOrderAccordion from "./complaint/ComplaintOrderAccordion";
import ComplaintResolutionModal, { COMMAND_LABELS } from "./complaint/ComplaintResolutionModal";
import ComplaintSummary from "./complaint/ComplaintSummary";
import RemoveErrorModal from "./complaint/RemoveErrorModal";
import useComplaintDetail from "./complaint/useComplaintDetail";

function CommandActions({ commands, onSelect }) {
  if (!commands.length) return null;
  const workflow = commands.filter((command) => command !== "cancel");
  const canCancel = commands.includes("cancel");
  return (
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
          useFlexGap
          sx={{ flexWrap: "wrap" }}
        >
          {workflow.map((command) => (
            <JacoButton
              key={command}
              onClick={() => onSelect(command)}
            >
              {COMMAND_LABELS[command] || command}
            </JacoButton>
          ))}
          {canCancel ? (
            <JacoButton
              tone="outlinePrimary"
              onClick={() => onSelect("cancel")}
              sx={{ ml: { sm: "auto" } }}
            >
              {COMMAND_LABELS.cancel}
            </JacoButton>
          ) : null}
        </Stack>
      </Stack>
    </JacoSurface>
  );
}

export default function ComplaintDrawer({
  complaint,
  onClose,
  onChanged,
  onOpenOrder,
  api,
  cities,
  points,
  permissions,
  withLoading,
}) {
  const complaintDetail = useComplaintDetail({
    complaint,
    api,
    cities,
    points,
    permissions,
    onChanged,
    withLoading,
  });
  const {
    detail,
    error,
    reload,
    commands,
    pendingCommand,
    setPendingCommand,
    commandError,
    transitioning,
    activeErrors,
    resolutions,
    setResolutions,
    promoCode,
    setPromoCode,
    solutions,
    canResolve,
    cafeContext,
    executeTransition,
    removal,
    openRemoval,
    changeRemovalComment,
    closeRemoval,
    confirmRemoval,
  } = complaintDetail;
  const status = detail?.status || complaint?.status;
  const appearance = complaintStatusAppearance(status);

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
              <JacoStatusChip
                label={complaintStatusLabel(detail || complaint)}
                tone={appearance.tone}
                variant={appearance.variant}
              />
              <JacoStatusChip
                tone="neutral"
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
            {error ? (
              <JacoAlert
                severity="error"
                action={
                  <JacoButton
                    compact
                    variant="text"
                    tone="outlinePrimary"
                    onClick={reload}
                  >
                    Обновить
                  </JacoButton>
                }
              >
                {error}
              </JacoAlert>
            ) : null}
            {detail ? (
              <>
                <ComplaintSummary
                  detail={detail}
                  cafeContext={cafeContext}
                />
                <CommandActions
                  commands={commands}
                  onSelect={setPendingCommand}
                />
                <ComplaintOrderAccordion
                  detail={detail}
                  onOpenOrder={onOpenOrder}
                />
                <ComplaintErrors
                  errors={detail.errors}
                  canRemove={(item) => canRemoveError(item, permissions)}
                  onRemove={openRemoval}
                />
                <ComplaintHistory history={detail.history} />
              </>
            ) : null}
          </Stack>
        </Box>
      </Box>
      <ComplaintResolutionModal
        command={pendingCommand}
        errors={activeErrors}
        cafeContext={cafeContext}
        solutions={solutions}
        resolutions={resolutions}
        promoCode={promoCode}
        transitioning={transitioning}
        canResolve={canResolve}
        commandError={commandError}
        onClose={() => setPendingCommand(null)}
        onConfirm={executeTransition}
        onResolutionsChange={setResolutions}
        onPromoCodeChange={setPromoCode}
      />
      <RemoveErrorModal
        state={removal}
        onChange={changeRemovalComment}
        onClose={closeRemoval}
        onConfirm={confirmRemoval}
      />
    </Drawer>
  );
}
