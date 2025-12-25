"use client";

import { formatDate } from "@/src/helpers/ui/formatDate";
import { create } from "zustand";
// import { devtools } from 'zustand/middleware';

const bannerNew = {
  name: "",
  text: "",
  items: [],
  img: "",
  city_id: -1,
  promo_id: null,
  date_start: formatDate(new Date()),
  date_end: formatDate(new Date()),
};

// export const useBannerModalStore = create(devtools((set, get) => ({
export const useBannerModalStore = create((set, get) => ({
  banner: null,
  bannerName: "",
  promos: "",
  desktopDropzone: null,
  mobileDropzone: null,
  isLoading: false,

  rus2translit(text) {
    if (!text || typeof text !== "string") return "";

    const translitMap = {
      А: "A",
      Б: "B",
      В: "V",
      Г: "G",
      Д: "D",
      Е: "E",
      Ё: "IO",
      Ж: "ZH",
      З: "Z",
      И: "I",
      Й: "I",
      К: "K",
      Л: "L",
      М: "M",
      Н: "N",
      О: "O",
      П: "P",
      Р: "R",
      С: "S",
      Т: "T",
      У: "U",
      Ф: "F",
      Х: "H",
      Ц: "C",
      Ч: "CH",
      Ш: "SH",
      Щ: "SH",
      Ъ: "",
      Ы: "Y",
      Ь: "",
      Э: "E",
      Ю: "IU",
      Я: "IA",
      а: "a",
      б: "b",
      в: "v",
      г: "g",
      д: "d",
      е: "e",
      ё: "io",
      ж: "zh",
      з: "z",
      и: "i",
      й: "i",
      к: "k",
      л: "l",
      м: "m",
      н: "n",
      о: "o",
      п: "p",
      р: "r",
      с: "s",
      т: "t",
      у: "u",
      ф: "f",
      х: "h",
      ц: "c",
      ч: "ch",
      ш: "sh",
      щ: "sh",
      ъ: "",
      ы: "y",
      ь: "",
      э: "e",
      ю: "iu",
      я: "ia",
      " ": "_",
      "%": "_",
    };

    return text
      .toLowerCase()
      .split("")
      .map((char) => translitMap[char] || char)
      .join("");
  },

  setBanner: (banner) => {
    if (!banner?.this_ban) return;
    banner.this_ban.items =
      banner.this_ban.items?.map((element) =>
        typeof element === "number" ? banner.items?.find((item) => item.id === element) : element,
      ) || [];
    if (!banner?.this_ban?.link && banner?.this_ban?.name) {
      banner.this_ban.link = get().rus2translit(banner?.this_ban?.name);
    }
    get().setBannerName(banner.this_ban.name);
    set({ banner });
  },
  setBannerName: (bannerName) => set({ bannerName }),
  setPromos: (promos) => {
    set({ promos });
  },
  setDesktopDropzone: (desktopDropzone) => {
    set({ desktopDropzone });
  },
  setMobileDropzone: (mobileDropzone) => {
    set({ mobileDropzone });
  },
  setIsLoading: (isLoading) => set({ isLoading }),

  getNewBanner: () => JSON.parse(JSON.stringify(bannerNew)),

  changeDateRange: (field, event) => {
    set((state) => {
      if (!state.banner?.this_ban) return state;

      return {
        banner: {
          ...state.banner,
          this_ban: {
            ...state.banner.this_ban,
            [field]: event || "",
          },
        },
      };
    });
  },

  changeAutoComplete: (field, event, newValue) => {
    const { banner } = get();
    if (!banner) return;
    const updatedThisBan = {
      ...banner.this_ban,
      [field]: newValue,
      ...(field === "items" && { promo_id: null }),
      ...(field === "promo_id" && { items: [] }),
    };
    const updatedBanner = {
      ...banner,
      this_ban: updatedThisBan,
    };
    get().setBanner(updatedBanner);
  },

  changeThisBanField: (field, event, value) => {
    // console.info(`changeThisBanField called with: ${field}, ${event}, ${value}`);
    const oldBanner = get().banner;
    if (!oldBanner) return;
    const resValue = value || event?.target?.value || "";
    const newBanner = {
      ...oldBanner,
      this_ban: {
        ...oldBanner.this_ban,
        [field]: resValue,
      },
    };

    get().setBanner(newBanner);
  },

  changeThisBanFieldBool: (field, event, value) => {
    const oldBanner = get().banner;
    if (!oldBanner) return;
    const resValue = !!value || !!event.target.checked ? 1 : 0;
    const newBanner = {
      ...oldBanner,
      this_ban: {
        ...oldBanner.this_ban,
        [field]: resValue,
      },
    };
    get().setBanner(newBanner);
  },
}));
