import dayjs from "dayjs";

export function buildBannerDTO(banner) {
  const bannerDTO = JSON.parse(JSON.stringify(banner));
  bannerDTO.this_ban.items = bannerDTO?.this_ban?.items?.map(item => ({
    item_id: item.id,
  })) ?? [];

  bannerDTO.this_ban.date_start = dayjs(bannerDTO.this_ban.date_start).format("YYYY-MM-DD");
  bannerDTO.this_ban.date_end = dayjs(bannerDTO.this_ban.date_end).format("YYYY-MM-DD");

  return bannerDTO;
}

export const dropzoneOptions = {
  autoProcessQueue: false,
  autoQueue: true,
  maxFiles: 1,
  timeout: 0,
  parallelUploads: 10,
  acceptedFiles: "image/jpeg",
  addRemoveLinks: true,
  dictDefaultMessage: "Перетащите файлы сюда для загрузки",
  url: "https://jacochef.ru/src/img/site_banners/upload_img_new.php",
};
