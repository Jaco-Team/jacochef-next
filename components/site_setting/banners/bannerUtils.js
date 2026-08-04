import dayjs from "dayjs";

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || "https://apichef.jacochef.ru/api").replace(
  /\/+$/,
  "",
);

export function buildBannerDTO(banner) {
  const bannerDTO = JSON.parse(JSON.stringify(banner));
  bannerDTO.this_ban.items =
    bannerDTO?.this_ban?.items?.map((item) => ({
      item_id: item.id,
    })) ?? [];

  bannerDTO.this_ban.date_start = dayjs(bannerDTO.this_ban.date_start).format("YYYY-MM-DD");
  bannerDTO.this_ban.date_end = dayjs(bannerDTO.this_ban.date_end).format("YYYY-MM-DD");

  return bannerDTO;
}

export const dropzoneOptions = {
  autoProcessQueue: false,
  autoQueue: true,
  maxFilesize: 20,
  maxFiles: 1,
  timeout: 0,
  parallelUploads: 10,
  acceptedFiles: "image/jpeg, image/png, video/mp4, video/quicktime",
  addRemoveLinks: true,
  dictDefaultMessage: "Перетащите файлы сюда (изображения JPG/PNG, видео MP4/MOV)",
  url: `${apiBaseUrl}/site_setting/upload_banner`,
  // url: 'http://127.0.0.1:8000/api/site_setting/upload_banner',
  // url: "https://apichef.jacochef.ru/api/site_setting/upload_banner",
};
