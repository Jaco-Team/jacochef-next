import React, { useEffect, useMemo, useRef, useState } from "react";
import {
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import { MyAutocomplite, MyTextInput } from "@/ui/Forms";
import useFullScreen from "@/src/hooks/useFullScreen";
import HistoryLog from "@/ui/history/HistoryLog";

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
  { key: "access", label: "Доступ" },
  { key: "view", label: "Просмотр" },
  { key: "edit", label: "Редактирование" },
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

const groupModuleFeatures = (features = []) => {
  const groups = [];
  const groupsByKey = new Map();

  features.forEach((feature, featureIndex) => {
    const category = String(feature.category ?? "").trim();
    const key = category || "__plain__";

    if (!groupsByKey.has(key)) {
      const group = {
        key,
        name: category ? String(feature.category_name || category) : "",
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
    const granted = grantedCount(module);

    return granted
      ? { label: `Всегда включён · настроено: ${granted}`, color: "info" }
      : { label: "Всегда включён", color: "info" };
  }

  if (!isModuleEnabled(module)) return { label: "Выключен", color: "default" };

  const granted = grantedCount(module);

  if (!granted && (module?.features ?? []).length) {
    return { label: "Требуются права", color: "warning" };
  }

  return granted
    ? { label: `Включён · настроено: ${granted}`, color: "success" }
    : { label: "Включён", color: "success" };
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

function ModuleRightsDetail({
  module,
  parentIndex,
  childIndex,
  canEdit,
  rightsSearch,
  openCategoryKey,
  onToggleCategory,
  onToggleModule,
  onPreset,
  onSetModulePermission,
  onUpdateFeature,
}) {
  const locked = isLockedModule(module);
  const enabled = locked || isModuleEnabled(module);
  const status = moduleStatus(module);
  const rights = permissionCounts(module);
  const query = rightsSearch.trim().toLowerCase();
  const featureGroups = groupModuleFeatures(module.features)
    .map((group) => {
      const categoryMatches =
        query &&
        String(group.name ?? "")
          .toLowerCase()
          .includes(query);

      return {
        ...group,
        items: categoryMatches
          ? group.items
          : group.items.filter(({ feature }) =>
              String(feature.name ?? "")
                .toLowerCase()
                .includes(query),
            ),
      };
    })
    .filter((group) => group.items.length > 0);

  return (
    <Box sx={{ p: { xs: 1.5, md: 2.5 } }}>
      <Paper
        variant="outlined"
        sx={{ borderRadius: 2, overflow: "hidden" }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1.5}
          sx={{ px: 2, py: 1.5 }}
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
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                noWrap
                sx={{ fontWeight: 900, fontSize: 18 }}
              >
                {module.name}
              </Typography>
              <Stack
                direction="row"
                spacing={0.75}
                alignItems="center"
                sx={{ mt: 0.5, flexWrap: "wrap", gap: 0.5 }}
              >
                <Chip
                  size="small"
                  label={status.label}
                  color={status.color}
                  variant="outlined"
                />
                <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
                  Доступ: {rights.access} · Просмотр: {rights.view} · Редактирование: {rights.edit}
                </Typography>
              </Stack>
            </Box>
          </Stack>

          {canEdit ? (
            <Stack
              direction="row"
              spacing={0.75}
              sx={{ flexWrap: "wrap", gap: 0.5 }}
            >
              <Button
                size="small"
                variant="outlined"
                onClick={() => onPreset("view")}
              >
                Только просмотр
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => onPreset("full")}
              >
                Полный доступ
              </Button>
              <Button
                size="small"
                color="inherit"
                onClick={() => onPreset("clear")}
              >
                Очистить права
              </Button>
            </Stack>
          ) : null}
        </Stack>

        {!enabled && canEdit ? (
          <Alert
            severity="info"
            icon={false}
            sx={{ mx: 2, mb: 1.5, py: 0.25, fontSize: 12 }}
          >
            При выборе любого права модуль включится автоматически.
          </Alert>
        ) : null}

        <Divider />

        <Grid
          container
          alignItems="center"
          sx={{ px: 2, py: 1, bgcolor: "action.hover" }}
        >
          <Grid size={6}>
            <Typography sx={{ color: "text.secondary", fontSize: 12, fontWeight: 800 }}>
              Выбрать все права модуля
            </Typography>
          </Grid>
          {PERMISSION_FIELDS.map((field) => {
            const allowedFeatures = module.features.filter(
              (feature) => Number(feature[`allow_${field.key}`]) === 1,
            );
            const allChecked =
              allowedFeatures.length > 0 &&
              allowedFeatures.every((feature) => Number(feature[field.key]) === 1);
            const someChecked =
              !allChecked && allowedFeatures.some((feature) => Number(feature[field.key]) === 1);

            return (
              <Grid
                key={field.key}
                size={2}
                sx={{ textAlign: "center" }}
              >
                <Checkbox
                  size="small"
                  checked={allChecked}
                  indeterminate={someChecked}
                  disabled={!canEdit || allowedFeatures.length === 0}
                  onChange={(event) => onSetModulePermission(field.key, event.target.checked)}
                />
                <Typography sx={{ color: "text.secondary", fontSize: 11, fontWeight: 700 }}>
                  {field.label}
                </Typography>
              </Grid>
            );
          })}
        </Grid>

        <Box sx={{ p: 1.5 }}>
          {featureGroups.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
              <Typography sx={{ fontWeight: 700 }}>Права не найдены</Typography>
              <Typography sx={{ mt: 0.5, fontSize: 13 }}>Измените или очистите поиск.</Typography>
            </Box>
          ) : (
            <Stack spacing={1}>
              {featureGroups.map((group) => {
                const categoryName = group.name || "Общие права";
                const configured = group.items.filter(({ feature }) =>
                  PERMISSION_FIELDS.some((field) => Number(feature[field.key]) === 1),
                ).length;
                const isOpen = Boolean(query) || openCategoryKey === group.key;

                return (
                  <Paper
                    key={group.key}
                    variant="outlined"
                    sx={{ borderRadius: 1.5, overflow: "hidden" }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      onClick={() => onToggleCategory(group.key)}
                      sx={{
                        px: 1.5,
                        py: 1,
                        cursor: "pointer",
                        bgcolor: isOpen ? "action.selected" : "background.paper",
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 800 }}>{categoryName}</Typography>
                        <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
                          Настроено: {configured} из {group.items.length}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        sx={{
                          transform: isOpen ? "rotate(180deg)" : "none",
                          transition: "transform 150ms ease",
                        }}
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    </Stack>

                    <Collapse in={isOpen}>
                      <Divider />
                      <Grid
                        container
                        sx={{ px: 1.5, py: 0.75, bgcolor: "action.hover" }}
                      >
                        <Grid size={6}>
                          <Typography
                            sx={{ color: "text.secondary", fontSize: 11, fontWeight: 700 }}
                          >
                            Параметр
                          </Typography>
                        </Grid>
                        {PERMISSION_FIELDS.map((field) => (
                          <Grid
                            key={field.key}
                            size={2}
                            sx={{ textAlign: "center" }}
                          >
                            <Typography
                              sx={{ color: "text.secondary", fontSize: 11, fontWeight: 700 }}
                            >
                              {field.label}
                            </Typography>
                          </Grid>
                        ))}
                      </Grid>
                      {group.items.map(({ feature, featureIndex }, rowIndex) => (
                        <Grid
                          container
                          key={`${feature.id}-${featureIndex}`}
                          alignItems="center"
                          sx={{
                            px: 1.5,
                            py: 0.45,
                            borderTop: 1,
                            borderColor: "divider",
                            bgcolor: rowIndex % 2 ? "rgba(0, 0, 0, 0.015)" : "transparent",
                            "&:hover": { bgcolor: "action.hover" },
                          }}
                        >
                          <Grid size={6}>
                            <Typography sx={{ fontSize: 14 }}>{feature.name}</Typography>
                          </Grid>
                          {PERMISSION_FIELDS.map((field) => (
                            <Grid
                              key={field.key}
                              size={2}
                              sx={{ textAlign: "center" }}
                            >
                              {Number(feature[`allow_${field.key}`]) === 1 ? (
                                <Checkbox
                                  size="small"
                                  checked={Number(feature[field.key]) === 1}
                                  disabled={!canEdit}
                                  onChange={(event) =>
                                    onUpdateFeature(featureIndex, field.key, event.target.checked)
                                  }
                                />
                              ) : null}
                            </Grid>
                          ))}
                        </Grid>
                      ))}
                    </Collapse>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </Box>
      </Paper>
    </Box>
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
  const [selectedModule, setSelectedModule] = useState(null);
  const [rightsSearch, setRightsSearch] = useState("");
  const [openCategoryKey, setOpenCategoryKey] = useState(null);
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
  };

  const selectFilter = (value) => {
    if (search.trim()) return;

    setFilter(value);
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
      setSelectedModule(null);
      setRightsSearch("");
      setOpenCategoryKey(null);
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
      setSelectedModule(null);
      setRightsSearch("");
      setOpenCategoryKey(null);
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

  const selectedModuleData = useMemo(() => {
    if (!selectedModule) return null;

    const module = fullMenu[selectedModule.parentIndex]?.chaild?.[selectedModule.childIndex];

    if (!module) return null;

    return {
      ...selectedModule,
      module,
    };
  }, [fullMenu, selectedModule]);

  const openModuleDetails = (parentIndex, childIndex, module) => {
    const firstGroup = groupModuleFeatures(module.features)[0];

    setSelectedModule({ parentIndex, childIndex });
    setRightsSearch("");
    setOpenCategoryKey(firstGroup?.key ?? null);
    requestAnimationFrame(() => {
      const container = contentScrollRef.current;
      const toolbar = accessToolbarRef.current;

      if (!container || !toolbar) return;

      container.scrollTo({ top: toolbar.offsetTop, behavior: "auto" });
    });
  };

  const closeModuleDetails = () => {
    setSelectedModule(null);
    setRightsSearch("");
    setOpenCategoryKey(null);
    requestAnimationFrame(scrollToModuleList);
  };

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

  const setModuleFeaturePermission = (parentIndex, childIndex, permission, value) => {
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
                  features: module.features.map((feature) =>
                    Number(feature[`allow_${permission}`]) === 1
                      ? { ...feature, [permission]: value ? 1 : 0 }
                      : feature,
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

  const applyModulePreset = (parentIndex, childIndex, preset) => {
    setDirty(true);
    setFullMenu((current) =>
      current.map((parent, currentParentIndex) =>
        currentParentIndex !== parentIndex
          ? parent
          : {
              ...parent,
              chaild: parent.chaild.map((module, currentChildIndex) => {
                if (currentChildIndex !== childIndex) return module;

                const features = module.features.map((feature) => {
                  if (preset === "clear") {
                    return { ...feature, access: 0, view: 0, edit: 0 };
                  }

                  if (preset === "view") {
                    return {
                      ...feature,
                      access: 0,
                      view: Number(feature.allow_view) === 1 ? 1 : 0,
                      edit: 0,
                    };
                  }

                  return {
                    ...feature,
                    access: Number(feature.allow_access) === 1 ? 1 : 0,
                    view: Number(feature.allow_view) === 1 ? 1 : 0,
                    edit: Number(feature.allow_edit) === 1 ? 1 : 0,
                  };
                });

                return {
                  ...module,
                  is_active: preset === "clear" ? module.is_active : 1,
                  features,
                };
              }),
            },
      ),
    );
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
            borderColor: "divider",
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ minWidth: 0 }}
          >
            <Typography
              component="span"
              variant="h6"
              noWrap
              sx={{ fontWeight: 900 }}
            >
              {position?.id ? position.name || "Должность" : "Новая должность"}
            </Typography>
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
                  sx={{ display: { xs: "none", sm: "inline-flex" } }}
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
              <Box sx={{ px: 3, py: 2 }}>
                <Typography sx={{ mb: 1.5, fontWeight: 900 }}>Основное</Typography>
                <Grid
                  container
                  spacing={2}
                >
                  <Grid size={{ xs: 12, md: 6 }}>
                    <BufferedPositionInput
                      field="name"
                      label="Название"
                      value={position.name ?? ""}
                      disabled={!canEdit}
                      onDraftChange={updatePositionDraft}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <BufferedPositionInput
                      field="short_name"
                      label="Краткое название"
                      value={position.short_name ?? ""}
                      disabled={!canEdit}
                      onDraftChange={updatePositionDraft}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <BufferedPositionInput
                      field="bonus"
                      label="Норма бонусов"
                      type="number"
                      value={position.bonus ?? 0}
                      disabled={!canEdit}
                      onDraftChange={updatePositionDraft}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <MyAutocomplite
                      label="Отдел"
                      data={units}
                      value={
                        units.find((unit) => Number(unit.id) === Number(position.unit_id)) || null
                      }
                      disabled={!canEdit}
                      multiple={false}
                      func={(_, value) => updatePosition("unit_id", value?.id ?? null)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 5 }}>
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
                        <Switch
                          size="small"
                          checked={Number(position.is_graph) === 1}
                          disabled={!canEdit}
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
                        <Switch
                          size="small"
                          checked={Number(position.is_office) === 1}
                          disabled={!canEdit}
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
                          <Switch
                            size="small"
                            checked={Number(position.can_manage_all_employees) === 1}
                            disabled={!canEdit}
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
                ref={accessToolbarRef}
                sx={{
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                  bgcolor: "background.paper",
                  borderTop: 1,
                  borderBottom: 1,
                  borderColor: "divider",
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  justifyContent="space-between"
                  spacing={1}
                  sx={{ px: 3, py: 1.5 }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.25}
                  >
                    {selectedModuleData ? (
                      <Button
                        color="inherit"
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={closeModuleDetails}
                        sx={{
                          flexShrink: 0,
                          borderColor: "divider",
                          bgcolor: "action.hover",
                          fontWeight: 800,
                        }}
                      >
                        К списку модулей
                      </Button>
                    ) : null}
                    <Box>
                      <Typography sx={{ fontWeight: 900 }}>
                        {selectedModuleData ? "Права модуля" : "Доступ к модулям"}
                      </Typography>
                      <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                        {selectedModuleData
                          ? selectedModuleData.module.name
                          : `Включено модулей: ${enabledTotal} из ${modulesTotal}`}
                      </Typography>
                    </Box>
                  </Stack>
                  <Box sx={{ width: { xs: "100%", sm: 300 } }}>
                    <TextField
                      inputRef={searchRef}
                      size="small"
                      fullWidth
                      placeholder={selectedModuleData ? "Найти право…" : "Поиск по всем разделам…"}
                      value={selectedModuleData ? rightsSearch : search}
                      onChange={(event) =>
                        selectedModuleData
                          ? setRightsSearch(event.target.value)
                          : setSearch(event.target.value)
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                        endAdornment: (selectedModuleData ? rightsSearch : search) ? (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="Очистить поиск"
                              edge="end"
                              size="small"
                              onClick={() =>
                                selectedModuleData ? setRightsSearch("") : setSearch("")
                              }
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        ) : null,
                      }}
                    />
                  </Box>
                </Stack>

                {!selectedModuleData ? (
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ px: 2, pb: 1.25, flexWrap: "wrap", gap: 1 }}
                  >
                    <TuneIcon
                      fontSize="small"
                      sx={{ color: "text.secondary" }}
                    />
                    {FILTERS.map((item) => (
                      <Chip
                        key={item.id}
                        size="small"
                        label={item.label}
                        color={filter === item.id ? "primary" : "default"}
                        variant={filter === item.id ? "filled" : "outlined"}
                        disabled={hasSearch}
                        onClick={() => selectFilter(item.id)}
                      />
                    ))}
                    <Typography sx={{ ml: "auto", color: "text.secondary", fontSize: 12 }}>
                      {hasSearch
                        ? `Найдено: ${visibleModules.length}`
                        : `${selectedSectionName}: ${visibleModules.length}`}
                    </Typography>
                  </Stack>
                ) : null}
              </Box>

              {selectedModuleData ? (
                <ModuleRightsDetail
                  module={selectedModuleData.module}
                  parentIndex={selectedModuleData.parentIndex}
                  childIndex={selectedModuleData.childIndex}
                  canEdit={canEdit}
                  rightsSearch={rightsSearch}
                  openCategoryKey={openCategoryKey}
                  onToggleCategory={(key) =>
                    setOpenCategoryKey((current) => (current === key ? null : key))
                  }
                  onToggleModule={(value, module) =>
                    toggleModule(
                      selectedModuleData.parentIndex,
                      selectedModuleData.childIndex,
                      value,
                      module,
                    )
                  }
                  onPreset={(preset) =>
                    applyModulePreset(
                      selectedModuleData.parentIndex,
                      selectedModuleData.childIndex,
                      preset,
                    )
                  }
                  onSetModulePermission={(permission, value) =>
                    setModuleFeaturePermission(
                      selectedModuleData.parentIndex,
                      selectedModuleData.childIndex,
                      permission,
                      value,
                    )
                  }
                  onUpdateFeature={(featureIndex, permission, value) =>
                    updateFeature(
                      selectedModuleData.parentIndex,
                      selectedModuleData.childIndex,
                      featureIndex,
                      permission,
                      value,
                    )
                  }
                />
              ) : (
                <Box
                  ref={modulesAnchorRef}
                  sx={{
                    minHeight: { xs: "auto", md: "calc(100vh - 280px)" },
                  }}
                >
                  <Grid container>
                    <Grid
                      size={{ xs: 12, md: 3 }}
                      sx={{
                        borderRight: { md: 1 },
                        borderBottom: { xs: 1, md: 0 },
                        borderColor: "divider",
                        position: { md: "sticky" },
                        top: { md: 108 },
                        alignSelf: { md: "flex-start" },
                        maxHeight: { md: "calc(100vh - 220px)" },
                        overflowX: { xs: "auto", md: "hidden" },
                        overflowY: { md: "auto" },
                        bgcolor: "background.paper",
                      }}
                    >
                      <List
                        dense
                        sx={{
                          display: { xs: "flex", md: "block" },
                          width: { xs: "max-content", md: "auto" },
                        }}
                      >
                        <ListItemButton
                          selected={sectionKey === "all"}
                          onClick={() => selectSection("all")}
                          sx={{
                            flex: { xs: "0 0 auto", md: "initial" },
                            borderLeft: 3,
                            borderLeftColor: "transparent",
                            "&.Mui-selected": {
                              bgcolor: "action.selected",
                              borderLeftColor: "primary.main",
                            },
                            "&.Mui-selected:hover": { bgcolor: "action.selected" },
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                              Все разделы
                            </Typography>
                          </Box>
                          <Chip
                            size="small"
                            variant="outlined"
                            label={`${enabledTotal}/${modulesTotal}`}
                          />
                        </ListItemButton>
                        {sections.map((section) => (
                          <ListItemButton
                            key={section.key}
                            selected={sectionKey === section.key}
                            onClick={() => selectSection(section.key)}
                            sx={{
                              flex: { xs: "0 0 auto", md: "initial" },
                              borderLeft: 3,
                              borderLeftColor: "transparent",
                              "&.Mui-selected": {
                                bgcolor: "action.selected",
                                borderLeftColor: "primary.main",
                              },
                              "&.Mui-selected:hover": { bgcolor: "action.selected" },
                            }}
                          >
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                noWrap
                                sx={{ fontSize: 14, fontWeight: 700 }}
                              >
                                {section.name}
                              </Typography>
                            </Box>
                            <Chip
                              size="small"
                              variant="outlined"
                              label={`${section.enabled}/${section.total}`}
                            />
                          </ListItemButton>
                        ))}
                      </List>
                    </Grid>

                    <Grid size={{ xs: 12, md: 9 }}>
                      <Box sx={{ p: 2 }}>
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
                                    sx={{ color: "text.secondary", fontSize: 12, fontWeight: 800 }}
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
                                    const locked = isLockedModule(module);
                                    const enabled = locked || isModuleEnabled(module);
                                    const status = moduleStatus(module);
                                    const hasFeatures = (module.features ?? []).length > 0;
                                    const isOpen = false;
                                    const rights = permissionCounts(module);
                                    const featureGroups = isOpen
                                      ? groupModuleFeatures(module.features)
                                      : [];
                                    const hasCategories = featureGroups.some((group) => group.name);

                                    return (
                                      <Paper
                                        key={`module-${key}-${module.id ?? module.modul_id}`}
                                        variant="outlined"
                                        onClick={() =>
                                          hasFeatures
                                            ? openModuleDetails(parentIndex, childIndex, module)
                                            : undefined
                                        }
                                        sx={{
                                          borderRadius: 1.5,
                                          cursor: hasFeatures ? "pointer" : "default",
                                          borderColor:
                                            status.color === "warning"
                                              ? "warning.light"
                                              : "divider",
                                          bgcolor: "background.paper",
                                          "&:hover": {
                                            bgcolor: hasFeatures
                                              ? "action.hover"
                                              : "background.paper",
                                          },
                                        }}
                                      >
                                        <Stack
                                          direction="row"
                                          alignItems="center"
                                          spacing={1}
                                          sx={{ px: 1.5, py: 1 }}
                                        >
                                          <Switch
                                            checked={enabled}
                                            disabled={!canEdit || locked}
                                            onClick={(event) => event.stopPropagation()}
                                            onChange={(event) =>
                                              toggleModule(
                                                parentIndex,
                                                childIndex,
                                                event.target.checked,
                                                module,
                                              )
                                            }
                                          />
                                          <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography
                                              noWrap
                                              sx={{ fontWeight: 700 }}
                                            >
                                              {module.name}
                                            </Typography>
                                            <Chip
                                              size="small"
                                              label={status.label}
                                              color={status.color}
                                              variant="outlined"
                                              sx={{ mt: 0.25, height: 20, fontSize: 11 }}
                                            />
                                            {hasFeatures && grantedCount(module) > 0 ? (
                                              <Typography
                                                sx={{
                                                  mt: 0.35,
                                                  color: "text.secondary",
                                                  fontSize: 11,
                                                }}
                                              >
                                                Доступ: {rights.access} · Просмотр: {rights.view} ·
                                                Редактирование: {rights.edit}
                                              </Typography>
                                            ) : null}
                                          </Box>
                                          {hasFeatures ? (
                                            <Button
                                              size="small"
                                              variant="outlined"
                                              onClick={(event) => {
                                                event.stopPropagation();
                                                openModuleDetails(parentIndex, childIndex, module);
                                              }}
                                            >
                                              Настроить права
                                            </Button>
                                          ) : null}
                                        </Stack>

                                        {hasFeatures && isOpen ? (
                                          <Collapse
                                            in={isOpen}
                                            unmountOnExit
                                          >
                                            <Divider />
                                            <Box sx={{ px: 1.5, py: 1 }}>
                                              <Stack
                                                direction={{ xs: "column", sm: "row" }}
                                                alignItems={{ xs: "flex-start", sm: "center" }}
                                                spacing={1}
                                                sx={{ mb: 1 }}
                                              >
                                                <Typography
                                                  sx={{
                                                    color: "text.secondary",
                                                    fontSize: 12,
                                                    fontWeight: 700,
                                                  }}
                                                >
                                                  Быстрые настройки
                                                </Typography>
                                                {canEdit ? (
                                                  <Stack
                                                    direction="row"
                                                    spacing={0.5}
                                                    sx={{ flexWrap: "wrap", gap: 0.5 }}
                                                  >
                                                    <Button
                                                      size="small"
                                                      variant="outlined"
                                                      onClick={() =>
                                                        applyModulePreset(
                                                          parentIndex,
                                                          childIndex,
                                                          "view",
                                                        )
                                                      }
                                                    >
                                                      Только просмотр
                                                    </Button>
                                                    <Button
                                                      size="small"
                                                      variant="outlined"
                                                      onClick={() =>
                                                        applyModulePreset(
                                                          parentIndex,
                                                          childIndex,
                                                          "full",
                                                        )
                                                      }
                                                    >
                                                      Полный доступ
                                                    </Button>
                                                    <Button
                                                      size="small"
                                                      color="inherit"
                                                      onClick={() =>
                                                        applyModulePreset(
                                                          parentIndex,
                                                          childIndex,
                                                          "clear",
                                                        )
                                                      }
                                                    >
                                                      Очистить права
                                                    </Button>
                                                  </Stack>
                                                ) : null}
                                              </Stack>
                                              {!enabled && canEdit ? (
                                                <Alert
                                                  severity="info"
                                                  icon={false}
                                                  sx={{ mb: 1, py: 0.25, fontSize: 12 }}
                                                >
                                                  При выборе любого права модуль включится
                                                  автоматически.
                                                </Alert>
                                              ) : null}
                                              <Grid
                                                container
                                                alignItems="center"
                                                sx={{
                                                  px: 1,
                                                  py: 0.75,
                                                  borderRadius: 1,
                                                  bgcolor: "action.hover",
                                                }}
                                              >
                                                <Grid size={6}>
                                                  <Typography
                                                    sx={{
                                                      color: "text.secondary",
                                                      fontSize: 11,
                                                      fontWeight: 700,
                                                    }}
                                                  >
                                                    Выбрать все
                                                  </Typography>
                                                </Grid>
                                                {PERMISSION_FIELDS.map((field) => {
                                                  const allowedFeatures = module.features.filter(
                                                    (feature) =>
                                                      Number(feature[`allow_${field.key}`]) === 1,
                                                  );
                                                  const allChecked =
                                                    allowedFeatures.length > 0 &&
                                                    allowedFeatures.every(
                                                      (feature) => Number(feature[field.key]) === 1,
                                                    );
                                                  const someChecked =
                                                    !allChecked &&
                                                    allowedFeatures.some(
                                                      (feature) => Number(feature[field.key]) === 1,
                                                    );

                                                  return (
                                                    <Grid
                                                      key={field.key}
                                                      size={2}
                                                      sx={{ textAlign: "center" }}
                                                    >
                                                      <Tooltip
                                                        title={`Установить «${field.label}» для всех`}
                                                      >
                                                        <span>
                                                          <Checkbox
                                                            size="small"
                                                            checked={allChecked}
                                                            indeterminate={someChecked}
                                                            disabled={
                                                              !canEdit ||
                                                              allowedFeatures.length === 0
                                                            }
                                                            onChange={(event) =>
                                                              setModuleFeaturePermission(
                                                                parentIndex,
                                                                childIndex,
                                                                field.key,
                                                                event.target.checked,
                                                              )
                                                            }
                                                          />
                                                        </span>
                                                      </Tooltip>
                                                      <Typography
                                                        sx={{
                                                          color: "text.secondary",
                                                          fontSize: 11,
                                                          fontWeight: 700,
                                                          lineHeight: 1,
                                                        }}
                                                      >
                                                        {field.label}
                                                      </Typography>
                                                    </Grid>
                                                  );
                                                })}
                                              </Grid>
                                              <Stack>
                                                {featureGroups.map((featureGroup) => (
                                                  <Box
                                                    key={`feature-group-${key}-${featureGroup.key}`}
                                                  >
                                                    {featureGroup.name ||
                                                    (hasCategories &&
                                                      featureGroup.key === "__plain__") ? (
                                                      <Box
                                                        sx={{
                                                          mt: 1,
                                                          px: 1,
                                                          py: 0.75,
                                                          borderLeft: 3,
                                                          borderColor: "primary.main",
                                                          bgcolor: "action.selected",
                                                        }}
                                                      >
                                                        <Typography
                                                          sx={{ fontSize: 13, fontWeight: 800 }}
                                                        >
                                                          {featureGroup.name || "Общие права"}
                                                        </Typography>
                                                        <Typography
                                                          sx={{
                                                            color: "text.secondary",
                                                            fontSize: 11,
                                                          }}
                                                        >
                                                          Параметров: {featureGroup.items.length}
                                                        </Typography>
                                                      </Box>
                                                    ) : null}
                                                    {featureGroup.items.map(
                                                      (
                                                        { feature, featureIndex },
                                                        groupFeatureIndex,
                                                      ) => (
                                                        <Grid
                                                          container
                                                          key={`feature-${key}-${feature.id}-${featureIndex}`}
                                                          alignItems="center"
                                                          sx={{
                                                            px: 1,
                                                            py: 0.4,
                                                            borderTop: 1,
                                                            borderColor: "divider",
                                                            bgcolor:
                                                              groupFeatureIndex % 2 === 1
                                                                ? "rgba(0, 0, 0, 0.015)"
                                                                : "transparent",
                                                            transition:
                                                              "background-color 120ms ease",
                                                            "&:hover": {
                                                              bgcolor: "action.hover",
                                                            },
                                                          }}
                                                        >
                                                          <Grid size={6}>
                                                            <Typography sx={{ fontSize: 14 }}>
                                                              {feature.name}
                                                            </Typography>
                                                          </Grid>
                                                          {PERMISSION_FIELDS.map((field) => (
                                                            <Grid
                                                              key={field.key}
                                                              size={2}
                                                              sx={{ textAlign: "center" }}
                                                            >
                                                              {Number(
                                                                feature[`allow_${field.key}`],
                                                              ) === 1 ? (
                                                                <Checkbox
                                                                  size="small"
                                                                  checked={
                                                                    Number(feature[field.key]) === 1
                                                                  }
                                                                  disabled={!canEdit}
                                                                  onChange={(event) =>
                                                                    updateFeature(
                                                                      parentIndex,
                                                                      childIndex,
                                                                      featureIndex,
                                                                      field.key,
                                                                      event.target.checked,
                                                                    )
                                                                  }
                                                                />
                                                              ) : null}
                                                            </Grid>
                                                          ))}
                                                        </Grid>
                                                      ),
                                                    )}
                                                  </Box>
                                                ))}
                                              </Stack>
                                            </Box>
                                          </Collapse>
                                        ) : null}
                                      </Paper>
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
              )}
            </>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            flexShrink: 0,
            px: 3,
            py: 1.5,
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          {position?.id && canEdit ? (
            <>
              <Button
                color="error"
                startIcon={<DeleteOutlineIcon />}
                onClick={openDelete}
              >
                Удалить
              </Button>
              <Button
                startIcon={<ContentCopyIcon />}
                onClick={() => setCopyDialog(true)}
              >
                Копировать
              </Button>
            </>
          ) : null}
          <Box sx={{ flex: 1 }} />
          <Button onClick={requestClose}>Закрыть</Button>
          {canEdit ? (
            <Button
              variant="contained"
              disabled={!position}
              onClick={save}
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
              sx={{ fontWeight: 900 }}
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
