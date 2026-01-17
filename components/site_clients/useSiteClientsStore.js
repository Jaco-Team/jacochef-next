"use client";

import dayjs from "dayjs";
import { create } from "zustand";

const LS_KEY = "site_clients_params";

const PERSIST_KEYS = [
  "keepParams",
  "number",
  "order",
  "addr",
  "address_list",
  "promo",
  "city_id",
  "city_id_addr",
  "city_id_traffic",
  "point_id",
  "points_recursive",
  "points_marketing",
  "promo_recursive",
  "items_recursive",
  "items",
  "date_start",
  "date_end",
  "date_start_addr",
  "date_end_addr",
  "date_start_traffic",
  "date_end_traffic",
  "date_start_marketing",
  "date_end_marketing",
  "date_start_recur",
  "date_end_recur",
];

const defaultState = {
  module: "site_clients",
  module_name: "",
  is_load: false,

  access: null,
  fullScreen: false,

  openAlert: false,
  err_status: true,
  err_text: "",

  keepParams: true,

  search: "",
  clients: [],

  number: "",
  order: "",
  search_orders: [],
  addr: "",
  promo: "",

  cities: [],
  city_id: [],
  city_id_addr: [],
  city_id_traffic: [],

  all_items: [],
  items: [],
  items_recursive: [],

  date_start: dayjs().format("YYYY-MM-DD"),
  date_end: dayjs().format("YYYY-MM-DD"),

  date_start_addr: dayjs().format("YYYY-MM-DD"),
  date_end_addr: dayjs().format("YYYY-MM-DD"),

  date_start_traffic: dayjs().format("YYYY-MM-DD"),
  date_end_traffic: dayjs().format("YYYY-MM-DD"),

  date_start_marketing: dayjs().format("YYYY-MM-DD"),
  date_end_marketing: dayjs().format("YYYY-MM-DD"),

  date_start_recur: dayjs().format("YYYY-MM-DD"),
  date_end_recur: dayjs().format("YYYY-MM-DD"),

  modalDialog: false,
  client_login: "",
  client_id: "",
  client: null,
  orders: [],
  err_orders: [],
  comments: [],

  created: [],
  all_created: [
    { id: 1, name: "Клиент" },
    { id: 2, name: "Контакт-центр" },
    { id: 3, name: "Кафе" },
  ],

  days: [],

  modalDialog_order: false,
  showOrder: null,

  modalDialogAction: false,
  comment_id: null,

  login_sms: [],
  login_yandex: [],

  address_list: "",
  orders_list: [],
  orders_list_addr: [],

  traffic_stats: [],
  traffic_sources: [],
  orders_by_source: [],
  orders_by_utm: [],

  points: [],
  points_recursive: [],
  points_marketing: [],

  select_toggle: "city",
  point_id: [],

  orders_recursive: null,

  promo_dr: false,
  promo_recursive: "",
};

export const useSiteClientsStore = create((set, get) => ({
  ...defaultState,

  hydrate: () => {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);

      if (parsed.keepParams === false) {
        set({ keepParams: false });
        return;
      }

      const patch = {};
      PERSIST_KEYS.forEach((k) => {
        if (parsed[k] !== undefined) patch[k] = parsed[k];
      });

      set(patch);
    } catch {}
  },

  // --- SPECIAL: update state + run persistence logic
  update: (patch) => {
    const prev = get();
    const next = { ...prev, ...patch };

    // CASE: user turns keepParams OFF
    if ("keepParams" in patch && patch.keepParams === false) {
      localStorage.setItem(LS_KEY, JSON.stringify({ keepParams: false }));
      return set(patch);
    }

    // CASE: keepParams OFF → do not persist anything else
    if (!prev.keepParams) {
      return set(patch);
    }

    // CASE: keepParams ON → persist selected keys
    const stored = {};
    PERSIST_KEYS.forEach((key) => {
      stored[key] = next[key];
    });
    localStorage.setItem(LS_KEY, JSON.stringify(stored));

    return set(patch);
  },
}));
