export const roles = ["Повар", "Официант", "Су-шеф", "Уборщик"];

export const days = [
  { value: "mon", label: "Пн" },
  { value: "tue", label: "Вт" },
  { value: "wed", label: "Ср" },
  { value: "thu", label: "Чт" },
  { value: "fri", label: "Пт" },
  { value: "sat", label: "Сб" },
  { value: "sun", label: "Вс" },
];

export const locations = [
  { id: 1, name: "Центральный", city: "Москва" },
  { id: 2, name: "Северный", city: "Москва" },
  { id: 3, name: "Южный", city: "Москва" },
  { id: 4, name: "Кухня на Волге", city: "Самара" },
  { id: 5, name: "Склад заготовок", city: "Тольятти" },
];

export const locationCities = Object.values(
  locations.reduce((acc, location) => {
    if (!acc[location.city]) {
      acc[location.city] = {
        id: location.city,
        name: location.city,
        cafes: [],
      };
    }

    acc[location.city].cafes.push({
      id: location.id,
      name: location.name,
    });

    return acc;
  }, {}),
);

export const locationOptions = locationCities.flatMap((city) =>
  city.cafes.map((location) => ({
    id: location.id,
    name: location.name,
    cityId: city.id,
    cityName: city.name,
  })),
);

export const cleaningSectionTabs = [
  { value: "templates", label: "Уборки", href: "/cleanings" },
  { value: "categories", label: "Категории", href: "/cleanings/categories" },
  { value: "cafes", label: "Кафе", href: "/cleanings/cafes" },
  { value: "control", label: "Контроль", href: "/cleanings/control" },
];

export const controlKindTabs = [
  { value: "cleanings", label: "Уборки", href: "/cleanings/control/cleanings" },
  { value: "preparations", label: "Заготовки", href: "/cleanings/control/preparations" },
];

export const initialCategories = [
  {
    id: 1,
    name: "Кухня",
    instruction:
      "<ol><li>Отключить и охладить оборудование.</li><li>Снять решётки и съёмные части, замочить в обезжиривателе на 10 минут.</li><li>Очистить рабочие поверхности и плиты профессиональным средством.</li><li>Промыть водой, протереть насухо одноразовыми салфетками.</li><li>Сфотографировать результат и прикрепить к отчёту.</li></ol>",
  },
  {
    id: 2,
    name: "Зал",
    instruction:
      "<p>Протереть поверхности столов и спинки стульев спиртовым раствором 70%. Проверить чистоту пола, подоконников и зоны ожидания.</p>",
  },
  {
    id: 3,
    name: "Санитария",
    instruction:
      "<p>Обработать ручки дверей, терминалы, кнопки лифта и другие контактные поверхности. Работы проводить в перчатках.</p>",
  },
  {
    id: 4,
    name: "Склад и заготовки",
    instruction:
      "<p>Проверить даты и маркировки заготовок, выполнить ротацию FIFO, сфотографировать общий вид полок.</p>",
  },
  {
    id: 5,
    name: "Генеральная уборка",
    instruction:
      "<p>Разобрать доступные элементы оборудования, замочить съёмные части, очистить сложные загрязнения и проверить результат с менеджером.</p>",
  },
];

export const defaultForm = {
  name: "",
  categoryId: 1,
  role: "Уборщик",
  duration: 15,
  confirmation: false,
  days: ["mon", "tue", "wed", "thu", "fri"],
  times: ["10:00"],
  locationIds: [],
  status: "active",
};

export const initialTemplates = [
  {
    id: 1,
    name: "Уборка горячего цеха",
    categoryId: 1,
    role: "Повар",
    duration: 45,
    confirmation: true,
    days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    times: ["22:00"],
    locationIds: [1, 2, 4],
    status: "active",
  },
  {
    id: 2,
    name: "Дезинфекция столов зала",
    categoryId: 2,
    role: "Официант",
    duration: 15,
    confirmation: false,
    days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    times: ["12:00", "16:00", "20:00"],
    locationIds: [1, 2, 3, 4],
    status: "active",
  },
  {
    id: 3,
    name: "Проверка маркировок заготовок",
    categoryId: 4,
    role: "Су-шеф",
    duration: 30,
    confirmation: true,
    days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    times: ["09:00"],
    locationIds: [4, 5],
    status: "active",
  },
  {
    id: 4,
    name: "Глубокая чистка гриля",
    categoryId: 5,
    role: "Повар",
    duration: 60,
    confirmation: true,
    days: ["sun"],
    times: ["23:00"],
    locationIds: [1, 4],
    status: "active",
  },
  {
    id: 5,
    name: "Уборка холодного цеха",
    categoryId: 1,
    role: "Уборщик",
    duration: 30,
    confirmation: false,
    days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    times: ["23:30"],
    locationIds: [1, 2, 3, 4, 5],
    status: "active",
  },
  {
    id: 6,
    name: "Дезинфекция контактных поверхностей",
    categoryId: 3,
    role: "Уборщик",
    duration: 15,
    confirmation: false,
    days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    times: ["10:00", "14:00", "18:00", "22:00"],
    locationIds: [1, 3],
    status: "active",
  },
  {
    id: 7,
    name: "Чистка вытяжной системы",
    categoryId: 5,
    role: "Су-шеф",
    duration: 90,
    confirmation: true,
    days: ["sat"],
    times: ["10:00"],
    locationIds: [4],
    status: "active",
  },
  {
    id: 8,
    name: "Ревизия инвентаря для уборки",
    categoryId: 4,
    role: "Уборщик",
    duration: 20,
    confirmation: false,
    days: ["fri"],
    times: ["18:00"],
    locationIds: [5],
    status: "archive",
  },
];

export const initialControlItems = [
  {
    id: 1,
    cleaningId: 2,
    employee: "А. Иванова",
    startedAt: "12:00",
    finishedAt: "12:14",
    status: "pending",
  },
  {
    id: 2,
    cleaningId: 6,
    employee: "М. Петров",
    startedAt: "10:00",
    finishedAt: "10:12",
    status: "pending",
  },
  {
    id: 3,
    cleaningId: 3,
    employee: "К. Сидоров",
    startedAt: "09:00",
    finishedAt: "09:28",
    status: "approved",
  },
  {
    id: 4,
    cleaningId: 5,
    employee: "Е. Орлова",
    startedAt: "",
    finishedAt: "",
    status: "active",
  },
  {
    id: 5,
    cleaningId: 1,
    employee: "Н. Васильева",
    startedAt: "13:10",
    finishedAt: "",
    status: "in_progress",
  },
  {
    id: 6,
    cleaningId: 6,
    employee: "Р. Хасанов",
    startedAt: "14:00",
    finishedAt: "",
    status: "in_progress",
  },
  {
    id: 7,
    cleaningId: 2,
    employee: "Д. Лебедев",
    startedAt: "12:05",
    finishedAt: "12:18",
    status: "approved",
  },
];

export const initialPreparationItems = [
  {
    id: 1,
    name: "Лосось, стейки",
    preparedAt: "2026-06-12 13:17:39",
    volume: "21.283",
    waste: "2.342",
    unit: "кг.",
    employee: "Рыцарев И. Ю.",
    helper: "",
    confirmedAt: "2026-06-12 14:16:30",
    confirmer: "Беседина Г. М.",
    status: "approved",
  },
  {
    id: 2,
    name: "Угорь, 2% соуса",
    preparedAt: "2026-06-12 13:10:55",
    volume: "1.28",
    waste: "0.6",
    unit: "кг.",
    employee: "Логинов А. М.",
    helper: "",
    confirmedAt: "",
    confirmer: "",
    status: "pending",
  },
  {
    id: 3,
    name: "Шампиньоны",
    preparedAt: "2026-06-12 13:06:49",
    volume: "0.717",
    waste: "0",
    unit: "кг.",
    employee: "Чихирев А. В.",
    helper: "",
    confirmedAt: "2026-06-12 13:12:03",
    confirmer: "Беседина Г. М.",
    status: "approved",
  },
  {
    id: 4,
    name: "Рис варёный",
    preparedAt: "2026-06-12 12:56:09",
    volume: "28.4",
    waste: "0.4",
    unit: "кг",
    employee: "Кузют Е. Н.",
    helper: "",
    confirmedAt: "",
    confirmer: "",
    status: "pending",
  },
  {
    id: 5,
    name: "Мицуккан",
    preparedAt: "2026-06-12 12:55:38",
    volume: "16.8",
    waste: "0",
    unit: "кг",
    employee: "Кузют Е. Н.",
    helper: "",
    confirmedAt: "2026-06-12 13:06:05",
    confirmer: "Беседина Г. М.",
    status: "approved",
  },
  {
    id: 6,
    name: "Ананасы",
    preparedAt: "2026-06-12 12:35:31",
    volume: "4.08",
    waste: "2.7",
    unit: "кг",
    employee: "Чихирев А. В.",
    helper: "",
    confirmedAt: "",
    confirmer: "",
    status: "pending",
  },
];
