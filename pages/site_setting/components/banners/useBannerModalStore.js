import { create } from "zustand";
// import { devtools } from 'zustand/middleware';
import { formatDate } from "@/ui/elements";

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

  setBanner: (banner) => {
    if (!banner?.this_ban) return;
    banner.this_ban.items =
      banner.this_ban.items?.map((element) =>
        typeof element === "number" ? banner.items?.find((item) => item.id === element) : element
      ) || [];
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
    const { banner } = get();
    if (!banner?.this_ban) return;
    banner.this_ban[field] = event || "";
    get().setBanner({ banner });
  },

  changeAutoComplete: (field, event, newValue) => {
    const { banner } = get();
    console.dir(banner);
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
