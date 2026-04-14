import dayjs from "dayjs";
import formatPhone from "@/src/helpers/ui/formatPhone";

const VENDOR_FIELD_LABELS = {
  name: "Название",
  min_price: "Минимальная сумма заказа",
  inn: "ИНН",
  ogrn: "ОГРН",
  addr: "Адрес",
  text: "Комментарий",
  bill_ex: "Безналичный расчет",
  need_img_bill_ex: "Требовать фото счета",
  phone: "Телефон",
  email: "Email",
  email_2: "Дополнительный Email",
  bik: "БИК",
  rc: "Расчетный счет",
  is_show: "Активность",
  is_priority: "Приоритетный",
};

function safeParse(value) {
  if (!value) return {};
  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function pickSnapshot(...values) {
  return values.find((value) => value && Object.keys(value).length) || {};
}

function formatBooleanLike(value) {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  if (value === true || value === 1 || value === "1") {
    return "Да";
  }

  if (value === false || value === 0 || value === "0") {
    return "Нет";
  }

  return String(value);
}

function formatVendorFieldValue(field, value) {
  const normalizedField = String(field || "")
    .split(".")
    .pop();

  if (normalizedField === "phone") {
    return formatPhone(value);
  }

  if (["bill_ex", "need_img_bill_ex", "is_show", "is_priority"].includes(normalizedField)) {
    return formatBooleanLike(value);
  }

  return value === null || value === undefined || value === "" ? "" : String(value);
}

function normalizeVendorFieldLabel(field) {
  const last = String(field || "")
    .split(".")
    .pop();
  return VENDOR_FIELD_LABELS[last] || last || "Изменение";
}

function formatIndexedLabel(baseLabel, index) {
  const safeIndex = Number.isFinite(index) ? index + 1 : null;
  return safeIndex ? `${baseLabel} ${safeIndex}` : baseLabel;
}

function formatMailFieldLabel(parts) {
  const index = Number(parts?.[1]);
  const tail = parts.slice(2);
  const prefix = formatIndexedLabel("Email", index);

  if (!tail.length) {
    return `${prefix} / Запись`;
  }

  if (tail[0] === "mail") {
    return `${prefix} / Почта`;
  }

  if (tail[0] === "comment") {
    return `${prefix} / Комментарий`;
  }

  if (tail[0] === "point_id") {
    if (tail[1] === "name" || tail[1] === "addr") {
      return `${prefix} / Точка`;
    }

    if (tail[1] === "city_id") {
      return "";
    }

    if (tail[1] === "id") {
      return "";
    }
  }

  if (tail[0] === "point_id_value") {
    return "";
  }

  return `${prefix} / ${tail.join(".")}`;
}

function getCityValue(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return { id: null, name: value };
  }

  return {
    id: Number(value.id) > 0 ? Number(value.id) : null,
    name: value.name || "",
  };
}

function buildCityKey(value, fallbackKey) {
  const city = getCityValue(value);

  if (city?.id) {
    return `city:${city.id}`;
  }

  if (city?.name) {
    return `city-name:${city.name}`;
  }

  return fallbackKey;
}

function normalizeCityCollection(collection) {
  const map = new Map();

  if (Array.isArray(collection)) {
    collection.forEach((value, index) => {
      const city = getCityValue(value);

      if (!city) {
        return;
      }

      map.set(buildCityKey(city, `city-index:${index}`), city);
    });
  } else if (collection && typeof collection === "object") {
    Object.entries(collection).forEach(([key, value]) => {
      const city = getCityValue(value);

      if (!city) {
        return;
      }

      map.set(buildCityKey(city, key), city);
    });
  }

  return map;
}

function getMailPointName(mail) {
  return mail?.point_id?.name || mail?.point_id?.addr || "";
}

function getMailPointId(mail) {
  const pointId = Number(mail?.point_id?.id ?? mail?.point_id_value ?? mail?.point_id);
  return Number.isFinite(pointId) ? pointId : null;
}

function getMailKey(mail, fallbackKey) {
  const pointId = getMailPointId(mail);
  const mailValue = String(mail?.mail || "").trim();

  if (pointId !== null && mailValue) {
    return `point:${pointId}|mail:${mailValue}`;
  }

  if (pointId !== null) {
    return `point:${pointId}`;
  }

  if (mailValue) {
    return `mail:${mailValue}`;
  }

  return fallbackKey;
}

function normalizeMailEntry(mail) {
  if (!mail || typeof mail !== "object") {
    return null;
  }

  return {
    mail: String(mail.mail || "").trim(),
    comment: String(mail.comment || "").trim(),
    pointName: getMailPointName(mail),
    pointId: getMailPointId(mail),
  };
}

function normalizeMailCollection(collection) {
  const map = new Map();

  if (Array.isArray(collection)) {
    collection.forEach((value, index) => {
      const mail = normalizeMailEntry(value);

      if (!mail) {
        return;
      }

      map.set(getMailKey(value, `mail-index:${index}`), mail);
    });
  } else if (collection && typeof collection === "object") {
    Object.entries(collection).forEach(([key, value]) => {
      const mail = normalizeMailEntry(value);

      if (!mail) {
        return;
      }

      map.set(getMailKey(value, key), mail);
    });
  }

  return map;
}

function getMailLabel(mail) {
  if (mail?.mail) {
    return `Email ${mail.mail}`;
  }

  if (mail?.pointName) {
    return `Email ${mail.pointName}`;
  }

  return "Email";
}

function formatMailSummary(mail, action = "") {
  const parts = [action, mail?.pointName, mail?.comment].filter(Boolean);
  return parts.join(" • ");
}

function addCollectionChange(result, label, from, to) {
  if (!label) {
    return;
  }

  if (!from && !to) {
    return;
  }

  result[label] = { from: from || "", to: to || "" };
}

function addVendorCitiesDiffFromSnapshots(result, beforeSnapshot, afterSnapshot) {
  const beforeCities = normalizeCityCollection(beforeSnapshot?.vendor_cities);
  const afterCities = normalizeCityCollection(afterSnapshot?.vendor_cities);
  const keys = new Set([...beforeCities.keys(), ...afterCities.keys()]);

  [...keys].sort().forEach((key) => {
    const beforeCity = beforeCities.get(key);
    const afterCity = afterCities.get(key);

    if (!beforeCity && afterCity) {
      addCollectionChange(result, `Город ${afterCity.name || key}`, "", "Добавлен");
      return;
    }

    if (beforeCity && !afterCity) {
      addCollectionChange(result, `Город ${beforeCity.name || key}`, "", "Удален");
    }
  });
}

function addMailEntryDiff(result, label, beforeMail, afterMail) {
  if (!beforeMail && afterMail) {
    addCollectionChange(result, label, "", formatMailSummary(afterMail, "Добавлен"));
    return;
  }

  if (beforeMail && !afterMail) {
    addCollectionChange(result, label, "", formatMailSummary(beforeMail, "Удален"));
    return;
  }

  if (!beforeMail || !afterMail) {
    return;
  }

  if (beforeMail.pointName !== afterMail.pointName) {
    addCollectionChange(result, `${label} / Точка`, beforeMail.pointName, afterMail.pointName);
  }

  if (beforeMail.comment !== afterMail.comment) {
    addCollectionChange(result, `${label} / Комментарий`, beforeMail.comment, afterMail.comment);
  }
}

function addMailsDiffFromSnapshots(result, beforeSnapshot, afterSnapshot) {
  const beforeMails = normalizeMailCollection(beforeSnapshot?.mails);
  const afterMails = normalizeMailCollection(afterSnapshot?.mails);
  const keys = new Set([...beforeMails.keys(), ...afterMails.keys()]);

  [...keys].sort().forEach((key) => {
    const beforeMail = beforeMails.get(key);
    const afterMail = afterMails.get(key);
    const label = getMailLabel(afterMail || beforeMail);

    addMailEntryDiff(result, label, beforeMail, afterMail);
  });
}

function formatVendorCitiesFieldLabel(parts) {
  const index = Number(parts?.[1]);
  const tail = parts.slice(2);
  const prefix = formatIndexedLabel("Город", index);

  if (!tail.length) {
    return prefix;
  }

  if (tail[0] === "name") {
    return prefix;
  }

  if (tail[0] === "id") {
    return "";
  }

  return `${prefix} / ${tail.join(".")}`;
}

function stringifyNestedValue(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (typeof value !== "object") {
    return String(value);
  }

  if (value?.name) {
    return String(value.name);
  }

  if (value?.mail) {
    return String(value.mail);
  }

  if (value?.addr) {
    return String(value.addr);
  }

  if (value?.comment) {
    return String(value.comment);
  }

  return "";
}

function addNestedVendorDiff(result, label, change) {
  if (!label) {
    return;
  }

  const from = stringifyNestedValue(change?.from);
  const to = stringifyNestedValue(change?.to);

  if (!from && !to) {
    return;
  }

  result[label] = { from, to };
}

function getHistoryDateValue(item) {
  const createdAt = item?.created_at || item?.date_time_update || item?.date_update;
  return dayjs(createdAt).isValid() ? dayjs(createdAt).valueOf() : 0;
}

function getHistoryActor(item) {
  return item?.actor_name || item?.user || item?.login || "Неизвестно";
}

function getProductName(item, diff, meta, itemNamesMap) {
  const before = safeParse(item?.before_json);
  const after = safeParse(item?.after_json);
  const directCandidates = [
    item?.item_name,
    item?.name,
    item?.before?.item_name,
    item?.after?.item_name,
    before?.item_name,
    after?.item_name,
    meta?.item_name,
    meta?.name,
    diff?.item_name?.to,
    diff?.item_name?.from,
    diff?.name?.to,
    diff?.name?.from,
  ];

  const directMatch = directCandidates.find(Boolean);
  if (directMatch) {
    return directMatch;
  }

  const idCandidates = [item?.item_id, meta?.item_id, diff?.item_id?.to, diff?.item_id?.from]
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);

  for (const itemId of idCandidates) {
    if (itemNamesMap.has(itemId)) {
      return itemNamesMap.get(itemId);
    }
  }

  return idCandidates[0] ? `Товар #${idCandidates[0]}` : "Товар";
}

function isProductHistoryItem(item, diff, meta) {
  if (item?.scope === "vendor_items") {
    return true;
  }

  const text = [
    item?.scope,
    item?.event_type,
    item?.type,
    item?.table_name,
    meta?.entity_type,
    meta?.table,
    meta?.type,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (text.includes("vendor_item") || text.includes("product") || text.includes("item")) {
    return true;
  }

  return Boolean(item?.item_id || meta?.item_id || diff?.item_id || diff?.item_name || diff?.name);
}

function isRemoveEvent(item, diff, meta) {
  if (item?.scope === "vendor_items") {
    return String(item?.event_type || "").toLowerCase() === "delete";
  }

  const text = [item?.event_type, item?.type, meta?.action, meta?.event_type]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    text.includes("delete") ||
    text.includes("remove") ||
    text.includes("unlink") ||
    text.includes("detach")
  ) {
    return true;
  }

  const itemNameDiff = diff?.item_name || diff?.name;
  if (itemNameDiff) {
    return Boolean(itemNameDiff.from && !itemNameDiff.to);
  }

  const itemIdDiff = diff?.item_id;
  if (itemIdDiff) {
    return Boolean(itemIdDiff.from && !itemIdDiff.to);
  }

  return false;
}

function buildProductHistoryDiff(item, diff, meta, itemNamesMap) {
  const isRemove = isRemoveEvent(item, diff, meta);
  const snapshot = pickSnapshot(
    item?.after,
    safeParse(item?.after_json),
    item?.before,
    safeParse(item?.before_json),
  );
  const productName = getProductName(item, diff, meta, itemNamesMap);
  const categoryName = snapshot?.cat_name || diff?.cat_name?.to || diff?.cat_name?.from || "";

  const result = {
    Действие: {
      from: "",
      to: isRemove ? "Товар удален у поставщика" : "Товар добавлен поставщику",
    },
    Товар: {
      from: "",
      to: productName,
    },
  };

  if (categoryName) {
    result["Категория"] = {
      from: "",
      to: categoryName,
    };
  }

  return result;
}

function buildVendorUpdateDiff(diff, beforeSnapshot = {}, afterSnapshot = {}) {
  const result = {};
  const shouldBuildCitiesFromSnapshots =
    beforeSnapshot?.vendor_cities !== undefined ||
    afterSnapshot?.vendor_cities !== undefined ||
    Object.keys(diff || {}).some((field) => String(field || "").startsWith("vendor_cities."));
  const shouldBuildMailsFromSnapshots =
    beforeSnapshot?.mails !== undefined ||
    afterSnapshot?.mails !== undefined ||
    Object.keys(diff || {}).some((field) => String(field || "").startsWith("mails."));

  Object.entries(diff || {}).forEach(([field, value]) => {
    const fieldPath = String(field || "");

    if (fieldPath.startsWith("vendor.")) {
      result[normalizeVendorFieldLabel(field)] = {
        from: formatVendorFieldValue(field, value?.from),
        to: formatVendorFieldValue(field, value?.to),
      };
      return;
    }

    if (fieldPath.startsWith("vendor_cities.")) {
      if (shouldBuildCitiesFromSnapshots) {
        return;
      }

      addNestedVendorDiff(result, formatVendorCitiesFieldLabel(fieldPath.split(".")), value);
      return;
    }

    if (fieldPath.startsWith("mails.")) {
      if (shouldBuildMailsFromSnapshots) {
        return;
      }

      const parts = fieldPath.split(".");

      if (parts.length === 2) {
        const index = Number(parts[1]);
        const prefix = formatIndexedLabel("Email", index);
        const fromValue = safeParse(value?.from);
        const toValue = safeParse(value?.to);

        addNestedVendorDiff(result, `${prefix} / Почта`, {
          from: fromValue?.mail,
          to: toValue?.mail,
        });
        addNestedVendorDiff(result, `${prefix} / Комментарий`, {
          from: fromValue?.comment,
          to: toValue?.comment,
        });
        addNestedVendorDiff(result, `${prefix} / Точка`, {
          from: fromValue?.point_id?.name || fromValue?.point_id?.addr,
          to: toValue?.point_id?.name || toValue?.point_id?.addr,
        });
        addNestedVendorDiff(result, `${prefix} / Город`, {
          from: "",
          to: "",
        });
        return;
      }

      addNestedVendorDiff(result, formatMailFieldLabel(parts), value);
    }
  });

  if (shouldBuildCitiesFromSnapshots) {
    addVendorCitiesDiffFromSnapshots(result, beforeSnapshot, afterSnapshot);
  }

  if (shouldBuildMailsFromSnapshots) {
    addMailsDiffFromSnapshots(result, beforeSnapshot, afterSnapshot);
  }

  if (!Object.keys(result).length) {
    result.Изменения = {
      from: "",
      to: "Данные поставщика обновлены",
    };
  }

  return result;
}

function buildVendorHistoryMeta(item) {
  if (item?.scope === "vendor_items") {
    return { entity_type: "vendor_item" };
  }

  return { entity_type: "vendor" };
}

export function normalizeVendorHistory(history = [], vendorItems = []) {
  const safeHistory = Array.isArray(history) ? history.filter(Boolean) : [];
  const itemNamesMap = new Map(
    (Array.isArray(vendorItems) ? vendorItems : []).map((item) => [
      Number(item?.item_id ?? item?.id),
      item?.item_name || item?.name || `Товар #${item?.item_id ?? item?.id}`,
    ]),
  );

  return [...safeHistory]
    .sort((a, b) => {
      const dateDifference = getHistoryDateValue(b) - getHistoryDateValue(a);

      if (dateDifference !== 0) {
        return dateDifference;
      }

      return parseInt(b?.id || b?.hist_id || 0) - parseInt(a?.id || a?.hist_id || 0);
    })
    .map((item, index) => {
      const diff = safeParse(item?.diff_json);
      const meta = safeParse(item?.meta_json);
      const before = item?.before || safeParse(item?.before_json);
      const after = item?.after || safeParse(item?.after_json);
      const normalizedDiff = isProductHistoryItem(item, diff, meta)
        ? buildProductHistoryDiff({ ...item, before, after }, diff, meta, itemNamesMap)
        : buildVendorUpdateDiff(diff, before, after);

      return {
        id: item?.id || item?.hist_id || `vendor-history-${index}`,
        created_at: item?.created_at || item?.date_time_update || item?.date_update || null,
        actor_name: getHistoryActor(item),
        event_type: item?.event_type || item?.type || "update",
        diff_json: JSON.stringify(normalizedDiff),
        meta_json: JSON.stringify({
          ...(meta || {}),
          ...buildVendorHistoryMeta(item),
        }),
      };
    });
}
