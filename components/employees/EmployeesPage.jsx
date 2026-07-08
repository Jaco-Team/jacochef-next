import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Backdrop,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
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
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { MyAutocomplite, MyCheckBox, MyDatePickerNew, MySelect, MyTextInput } from "@/ui/Forms";
import MyAlert from "@/ui/MyAlert";
import { api_laravel, api_laravel_local } from "@/src/api_new";

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
  date_registration: dayjs().format("YYYY-MM-DD"),
  app_id: null,
  point_id: null,
  point_access: [],
  point_access_ids: [],
  acc_to_kas: 1,
  is_active: 1,
  photo: "",
};

const emptyAbsence = {
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
    history: asArray(data?.history ?? source?.history),
    absence_history: asArray(data?.absence_history ?? source?.vacation),
    organizations: data?.organizations ?? {},
  };
};

const normalizeStats = (data) => {
  const experience = asArray(data?.experience ?? data?.stat);
  const employment = data?.employment ?? data?.stat_of ?? {};

  return {
    experience,
    employment,
  };
};

const getAccess = (data) => {
  const access = data?.access ?? data?.my ?? {};

  return {
    can_edit: access?.can_edit !== false && String(access?.edit_access ?? 1) !== "0",
    can_create: access?.can_create !== false && String(access?.create_access ?? 1) !== "0",
    can_manage_cloth:
      access?.can_manage_cloth !== false && String(access?.cloth_access ?? 1) !== "0",
    show_access: access?.show_access ?? 1,
  };
};

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

  const names = [
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

  return names.map((item) => ({
    ...item,
    start: employee.health_book?.[`${item.type}_start`] ?? "",
    end: employee.health_book?.[`${item.type}_end`] ?? "",
  }));
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

function FieldLabel({ children }) {
  return (
    <Typography sx={{ mb: 0.5, fontSize: 12, fontWeight: 700, color: "text.secondary" }}>
      {children}
    </Typography>
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
  const [filters, setFilters] = useState({
    city: "",
    points: [],
    app: null,
    search: "",
  });
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState(normalizeStats({}));
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [totalRows, setTotalRows] = useState(0);
  const [employeeDialog, setEmployeeDialog] = useState(false);
  const [employee, setEmployee] = useState(null);
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

  const canEdit = access.can_edit;

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
      const res = await api_laravel_local(MODULE, method, data);
      return unwrapResponse(res);
    } catch (e) {
      showAlert(false, "Не удалось выполнить запрос");
      return null;
    } finally {
      setTimeout(() => setIsLoad(false), 300);
    }
  };

  const refreshEmployees = async (nextFilters = filters, nextPage = page, nextRows = rows) => {
    const data = {
      city_id: nextFilters.city,
      point_id: nextFilters.points,
      point_ids: asArray(nextFilters.points).map((point) => point.id),
      app: nextFilters.app,
      app_id: nextFilters.app?.id ?? -2,
      search: nextFilters.search,
      page: nextPage + 1,
      rows: nextRows,
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
    const apps = normalizeOptions(res.apps);
    const nextAccess = getAccess(res);
    const defaultCity =
      cities.length === 1 ? cities[0].id : (cities.find((city) => sameId(city, -1))?.id ?? "");
    const defaultPoint =
      points.find((point) => sameId(point, -1)) ??
      points.find((point) => parseInt(point.id) > 0) ??
      null;
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
      points: defaultPoint ? [defaultPoint] : [],
      app: defaultApp,
      search: "",
    };

    setFilters(nextFilters);
    setStats(normalizeStats(res));
    setTotalRows(res.total_rows ?? 0);
    document.title = res.module_info?.name ?? "Сотрудники";
    await refreshEmployees(nextFilters, 0, rows);
  };

  useEffect(() => {
    loadInitial();
  }, []);

  const filteredPoints = useMemo(() => {
    if (!filters.city || sameId(filters.city, -1)) return refs.points;

    return refs.points.filter(
      (point) => sameId(point.city_id, filters.city) || sameId(point.city_id, -1),
    );
  }, [filters.city, refs.points]);

  const visibleEmployees = useMemo(() => {
    if (totalRows > employees.length) return employees;
    if (rows < 0) return employees;

    return employees.slice(page * rows, page * rows + rows);
  }, [employees, page, rows, totalRows]);

  const openEmployee = async (employeeId, tab = "basic") => {
    setActiveTab(tab);
    const res = await getData("get_employee", { user_id: employeeId, id: employeeId });

    if (!res) return;

    setEmployee(normalizeEmployeeCard(res));
    setEmployeeDialog(true);
  };

  const updateEmployeeUser = (field, value) => {
    setEmployee((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        [field]: value,
      },
    }));
  };

  const updateNewEmployee = (field, value) => {
    setNewEmployee((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateHealthItem = (type, field, value) => {
    setEmployee((prev) => {
      const nextItems = getHealthItems(prev).map((item) =>
        item.type === type
          ? { ...item, [field]: value ? dayjs(value).format("YYYY-MM-DD") : "" }
          : item,
      );

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
    const ok = await handleMutation(
      "save_basic",
      {
        user_id: employee.user.id,
        user: employee.user,
        employee: employee.user,
      },
      "Данные сотрудника сохранены",
    );

    if (ok) setEmployeeDialog(false);
  };

  const applyWorkChange = async () => {
    const user = employee.user;

    if (String(user.is_active) === "0" && !user.textDel) {
      showAlert(false, "Укажите причину увольнения или перевода в неактивное состояние");
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
        is_active: user.is_active,
        textDel: user.textDel ?? "",
        date_start_day: formatDate(user.date_start_day || dayjs()),
        user,
      },
      "Изменения по работе применены",
    );
  };

  const saveDateRegistration = async () => {
    await handleMutation(
      "save_date_registration",
      {
        user_id: employee.user.id,
        date_registration: formatDate(employee.user.date_registration),
      },
      "Дата трудоустройства сохранена",
    );
  };

  const addAbsence = async () => {
    if (!absence.start || !absence.end) {
      showAlert(false, "Укажите даты отсутствия");
      return;
    }

    const ok = await handleMutation(
      "add_absence",
      {
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
      "Отсутствие добавлено",
    );

    if (ok) setAbsence(emptyAbsence);
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
        setConfirm(null);
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
    const defaultPoint = refs.points.find((point) => parseInt(point.id) > 0) ?? null;

    setNewEmployee({
      ...emptyEmployee,
      app_id: refs.apps.find((app) => parseInt(app.id) > 0) ?? null,
      point_id: defaultPoint,
      point_access: defaultPoint ? [defaultPoint] : [],
      date_registration: dayjs().format("YYYY-MM-DD"),
    });
    setNewDialog(true);
  };

  const createEmployee = async () => {
    const ok = await handleMutation(
      "create_employee",
      {
        user: newEmployee,
        employee: newEmployee,
      },
      "Сотрудник создан",
      false,
    );

    if (ok) setNewDialog(false);
  };

  const handleRowsChange = (event) => {
    const value = parseInt(event.target.value);

    setRows(value);
    setPage(0);
    refreshEmployees(filters, 0, value);
  };

  const handlePageChange = (_, value) => {
    setPage(value);

    if (totalRows > employees.length) {
      refreshEmployees(filters, value, rows);
    }
  };

  const handleFilterChange = (patch) => {
    const nextFilters = { ...filters, ...patch };

    setFilters(nextFilters);
    setPage(0);
    refreshEmployees(nextFilters, 0, rows);
  };

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

  return (
    <>
      <Backdrop
        style={{ zIndex: 99999 }}
        open={isLoad}
      >
        <Typography sx={{ mr: 2, color: "#fff" }}>Загрузка</Typography>
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
          <Typography
            component="h1"
            sx={{ m: 0, fontSize: { xs: 26, md: 32 }, fontWeight: 900 }}
          >
            Сотрудники
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
            Кадры, стаж, медкнижки и вещевое довольствие в одном месте
          </Typography>
        </Grid>

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
                <MySelect
                  label="Город"
                  data={refs.cities}
                  value={filters.city}
                  func={(event) => handleFilterChange({ city: event.target.value, points: [] })}
                  is_none={false}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <MyAutocomplite
                  label="Точки / кафе"
                  multiple={true}
                  data={filteredPoints}
                  value={filters.points}
                  func={(_, value) => handleFilterChange({ points: value || [] })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <MyAutocomplite
                  label="Должность"
                  multiple={false}
                  data={refs.apps}
                  value={filters.app}
                  func={(_, value) => handleFilterChange({ app: value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <MyTextInput
                  label="Поиск по ФИО или телефону"
                  placeholder="Иванов или +7911..."
                  value={filters.search}
                  func={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
                  inputAdornment={{ startAdornment: <SearchIcon fontSize="small" /> }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleFilterChange({ search: filters.search });
                  }}
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
                    onClick={() => refreshEmployees()}
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    Обновить
                  </Button>
                  {access.can_create ? (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={openCreateDialog}
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      Добавить сотрудника
                    </Button>
                  ) : null}
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

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
                    <TableCell>ФИО</TableCell>
                    <TableCell>Телефон</TableCell>
                    <TableCell>Должность</TableCell>
                    <TableCell>Точка</TableCell>
                    <TableCell>Принят</TableCell>
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
                        hover
                        onClick={() => openEmployee(item.id)}
                        sx={{ cursor: "pointer" }}
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
                                  неактивен
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
                            color={parseInt(item.acc_to_kas) === 1 ? "primary" : "default"}
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
      </Grid>

      <EmployeeDialog
        open={employeeDialog}
        fullScreen={fullScreen}
        employee={employee}
        activeTab={activeTab}
        refs={refs}
        access={access}
        canEdit={canEdit}
        absence={absence}
        clothIssue={clothIssue}
        onClose={() => {
          setEmployeeDialog(false);
          setEmployee(null);
          setAbsence(emptyAbsence);
        }}
        onTabChange={setActiveTab}
        onUserChange={updateEmployeeUser}
        onHealthChange={updateHealthItem}
        onSaveBasic={saveBasic}
        onApplyWork={applyWorkChange}
        onSaveDateRegistration={saveDateRegistration}
        onAbsenceChange={setAbsence}
        onAddAbsence={addAbsence}
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
        access={access}
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
  access,
  canEdit,
  absence,
  clothIssue,
  onClose,
  onTabChange,
  onUserChange,
  onHealthChange,
  onSaveBasic,
  onApplyWork,
  onSaveDateRegistration,
  onAbsenceChange,
  onAddAbsence,
  onHealthSave,
  onClothIssueChange,
  onIssueCloth,
  onReturnCloth,
  onManageCloth,
}) {
  const user = employee?.user;
  const appOptions = employee?.appointment?.length ? employee.appointment : refs.apps;
  const pointOptions = employee?.point_list?.length ? employee.point_list : refs.points;
  const selectedApp = findOption(appOptions, user?.app_id) ?? user?.app_id;
  const selectedPoint = findOption(pointOptions, user?.point_id) ?? user?.point_id;
  const healthItems = employee ? getHealthItems(employee) : [];
  const overallHealth = healthItems.some((item) => getHealthItemStatus(item).color === "error")
    ? "Просрочено"
    : healthItems.some((item) => getHealthItemStatus(item).color === "warning")
      ? "Скоро истекает"
      : "Актуально";

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
          <EmployeeAvatar
            employee={user}
            size={42}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{ fontWeight: 900 }}
              noWrap
            >
              {joinName(user)}
            </Typography>
            <Chip
              size="small"
              label={String(user.is_active) === "0" ? "Неактивен" : "Активен"}
              sx={{ mt: 0.5, fontWeight: 700 }}
            />
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
            <Tab
              label="Основное"
              value="basic"
            />
            <Tab
              label="Работа"
              value="work"
            />
            <Tab
              label="Отсутствия"
              value="absence"
            />
            <Tab
              label="Стаж"
              value="experience"
            />
            <Tab
              label="Мед книжка"
              value="health"
            />
            <Tab
              label="Одежда"
              value="cloth"
            />
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
            <Grid size={{ xs: 12, md: 2 }}>
              <Stack
                spacing={1.5}
                alignItems="center"
              >
                <EmployeeAvatar
                  employee={user}
                  size={110}
                />
                <MyTextInput
                  label="URL фото"
                  value={user.photo}
                  func={(event) => onUserChange("photo", event.target.value)}
                  disabled={!canEdit}
                />
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 10 }}>
              <Grid
                container
                spacing={2}
              >
                <Grid size={{ xs: 12, sm: 4 }}>
                  <MyTextInput
                    label="Фамилия"
                    value={user.fam}
                    func={(event) => onUserChange("fam", event.target.value)}
                    disabled={!canEdit}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <MyTextInput
                    label="Имя"
                    value={user.name}
                    func={(event) => onUserChange("name", event.target.value)}
                    disabled={!canEdit}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <MyTextInput
                    label="Отчество"
                    value={user.otc}
                    func={(event) => onUserChange("otc", event.target.value)}
                    disabled={!canEdit}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <MyTextInput
                    label="Телефон"
                    value={user.login}
                    func={(event) => onUserChange("login", event.target.value)}
                    disabled={!canEdit}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <MyDatePickerNew
                    label="Дата рождения"
                    value={user.birthday}
                    func={(value) =>
                      onUserChange("birthday", value ? value.format("YYYY-MM-DD") : "")
                    }
                    disabled={!canEdit}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <MyTextInput
                    label="Код авторизации"
                    value={user.auth_code}
                    func={(event) => onUserChange("auth_code", event.target.value)}
                    disabled={!canEdit}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <MyTextInput
                    label="ИНН"
                    value={user.inn}
                    func={(event) => onUserChange("inn", event.target.value)}
                    disabled={!canEdit}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <MyDatePickerNew
                    label="Дата трудоустройства"
                    value={user.date_registration}
                    func={(value) =>
                      onUserChange("date_registration", value ? value.format("YYYY-MM-DD") : "")
                    }
                    disabled={!canEdit}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <MyAutocomplite
                    label="Должность"
                    data={appOptions}
                    value={selectedApp}
                    multiple={false}
                    func={(_, value) => onUserChange("app_id", value)}
                    disabled={!canEdit}
                  />
                </Grid>
                {parseInt(access.show_access) === 1 ? (
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <MyCheckBox
                      label="Официальное трудоустройство"
                      value={parseInt(user.acc_to_kas) === 1}
                      func={(event) => onUserChange("acc_to_kas", event.target.checked ? 1 : 0)}
                      disabled={!canEdit}
                    />
                  </Grid>
                ) : null}
                <Grid size={12}>
                  <FieldLabel>Доступные кафе</FieldLabel>
                  <Stack
                    direction="row"
                    spacing={1}
                    useFlexGap
                    flexWrap="wrap"
                  >
                    {pointOptions.map((point) => {
                      const active = asArray(user.point_access).some((item) => sameId(item, point));

                      return (
                        <Chip
                          key={point.id}
                          label={point.name}
                          clickable={canEdit}
                          color={active ? "primary" : "default"}
                          onClick={
                            canEdit
                              ? () => {
                                  const current = asArray(user.point_access);
                                  const next = active
                                    ? current.filter((item) => !sameId(item, point))
                                    : [...current, point];
                                  onUserChange("point_access", next);
                                }
                              : undefined
                          }
                        />
                      );
                    })}
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel
          active={activeTab}
          value="work"
        >
          <Grid
            container
            spacing={2}
          >
            <Grid size={{ xs: 12, sm: 4 }}>
              <MyAutocomplite
                label="Должность"
                data={appOptions}
                value={selectedApp}
                multiple={false}
                func={(_, value) => onUserChange("app_id", value)}
                disabled={!canEdit}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <MyAutocomplite
                label="Текущая точка"
                data={pointOptions}
                value={selectedPoint}
                multiple={false}
                func={(_, value) => onUserChange("point_id", value)}
                disabled={!canEdit}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <MyDatePickerNew
                label="Дата применения изменений"
                value={user.date_start_day || dayjs().format("YYYY-MM-DD")}
                minDate={dayjs()}
                func={(value) =>
                  onUserChange("date_start_day", value ? value.format("YYYY-MM-DD") : "")
                }
                disabled={!canEdit}
              />
            </Grid>
            <Grid size={12}>
              <MyCheckBox
                label="Активен"
                value={String(user.is_active) !== "0"}
                func={(event) => onUserChange("is_active", event.target.checked ? 1 : 0)}
                disabled={!canEdit}
              />
            </Grid>
            {String(user.is_active) === "0" ? (
              <Grid size={12}>
                <MyTextInput
                  label="Причина увольнения / перевода в неактивное"
                  value={user.textDel ?? ""}
                  multiline
                  minRows={3}
                  func={(event) => onUserChange("textDel", event.target.value)}
                  disabled={!canEdit}
                />
              </Grid>
            ) : null}
            <Grid size={12}>
              <Button
                variant="contained"
                onClick={onApplyWork}
                disabled={!canEdit}
              >
                Применить изменения
              </Button>
            </Grid>
          </Grid>
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
                value={absence.type}
                multiple={false}
                func={(_, value) => onAbsenceChange({ ...absence, type: value || absenceTypes[0] })}
                disabled={!canEdit}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <MyDatePickerNew
                label="С"
                value={absence.start}
                func={(value) =>
                  onAbsenceChange({ ...absence, start: value ? value.format("YYYY-MM-DD") : "" })
                }
                disabled={!canEdit}
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
                disabled={!canEdit}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <MyTextInput
                label="Комментарий"
                value={absence.comment}
                func={(event) => onAbsenceChange({ ...absence, comment: event.target.value })}
                disabled={!canEdit}
              />
            </Grid>
            <Grid size={12}>
              <Button
                variant="contained"
                onClick={onAddAbsence}
                disabled={!canEdit}
              >
                Добавить
              </Button>
            </Grid>
          </Grid>
          <SimpleTable
            sx={{ mt: 2 }}
            columns={["Тип", "С", "По", "Комментарий", "Создатель", "Дата создания"]}
            rows={employee.absence_history}
            renderRow={(item, index) => (
              <TableRow key={item.id ?? index}>
                <TableCell>{item.absence_type ?? item.type_name ?? item.type ?? "—"}</TableCell>
                <TableCell>{formatDate(item.date_start ?? item.start)}</TableCell>
                <TableCell>{formatDate(item.date_end ?? item.end)}</TableCell>
                <TableCell>{item.comment ?? item.commentVacation ?? "—"}</TableCell>
                <TableCell>{item.user_name ?? item.actor_name ?? "—"}</TableCell>
                <TableCell>{formatDate(item.date_create ?? item.created_at)}</TableCell>
              </TableRow>
            )}
          />
        </TabPanel>

        <TabPanel
          active={activeTab}
          value="experience"
        >
          <Grid
            container
            spacing={2}
          >
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoBox
                label="Дата трудоустройства"
                value={formatDateHuman(user.date_registration)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoBox
                label="Общий стаж"
                value={user.exp ?? employee.user.experience ?? "—"}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoBox
                label="Текущая организация"
                value={user.organization ?? user.org_name ?? "—"}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoBox
                label="Официальное трудоустройство"
                value={parseInt(user.acc_to_kas) === 1 ? "Да" : "Нет"}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoBox
                label="Текущая точка"
                value={selectedPoint?.name ?? user.point ?? user.point_name ?? "—"}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={onSaveDateRegistration}
                disabled={!canEdit}
                sx={{ mt: { sm: 2.75 } }}
              >
                Сохранить дату трудоустройства
              </Button>
            </Grid>
          </Grid>
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
                    : "success"
              }
              sx={{ fontWeight: 800 }}
            />
            <Button
              variant="contained"
              onClick={onHealthSave}
              disabled={!canEdit}
            >
              Сохранить медкнижку
            </Button>
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
                        <MyDatePickerNew
                          label="Дата"
                          value={item.start ?? item.date_start}
                          func={(value) => onHealthChange(item.type, "start", value)}
                          disabled={!canEdit}
                        />
                      </TableCell>
                      <TableCell>
                        <MyDatePickerNew
                          label="Дата"
                          value={item.end ?? item.date_end}
                          func={(value) => onHealthChange(item.type, "end", value)}
                          disabled={!canEdit}
                        />
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
                disabled={!canEdit}
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
                disabled={!canEdit}
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
                  disabled={!canEdit}
                >
                  Выдать
                </Button>
                {access.can_manage_cloth ? (
                  <Button
                    variant="outlined"
                    onClick={onManageCloth}
                  >
                    Управление списком
                  </Button>
                ) : null}
              </Stack>
            </Grid>
          </Grid>
          <Typography sx={{ mt: 3, mb: 1, fontWeight: 900 }}>Активные предметы</Typography>
          <SimpleTable
            columns={["Предмет", "Выдан", "Сдан", ""]}
            rows={employee.cloth.active}
            renderRow={(item, index) => (
              <TableRow key={item.id ?? `${item.cloth_id}-${index}`}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{formatDate(item.date_start)}</TableCell>
                <TableCell>{formatDate(item.date_end)}</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => onReturnCloth(item)}
                    disabled={!canEdit}
                  >
                    Принять сдачу
                  </Button>
                </TableCell>
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
                <TableCell>{formatDate(item.date_start)}</TableCell>
                <TableCell>{formatDate(item.date_end)}</TableCell>
              </TableRow>
            )}
          />
        </TabPanel>

        <TabPanel
          active={activeTab}
          value="history"
        >
          <SimpleTable
            columns={["Когда", "Кто", "Поле / событие", "Было", "Стало"]}
            rows={employee.history}
            renderRow={(item, index) => (
              <TableRow key={item.id ?? index}>
                <TableCell>
                  {item.created_at ?? item.date_time_update ?? item.date_create ?? "—"}
                </TableCell>
                <TableCell>
                  {item.actor_name ?? item.update_name ?? item.user_name ?? "—"}
                </TableCell>
                <TableCell>{item.event_type ?? item.field ?? item.name ?? "—"}</TableCell>
                <TableCell>{item.before ?? item.old_value ?? item.from ?? "—"}</TableCell>
                <TableCell>
                  {item.after ?? item.new_value ?? item.to ?? item.app_name ?? "—"}
                </TableCell>
              </TableRow>
            )}
          />
        </TabPanel>
      </DialogContent>
      {activeTab === "basic" ? (
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button
            variant="contained"
            onClick={onSaveBasic}
            disabled={!canEdit}
          >
            Сохранить
          </Button>
        </DialogActions>
      ) : null}
    </Dialog>
  );
}

function CreateEmployeeDialog({
  open,
  fullScreen,
  employee,
  refs,
  access,
  onClose,
  onChange,
  onCreate,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      fullScreen={fullScreen}
    >
      <DialogTitle className="button">
        <Typography sx={{ fontWeight: 900 }}>Новый сотрудник</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid
          container
          spacing={2}
        >
          <Grid size={{ xs: 12, sm: 6 }}>
            <MyTextInput
              label="Фамилия"
              value={employee.fam}
              func={(event) => onChange("fam", event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MyTextInput
              label="Имя"
              value={employee.name}
              func={(event) => onChange("name", event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MyTextInput
              label="Отчество"
              value={employee.otc}
              func={(event) => onChange("otc", event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MyTextInput
              label="Телефон"
              value={employee.login}
              func={(event) => onChange("login", event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MyDatePickerNew
              label="Дата рождения"
              value={employee.birthday}
              func={(value) => onChange("birthday", value ? value.format("YYYY-MM-DD") : "")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MyTextInput
              label="ИНН"
              value={employee.inn}
              func={(event) => onChange("inn", event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MyTextInput
              label="Код авторизации"
              value={employee.auth_code}
              func={(event) => onChange("auth_code", event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MyDatePickerNew
              label="Дата трудоустройства"
              value={employee.date_registration}
              func={(value) =>
                onChange("date_registration", value ? value.format("YYYY-MM-DD") : "")
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MyAutocomplite
              label="Должность"
              data={refs.apps}
              value={employee.app_id}
              multiple={false}
              func={(_, value) => onChange("app_id", value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MyAutocomplite
              label="Текущая точка"
              data={refs.points}
              value={employee.point_id}
              multiple={false}
              func={(_, value) => onChange("point_id", value)}
            />
          </Grid>
          {parseInt(access.show_access) === 1 ? (
            <Grid size={12}>
              <MyCheckBox
                label="Официальное трудоустройство"
                value={parseInt(employee.acc_to_kas) === 1}
                func={(event) => onChange("acc_to_kas", event.target.checked ? 1 : 0)}
              />
            </Grid>
          ) : null}
        </Grid>
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

function InfoBox({ label, value }) {
  return (
    <Paper
      variant="outlined"
      sx={{ borderRadius: "8px", p: 1.5, height: "100%" }}
    >
      <Typography sx={{ color: "text.secondary", fontSize: 13 }}>{label}</Typography>
      <Typography sx={{ mt: 0.5, fontWeight: 900 }}>{value}</Typography>
    </Paper>
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
