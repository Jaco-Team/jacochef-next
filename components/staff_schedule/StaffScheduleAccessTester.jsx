"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Close, Edit } from "@mui/icons-material";
import { createStaffSchedulePolicy } from "./staffScheduleHelpers";
import {
  STAFF_SCHEDULE_ACCESS_PRESETS,
  STAFF_SCHEDULE_ACCESS_RULES,
  STAFF_SCHEDULE_ROLE_OPTIONS,
  applyStaffScheduleAccessPreset,
  buildStaffScheduleAccessSkeleton,
  getMissingStaffScheduleAccessKeys,
} from "./staffScheduleAccessRegistry";

function YesNo({ yes }) {
  return <span style={{ color: yes ? "green" : "red" }}>{yes ? "Yes" : "No"}</span>;
}

function buildGateRows(page, policy) {
  const dayData = page.dayModal?.data;
  const monthData = page.monthModal?.data;

  return [
    ["kind из API", page.graphKind || "—"],
    ["Итоговый kind", page.effectiveGraphKind || "—"],
    ["Выбранный месяц", page.monthId || "—"],
    ["Панель быстрых действий", String(Boolean(policy.canShowFastActionsPanel))],
    ["Карточка месяца", String(Boolean(policy.canOpenMonthCard))],
    ["Карточка дня", String(Boolean(policy.canOpenDayCard))],
    ["Смены", String(Boolean(policy.canManageSmena))],
    ["Блок зарплаты", String(Boolean(policy.canShowSalaryBlock))],
    ["Блок итогов", String(Boolean(policy.canShowFooterStats))],
    ["Экспорт графика", String(Boolean(policy.canExportWorkSchedule))],
    ["Журнал здоровья", String(Boolean(policy.canExportHealthJournal))],
    ["Дата дня", dayData?.dateLabel || page.dayModal?.request?.date || "—"],
    ["День: часы доступны", dayData ? String(Boolean(dayData.canEditHours)) : "—"],
    ["День: должность доступна", dayData ? String(Boolean(dayData.canEditAssignment)) : "—"],
    ["День: здоровье доступно", dayData ? String(Boolean(dayData.canEditHealth)) : "—"],
    ["Месяц доступен", monthData ? String(Boolean(monthData.canEditMonth)) : "—"],
  ];
}

export default function StaffScheduleAccessTester({ page }) {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [localAccess, setLocalAccess] = useState(() => page.access ?? {});
  const [localRole, setLocalRole] = useState(() => page.devRoleKind ?? "");
  const [isAccessDirty, setIsAccessDirty] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setLocalAccess(page.access ?? {});
    setLocalRole(page.devRoleKind ?? "");
    setIsAccessDirty(false);
  }, [open, page.access, page.devRoleKind]);

  const access = useMemo(() => buildStaffScheduleAccessSkeleton(localAccess), [localAccess]);
  const missingKeys = useMemo(() => getMissingStaffScheduleAccessKeys(localAccess), [localAccess]);
  const accessCheck = useMemo(() => createStaffSchedulePolicy(access), [access]);
  const gateRows = useMemo(() => buildGateRows(page, accessCheck), [accessCheck, page]);
  const visibleRules = useMemo(
    () =>
      STAFF_SCHEDULE_ACCESS_RULES.filter((rule) =>
        [rule.key, rule.label, rule.area, rule.status]
          .join(" ")
          .toLowerCase()
          .includes(filter.toLowerCase()),
      ),
    [filter],
  );

  const setAccessValue = (key, action, value) => {
    setIsAccessDirty(true);
    setLocalAccess((prev) => ({
      ...prev,
      [`${key}_${action}`]: Number(value),
    }));
  };

  const applyPreset = (presetId) => {
    setIsAccessDirty(true);
    setLocalAccess((prev) => applyStaffScheduleAccessPreset(prev, presetId));
  };

  const applyChanges = () => {
    if (isAccessDirty) {
      page.setAccess?.(localAccess);
    }
    page.setDevRoleKind?.(localRole);
    setOpen(false);
  };

  return (
    <>
      <IconButton
        onClick={() => setOpen((prev) => !prev)}
        sx={{
          position: "fixed",
          right: 16,
          bottom: 16,
          zIndex: 1300,
          backgroundColor: "#44885545",
          "&:hover": { backgroundColor: "#44885566" },
        }}
      >
        {open ? <Close /> : <Edit />}
      </IconButton>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
                Проверка доступов staff_schedule
              </Typography>
              <Typography sx={{ color: "#666666", fontSize: 13 }}>
                Dev-only переопределение для локальной проверки UX. Отсутствующих ключей:{" "}
                {missingKeys.length}
              </Typography>
            </Box>
            <IconButton onClick={() => setOpen(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.5}
            >
              <TextField
                select
                label="Роль kind"
                value={localRole}
                onChange={(event) => setLocalRole(event.target.value)}
                sx={{ minWidth: 180 }}
              >
                {STAFF_SCHEDULE_ROLE_OPTIONS.map((item) => (
                  <MenuItem
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Фильтр"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                sx={{ minWidth: 240 }}
              />

              {STAFF_SCHEDULE_ACCESS_PRESETS.map((preset) => (
                <Button
                  key={preset.id}
                  variant="outlined"
                  onClick={() => applyPreset(preset.id)}
                >
                  {preset.name}
                </Button>
              ))}
            </Stack>

            <TableContainer sx={{ maxHeight: 140 }}>
              <Table
                size="small"
                stickyHeader
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Проверка</TableCell>
                    <TableCell>Значение</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {gateRows.map(([label, value]) => (
                    <TableRow key={label}>
                      <TableCell>{label}</TableCell>
                      <TableCell>{value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TableContainer sx={{ maxHeight: "52dvh" }}>
              <Table
                size="small"
                stickyHeader
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Правило</TableCell>
                    <TableCell>Область</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Access</TableCell>
                    <TableCell>View</TableCell>
                    <TableCell>Edit</TableCell>
                    <TableCell>canAccess</TableCell>
                    <TableCell>canView</TableCell>
                    <TableCell>canEdit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleRules.map((rule) => (
                    <TableRow key={rule.key}>
                      <TableCell>
                        <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{rule.key}</Typography>
                        <Typography sx={{ fontSize: 12, color: "#666666" }}>
                          {rule.label}
                        </Typography>
                      </TableCell>
                      <TableCell>{rule.area}</TableCell>
                      <TableCell>{rule.status}</TableCell>
                      {["access", "view", "edit"].map((action) =>
                        (() => {
                          const accessKey = `${rule.key}_${action}`;
                          const isMissing = !Object.prototype.hasOwnProperty.call(
                            localAccess,
                            accessKey,
                          );

                          return (
                            <TableCell key={action}>
                              <TextField
                                type="number"
                                value={access[accessKey]}
                                inputProps={{ min: 0, max: 1 }}
                                helperText={isMissing ? "нет ключа" : " "}
                                onChange={(event) =>
                                  setAccessValue(rule.key, action, event.target.value)
                                }
                                sx={{ width: 86 }}
                              />
                            </TableCell>
                          );
                        })(),
                      )}
                      <TableCell>
                        <YesNo yes={accessCheck.canAccess(rule.key)} />
                      </TableCell>
                      <TableCell>
                        <YesNo yes={accessCheck.canView(rule.key)} />
                      </TableCell>
                      <TableCell>
                        <YesNo yes={accessCheck.canEdit(rule.key)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setIsAccessDirty(true);
              setLocalAccess((prev) => buildStaffScheduleAccessSkeleton(prev));
            }}
          >
            Добавить отсутствующие ключи
          </Button>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={applyChanges}
          >
            Применить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
