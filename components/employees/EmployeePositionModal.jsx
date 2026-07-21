import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  Paper,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckIcon from "@mui/icons-material/Check";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { MyAutocomplite, MyTextInput } from "@/ui/Forms";
import useFullScreen from "@/src/hooks/useFullScreen";
import HistoryLog from "@/ui/history/HistoryLog";
import {
  SITE_ITEMS_NEW_MODULE_KEY,
  normalizeCategoryDisplayName,
  prepareSiteItemsFeatureGroups,
} from "@/components/site_items_new/site_items_access";

const normalizeMenu = (value) => {
  if (!Array.isArray(value)) return [];

  return value.map((parent) => ({
    ...parent,
    chaild: (parent.chaild ?? []).map((module) =>
      isLockedModule(module) ? { ...module, is_active: 1 } : module,
    ),
  }));
};

const serializeMenu = (value) =>
  normalizeMenu(value).map((parent) => ({
    chaild: (parent.chaild ?? []).map((module) => ({
      modul_id: Number(module.modul_id),
      key_query: String(module.key_query ?? ""),
      is_active: Number(module.is_active) === 1 ? 1 : 0,
      features: (module.features ?? []).map((feature) => ({
        id: Number(feature.id),
        is_active: Number(feature.is_active) === 1 ? 1 : 0,
        access: Number(feature.access) === 1 ? 1 : 0,
        view: Number(feature.view) === 1 ? 1 : 0,
        edit: Number(feature.edit) === 1 ? 1 : 0,
      })),
    })),
  }));

const serializePosition = (position) => ({
  id: position?.id ?? null,
  name: String(position?.name ?? ""),
  short_name: String(position?.short_name ?? ""),
  bonus: position?.bonus ?? 0,
  unit_id: position?.unit_id ?? null,
  is_graph: Number(position?.is_graph) === 1 ? 1 : 0,
  is_office:
    position?.is_office === null || position?.is_office === undefined
      ? null
      : Number(position.is_office) === 1
        ? 1
        : 0,
  can_manage_all_employees: Number(position?.can_manage_all_employees) === 1 ? 1 : 0,
});

const LOCKED_MODULE_KEYS = new Set(["lk", "home"]);

const isLockedModule = (module) => LOCKED_MODULE_KEYS.has(String(module?.key_query ?? ""));

const PERMISSION_FIELDS = [
  { key: "access", label: "Доступ", shortLabel: "Доступ" },
  { key: "view", label: "Просмотр", shortLabel: "Просмотр" },
  { key: "edit", label: "Редактирование", shortLabel: "Ред." },
];
const FILTERS = [
  { id: "all", label: "Все" },
  { id: "enabled", label: "Включённые" },
  { id: "with_rights", label: "С правами" },
  { id: "without_rights", label: "Без прав" },
];

const isModuleEnabled = (module) => Number(module?.is_active) === 1;

const grantedCount = (module) =>
  (module?.features ?? []).filter(
    (feature) =>
      Number(feature.access) === 1 || Number(feature.view) === 1 || Number(feature.edit) === 1,
  ).length;

const permissionCounts = (module) =>
  PERMISSION_FIELDS.reduce(
    (counts, field) => ({
      ...counts,
      [field.key]: (module?.features ?? []).filter(
        (feature) =>
          Number(feature[`allow_${field.key}`]) === 1 && Number(feature[field.key]) === 1,
      ).length,
    }),
    {},
  );

const permissionAll = (module) =>
  PERMISSION_FIELDS.reduce(
    (counts, field) => ({
      ...counts,
      [field.key]: (module?.features ?? []).filter(
        (feature) => Number(feature[`allow_${field.key}`]) === 1,
      ).length,
    }),
    {},
  );

const formatRightsCount = (count) => {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return `${count} прав`;
  if (lastDigit === 1) return `${count} право`;
  if (lastDigit >= 2 && lastDigit <= 4) return `${count} права`;

  return `${count} прав`;
};

const groupModuleFeatures = (features = [], moduleKey = "") => {
  if (String(moduleKey) === SITE_ITEMS_NEW_MODULE_KEY) {
    return prepareSiteItemsFeatureGroups(features);
  }

  const groups = [];
  const groupsByKey = new Map();

  features.forEach((feature, featureIndex) => {
    const category = String(feature.category ?? "").trim();
    const key = category || "__plain__";

    if (!groupsByKey.has(key)) {
      const group = {
        key,
        name: category ? normalizeCategoryDisplayName(feature.category_name || category) : "",
        items: [],
      };

      groupsByKey.set(key, group);
      groups.push(group);
    }

    groupsByKey.get(key).items.push({ feature, featureIndex });
  });

  return groups;
};

const moduleMatchesSearch = (module, query) =>
  String(module.name ?? "")
    .toLowerCase()
    .includes(query) ||
  (module.features ?? []).some((feature) =>
    String(feature.name ?? "")
      .toLowerCase()
      .includes(query),
  );

const moduleMatchesFilter = (module, filter) => {
  const enabled = isModuleEnabled(module);
  const granted = grantedCount(module);

  if (filter === "enabled") return enabled;
  if (filter === "with_rights") return granted > 0;
  if (filter === "without_rights") return enabled && granted === 0;

  return true;
};

const moduleStatus = (module) => {
  if (isLockedModule(module)) {
    return { label: "всегда включён", color: "info", variant: "outlined" };
  }

  if (!isModuleEnabled(module)) return { label: "выключен", color: "default", variant: "outlined" };

  const granted = grantedCount(module);

  if (!granted && (module?.features ?? []).length) {
    return { label: "требуются права", color: "warning", variant: "filled" };
  }

  return { label: "включён", color: "success", variant: "filled" };
};

const BufferedPositionInput = React.memo(function BufferedPositionInput({
  field,
  value,
  onDraftChange,
  ...props
}) {
  const [draft, setDraft] = useState(value ?? "");

  useEffect(() => {
    setDraft(value ?? "");
  }, [value]);

  return (
    <MyTextInput
      {...props}
      value={draft}
      func={(event) => {
        const nextValue = event.target.value;
        setDraft(nextValue);
        onDraftChange(field, nextValue);
      }}
    />
  );
});

function PermissionCell({ allowed, checked, disabled, onChange }) {
  if (!allowed) {
    return (
      <Box
        aria-label="Недоступно"
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          bgcolor: "grey.300",
          mx: "auto",
        }}
      />
    );
  }

  return (
    <IconButton
      size="small"
      disabled={disabled}
      aria-label={checked ? "Отключить право" : "Включить право"}
      onClick={onChange}
      sx={{
        width: 28,
        height: 28,
        border: 1.5,
        borderColor: checked ? "#d50032" : "grey.400",
        borderRadius: "50%",
        bgcolor: checked ? "#d50032" : "transparent",
        color: checked ? "#fff" : "transparent",
        "&:hover": {
          bgcolor: checked ? "#b4002a" : "action.hover",
          borderColor: checked ? "#b4002a" : "grey.600",
        },
        "&.Mui-disabled": {
          borderColor: checked ? "#d50032" : "grey.300",
          bgcolor: checked ? "#d50032" : "transparent",
          opacity: checked ? 0.55 : 0.7,
        },
      }}
    >
      {checked ? <CheckIcon sx={{ fontSize: 17 }} /> : null}
    </IconButton>
  );
}

function ModuleAccessCard({
  module,
  canEdit,
  onToggleModule,
  onUpdateFeature,
  expanded,
  onToggleExpanded,
}) {
  const locked = isLockedModule(module);
  const enabled = locked || isModuleEnabled(module);
  const status = moduleStatus(module);
  const rights = permissionCounts(module);
  const rightsAll = permissionAll(module);
  const rightsTotal = rights.access + rights.view + rights.edit;
  const featureGroups = groupModuleFeatures(module.features, module.key_query);
  const hasCategories = featureGroups.some((group) => group.name);
  const hasFeatures = (module.features ?? []).length > 0;

  const renderFeatureRows = (items) =>
    items.map(({ feature, featureIndex }) => (
      <Grid
        container
        key={`${feature.id}-${featureIndex}`}
        alignItems="center"
        sx={{
          minHeight: 44,
          borderTop: 1,
          borderColor: "divider",
          transition: "background-color 120ms ease",
          "&:hover": { bgcolor: "#f8fafc" },
        }}
      >
        <Grid size={6}>
          <Typography sx={{ px: 1.5, fontSize: 14, fontWeight: 500 }}>{feature.name}</Typography>
        </Grid>
        {PERMISSION_FIELDS.map((field) => (
          <Grid
            key={field.key}
            size={2}
            sx={{ textAlign: "center" }}
          >
            <PermissionCell
              allowed={Number(feature[`allow_${field.key}`]) === 1}
              checked={Number(feature[field.key]) === 1}
              disabled={!canEdit}
              onChange={() =>
                onUpdateFeature(featureIndex, field.key, Number(feature[field.key]) !== 1)
              }
            />
          </Grid>
        ))}
      </Grid>
    ));

  const renderPermissionHeader = (items, groupLabel = "параметров") => (
    <Grid
      container
      alignItems="center"
      sx={{ minHeight: 52, borderTop: 1, borderColor: "divider", bgcolor: "#f8fafc" }}
    >
      <Grid size={6}>
        <Typography sx={{ px: 1.5, color: "text.secondary", fontSize: 12, fontWeight: 700 }}>
          Параметр
        </Typography>
      </Grid>
      {PERMISSION_FIELDS.map((field) => {
        const applicable = items.filter(
          ({ feature }) => Number(feature[`allow_${field.key}`]) === 1,
        );
        const enabledCount = applicable.filter(
          ({ feature }) => Number(feature[field.key]) === 1,
        ).length;
        const allEnabled = applicable.length > 0 && enabledCount === applicable.length;
        const nextAction = allEnabled ? "Отключить" : "Включить";

        return (
          <Grid
            key={field.key}
            size={2}
            sx={{ textAlign: "center" }}
          >
            <Stack
              direction="row"
              spacing={0.15}
              alignItems="center"
              justifyContent="center"
            >
              <Typography
                sx={{ color: "text.secondary", fontSize: 11, fontWeight: 700, letterSpacing: 0.2 }}
              >
                {field.shortLabel}
              </Typography>
              <Tooltip
                title={`${nextAction} «${field.label}» для всех доступных параметров раздела «${groupLabel}»`}
              >
                <span>
                  <Checkbox
                    size="small"
                    checked={allEnabled}
                    indeterminate={enabledCount > 0 && !allEnabled}
                    disabled={!canEdit || applicable.length === 0}
                    onChange={() => {
                      const nextValue = !allEnabled;
                      applicable.forEach(({ featureIndex }) =>
                        onUpdateFeature(featureIndex, field.key, nextValue),
                      );
                    }}
                    inputProps={{
                      "aria-label": `${nextAction} ${field.label} для всех параметров раздела ${groupLabel}`,
                    }}
                    sx={{
                      p: 0.5,
                      "&.Mui-checked, &.MuiCheckbox-indeterminate": { color: "#d50032" },
                    }}
                  />
                </span>
              </Tooltip>
            </Stack>
            <Typography sx={{ mt: -0.5, color: "text.disabled", fontSize: 10, lineHeight: 1 }}>
              {enabledCount}/{applicable.length}
            </Typography>
          </Grid>
        );
      })}
    </Grid>
  );

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2.5,
        overflow: "hidden",
        borderColor: expanded ? "rgba(213, 0, 50, 0.2)" : "#e2e8f0",
        transition: "border-color 150ms ease",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ px: { xs: 1, sm: 1.5 }, py: 1.25, minHeight: 56 }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ flex: 1, minWidth: 0 }}
        >
          <Switch
            checked={enabled}
            disabled={!canEdit || locked}
            onChange={(event) => onToggleModule(event.target.checked, module)}
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: "#d50032",
                "& + .MuiSwitch-track": { bgcolor: "#d50032" },
              },
            }}
          />
          <Typography
            noWrap
            sx={{ fontWeight: 600, minWidth: 0, fontSize: 15 }}
          >
            {module.name}
          </Typography>
          <Chip
            size="small"
            label={status.label}
            sx={{
              height: 22,
              fontSize: 10,
              letterSpacing: 0.35,
              borderRadius: "999px",
              bgcolor:
                status.label === "включён"
                  ? "#e6f9f1"
                  : status.label === "выключен"
                    ? "#f1f5f9"
                    : status.label === "требуются права"
                      ? "#fff7e6"
                      : "#eef6ff",
              color:
                status.label === "включён"
                  ? "#059669"
                  : status.label === "выключен"
                    ? "#64748b"
                    : status.label === "требуются права"
                      ? "#b45309"
                      : "#2563eb",
            }}
          />
          {hasFeatures ? (
            <Typography
              noWrap
              sx={{ color: "text.secondary", fontSize: 12, display: { xs: "none", sm: "block" } }}
            >
              • {formatRightsCount(rightsTotal)}
            </Typography>
          ) : null}
        </Stack>
        {hasFeatures ? (
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={onToggleExpanded}
            sx={{ flexShrink: 0, borderColor: "#e2e8f0", borderRadius: 2, color: "#475569" }}
          >
            {expanded ? "Свернуть" : "Настроить права"}
          </Button>
        ) : null}
      </Stack>
      {hasFeatures && grantedCount(module) > 0 ? (
        <Typography
          sx={{
            px: { xs: 1, sm: 1.5 },
            pb: expanded ? 2 : 1,
            pl: { xs: 7, sm: 8 },
            color: "text.secondary",
            fontSize: 11,
          }}
        >
          Доступ: {rights.access}/{rightsAll.access} · Просмотр: {rights.view}/{rightsAll.view} ·
          Редактирование: {rights.edit}/{rightsAll.edit}
        </Typography>
      ) : null}
      {hasFeatures ? (
        <Collapse
          in={expanded}
          unmountOnExit
        >
          <Divider />
          <Box sx={{ px: { xs: 1, sm: 1.5 }, py: 1.25 }}>
            {featureGroups.map((group) => {
              if (!hasCategories) {
                return (
                  <Box key={group.key}>
                    {renderPermissionHeader(group.items, module.name)}
                    {renderFeatureRows(group.items)}
                  </Box>
                );
              }

              const configured = group.items.filter(({ feature }) =>
                PERMISSION_FIELDS.some(
                  (field) =>
                    Number(feature[`allow_${field.key}`]) === 1 && Number(feature[field.key]) === 1,
                ),
              ).length;
              const total = group.items.length;
              const status =
                configured === total
                  ? { label: "Все настроено", color: "#047857", bgcolor: "#ecfdf5" }
                  : configured > 0
                    ? { label: "Настроено частично", color: "#9a6700", bgcolor: "#fff7d6" }
                    : { label: "Не настроено", color: "#64748b", bgcolor: "#f1f5f9" };
              const accordionId = `module-${module.modul_id ?? module.key_query ?? "rights"}-${String(
                group.key,
              ).replace(/[^a-zA-Z0-9_-]/g, "-")}`;

              return (
                <Accordion
                  key={group.key}
                  disableGutters
                  elevation={0}
                  slotProps={{
                    transition: { unmountOnExit: true },
                    heading: { component: "h4" },
                  }}
                  sx={{
                    mt: 1,
                    border: "1px solid",
                    borderColor: "#e2e8f0",
                    borderRadius: "8px!important",
                    overflow: "hidden",
                    "&:before": { display: "none" },
                    "&.Mui-expanded": {
                      borderColor: "rgba(213, 0, 50, 0.3)",
                      boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
                    },
                  }}
                >
                  <AccordionSummary
                    id={`${accordionId}-header`}
                    aria-controls={`${accordionId}-content`}
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      px: 1.5,
                      minHeight: 64,
                      transition: "background-color 120ms ease",
                      "&:hover": { bgcolor: "#f8fafc" },
                      "&.Mui-expanded": {
                        minHeight: 64,
                        bgcolor: "#fff",
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      },
                      "& .MuiAccordionSummary-content": { my: 1 },
                      "& .MuiAccordionSummary-content.Mui-expanded": { my: 1 },
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ width: "100%", pr: 1 }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                          {group.name || "Общие права"}
                        </Typography>
                        <Typography
                          sx={{ mt: 0.15, color: status.color, fontSize: 12, fontWeight: 500 }}
                        >
                          {status.label}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={`${configured}/${total}`}
                        sx={{
                          height: 24,
                          flexShrink: 0,
                          color: status.color,
                          bgcolor: status.bgcolor,
                          fontWeight: 700,
                          "& .MuiChip-label": { px: 1 },
                        }}
                      />
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails
                    id={`${accordionId}-content`}
                    sx={{ p: 0 }}
                  >
                    {renderPermissionHeader(group.items, group.name || "Общие права")}
                    {renderFeatureRows(group.items)}
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        </Collapse>
      ) : null}
    </Paper>
  );
}

export default function EmployeePositionModal({
  open,
  positionId,
  canEdit,
  request,
  showAlert,
  onClose,
  onSaved,
}) {
  const [position, setPosition] = useState(null);
  const [units, setUnits] = useState([]);
  const [fullMenu, setFullMenu] = useState([]);
  const [copyName, setCopyName] = useState("");
  const [copyDialog, setCopyDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteUsers, setDeleteUsers] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyDialog, setHistoryDialog] = useState(false);
  const [closeDialog, setCloseDialog] = useState(false);
  const [sectionKey, setSectionKey] = useState("all");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedKeys, setExpandedKeys] = useState(() => new Set());
  const [dirty, setDirty] = useState(false);
  const positionDraftRef = useRef(null);
  const searchRef = useRef(null);
  const contentScrollRef = useRef(null);
  const accessToolbarRef = useRef(null);
  const modulesAnchorRef = useRef(null);
  const skipSectionScrollResetRef = useRef(true);
  const fullScreen = useFullScreen();

  const scrollToModuleList = () => {
    const container = contentScrollRef.current;
    const toolbar = accessToolbarRef.current;
    const anchor = modulesAnchorRef.current;

    if (!container || !toolbar || !anchor) return;

    const top =
      anchor.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop -
      toolbar.offsetHeight;

    container.scrollTo({ top: Math.max(0, top), behavior: "auto" });
  };

  const selectSection = (key) => {
    setSectionKey(key);
    setExpandedKeys(new Set());
  };

  const selectFilter = (value) => {
    if (search.trim()) return;

    setFilter(value);
    setExpandedKeys(new Set());
    requestAnimationFrame(scrollToModuleList);
  };

  useEffect(() => {
    if (!open) {
      positionDraftRef.current = null;
      setPosition(null);
      setFullMenu([]);
      setDirty(false);
      setSearch("");
      setFilter("all");
      setExpandedKeys(new Set());
      setCloseDialog(false);
      setHistory([]);
      setHistoryDialog(false);
      skipSectionScrollResetRef.current = true;
      return;
    }

    const load = async () => {
      const response = await request(
        positionId ? "get_position" : "get_position_for_new",
        positionId ? { position_id: positionId } : {},
      );

      if (!response?.st) {
        showAlert(false, response?.text || "Не удалось загрузить должность");
        onClose();
        return;
      }

      positionDraftRef.current = response.position;
      setPosition(response.position);
      setUnits(Array.isArray(response.units) ? response.units : []);
      setFullMenu(normalizeMenu(response.full_menu));
      setHistory(
        (Array.isArray(response.history) ? response.history : []).map((item) => ({
          ...item,
          actor_name: item.actor_name || item.actor_name2 || "—",
        })),
      );
      setCopyName(positionId ? `${response.position?.name || ""} (копия)` : "");
      setDeleteUsers([]);
      setSectionKey("all");
      setExpandedKeys(new Set());
      setDirty(false);
    };

    load();
  }, [open, positionId]);

  useEffect(() => {
    if (!open || !position) return;

    if (skipSectionScrollResetRef.current) {
      skipSectionScrollResetRef.current = false;
      return;
    }

    const frame = requestAnimationFrame(scrollToModuleList);

    return () => cancelAnimationFrame(frame);
  }, [sectionKey, open]);

  const sections = useMemo(
    () =>
      fullMenu.map((parent, parentIndex) => {
        const modules = parent.chaild ?? [];

        return {
          key: `section-${parent.parent?.id ?? parentIndex}`,
          parentIndex,
          name: parent.parent?.name ?? "Без названия",
          total: modules.length,
          enabled: modules.filter(isModuleEnabled).length,
        };
      }),
    [fullMenu],
  );

  const selectedSectionName = useMemo(() => {
    if (sectionKey === "all") return "Все разделы";

    return sections.find((section) => section.key === sectionKey)?.name || "Выбранный раздел";
  }, [sectionKey, sections]);

  const hasSearch = Boolean(search.trim());

  const filterCounts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const modules = [];

    fullMenu.forEach((parent, parentIndex) => {
      const currentSectionKey = `section-${parent.parent?.id ?? parentIndex}`;

      if (!query && sectionKey !== "all" && currentSectionKey !== sectionKey) {
        return;
      }

      (parent.chaild ?? []).forEach((module) => {
        if (query && !moduleMatchesSearch(module, query)) return;
        modules.push(module);
      });
    });

    return {
      all: modules.length,
      enabled: modules.filter(isModuleEnabled).length,
      with_rights: modules.filter((module) => grantedCount(module) > 0).length,
      without_rights: modules.filter(
        (module) => isModuleEnabled(module) && grantedCount(module) === 0,
      ).length,
    };
  }, [fullMenu, search, sectionKey]);

  const visibleModules = useMemo(() => {
    const query = search.trim().toLowerCase();
    const rows = [];

    fullMenu.forEach((parent, parentIndex) => {
      const currentSectionKey = `section-${parent.parent?.id ?? parentIndex}`;

      if (!query && sectionKey !== "all" && currentSectionKey !== sectionKey) {
        return;
      }

      (parent.chaild ?? []).forEach((module, childIndex) => {
        if (query && !moduleMatchesSearch(module, query)) return;

        if (!query && !moduleMatchesFilter(module, filter)) return;

        rows.push({
          parentIndex,
          childIndex,
          sectionKey: currentSectionKey,
          sectionName: parent.parent?.name ?? "Без названия",
          module,
        });
      });
    });

    return rows;
  }, [filter, fullMenu, search, sectionKey]);

  const groupedModules = useMemo(() => {
    const groups = [];

    visibleModules.forEach((row) => {
      const last = groups[groups.length - 1];

      if (last?.sectionKey === row.sectionKey) {
        last.rows.push(row);
      } else {
        groups.push({
          sectionKey: row.sectionKey,
          sectionName: row.sectionName,
          rows: [row],
        });
      }
    });

    return groups;
  }, [visibleModules]);

  const enabledTotal = useMemo(
    () => sections.reduce((sum, section) => sum + section.enabled, 0),
    [sections],
  );
  const modulesTotal = useMemo(
    () => sections.reduce((sum, section) => sum + section.total, 0),
    [sections],
  );

  const updatePosition = (key, value) => {
    positionDraftRef.current = { ...(positionDraftRef.current ?? position), [key]: value };
    setDirty(true);
    setPosition((current) => ({ ...current, [key]: value }));
  };
  const updatePositionDraft = React.useCallback((key, value) => {
    positionDraftRef.current = { ...(positionDraftRef.current ?? {}), [key]: value };
    React.startTransition(() => setDirty(true));
  }, []);
  const updateModule = (parentIndex, childIndex, key, value) => {
    setDirty(true);
    setFullMenu((current) => {
      return current.map((parent, currentParentIndex) =>
        currentParentIndex !== parentIndex
          ? parent
          : {
              ...parent,
              chaild: parent.chaild.map((module, currentChildIndex) => {
                if (currentChildIndex !== childIndex) return module;
                if (key === "is_active" && !value && isLockedModule(module)) return module;

                return { ...module, [key]: value };
              }),
            },
      );
    });
  };
  const updateFeature = (parentIndex, childIndex, featureIndex, key, value) => {
    setDirty(true);
    setFullMenu((current) =>
      current.map((parent, currentParentIndex) =>
        currentParentIndex !== parentIndex
          ? parent
          : {
              ...parent,
              chaild: parent.chaild.map((module, currentChildIndex) => {
                if (currentChildIndex !== childIndex) return module;

                const nextModule = {
                  ...module,
                  features: module.features.map((feature, currentFeatureIndex) =>
                    currentFeatureIndex !== featureIndex
                      ? feature
                      : { ...feature, [key]: value ? 1 : 0 },
                  ),
                };

                if (value && Number(module.is_active) !== 1) {
                  nextModule.is_active = 1;
                }

                return nextModule;
              }),
            },
      ),
    );
  };

  const setModulesEnabled = (rows, value) => {
    setDirty(true);
    setFullMenu((current) => {
      const moduleKeys = new Set(rows.map((row) => `${row.parentIndex}-${row.childIndex}`));

      return current.map((parent, parentIndex) => ({
        ...parent,
        chaild: parent.chaild.map((module, childIndex) => {
          if (!moduleKeys.has(`${parentIndex}-${childIndex}`)) return module;
          if (!value && isLockedModule(module)) return { ...module, is_active: 1 };

          return { ...module, is_active: value ? 1 : 0 };
        }),
      }));
    });
  };

  const toggleModule = (parentIndex, childIndex, value, module) => {
    if (!value && isLockedModule(module)) return;

    updateModule(parentIndex, childIndex, "is_active", value ? 1 : 0);
  };

  const save = async () => {
    const response = await request("save_position", {
      position: serializePosition(positionDraftRef.current ?? position),
      full_menu: serializeMenu(fullMenu),
    });

    if (!response?.st) {
      showAlert(false, response?.text || "Не удалось сохранить должность");
      return;
    }

    showAlert(true, response.text || "Должность сохранена");
    setDirty(false);
    onSaved();
  };

  const copy = async () => {
    const response = await request("copy_position", { position_id: position?.id, name: copyName });

    if (!response?.st) {
      showAlert(false, response?.text || "Не удалось скопировать должность");
      return;
    }

    setCopyDialog(false);
    showAlert(true, response.text || "Должность скопирована");
    onSaved();
  };

  const openDelete = async () => {
    const response = await request("get_position_delete_info", { position_id: position?.id });

    if (!response?.st) {
      showAlert(false, response?.text || "Не удалось проверить должность");
      return;
    }

    setDeleteUsers(Array.isArray(response.users) ? response.users : []);
    setDeleteDialog(true);
  };

  const remove = async () => {
    const response = await request("delete_position", { position_id: position?.id });

    if (!response?.st) {
      showAlert(false, response?.text || "Не удалось удалить должность");
      return;
    }

    setDeleteDialog(false);
    showAlert(true, response.text || "Должность удалена");
    onSaved();
  };

  const requestClose = () => {
    if (dirty) {
      setCloseDialog(true);
      return;
    }

    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={requestClose}
        fullWidth
        maxWidth="lg"
        fullScreen={fullScreen}
        PaperProps={{
          sx: {
            display: "flex",
            flexDirection: "column",
            height: fullScreen ? "100%" : { xs: "calc(100dvh - 16px)", md: "min(90vh, 860px)" },
            maxHeight: "none",
            overflow: "hidden",
            borderRadius: fullScreen ? 0 : 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            borderBottom: 1,
            borderColor: "#e2e8f0",
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ minWidth: 0 }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                component="div"
                variant="h6"
                noWrap
                sx={{ fontWeight: 600, color: "#0f172a" }}
              >
                {position?.id ? position.name || "Должность" : "Новая должность"}
              </Typography>
            </Box>
            {dirty ? (
              <Chip
                color="warning"
                size="small"
                label="Есть изменения"
              />
            ) : null}
          </Stack>
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{ flexShrink: 0 }}
          >
            {position?.id ? (
              <>
                <Tooltip title="История изменений">
                  <IconButton
                    onClick={() => setHistoryDialog(true)}
                    sx={{ display: { xs: "inline-flex", sm: "none" } }}
                  >
                    <HistoryOutlinedIcon />
                  </IconButton>
                </Tooltip>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<HistoryOutlinedIcon />}
                  onClick={() => setHistoryDialog(true)}
                  sx={{
                    display: { xs: "none", sm: "inline-flex" },
                    borderColor: "#e2e8f0",
                    color: "#64748b",
                    borderRadius: 2,
                  }}
                >
                  История
                </Button>
              </>
            ) : null}
            <IconButton onClick={requestClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent
          ref={contentScrollRef}
          sx={{
            p: 0,
            flex: "1 1 auto",
            minHeight: 0,
            overflowY: "auto",
          }}
        >
          {!position ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              sx={{ minHeight: 240 }}
            >
              <CircularProgress />
            </Stack>
          ) : (
            <>
              <Box
                sx={{ px: 3, py: 2, backgroundColor: "#fff" }}
                style={{ borderBottom: "1px solid #f1f5f9" }}
              >
                <Grid
                  container
                  spacing={2}
                >
                  <Grid size={{ xs: 12, md: 3 }}>
                    <BufferedPositionInput
                      field="name"
                      label="Название должности"
                      value={position.name ?? ""}
                      disabled={!canEdit}
                      sx={{ backgroundColor: "#fff" }}
                      onDraftChange={updatePositionDraft}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <BufferedPositionInput
                      field="short_name"
                      label="Краткое название"
                      sx={{ backgroundColor: "#fff" }}
                      value={position.short_name ?? ""}
                      disabled={!canEdit}
                      onDraftChange={updatePositionDraft}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <BufferedPositionInput
                      field="bonus"
                      label="Бонус (₽)"
                      sx={{ backgroundColor: "#fff" }}
                      type="number"
                      value={position.bonus ?? 0}
                      disabled={!canEdit}
                      onDraftChange={updatePositionDraft}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <MyAutocomplite
                      label="Отдел"
                      data={units}
                      sx={{ backgroundColor: "#fff" }}
                      value={
                        units.find((unit) => Number(unit.id) === Number(position.unit_id)) || null
                      }
                      disabled={!canEdit}
                      multiple={false}
                      func={(_, value) => updatePosition("unit_id", value?.id ?? null)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 12 }}>
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{ minHeight: 40, alignItems: "center", flexWrap: "wrap" }}
                    >
                      <Stack
                        direction="row"
                        spacing={0.25}
                        alignItems="center"
                      >
                        <Checkbox
                          size="small"
                          checked={Number(position.is_graph) === 1}
                          disabled={!canEdit}
                          sx={{ "&.Mui-checked": { color: "#d50032" } }}
                          onChange={(event) =>
                            updatePosition("is_graph", event.target.checked ? 1 : 0)
                          }
                        />
                        <Typography sx={{ fontSize: 14 }}>Нужен в графике работы</Typography>
                      </Stack>
                      <Stack
                        direction="row"
                        spacing={0.25}
                        alignItems="center"
                      >
                        <Checkbox
                          size="small"
                          checked={Number(position.is_office) === 1}
                          disabled={!canEdit}
                          sx={{ "&.Mui-checked": { color: "#d50032" } }}
                          onChange={(event) =>
                            updatePosition("is_office", event.target.checked ? 1 : 0)
                          }
                        />
                        <Typography sx={{ fontSize: 14 }}>Офисная должность</Typography>
                      </Stack>
                      <Tooltip title="Может видеть и нанимать сотрудников любых должностей и кафе, кроме самого себя">
                        <Stack
                          direction="row"
                          spacing={0.25}
                          alignItems="center"
                        >
                          <Checkbox
                            size="small"
                            checked={Number(position.can_manage_all_employees) === 1}
                            disabled={!canEdit}
                            sx={{ "&.Mui-checked": { color: "#d50032" } }}
                            onChange={(event) =>
                              updatePosition(
                                "can_manage_all_employees",
                                event.target.checked ? 1 : 0,
                              )
                            }
                          />
                          <Typography sx={{ fontSize: 14 }}>
                            Управляет всеми сотрудниками
                          </Typography>
                        </Stack>
                      </Tooltip>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>

              <Box
                sx={{
                  minHeight: { xs: "auto", md: "calc(100vh - 280px)" },
                  backgroundColor: "#f8fafc80",
                }}
              >
                <Grid container>
                  <Grid
                    size={{ xs: 12, md: 3 }}
                    sx={{
                      borderRight: { md: "1px solid #f1f5f9" },
                      borderBottom: { xs: 1, md: 0 },
                      borderColor: "#f1f5f9",
                      position: { md: "sticky" },
                      top: { md: 13 },
                      alignSelf: { md: "flex-start" },
                      maxHeight: { md: "calc(100vh - 220px)" },
                      overflowX: { xs: "auto", md: "hidden" },
                      overflowY: { md: "auto" },
                      backgroundColor: "#f8fafc80",
                    }}
                  >
                    <List
                      dense
                      sx={{
                        display: { xs: "flex", md: "block" },
                        backgroundColor: "#f8fafc80",
                        width: { xs: "max-content", md: "auto" },
                      }}
                    >
                      <ListItemButton
                        selected={sectionKey === "all"}
                        onClick={() => selectSection("all")}
                        sx={{
                          flex: { xs: "0 0 auto", md: "initial" },
                          px: 1.5,
                          py: 0.75,
                          m: 1,
                          borderRadius: "12px",
                          color: sectionKey === "all" ? "#d50032" : "#45556c",
                          "&.Mui-selected": {
                            bgcolor: "white",
                            border: "1px solid #e2e8f0",
                            color: "#d50032",
                            boxShadow:
                              "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
                          },
                          "&:hover": {
                            bgcolor: "#fff!important",
                            borderColor: "#e2e8f0",
                            boxShadow: "0 2px 7px rgba(15, 23, 42, 0.1)",
                          },
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontSize: 14, fontWeight: 500, color: "inherit" }}>
                            Все разделы 11
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={`${enabledTotal}/${modulesTotal}`}
                          sx={{
                            height: 22,
                            borderRadius: "999px",
                            bgcolor: sectionKey === "all" ? "#d5003210" : "#f1f5f9",
                            color: sectionKey === "all" ? "#d50032" : "#64748b",
                          }}
                        />
                      </ListItemButton>
                      {sections.map((section) => (
                        <ListItemButton
                          key={section.key}
                          selected={sectionKey === section.key}
                          onClick={() => selectSection(section.key)}
                          sx={{
                            flex: { xs: "0 0 auto", md: "initial" },
                            px: 1.5,
                            py: 0.75,
                            m: 1,
                            borderRadius: "12px",
                            color: sectionKey === section.key ? "#d50032" : "#45556c",
                            "&.Mui-selected": {
                              bgcolor: "transparent",
                              color: "#d50032",
                              fontSize: "0.875rem!important",
                              fontWeight: 500,
                              border: "1px solid #e2e8f0",
                              boxShadow:
                                "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
                            },
                            "&:hover": {
                              bgcolor: "#fff!important",
                              borderColor: "#e2e8f0",
                              boxShadow: "0 2px 7px rgba(15, 23, 42, 0.1)",
                            },
                          }}
                        >
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              noWrap
                              sx={{ fontSize: 14, fontWeight: 500, color: "inherit" }}
                            >
                              {section.name}
                            </Typography>
                          </Box>
                          <Chip
                            size="small"
                            label={`${section.enabled}/${section.total}`}
                            sx={{
                              height: 22,
                              borderRadius: "999px",
                              bgcolor: sectionKey === section.key ? "#d5003210" : "#f1f5f9",
                              color: sectionKey === section.key ? "#d50032" : "#64748b",
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Grid>

                  <Grid
                    size={{ xs: 12, md: 9 }}
                    sx={{ backgroundColor: "#fff" }}
                  >
                    <Box
                      ref={accessToolbarRef}
                      sx={{
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                        backgroundColor: "#fff",
                        borderBottom: 1,
                        borderColor: "#e2e8f0",
                      }}
                    >
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        justifyContent="space-between"
                        spacing={1}
                        sx={{ px: 2, py: 1.5 }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ flexWrap: "wrap", gap: 1 }}
                        >
                          {FILTERS.map((item) => (
                            <Chip
                              key={item.id}
                              size="small"
                              label={`${item.label} (${filterCounts[item.id] ?? 0})`}
                              disabled={hasSearch}
                              onClick={() => selectFilter(item.id)}
                              sx={{
                                backgroundColor: filter === item.id ? "#d50032" : "#f1f5f9",
                                border: "none",
                                color: filter === item.id ? "#fff" : "#64748b",
                                borderRadius: "999px",
                                fontWeight: 400,
                              }}
                            />
                          ))}
                        </Stack>
                        <Box sx={{ width: { xs: "100%", sm: 250 } }}>
                          <TextField
                            inputRef={searchRef}
                            size="small"
                            fullWidth
                            placeholder="Найти модуль..."
                            value={search}
                            onChange={(event) => {
                              setSearch(event.target.value);
                              setExpandedKeys(new Set());
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SearchIcon fontSize="small" />
                                </InputAdornment>
                              ),
                              endAdornment: search ? (
                                <InputAdornment position="end">
                                  <IconButton
                                    aria-label="Очистить поиск"
                                    edge="end"
                                    size="small"
                                    onClick={() => setSearch("")}
                                  >
                                    <CloseIcon fontSize="small" />
                                  </IconButton>
                                </InputAdornment>
                              ) : null,
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                                bgcolor: "#fff",
                                "& fieldset": { borderColor: "#e2e8f0" },
                                "&:hover fieldset": { borderColor: "#cbd5e1" },
                                "&.Mui-focused fieldset": { borderColor: "#d50032" },
                              },
                            }}
                          />
                        </Box>
                      </Stack>
                    </Box>
                    <Box
                      ref={modulesAnchorRef}
                      sx={{ p: 2 }}
                    >
                      {groupedModules.length === 0 ? (
                        <Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
                          <Typography sx={{ fontWeight: 700 }}>Ничего не найдено</Typography>
                          <Typography sx={{ mt: 0.5, fontSize: 13 }}>
                            {hasSearch
                              ? "Попробуйте другой запрос или очистите поиск."
                              : "Измените фильтр или выберите другой раздел."}
                          </Typography>
                        </Box>
                      ) : (
                        <Stack spacing={2}>
                          {groupedModules.map((group) => (
                            <Box key={`group-${group.sectionKey}`}>
                              <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                spacing={1}
                                sx={{ mb: 0.75 }}
                              >
                                <Typography
                                  sx={{ color: "text.secondary", fontSize: 12, fontWeight: 600 }}
                                >
                                  {group.sectionName}
                                </Typography>
                                {canEdit ? (
                                  <Stack
                                    direction="row"
                                    spacing={0.5}
                                  >
                                    <Button
                                      color="inherit"
                                      size="small"
                                      onClick={() => setModulesEnabled(group.rows, true)}
                                    >
                                      Включить всё
                                    </Button>
                                    <Button
                                      color="inherit"
                                      size="small"
                                      onClick={() => setModulesEnabled(group.rows, false)}
                                    >
                                      Выключить всё
                                    </Button>
                                  </Stack>
                                ) : null}
                              </Stack>

                              <Stack spacing={1}>
                                {group.rows.map(({ parentIndex, childIndex, module }) => {
                                  const key = `${parentIndex}-${childIndex}`;

                                  return (
                                    <ModuleAccessCard
                                      key={`module-${key}-${module.id ?? module.modul_id}`}
                                      module={module}
                                      canEdit={canEdit}
                                      expanded={expandedKeys.has(key)}
                                      onToggleExpanded={() =>
                                        setExpandedKeys((current) => {
                                          const next = new Set(current);
                                          if (next.has(key)) next.delete(key);
                                          else next.add(key);
                                          return next;
                                        })
                                      }
                                      onToggleModule={(value, currentModule) =>
                                        toggleModule(parentIndex, childIndex, value, currentModule)
                                      }
                                      onUpdateFeature={(featureIndex, permission, value) =>
                                        updateFeature(
                                          parentIndex,
                                          childIndex,
                                          featureIndex,
                                          permission,
                                          value,
                                        )
                                      }
                                    />
                                  );
                                })}
                              </Stack>
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            flexShrink: 0,
            px: 3,
            py: 1.5,
            borderTop: 1,
            borderColor: "#e2e8f0",
          }}
        >
          {position?.id && canEdit ? (
            <>
              <Button
                color="error"
                startIcon={<DeleteOutlineIcon />}
                onClick={openDelete}
              >
                Удалить должность
              </Button>
              <Button
                startIcon={<ContentCopyIcon />}
                onClick={() => setCopyDialog(true)}
                sx={{ color: "#64748b" }}
              >
                Копировать
              </Button>
            </>
          ) : null}
          <Box sx={{ flex: 1 }} />
          <Button
            variant="outlined"
            onClick={requestClose}
            sx={{ borderColor: "#e2e8f0", borderRadius: 2, color: "#475569" }}
          >
            Закрыть
          </Button>
          {canEdit ? (
            <Button
              variant="contained"
              disabled={!position}
              onClick={save}
              sx={{ bgcolor: "#d50032", borderRadius: 2, "&:hover": { bgcolor: "#b4002a" } }}
            >
              Сохранить
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>

      <Dialog
        open={historyDialog}
        onClose={() => setHistoryDialog(false)}
        fullWidth
        maxWidth="md"
        fullScreen={fullScreen}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Box>
            <Typography
              component="span"
              variant="h6"
              sx={{ fontWeight: 600 }}
            >
              История изменений
            </Typography>
            <Typography sx={{ mt: 0.25, fontSize: 13, color: "text.secondary" }}>
              {position?.name || "Должность"}
            </Typography>
          </Box>
          <IconButton onClick={() => setHistoryDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          <HistoryLog
            history={history}
            title={`Изменения · ${history.length}`}
            defaultExpanded
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialog(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={closeDialog}
        onClose={() => setCloseDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Закрыть без сохранения?</DialogTitle>
        <DialogContent>
          <Typography>Несохранённые изменения будут потеряны.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseDialog(false)}>Продолжить редактирование</Button>
          <Button
            color="error"
            onClick={() => {
              setCloseDialog(false);
              setDirty(false);
              onClose();
            }}
          >
            Закрыть без сохранения
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={copyDialog}
        onClose={() => setCopyDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Копировать должность</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <MyTextInput
              label="Название новой должности"
              value={copyName}
              func={(event) => setCopyName(event.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCopyDialog(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={copy}
          >
            Копировать
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Удалить должность?</DialogTitle>
        <DialogContent>
          {deleteUsers.length ? (
            <Alert severity="warning">
              Должность назначена сотрудникам:{" "}
              {deleteUsers.map((user) => user.short_name || user.name).join(", ")}. Сначала смените
              им должность.
            </Alert>
          ) : (
            <Typography>
              Должность и её настройки прав будут удалены без возможности восстановления.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Отмена</Button>
          {!deleteUsers.length ? (
            <Button
              color="error"
              variant="contained"
              onClick={remove}
            >
              Удалить
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>
    </>
  );
}
