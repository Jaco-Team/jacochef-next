import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import {
  blockBackground,
  blockBorder,
  DetailRow,
  formatDateTime,
  getOptionLabel,
  RatingValue,
  SeverityChip,
  StatusChip,
  textSecondary,
} from "./shared";
import CafeReviewPhotoGallery from "./CafeReviewPhotoGallery";

const terminalStatuses = ["resolved", "dismissed"];
const validStatusTransitions = {
  new: ["in_progress"],
  in_progress: ["resolved", "dismissed"],
  resolved: ["in_progress"],
  dismissed: ["in_progress"],
};

function Section({ title, children }) {
  return (
    <Box component="section">
      <Typography sx={{ fontSize: 16, fontWeight: 800, mb: 1 }}>{title}</Typography>
      {children}
    </Box>
  );
}

function IssueList({ issues }) {
  if (!issues.length) {
    return <Typography sx={{ color: textSecondary }}>Причины не отмечены</Typography>;
  }

  return (
    <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
      {issues.map((issue) => (
        <Chip
          key={issue.id ?? issue.code}
          label={issue.name || issue.code}
          variant="outlined"
          sx={{ height: "auto", "& .MuiChip-label": { whiteSpace: "normal", py: 0.5 } }}
        />
      ))}
    </Box>
  );
}

function EventTimeline({ events, dictionaries }) {
  if (!events.length) {
    return <Typography sx={{ color: textSecondary }}>Событий пока нет</Typography>;
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
            borderLeft: "3px solid",
            borderColor: "primary.light",
            pl: 1.5,
          }}
        >
          <Typography sx={{ fontSize: 13, color: textSecondary }}>
            {formatDateTime(event.created_at)}
            {event.actor.name ? ` · ${event.actor.name}` : ""}
          </Typography>
          <Typography sx={{ fontWeight: 700, mt: 0.25 }}>
            {event.event_type || "Обновление"}
          </Typography>
          {event.status_from || event.status_to ? (
            <Typography sx={{ fontSize: 14, mt: 0.25 }}>
              Статус: {getOptionLabel(dictionaries.statuses, event.status_from)} →{" "}
              {getOptionLabel(dictionaries.statuses, event.status_to)}
            </Typography>
          ) : null}
          {event.severity ? (
            <Typography sx={{ fontSize: 14, mt: 0.25 }}>
              Критичность: {getOptionLabel(dictionaries.severities, event.severity)}
            </Typography>
          ) : null}
          {event.comment ? (
            <Typography
              sx={{ fontSize: 14, mt: 0.5, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
            >
              {event.comment}
            </Typography>
          ) : null}
        </Box>
      ))}
    </Box>
  );
}

function AiPanel({ analysis, incident, dictionaries, canDecide, onApply, onReject }) {
  if (!analysis) {
    return (
      <Alert severity="info">
        AI-анализ ещё не готов или недоступен. Решение по инциденту принимает оператор.
      </Alert>
    );
  }

  const decisionLabels = {
    accepted: "Рекомендация принята",
    rejected: "Рекомендация отклонена",
  };
  const hasDecision = Boolean(analysis.human_decision);

  return (
    <Paper
      variant="outlined"
      sx={{ p: 1.75, borderRadius: "12px", borderColor: blockBorder, bgcolor: "#FFFDF7" }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <AutoAwesomeOutlinedIcon
          aria-hidden="true"
          color="primary"
        />
        <Typography sx={{ fontWeight: 800 }}>AI-рекомендация</Typography>
        {analysis.confidence ? (
          <Chip
            size="small"
            label={`Уверенность ${Math.round(analysis.confidence * 100)}%`}
            variant="outlined"
          />
        ) : null}
      </Box>
      <Stack spacing={1.5}>
        <DetailRow label="Резюме">
          <Typography sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
            {analysis.summary_ru || "—"}
          </Typography>
        </DetailRow>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <SeverityChip
            value={analysis.suggested_severity}
            options={dictionaries.severities}
          />
          {analysis.suggested_category ? (
            <Chip
              size="small"
              label={`Категория: ${analysis.suggested_category}`}
              variant="outlined"
            />
          ) : null}
        </Box>
        {analysis.recommended_actions.length ? (
          <DetailRow label="Рекомендуемые действия">
            <Box
              component="ul"
              sx={{ mt: 0.5, mb: 0, pl: 2.5 }}
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
              sx={{ mt: 0.5, mb: 0, pl: 2.5 }}
            >
              {analysis.evidence.map((evidence, index) => (
                <li key={`${evidence}-${index}`}>{evidence}</li>
              ))}
            </Box>
          </DetailRow>
        ) : null}
        {analysis.pii_detected || analysis.image_uncertain ? (
          <Stack spacing={0.75}>
            {analysis.pii_detected ? (
              <Alert severity="warning">В данных может содержаться персональная информация.</Alert>
            ) : null}
            {analysis.image_uncertain ? (
              <Alert severity="warning">
                Анализ изображений неуверенный. Проверьте фотографии вручную.
              </Alert>
            ) : null}
          </Stack>
        ) : null}
        {hasDecision ? (
          <Alert
            severity={analysis.human_decision === "accepted" ? "success" : "info"}
            icon={<CheckCircleOutlineIcon />}
          >
            {decisionLabels[analysis.human_decision] || analysis.human_decision}
          </Alert>
        ) : null}
        {canDecide && !hasDecision ? (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              onClick={() => onApply(analysis)}
              disabled={!analysis.suggested_severity}
              sx={{ textTransform: "none", borderRadius: "12px", boxShadow: "none" }}
            >
              Принять
            </Button>
            <Button
              variant="outlined"
              onClick={() => onReject(analysis)}
              sx={{ textTransform: "none", borderRadius: "12px" }}
            >
              Отклонить
            </Button>
          </Box>
        ) : null}
      </Stack>
    </Paper>
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
  onDecideAi,
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
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    setStatus(incident?.status || "");
    setSeverity(incident?.severity || "");
    setComment(incident?.comment || "");
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

  if (loading) {
    return (
      <Box
        role="status"
        aria-label="Загрузка деталей"
        sx={{ minHeight: 260, display: "grid", placeItems: "center" }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        role="alert"
        sx={{ p: 3, textAlign: "center" }}
      >
        {showClose ? (
          <Button
            onClick={onClose}
            startIcon={<CloseIcon />}
            sx={{ mb: 2, textTransform: "none" }}
          >
            Закрыть
          </Button>
        ) : null}
        <Typography sx={{ color: "error.main", mb: 1.5 }}>{error}</Typography>
        <Button
          variant="outlined"
          onClick={onRetry}
          sx={{ textTransform: "none", borderRadius: "12px" }}
        >
          Повторить
        </Button>
      </Box>
    );
  }

  if (!detail || !review) {
    return (
      <Box sx={{ p: 3, textAlign: "center", color: textSecondary }}>
        Выберите запись, чтобы открыть детали
      </Box>
    );
  }

  const confirmTitle =
    confirmAction?.type === "save"
      ? "Сохранить изменения инцидента?"
      : confirmAction?.type === "apply-ai"
        ? "Применить AI-рекомендацию?"
        : "Отклонить AI-рекомендацию?";

  const runConfirmedAction = async () => {
    let succeeded = false;
    if (confirmAction?.type === "save") {
      if (!hasChanges) {
        setConfirmAction(null);
        return;
      }
      succeeded = await onUpdateIncident({
        id: incident.id,
        status,
        severity,
        comment,
        expected_lock_version: incident.lock_version,
      });
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
          <Button
            onClick={onClose}
            startIcon={<CloseIcon />}
            aria-label="Закрыть детали"
            sx={{ justifySelf: "end", textTransform: "none" }}
          >
            Закрыть
          </Button>
        ) : null}
        <Box>
          <Typography
            id={`${idPrefix}-title`}
            component="h2"
            sx={{ fontSize: 22, fontWeight: 800 }}
          >
            {kind === "incident" ? `Инцидент №${incident?.id}` : `Отзыв №${review.id}`}
          </Typography>
          <Typography sx={{ color: textSecondary, mt: 0.25 }}>
            {formatDateTime(review.completed_at || review.created_at)}
          </Typography>
        </Box>

        <Box sx={{ display: "grid", gap: 1.5 }}>
          <RatingValue
            value={review.rating}
            size="medium"
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
            <Typography>
              {review.point_name || "—"}
              {review.city_name ? ` · ${review.city_name}` : ""}
            </Typography>
          </DetailRow>
        </Box>

        <Divider />
        <Section title="Причины">
          <IssueList issues={detail.issues || []} />
        </Section>
        <Section title="Комментарий гостя">
          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: "12px",
              borderColor: blockBorder,
              bgcolor: blockBackground,
            }}
          >
            <Typography sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
              {review.comment || "Комментарий не оставлен"}
            </Typography>
          </Paper>
        </Section>

        <CafeReviewPhotoGallery
          photos={detail.photos || []}
          getPhoto={getPhoto}
          idPrefix={idPrefix}
        />

        {kind === "review" && incident && canOpenIncident ? (
          <Button
            variant="outlined"
            onClick={() => onOpenIncident(incident.id)}
            sx={{ justifySelf: "start", textTransform: "none", borderRadius: "12px" }}
          >
            Открыть инцидент
          </Button>
        ) : null}

        {kind === "incident" && incident ? (
          <>
            <Divider />
            <Section title="Работа с инцидентом">
              {canEdit ? (
                <Stack spacing={1.5}>
                  <FormControl
                    fullWidth
                    size="small"
                  >
                    <InputLabel id={`${idPrefix}-incident-status-label`}>Статус</InputLabel>
                    <Select
                      labelId={`${idPrefix}-incident-status-label`}
                      id={`${idPrefix}-incident-status`}
                      value={status}
                      label="Статус"
                      onChange={(event) => setStatus(event.target.value)}
                      sx={{ borderRadius: "12px" }}
                    >
                      {incidentStatusOptions.map((option) => (
                        <MenuItem
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl
                    fullWidth
                    size="small"
                  >
                    <InputLabel id={`${idPrefix}-incident-severity-label`}>Критичность</InputLabel>
                    <Select
                      labelId={`${idPrefix}-incident-severity-label`}
                      id={`${idPrefix}-incident-severity`}
                      value={severity}
                      label="Критичность"
                      onChange={(event) => setSeverity(event.target.value)}
                      sx={{ borderRadius: "12px" }}
                    >
                      {dictionaries.severities.map((option) => (
                        <MenuItem
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    id={`${idPrefix}-incident-comment`}
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
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                    slotProps={{
                      htmlInput: { maxLength: 2000 },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => setConfirmAction({ type: "save" })}
                    disabled={!hasChanges || (commentRequired && !comment.trim())}
                    sx={{
                      alignSelf: "flex-start",
                      textTransform: "none",
                      borderRadius: "12px",
                      boxShadow: "none",
                    }}
                  >
                    Сохранить изменения
                  </Button>
                </Stack>
              ) : (
                <Alert severity="info">У вас нет прав на изменение инцидента.</Alert>
              )}
            </Section>
            {canViewAi ? (
              <Section title="AI-анализ">
                <AiPanel
                  analysis={detail.ai_analysis}
                  incident={incident}
                  dictionaries={dictionaries}
                  canDecide={canDecideAi}
                  onApply={(analysis) => setConfirmAction({ type: "apply-ai", analysis })}
                  onReject={(analysis) => setConfirmAction({ type: "reject-ai", analysis })}
                />
              </Section>
            ) : null}
            <Section title="История событий">
              <EventTimeline
                events={detail.events || []}
                dictionaries={dictionaries}
              />
            </Section>
          </>
        ) : null}
      </Box>
      <Dialog
        open={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        maxWidth="xs"
        fullWidth
        aria-labelledby={`${idPrefix}-incident-confirm-title`}
        slotProps={{ backdrop: { sx: { backgroundColor: "rgba(0,0,0,0.3)" } } }}
      >
        <DialogTitle id={`${idPrefix}-incident-confirm-title`}>{confirmTitle}</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: textSecondary }}>
            Действие будет зафиксировано в истории инцидента.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setConfirmAction(null)}
            sx={{ textTransform: "none" }}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={runConfirmedAction}
            sx={{ textTransform: "none", borderRadius: "12px", boxShadow: "none" }}
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
