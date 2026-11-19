export const days = [
  { value: "mon", label: "Понедельник" },
  { value: "tue", label: "Вторник" },
  { value: "wed", label: "Среда" },
  { value: "thu", label: "Четверг" },
  { value: "fri", label: "Пятница" },
  { value: "sat", label: "Суббота" },
  { value: "sun", label: "Воскресенье" },
];

export const CLEANINGS_MODULE_NAME = "Уборки и заготовки";

// `path` is the first URL segment under /cleanings; tab is visible if any `accessKeys` is viewable.
export const cleaningSectionTabs = [
  {
    value: "categories",
    path: "categories",
    label: "Виды уборок",
    description: "Инструкции и объекты уборки",
    accessKeys: ["categories"],
  },
  {
    value: "templates",
    path: "times",
    label: "Время уборок",
    description: "Настройка расписания: кто, какие объекты и когда должен убирать в кафе",
    accessKeys: ["cleanings"],
  },
  {
    value: "cafes",
    path: "cafes",
    label: "Уборки Кафе",
    description: "Уборки, назначенные на выбранное кафе, и доп. время к ним",
    accessKeys: ["cafes"],
  },
  {
    value: "control",
    path: "control",
    label: "Проверка заготовок и уборок",
    description: "Подтверждайте выполненные уборки и заготовки в выбранном кафе",
    accessKeys: ["control_cleanings", "control_pf"],
  },
];

// Second URL segment under /cleanings/control.
export const controlKindTabs = [
  { value: "cleanings", label: "Уборки", accessKey: "control_cleanings" },
  { value: "preparations", label: "Заготовки", accessKey: "control_pf" },
];

export const defaultForm = {
  name: "",
  categoryId: null,
  role: "",
  roleId: null,
  duration: "",
  dopTime: "",
  activationCount: "",
  additionType: "",
  confirmation: false,
  scheduleType: "",
  triggerCleaningId: null,
  days: [],
  times: [],
  deleteTimes: [],
  is_not_del: false,
  is_need: false,
  locationIds: [],
  status: "active",
};

// Fallback names when `get_all` has no `additionTypeOptions`; keys are API `additionType` values.
export const ADDITION_TYPE_LABELS = {
  single_active: "Только 1 активная",
  unlimited: "Добавление без ограничений",
  other: "Другое",
};

export const ADDITION_TYPE_SHORT_LABELS = {
  single_active: "1 активная",
  unlimited: "Без ограничений",
  other: "Другое",
};

// Options that are kept only for legacy templates and are never offered for new ones.
export const LEGACY_ONLY_OPTION_VALUE = "other";

// Unassigned tasks without a delete time are removed by the nightly cleanup at this time.
export const NIGHTLY_CLEANUP_TIME = "23:30";
