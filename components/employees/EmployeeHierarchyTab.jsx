import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SaveIcon from "@mui/icons-material/Save";
import EmployeeAppointmentHierarchyTree from "./EmployeeAppointmentHierarchyTree";

const getUnitPayloadItems = (items) =>
  items.map((item) => ({
    id: Number(item.id),
    level: Number(item.level ?? 0),
    sort: Number(item.sort ?? 0),
  }));

const getAppointmentPayloadItems = (items) =>
  items.map((item) => ({
    id: Number(item.id),
    group_key: String(item.group_key || ""),
    parent_group_key: item.parent_group_key ? String(item.parent_group_key) : null,
    group_sort: Number(item.group_sort ?? 0),
    sort: Number(item.sort ?? 0),
  }));

export default function EmployeeHierarchyTab({ request, showAlert }) {
  const [units, setUnits] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [tablesReady, setTablesReady] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState("all");

  const applyHierarchy = (hierarchy) => {
    setUnits(Array.isArray(hierarchy?.units) ? hierarchy.units : []);
    setAppointments(Array.isArray(hierarchy?.appointments) ? hierarchy.appointments : []);
    setTablesReady(Boolean(hierarchy?.tables_ready));
    setCanEdit(Boolean(hierarchy?.can_edit));
    setDirty(false);
  };

  const loadHierarchy = async () => {
    const response = await request("get_hierarchy");

    if (!response?.st) {
      showAlert(false, response?.text || "Не удалось загрузить иерархию");
      return;
    }

    applyHierarchy(response.hierarchy);
  };

  useEffect(() => {
    loadHierarchy();
  }, []);

  const handleAppointmentTreeChange = (nextAppointments) => {
    if (selectedUnitId === "all") {
      setAppointments(nextAppointments);
    } else {
      const nextAppointmentsById = new Map(nextAppointments.map((item) => [Number(item.id), item]));

      setAppointments((current) =>
        current.map((item) => nextAppointmentsById.get(Number(item.id)) || item),
      );
    }
    setDirty(true);
  };

  const displayedUnits =
    selectedUnitId === "all" ? units : units.filter((unit) => String(unit.id) === selectedUnitId);
  const displayedAppointments =
    selectedUnitId === "all"
      ? appointments
      : appointments.filter((item) => String(item.unit_id) === selectedUnitId);

  const saveHierarchy = async () => {
    const response = await request("save_hierarchy", {
      units: getUnitPayloadItems(units),
      appointments: getAppointmentPayloadItems(appointments),
    });

    if (!response?.st) {
      showAlert(false, response?.text || "Не удалось сохранить иерархию");
      return;
    }

    showAlert(true, response.text || "Иерархия сохранена");
    applyHierarchy(response.hierarchy);
  };

  return (
    <Stack spacing={2}>
      <Paper
        variant="outlined"
        sx={{ p: 2 }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="space-between"
        >
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 900 }}>Иерархия найма</Typography>
            <Typography sx={{ mt: 0.25, fontSize: 13, color: "text.secondary" }}>
              Все отделы и должности показаны в одном дереве. Виртуальный узел «Высший уровень»
              объединяет отделы и не сохраняется в справочниках.
            </Typography>
          </Box>
          <Stack
            direction="row"
            spacing={1}
          >
            <Button
              variant="outlined"
              startIcon={<RestartAltIcon />}
              disabled={!dirty}
              onClick={loadHierarchy}
            >
              Сбросить
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={!tablesReady || !canEdit || !dirty}
              onClick={saveHierarchy}
            >
              Сохранить
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {!tablesReady ? (
        <Alert severity="warning">
          Структура таблиц иерархии ещё не обновлена. До выполнения SQL редактор работает только как
          просмотр.
        </Alert>
      ) : null}

      {tablesReady && !canEdit ? (
        <Alert severity="info">
          Иерархия доступна только для просмотра. Для изменения требуется право редактирования
          иерархии должностей.
        </Alert>
      ) : null}

      <Alert severity="info">
        Перетащите должность в существующий блок, чтобы дать ей равные права, либо в область «Новая
        дочерняя ветка» под руководителем. Перенос между отделами недоступен. Для навигации включите
        режим руки; масштаб также меняется через Ctrl/⌘ + колесо.
      </Alert>

      <Paper
        variant="outlined"
        sx={{ p: 2 }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "flex-start", sm: "center" }}
          sx={{ mb: 1.5 }}
        >
          <AccountTreeOutlinedIcon color="primary" />
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 900 }}>Общее дерево отделов и должностей</Typography>
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
              Названия должностей отображаются полностью, параллельные ветки настраиваются внутри
              своего отдела
            </Typography>
          </Box>
          <FormControl
            size="small"
            sx={{ width: { xs: "100%", sm: 280 } }}
          >
            <InputLabel id="employee-hierarchy-unit-label">Отдел</InputLabel>
            <Select
              labelId="employee-hierarchy-unit-label"
              label="Отдел"
              value={selectedUnitId}
              onChange={(event) => setSelectedUnitId(event.target.value)}
            >
              <MenuItem value="all">Все отделы</MenuItem>
              {units.map((unit) => (
                <MenuItem
                  key={unit.id}
                  value={String(unit.id)}
                >
                  {unit.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Chip
            size="small"
            label={`${displayedUnits.length} отделов · ${displayedAppointments.length} должностей`}
          />
        </Stack>

        {displayedUnits.length ? (
          <EmployeeAppointmentHierarchyTree
            units={displayedUnits}
            items={displayedAppointments}
            disabled={!tablesReady || !canEdit}
            onChange={handleAppointmentTreeChange}
            onInvalid={(text) => showAlert(false, text)}
          />
        ) : (
          <Box sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>
            Нет отделов для отображения
          </Box>
        )}
      </Paper>
    </Stack>
  );
}
