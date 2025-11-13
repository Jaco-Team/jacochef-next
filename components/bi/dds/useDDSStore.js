"use client";

import { formatDate } from "@/src/helpers/ui/formatDate";
import { create } from "zustand";

// Articles (master)
const articles = [
  {
    id: 1,
    name: "Выручка от покупателей",
    group: "Операционные поступления",
    type: "Основная деятельность",
    operation: "от покупателя",
    updated: "15.01.2024",
    flow: 1, // income
  },
  {
    id: 2,
    name: "Закупка продуктов",
    group: "Операционные платежи",
    type: "Себестоимость",
    operation: "поставщику",
    updated: "15.01.2024",
    flow: 0, // expense
  },
  {
    id: 3,
    name: "Аренда помещений",
    group: "Операционные платежи",
    type: "Постоянные расходы",
    operation: "на расходы",
    updated: "15.01.2024",
    flow: 0, // expense
  },
  {
    id: 4,
    name: "Зарплата сотрудников",
    group: "Операционные платежи",
    type: "ФОТ",
    operation: "на расходы",
    updated: "15.01.2024",
    flow: 0, // expense
  },
  {
    id: 5,
    name: "Возврат от поставщиков",
    group: "Операционные поступления",
    type: "Прочие доходы",
    operation: "прочие поступления",
    updated: "16.01.2024",
    flow: 1, // income
  },
];

// Transactions log (detail)
const transactions = [
  {
    id: 1,
    date: "01.11.2024",
    number: "00001",
    income: 125000,
    expense: null,
    contractor: "ИП Иванов А.А.",
    purpose: "Оплата по договору №123",
    article_id: 1,
  },
  {
    id: 2,
    date: "02.11.2024",
    number: "00002",
    income: null,
    expense: 45000,
    contractor: 'ООО "Поставщик продуктов"',
    purpose: "Закупка кофейных зерен",
    article_id: 4,
  },
  {
    id: 3,
    date: "03.11.2024",
    number: "00003",
    income: null,
    expense: 80000,
    contractor: 'ООО "Арендодатель"',
    purpose: "Аренда за ноябрь 2024",
    article_id: 3,
  },
  {
    id: 4,
    date: "05.11.2024",
    number: "00004",
    income: 98500,
    expense: null,
    contractor: 'ООО "Корпоративный клиент"',
    purpose: "Оплата за услуги кейтеринга",
    article_id: 1,
  },
  {
    id: 5,
    date: "10.11.2024",
    number: "00005",
    income: null,
    expense: 150000,
    contractor: "Сотрудники",
    purpose: "Выплата заработной платы за октябрь",
    article_id: 2,
  },
  {
    id: 6,
    date: "12.11.2024",
    number: "00006",
    income: 5000,
    expense: null,
    contractor: 'ООО "Поставщик продуктов"',
    purpose: "Возврат за бракованный товар",
    article_id: 5,
  },
  {
    id: 7,
    date: "15.11.2024",
    number: "00007",
    income: null,
    expense: 23000,
    contractor: 'ООО "Коммунальные услуги"',
    purpose: "Оплата электроэнергии и воды",
    article_id: null, // unclassified
  },
  {
    id: 8,
    date: "18.11.2024",
    number: "00008",
    income: 156000,
    expense: null,
    contractor: "ИП Петров В.В.",
    purpose: "Оплата по договору №456",
    article_id: 1,
  },
];

const useDDSStore = create((set) => ({
  module: "bi_dds",
  module_name: "Анализ бизнеса: статьи ДДС",
  access: [],
  points: [],
  point: [],
  is_load: false,
  date_start: formatDate(),
  date_end: formatDate(),

  articles: articles,
  transactions: transactions,

  setStateKey: (key, value) => set((state) => ({ ...state, [key]: value })),
}));

export default useDDSStore;
