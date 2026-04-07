"use client";

import {
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Stack,
  Typography,
} from "@mui/material";
import useVendorOverviewView from "../useVendorOverviewView";

function FieldCard({ title, rows }) {
  return (
    <Card
      variant="outlined"
      sx={{ borderRadius: 3 }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, textTransform: "uppercase" }}
            >
              {title}
            </Typography>
          </Stack>
          {rows.map((row) => (
            <Stack
              key={row.label}
              spacing={0.5}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {row.label}
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>{row.value || "Не указано"}</Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

function SettingRow({ checked, disabled, label, onChange }) {
  return (
    <FormControlLabel
      sx={{ m: 0 }}
      control={
        <Checkbox
          sx={{ py: 0.5, pr: 1 }}
          checked={checked}
          disabled={disabled}
          onChange={onChange}
        />
      }
      label={<Typography sx={{ fontWeight: 600 }}>{label}</Typography>}
    />
  );
}

function SettingValueRow({ checked, label }) {
  return (
    <Stack spacing={0.5}>
      <Typography
        variant="body2"
        color="text.secondary"
      >
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 600 }}>{checked ? "Да" : "Нет"}</Typography>
    </Stack>
  );
}

export default function TabInfo({ canEdit, onToggleVendorField, onToggleVendorActive }) {
  const { overviewCardsMap, vendor } = useVendorOverviewView();

  if (!vendor) {
    return null;
  }

  return (
    <Stack spacing={2}>
      <FieldCard
        title="Основное"
        rows={overviewCardsMap.main?.rows || []}
      />

      <Card
        variant="outlined"
        sx={{ borderRadius: 3 }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, textTransform: "uppercase" }}
            >
              Настройки
            </Typography>
            {canEdit ? (
              <FormGroup sx={{ gap: 0.5 }}>
                <SettingRow
                  checked={Boolean(Number(vendor.is_show))}
                  disabled={!canEdit}
                  onChange={onToggleVendorActive}
                  label="Активность"
                />
                <SettingRow
                  checked={Boolean(Number(vendor.bill_ex))}
                  disabled={!canEdit}
                  onChange={() => onToggleVendorField("bill_ex")}
                  label="Работа по счетам"
                />
                <SettingRow
                  checked={Boolean(Number(vendor.need_img_bill_ex))}
                  disabled={!canEdit}
                  onChange={() => onToggleVendorField("need_img_bill_ex")}
                  label="Необходима картинка накладной"
                />
                <SettingRow
                  checked={Boolean(Number(vendor.is_priority))}
                  disabled={!canEdit}
                  onChange={() => onToggleVendorField("is_priority")}
                  label="Приоритетный поставщик"
                />
              </FormGroup>
            ) : (
              <Stack spacing={1.5}>
                <SettingValueRow
                  checked={Boolean(Number(vendor.is_show))}
                  label="Активность"
                />
                <SettingValueRow
                  checked={Boolean(Number(vendor.bill_ex))}
                  label="Работа по счетам"
                />
                <SettingValueRow
                  checked={Boolean(Number(vendor.need_img_bill_ex))}
                  label="Необходима картинка накладной"
                />
                <SettingValueRow
                  checked={Boolean(Number(vendor.is_priority))}
                  label="Приоритетный поставщик"
                />
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>

      <FieldCard
        title="Реквизиты"
        rows={overviewCardsMap.requisites?.rows || []}
      />
    </Stack>
  );
}
