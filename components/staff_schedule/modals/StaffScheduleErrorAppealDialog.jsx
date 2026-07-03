import { useEffect, useState } from "react";
import { Box, Grid, Link, Stack, Typography } from "@mui/material";
import { V2Alert, V2Button, V2TextInput } from "@/ui/v2";
import StaffScheduleResponsiveModal from "./StaffScheduleResponsiveModal";

function InfoBlock({ label, children }) {
  return (
    <Stack spacing={0.5}>
      <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#666666" }}>{label}</Typography>
      <Typography sx={{ fontSize: 15, color: "#666666", lineHeight: 1.35 }}>
        {children || "—"}
      </Typography>
    </Stack>
  );
}

export default function StaffScheduleErrorAppealDialog({ modal, onClose, onSubmit }) {
  const [appealText, setAppealText] = useState("");

  useEffect(() => {
    setAppealText(modal?.data?.appealText ?? "");
  }, [modal?.data?.appealText, modal?.open]);

  const data = modal?.data;
  const isOrder = data?.type === "order";
  const canSubmit = Boolean(data?.canEdit && String(appealText).trim());

  return (
    <StaffScheduleResponsiveModal
      open={Boolean(modal?.open)}
      onClose={onClose}
      title={data?.title || "Обжалование"}
      maxWidth="md"
      actions={
        canSubmit || modal?.loading ? (
          <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <V2Button
              compact
              tone="secondary"
              onClick={onClose}
              sx={{ minWidth: 112 }}
            >
              Отмена
            </V2Button>
            <V2Button
              compact
              onClick={() => onSubmit?.({ type: data?.type, appealText })}
              disabled={!canSubmit}
              sx={{ minWidth: 128 }}
            >
              Обжаловать
            </V2Button>
          </Box>
        ) : null
      }
    >
      {modal?.error ? (
        <V2Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {modal.error}
        </V2Alert>
      ) : null}

      {data ? (
        <Grid
          container
          spacing={2.5}
        >
          {isOrder ? (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoBlock label="Ошибка заказа">{data.orderDesc}</InfoBlock>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoBlock label="Дата заказа">{data.dateTime}</InfoBlock>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <InfoBlock label="Позиция">{data.itemName}</InfoBlock>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <InfoBlock label="Ошибка">{data.errorName}</InfoBlock>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <InfoBlock label="Сумма">{data.price}</InfoBlock>
              </Grid>
            </>
          ) : (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoBlock label="Ошибка">{data?.errorName}</InfoBlock>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoBlock label="Дата время ошибки">{data?.dateTime}</InfoBlock>
              </Grid>
              <Grid size={12}>
                <InfoBlock label="Комментарий">{data?.comment}</InfoBlock>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoBlock label="Сумма">{data?.price}</InfoBlock>
              </Grid>
            </>
          )}

          {data?.images?.length ? (
            <Grid size={12}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.25 }}>
                {data.images.map((image) => (
                  <Link
                    key={image.id}
                    href={image.url}
                    target="_blank"
                    rel="noreferrer"
                    sx={{ display: "inline-flex" }}
                  >
                    <Box
                      component="img"
                      src={image.url}
                      alt=""
                      sx={{
                        display: "block",
                        width: 150,
                        height: 150,
                        objectFit: "cover",
                        borderRadius: "10px",
                        border: "1px solid #E5E5E5",
                      }}
                    />
                  </Link>
                ))}
              </Box>
            </Grid>
          ) : null}

          {data?.canEdit ? (
            <Grid size={{ xs: 12, sm: 6 }}>
              <V2TextInput
                label="Причина обжалования"
                multiline
                maxRows={5}
                value={appealText}
                onChange={(event) => setAppealText(event.target.value)}
              />
            </Grid>
          ) : data?.appealText ? (
            <Grid size={{ xs: 12, sm: 6 }}>
              <InfoBlock label="Причина обжалования">{data.appealText}</InfoBlock>
            </Grid>
          ) : null}

          {data?.appealAnswer ? (
            <Grid size={{ xs: 12, sm: 6 }}>
              <InfoBlock label="Ответ обжалования">{data.appealAnswer}</InfoBlock>
            </Grid>
          ) : null}
        </Grid>
      ) : null}
    </StaffScheduleResponsiveModal>
  );
}
