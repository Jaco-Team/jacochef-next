import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import UndoIcon from "@mui/icons-material/Undo";
import EmployeeAppointmentHierarchyTree from "./EmployeeAppointmentHierarchyTree";
import EmployeeHierarchyList from "./EmployeeHierarchyList";
import EmployeePositionModal from "./EmployeePositionModal";
import EmployeeUnitModal from "./EmployeeUnitModal";

const getUnitPayloadItems = (items) =>
  items.map((item) => ({
    id: Number(item.id),
    level: Number(item.level ?? 0),
    sort: Number(item.sort ?? 0),
    parent_unit_id:
      item.parent_unit_id === null || item.parent_unit_id === undefined
        ? null
        : Number(item.parent_unit_id),
    parent_group_key: item.parent_group_key ? String(item.parent_group_key) : null,
  }));

const getAppointmentPayloadItems = (items) =>
  items.map((item) => ({
    id: Number(item.id),
    group_key: String(item.group_key || ""),
    parent_group_key: item.parent_group_key ? String(item.parent_group_key) : null,
    group_sort: Number(item.group_sort ?? 0),
    sort: Number(item.sort ?? 0),
    is_office: item.is_office ?? null,
  }));

export default function EmployeeHierarchyTab({ request, showAlert }) {
  const [units, setUnits] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [tablesReady, setTablesReady] = useState(false);
  const [officeFlagReady, setOfficeFlagReady] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [listSearch, setListSearch] = useState("");
  const [visibleListCount, setVisibleListCount] = useState(0);
  const [positionModal, setPositionModal] = useState(null);
  const [unitModal, setUnitModal] = useState(null);
  const [undoStack, setUndoStack] = useState([]);
  const [undoNoticeOpen, setUndoNoticeOpen] = useState(false);

  const applyHierarchy = (hierarchy) => {
    setUnits(Array.isArray(hierarchy?.units) ? hierarchy.units : []);
    setAppointments(Array.isArray(hierarchy?.appointments) ? hierarchy.appointments : []);
    setTablesReady(Boolean(hierarchy?.tables_ready));
    setOfficeFlagReady(Boolean(hierarchy?.office_flag_ready));
    setCanEdit(Boolean(hierarchy?.can_edit));
    setDirty(false);
    setUndoStack([]);
    setUndoNoticeOpen(false);
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

  const handleHierarchyTreeChange = (nextAppointments, nextUnits = units) => {
    setUndoStack((current) => [...current, { appointments, units }].slice(-20));

    if (selectedUnitId === "all") {
      setAppointments(nextAppointments);
      setUnits(nextUnits);
    } else {
      const nextAppointmentsById = new Map(nextAppointments.map((item) => [Number(item.id), item]));
      const nextUnitsById = new Map(nextUnits.map((item) => [Number(item.id), item]));

      setAppointments((current) =>
        current.map((item) => nextAppointmentsById.get(Number(item.id)) || item),
      );
      setUnits((current) => current.map((item) => nextUnitsById.get(Number(item.id)) || item));
    }
    setDirty(true);
    setUndoNoticeOpen(true);
  };

  const undoHierarchyChange = () => {
    setUndoStack((current) => {
      if (!current.length) return current;

      const previous = current[current.length - 1];
      const nextStack = current.slice(0, -1);

      setAppointments(previous.appointments);
      setUnits(previous.units);
      setDirty(nextStack.length > 0);
      setUndoNoticeOpen(false);

      return nextStack;
    });
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
              Список — для быстрого поиска и открытия должности. Дерево — для настройки связей,
              вложенных отделов и перетаскивания. Виртуальный узел «Высший уровень» не сохраняется в
              справочниках.
            </Typography>
          </Box>
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
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
              variant="outlined"
              startIcon={<UndoIcon />}
              disabled={!undoStack.length}
              onClick={undoHierarchyChange}
            >
              Отменить
            </Button>
            {canEdit ? (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setUnitModal({ unitId: null })}
              >
                Отдел
              </Button>
            ) : null}
            {canEdit ? (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setPositionModal({ positionId: null })}
              >
                Должность
              </Button>
            ) : null}
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

      {tablesReady && !officeFlagReady ? (
        <Alert severity="warning">
          Для настройки офисных должностей выполните миграцию `add_is_office_to_appointment_table`.
        </Alert>
      ) : null}

      {tablesReady && !canEdit ? (
        <Alert severity="info">
          Иерархия доступна только для просмотра. Для изменения требуется право редактирования
          иерархии должностей.
        </Alert>
      ) : null}

      {viewMode === "tree" ? (
        <Alert severity="info">
          Перетащите должность в существующий блок, чтобы поставить её на один уровень, либо в
          область «Новая дочерняя ветка». Отдел можно целиком вложить под группу должностей или
          вернуть на высший уровень; отдельные должности между отделами не переносятся. Для
          навигации включите режим руки; масштаб также меняется через Ctrl/⌘ + колесо.
        </Alert>
      ) : null}

      <Paper
        variant="outlined"
        sx={{ p: 2 }}
      >
        <Stack
          spacing={1.5}
          sx={{ mb: 2 }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            {viewMode === "tree" ? (
              <AccountTreeOutlinedIcon color="primary" />
            ) : (
              <FormatListBulletedIcon color="primary" />
            )}
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontWeight: 900 }}>
                {viewMode === "tree" ? "Общее дерево отделов и должностей" : "Список должностей"}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                {viewMode === "tree"
                  ? "Настройка связей, вложенных отделов и уровней подчинения"
                  : "Быстрый поиск и открытие карточек должностей"}
              </Typography>
            </Box>
            <Typography
              sx={{
                display: { xs: "none", sm: "block" },
                color: "text.secondary",
                fontSize: 12,
                whiteSpace: "nowrap",
              }}
            >
              {viewMode === "list"
                ? `Найдено: ${visibleListCount} из ${displayedAppointments.length}`
                : `${displayedUnits.length} отделов · ${displayedAppointments.length} должностей`}
            </Typography>
          </Stack>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            {viewMode === "list" ? (
              <TextField
                size="small"
                value={listSearch}
                onChange={(event) => setListSearch(event.target.value)}
                placeholder="Поиск по должности или отделу…"
                sx={{ minWidth: { md: 320 }, flex: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: listSearch ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        edge="end"
                        aria-label="Очистить поиск"
                        onClick={() => setListSearch("")}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />
            ) : (
              <Box sx={{ flex: 1 }} />
            )}
            <ToggleButtonGroup
              exclusive
              size="small"
              value={viewMode}
              onChange={(_, value) => {
                if (value) setViewMode(value);
              }}
              aria-label="Режим просмотра иерархии"
              fullWidth={false}
            >
              <ToggleButton value="list">Список</ToggleButton>
              <ToggleButton value="tree">Дерево</ToggleButton>
            </ToggleButtonGroup>
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
            >
              <FormControl
                size="small"
                sx={{ width: { xs: "100%", md: 240 } }}
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
              {selectedUnitId !== "all" ? (
                <Tooltip title="Редактировать отдел">
                  <span>
                    <IconButton
                      disabled={!canEdit}
                      onClick={() => setUnitModal({ unitId: Number(selectedUnitId) })}
                      aria-label="Редактировать отдел"
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              ) : null}
            </Stack>
          </Stack>
        </Stack>

        {!displayedUnits.length && !displayedAppointments.length ? (
          <Box sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>
            Нет отделов для отображения
          </Box>
        ) : viewMode === "list" ? (
          <EmployeeHierarchyList
            units={displayedUnits}
            items={displayedAppointments}
            canEdit={canEdit}
            search={listSearch}
            onVisibleCountChange={setVisibleListCount}
            onPositionClick={(position) => setPositionModal({ positionId: Number(position.id) })}
          />
        ) : (
          <EmployeeAppointmentHierarchyTree
            units={displayedUnits}
            items={displayedAppointments}
            disabled={!tablesReady || !canEdit}
            onChange={handleHierarchyTreeChange}
            onInvalid={(text) => showAlert(false, text)}
            onPositionClick={(position) => setPositionModal({ positionId: Number(position.id) })}
          />
        )}
      </Paper>

      <Snackbar
        open={undoNoticeOpen}
        autoHideDuration={5000}
        onClose={() => setUndoNoticeOpen(false)}
        message="Иерархия изменена"
        action={
          <Button
            color="inherit"
            size="small"
            onClick={undoHierarchyChange}
          >
            Отменить
          </Button>
        }
      />

      <EmployeePositionModal
        open={Boolean(positionModal)}
        positionId={positionModal?.positionId}
        canEdit={canEdit}
        request={request}
        showAlert={showAlert}
        onClose={() => setPositionModal(null)}
        onSaved={() => {
          setPositionModal(null);
          loadHierarchy();
        }}
      />
      <EmployeeUnitModal
        open={Boolean(unitModal)}
        unitId={unitModal?.unitId}
        canEdit={canEdit}
        request={request}
        showAlert={showAlert}
        onClose={() => setUnitModal(null)}
        onSaved={() => {
          setUnitModal(null);
          loadHierarchy();
        }}
      />
    </Stack>
  );
}
