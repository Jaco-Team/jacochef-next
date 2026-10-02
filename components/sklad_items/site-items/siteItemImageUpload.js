export const SITE_ITEM_IMAGE_FORMATS = "JPG, PNG, WebP, GIF, BMP";
export const SITE_ITEM_IMAGE_MAX_MB = 10;
export const SITE_ITEM_IMAGE_MAX_BYTES = SITE_ITEM_IMAGE_MAX_MB * 1024 * 1024;

const extensions = ["jpg", "jpeg", "png", "webp", "gif", "bmp"];
const mimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/x-ms-bmp",
];

export const SITE_ITEM_IMAGE_ACCEPT = [
  ...extensions.map((extension) => `.${extension}`),
  ...mimeTypes,
].join(",");
export const SITE_ITEM_IMAGE_HELP = `${SITE_ITEM_IMAGE_FORMATS}, до ${SITE_ITEM_IMAGE_MAX_MB} МБ. Сервер преобразует изображение в JPG и WebP. Для GIF используется первый кадр.`;

export function getSiteItemImageFileError(file) {
  if (!file) return "";
  const mimeType = String(file.type || "").toLowerCase();
  const extension = String(file.name || "")
    .toLowerCase()
    .split(".")
    .pop();
  const supported =
    mimeType && mimeType !== "application/octet-stream"
      ? mimeTypes.includes(mimeType)
      : extensions.includes(extension);
  if (!supported) return `Допустимы только ${SITE_ITEM_IMAGE_FORMATS}`;
  if (file.size > SITE_ITEM_IMAGE_MAX_BYTES)
    return `Размер изображения не должен превышать ${SITE_ITEM_IMAGE_MAX_MB} МБ`;
  return "";
}
