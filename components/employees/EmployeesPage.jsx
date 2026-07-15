import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Backdrop,
  Box,
  Button,
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
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import RefreshIcon from "@mui/icons-material/Refresh";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { MyAutocomplite, MyCheckBox, MyDatePickerNew, MyTextInput } from "@/ui/Forms";
import CityCafeAutocomplete2 from "@/ui/CityCafeAutocomplete2";
import MyAlert from "@/ui/MyAlert";
import EmployeeHierarchyTab from "@/components/employees/EmployeeHierarchyTab";
import { api_laravel, api_laravel_local, api_laravel_upload } from "@/src/api_new";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";

dayjs.locale("ru");

const MODULE = "employees";
const DEFAULT_ROWS = 25;

const emptyEmployee = {
  id: "",
  fam: "",
  name: "",
  otc: "",
  login: "",
  birthday: "",
  auth_code: "",
  inn: "",
  date_registration: "",
  app_id: null,
  point_id: null,
  point_access: [],
  point_access_ids: [],
  acc_to_kas: 0,
  photo: "",
};

const emptyAbsence = {
  id: null,
  type: { id: 1, name: "Отпуск" },
  start: "",
  end: "",
  comment: "",
};

const absenceTypes = [
  { id: 1, name: "Отпуск" },
  { id: 2, name: "Больничный" },
  { id: 3, name: "Декрет" },
  { id: 4, name: "Другое" },
];

const getAbsenceType = (value) =>
  absenceTypes.find((item) => sameId(item, value)) || absenceTypes[0];

const officialFilters = [
  { id: "all", name: "Все" },
  { id: "official", name: "Официально" },
  { id: "unofficial", name: "Неофициально" },
];

const healthBookFilters = [
  { id: "all", name: "Все" },
  { id: "valid", name: "Действующая" },
  { id: "expiring", name: "Истекает" },
  { id: "blocked", name: "Блокировка" },
  { id: "not_required", name: "Не требуется" },
];

const healthBookItemDefinitions = [
  { type: "type_2", name: "Отоларинголог" },
  { type: "type_3", name: "Патогенный стафилококк" },
  { type: "type_4", name: "Стоматолог" },
  { type: "type_5", name: "Терапевт" },
  { type: "type_6", name: "Мед. осмотр" },
  { type: "type_7", name: "Флюорография" },
  { type: "type_8", name: "Бак. анализ" },
  { type: "type_9", name: "Яйц. глист" },
  { type: "type_10", name: "Санитарный минимум" },
];

const getEmptyHealthItems = () =>
  healthBookItemDefinitions.map((item) => ({ ...item, start: "", end: "" }));

const tableHeaderSx = {
  "& th": {
    bgcolor: "#fafafa",
    color: "text.secondary",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
};

const compactPaperSx = {
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  boxShadow: "none",
};

const idOf = (item) => (item && typeof item === "object" ? item.id : item);

const sameId = (a, b) => String(idOf(a) ?? "") === String(idOf(b) ?? "");

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return Object.values(value);
  return [];
};

const normalizeOption = (item) => ({
  ...item,
  id: item?.id ?? item?.value ?? "",
  name: item?.name ?? item?.label ?? item?.title ?? "",
});

const normalizeOptions = (items) =>
  asArray(items)
    .map(normalizeOption)
    .filter((item) => item.name);

const findOption = (items, value) =>
  normalizeOptions(items).find((item) => sameId(item, value)) || null;

const authCodeRequiredForApp = (app, apps = []) => {
  const selectedApp = app && typeof app === "object" ? app : findOption(apps, app);

  return Boolean(selectedApp?.auth_code_required);
};

const joinName = (employee) =>
  [employee?.fam, employee?.name, employee?.otc].filter(Boolean).join(" ") ||
  employee?.full_name ||
  employee?.fio ||
  employee?.name ||
  "Не указано";

const getPhotoUrl = (employee) => {
  if (employee?.photo) return employee.photo;
  if (!employee?.img_name) return "";

  return `https://storage.yandexcloud.net/user-img/min-img/${employee.img_name}?${employee.img_update || ""}`;
};

const formatDate = (value, fallback = "—") => {
  if (!value) return fallback;
  const date = dayjs(value);
  return date.isValid() ? date.format("YYYY-MM-DD") : value;
};

const formatDateHuman = (value, fallback = "—") => {
  if (!value) return fallback;
  const date = dayjs(value);
  return date.isValid() ? date.format("D MMMM YYYY") : value;
};

const getHistoryTimestamp = (item) => {
  const value = item?.created_at ?? item?.date_time_update ?? item?.date_create ?? item?.date ?? "";
  const timestamp = dayjs(value).valueOf();

  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const sortHistoryDesc = (items) =>
  asArray(items).sort((a, b) => getHistoryTimestamp(b) - getHistoryTimestamp(a));

const employeeHistoryFields = [
  { key: "name", label: "ФИО" },
  { key: "short_name", label: "Краткое имя" },
  { key: "login", label: "Телефон" },
  { key: "birthday", label: "Дата рождения" },
  { key: "auth_code", label: "Код авторизации" },
  { key: "inn", label: "ИНН" },
  { key: "acc_to_kas", label: "Трудоустройство" },
  { key: "app_name", label: "Должность" },
  { key: "city_name", label: "Город" },
  { key: "point_name", label: "Кафе" },
  { key: "text_close", label: "Комментарий" },
  { key: "is_show", label: "Видимость" },
];

const getVisibleEmployeeHistoryFields = (permissions) => {
  const fieldPermissions = {
    name: permissions.fullName,
    short_name: permissions.fullName,
    login: permissions.phone,
    birthday: permissions.birthDate,
    auth_code: permissions.authCode,
    inn: permissions.inn,
    acc_to_kas: permissions.officialEmployment,
    app_name: permissions.position,
    city_name: permissions.cafes,
    point_name: permissions.cafes,
    text_close: permissions.position,
  };

  return employeeHistoryFields.filter(({ key }) => fieldPermissions[key]?.view);
};

const filterEmployeeHistoryByPermissions = (history, permissions) => {
  const fields = getVisibleEmployeeHistoryFields(permissions);
  const allowedKeys = new Set(fields.map(({ key }) => key));
  const activityPermissions = {
    health_book: permissions.healthBook,
    absence: permissions.absences,
    cloth: permissions.clothing,
  };

  return asArray(history)
    .filter((item) => {
      if (item.history_kind !== "activity") return fields.length > 0;

      return activityPermissions[item.entity_type]?.view ?? false;
    })
    .map((item) => {
      if (item.history_kind === "activity") return item;

      return {
        ...item,
        changedFields: item.changedFields.filter(({ key }) => allowedKeys.has(key)),
        diff: Object.fromEntries(Object.entries(item.diff).filter(([key]) => allowedKeys.has(key))),
        snapshot: Object.fromEntries(
          Object.entries(item.snapshot).filter(([key]) => allowedKeys.has(key)),
        ),
      };
    });
};

const formatHistoryValue = (key, value) => {
  if (value === null || value === undefined || value === "") return "—";
  if (key === "birthday") return formatDate(value);
  if (key === "acc_to_kas") return Number(value) === 1 ? "Официально" : "Неофициально";
  if (key === "is_show") return Number(value) === 1 ? "Показывается" : "Скрыт";

  return String(value);
};

const normalizeEmployeeHistory = (items) => {
  const sorted = sortHistoryDesc([...asArray(items)]);

  return sorted.map((item, index) => {
    const previous = sorted[index + 1] ?? null;
    const snapshot = {};
    const diff = {};

    employeeHistoryFields.forEach(({ key, label }) => {
      const currentValue = item?.[key] ?? "";
      const previousValue = previous?.[key] ?? "";

      snapshot[key] = formatHistoryValue(key, currentValue);

      if (String(currentValue) !== String(previousValue)) {
        diff[key] = {
          field: label,
          from: formatHistoryValue(key, previousValue),
          to: formatHistoryValue(key, currentValue),
        };
      }
    });

    const changedFields = employeeHistoryFields.filter(({ key }) => diff[key]);
    const createdAt =
      item?.created_at ?? item?.date_time_update ?? item?.date_create ?? item?.date ?? "";

    return {
      ...item,
      id: item?.id ?? `${createdAt}-${index}`,
      created_at: createdAt,
      actor_name: item?.actor_name ?? item?.update_name ?? item?.user_name ?? "—",
      event_type: previous ? (changedFields.length ? "update" : "snapshot") : "create",
      diff_json: JSON.stringify(diff),
      meta_json: JSON.stringify({ snapshot }),
      snapshot,
      diff,
      changedFields,
    };
  });
};

const activityEventLabels = {
  health_book_update: "Медкнижка",
  cloth_issue: "Одежда выдана",
  cloth_return: "Одежда сдана",
  absence_create: "Отсутствие добавлено",
  absence_update: "Отсутствие изменено",
  absence_delete: "Отсутствие удалено",
};

const parseHistoryJson = (value) => {
  if (!value) return {};
  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const formatActivityHistoryValue = (value) =>
  value === null || value === undefined || value === "" ? "—" : String(value);

const normalizeEmployeeActivityHistory = (items) =>
  asArray(items).map((item, index) => {
    const rawDiff = parseHistoryJson(item?.diff_json);
    const diff = Object.fromEntries(
      Object.entries(rawDiff).map(([key, value]) => [
        key,
        {
          ...value,
          from: formatActivityHistoryValue(value?.from),
          to: formatActivityHistoryValue(value?.to),
        },
      ]),
    );
    const createdAt = item?.created_at ?? item?.date_time_update ?? "";

    return {
      ...item,
      id: ["activity", item?.id ?? createdAt, index].join("-"),
      created_at: createdAt,
      actor_name: item?.actor_name ?? item?.update_name ?? "—",
      event_label: activityEventLabels[item?.event_type] ?? "Событие сотрудника",
      history_kind: "activity",
      diff,
      snapshot: parseHistoryJson(item?.after_json),
      before_snapshot: parseHistoryJson(item?.before_json),
      changedFields: Object.entries(diff).map(([key, value]) => ({
        key,
        label: value?.field ?? key,
      })),
    };
  });

const formatActivityHistoryDate = (value) => {
  if (!value || value === "—") return "—";
  const date = dayjs(value);

  return date.isValid() ? date.format("DD.MM.YYYY") : value;
};

const getActivitySnapshot = (item) =>
  Object.keys(item?.snapshot ?? {}).length ? item.snapshot : (item?.before_snapshot ?? {});

const getClothHistoryDetails = (item) => {
  const snapshot = item?.snapshot ?? {};

  return {
    name: formatActivityHistoryValue(snapshot.name) === "—" ? "Предмет одежды" : snapshot.name,
    dateStart: formatActivityHistoryDate(snapshot.date_start),
    dateEnd: formatActivityHistoryDate(snapshot.date_end),
  };
};

const getHealthHistoryGroups = (item) => {
  const groups = new Map();

  item.changedFields.forEach(({ key, label }) => {
    const type = key.replace(/_(start|end)$/, "");
    const group = groups.get(type) ?? {
      type,
      name: label.split(":")[0],
      startKey: `${type}_start`,
      endKey: `${type}_end`,
    };

    groups.set(type, group);
  });

  return Array.from(groups.values());
};

const formatAbsenceDays = (start, end) => {
  const startDate = dayjs(start);
  const endDate = dayjs(end);

  if (!startDate.isValid() || !endDate.isValid()) return "—";

  const count = Math.max(1, endDate.diff(startDate, "day") + 1);
  const mod10 = count % 10;
  const mod100 = count % 100;
  const word =
    mod10 === 1 && mod100 !== 11
      ? "день"
      : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
        ? "дня"
        : "дней";

  return `${count} ${word}`;
};

const normalizeEmployeeRow = (item) => {
  const name = joinName(item);

  return {
    ...item,
    id: item?.id ?? item?.user_id,
    displayName: name,
    phone: item?.login ?? item?.phone ?? "",
    app_name: item?.app_name ?? item?.appointment_name ?? "",
    point: item?.point ?? item?.point_name ?? item?.cafe_name ?? "",
    date_registration: item?.date_registration ?? item?.employment_date ?? "",
    exp: item?.exp ?? item?.experience ?? "",
    acc_to_kas: item?.acc_to_kas ?? item?.official ?? 0,
    health_status: item?.health_status ?? item?.status ?? "",
    health_type: item?.health_type ?? item?.type ?? 0,
    photo: getPhotoUrl(item),
    is_active: item?.is_active ?? item?.active ?? (item?.inactive ? 0 : 1),
  };
};

const normalizeEmployeeCard = (data) => {
  const source = data?.employee ?? data?.user ?? data ?? {};
  const user = {
    ...emptyEmployee,
    ...source,
    id: source?.id ?? source?.user_id ?? "",
    point_access: asArray(source?.point_access),
    point_access_ids: asArray(source?.point_access_ids),
    photo: getPhotoUrl(source),
  };
  const history = sortHistoryDesc([
    ...normalizeEmployeeHistory(data?.history ?? source?.history),
    ...normalizeEmployeeActivityHistory(data?.activity_history ?? source?.activity_history),
  ]);

  return {
    user,
    appointment: normalizeOptions(data?.appointment ?? data?.apps ?? data?.app_list),
    point_list: normalizeOptions(data?.point_list ?? data?.points),
    health_book: data?.health_book ?? data?.healthBook ?? {},
    health_items: asArray(data?.health_items ?? data?.healthBook?.items),
    cloth: {
      active: asArray(data?.cloth?.active ?? data?.cloth_active),
      non_active: asArray(data?.cloth?.non_active ?? data?.cloth_non_active),
    },
    history,
    absence_history: asArray(data?.absence_history ?? source?.vacation),
    organizations: data?.organizations ?? {},
  };
};

const normalizeStats = (data) => {
  const experience = asArray(data?.experience ?? data?.stat);
  const employment = data?.employment ?? data?.stat_of ?? {};
  const analytics = data?.analytics ?? {};

  return {
    experience,
    employment,
    analytics: {
      headcount: analytics.headcount ?? 0,
      hired_30: analytics.hired_30 ?? 0,
      dismissed_30: analytics.dismissed_30 ?? 0,
      health: {
        valid: analytics.health?.valid ?? 0,
        expiring: analytics.health?.expiring ?? 0,
        blocked: analytics.health?.blocked ?? 0,
      },
      absences: {
        today: analytics.absences?.today ?? 0,
        upcoming_7: analytics.absences?.upcoming_7 ?? 0,
      },
      clothing: {
        missing: analytics.clothing?.missing ?? 0,
      },
      cafes: asArray(analytics.cafes),
    },
  };
};

const getAccess = (data) => {
  return data?.access ?? {};
};

const getEmployeePermissions = (access) => {
  const { userCan } = handleUserAccess(access);
  const tab = (key) => {
    const allowed = userCan("access", key);

    return { view: allowed, edit: allowed };
  };
  const basicTab = tab("basic_tab");
  const workTab = tab("work_tab");
  const absencesTab = tab("absences_tab");
  const healthBookTab = tab("health_book_tab");
  const clothingTab = tab("clothing_tab");

  return {
    addEmployee: userCan("access", "add_employee"),
    mainStats: userCan("access", "main_stats"),
    basicTab,
    workTab,
    absencesTab,
    healthBookTab,
    clothingTab,
    officialEmployment: workTab,
    photo: basicTab,
    fullName: basicTab,
    phone: basicTab,
    inn: basicTab,
    birthDate: basicTab,
    employmentDate: workTab,
    authCode: basicTab,
    position: workTab,
    positionHierarchy: {
      view: userCan("view", "position_hierarchy"),
      edit: userCan("edit", "position_hierarchy"),
    },
    cafes: workTab,
    absences: absencesTab,
    healthBook: healthBookTab,
    clothing: clothingTab,
  };
};

const hasBasicEmployeeView = (permissions) =>
  [
    permissions.photo,
    permissions.fullName,
    permissions.phone,
    permissions.inn,
    permissions.birthDate,
    permissions.authCode,
  ].some((permission) => permission.view);

const hasBasicEmployeeEdit = (permissions) =>
  [
    permissions.fullName,
    permissions.phone,
    permissions.inn,
    permissions.birthDate,
    permissions.authCode,
  ].some((permission) => permission.edit);

const getDefaultEmployeeTab = (permissions) => {
  if (hasBasicEmployeeView(permissions)) return "basic";
  if (permissions.workTab.view) return "work";
  if (permissions.absences.view) return "absence";
  if (permissions.healthBook.view) return "health";
  if (permissions.clothing.view) return "cloth";

  return "history";
};

const canOpenEmployeeCard = (permissions) =>
  hasBasicEmployeeView(permissions) ||
  permissions.workTab.view ||
  permissions.absences.view ||
  permissions.healthBook.view ||
  permissions.clothing.view;

const unwrapResponse = (res) => res?.data ?? res;

const getHealthStatusMeta = (item) => {
  const status = String(item?.health_status ?? item?.status ?? "").toLowerCase();
  const type = parseInt(item?.health_type ?? item?.type ?? 0);

  if (status.includes("проср") || type >= 3) {
    return { label: item?.health_status || item?.status || "Просрочено", color: "error" };
  }

  if (status.includes("скоро") || type === 2) {
    return { label: item?.health_status || item?.status || "Скоро истекает", color: "warning" };
  }

  if (status || type === 1) {
    return { label: item?.health_status || item?.status || "Актуально", color: "success" };
  }

  return { label: "—", color: "default" };
};

const getHealthItemStatus = (item) => {
  const end = item?.end ?? item?.date_end;

  if (!end) return { label: "Нет даты", color: "default" };

  const diff = dayjs(end).diff(dayjs(), "days");

  if (diff < 0) return { label: "Просрочено", color: "error" };
  if (diff <= 14) return { label: "Скоро истекает", color: "warning" };

  return { label: "Актуально", color: "success" };
};

const getHealthItems = (employee) => {
  if (employee.health_items.length) return employee.health_items;

  return healthBookItemDefinitions.map((item) => ({
    ...item,
    start: employee.health_book?.[`${item.type}_start`] ?? "",
    end: employee.health_book?.[`${item.type}_end`] ?? "",
  }));
};

const isSelectableCafe = (point) => parseInt(point?.id) > 0 || sameId(point, -2);

const getSelectableCafes = (points) => asArray(points).filter(isSelectableCafe);

const getRealCafes = (points) => asArray(points).filter((point) => parseInt(point?.id) > 0);

const getCityIdFromPoints = (points) => {
  const realPoints = getSelectableCafes(points).filter((point) => parseInt(point?.id) > 0);
  const cityIds = Array.from(new Set(realPoints.map((point) => point.city_id).filter(Boolean)));

  return cityIds.length === 1 ? cityIds[0] : -1;
};

function EmployeeAvatar({ employee, size = 34 }) {
  const src = employee?.photo || getPhotoUrl(employee);

  return (
    <Avatar
      src={src}
      alt={employee?.displayName || joinName(employee)}
      sx={{ width: size, height: size, bgcolor: "#0f172a", fontSize: size > 48 ? 22 : 14 }}
    >
      {(employee?.displayName || joinName(employee)).slice(0, 1)}
    </Avatar>
  );
}

function EmployeePhotoDropzone({ user, file, disabled, onFileChange }) {
  const [preview, setPreview] = useState("");
  const [isDrag, setIsDrag] = useState(false);
  const src = preview || user?.photo || getPhotoUrl(user);

  useEffect(() => {
    if (!file) {
      setPreview("");
      return undefined;
    }

    const nextPreview = URL.createObjectURL(file);
    setPreview(nextPreview);

    return () => URL.revokeObjectURL(nextPreview);
  }, [file]);

  const selectFile = (nextFile) => {
    if (!nextFile || disabled) return;
    if (!["image/jpeg", "image/png"].includes(nextFile.type)) return;

    onFileChange(nextFile);
  };

  return (
    <Stack spacing={1.25}>
      <Box
        sx={{
          width: "100%",
          height: { xs: 300, md: 340 },
          borderRadius: "8px",
          bgcolor: "#f8fafc",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {src ? (
          <Box
            component="img"
            src={src}
            alt={joinName(user)}
            sx={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : (
          <EmployeeAvatar
            employee={user}
            size={120}
          />
        )}
      </Box>
      {!disabled ? (
        <Box
          component="label"
          onDragOver={(event) => {
            event.preventDefault();
            setIsDrag(true);
          }}
          onDragLeave={() => setIsDrag(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDrag(false);
            selectFile(event.dataTransfer.files?.[0]);
          }}
          sx={{
            minHeight: 76,
            border: "1px dashed",
            borderColor: isDrag ? "primary.main" : "#cbd5e1",
            borderRadius: "8px",
            bgcolor: isDrag ? "rgba(211, 0, 51, 0.04)" : "#fff",
            cursor: "pointer",
            px: 1.5,
            py: 1.25,
            display: "flex",
            alignItems: "center",
            gap: 1.25,
          }}
        >
          <input
            hidden
            type="file"
            accept="image/jpeg,image/png"
            onChange={(event) => selectFile(event.target.files?.[0])}
          />
          <CloudUploadIcon color="primary" />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{ fontWeight: 800 }}
              noWrap
            >
              {file?.name || "Заменить фото"}
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>JPG или PNG</Typography>
          </Box>
        </Box>
      ) : null}
    </Stack>
  );
}

function EmployeeViewField({ label, value, children, sx }) {
  const displayValue = value === null || value === undefined || value === "" ? "—" : value;

  return (
    <Paper
      variant="outlined"
      sx={{
        minHeight: 56,
        px: 1.5,
        py: 1,
        borderRadius: "8px",
        borderColor: "#e5e7eb",
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        ...sx,
      }}
    >
      <Typography sx={{ mb: 0.25, color: "text.secondary", fontSize: 12, fontWeight: 700 }}>
        {label}
      </Typography>
      {children || <Typography sx={{ fontSize: 15, fontWeight: 800 }}>{displayValue}</Typography>}
    </Paper>
  );
}

function StatCard({ title, children }) {
  return (
    <Paper
      variant="outlined"
      sx={{ ...compactPaperSx, p: 1.25, height: "100%", display: "flex", flexDirection: "column" }}
    >
      <Typography sx={{ mb: 0.75, fontSize: 13, fontWeight: 800, color: "text.secondary" }}>
        {title}
      </Typography>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>{children}</Box>
    </Paper>
  );
}

function TabPanel({ active, value, children }) {
  if (active !== value) return null;

  return <Box sx={{ pt: 2 }}>{children}</Box>;
}

export default function EmployeesPage() {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [isLoad, setIsLoad] = useState(false);
  const [alert, setAlert] = useState({ open: false, status: true, text: "" });
  const [refs, setRefs] = useState({ cities: [], points: [], apps: [], cloth: [] });
  const [access, setAccess] = useState(getAccess({}));
  const [pageTitle, setPageTitle] = useState("");
  const [filters, setFilters] = useState({
    city: "",
    points: [],
    app: null,
    official: officialFilters[0],
    healthBook: healthBookFilters[0],
    search: "",
  });
  const filtersRef = useRef(filters);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState(normalizeStats({}));
  const [expandedCafes, setExpandedCafes] = useState([]);
  const [expandedOfficeUnits, setExpandedOfficeUnits] = useState([]);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [sort, setSort] = useState({ by: "position", direction: "asc" });
  const [totalRows, setTotalRows] = useState(0);
  const [employeeDialog, setEmployeeDialog] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [employeePhotoFile, setEmployeePhotoFile] = useState(null);
  const [pageTab, setPageTab] = useState("employees");
  const [activeTab, setActiveTab] = useState("basic");
  const [newDialog, setNewDialog] = useState(false);
  const [newEmployee, setNewEmployee] = useState(emptyEmployee);
  const [absence, setAbsence] = useState(emptyAbsence);
  const [clothIssue, setClothIssue] = useState({
    item: null,
    date_start: dayjs().format("YYYY-MM-DD"),
  });
  const [clothDialog, setClothDialog] = useState(false);
  const [clothName, setClothName] = useState("");
  const [confirm, setConfirm] = useState(null);
  const permissions = useMemo(() => getEmployeePermissions(access), [access]);
  const canViewHierarchy = permissions.positionHierarchy.view;

  useEffect(() => {
    if (pageTab === "hierarchy" && !canViewHierarchy) {
      setPageTab("employees");
    }
  }, [canViewHierarchy, pageTab]);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const showAlert = (status, text) => {
    setAlert({
      open: true,
      status,
      text: text || (status ? "Готово" : "Ошибка выполнения запроса"),
    });
  };

  const getData = async (method, data = {}) => {
    setIsLoad(true);

    try {
      const res = await api_laravel(MODULE, method, data);
      return unwrapResponse(res);
    } catch (e) {
      showAlert(false, "Не удалось выполнить запрос");
      return null;
    } finally {
      setTimeout(() => setIsLoad(false), 300);
    }
  };

  const uploadData = async (method, file, data = {}) => {
    setIsLoad(true);

    try {
      const res = await api_laravel_upload(MODULE, method, file, data);
      return unwrapResponse(res);
    } catch (e) {
      showAlert(false, "Не удалось загрузить файл");
      return null;
    } finally {
      setTimeout(() => setIsLoad(false), 300);
    }
  };

  const refreshEmployees = async (
    nextFilters = filters,
    nextPage = page,
    nextRows = rows,
    nextSort = sort,
  ) => {
    const requestPoints = getSelectableCafes(nextFilters.points);

    const data = {
      city_id: getCityIdFromPoints(requestPoints),
      point_id: requestPoints,
      point_ids: requestPoints.filter((point) => parseInt(point?.id) > 0).map((point) => point.id),
      app: nextFilters.app,
      app_id: nextFilters.app?.id ?? -2,
      official_status: nextFilters.official?.id ?? "all",
      health_status: nextFilters.healthBook?.id ?? "all",
      search: nextFilters.search,
      page: nextPage + 1,
      rows: nextRows,
      sort_by: nextSort.by,
      sort_direction: nextSort.direction,
    };
    const res = await getData("get_employees", data);

    if (!res) return;

    const list = asArray(res.employees ?? res.users).map(normalizeEmployeeRow);

    setEmployees(list);
    setStats(normalizeStats(res));
    setTotalRows(res.total_rows ?? res.total ?? list.length);
  };

  const refreshEmployee = async (employeeId = employee?.user?.id) => {
    if (!employeeId) return;

    const res = await getData("get_employee", { user_id: employeeId, id: employeeId });

    if (!res) return;

    setEmployee(normalizeEmployeeCard(res));
  };

  const loadInitial = async () => {
    const res = await getData("get_all");

    if (!res) return;

    const cities = normalizeOptions(res.cities);
    const points = normalizeOptions(res.points);
    const apps = normalizeOptions(res.apps).map((app) =>
      Number(app.id) > 0 && app.unit_name
        ? { ...app, name: `${app.unit_name} — ${app.name}` }
        : app,
    );
    const nextAccess = getAccess(res);
    const defaultCity =
      cities.length === 1 ? cities[0].id : (cities.find((city) => sameId(city, -1))?.id ?? "");
    const defaultPoints = getSelectableCafes(points);
    const defaultApp =
      apps.find((app) => sameId(app, -2)) ?? apps.find((app) => parseInt(app.id) > 0) ?? null;

    setRefs({
      cities,
      points,
      apps,
      cloth: normalizeOptions(res.cloth ?? res.cloth_list),
    });
    setAccess(nextAccess);

    const nextFilters = {
      city: defaultCity,
      points: defaultPoints,
      app: defaultApp,
      official: officialFilters[0],
      healthBook: healthBookFilters[0],
      search: "",
    };

    filtersRef.current = nextFilters;
    setFilters(nextFilters);
    setStats(normalizeStats(res));
    setTotalRows(res.total_rows ?? 0);
    const title = String(res.module_info?.name ?? "");
    setPageTitle(title);
    document.title = title;
    await refreshEmployees(nextFilters, 0, rows);
  };

  useEffect(() => {
    loadInitial();
  }, []);

  const cafeFilterPoints = useMemo(() => getSelectableCafes(refs.points), [refs.points]);

  const visibleEmployees = useMemo(() => {
    if (totalRows > employees.length) return employees;
    if (rows < 0) return employees;

    return employees.slice(page * rows, page * rows + rows);
  }, [employees, page, rows, totalRows]);

  const openEmployee = async (employeeId, tab = "basic") => {
    if (!canOpenEmployeeCard(permissions)) {
      return;
    }

    setActiveTab(
      tab === "basic" && !hasBasicEmployeeView(permissions)
        ? getDefaultEmployeeTab(permissions)
        : tab,
    );
    setEmployeePhotoFile(null);
    const res = await getData("get_employee", { user_id: employeeId, id: employeeId });

    if (!res) return;

    setEmployee(normalizeEmployeeCard(res));
    setEmployeeDialog(true);
  };

  const updateEmployeeUser = (field, value) => {
    setEmployee((prev) => {
      const nextUser = {
        ...prev.user,
        [field]: value,
      };

      if (field === "app_id" && !authCodeRequiredForApp(value, refs.apps)) {
        nextUser.auth_code = "";
      }

      return {
        ...prev,
        user: nextUser,
      };
    });
  };

  const updateNewEmployee = (field, value) => {
    setNewEmployee((prev) => {
      const nextEmployee = {
        ...prev,
        [field]: value,
      };

      if (field === "app_id" && !authCodeRequiredForApp(value, refs.apps)) {
        nextEmployee.auth_code = "";
      }

      return nextEmployee;
    });
  };

  const updateHealthItem = (type, field, value) => {
    setEmployee((prev) => {
      const formattedValue = value ? dayjs(value).format("YYYY-MM-DD") : "";
      const nextItems = getHealthItems(prev).map((item) => {
        if (item.type !== type) return item;

        if (field === "start") {
          return {
            ...item,
            start: formattedValue,
            end: value ? dayjs(value).add(2, "years").format("YYYY-MM-DD") : "",
          };
        }

        return { ...item, [field]: formattedValue };
      });

      return {
        ...prev,
        health_items: nextItems,
      };
    });
  };

  const handleMutation = async (method, data, successText, afterRefreshEmployee = true) => {
    const res = await getData(method, data);

    if (!res) return false;

    if (res.st === false) {
      showAlert(false, res.text);
      return false;
    }

    showAlert(true, res.text || successText);
    await refreshEmployees();

    if (afterRefreshEmployee && employee?.user?.id) {
      await refreshEmployee(employee.user.id);
    }

    return true;
  };

  const saveBasic = async () => {
    if (hasBasicEmployeeEdit(permissions)) {
      const basicUser = {
        ...employee.user,
        date_start_day: dayjs().format("YYYY-MM-DD"),
      };
      const ok = await handleMutation(
        "save_basic",
        {
          user_id: employee.user.id,
          user: basicUser,
          employee: basicUser,
          date_start_day: dayjs().format("YYYY-MM-DD"),
        },
        "Данные сотрудника сохранены",
      );

      if (!ok) return;
    }

    if (employeePhotoFile && permissions.photo.edit) {
      const res = await uploadData("upload_photo", employeePhotoFile, {
        user_id: employee.user.id,
      });

      if (!res) return;

      if (res.st === false) {
        showAlert(false, res.text);
        return;
      }

      showAlert(true, res.text || "Фото обновлено");
      setEmployeePhotoFile(null);
      await refreshEmployees();
      await refreshEmployee(employee.user.id);
    }

    setEmployeeDialog(false);
  };

  const applyWorkChange = async () => {
    const user = employee.user;

    if (parseInt(idOf(user.app_id)) === 0 && !user.textDel) {
      showAlert(false, "Укажите причину увольнения");
      return;
    }

    await handleMutation(
      "apply_work_change",
      {
        user_id: user.id,
        app_id: idOf(user.app_id),
        point_id: idOf(user.point_id),
        point_access: user.point_access,
        point_access_ids: asArray(user.point_access).map((point) => point.id),
        textDel: user.textDel ?? "",
        date_start_day: formatDate(user.date_start_day || dayjs()),
        user,
      },
      "Изменения по работе применены",
    );
  };

  const saveAbsence = async () => {
    if (!absence.start || !absence.end) {
      showAlert(false, "Укажите даты отсутствия");
      return;
    }

    const method = absence.id ? "save_absence" : "add_absence";
    const ok = await handleMutation(
      method,
      {
        id: absence.id,
        absence_id: absence.id,
        user_id: employee.user.id,
        typeVacation: absence.type,
        type: absence.type,
        vacationStart: formatDate(absence.start),
        vacationEnd: formatDate(absence.end),
        date_start: formatDate(absence.start),
        date_end: formatDate(absence.end),
        commentVacation: absence.comment,
        comment: absence.comment,
      },
      absence.id ? "Отсутствие сохранено" : "Отсутствие добавлено",
    );

    if (ok) setAbsence(emptyAbsence);
  };

  const editAbsence = (item) => {
    setAbsence({
      id: item.id,
      type: getAbsenceType(item.type),
      start: item.date_start ?? item.start ?? "",
      end: item.date_end ?? item.end ?? "",
      comment: item.comment ?? item.commentVacation ?? "",
    });
  };

  const deleteAbsence = (item) => {
    setConfirm({
      title: "Удалить отсутствие?",
      text: `${item.absence_type ?? item.type_name ?? "Запись"} будет удалена из истории отсутствий.`,
      action: async () => {
        setConfirm(null);
        if (sameId(absence.id, item.id)) {
          setAbsence(emptyAbsence);
        }
        await handleMutation(
          "delete_absence",
          {
            id: item.id,
            absence_id: item.id,
            user_id: employee.user.id,
          },
          "Отсутствие удалено",
        );
      },
    });
  };

  const saveHealthBook = async () => {
    const data = {
      user_id: employee.user.id,
      items: getHealthItems(employee),
    };

    getHealthItems(employee).forEach((item) => {
      data[`${item.type}_start`] = item.start ?? item.date_start ?? "";
      data[`${item.type}_end`] = item.end ?? item.date_end ?? "";
    });

    await handleMutation("save_health_book", data, "Медкнижка сохранена");
  };

  const issueCloth = async () => {
    if (!clothIssue.item) {
      showAlert(false, "Выберите предмет одежды");
      return;
    }

    await handleMutation(
      "issue_cloth",
      {
        user_id: employee.user.id,
        cloth_id: clothIssue.item.id,
        item: clothIssue.item,
        date_start: formatDate(clothIssue.date_start),
      },
      "Предмет одежды выдан",
    );
  };

  const returnCloth = (item) => {
    setConfirm({
      title: "Принять сдачу одежды?",
      text: `${item.name || "Предмет"} будет отмечен как сданный сегодняшней датой.`,
      action: async () => {
        setConfirm(null);
        await handleMutation(
          "return_cloth",
          {
            user_id: employee.user.id,
            cloth_id: item.cloth_id ?? item.id,
            item_id: item.id,
            date_end: dayjs().format("YYYY-MM-DD"),
          },
          "Сдача одежды сохранена",
        );
      },
    });
  };

  const loadClothList = async () => {
    const res = await getData("get_cloth_list");

    if (res) {
      setRefs((prev) => ({
        ...prev,
        cloth: normalizeOptions(res.cloth ?? res.items ?? res),
      }));
    }

    setClothDialog(true);
  };

  const saveClothList = async (items) => {
    const ok = await handleMutation("save_cloth_list", { items }, "Список одежды сохранён", false);

    if (ok) {
      setRefs((prev) => ({ ...prev, cloth: items }));
      setClothName("");
    }
  };

  const addClothItem = async () => {
    if (!clothName.trim()) return;

    const nextItems = [...refs.cloth, { id: "0", name: clothName.trim() }];
    await saveClothList(nextItems);
  };

  const deleteClothItem = (item) => {
    setConfirm({
      title: "Удалить предмет одежды?",
      text: item.name,
      action: async () => {
        const res = await getData("delete_cloth_item", { id: item.id, item });

        if (res?.st === false) {
          showAlert(false, res.text);
        } else {
          const nextItems = refs.cloth.filter((cloth) => !sameId(cloth, item));
          setRefs((prev) => ({ ...prev, cloth: nextItems }));
          showAlert(true, res?.text || "Предмет удалён");
        }

        setConfirm(null);
      },
    });
  };

  const openCreateDialog = () => {
    setNewEmployee({
      ...emptyEmployee,
      photo_file: null,
      health_items: getEmptyHealthItems(),
      cloth_items: [],
      absences: [],
    });
    setNewDialog(true);
  };

  const createEmployee = async () => {
    const user = { ...newEmployee };
    const photoFile = user.photo_file;
    const healthItems = asArray(user.health_items);
    const clothItems = asArray(user.cloth_items);
    const absences = asArray(user.absences);

    delete user.photo_file;
    delete user.health_items;
    delete user.cloth_items;
    delete user.absences;
    user.point_access_ids = asArray(user.point_access)
      .map((point) => parseInt(point?.id))
      .filter((id) => id > 0);

    const payload = {
      user,
      employee: user,
      health_items: healthItems,
      cloth_items: clothItems,
      absences,
    };
    const res = photoFile
      ? await uploadData("create_employee", photoFile, payload)
      : await getData("create_employee", payload);

    if (!res) return;

    if (res.st === false) {
      showAlert(false, res.text);
      return;
    }

    showAlert(true, res.text || "Сотрудник создан");
    await refreshEmployees();
    setNewDialog(false);
  };

  const handleRowsChange = (event) => {
    const value = parseInt(event.target.value);

    setRows(value);
    setPage(0);
    refreshEmployees(filtersRef.current, 0, value);
  };

  const handlePageChange = (_, value) => {
    setPage(value);

    if (totalRows > employees.length) {
      refreshEmployees(filtersRef.current, value, rows);
    }
  };

  const handleFilterDraftChange = (patch) => {
    const nextFilters = { ...filtersRef.current, ...patch };

    filtersRef.current = nextFilters;
    setFilters(nextFilters);
    setPage(0);
    return nextFilters;
  };

  const applyFilters = (nextFilters = filtersRef.current) => {
    filtersRef.current = nextFilters;
    setFilters(nextFilters);
    setPage(0);
    refreshEmployees(nextFilters, 0, rows);
  };

  const changeSort = (by) => {
    const nextSort =
      sort.by === by
        ? { by, direction: sort.direction === "asc" ? "desc" : "asc" }
        : { by, direction: "asc" };

    setSort(nextSort);
    setPage(0);
    refreshEmployees(filtersRef.current, 0, rows, nextSort);
  };

  const sortLabel = (label, by) =>
    `${label}${sort.by === by ? (sort.direction === "asc" ? " ↑" : " ↓") : ""}`;

  const renderExperienceStats = () => {
    const items = stats.experience.length
      ? stats.experience
      : [
          { name: "Менее года", count: 0 },
          { name: "1 год", count: 0 },
          { name: "2 года", count: 0 },
          { name: "3-4 года", count: 0 },
          { name: "5+ лет", count: 0 },
        ];

    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(5, 1fr)" },
          gap: 1,
          flex: 1,
        }}
      >
        {items.slice(0, 5).map((item, index) => (
          <Box
            key={`${item.name || item.days}-${index}`}
            sx={{
              p: 0.75,
              borderRadius: "8px",
              bgcolor: "#f8fafc",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography sx={{ fontSize: 20, fontWeight: 900 }}>
              {item.count ?? item.total ?? 0}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
              {item.name || (item.days === "0" ? "Менее года" : `${item.days} год`)}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  const renderEmploymentStats = () => {
    const official = stats.employment.true_count ?? stats.employment.official_count ?? 0;
    const unofficial = stats.employment.false_count ?? stats.employment.unofficial_count ?? 0;
    const officialPercent = stats.employment.true_perc ?? stats.employment.official_percent ?? 0;
    const unofficialPercent =
      stats.employment.false_perc ?? stats.employment.unofficial_percent ?? 0;

    return (
      <Box
        sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1, flex: 1 }}
      >
        <Box
          sx={{
            p: 1,
            borderRadius: "8px",
            bgcolor: "#eef2ff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>Официально</Typography>
          <Stack
            direction="row"
            spacing={1}
            alignItems="baseline"
          >
            <Box
              component="span"
              sx={{ fontSize: "24px !important", lineHeight: 1.15, fontWeight: 900 }}
            >
              {official}
            </Box>
            <Box
              component="span"
              sx={{ fontSize: "12px !important", fontWeight: 700, color: "text.secondary" }}
            >
              {officialPercent}%
            </Box>
          </Stack>
        </Box>
        <Box
          sx={{
            p: 1,
            borderRadius: "8px",
            bgcolor: "#f8fafc",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>Неофициально</Typography>
          <Stack
            direction="row"
            spacing={1}
            alignItems="baseline"
          >
            <Box
              component="span"
              sx={{ fontSize: "24px !important", lineHeight: 1.15, fontWeight: 900 }}
            >
              {unofficial}
            </Box>
            <Box
              component="span"
              sx={{ fontSize: "12px !important", fontWeight: 700, color: "text.secondary" }}
            >
              {unofficialPercent}%
            </Box>
          </Stack>
        </Box>
      </Box>
    );
  };

  const renderCafeStats = () => {
    const cafes = stats.analytics.cafes;
    const toggleCafe = (name) => {
      setExpandedCafes((prev) =>
        prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name],
      );
    };
    const toggleOfficeUnit = (key) => {
      setExpandedOfficeUnits((prev) =>
        prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
      );
    };

    const renderStatCells = (item) => {
      const officialPercent = item.headcount
        ? Math.round((100 * item.official) / item.headcount)
        : 0;

      return (
        <>
          <TableCell align="center">{item.headcount}</TableCell>
          <TableCell align="center">
            {item.official} ({officialPercent}%)
          </TableCell>
          <TableCell align="center">{item.hired_30}</TableCell>
          <TableCell align="center">
            <Chip
              size="small"
              label={item.health_risk}
              color={item.health_risk ? "warning" : "default"}
              sx={{ fontWeight: 800 }}
            />
          </TableCell>
          <TableCell align="center">
            <Chip
              size="small"
              label={item.health_blocked}
              color={item.health_blocked ? "error" : "default"}
              sx={{ fontWeight: 800 }}
            />
          </TableCell>
          <TableCell align="center">
            <Chip
              size="small"
              label={item.absent_today}
              color={item.absent_today ? "info" : "default"}
              sx={{ fontWeight: 800 }}
            />
          </TableCell>
          <TableCell align="center">
            <Chip
              size="small"
              label={item.absence_upcoming_7}
              color={item.absence_upcoming_7 ? "secondary" : "default"}
              sx={{ fontWeight: 800 }}
            />
          </TableCell>
        </>
      );
    };

    const renderAnalyticsHeader = (label) => (
      <TableRow sx={tableHeaderSx}>
        <TableCell>{label}</TableCell>
        <TableCell align="center">Работают</TableCell>
        <TableCell align="center">Официально</TableCell>
        <TableCell align="center">Принято за 30 дней</TableCell>
        <TableCell align="center">Медкнижка: риск</TableCell>
        <TableCell align="center">Медкнижка: блок</TableCell>
        <TableCell align="center">Отсутствуют</TableCell>
        <TableCell align="center">Отсутствие в ближайшие 7 дней</TableCell>
      </TableRow>
    );

    const renderPositionsTable = (positions) => (
      <Table
        size="small"
        sx={{ bgcolor: "background.paper", border: "1px solid #e5e7eb" }}
      >
        <TableHead>{renderAnalyticsHeader("Должность")}</TableHead>
        <TableBody>
          {asArray(positions).map((position) => (
            <TableRow
              key={position.name}
              hover
            >
              <TableCell sx={{ fontWeight: 700 }}>{position.name}</TableCell>
              {renderStatCells(position)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );

    const renderUnitsTable = (cafe) => (
      <Table
        size="small"
        sx={{ bgcolor: "background.paper", border: "1px solid #e5e7eb" }}
      >
        <TableHead>{renderAnalyticsHeader("Отдел")}</TableHead>
        <TableBody>
          {asArray(cafe.units).map((unit) => {
            const unitKey = `${cafe.name}-${unit.id ?? "without_unit"}`;
            const isUnitExpanded = expandedOfficeUnits.includes(unitKey);

            return (
              <React.Fragment key={unitKey}>
                <TableRow
                  hover
                  onClick={() => toggleOfficeUnit(unitKey)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell sx={{ fontWeight: 700 }}>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      alignItems="center"
                    >
                      {isUnitExpanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
                      <Box component="span">{unit.name}</Box>
                    </Stack>
                  </TableCell>
                  {renderStatCells(unit)}
                </TableRow>
                <TableRow>
                  <TableCell
                    colSpan={8}
                    sx={{ p: 0, borderBottom: isUnitExpanded ? undefined : 0 }}
                  >
                    <Collapse
                      in={isUnitExpanded}
                      timeout="auto"
                      unmountOnExit
                    >
                      <Box sx={{ px: 2, py: 1.25, bgcolor: "#f8fafc" }}>
                        <Typography
                          sx={{ mb: 0.75, fontSize: 13, fontWeight: 800, color: "text.secondary" }}
                        >
                          Должности отдела
                        </Typography>
                        {renderPositionsTable(unit.positions)}
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    );

    return (
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table
          size="small"
          sx={{ minWidth: 1120 }}
        >
          <TableHead>{renderAnalyticsHeader("Основное кафе")}</TableHead>
          <TableBody>
            {cafes.map((item) => {
              const isExpanded = expandedCafes.includes(item.name);
              const hasUnits = item.name === "Офис" && asArray(item.units).length > 0;

              return (
                <React.Fragment key={item.name}>
                  <TableRow
                    hover
                    onClick={() => toggleCafe(item.name)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell sx={{ fontWeight: 700 }}>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                      >
                        {isExpanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
                        <Box component="span">{item.name}</Box>
                      </Stack>
                    </TableCell>
                    {renderStatCells(item)}
                  </TableRow>
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      sx={{ p: 0, borderBottom: isExpanded ? undefined : 0 }}
                    >
                      <Collapse
                        in={isExpanded}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box sx={{ px: 2, py: 1.25, bgcolor: "#fafafa" }}>
                          <Typography
                            sx={{
                              mb: 0.75,
                              fontSize: 13,
                              fontWeight: 800,
                              color: "text.secondary",
                            }}
                          >
                            {hasUnits ? "Отделы" : "Должности"}
                          </Typography>
                          {hasUnits ? renderUnitsTable(item) : renderPositionsTable(item.positions)}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
            {!cafes.length ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  align="center"
                  sx={{ py: 3, color: "text.secondary" }}
                >
                  Нет данных по кафе
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <>
      <Backdrop
        style={{ zIndex: 99999 }}
        open={isLoad}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <MyAlert
        isOpen={alert.open}
        onClose={() => setAlert((prev) => ({ ...prev, open: false }))}
        status={alert.status}
        text={alert.text}
      />

      <Grid
        container
        rowSpacing={2.5}
        columnSpacing={2}
        className="container_first_child"
      >
        <Grid size={12}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
          >
            {pageTitle ? (
              <Typography
                component="h1"
                sx={{ m: 0, fontSize: { xs: 26, md: 32 }, fontWeight: 900 }}
              >
                {pageTitle}
              </Typography>
            ) : null}
            {permissions.addEmployee ? (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreateDialog}
                sx={{ alignSelf: { xs: "flex-start", sm: "auto" }, whiteSpace: "nowrap" }}
              >
                Добавить сотрудника
              </Button>
            ) : null}
          </Stack>
        </Grid>

        <Grid size={12}>
          <Tabs
            value={canViewHierarchy ? pageTab : "employees"}
            onChange={(_, value) => setPageTab(value)}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab
              value="employees"
              label="Сотрудники"
            />
            {canViewHierarchy ? (
              <Tab
                value="hierarchy"
                label="Иерархия найма"
              />
            ) : null}
          </Tabs>
        </Grid>

        {pageTab !== "hierarchy" || !canViewHierarchy ? (
          <>
            <Grid size={12}>
              <Paper
                variant="outlined"
                sx={{ ...compactPaperSx, p: 1.5 }}
              >
                <Grid
                  container
                  spacing={1.5}
                  alignItems="center"
                >
                  <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <CityCafeAutocomplete2
                      label="Кафе"
                      placeholder="Выберите кафе"
                      withAll
                      withAllSelected
                      withOrganizationMode={false}
                      compact
                      points={cafeFilterPoints}
                      value={filters.points}
                      onChange={(value) =>
                        handleFilterDraftChange({
                          city: getCityIdFromPoints(value),
                          points: value || [],
                        })
                      }
                      onBlur={() => applyFilters()}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <MyAutocomplite
                      label="Должность"
                      multiple={false}
                      data={refs.apps}
                      value={filters.app}
                      func={(_, value) => handleFilterDraftChange({ app: value })}
                      onBlur={() => applyFilters()}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <MyTextInput
                      label="Поиск по ФИО или телефону"
                      placeholder="Иванов или +7911..."
                      value={filters.search}
                      func={(event) => handleFilterDraftChange({ search: event.target.value })}
                      onBlur={(event) =>
                        applyFilters({ ...filtersRef.current, search: event.target.value })
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          applyFilters({ ...filtersRef.current, search: event.target.value });
                        }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <MyAutocomplite
                      label="Оф. статус"
                      multiple={false}
                      data={officialFilters}
                      value={filters.official}
                      func={(_, value) =>
                        handleFilterDraftChange({ official: value || officialFilters[0] })
                      }
                      onBlur={() => applyFilters()}
                      isOptionEqualToValue={(option, value) => option?.id === value?.id}
                      disableClearable
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <MyAutocomplite
                      label="Медкнижка"
                      multiple={false}
                      data={healthBookFilters}
                      value={filters.healthBook}
                      func={(_, value) =>
                        handleFilterDraftChange({ healthBook: value || healthBookFilters[0] })
                      }
                      onBlur={() => applyFilters()}
                      isOptionEqualToValue={(option, value) => option?.id === value?.id}
                      disableClearable
                    />
                  </Grid>

                  <Grid size={12}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      alignItems={{ xs: "stretch", sm: "center" }}
                      justifyContent="flex-end"
                    >
                      <Typography
                        sx={{
                          mr: { sm: "auto" },
                          fontSize: 13,
                          color: "text.secondary",
                          alignSelf: { xs: "flex-start", sm: "center" },
                        }}
                      >
                        Найдено: {totalRows || employees.length}
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={() => applyFilters()}
                        sx={{ whiteSpace: "nowrap" }}
                      >
                        Обновить
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {permissions.mainStats ? (
              <React.Fragment>
                <Grid size={12}>
                  <Grid
                    container
                    spacing={2}
                  >
                    <Grid size={{ xs: 12, md: 6 }}>
                      <StatCard title="Стаж сотрудников">{renderExperienceStats()}</StatCard>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <StatCard title="Трудоустройство">{renderEmploymentStats()}</StatCard>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid
                  size={12}
                  sx={{ mt: 2 }}
                >
                  <StatCard title="Ситуация по кафе">{renderCafeStats()}</StatCard>
                </Grid>
              </React.Fragment>
            ) : null}

            <Grid
              size={12}
              sx={{ mt: 2 }}
            >
              <Paper
                variant="outlined"
                sx={{ ...compactPaperSx, overflow: "hidden", mb: 4 }}
              >
                <TableContainer sx={{ overflowX: "auto" }}>
                  <Table
                    size="small"
                    sx={{ minWidth: 1180 }}
                  >
                    <TableHead>
                      <TableRow sx={tableHeaderSx}>
                        <TableCell
                          onClick={() => changeSort("fio")}
                          sx={{ cursor: "pointer" }}
                        >
                          {sortLabel("ФИО", "fio")}
                        </TableCell>
                        <TableCell>Телефон</TableCell>
                        <TableCell
                          onClick={() => changeSort("position")}
                          sx={{ cursor: "pointer" }}
                        >
                          {sortLabel("Должность", "position")}
                        </TableCell>
                        <TableCell
                          onClick={() => changeSort("cafe")}
                          sx={{ cursor: "pointer" }}
                        >
                          {sortLabel("Кафе", "cafe")}
                        </TableCell>
                        <TableCell
                          onClick={() => changeSort("employment_date")}
                          sx={{ cursor: "pointer" }}
                        >
                          {sortLabel("Принят", "employment_date")}
                        </TableCell>
                        <TableCell>Стаж</TableCell>
                        <TableCell align="center">Оф.</TableCell>
                        <TableCell>Медкнижка</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {visibleEmployees.map((item) => {
                        const health = getHealthStatusMeta(item);

                        return (
                          <TableRow
                            key={item.id}
                            hover={canOpenEmployeeCard(permissions)}
                            onClick={() => openEmployee(item.id)}
                            sx={{
                              cursor: canOpenEmployeeCard(permissions) ? "pointer" : "default",
                            }}
                          >
                            <TableCell>
                              <Stack
                                direction="row"
                                spacing={1.25}
                                alignItems="center"
                              >
                                <EmployeeAvatar employee={item} />
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography
                                    sx={{ fontWeight: 800, maxWidth: 240 }}
                                    noWrap
                                  >
                                    {item.displayName}
                                  </Typography>
                                  {String(item.is_active) === "0" ? (
                                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                                      уволен
                                    </Typography>
                                  ) : null}
                                </Box>
                              </Stack>
                            </TableCell>
                            <TableCell>{item.phone || "—"}</TableCell>
                            <TableCell>{item.app_name || "—"}</TableCell>
                            <TableCell>{item.point || "—"}</TableCell>
                            <TableCell>{formatDate(item.date_registration)}</TableCell>
                            <TableCell>{item.exp || "—"}</TableCell>
                            <TableCell align="center">
                              <Chip
                                size="small"
                                label={parseInt(item.acc_to_kas) === 1 ? "Да" : "Нет"}
                                color={parseInt(item.acc_to_kas) === 1 ? "success" : "error"}
                                sx={{ fontWeight: 800 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={health.label}
                                color={health.color}
                                sx={{ fontWeight: 800 }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {!visibleEmployees.length ? (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            align="center"
                            sx={{ py: 5, color: "text.secondary" }}
                          >
                            Сотрудники не найдены
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={totalRows || employees.length}
                  page={page}
                  rowsPerPage={rows}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsChange}
                  labelRowsPerPage="Строк на странице"
                  rowsPerPageOptions={[25, 50, 100, { value: -1, label: "Все" }]}
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}–${to} из ${count !== -1 ? count : `больше, чем ${to}`}`
                  }
                />
              </Paper>
            </Grid>
          </>
        ) : (
          <Grid size={12}>
            <EmployeeHierarchyTab
              request={getData}
              showAlert={showAlert}
            />
          </Grid>
        )}
      </Grid>

      <EmployeeDialog
        open={employeeDialog}
        fullScreen={fullScreen}
        employee={employee}
        activeTab={activeTab}
        refs={refs}
        permissions={permissions}
        absence={absence}
        clothIssue={clothIssue}
        onClose={() => {
          setEmployeeDialog(false);
          setEmployee(null);
          setEmployeePhotoFile(null);
          setAbsence(emptyAbsence);
        }}
        onTabChange={setActiveTab}
        onUserChange={updateEmployeeUser}
        onHealthChange={updateHealthItem}
        photoFile={employeePhotoFile}
        onPhotoFileChange={setEmployeePhotoFile}
        onSaveBasic={saveBasic}
        onApplyWork={applyWorkChange}
        onAbsenceChange={setAbsence}
        onSaveAbsence={saveAbsence}
        onEditAbsence={editAbsence}
        onDeleteAbsence={deleteAbsence}
        onHealthSave={saveHealthBook}
        onClothIssueChange={setClothIssue}
        onIssueCloth={issueCloth}
        onReturnCloth={returnCloth}
        onManageCloth={loadClothList}
      />

      <CreateEmployeeDialog
        open={newDialog}
        fullScreen={fullScreen}
        employee={newEmployee}
        refs={refs}
        onClose={() => setNewDialog(false)}
        onChange={updateNewEmployee}
        onCreate={createEmployee}
      />

      <ClothListDialog
        open={clothDialog}
        fullScreen={fullScreen}
        items={refs.cloth}
        value={clothName}
        onValueChange={setClothName}
        onClose={() => setClothDialog(false)}
        onAdd={addClothItem}
        onDelete={deleteClothItem}
      />

      <Dialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
      >
        <DialogTitle>{confirm?.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirm?.text}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(null)}>Отмена</Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirm?.action}
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function EmployeeDialog({
  open,
  fullScreen,
  employee,
  activeTab,
  refs,
  permissions,
  absence,
  clothIssue,
  onClose,
  onTabChange,
  onUserChange,
  onHealthChange,
  photoFile,
  onPhotoFileChange,
  onSaveBasic,
  onApplyWork,
  onAbsenceChange,
  onSaveAbsence,
  onEditAbsence,
  onDeleteAbsence,
  onHealthSave,
  onClothIssueChange,
  onIssueCloth,
  onReturnCloth,
  onManageCloth,
}) {
  const user = employee?.user;
  const appOptions = employee?.appointment?.length ? employee.appointment : refs.apps;
  const pointOptions = employee?.point_list?.length ? employee.point_list : refs.points;
  const cafeAccessOptions = getRealCafes(refs.points.length ? refs.points : pointOptions);
  const selectedApp = findOption(appOptions, user?.app_id) ?? user?.app_id;
  const isAuthCodeRequired = authCodeRequiredForApp(selectedApp, appOptions);
  const isDismissal = parseInt(idOf(user?.app_id)) === 0;
  const basicCanEdit = hasBasicEmployeeEdit(permissions);
  const hasPersonalView =
    permissions.fullName.view ||
    permissions.phone.view ||
    permissions.birthDate.view ||
    permissions.authCode.view ||
    permissions.inn.view;
  const healthItems = employee ? getHealthItems(employee) : [];
  const overallHealth = (() => {
    const statuses = healthItems.map((item) => getHealthItemStatus(item));

    if (statuses.some((item) => item.color === "error")) return "Просрочено";
    if (statuses.some((item) => item.color === "warning")) return "Скоро истекает";
    if (!statuses.length || statuses.some((item) => item.label === "Нет даты")) {
      return "Не заполнена";
    }

    return "Актуально";
  })();

  if (!employee || !user) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      fullScreen={fullScreen}
      scroll="paper"
    >
      <DialogTitle className="button">
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ minWidth: 0 }}
        >
          {permissions.photo.view ? (
            <EmployeeAvatar
              employee={user}
              size={42}
            />
          ) : null}
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{ fontWeight: 900 }}
              noWrap
            >
              {permissions.fullName.view ? joinName(user) : `Сотрудник #${user.id}`}
            </Typography>
            {permissions.workTab.view ? (
              <Chip
                size="small"
                label={
                  isDismissal
                    ? "Уволен"
                    : parseInt(user.acc_to_kas) === 1
                      ? "Официально трудоустроен"
                      : "Работает"
                }
                color={!isDismissal && parseInt(user.acc_to_kas) === 1 ? "success" : "default"}
                sx={{ mt: 0.5, fontWeight: 700 }}
              />
            ) : null}
          </Box>
        </Stack>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 1 }}>
          <Tabs
            value={activeTab}
            onChange={(_, value) => onTabChange(value)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {hasBasicEmployeeView(permissions) ? (
              <Tab
                label="Основное"
                value="basic"
              />
            ) : null}
            {permissions.workTab.view ? (
              <Tab
                label="Работа"
                value="work"
              />
            ) : null}
            {permissions.absences.view ? (
              <Tab
                label="Отсутствия"
                value="absence"
              />
            ) : null}
            {permissions.healthBook.view ? (
              <Tab
                label="Мед книжка"
                value="health"
              />
            ) : null}
            {permissions.clothing.view ? (
              <Tab
                label="Одежда"
                value="cloth"
              />
            ) : null}
            <Tab
              label="История"
              value="history"
            />
          </Tabs>
        </Box>

        <TabPanel
          active={activeTab}
          value="basic"
        >
          <Grid
            container
            spacing={2}
          >
            {permissions.photo.view ? (
              <Grid size={{ xs: 12, md: 3 }}>
                <EmployeePhotoDropzone
                  user={user}
                  file={photoFile}
                  disabled={!permissions.photo.edit}
                  onFileChange={onPhotoFileChange}
                />
              </Grid>
            ) : null}
            <Grid size={{ xs: 12, md: permissions.photo.view ? 9 : 12 }}>
              <Grid
                container
                spacing={1.5}
                alignItems="flex-start"
                sx={{ alignContent: "flex-start" }}
              >
                {hasPersonalView ? (
                  <Grid size={12}>
                    <Typography sx={{ color: "text.secondary", fontSize: 13, fontWeight: 900 }}>
                      Личные данные
                    </Typography>
                  </Grid>
                ) : null}
                {permissions.fullName.view ? (
                  <React.Fragment>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      {permissions.fullName.edit ? (
                        <MyTextInput
                          label="Фамилия"
                          value={user.fam}
                          func={(event) => onUserChange("fam", event.target.value)}
                        />
                      ) : (
                        <EmployeeViewField
                          label="Фамилия"
                          value={user.fam}
                        />
                      )}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      {permissions.fullName.edit ? (
                        <MyTextInput
                          label="Имя"
                          value={user.name}
                          func={(event) => onUserChange("name", event.target.value)}
                        />
                      ) : (
                        <EmployeeViewField
                          label="Имя"
                          value={user.name}
                        />
                      )}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      {permissions.fullName.edit ? (
                        <MyTextInput
                          label="Отчество"
                          value={user.otc}
                          func={(event) => onUserChange("otc", event.target.value)}
                        />
                      ) : (
                        <EmployeeViewField
                          label="Отчество"
                          value={user.otc}
                        />
                      )}
                    </Grid>
                  </React.Fragment>
                ) : null}
                {permissions.phone.view ? (
                  <Grid size={{ xs: 12, sm: 4 }}>
                    {permissions.phone.edit ? (
                      <MyTextInput
                        label="Телефон"
                        value={user.login}
                        func={(event) => onUserChange("login", event.target.value)}
                      />
                    ) : (
                      <EmployeeViewField
                        label="Телефон"
                        value={user.login}
                      />
                    )}
                  </Grid>
                ) : null}
                {permissions.birthDate.view ? (
                  <Grid size={{ xs: 12, sm: 4 }}>
                    {permissions.birthDate.edit ? (
                      <MyDatePickerNew
                        label="Дата рождения"
                        value={user.birthday}
                        func={(value) =>
                          onUserChange("birthday", value ? value.format("YYYY-MM-DD") : "")
                        }
                      />
                    ) : (
                      <EmployeeViewField
                        label="Дата рождения"
                        value={formatActivityHistoryDate(user.birthday)}
                      />
                    )}
                  </Grid>
                ) : null}
                {permissions.authCode.view ? (
                  <Grid size={{ xs: 12, sm: 4 }}>
                    {permissions.authCode.edit ? (
                      <MyTextInput
                        label="Код авторизации"
                        value={isAuthCodeRequired ? user.auth_code : ""}
                        disabled={!isAuthCodeRequired}
                        func={(event) => onUserChange("auth_code", event.target.value)}
                      />
                    ) : (
                      <EmployeeViewField
                        label="Код авторизации"
                        value={isAuthCodeRequired ? user.auth_code : "—"}
                      />
                    )}
                  </Grid>
                ) : null}
                {permissions.inn.view ? (
                  <Grid size={{ xs: 12, sm: 4 }}>
                    {permissions.inn.edit ? (
                      <MyTextInput
                        label="ИНН"
                        value={user.inn}
                        func={(event) => onUserChange("inn", event.target.value)}
                      />
                    ) : (
                      <EmployeeViewField
                        label="ИНН"
                        value={user.inn}
                      />
                    )}
                  </Grid>
                ) : null}
              </Grid>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel
          active={activeTab}
          value="work"
        >
          {permissions.position.edit ? (
            <Grid
              container
              spacing={2}
            >
              <Grid size={{ xs: 12, sm: 6 }}>
                <MyAutocomplite
                  label="Должность"
                  data={appOptions}
                  value={selectedApp}
                  multiple={false}
                  func={(_, value) => onUserChange("app_id", value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <MyDatePickerNew
                  label="Дата применения изменений"
                  value={user.date_start_day || dayjs().format("YYYY-MM-DD")}
                  minDate={dayjs()}
                  func={(value) =>
                    onUserChange("date_start_day", value ? value.format("YYYY-MM-DD") : "")
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <MyCheckBox
                  label="Официальное трудоустройство"
                  value={parseInt(user.acc_to_kas) === 1}
                  disabled={isDismissal}
                  func={(event) => onUserChange("acc_to_kas", event.target.checked ? 1 : 0)}
                />
              </Grid>
              <Grid size={12}>
                <CityCafeAutocomplete2
                  label="Доступные кафе"
                  placeholder="Выберите кафе"
                  withAll
                  withOrganizationMode={false}
                  compact
                  points={cafeAccessOptions}
                  value={asArray(user.point_access)}
                  onChange={(value) => onUserChange("point_access", value || [])}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <EmployeeViewField label="Стаж">
                  <Typography sx={{ fontSize: 15, fontWeight: 800 }}>
                    {[
                      user.date_registration
                        ? `с ${formatActivityHistoryDate(user.date_registration)}`
                        : null,
                      user.exp ?? employee.user.experience ?? null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </Typography>
                </EmployeeViewField>
              </Grid>
              {isDismissal ? (
                <Grid size={12}>
                  <MyTextInput
                    label="Причина увольнения"
                    value={user.textDel ?? ""}
                    multiline
                    minRows={3}
                    func={(event) => onUserChange("textDel", event.target.value)}
                  />
                </Grid>
              ) : null}
              <Grid size={12}>
                <Button
                  variant="contained"
                  onClick={onApplyWork}
                >
                  Применить изменения
                </Button>
              </Grid>
            </Grid>
          ) : (
            <Grid
              container
              spacing={2}
            >
              <Grid size={{ xs: 12, sm: 6 }}>
                <EmployeeViewField
                  label="Должность"
                  value={selectedApp?.name ?? user.app_name}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <EmployeeViewField label="Статус">
                  <Chip
                    size="small"
                    label={isDismissal ? "Уволен" : "Работает"}
                    color={isDismissal ? "default" : "success"}
                    sx={{ fontWeight: 800 }}
                  />
                </EmployeeViewField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <EmployeeViewField label="Стаж">
                  <Typography sx={{ fontSize: 15, fontWeight: 800 }}>
                    {[
                      user.date_registration
                        ? `с ${formatActivityHistoryDate(user.date_registration)}`
                        : null,
                      user.exp ?? employee.user.experience ?? null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </Typography>
                </EmployeeViewField>
              </Grid>
              {isDismissal ? (
                <Grid size={12}>
                  <EmployeeViewField
                    label="Причина увольнения"
                    value={user.textDel}
                  />
                </Grid>
              ) : null}
            </Grid>
          )}
        </TabPanel>

        <TabPanel
          active={activeTab}
          value="absence"
        >
          {permissions.absences.edit ? (
            <Grid
              container
              spacing={2}
              alignItems="center"
            >
              <Grid size={{ xs: 12, sm: 3 }}>
                <MyAutocomplite
                  label="Тип"
                  data={absenceTypes}
                  value={absence.type}
                  multiple={false}
                  func={(_, value) =>
                    onAbsenceChange({ ...absence, type: value || absenceTypes[0] })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <MyDatePickerNew
                  label="С"
                  value={absence.start}
                  func={(value) =>
                    onAbsenceChange({ ...absence, start: value ? value.format("YYYY-MM-DD") : "" })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <MyDatePickerNew
                  label="По"
                  value={absence.end}
                  minDate={absence.start ? dayjs(absence.start) : null}
                  func={(value) =>
                    onAbsenceChange({ ...absence, end: value ? value.format("YYYY-MM-DD") : "" })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <MyTextInput
                  label="Комментарий"
                  value={absence.comment}
                  func={(event) => onAbsenceChange({ ...absence, comment: event.target.value })}
                />
              </Grid>
              <Grid size={12}>
                <Stack
                  direction="row"
                  spacing={1}
                >
                  <Button
                    variant="contained"
                    onClick={onSaveAbsence}
                  >
                    {absence.id ? "Сохранить" : "Добавить"}
                  </Button>
                  {absence.id ? (
                    <Button
                      variant="outlined"
                      onClick={() => onAbsenceChange(emptyAbsence)}
                    >
                      Отмена
                    </Button>
                  ) : null}
                </Stack>
              </Grid>
            </Grid>
          ) : null}
          <SimpleTable
            sx={{ mt: permissions.absences.edit ? 2 : 0 }}
            columns={[
              "Тип",
              "С",
              "По",
              "Комментарий",
              "Создатель",
              "Дата создания",
              ...(permissions.absences.edit ? [""] : []),
            ]}
            rows={employee.absence_history}
            renderRow={(item, index) => (
              <TableRow key={item.id ?? index}>
                <TableCell>{item.absence_type ?? item.type_name ?? item.type ?? "—"}</TableCell>
                <TableCell>{formatActivityHistoryDate(item.date_start ?? item.start)}</TableCell>
                <TableCell>{formatActivityHistoryDate(item.date_end ?? item.end)}</TableCell>
                <TableCell>{item.comment ?? item.commentVacation ?? "—"}</TableCell>
                <TableCell>{item.user_name ?? item.actor_name ?? "—"}</TableCell>
                <TableCell>
                  {formatActivityHistoryDate(item.date_create ?? item.created_at)}
                </TableCell>
                {permissions.absences.edit ? (
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={0.5}
                      justifyContent="flex-end"
                    >
                      <Tooltip title="Редактировать">
                        <IconButton
                          size="small"
                          onClick={() => onEditAbsence(item)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDeleteAbsence(item)}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                ) : null}
              </TableRow>
            )}
          />
        </TabPanel>

        <TabPanel
          active={activeTab}
          value="health"
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            sx={{ mb: 1.5 }}
          >
            <Chip
              label={`Общий статус: ${overallHealth}`}
              color={
                overallHealth === "Просрочено"
                  ? "error"
                  : overallHealth === "Скоро истекает"
                    ? "warning"
                    : overallHealth === "Не заполнена"
                      ? "default"
                      : "success"
              }
              sx={{ fontWeight: 800 }}
            />
            {permissions.healthBook.edit ? (
              <Button
                variant="contained"
                onClick={onHealthSave}
              >
                Сохранить медкнижку
              </Button>
            ) : null}
          </Stack>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={tableHeaderSx}>
                  <TableCell>Проверка</TableCell>
                  <TableCell>Дата прохождения</TableCell>
                  <TableCell>Дата окончания</TableCell>
                  <TableCell>Статус</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {healthItems.map((item) => {
                  const status = getHealthItemStatus(item);

                  return (
                    <TableRow key={item.type ?? item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        {permissions.healthBook.edit ? (
                          <MyDatePickerNew
                            label="Дата"
                            value={item.start ?? item.date_start}
                            func={(value) => onHealthChange(item.type, "start", value)}
                          />
                        ) : (
                          <Typography sx={{ fontWeight: 700 }}>
                            {formatActivityHistoryDate(item.start ?? item.date_start)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {permissions.healthBook.edit ? (
                          <MyDatePickerNew
                            label="Дата"
                            value={item.end ?? item.date_end}
                            func={(value) => onHealthChange(item.type, "end", value)}
                          />
                        ) : (
                          <Typography sx={{ fontWeight: 700 }}>
                            {formatActivityHistoryDate(item.end ?? item.date_end)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={status.label}
                          color={status.color}
                          sx={{ fontWeight: 800 }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel
          active={activeTab}
          value="cloth"
        >
          {permissions.clothing.edit ? (
            <Grid
              container
              spacing={2}
              alignItems="center"
            >
              <Grid size={{ xs: 12, sm: 5 }}>
                <MyAutocomplite
                  label="Предмет"
                  data={refs.cloth}
                  value={clothIssue.item}
                  multiple={false}
                  func={(_, value) => onClothIssueChange({ ...clothIssue, item: value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <MyDatePickerNew
                  label="Дата выдачи"
                  value={clothIssue.date_start}
                  func={(value) =>
                    onClothIssueChange({
                      ...clothIssue,
                      date_start: value ? value.format("YYYY-MM-DD") : "",
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Stack
                  direction="row"
                  spacing={1}
                >
                  <Button
                    variant="contained"
                    onClick={onIssueCloth}
                  >
                    Выдать
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={onManageCloth}
                  >
                    Управление списком
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          ) : null}
          <Typography sx={{ mt: permissions.clothing.edit ? 3 : 0, mb: 1, fontWeight: 900 }}>
            Активные предметы
          </Typography>
          <SimpleTable
            columns={["Предмет", "Выдан", "Сдан", ...(permissions.clothing.edit ? [""] : [])]}
            rows={employee.cloth.active}
            renderRow={(item, index) => (
              <TableRow key={item.id ?? `${item.cloth_id}-${index}`}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{formatActivityHistoryDate(item.date_start)}</TableCell>
                <TableCell>{formatActivityHistoryDate(item.date_end)}</TableCell>
                {permissions.clothing.edit ? (
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onReturnCloth(item)}
                    >
                      Принять сдачу
                    </Button>
                  </TableCell>
                ) : null}
              </TableRow>
            )}
          />
          <Typography sx={{ mt: 3, mb: 1, fontWeight: 900 }}>Сданная одежда</Typography>
          <SimpleTable
            columns={["Предмет", "Выдан", "Сдан"]}
            rows={employee.cloth.non_active}
            renderRow={(item, index) => (
              <TableRow key={item.id ?? index}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{formatActivityHistoryDate(item.date_start)}</TableCell>
                <TableCell>{formatActivityHistoryDate(item.date_end)}</TableCell>
              </TableRow>
            )}
          />
        </TabPanel>

        <TabPanel
          active={activeTab}
          value="history"
        >
          <EmployeeHistoryTable
            history={employee.history}
            permissions={permissions}
          />
        </TabPanel>
      </DialogContent>
      {activeTab === "basic" && (basicCanEdit || permissions.photo.edit) ? (
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button
            variant="contained"
            onClick={onSaveBasic}
            disabled={!basicCanEdit && !(permissions.photo.edit && photoFile)}
          >
            Сохранить
          </Button>
        </DialogActions>
      ) : null}
    </Dialog>
  );
}

function CreateEmployeeDialog({ open, fullScreen, employee, refs, onClose, onChange, onCreate }) {
  const [activeTab, setActiveTab] = useState("basic");
  const [clothDraft, setClothDraft] = useState({
    item: null,
    date_start: dayjs().format("YYYY-MM-DD"),
  });
  const [absenceDraft, setAbsenceDraft] = useState(emptyAbsence);
  const healthItems = asArray(employee.health_items).length
    ? asArray(employee.health_items)
    : getEmptyHealthItems();
  const cafeOptions = getRealCafes(refs.points);
  const isAuthCodeRequired = authCodeRequiredForApp(employee.app_id, refs.apps);

  useEffect(() => {
    if (!open) return;

    setActiveTab("basic");
    setClothDraft({ item: null, date_start: dayjs().format("YYYY-MM-DD") });
    setAbsenceDraft(emptyAbsence);
  }, [open]);

  const updateHealthItem = (type, field, value) => {
    const formattedValue = value ? dayjs(value).format("YYYY-MM-DD") : "";
    const nextItems = healthItems.map((item) => {
      if (item.type !== type) return item;
      if (field !== "start") return { ...item, [field]: formattedValue };

      return {
        ...item,
        start: formattedValue,
        end: value
          ? dayjs(value)
              .add(type === "type_10" ? 2 : 1, "years")
              .format("YYYY-MM-DD")
          : "",
      };
    });

    onChange("health_items", nextItems);
  };

  const addCloth = () => {
    if (!clothDraft.item) return;

    const items = asArray(employee.cloth_items);
    if (items.some((item) => sameId(item.cloth_id, clothDraft.item.id))) return;

    onChange("cloth_items", [
      ...items,
      {
        cloth_id: clothDraft.item.id,
        name: clothDraft.item.name,
        date_start: formatDate(clothDraft.date_start),
      },
    ]);
    setClothDraft({ item: null, date_start: dayjs().format("YYYY-MM-DD") });
  };

  const addAbsence = () => {
    if (!absenceDraft.start || !absenceDraft.end) return;

    onChange("absences", [
      ...asArray(employee.absences),
      {
        id: `new-${Date.now()}`,
        type: absenceDraft.type,
        date_start: formatDate(absenceDraft.start),
        date_end: formatDate(absenceDraft.end),
        comment: absenceDraft.comment,
      },
    ]);
    setAbsenceDraft(emptyAbsence);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      fullScreen={fullScreen}
      scroll="paper"
    >
      <DialogTitle className="button">
        <Box>
          <Typography sx={{ fontWeight: 900 }}>Новый сотрудник</Typography>
          <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
            Заполните карточку сотрудника до создания
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 1 }}>
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label="Основное"
              value="basic"
            />
            <Tab
              label="Мед книжка"
              value="health"
            />
            <Tab
              label={`Одежда${asArray(employee.cloth_items).length ? ` (${asArray(employee.cloth_items).length})` : ""}`}
              value="cloth"
            />
            <Tab
              label={`Отсутствия${asArray(employee.absences).length ? ` (${asArray(employee.absences).length})` : ""}`}
              value="absence"
            />
          </Tabs>
        </Box>

        <TabPanel
          active={activeTab}
          value="basic"
        >
          <Grid
            container
            spacing={2}
          >
            <Grid size={{ xs: 12, md: 3 }}>
              <EmployeePhotoDropzone
                user={employee}
                file={employee.photo_file}
                disabled={false}
                onFileChange={(file) => onChange("photo_file", file)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 9 }}>
              <Grid
                container
                spacing={1.5}
              >
                <Grid size={{ xs: 12, sm: 4 }}>
                  <MyTextInput
                    label="Фамилия"
                    value={employee.fam}
                    func={(event) => onChange("fam", event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <MyTextInput
                    label="Имя"
                    value={employee.name}
                    func={(event) => onChange("name", event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <MyTextInput
                    label="Отчество"
                    value={employee.otc}
                    func={(event) => onChange("otc", event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <MyTextInput
                    label="Телефон"
                    value={employee.login}
                    func={(event) => onChange("login", event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <MyDatePickerNew
                    label="Дата рождения"
                    value={employee.birthday}
                    func={(value) => onChange("birthday", value ? value.format("YYYY-MM-DD") : "")}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <MyTextInput
                    label="Код авторизации"
                    value={isAuthCodeRequired ? employee.auth_code : ""}
                    disabled={!isAuthCodeRequired}
                    func={(event) => onChange("auth_code", event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <MyTextInput
                    label="ИНН"
                    value={employee.inn}
                    func={(event) => onChange("inn", event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <MyDatePickerNew
                    label="Дата трудоустройства"
                    value={employee.date_registration}
                    func={(value) =>
                      onChange("date_registration", value ? value.format("YYYY-MM-DD") : "")
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <MyAutocomplite
                    label="Должность"
                    data={refs.apps}
                    value={employee.app_id}
                    multiple={false}
                    func={(_, value) => onChange("app_id", value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <MyCheckBox
                    label="Официальное трудоустройство"
                    value={parseInt(employee.acc_to_kas) === 1}
                    func={(event) => onChange("acc_to_kas", event.target.checked ? 1 : 0)}
                  />
                </Grid>
                <Grid size={12}>
                  <CityCafeAutocomplete2
                    label="Доступные кафе"
                    placeholder="Выберите кафе"
                    withAll
                    withOrganizationMode={false}
                    compact
                    points={cafeOptions}
                    value={asArray(employee.point_access)}
                    onChange={(value) => onChange("point_access", value || [])}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel
          active={activeTab}
          value="health"
        >
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={tableHeaderSx}>
                  <TableCell>Проверка</TableCell>
                  <TableCell>Дата прохождения</TableCell>
                  <TableCell>Действует до</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {healthItems.map((item) => (
                  <TableRow key={item.type}>
                    <TableCell sx={{ fontWeight: 700 }}>{item.name}</TableCell>
                    <TableCell>
                      <MyDatePickerNew
                        label="Дата"
                        value={item.start}
                        func={(value) => updateHealthItem(item.type, "start", value)}
                      />
                    </TableCell>
                    <TableCell>
                      <MyDatePickerNew
                        label="Дата"
                        value={item.end}
                        func={(value) => updateHealthItem(item.type, "end", value)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel
          active={activeTab}
          value="cloth"
        >
          <Grid
            container
            spacing={2}
            alignItems="center"
          >
            <Grid size={{ xs: 12, sm: 6 }}>
              <MyAutocomplite
                label="Предмет одежды"
                data={refs.cloth}
                value={clothDraft.item}
                multiple={false}
                func={(_, value) => setClothDraft((prev) => ({ ...prev, item: value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <MyDatePickerNew
                label="Дата выдачи"
                value={clothDraft.date_start}
                func={(value) =>
                  setClothDraft((prev) => ({
                    ...prev,
                    date_start: value ? value.format("YYYY-MM-DD") : "",
                  }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Button
                variant="contained"
                onClick={addCloth}
                disabled={!clothDraft.item}
              >
                Добавить
              </Button>
            </Grid>
          </Grid>
          <SimpleTable
            sx={{ mt: 2 }}
            columns={["Предмет", "Дата выдачи", ""]}
            rows={asArray(employee.cloth_items)}
            renderRow={(item, index) => (
              <TableRow key={`${item.cloth_id}-${index}`}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{formatActivityHistoryDate(item.date_start)}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() =>
                      onChange(
                        "cloth_items",
                        asArray(employee.cloth_items).filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            )}
          />
        </TabPanel>

        <TabPanel
          active={activeTab}
          value="absence"
        >
          <Grid
            container
            spacing={2}
            alignItems="center"
          >
            <Grid size={{ xs: 12, sm: 3 }}>
              <MyAutocomplite
                label="Тип"
                data={absenceTypes}
                value={absenceDraft.type}
                multiple={false}
                func={(_, value) =>
                  setAbsenceDraft((prev) => ({ ...prev, type: value || absenceTypes[0] }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <MyDatePickerNew
                label="С"
                value={absenceDraft.start}
                func={(value) =>
                  setAbsenceDraft((prev) => ({
                    ...prev,
                    start: value ? value.format("YYYY-MM-DD") : "",
                  }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <MyDatePickerNew
                label="По"
                value={absenceDraft.end}
                minDate={absenceDraft.start ? dayjs(absenceDraft.start) : null}
                func={(value) =>
                  setAbsenceDraft((prev) => ({
                    ...prev,
                    end: value ? value.format("YYYY-MM-DD") : "",
                  }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <MyTextInput
                label="Комментарий"
                value={absenceDraft.comment}
                func={(event) =>
                  setAbsenceDraft((prev) => ({ ...prev, comment: event.target.value }))
                }
              />
            </Grid>
            <Grid size={12}>
              <Button
                variant="contained"
                onClick={addAbsence}
                disabled={!absenceDraft.start || !absenceDraft.end}
              >
                Добавить отсутствие
              </Button>
            </Grid>
          </Grid>
          <SimpleTable
            sx={{ mt: 2 }}
            columns={["Тип", "С", "По", "Комментарий", ""]}
            rows={asArray(employee.absences)}
            renderRow={(item, index) => (
              <TableRow key={item.id ?? index}>
                <TableCell>{item.type?.name ?? item.type_name ?? "—"}</TableCell>
                <TableCell>{formatActivityHistoryDate(item.date_start)}</TableCell>
                <TableCell>{formatActivityHistoryDate(item.date_end)}</TableCell>
                <TableCell>{item.comment || "—"}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() =>
                      onChange(
                        "absences",
                        asArray(employee.absences).filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            )}
          />
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button
          variant="contained"
          onClick={onCreate}
        >
          Создать
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ClothListDialog({
  open,
  fullScreen,
  items,
  value,
  onValueChange,
  onClose,
  onAdd,
  onDelete,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={fullScreen}
    >
      <DialogTitle className="button">
        <Typography sx={{ fontWeight: 900 }}>Управление списком предметов одежды</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack
          direction="row"
          spacing={1}
          sx={{ mb: 2 }}
        >
          <MyTextInput
            label="Наименование"
            value={value}
            func={(event) => onValueChange(event.target.value)}
          />
          <Button
            variant="contained"
            onClick={onAdd}
            sx={{ minWidth: 48 }}
          >
            <AddIcon />
          </Button>
        </Stack>
        <Paper
          variant="outlined"
          sx={{ borderRadius: "8px", overflow: "hidden" }}
        >
          {items.map((item, index) => (
            <Box key={item.id ?? `${item.name}-${index}`}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ px: 1.5, py: 1 }}
              >
                <Typography>{item.name}</Typography>
                <Tooltip title="Удалить">
                  <IconButton
                    size="small"
                    onClick={() => onDelete(item)}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
              {index < items.length - 1 ? <Divider /> : null}
            </Box>
          ))}
          {!items.length ? (
            <Typography sx={{ p: 2, color: "text.secondary" }}>Список пуст</Typography>
          ) : null}
        </Paper>
      </DialogContent>
    </Dialog>
  );
}

function ExperienceRow({ label, value }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "260px 1fr" },
        gap: { xs: 0.5, sm: 2 },
        alignItems: "center",
        py: 1.5,
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <Typography sx={{ color: "text.secondary", fontSize: 14, fontWeight: 700 }}>
        {label}
      </Typography>
      <Box sx={{ color: "text.primary", fontSize: 16, fontWeight: 800 }}>{value}</Box>
    </Box>
  );
}

function HistoryDateValue({ value, change }) {
  const currentValue = formatActivityHistoryDate(change ? change.to : value);
  const previousValue = formatActivityHistoryDate(change?.from);
  const showPrevious = Boolean(change && previousValue !== "—" && previousValue !== currentValue);

  return (
    <Stack spacing={0.25}>
      {showPrevious ? (
        <Typography
          variant="body2"
          sx={{ color: "error.main", textDecoration: "line-through" }}
        >
          {previousValue}
        </Typography>
      ) : null}
      <Typography sx={{ fontWeight: 800, color: change ? "success.dark" : "text.primary" }}>
        {currentValue}
      </Typography>
    </Stack>
  );
}

function HealthBookHistoryDetails({ item }) {
  const groups = getHealthHistoryGroups(item);
  const snapshot = getActivitySnapshot(item);

  return (
    <Box sx={{ p: 2 }}>
      <Typography sx={{ mb: 1.5, fontWeight: 900 }}>Медкнижка</Typography>
      <Grid
        container
        spacing={1.25}
        alignItems="stretch"
      >
        {groups.map((group) => {
          const end = snapshot[group.endKey];
          const status = getHealthItemStatus({ end });

          return (
            <Grid
              key={group.type}
              size={{ xs: 12, md: 6 }}
              sx={{ display: "flex" }}
            >
              <Paper
                variant="outlined"
                sx={{ flex: 1, minWidth: 0, p: 1.5, borderColor: "divider" }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
                  sx={{ mb: 1.5 }}
                >
                  <Typography sx={{ fontWeight: 900 }}>{group.name}</Typography>
                  <Chip
                    size="small"
                    label={status.label}
                    color={status.color}
                    variant="outlined"
                  />
                </Stack>
                <Grid
                  container
                  spacing={2}
                >
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography
                      variant="caption"
                      sx={{ display: "block", color: "text.secondary", fontWeight: 800 }}
                    >
                      Дата прохождения
                    </Typography>
                    <HistoryDateValue
                      value={snapshot[group.startKey]}
                      change={item.diff[group.startKey]}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography
                      variant="caption"
                      sx={{ display: "block", color: "text.secondary", fontWeight: 800 }}
                    >
                      Действует до
                    </Typography>
                    <HistoryDateValue
                      value={end}
                      change={item.diff[group.endKey]}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

function AbsenceHistoryDetails({ item }) {
  const snapshot = getActivitySnapshot(item);
  const action =
    item.event_type === "absence_create"
      ? { label: "Добавлено", color: "success" }
      : item.event_type === "absence_delete"
        ? { label: "Удалено", color: "error" }
        : { label: "Изменено", color: "warning" };
  const type = formatActivityHistoryValue(snapshot.type);
  const comment = snapshot.comment ? String(snapshot.comment) : "Без комментария";
  const isUpdate = item.event_type === "absence_update";

  return (
    <Box sx={{ p: 2 }}>
      <Typography sx={{ mb: 1.5, fontWeight: 900 }}>Отсутствие</Typography>
      <Paper
        variant="outlined"
        sx={{ p: 1.5, borderColor: "divider", maxWidth: 920 }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ mb: 1.5 }}
        >
          <Typography sx={{ fontWeight: 900 }}>{type}</Typography>
          <Chip
            size="small"
            label={action.label}
            color={action.color}
            variant="outlined"
          />
        </Stack>
        <Grid
          container
          spacing={2}
        >
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography
              variant="caption"
              sx={{ display: "block", color: "text.secondary", fontWeight: 800 }}
            >
              Начало
            </Typography>
            <Typography sx={{ fontWeight: 800 }}>
              {formatActivityHistoryDate(snapshot.date_start)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography
              variant="caption"
              sx={{ display: "block", color: "text.secondary", fontWeight: 800 }}
            >
              Окончание
            </Typography>
            <Typography sx={{ fontWeight: 800 }}>
              {formatActivityHistoryDate(snapshot.date_end)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography
              variant="caption"
              sx={{ display: "block", color: "text.secondary", fontWeight: 800 }}
            >
              Продолжительность
            </Typography>
            <Typography sx={{ fontWeight: 800 }}>
              {formatAbsenceDays(snapshot.date_start, snapshot.date_end)}
            </Typography>
          </Grid>
          <Grid size={12}>
            <Box sx={{ p: 1.25, borderRadius: 1, bgcolor: "action.hover" }}>
              <Typography
                variant="caption"
                sx={{ display: "block", color: "text.secondary", fontWeight: 800 }}
              >
                Комментарий
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>{comment}</Typography>
            </Box>
          </Grid>
        </Grid>
        {isUpdate && item.changedFields.length ? (
          <React.Fragment>
            <Divider sx={{ my: 1.5 }} />
            <Typography sx={{ mb: 1, fontWeight: 900 }}>Что изменилось</Typography>
            <Stack spacing={1}>
              {item.changedFields.map(({ key, label }) => {
                const change = item.diff[key];
                const isDate = key === "date_start" || key === "date_end";
                const from = isDate
                  ? formatActivityHistoryDate(change.from)
                  : formatActivityHistoryValue(change.from);
                const to = isDate
                  ? formatActivityHistoryDate(change.to)
                  : formatActivityHistoryValue(change.to);

                return (
                  <Box
                    key={key}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "180px 1fr" },
                      gap: 0.5,
                    }}
                  >
                    <Typography sx={{ color: "text.secondary", fontWeight: 800 }}>
                      {label}
                    </Typography>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                    >
                      <Typography sx={{ color: "error.main", textDecoration: "line-through" }}>
                        {from}
                      </Typography>
                      <Typography sx={{ color: "success.dark", fontWeight: 800 }}>{to}</Typography>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </React.Fragment>
        ) : null}
      </Paper>
    </Box>
  );
}

function ActivityHistoryDetails({ item }) {
  if (item.entity_type === "health_book") {
    return <HealthBookHistoryDetails item={item} />;
  }

  if (item.entity_type === "absence") {
    return <AbsenceHistoryDetails item={item} />;
  }

  const isClothActivity = item.entity_type === "cloth";
  const cloth = isClothActivity ? getClothHistoryDetails(item) : null;

  if (isClothActivity) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography sx={{ mb: 1.5, fontWeight: 900 }}>{item.event_label}</Typography>
        <Paper
          variant="outlined"
          sx={{ p: 1.5, borderColor: "divider", maxWidth: 560 }}
        >
          <Typography sx={{ mb: 1.5, fontWeight: 900 }}>{cloth.name}</Typography>
          <Grid
            container
            spacing={2}
          >
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography
                variant="caption"
                sx={{ display: "block", color: "text.secondary", fontWeight: 800 }}
              >
                Получил
              </Typography>
              <Typography sx={{ fontWeight: 800 }}>{cloth.dateStart}</Typography>
            </Grid>
            {cloth.dateEnd !== "—" ? (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="caption"
                  sx={{ display: "block", color: "text.secondary", fontWeight: 800 }}
                >
                  Сдал
                </Typography>
                <Typography sx={{ fontWeight: 800 }}>{cloth.dateEnd}</Typography>
              </Grid>
            ) : null}
          </Grid>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography sx={{ mb: 1.5, fontWeight: 900 }}>{item.event_label}</Typography>
      <Grid
        container
        spacing={1.25}
        alignItems="stretch"
      >
        {item.changedFields.map(({ key, label }) => {
          const change = item.diff[key];

          return (
            <Grid
              key={key}
              size={{ xs: 12, sm: 6, md: 4 }}
              sx={{ display: "flex" }}
            >
              <Paper
                variant="outlined"
                sx={{
                  flex: 1,
                  minWidth: 0,
                  p: 1.25,
                  borderColor: "success.light",
                  bgcolor: "rgba(46, 125, 50, 0.06)",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ display: "block", mb: 0.5, color: "text.secondary", fontWeight: 800 }}
                >
                  {label}
                </Typography>
                <Stack spacing={0.25}>
                  <Typography
                    variant="body2"
                    sx={{ color: "error.main", textDecoration: "line-through" }}
                  >
                    {change.from}
                  </Typography>
                  <Typography sx={{ color: "success.dark", fontWeight: 800 }}>
                    {change.to}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

function EmployeeHistoryRow({ item, fields }) {
  const [open, setOpen] = useState(false);
  const activityLabels = {
    cloth: "Одежда",
    health_book: "Медкнижка",
    absence: "Отсутствие",
  };
  const activityLabel = item.history_kind === "activity" ? activityLabels[item.entity_type] : null;
  const isCompactActivity = Boolean(activityLabel);
  const createdAt = dayjs(item.created_at);
  const createdAtLabel = createdAt.isValid()
    ? createdAt.format("DD.MM.YYYY HH:mm:ss")
    : item.created_at || "—";

  return (
    <React.Fragment>
      <TableRow
        hover
        onClick={() => setOpen((value) => !value)}
        sx={{ cursor: "pointer", "& > *": { borderBottom: open ? "none" : undefined } }}
      >
        <TableCell sx={{ width: 48, pr: 0 }}>
          <IconButton
            size="small"
            aria-label={open ? "Свернуть историю" : "Раскрыть историю"}
            onClick={(event) => {
              event.stopPropagation();
              setOpen((value) => !value);
            }}
          >
            {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ whiteSpace: "nowrap" }}>{createdAtLabel}</TableCell>
        <TableCell>{item.actor_name}</TableCell>
        <TableCell>
          <Stack
            direction="row"
            useFlexGap
            flexWrap="wrap"
            gap={0.75}
          >
            {item.event_label && !isCompactActivity ? (
              <Chip
                size="small"
                label={item.event_label}
                color="primary"
                variant="outlined"
              />
            ) : null}
            {item.event_type === "create" ? (
              <Chip
                size="small"
                label="Первичная запись"
                color="primary"
                variant="outlined"
              />
            ) : null}
            {isCompactActivity ? (
              <Chip
                size="small"
                label={activityLabel}
                color="success"
                variant="outlined"
              />
            ) : (
              item.changedFields.map(({ key, label }) => (
                <Chip
                  key={key}
                  size="small"
                  label={label}
                  color="success"
                  variant="outlined"
                />
              ))
            )}
            {!isCompactActivity && !item.changedFields.length && item.event_type !== "create" ? (
              <Chip
                size="small"
                label="Данные не изменились"
                variant="outlined"
              />
            ) : null}
          </Stack>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell
          colSpan={4}
          sx={{ p: 0, borderBottom: open ? undefined : 0, bgcolor: "#fafafa" }}
        >
          <Collapse
            in={open}
            timeout="auto"
            unmountOnExit
          >
            {item.history_kind === "activity" ? (
              <ActivityHistoryDetails item={item} />
            ) : (
              <Box sx={{ p: 2 }}>
                <Typography sx={{ mb: 1.5, fontWeight: 900 }}>Полный снимок</Typography>
                <Grid
                  container
                  spacing={1.25}
                  alignItems="stretch"
                >
                  {fields.map(({ key, label }) => {
                    const change = item.diff[key];

                    return (
                      <Grid
                        key={key}
                        size={{ xs: 12, sm: 6, md: 4 }}
                        sx={{ display: "flex" }}
                      >
                        <Paper
                          variant="outlined"
                          sx={{
                            flex: 1,
                            minWidth: 0,
                            p: 1.25,
                            borderColor: change ? "success.light" : "divider",
                            bgcolor: change ? "rgba(46, 125, 50, 0.06)" : "background.paper",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              mb: 0.5,
                              color: "text.secondary",
                              fontWeight: 800,
                            }}
                          >
                            {label}
                          </Typography>
                          {change ? (
                            <Stack spacing={0.25}>
                              <Typography
                                variant="body2"
                                sx={{ color: "error.main", textDecoration: "line-through" }}
                              >
                                {change.from}
                              </Typography>
                              <Typography sx={{ color: "success.dark", fontWeight: 800 }}>
                                {change.to}
                              </Typography>
                            </Stack>
                          ) : (
                            <Typography sx={{ fontWeight: 700 }}>{item.snapshot[key]}</Typography>
                          )}
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            )}
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

function EmployeeHistoryTable({ history = [], permissions }) {
  const fields = getVisibleEmployeeHistoryFields(permissions);
  const visibleHistory = filterEmployeeHistoryByPermissions(history, permissions);

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow sx={tableHeaderSx}>
            <TableCell sx={{ width: 48 }} />
            <TableCell>Когда</TableCell>
            <TableCell>Кто</TableCell>
            <TableCell>Что изменилось</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {visibleHistory.map((item) => (
            <EmployeeHistoryRow
              key={item.id}
              item={item}
              fields={fields}
            />
          ))}
          {!visibleHistory.length ? (
            <TableRow>
              <TableCell
                colSpan={4}
                align="center"
                sx={{ py: 3, color: "text.secondary" }}
              >
                Нет данных
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function SimpleTable({ columns, rows, renderRow, sx }) {
  return (
    <TableContainer sx={sx}>
      <Table size="small">
        <TableHead>
          <TableRow sx={tableHeaderSx}>
            {columns.map((column) => (
              <TableCell key={column}>{column}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(renderRow)}
          {!rows.length ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                align="center"
                sx={{ py: 3, color: "text.secondary" }}
              >
                Нет данных
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
