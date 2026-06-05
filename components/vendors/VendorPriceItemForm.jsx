"use client";

import { Box, Button, Grid, Stack, Typography } from "@mui/material";
import { MySelect, MyTextInput } from "@/ui/Forms";
import { formatUnitPriceLabel } from "./vendorItemPriceUtils";

export default function VendorPriceItemForm({
  canEdit,
  cityLabel,
  hideTitle = false,
  draft,
  onCancel,
  onSave,
  onDraftChange,
  isLoading,
}) {
  if (!draft) {
    return null;
  }

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.paper",
        p: 2,
      }}
    >
      {hideTitle ? null : (
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, mb: 2 }}
        >
          Редактирование цены{cityLabel ? ` · ${cityLabel}` : ""}
        </Typography>
      )}

      <Grid
        container
        spacing={2}
        alignItems="flex-end"
      >
        <Grid size={{ xs: 12, md: 4 }}>
          <MyTextInput
            label="Цена за упаковку, ₽"
            value={draft.full_price}
            func={onDraftChange("full_price")}
            disabled={!canEdit || isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <MySelect
            label="Объём упаковки, шт"
            data={draft.pqs || []}
            value={draft.rec_pq == 0 || draft.rec_pq === "0" ? "" : draft.rec_pq}
            func={onDraftChange("rec_pq")}
            is_none={false}
            disabled={!canEdit || isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={0.5}>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Цена за 1 ед.
            </Typography>
            <Typography sx={{ fontWeight: 600 }}>{formatUnitPriceLabel(draft)}</Typography>
          </Stack>
        </Grid>
      </Grid>

      {canEdit ? (
        <Stack
          direction="row"
          spacing={1}
          justifyContent="flex-end"
          sx={{ mt: 2 }}
        >
          <Button
            onClick={onCancel}
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={onSave}
            disabled={isLoading}
          >
            Сохранить
          </Button>
        </Stack>
      ) : null}
    </Box>
  );
}
