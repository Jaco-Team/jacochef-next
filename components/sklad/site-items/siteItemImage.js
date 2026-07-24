"use client";

const SITE_ITEM_IMAGE_BASE_URL = "https://storage.yandexcloud.net/site-img";
const SITE_ITEM_IMAGE_SIZE = "366x366";

function normalizeValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function isAbsoluteUrl(value) {
  return /^https?:\/\//i.test(normalizeValue(value));
}

export function buildSiteItemStorageImageUrl(
  assetKey,
  size = SITE_ITEM_IMAGE_SIZE,
  extension = "webp",
) {
  const normalizedAssetKey = normalizeValue(assetKey);
  const normalizedExtension = normalizeValue(extension) || "webp";

  if (!normalizedAssetKey) {
    return null;
  }

  return `${SITE_ITEM_IMAGE_BASE_URL}/${normalizedAssetKey}_${size}.${normalizedExtension}`;
}

export function resolveSiteItemImageUrl(image, fallbackAssetKey = "") {
  const webpUrl = normalizeValue(image?.variants?.webp?.url);
  const jpgUrl = normalizeValue(image?.variants?.jpg?.url);

  if (isAbsoluteUrl(webpUrl)) {
    return webpUrl;
  }

  if (isAbsoluteUrl(jpgUrl)) {
    return jpgUrl;
  }

  const assetKey =
    normalizeValue(image?.current_fields?.img_app) ||
    normalizeValue(fallbackAssetKey) ||
    normalizeValue(image?.asset_key);

  return buildSiteItemStorageImageUrl(assetKey, SITE_ITEM_IMAGE_SIZE, "webp");
}
