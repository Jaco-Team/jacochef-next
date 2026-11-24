import { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  ClickAwayListener,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import {
  JacoAlert,
  JacoButton,
  JacoIconButton,
  JacoModal,
  JacoSelect,
  JacoStatusChip,
  JacoSurface,
  JacoTextInput,
  uiColors,
  uiRadii,
  uiTypography,
  useJacoConfirm,
} from "@/design-system/shared/ui";
import {
  DetailRow,
  formatDateTime,
  getOptionLabel,
  RatingValue,
  SeverityChip,
  StatusChip,
  ZoneChip,
} from "./shared";
import CafeReviewPhotoGallery from "./CafeReviewPhotoGallery";

const sectionTitleSx = { ...uiTypography.bodyMedium, color: uiColors.textStrong };
const bodyTextSx = { ...uiTypography.label, color: uiColors.textStrong };
const mutedTextSx = { ...uiTypography.label, color: uiColors.text };
const accordionSx = {
  backgroundColor: "transparent",
  "&::before": { display: "none" },
};
const wrapChipSx = { height: "auto", "& .MuiChip-label": { whiteSpace: "normal", py: 0.5 } };

const terminalStatuses = ["resolved", "dismissed"];
const validStatusTransitions = {
  new: ["in_progress"],
  in_progress: ["resolved", "dismissed"],
  resolved: ["in_progress"],
  dismissed: ["in_progress"],
};

const aiCategoryLabels = {
  cleanliness: "Чистота и санитария",
  supplies: "Расходные материалы",
  equipment: "Оборудование",
  plumbing: "Сантехника",
  odor: "Запах",
  service: "Сервис",
  other: "Другое",
};

function getIssueLabel(issueCode, issues) {
  return issues.find((issue) => issue.code === issueCode)?.name || issueCode;
}

function Section({ title, children }) {
  return (
    <Box component="section">
      <Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>{title}</Typography>
      {children}
    </Box>
  );
}

function IssueList({ issues }) {
  if (!issues.length) {
    return <Typography sx={mutedTextSx}>Причины не отмечены</Typography>;
  }

  return (
    <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
      {issues.map((issue) => (
        <JacoStatusChip
          key={issue.id ?? issue.code}
          tone="neutral"
          variant="outlined"
          label={issue.name || issue.code}
          sx={wrapChipSx}
        />
      ))}
    </Box>
  );
}

function EventTimeline({ events, dictionaries, getPhoto, idPrefix }) {
  if (!events.length) {
    return <Typography sx={mutedTextSx}>Событий пока нет</Typography>;
  }

  return (
    <Box
      component="ol"
      sx={{ listStyle: "none", p: 0, m: 0, display: "grid", gap: 1.5 }}
    >
      {events.map((event) => (
        <Box
          component="li"
          key={event.id}
          sx={{
            borderLeft: `2px solid ${uiColors.border}`,
            pl: 1.5,
          }}
        >
          <Typography sx={{ ...uiTypography.compactLabel, color: uiColors.text }}>
            {formatDateTime(event.created_at)}
            {event.actor.name ? ` · ${event.actor.name}` : ""}
          </Typography>
          <Typography sx={{ ...bodyTextSx, fontWeight: 600, mt: 0.25 }}>
            {{
              ai_analysis_generated: "AI-анализ сформирован",
              ai_suggestion_accepted: "AI-рекомендация принята",
              ai_suggestion_rejected: "AI-рекомендация отклонена",
            }[event.event_type] ||
              event.event_type ||
              "Обновление"}
          </Typography>
          {event.status_from || event.status_to ? (
            <Typography sx={{ ...bodyTextSx, mt: 0.25 }}>
              Статус: {getOptionLabel(dictionaries.statuses, event.status_from)} →{" "}
              {getOptionLabel(dictionaries.statuses, event.status_to)}
            </Typography>
          ) : null}
          {event.severity ? (
            <Typography sx={{ ...bodyTextSx, mt: 0.25 }}>
              Критичность: {getOptionLabel(dictionaries.severities, event.severity)}
            </Typography>
          ) : null}
          {event.comment ? (
            <Box sx={{ mt: 0.5 }}>
              {event.comment_type ? (
                <Typography sx={{ ...mutedTextSx, fontWeight: 600 }}>
                  {{
                    operator: "Комментарий оператора",
                    ai_recommendation: "Рекомендации AI",
                    ai_context: "Контекст для AI",
                  }[event.comment_type] || "Комментарий"}
                </Typography>
              ) : null}
              <Typography sx={{ ...bodyTextSx, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                {event.comment}
              </Typography>
            </Box>
          ) : null}
          {event.decision ? (
            <Typography sx={{ ...bodyTextSx, mt: 0.25 }}>
              Решение: {event.decision === "accepted" ? "принято" : "отклонено"}
            </Typography>
          ) : null}
          {event.photos.length ? (
            <CafeReviewPhotoGallery
              photos={event.photos}
              getPhoto={getPhoto}
              idPrefix={`${idPrefix}-event-${event.id}`}
              title="Вложения"
            />
          ) : null}
        </Box>
      ))}
    </Box>
  );
}

function AiPanel({
  analysis,
  incident,
  reviewStatus,
  dictionaries,
  canDecide,
  onApply,
  onReject,
  onReanalyze,
}) {
  const [reanalyzeOpen, setReanalyzeOpen] = useState(false);
  const [additionalContext, setAdditionalContext] = useState("");
  const [reanalyzeAttachment, setReanalyzeAttachment] = useState(null);
  const { withConfirm, ConfirmDialog } = useJacoConfirm();

  // The backend analyses only fully submitted reviews; legacy "blocked" and
  // unfinished ones would just come back with an error.
  if (!analysis && reviewStatus && reviewStatus !== "completed") {
    return (
      <JacoAlert severity="info">
        {reviewStatus === "blocked"
          ? "AI-анализ недоступен: отправка этого отзыва была заблокирована."
          : "AI-анализ недоступен: гость не завершил отправку отзыва."}{" "}
        Решение по инциденту принимает оператор.
      </JacoAlert>
    );
  }

  if (!analysis) {
    const runAnalysis = withConfirm(
      () => onReanalyze({ incidentId: incident.id, additionalContext: "" }),
      {
        title: "AI-анализ",
        message: "Запустить AI-анализ сейчас?",
        tone: "success",
        confirmLabel: "Запустить",
        confirmTone: "success",
        cancelLabel: "Отмена",
      },
    );

    return (
      <Stack spacing={1.25}>
        <JacoAlert severity="info">
          AI-анализ ещё не готов или недоступен. Решение по инциденту принимает оператор.
        </JacoAlert>
        {canDecide ? (
          <JacoButton
            tone="outlinePrimary"
            compact
            startIcon={<RefreshOutlinedIcon />}
            onClick={runAnalysis}
            sx={{ alignSelf: "flex-start" }}
          >
            Запустить
          </JacoButton>
        ) : null}
        <ConfirmDialog />
      </Stack>
    );
  }

  const decisionLabels = {
    accepted: "Рекомендация принята",
    rejected: "Рекомендация отклонена",
  };
  const hasDecision = Boolean(analysis.human_decision);

  const cancelReanalyze = () => {
    setAdditionalContext("");
    setReanalyzeAttachment(null);
    setReanalyzeOpen(false);
  };

  const submitReanalyze = async () => {
    const context = additionalContext.trim();
    if (!context && !reanalyzeAttachment) return;
    if (
      await onReanalyze({
        incidentId: incident.id,
        additionalContext: context,
        attachment: reanalyzeAttachment,
      })
    ) {
      cancelReanalyze();
    }
  };

  return (
    <JacoSurface sx={{ p: 2, borderRadius: uiRadii.md, bgcolor: uiColors.surfaceMuted }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
        <AutoAwesomeOutlinedIcon
          aria-hidden="true"
          sx={{ color: uiColors.primary }}
        />
        <Typography sx={sectionTitleSx}>AI-рекомендация</Typography>
        {analysis.confidence ? (
          <JacoStatusChip
            tone="neutral"
            variant="outlined"
            label={`Уверенность ${Math.round(analysis.confidence * 100)}%`}
          />
        ) : null}
      </Box>
      <Stack spacing={1.5}>
        <DetailRow label="Резюме">
          <Typography sx={{ ...bodyTextSx, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
            {analysis.summary_ru || "—"}
          </Typography>
        </DetailRow>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <SeverityChip
            value={analysis.suggested_severity}
            options={dictionaries.severities}
          />
          {analysis.suggested_category ? (
            <JacoStatusChip
              tone="neutral"
              variant="outlined"
              label={`Категория: ${aiCategoryLabels[analysis.suggested_category] || analysis.suggested_category}`}
            />
          ) : null}
        </Box>
        {analysis.recommended_actions.length ? (
          <DetailRow label="Рекомендуемые действия">
            <Box
              component="ul"
              sx={{ ...bodyTextSx, mt: 0.5, mb: 0, pl: 2.5 }}
            >
              {analysis.recommended_actions.map((action, index) => (
                <li key={`${action}-${index}`}>{action}</li>
              ))}
            </Box>
          </DetailRow>
        ) : null}
        {analysis.evidence.length ? (
          <DetailRow label="Основания">
            <Box
              component="ul"
              sx={{ ...bodyTextSx, mt: 0.5, mb: 0, pl: 2.5 }}
            >
              {analysis.evidence.map((evidence, index) => (
                <li key={`${evidence.issue_code || evidence.photo_id || evidence.text}-${index}`}>
                  {evidence.text ||
                    [
                      evidence.issue_code
                        ? `Причина: ${getIssueLabel(evidence.issue_code, dictionaries.issues)}`
                        : "",
                      evidence.photo_id ? `Фото: ${evidence.photo_id}` : "",
                    ]
                      .filter(Boolean)
                      .join(", ")}
                </li>
              ))}
            </Box>
          </DetailRow>
        ) : null}
        {analysis.pii_detected || analysis.image_uncertain ? (
          <Stack spacing={0.75}>
            {analysis.pii_detected ? (
              <JacoAlert severity="warning">
                В данных может содержаться персональная информация.
              </JacoAlert>
            ) : null}
            {analysis.image_uncertain ? (
              <JacoAlert severity="warning">
                Анализ изображений неуверенный. Проверьте фотографии вручную.
              </JacoAlert>
            ) : null}
          </Stack>
        ) : null}
        {hasDecision ? (
          <JacoAlert
            severity={analysis.human_decision === "accepted" ? "success" : "info"}
            icon={<CheckCircleOutlineIcon />}
          >
            {decisionLabels[analysis.human_decision] || analysis.human_decision}
          </JacoAlert>
        ) : null}
        {canDecide && !reanalyzeOpen && analysis.human_decision !== "accepted" ? (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {!hasDecision ? (
              <>
                <JacoButton
                  tone="success"
                  compact
                  onClick={() => onApply(analysis)}
                  disabled={!analysis.suggested_severity}
                >
                  Принять
                </JacoButton>
                <JacoButton
                  tone="outlinePrimary"
                  compact
                  onClick={() => onReject(analysis)}
                >
                  Отклонить
                </JacoButton>
              </>
            ) : null}
            <JacoButton
              tone="secondary"
              compact
              startIcon={<RefreshOutlinedIcon />}
              onClick={() => setReanalyzeOpen(true)}
            >
              Повторить анализ
            </JacoButton>
          </Box>
        ) : null}
        {canDecide && reanalyzeOpen ? (
          <ClickAwayListener onClickAway={cancelReanalyze}>
            <Stack spacing={1}>
              <JacoTextInput
                autoFocus
                fullWidth
                multiline
                minRows={2}
                maxRows={4}
                label="Пояснение для повторного анализа"
                value={additionalContext}
                onChange={(event) => setAdditionalContext(event.target.value)}
                placeholder="Дополнительная информация по инциденту"
                inputProps={{ maxLength: 2000 }}
              />
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <JacoButton
                  component="label"
                  tone="secondary"
                  compact
                  startIcon={<AttachFileIcon />}
                  sx={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  {reanalyzeAttachment ? `Фото: ${reanalyzeAttachment.name}` : "Добавить фото"}
                  <input
                    hidden
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => setReanalyzeAttachment(event.target.files?.[0] || null)}
                  />
                </JacoButton>
                <Box sx={{ flex: 1 }} />
                <JacoButton
                  tone="secondary"
                  compact
                  onClick={cancelReanalyze}
                >
                  Отмена
                </JacoButton>
                <JacoButton
                  tone="success"
                  compact
                  endIcon={<ArrowForwardIcon />}
                  disabled={!additionalContext.trim() && !reanalyzeAttachment}
                  onClick={submitReanalyze}
                >
                  Отправить
                </JacoButton>
              </Box>
            </Stack>
          </ClickAwayListener>
        ) : null}
      </Stack>
    </JacoSurface>
  );
}

function AiAnalysisSection({ analysis, children }) {
  const [expanded, setExpanded] = useState(!analysis?.human_decision);
  const decision = analysis?.human_decision || null;

  useEffect(() => {
    setExpanded(!decision || decision !== "accepted");
  }, [analysis?.id, decision]);

  const status = !analysis
    ? { label: "Не проанализирован", tone: "neutral", variant: "outlined" }
    : decision === "accepted"
      ? { label: "Принято", tone: "success", variant: "soft" }
      : decision === "rejected"
        ? { label: "Отклонено", tone: "neutral", variant: "soft" }
        : { label: "Готово к проверке", tone: "warning", variant: "soft" };

  return (
    <Accordion
      disableGutters
      elevation={0}
      expanded={expanded}
      onChange={(_, nextExpanded) => setExpanded(nextExpanded)}
      sx={accordionSx}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          minHeight: 40,
          px: 0,
          "& .MuiAccordionSummary-content": { my: 0.75, alignItems: "center", gap: 1 },
        }}
      >
        <Typography sx={sectionTitleSx}>AI-анализ</Typography>
        <JacoStatusChip
          tone={status.tone}
          variant={status.variant}
          label={status.label}
        />
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0, pt: 0.5, pb: 0 }}>{children}</AccordionDetails>
    </Accordion>
  );
}

export default function CafeReviewDetail({
  kind,
  detail,
  loading,
  dictionaries,
  canEdit,
  canViewAi,
  canDecideAi,
  canOpenIncident,
  getPhoto,
  onUpdateIncident,
  onMarkIncident,
  onDecideAi,
  onReanalyzeAi,
  onOpenIncident,
  onClose,
  error,
  onRetry,
  idPrefix,
  showClose = false,
}) {
  const incident = detail?.incident || null;
  const review = detail?.review || null;
  const [status, setStatus] = useState("");
  const [severity, setSeverity] = useState("");
  const [comment, setComment] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    setStatus(incident?.status || "");
    setSeverity(incident?.severity || "");
    setComment(incident?.comment || "");
    setAttachment(null);
    setConfirmAction(null);
  }, [incident?.id, incident?.lock_version, incident?.updated_at, review?.id]);

  const commentRequired = useMemo(
    () =>
      status !== incident?.status &&
      (terminalStatuses.includes(status) || terminalStatuses.includes(incident?.status)),
    [incident?.status, status],
  );
  const hasChanges =
    incident &&
    (status !== incident.status || severity !== incident.severity || comment !== incident.comment);
  const incidentStatusOptions = useMemo(() => {
    if (!incident) return [];
    const options = dictionaries.incident_statuses.length
      ? dictionaries.incident_statuses
      : dictionaries.statuses;
    const allowed = new Set([incident.status, ...(validStatusTransitions[incident.status] || [])]);
    const validOptions = options.filter((option) => allowed.has(option.value));

    if (incident.status && !validOptions.some((option) => option.value === incident.status)) {
      return [
        {
          value: incident.status,
          label: getOptionLabel(options, incident.status),
        },
        ...validOptions,
      ];
    }

    return validOptions;
  }, [dictionaries.incident_statuses, dictionaries.statuses, incident]);
  const incidentStatusValue = incidentStatusOptions.some((option) => option.value === status)
    ? status
    : incident?.status || "";

  if (error) {
    return (
      <Box
        role="alert"
        sx={{ p: 3, textAlign: "center" }}
      >
        {showClose ? (
          <JacoButton
            tone="secondary"
            compact
            onClick={onClose}
            startIcon={<CloseIcon />}
            sx={{ mb: 2 }}
          >
            Закрыть
          </JacoButton>
        ) : null}
        <Typography sx={{ color: uiColors.danger, mb: 1.5 }}>{error}</Typography>
        <JacoButton
          tone="outlinePrimary"
          onClick={onRetry}
        >
          Повторить
        </JacoButton>
      </Box>
    );
  }

  if (!detail || !review) {
    if (loading) return null;

    return (
      <Box sx={{ p: 3, textAlign: "center", color: uiColors.text }}>
        Выберите запись, чтобы открыть детали
      </Box>
    );
  }

  const confirmTitle =
    confirmAction?.type === "save"
      ? "Сохранить изменения инцидента?"
      : confirmAction?.type === "apply-ai"
        ? "Применить AI-рекомендацию?"
        : confirmAction?.type === "reject-ai"
          ? "Отклонить AI-рекомендацию?"
          : "Отметить отзыв как инцидент?";

  const runConfirmedAction = async () => {
    let succeeded = false;
    if (confirmAction?.type === "save") {
      if (!hasChanges) {
        setConfirmAction(null);
        return;
      }
      succeeded = await onUpdateIncident(
        {
          id: incident.id,
          status,
          comment,
          expected_lock_version: incident.lock_version,
          ...(severity ? { severity } : {}),
        },
        attachment,
      );
    }
    if (confirmAction?.type === "apply-ai") {
      succeeded = await onDecideAi({
        id: incident.id,
        ai_analysis_id: confirmAction.analysis.id,
        decision: "accepted",
        expected_lock_version: incident.lock_version,
      });
    }
    if (confirmAction?.type === "reject-ai") {
      succeeded = await onDecideAi({
        id: incident.id,
        ai_analysis_id: confirmAction.analysis.id,
        decision: "rejected",
        expected_lock_version: incident.lock_version,
      });
    }
    if (confirmAction?.type === "mark-incident") {
      succeeded = await onMarkIncident(review.id);
    }
    if (succeeded) setConfirmAction(null);
  };

  return (
    <>
      <Box
        sx={{
          position: "relative",
          p: 2,
          "@media (min-width: 668px)": { p: 2.5 },
          display: "grid",
          gap: 2.5,
        }}
      >
        {showClose ? (
          <JacoButton
            tone="secondary"
            compact
            onClick={onClose}
            startIcon={<CloseIcon />}
            aria-label="Закрыть детали"
            sx={{ justifySelf: "end" }}
          >
            Закрыть
          </JacoButton>
        ) : null}
        <Box>
          <Typography
            id={`${idPrefix}-title`}
            component="h2"
            sx={{ fontSize: 20, lineHeight: 1.3, fontWeight: 600, color: uiColors.textStrong }}
          >
            {kind === "incident" ? `Инцидент №${incident?.id}` : `Отзыв №${review.id}`}
          </Typography>
          <Typography sx={{ ...mutedTextSx, mt: 0.25 }}>
            {formatDateTime(review.completed_at || review.created_at)}
          </Typography>
        </Box>

        <Box sx={{ display: "grid", gap: 1.5 }}>
          <RatingValue
            value={review.rating}
            size="medium"
            isIncident={kind === "incident" || review.is_incident}
          />
          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
            <StatusChip
              value={incident?.status || review.status}
              options={dictionaries.statuses}
            />
            {incident ? (
              <SeverityChip
                value={incident.severity}
                options={dictionaries.severities}
              />
            ) : null}
          </Box>
          <DetailRow label="Кафе">
            <Typography sx={bodyTextSx}>
              {review.point_name || "—"}
              {review.city_name ? ` · ${review.city_name}` : ""}
            </Typography>
          </DetailRow>
          {review.zone_code || review.zone_label ? (
            <DetailRow label="Зона">
              <ZoneChip
                code={review.zone_code}
                label={review.zone_label}
              />
            </DetailRow>
          ) : null}
        </Box>

        <Divider sx={{ borderColor: uiColors.borderLight }} />
        <Section title="Причины">
          <IssueList issues={detail.issues || []} />
        </Section>
        <Section title="Комментарий гостя">
          <JacoSurface sx={{ p: 1.5, borderRadius: uiRadii.md, bgcolor: uiColors.surfaceMuted }}>
            <Typography sx={{ ...bodyTextSx, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
              {review.comment || "Комментарий не оставлен"}
            </Typography>
          </JacoSurface>
        </Section>

        <CafeReviewPhotoGallery
          photos={detail.photos || []}
          getPhoto={getPhoto}
          idPrefix={idPrefix}
        />

        {kind === "review" && incident && canOpenIncident ? (
          <JacoButton
            tone="outlinePrimary"
            compact
            onClick={() => onOpenIncident(incident.id)}
            sx={{ justifySelf: "start" }}
          >
            Открыть инцидент
          </JacoButton>
        ) : null}

        {kind === "review" && review.status === "completed" && !incident && canEdit ? (
          <JacoButton
            tone="outlinePrimary"
            compact
            onClick={() => setConfirmAction({ type: "mark-incident" })}
            sx={{ justifySelf: "start" }}
          >
            Отметить как инцидент
          </JacoButton>
        ) : null}

        {kind === "incident" && incident ? (
          <>
            <Divider sx={{ borderColor: uiColors.borderLight }} />
            <Section title="Работа с инцидентом">
              {canEdit ? (
                <Stack spacing={2}>
                  <JacoSelect
                    id={`${idPrefix}-incident-status`}
                    label="Статус"
                    allowNone={false}
                    options={incidentStatusOptions.map((option) => ({
                      id: option.value,
                      name: option.label,
                    }))}
                    value={incidentStatusValue}
                    onChange={(event) => {
                      const nextStatus = event.target.value;
                      setStatus(nextStatus);
                      if (nextStatus === incident.status) setAttachment(null);
                    }}
                  />
                  <JacoSelect
                    id={`${idPrefix}-incident-severity`}
                    label="Критичность"
                    allowNone={false}
                    options={dictionaries.severities.map((option) => ({
                      id: option.value,
                      name: option.label,
                    }))}
                    value={severity}
                    onChange={(event) => setSeverity(event.target.value)}
                  />
                  <JacoTextInput
                    id={`${idPrefix}-incident-comment`}
                    fullWidth
                    label="Комментарий оператора"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    required={commentRequired}
                    error={commentRequired && !comment.trim()}
                    helperText={
                      commentRequired && !comment.trim()
                        ? "Комментарий обязателен для этого перехода"
                        : "Комментарий попадёт в историю событий"
                    }
                    minRows={3}
                    multiline
                    inputProps={{ maxLength: 2000 }}
                  />
                  {status !== incident.status ? (
                    <JacoButton
                      component="label"
                      tone="secondary"
                      compact
                      startIcon={<AttachFileIcon />}
                      sx={{
                        alignSelf: "flex-start",
                        maxWidth: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {attachment ? `Фото: ${attachment.name}` : "Прикрепить фото (необязательно)"}
                      <input
                        hidden
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) => setAttachment(event.target.files?.[0] || null)}
                      />
                    </JacoButton>
                  ) : null}
                  <JacoButton
                    onClick={() => setConfirmAction({ type: "save" })}
                    disabled={!hasChanges || (commentRequired && !comment.trim())}
                    sx={{ alignSelf: "flex-start" }}
                  >
                    Сохранить изменения
                  </JacoButton>
                </Stack>
              ) : (
                <JacoAlert severity="info">У вас нет прав на изменение инцидента.</JacoAlert>
              )}
            </Section>
            {canViewAi ? (
              <AiAnalysisSection analysis={detail.ai_analysis}>
                <AiPanel
                  analysis={detail.ai_analysis}
                  incident={incident}
                  reviewStatus={review?.status}
                  dictionaries={dictionaries}
                  canDecide={canDecideAi}
                  onApply={(analysis) => setConfirmAction({ type: "apply-ai", analysis })}
                  onReject={(analysis) => setConfirmAction({ type: "reject-ai", analysis })}
                  onReanalyze={async ({ incidentId, additionalContext, attachment }) =>
                    onReanalyzeAi({
                      id: incidentId,
                      additional_context: additionalContext,
                      attachment,
                    })
                  }
                />
              </AiAnalysisSection>
            ) : null}
            <Accordion
              disableGutters
              elevation={0}
              defaultExpanded={false}
              sx={accordionSx}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  minHeight: 40,
                  px: 0,
                  "& .MuiAccordionSummary-content": { my: 1 },
                }}
              >
                <Typography sx={sectionTitleSx}>История событий</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0, pb: 0 }}>
                <EventTimeline
                  events={detail.events || []}
                  dictionaries={dictionaries}
                  getPhoto={getPhoto}
                  idPrefix={idPrefix}
                />
              </AccordionDetails>
            </Accordion>
          </>
        ) : null}
      </Box>
      <JacoModal
        open={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        title={confirmTitle}
        maxWidth="xs"
        actions={
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, width: "100%" }}>
            <JacoButton
              tone="secondary"
              compact
              onClick={() => setConfirmAction(null)}
            >
              Отмена
            </JacoButton>
            <JacoButton
              compact
              onClick={runConfirmedAction}
            >
              Подтвердить
            </JacoButton>
          </Box>
        }
      >
        <Typography sx={mutedTextSx}>Действие будет зафиксировано в истории инцидента.</Typography>
      </JacoModal>
    </>
  );
}
