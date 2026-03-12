"use client";

export const createEmptyVendor = () => ({
  id: null,
  name: "",
  min_price: "",
  inn: "",
  ogrn: "",
  addr: "",
  text: "",
  bill_ex: 0,
  need_img_bill_ex: 0,
  bik: "",
  rc: "",
  phone: "",
  is_show: 1,
  is_priority: 0,
});

export const normalizeVendor = (vendor) => ({
  ...createEmptyVendor(),
  ...(vendor || {}),
  bill_ex: Number(vendor?.bill_ex ?? 0),
  need_img_bill_ex: Number(vendor?.need_img_bill_ex ?? 0),
  is_show: Number(vendor?.is_show ?? 1),
  is_priority: Number(vendor?.is_priority ?? 0),
  phone: vendor?.phone || "",
});

export const normalizeCities = (cities) =>
  Array.isArray(cities)
    ? cities
        .filter((city) => Number(city?.id) > 0)
        .map((city) => ({
          id: Number(city.id),
          name: city.name || "",
          addr: city.addr || "",
        }))
    : [];

export const normalizeCatalogItems = (items) =>
  Array.isArray(items)
    ? items
        .filter((item) => Number(item?.id) > 0)
        .map((item) => ({
          ...item,
          id: Number(item.id),
          name: item.name || "",
        }))
    : [];

export const normalizeMails = (mails, allPoints = []) =>
  Array.isArray(mails)
    ? mails.map((mail) => ({
        point_id:
          Number(mail?.point_id) || Number(mail?.point_id) === -1
            ? (() => {
                const pointId = Number(mail.point_id);
                const point = (allPoints || []).find((item) => Number(item.id) === pointId);
                return {
                  id: pointId,
                  name: point?.addr || "Без точки",
                  city_id: Number(point?.city_id ?? -1),
                };
              })()
            : mail?.point_id?.id
              ? {
                  id: Number(mail.point_id.id),
                  name: mail.point_id.name || "",
                  city_id: Number(mail.point_id.city_id ?? -1),
                }
              : null,
        mail: mail?.mail || "",
        comment: mail?.comment || "",
      }))
    : [];

export const createEmptyMail = () => ({
  point_id: null,
  mail: "",
  comment: "",
});

export const getPointOptions = (allPoints, vendorCities) => {
  const points = Array.isArray(allPoints)
    ? allPoints.map((point) => ({
        ...point,
        name: point.name || point.addr || "",
      }))
    : [];
  const cityIds = new Set((vendorCities || []).map((city) => Number(city.id)));

  if (!cityIds.size) {
    return points.filter(
      (point, index, array) =>
        array.findIndex((item) => Number(item.id) === Number(point.id)) === index,
    );
  }

  const globalPoint = points.find((point) => Number(point.id) === -1);
  const scopedPoints = points.filter((point) => cityIds.has(Number(point.city_id)));
  const result = [...(globalPoint ? [globalPoint] : []), ...scopedPoints];

  return result.filter(
    (point, index, array) =>
      array.findIndex((item) => Number(item.id) === Number(point.id)) === index,
  );
};

export const buildVendorPayload = (vendor, mode) => {
  const normalized = normalizeVendor(vendor);
  const base = {
    name: normalized.name.trim(),
    min_price: normalized.min_price ?? "",
    inn: normalized.inn.trim(),
    ogrn: normalized.ogrn.trim(),
    addr: normalized.addr.trim(),
    text: normalized.text.trim(),
    bill_ex: Number(normalized.bill_ex ? 1 : 0),
    need_img_bill_ex: Number(normalized.need_img_bill_ex ? 1 : 0),
    bik: normalized.bik.trim(),
    rc: normalized.rc.trim(),
    phone: normalized.phone.trim(),
  };

  if (mode === "update") {
    return {
      ...base,
      phone: normalized.phone.trim(),
      id: Number(normalized.id),
      is_show: Number(normalized.is_show ? 1 : 0),
      is_priority: Number(normalized.is_priority ? 1 : 0),
    };
  }

  return base;
};

export const buildVendorCitiesPayload = (vendorCities) =>
  (vendorCities || [])
    .map((city) => ({ id: Number(city.id) }))
    .filter((city) => Number(city.id) > 0);

export const buildMailsPayload = (mails) =>
  (mails || [])
    .filter((mail) => Number(mail?.point_id?.id) || Number(mail?.point_id?.id) === -1)
    .filter((mail) => mail.mail?.trim())
    .map((mail) => ({
      point_id: Number(mail.point_id.id),
      mail: mail.mail.trim(),
      comment: mail.comment?.trim() || "",
    }));

export const buildVendorItemsPayload = (items) =>
  (items || []).map((item, index) => ({
    item_id: Number(item.item_id ?? item.id),
    nds: Number(item.nds ?? -1),
    sort: Number(item.sort ?? index * 10),
  }));

export const formatVendorNds = (value) => {
  const nds = Number(value);

  if (nds === -1) {
    return "Без НДС";
  }

  if (Number.isNaN(nds)) {
    return "НДС не указан";
  }

  return `НДС ${nds}%`;
};

export const getCityNamesByIds = (cityIds, cities) =>
  (cityIds || [])
    .map((cityId) => cities.find((city) => Number(city.id) === Number(cityId))?.name)
    .filter(Boolean);

export const formatMoney = (value) => {
  if (value === null || value === undefined || value === "") {
    return "Не указан";
  }

  return `${String(value).replace(".", ",")} ₽`;
};
