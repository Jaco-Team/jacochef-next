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
  promos: [],
  desktopDropzone: null,
  mobileDropzone: null,
  isInitD: false,
  isInitM: false,
  isLoading: false,

  setBanner: (banner) => {
    if (!banner?.this_ban?.items) return;
    banner.this_ban.items = banner.this_ban.items.map((element) =>
      typeof element === 'number' ? banner.items.find((item) => item.id === element) : element
    );
    set({ banner });
    get().setPromos(banner.promos);
  },
  setBannerName: (bannerName) => set({ bannerName }),
  setPromos: (promos) => {
    set({ promos });
  },
  setIsInitD: (setIsInitD) => set({ setIsInitD }),
  setIsInitM: (setIsInitM) => set({ setIsInitM }),
  setDesktopDropzone: (desktopDropzone) => {
    if (!get().desktopDropzone) {
      set({ desktopDropzone });
    }
  },
  setMobileDropzone: (mobileDropzone) => {
    if (!get().mobileDropzone) {
      set({ mobileDropzone });
    }
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
    console.log(`current banner.this_ban[${field}] = ${JSON.stringify(banner.this_ban[field])}`);
    console.info(
      `changeAutocomplete called with: field=${field}, event=${event}, final value = ${JSON.stringify(
        newValue
      )}`
    );
    get().setBanner(updatedBanner);
  },

  changeThisBanField: (field, event, value) => {
    // console.info(`changeThisBanField called with: ${field}, ${event}, ${value}`);
    const banner = get().banner;
    if (!banner) return;
    const resValue = value || event?.target?.value || "";
    // console.log(`setting this_ban.${field} to ${resValue}`)
    banner.this_ban[field] = resValue;
    get().setBanner(banner);
  },

  changeThisBanFieldBool: (field, event, value) => {
    const banner = get().banner;
    if (!banner) return;
    const resValue = !!value || !!event.target.checked ? 1 : 0;
    // console.log(`changeThisBanFieldBool value=${value} event.target.checked=${event.target.checked} => banner.this_ban[${field}] = ${resValue}`)
    banner.this_ban[field] = resValue;
    get().setBanner(banner);
  },
}));
