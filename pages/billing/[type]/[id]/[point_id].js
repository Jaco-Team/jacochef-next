import React from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import IconButton from "@mui/material/IconButton";

import Dropzone from "dropzone";

import {
  MySelect,
  MyAutocomplite,
  MyAutocomplite2,
  MyDatePickerNew,
  MyTextInput,
  MyCheckBox,
} from "@/ui/Forms";

import queryString from "query-string";
import dayjs from "dayjs";
import { create } from "zustand";

import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import ContrastIcon from "@mui/icons-material/Contrast";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import CloseIcon from "@mui/icons-material/Close";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import HorizontalSplitIcon from "@mui/icons-material/HorizontalSplit";
import VerticalSplitIcon from "@mui/icons-material/VerticalSplit";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

// import Draggable from "react-draggable";

import { DndContext } from "@dnd-kit/core";
import {
  billingFieldMinHeight,
  billingFieldRadius,
  BillingPageHero,
  BillingSection,
  billingConfirmDialogPaperSx,
  billingPageFieldSx,
  billingPriceWarningChipSx,
  billingPriceWarningRowSx,
  billingSectionPaperSx,
  billingTableContainerSx,
  billingTableSx,
} from "@/components/billing/BillingPageCommon";
import DraggableImage from "@/components/billing/DraggableImage";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import MyAlert from "@/ui/MyAlert";
import { formatDateReverse } from "@/src/helpers/ui/formatDate";
import { api_laravel, api_laravel_local } from "@/src/api_new";

const types = [
  {
    name: "Счет",
    id: "1",
  },
  {
    name: "Поступление",
    id: "2",
  },
  {
    name: "Коррекция",
    id: "3",
  },
  {
    name: "Возврат",
    id: "4",
  },
];

const BILLING_COMPARE_FORM_ANCHOR_ID = "billing-compare-form-anchor";

function scrollToBillingCompareForm(behavior = "smooth") {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  window.requestAnimationFrame(() => {
    const anchor = document.getElementById(BILLING_COMPARE_FORM_ANCHOR_ID);

    if (!anchor) {
      return;
    }

    const top = anchor.getBoundingClientRect().top + window.scrollY - 88;

    window.scrollTo({
      top: Math.max(top, 0),
      behavior,
    });
  });
}

function getBillingViewerImageEntries({
  typeDoc = "",
  type = "",
  docBaseId = "",
  imgsBill = [],
  imgsFactur = [],
}) {
  const mainBucket = typeDoc === "bill" ? "bill/" : "bill-ex-items/";
  const mainBaseUrl = `https://storage.yandexcloud.net/${mainBucket}`;
  const facturBaseUrl = "https://storage.yandexcloud.net/bill/";

  const mainEntries = (Array.isArray(imgsBill) ? imgsBill : [])
    .filter((img) => isImageFileName(img))
    .map((img) => ({
      url: `${mainBaseUrl}${img}`,
      type: "bill",
    }));

  const shouldIncludeFactur =
    typeDoc === "bill" && parseInt(type) === 2 && parseInt(docBaseId) === 5;

  if (!shouldIncludeFactur) {
    return mainEntries;
  }

  const facturEntries = (Array.isArray(imgsFactur) ? imgsFactur : [])
    .filter((img) => isImageFileName(img))
    .map((img) => ({
      url: `${facturBaseUrl}${img}`,
      type: "factur",
    }));

  return [...mainEntries, ...facturEntries];
}

function getOrientation(file, callback) {
  var reader = new FileReader();

  reader.onload = function (event) {
    var view = new DataView(event.target.result);

    if (view.getUint16(0, false) != 0xffd8) return callback(-2);

    var length = view.byteLength,
      offset = 2;

    while (offset < length) {
      var marker = view.getUint16(offset, false);
      offset += 2;

      if (marker == 0xffe1) {
        if (view.getUint32((offset += 2), false) != 0x45786966) {
          return callback(-1);
        }

        var little = view.getUint16((offset += 6), false) == 0x4949;
        offset += view.getUint32(offset + 4, little);
        var tags = view.getUint16(offset, little);
        offset += 2;

        for (var i = 0; i < tags; i++)
          if (view.getUint16(offset + i * 12, little) == 0x0112)
            return callback(view.getUint16(offset + i * 12 + 8, little));
      } else if ((marker & 0xff00) != 0xff00) break;
      else offset += view.getUint16(offset, false);
    }

    return callback(-1);
  };

  reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
}

var i = 0;
var global_new_bill_id = 0;
var global_point_id = 0;
var type_bill = "bill";
var bill_type = 0;
var is_return = false;
const url_bill = "https://apichef.jacochef.ru/api/bill-items/upload";
const url_bill_ex = "https://apichef.jacochef.ru/api/bill-ex-items/upload";
// const API_URL = "http://127.0.0.1:8000/api";
const API_URL = "https://apichef.jacochef.ru/api";
const url_ocr = `${API_URL}/ocr/files/pipeline`;

function isImageFileName(fileName) {
  return /\.(jpe?g|png|gif|bmp|webp|heic|heif)$/i.test(String(fileName ?? ""));
}

function isImageDropzoneFile(file) {
  const fileName = file?.name?.toLowerCase() ?? "";

  return file?.type?.startsWith("image/") || isImageFileName(fileName);
}

function getFileMimeType(fileName = "") {
  const normalized = String(fileName).toLowerCase();

  if (normalized.endsWith(".png")) {
    return "image/png";
  }

  if (normalized.endsWith(".jpg") || normalized.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  if (normalized.endsWith(".gif")) {
    return "image/gif";
  }

  if (normalized.endsWith(".bmp")) {
    return "image/bmp";
  }

  if (normalized.endsWith(".webp")) {
    return "image/webp";
  }

  if (normalized.endsWith(".heic")) {
    return "image/heic";
  }

  if (normalized.endsWith(".heif")) {
    return "image/heif";
  }

  return "application/octet-stream";
}

function normalizeBillingText(value) {
  return String(value ?? "").trim();
}

function normalizeBillingSearchValue(value) {
  return normalizeBillingText(value)
    .toLowerCase()
    .replace(/[\"'`«»]/g, "")
    .replace(/\s+/g, " ");
}

function parseBillingNumericValue(value) {
  const normalized = normalizeBillingText(value).replace(/\s+/g, "").replace(",", ".");

  if (!normalized.length) {
    return null;
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

const BILLING_DECIMAL_SCALE = 2;
const BILLING_PACK_COUNT_SCALE = 3;

function truncateBillingNumericValue(value, fractionDigits = BILLING_PACK_COUNT_SCALE) {
  const numericValue = parseBillingNumericValue(value);

  if (numericValue === null) {
    return null;
  }

  const factor = 10 ** fractionDigits;
  const adjustedValue = numericValue + (numericValue >= 0 ? 1 : -1) * 1e-9;
  const truncatedValue = Math.trunc(adjustedValue * factor) / factor;

  return Number(truncatedValue.toFixed(fractionDigits));
}

function formatBillingNumber(
  value,
  minimumFractionDigits = 0,
  maximumFractionDigits = BILLING_DECIMAL_SCALE,
) {
  const numericValue = parseBillingNumericValue(value);

  if (numericValue === null) {
    return "—";
  }

  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(numericValue);
}

function formatBillingAmount(value) {
  return formatBillingNumber(value, BILLING_DECIMAL_SCALE, BILLING_DECIMAL_SCALE);
}

function formatBillingQuantity(
  value,
  minimumFractionDigits = 0,
  maximumFractionDigits = BILLING_PACK_COUNT_SCALE,
) {
  const numericValue = truncateBillingNumericValue(value, maximumFractionDigits);

  if (numericValue === null) {
    return "—";
  }

  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(numericValue);
}

function formatBillingCurrency(value) {
  const formattedValue = formatBillingAmount(value);
  return formattedValue === "—" ? "—" : `${formattedValue} ₽`;
}

function BillingRubleAdornment() {
  return (
    <Box
      component="span"
      sx={{
        color: "#94a3b8",
        fontWeight: 700,
        fontSize: 14,
        lineHeight: 1,
      }}
    >
      ₽
    </Box>
  );
}

function formatBillingFieldValue(value) {
  const normalizedValue = normalizeBillingText(value);

  if (!normalizedValue.length) {
    return "";
  }

  const numericValue = parseBillingNumericValue(value);

  return numericValue === null
    ? normalizedValue.replace(/\./g, ",")
    : formatBillingAmount(numericValue);
}

function getBillingQuantityText(value, fractionDigits = BILLING_PACK_COUNT_SCALE) {
  const numericValue = truncateBillingNumericValue(value, fractionDigits);

  if (numericValue === null) {
    return "";
  }

  return numericValue.toFixed(fractionDigits).replace(/\.?0+$/, "");
}

function getBillingFactUnitText(countValue, pqValue) {
  const numericCount = parseBillingNumericValue(countValue);
  const numericPq = parseBillingNumericValue(pqValue);

  if (numericCount === null || numericPq === null) {
    return "";
  }

  return getBillingQuantityText(numericCount * numericPq);
}

function formatBillingQuantityFieldValue(value) {
  const normalizedValue = normalizeBillingText(value);

  if (!normalizedValue.length) {
    return "";
  }

  const quantityText = getBillingQuantityText(value);

  return quantityText.length
    ? quantityText.replace(/\./g, ",")
    : normalizedValue.replace(/\./g, ",");
}

function formatBillingValueWithUnit(value, unit = "") {
  const formattedValue = formatBillingNumber(value);

  if (formattedValue === "—") {
    return unit ? `— ${unit}` : "—";
  }

  return unit ? `${formattedValue} ${unit}` : formattedValue;
}

function formatBillingQuantityWithUnit(value, unit = "") {
  const formattedValue = formatBillingQuantity(value);

  if (formattedValue === "—") {
    return unit ? `— ${unit}` : "—";
  }

  return unit ? `${formattedValue} ${unit}` : formattedValue;
}

function parseAccessFlag(value) {
  return parseInt(value, 10) === 1;
}

function getBillingSectionMode(access, key) {
  const editKey = `${key}_edit`;
  const viewKey = `${key}_view`;
  const canEdit = parseAccessFlag(access?.[editKey]);
  const canView = canEdit || parseAccessFlag(access?.[viewKey]);

  return canEdit ? "edit" : canView ? "show" : "hidden";
}

function hasBillingActionAccess(access, key) {
  return parseAccessFlag(access?.[`${key}_access`]);
}

function formatBillingPackOptions(options = []) {
  return (Array.isArray(options) ? options : []).map((option) => {
    const rawValue = option?.name ?? option?.id;
    const numericValue = parseBillingNumericValue(rawValue);

    if (numericValue === null) {
      return option;
    }

    return {
      ...option,
      name: formatBillingQuantity(numericValue),
    };
  });
}

function normalizeBillingDecimalText(value, fractionDigits = BILLING_DECIMAL_SCALE) {
  const rawValue = normalizeBillingText(value).replace(/\s+/g, "");
  const hasTrailingSeparator = /[.,]$/.test(rawValue);
  let normalizedValue = rawValue.replace(/,/g, ".");

  normalizedValue = normalizedValue.replace(/[^\d.]/g, "");

  const [rawIntegerPart = "", ...rest] = normalizedValue.split(".");
  const integerPart = rawIntegerPart.length ? rawIntegerPart : rest.length ? "0" : "";
  const fractionPart = rest.join("").slice(0, fractionDigits);

  if (hasTrailingSeparator && !fractionPart.length) {
    return integerPart.length ? `${integerPart}.` : "";
  }

  return fractionPart.length ? `${integerPart}.${fractionPart}` : integerPart;
}

function getRoundedBillingDecimalText(value, fractionDigits = BILLING_DECIMAL_SCALE) {
  const numericValue = parseBillingNumericValue(value);
  return numericValue === null ? "" : numericValue.toFixed(fractionDigits);
}

function getBillingDecimalEvent(
  event,
  { fixed = false, fractionDigits = BILLING_DECIMAL_SCALE, stripTrailingSeparator = false } = {},
) {
  let nextValue = fixed
    ? getRoundedBillingDecimalText(event?.target?.value, fractionDigits)
    : normalizeBillingDecimalText(event?.target?.value, fractionDigits);

  if (stripTrailingSeparator) {
    nextValue = nextValue.replace(/[.]$/, "");
  }

  if (event?.target) {
    event.target.value = nextValue;
  }

  if (event?.currentTarget) {
    event.currentTarget.value = nextValue;
  }

  return event;
}

function getOcrResponseText(data) {
  if (!data) {
    return "";
  }

  if (typeof data === "string") {
    return data;
  }

  return data?.message || data?.text || data?.result || data?.detail || data?.error || "";
}

function parseOcrAmount(value, fractionDigits = BILLING_DECIMAL_SCALE) {
  const parsed = parseBillingNumericValue(value);

  return Number.isFinite(parsed) ? parsed.toFixed(fractionDigits) : "";
}

function findVendorPackOption(pqItems, value) {
  const normalizedValue = normalizeBillingText(value);

  if (!normalizedValue.length || !Array.isArray(pqItems) || !pqItems.length) {
    return null;
  }

  const parsedValue = parseBillingNumericValue(value);

  return (
    pqItems.find(
      (option) => normalizeBillingText(option?.name ?? option?.id) === normalizedValue,
    ) ??
    pqItems.find((option) => normalizeBillingText(String(option?.id ?? "")) === normalizedValue) ??
    pqItems.find((option) => {
      const optionValue = parseBillingNumericValue(option?.name ?? option?.id);

      return (
        parsedValue !== null && optionValue !== null && Math.abs(optionValue - parsedValue) < 0.0001
      );
    }) ??
    null
  );
}

function getBillItemUnitPrice(item) {
  const factUnit = parseBillingNumericValue(item?.fact_unit);
  const priceWithVat = parseBillingNumericValue(item?.price_w_nds);

  if (factUnit === null || factUnit <= 0 || priceWithVat === null) {
    return 0;
  }

  return priceWithVat / factUnit;
}

function findSuggestedVendorItem(vendorItems, ocrItem) {
  const matchCandidates = Array.isArray(ocrItem?.match_candidates) ? ocrItem.match_candidates : [];
  const matchSuggestions = Array.isArray(ocrItem?.match_suggestions)
    ? ocrItem.match_suggestions
    : [];

  return (
    matchCandidates
      .map((candidate) =>
        vendorItems.find(
          (item) =>
            (candidate?.id &&
              (parseInt(item?.id) === parseInt(candidate.id) ||
                parseInt(item?.item_id) === parseInt(candidate.id))) ||
            normalizeBillingSearchValue(item?.name) ===
              normalizeBillingSearchValue(candidate?.name),
        ),
      )
      .find(Boolean) ??
    matchSuggestions
      .map((suggestion) =>
        vendorItems.find(
          (item) =>
            normalizeBillingSearchValue(item?.name) === normalizeBillingSearchValue(suggestion),
        ),
      )
      .find(Boolean) ??
    null
  );
}

function getResolvedVendorPackOption(vendorItem, ocrItem, selectedPackOption = null) {
  if (!vendorItem) {
    return null;
  }

  if (selectedPackOption) {
    return selectedPackOption;
  }

  const pqItems = Array.isArray(vendorItem?.pq_item) ? vendorItem.pq_item : [];

  if (!pqItems.length) {
    return null;
  }

  const ocrPq = normalizeBillingText(ocrItem?.pq);

  if (ocrPq.length) {
    return findVendorPackOption(pqItems, ocrPq);
  }

  return findVendorPackOption(pqItems, "1") ?? (pqItems.length === 1 ? pqItems[0] : null);
}

function getOcrResolveIssue(ocrItem, vendorItem, selectedPackOption) {
  if (!vendorItem) {
    return "OCR не смог уверенно определить товар";
  }

  if (!normalizeBillingText(ocrItem?.quantity).length) {
    return "OCR не распознал количество товара, проверь строку вручную";
  }

  const ocrPq = normalizeBillingText(ocrItem?.pq);
  const pqItems = Array.isArray(vendorItem?.pq_item) ? vendorItem.pq_item : [];

  if (ocrPq.length && !selectedPackOption) {
    return `OCR распознал упаковку ${ocrPq}, но такого значения нет у товара поставщика`;
  }

  if (!ocrPq.length && pqItems.length > 1 && !selectedPackOption) {
    return "OCR не распознал объем упаковки, выбери его вручную";
  }

  return "";
}

function getOcrQuantityData(ocrItem, pqValue = "") {
  const quantity = parseOcrAmount(ocrItem?.quantity, BILLING_PACK_COUNT_SCALE);
  const resolvedPq = normalizeBillingText(pqValue);
  const pqNumber = parseBillingNumericValue(resolvedPq || ocrItem?.pq);

  if (quantity && pqNumber !== null && pqNumber > 0) {
    return {
      count: quantity,
      pq: resolvedPq || parseOcrAmount(pqNumber, BILLING_PACK_COUNT_SCALE),
      factUnit: getBillingQuantityText(Number(quantity) * pqNumber),
    };
  }

  return {
    count: quantity,
    pq: resolvedPq || "1",
    factUnit: quantity,
  };
}

function parseOcrDate(value) {
  const parsed = dayjs(value);

  return parsed.isValid() ? parsed : null;
}

function formatOcrVatRate(value) {
  const normalized = normalizeBillingText(value);

  if (!normalized.length) {
    return "";
  }

  if (normalized.toLowerCase().includes("без")) {
    return "без НДС";
  }

  const rate = normalized.replace(/\s+/g, "").replace("%", "").replace(",", ".");

  return rate ? `${rate} %` : "";
}

function getParsedOcrDocuments(data) {
  const documents = Array.isArray(data?.merged?.documents) ? data.merged.documents : [];

  return documents
    .map((document, documentIndex) => ({
      ...document,
      documentIndex,
    }))
    .filter((document) => document?.parsed);
}

function getFirstOcrInvoice(parsedDocuments) {
  return (
    parsedDocuments.find((document) => {
      const invoice = document?.parsed?.invoice ?? {};

      return Boolean(normalizeBillingText(invoice?.number) || normalizeBillingText(invoice?.date));
    })?.parsed?.invoice ??
    parsedDocuments[0]?.parsed?.invoice ??
    {}
  );
}

function getMergedOcrItems(parsedDocuments) {
  return parsedDocuments
    .flatMap((document, documentIndex) =>
      (Array.isArray(document?.parsed?.items) ? document.parsed.items : []).map(
        (item, itemIndex) => ({
          ...item,
          __ocr_document_index: documentIndex,
          __ocr_item_index: itemIndex,
          __ocr_file_name: document?.file_name ?? document?.file_names?.[0] ?? "",
        }),
      ),
    )
    .sort((a, b) => {
      const lineA = Number.isFinite(Number(a?.line)) ? Number(a.line) : Number.MAX_SAFE_INTEGER;
      const lineB = Number.isFinite(Number(b?.line)) ? Number(b.line) : Number.MAX_SAFE_INTEGER;

      if (lineA !== lineB) {
        return lineA - lineB;
      }

      if (a.__ocr_document_index !== b.__ocr_document_index) {
        return a.__ocr_document_index - b.__ocr_document_index;
      }

      return a.__ocr_item_index - b.__ocr_item_index;
    });
}

function findMatchedVendorItem(vendorItems, ocrItem) {
  const matchedId = ocrItem?.matched_product?.id ?? ocrItem?.matched_id;
  const matchedName = ocrItem?.matched_product?.name ?? ocrItem?.matched_name;
  const normalizedMatchedName = normalizeBillingSearchValue(matchedName);
  const normalizedItemName = normalizeBillingSearchValue(ocrItem?.name);

  return (
    vendorItems.find(
      (item) =>
        matchedId &&
        (parseInt(item?.id) === parseInt(matchedId) ||
          parseInt(item?.item_id) === parseInt(matchedId)),
    ) ??
    vendorItems.find((item) => normalizeBillingSearchValue(item?.name) === normalizedMatchedName) ??
    vendorItems.find((item) => normalizeBillingSearchValue(item?.name) === normalizedItemName) ??
    null
  );
}

function formatBillingUnitPrice(totalValue, quantityValue) {
  const total = parseBillingNumericValue(totalValue);
  const quantity = parseBillingNumericValue(quantityValue);

  if (total === null || quantity === null || quantity <= 0) {
    return formatBillingAmount(0);
  }

  return formatBillingAmount(total / quantity);
}

function getBillItemPriceCheckMeta(item, vendorItem) {
  const billUnitPrice = getBillItemUnitPrice(item);
  const vendorPrice = Number(vendorItem?.price);
  const vendorPercent = Number(vendorItem?.vend_percent);

  const hasBillUnitPrice = Number.isFinite(billUnitPrice) && billUnitPrice > 0;
  const hasVendorPrice = Number.isFinite(vendorPrice) && vendorPrice > 0;
  const hasVendorPercent = Number.isFinite(vendorPercent);

  let allowedMin = null;
  let allowedMax = null;
  let reason = "";

  if (hasVendorPrice && hasVendorPercent) {
    allowedMin = vendorPrice - (vendorPrice / 100) * vendorPercent;
    allowedMax = vendorPrice + (vendorPrice / 100) * vendorPercent;
  }

  if (!hasBillUnitPrice) {
    reason = "Не удалось рассчитать цену за единицу";
  } else if (!hasVendorPrice) {
    reason = "У товара поставщика не задан эталонный ценник";
  } else if (!hasVendorPercent) {
    reason = "У товара поставщика не задан допустимый процент отклонения";
  } else if (billUnitPrice < allowedMin) {
    reason = "Цена за единицу ниже допустимого диапазона";
  } else if (billUnitPrice > allowedMax) {
    reason = "Цена за единицу выше допустимого диапазона";
  }

  return {
    isError: Boolean(reason),
    reason,
    billUnitPrice: hasBillUnitPrice ? billUnitPrice : null,
    vendorPrice: hasVendorPrice ? vendorPrice : null,
    vendorPercent: hasVendorPercent ? vendorPercent : null,
    allowedMin,
    allowedMax,
  };
}

const billingNumericCellSx = {
  textAlign: "right",
  whiteSpace: "nowrap",
  fontVariantNumeric: "tabular-nums lining-nums",
  fontFeatureSettings: '"tnum" 1, "lnum" 1',
};

const billingNumericHeaderCellSx = {
  ...billingNumericCellSx,
  minWidth: "130px",
};

const billingFormFieldPaddingX = 16;
const billingFormFieldPaddingY = 10;
const billingFormFieldLabelX = 16;
const billingFormFieldLabelShrinkX = 18;
const billingReadonlyFieldValueColor = "#6b7280";
const billingDisabledFieldLabelColor = "#94a3b8";
const billingDisabledFieldBackground = "#f3f4f6";
const billingDisabledFieldBorder = "#e5e7eb";

const billingEditFieldOverridesSx = {
  "& .MuiFormLabel-root.MuiInputLabel-root.Mui-disabled, & .MuiInputLabel-root.Mui-disabled": {
    color: `${billingDisabledFieldLabelColor} !important`,
    opacity: 1,
  },
  "& .MuiInputLabel-root.Mui-disabled.MuiInputLabel-shrink": {
    backgroundColor: `${billingDisabledFieldBackground} !important`,
  },
  "& .MuiTextField-root .MuiOutlinedInput-root.Mui-disabled .MuiInputBase-input, & .MuiAutocomplete-root .MuiOutlinedInput-root.Mui-disabled .MuiInputBase-input, & .MuiSelect-select.Mui-disabled":
    {
      color: `${billingReadonlyFieldValueColor} !important`,
      WebkitTextFillColor: `${billingReadonlyFieldValueColor} !important`,
      opacity: 1,
    },
  "& .MuiTextField-root .MuiOutlinedInput-root.Mui-disabled, & .MuiAutocomplete-root .MuiOutlinedInput-root.Mui-disabled, & .MuiPickersOutlinedInput-root.Mui-disabled":
    {
      backgroundColor: `${billingDisabledFieldBackground} !important`,
      boxShadow: "none !important",
      backgroundImage: "none !important",
    },
  "& .MuiTextField-root .MuiOutlinedInput-root.Mui-disabled fieldset, & .MuiAutocomplete-root .MuiOutlinedInput-root.Mui-disabled fieldset, & .MuiPickersOutlinedInput-root.Mui-disabled fieldset":
    {
      borderColor: `${billingDisabledFieldBorder} !important`,
    },
  "& .MuiAutocomplete-popupIndicator.Mui-disabled .MuiSvgIcon-root, & .MuiAutocomplete-clearIndicator.Mui-disabled .MuiSvgIcon-root, & .MuiSelect-icon.Mui-disabled, & .MuiPickersInputBase-root.Mui-disabled .MuiSvgIcon-root":
    {
      color: "#94a3b8 !important",
      opacity: 1,
    },
  "& .MuiAutocomplete-root .MuiOutlinedInput-root.Mui-disabled .MuiAutocomplete-endAdornment, & .MuiAutocomplete-root .MuiOutlinedInput-root.Mui-disabled .MuiAutocomplete-popupIndicator, & .MuiAutocomplete-root .MuiOutlinedInput-root.Mui-disabled .MuiAutocomplete-clearIndicator":
    {
      backgroundColor: "transparent !important",
      boxShadow: "none !important",
    },
  "& .MuiPickersInputBase-root.Mui-disabled .MuiPickersSectionList-root, & .MuiPickersInputBase-root.Mui-disabled .MuiPickersInputBase-input":
    {
      color: `${billingReadonlyFieldValueColor} !important`,
      WebkitTextFillColor: `${billingReadonlyFieldValueColor} !important`,
      opacity: 1,
    },
  "& .MuiPickersInputBase-root .MuiPickersSectionList-root": {
    minHeight: "24px",
    display: "flex",
    alignItems: "center",
    paddingLeft: `${billingFormFieldPaddingX}px`,
    paddingRight: 0,
  },
  "& .MuiPickersInputBase-root .MuiPickersInputBase-input": {
    paddingLeft: `${billingFormFieldPaddingX}px`,
  },
};

const billingCompactFieldLabelSx = {
  "& .MuiInputLabel-root": {
    top: "50%",
    lineHeight: "24px",
    transform: `translate(${billingFormFieldLabelX}px, -50%) scale(1)`,
  },
  "& .MuiInputLabel-root.MuiInputLabel-shrink": {
    top: 0,
    transform: `translate(${billingFormFieldLabelShrinkX}px, -9px) scale(0.75)`,
  },
};

const billingCompactAutocompleteFieldSx = {
  ...billingCompactFieldLabelSx,
  "& .MuiOutlinedInput-root": {
    minHeight: billingFieldMinHeight,
  },
  "& .MuiAutocomplete-inputRoot.MuiOutlinedInput-root": {
    minHeight: billingFieldMinHeight,
    alignItems: "center",
    paddingTop: `${billingFormFieldPaddingY}px !important`,
    paddingBottom: `${billingFormFieldPaddingY}px !important`,
    paddingLeft: `${billingFormFieldPaddingX}px !important`,
    paddingRight: "44px !important",
  },
  "& .MuiAutocomplete-input": {
    minHeight: "24px !important",
    lineHeight: "24px !important",
    boxSizing: "content-box",
    alignSelf: "center",
    paddingTop: "0 !important",
    paddingBottom: "0 !important",
    paddingLeft: "0 !important",
    paddingRight: "0 !important",
    margin: "0 !important",
  },
};

const billingCompactAutocompleteSx = {
  "&.Mui-expanded .MuiOutlinedInput-root": {
    borderBottomLeftRadius: "0 !important",
    borderBottomRightRadius: "0 !important",
    boxShadow: "0 14px 30px rgba(15, 23, 42, 0.08) !important",
  },
  "& .MuiOutlinedInput-root": {
    overflow: "hidden",
  },
};

const billingCompactAutocompleteSlotProps = {
  popper: {
    sx: {
      marginTop: "-2px !important",
      zIndex: 1500,
    },
  },
  paper: {
    sx: {
      marginTop: 0,
      border: "1px solid rgba(148, 163, 184, 0.18)",
      borderTop: "none",
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomLeftRadius: billingFieldRadius,
      borderBottomRightRadius: billingFieldRadius,
      boxShadow: "0 18px 36px rgba(15, 23, 42, 0.1)",
      overflow: "hidden",
      backgroundColor: "#ffffff",
    },
  },
  listbox: {
    sx: {
      padding: 0,
      maxHeight: 320,
      "& .MuiAutocomplete-option": {
        minHeight: 52,
        padding: "12px 20px",
        lineHeight: "24px",
        borderTop: "1px solid rgba(226, 232, 240, 0.8)",
      },
      "& .MuiAutocomplete-option:first-of-type": {
        borderTop: "none",
      },
    },
  },
};

const billingCompactTextInputSx = {
  ...billingCompactFieldLabelSx,
  "& .MuiOutlinedInput-input": {
    minHeight: "24px",
    lineHeight: "24px",
    boxSizing: "border-box",
    paddingTop: `${billingFormFieldPaddingY}px`,
    paddingBottom: `${billingFormFieldPaddingY}px`,
    paddingLeft: `${billingFormFieldPaddingX}px`,
    paddingRight: `${billingFormFieldPaddingX}px`,
  },
};

const billingFormNumericInputSx = {
  ...billingCompactFieldLabelSx,
  "& .MuiOutlinedInput-input": {
    minHeight: "24px",
    lineHeight: "24px",
    boxSizing: "border-box",
    paddingTop: `${billingFormFieldPaddingY}px`,
    paddingBottom: `${billingFormFieldPaddingY}px`,
    paddingLeft: `${billingFormFieldPaddingX}px`,
    paddingRight: `${billingFormFieldPaddingX}px`,
    textAlign: "right",
    fontVariantNumeric: "tabular-nums lining-nums",
    fontFeatureSettings: '"tnum" 1, "lnum" 1',
  },
  "& .MuiInputAdornment-root": {
    color: "#94a3b8",
    marginRight: "12px",
  },
};

const billingNumericInputSx = {
  "& .MuiInputBase-input": {
    textAlign: "right",
    fontVariantNumeric: "tabular-nums lining-nums",
    fontFeatureSettings: '"tnum" 1, "lnum" 1',
  },
};

const billingDialogActionsSx = {
  display: "flex",
  flexDirection: { xs: "column-reverse", sm: "row" },
  justifyContent: "space-between",
  alignItems: "stretch",
  gap: 1.25,
  px: { xs: 2.5, md: 4 },
  py: { xs: 2, md: 2.5 },
  mt: 2,
  borderTop: "1px solid rgba(148, 163, 184, 0.16)",
  backgroundColor: "rgba(248, 250, 252, 0.88)",
  "& > :not(style)": {
    m: 0,
  },
};

const billingDialogButtonSx = {
  minWidth: { xs: 0, sm: 160 },
  width: { xs: "100%", sm: "auto" },
  height: 48,
  borderRadius: "14px",
  boxShadow: "none",
};

const billingAccountantCommentHighlightSx = {
  display: "grid",
  gap: 1.1,
  width: "100%",
  padding: { xs: "14px 16px", sm: "18px 20px" },
  borderRadius: "16px",
  border: "1px solid rgba(245, 158, 11, 0.34)",
  background:
    "linear-gradient(135deg, rgba(255, 251, 235, 0.98) 0%, rgba(254, 243, 199, 0.82) 100%)",
  boxShadow: "0 12px 26px rgba(245, 158, 11, 0.14)",
};

const billingActionsCardSx = {
  display: "grid",
  gap: 2,
  width: "100%",
};

const billingActionButtonToneMap = {
  delete: {
    color: "#dc2626",
    border: "1px solid rgba(220, 38, 38, 0.28)",
    backgroundColor: "rgba(254, 242, 242, 0.92)",
    boxShadow: "none",
    hover: {
      color: "#b91c1c",
      borderColor: "rgba(220, 38, 38, 0.38)",
      backgroundColor: "rgba(254, 226, 226, 0.98)",
      boxShadow: "none",
    },
  },
  "return-manager": {
    color: "#ffffff",
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    boxShadow: "0 14px 28px rgba(220, 38, 38, 0.22)",
    hover: {
      background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
      boxShadow: "0 18px 34px rgba(185, 28, 28, 0.28)",
    },
  },
  save: {
    color: "#ffffff",
    background: "linear-gradient(135deg, #4caf50 0%, #43a047 100%)",
    boxShadow: "0 14px 28px rgba(67, 160, 71, 0.22)",
    hover: {
      background: "linear-gradient(135deg, #43a047 0%, #388e3c 100%)",
      boxShadow: "0 18px 34px rgba(56, 142, 60, 0.28)",
    },
  },
  "send-1c": {
    color: "#ffffff",
    background: "linear-gradient(135deg, #1faee9 0%, #1296d3 100%)",
    boxShadow: "0 14px 28px rgba(31, 174, 233, 0.24)",
    hover: {
      background: "linear-gradient(135deg, #1296d3 0%, #0c7fb6 100%)",
      boxShadow: "0 18px 34px rgba(18, 150, 211, 0.28)",
    },
  },
  pay: {
    color: "#ffffff",
    background: "linear-gradient(135deg, #4caf50 0%, #43a047 100%)",
    boxShadow: "0 14px 28px rgba(67, 160, 71, 0.22)",
    hover: {
      background: "linear-gradient(135deg, #43a047 0%, #388e3c 100%)",
      boxShadow: "0 18px 34px rgba(56, 142, 60, 0.28)",
    },
  },
  "confirm-prices": {
    color: "#1f2937",
    background: "linear-gradient(135deg, #facc15 0%, #f59e0b 100%)",
    boxShadow: "0 14px 28px rgba(245, 158, 11, 0.22)",
    hover: {
      background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
      boxShadow: "0 18px 34px rgba(234, 88, 12, 0.26)",
    },
  },
  "save-send": {
    color: "#ffffff",
    background: "linear-gradient(135deg, #f5770a 0%, #ea580c 100%)",
    boxShadow: "0 14px 28px rgba(245, 119, 10, 0.24)",
    hover: {
      background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
      boxShadow: "0 18px 34px rgba(194, 65, 12, 0.28)",
    },
  },
};

function getBillingActionButtonSx(actionKey) {
  const tone = billingActionButtonToneMap[actionKey] ?? billingActionButtonToneMap.save;

  return {
    minHeight: 52,
    borderRadius: "16px",
    fontWeight: 800,
    letterSpacing: "0.01em",
    boxShadow: tone.boxShadow ?? "none",
    border: tone.border ?? "1px solid transparent",
    color: tone.color,
    background: tone.background,
    backgroundColor: tone.backgroundColor,
    "&:hover": {
      color: tone.hover?.color ?? tone.color,
      background: tone.hover?.background ?? tone.background,
      backgroundColor: tone.hover?.backgroundColor ?? tone.backgroundColor,
      borderColor: tone.hover?.borderColor ?? tone.border,
      boxShadow: tone.hover?.boxShadow ?? tone.boxShadow ?? "none",
    },
  };
}

const billingDropzoneAddActionSx = {
  width: "100%",
  maxWidth: 360,
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  px: 2,
  py: 1.75,
  borderRadius: "18px",
  border: "1.5px dashed rgba(2, 132, 199, 0.28)",
  background:
    "linear-gradient(180deg, rgba(240, 249, 255, 0.96) 0%, rgba(224, 242, 254, 0.88) 100%)",
  boxShadow: "0 16px 34px rgba(14, 165, 233, 0.10)",
  color: "#0f172a",
  cursor: "pointer",
  transition: "transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    borderColor: "rgba(2, 132, 199, 0.42)",
    boxShadow: "0 20px 38px rgba(14, 165, 233, 0.16)",
  },
};

const billingDropzoneDefaultMessage = `
  <div class="billing-dropzone-message">
    <span class="billing-dropzone-badge">До 10 файлов</span>
    <div class="billing-dropzone-title">Перетащи сюда фото или PDF</div>
    <div class="billing-dropzone-subtitle">
      Можно загрузить несколько страниц сразу. Поддерживаются JPG, PNG, GIF и PDF.
    </div>
  </div>
`;

const billingDropzoneSx = {
  "&.dropzone": {
    width: "100%",
    minHeight: 220,
    padding: "18px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
    alignItems: "stretch",
    borderRadius: "24px",
    border: "1.5px dashed rgba(159, 18, 57, 0.24)",
    background: "linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(250,247,243,0.96) 100%)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.86)",
  },
  "&.dropzone .dz-message": {
    gridColumn: "1 / -1",
    width: "100%",
    minHeight: 180,
    margin: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    cursor: "pointer",
  },
  "&.dropzone .billing-dropzone-message": {
    maxWidth: 460,
    display: "grid",
    gap: "10px",
    justifyItems: "center",
  },
  "&.dropzone .billing-dropzone-badge": {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 12px",
    borderRadius: "999px",
    backgroundColor: "rgba(159, 18, 57, 0.08)",
    color: "#9f1239",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  "&.dropzone .billing-dropzone-title": {
    color: "#0f172a",
    fontSize: "22px",
    fontWeight: 700,
    lineHeight: 1.2,
  },
  "&.dropzone .billing-dropzone-subtitle": {
    color: "#64748b",
    fontSize: "15px",
    lineHeight: 1.55,
  },
  "&.dropzone .dz-preview": {
    position: "relative",
    margin: 0,
    width: "100%",
    minWidth: 0,
    minHeight: "auto",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 16px 34px rgba(15, 23, 42, 0.08)",
  },
  "&.dropzone .dz-preview .dz-image": {
    order: 1,
    width: "100%",
    height: 176,
    borderRadius: 0,
    padding: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, rgba(241, 245, 249, 1) 0%, rgba(226, 232, 240, 0.92) 100%)",
  },
  "&.dropzone .dz-preview .dz-image img": {
    width: "auto",
    height: "auto",
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
    borderRadius: "12px",
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.08)",
  },
  "&.dropzone .dz-preview.dz-file-preview .dz-image": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    padding: "24px",
    background:
      "linear-gradient(135deg, rgba(241, 245, 249, 1) 0%, rgba(226, 232, 240, 0.92) 100%)",
  },
  "&.dropzone .dz-preview.dz-file-preview .dz-image img": {
    display: "none",
  },
  "&.dropzone .dz-preview.dz-file-preview .dz-image::before": {
    content: '\"\"',
    width: "72px",
    height: "88px",
    display: "block",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "contain",
    filter: "drop-shadow(0 8px 20px rgba(185, 28, 28, 0.22))",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 72 88' fill='none'%3E%3Cpath d='M18 4h24.5L60 21.5V76a8 8 0 0 1-8 8H18a8 8 0 0 1-8-8V12a8 8 0 0 1 8-8Z' fill='%23fff'/%3E%3Cpath d='M42.5 4V18a6 6 0 0 0 6 6H60' fill='%23FECACA'/%3E%3Cpath d='M42.5 4V18a6 6 0 0 0 6 6H60M18 4h24.5L60 21.5V76a8 8 0 0 1-8 8H18a8 8 0 0 1-8-8V12a8 8 0 0 1 8-8Z' stroke='%23DC2626' stroke-width='4' stroke-linejoin='round'/%3E%3Crect x='18' y='44' width='34' height='18' rx='9' fill='%23DC2626'/%3E%3Cpath d='M25 56V49.6h3.1c1.5 0 2.4.8 2.4 2.1 0 1.4-.9 2.1-2.4 2.1h-1.4V56H25Zm1.7-3.5H28c.6 0 1-.3 1-.8s-.4-.8-1-.8h-1.3v1.6ZM32.3 56v-6.4h2.4c2 0 3.3 1.2 3.3 3.2S36.7 56 34.7 56h-2.4Zm1.7-1.5h.7c1 0 1.7-.6 1.7-1.7s-.7-1.7-1.7-1.7H34v3.4ZM39.7 56v-6.4h4.4V51h-2.7v1.2h2.4v1.4h-2.4V56h-1.7Z' fill='%23fff'/%3E%3C/svg%3E")`,
  },
  "&.dropzone .dz-preview.dz-file-preview .dz-image::after": {
    content: '"PDF"',
    position: "absolute",
    left: "50%",
    bottom: 20,
    transform: "translateX(-50%)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "7px 12px",
    borderRadius: "999px",
    backgroundColor: "rgba(255,255,255,0.94)",
    color: "#b91c1c",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.08em",
  },
  "&.dropzone .dz-preview .dz-details": {
    order: 2,
    position: "static",
    opacity: 1,
    minWidth: "100%",
    maxWidth: "100%",
    padding: "14px 16px 8px",
    textAlign: "left",
    lineHeight: 1.45,
    color: "#0f172a",
  },
  "&.dropzone .dz-preview .dz-details .dz-filename, &.dropzone .dz-preview .dz-details .dz-size": {
    display: "block",
    marginBottom: "6px",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  "&.dropzone .dz-preview .dz-details .dz-filename span, &.dropzone .dz-preview .dz-details .dz-size span":
    {
      backgroundColor: "transparent",
      padding: 0,
      border: "none",
      borderRadius: 0,
    },
  "&.dropzone .dz-preview .dz-details .dz-filename span": {
    fontSize: "15px",
    fontWeight: 700,
  },
  "&.dropzone .dz-preview .dz-details .dz-size span": {
    fontSize: "13px",
    color: "#64748b",
  },
  "&.dropzone .dz-preview .dz-remove": {
    order: 5,
    margin: "0 16px 16px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
    width: "calc(100% - 32px)",
    padding: "8px 12px",
    borderRadius: "999px",
    border: "1px solid rgba(159, 18, 57, 0.12)",
    backgroundColor: "rgba(255,255,255,0.92)",
    color: "#9f1239",
    fontSize: "13px",
    fontWeight: 700,
    lineHeight: 1,
    whiteSpace: "nowrap",
    textDecoration: "none",
  },
  "&.dropzone .dz-preview .dz-remove:hover": {
    textDecoration: "none",
    backgroundColor: "rgba(159, 18, 57, 0.08)",
    borderColor: "rgba(159, 18, 57, 0.18)",
  },
  "&.dropzone .dz-preview .dz-progress": {
    order: 3,
    position: "static",
    height: 6,
    margin: "0 16px 16px",
    border: "none",
    borderRadius: "999px",
    backgroundColor: "rgba(226, 232, 240, 0.92)",
    overflow: "hidden",
  },
  "&.dropzone .dz-preview .dz-progress .dz-upload": {
    borderRadius: "999px",
    background: "linear-gradient(90deg, #9f1239 0%, #e11d48 100%)",
  },
  "&.dropzone .dz-preview .dz-success-mark, &.dropzone .dz-preview .dz-error-mark": {
    top: 14,
    right: 14,
    left: "auto",
    marginLeft: 0,
    marginTop: 0,
    transform: "none",
  },
  "&.dropzone .dz-preview .dz-error-message": {
    order: 4,
    position: "static",
    left: "auto",
    right: "auto",
    top: "auto",
    bottom: "auto",
    width: "auto",
    margin: "0 16px 12px",
    borderRadius: "14px",
    backgroundColor: "#b91c1c",
    opacity: 1,
    transform: "none",
    pointerEvents: "none",
    textAlign: "left",
  },
  "&.dropzone .dz-preview .dz-error-message::after": {
    display: "none",
  },
};

function BillPriceWarningBanner({ count }) {
  if (!count) {
    return null;
  }

  return (
    <Box
      sx={{
        mb: 2,
        px: 2,
        py: 1.5,
        borderRadius: "18px",
        border: "1px solid rgba(245, 158, 11, 0.28)",
        background:
          "linear-gradient(180deg, rgba(255, 251, 235, 0.96) 0%, rgba(254, 243, 199, 0.78) 100%)",
      }}
    >
      <Typography
        sx={{
          color: "#92400e",
          fontSize: 14,
          fontWeight: 800,
          lineHeight: 1.35,
        }}
      >
        Проверь ценник в проблемных строках
      </Typography>
      <Typography
        sx={{
          mt: 0.5,
          color: "#a16207",
          fontSize: 13,
          lineHeight: 1.5,
        }}
      >
        Найдено позиций с отклонением: {formatBillingNumber(count, 0, 0)}. Такие строки отмечены
        плашкой "Проверить ценник".
      </Typography>
    </Box>
  );
}

function BillItemNameContent({ item, showPriceWarnings = true }) {
  return (
    <Box>
      <div className="cell_as">
        {item?.name ?? item?.item_name}
        {item?.accounting_system?.map((as) => (
          <div
            key={as.id}
            className="box_as"
          >
            {as.name}
          </div>
        ))}
      </div>
      {!showPriceWarnings || !item?.price_check?.isError ? null : (
        <Box sx={{ mt: 0.5, maxWidth: 340 }}>
          <Box sx={billingPriceWarningChipSx}>Проверить ценник</Box>
          <Typography
            variant="body2"
            sx={{
              mt: 0.75,
              color: "#92400e",
              fontSize: 13,
              lineHeight: 1.45,
            }}
          >
            {item?.price_check?.reason}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

var dropzoneOptions_bill = {
  autoProcessQueue: false,
  autoQueue: true,
  maxFiles: 10,
  timeout: 0,
  parallelUploads: 10,
  acceptedFiles: "image/jpeg,image/png,image/gif,.pdf",
  addRemoveLinks: true,
  dictDefaultMessage: billingDropzoneDefaultMessage,
  dictRemoveFile: "Удалить",
  dictMaxFilesExceeded: "Нельзя загрузить больше 10 файлов",

  url: url_bill,

  init: function () {
    var myDropzone = this;

    this.on("queuecomplete", function (data) {
      var check_img = false;

      myDropzone["files"].map(function (item, key) {
        if (item["status"] == "error") {
          check_img = true;
        }
      });

      if (check_img) {
        return;
      }

      //console.log( 'queuecomplete' )
      //$('#modal_message').addClass('modal_true');
      //show_modal_message('Результат операции', 'Накладная успешно сохранена');
      //window.location.pathname = '/billing';

      if (is_return == true) {
        window.location = "/billing";
      }
    });

    this.on("sending", function (file, xhr, data) {
      //var point = document.getElementById('point_id').value;

      i++;
      var file_type = file.name.split(".");
      file_type = file_type[file_type.length - 1];
      file_type = file_type.toLowerCase();

      if (type_bill == "bill") {
        data.append(
          "filetype",
          "bill_file_" +
            i +
            "_point_id_" +
            global_point_id +
            "_bill_id_" +
            global_new_bill_id +
            "." +
            file_type,
        );
        data.append("type_bill", "bill");
      } else {
        data.append(
          "filetype",
          "bill_ex_file_" +
            i +
            "_point_id_" +
            global_point_id +
            "_bill_id_" +
            global_new_bill_id +
            "." +
            file_type,
        );
      }

      //'bill_file_0_point_id_1_bill_id_9114.png'

      if (file_type != "pdf") {
        getOrientation(file, function (orientation) {
          data.append("orientation", orientation);
        });
      }
    });
  },
};

var dropzoneOptions_bill_factur = {
  autoProcessQueue: false,
  autoQueue: true,
  maxFiles: 10,
  timeout: 0,
  parallelUploads: 10,
  acceptedFiles: "image/jpeg,image/png,image/gif,.pdf",
  addRemoveLinks: true,
  dictDefaultMessage: billingDropzoneDefaultMessage,
  dictRemoveFile: "Удалить",
  dictMaxFilesExceeded: "Нельзя загрузить больше 10 файлов",

  url: url_bill,

  init: function () {
    var myDropzone = this;

    this.on("queuecomplete", function (data) {
      var check_img = false;

      myDropzone["files"].map(function (item, key) {
        if (item["status"] == "error") {
          check_img = true;
        }
      });

      if (check_img) {
        return;
      }

      //console.log( 'queuecomplete' )
      //$('#modal_message').addClass('modal_true');
      //show_modal_message('Результат операции', 'Накладная успешно сохранена');
      //window.location.pathname = '/billing';

      if (is_return == true) {
        window.location.pathname = "/billing";
      }
    });

    this.on("sending", function (file, xhr, data) {
      //var point = document.getElementById('point_id').value;

      i++;
      var file_type = file.name.split(".");
      file_type = file_type[file_type.length - 1];
      file_type = file_type.toLowerCase();

      if (type_bill == "bill") {
        data.append(
          "filetype",
          "bill_file_" +
            i +
            "_point_id_" +
            global_point_id +
            "_bill_id_" +
            global_new_bill_id +
            "." +
            file_type,
        );
        data.append("type_bill", "factur");
      } else {
        data.append(
          "filetype",
          "bill_ex_file_" +
            i +
            "_point_id_" +
            global_point_id +
            "_bill_id_" +
            global_new_bill_id +
            "." +
            file_type,
        );
      }

      //'bill_file_0_point_id_1_bill_id_9114.png'

      if (file_type != "pdf") {
        getOrientation(file, function (orientation) {
          data.append("orientation", orientation);
        });
      }
    });
  },
};

const useStore = create((set, get) => ({
  isPink: false,
  setPink: () => set((state) => ({ isPink: !state.isPink })),

  acces: [],

  vendor_items: [],
  search_item: "",
  vendor_itemsCopy: [],

  all_ed_izmer: [],

  pq: "",
  count: "",
  fact_unit: "",
  summ: "",
  sum_w_nds: "",

  err_items: [],

  allPrice: 0,
  allPrice_w_nds: 0,

  bill_items_doc: [],
  bill_items: [],

  openAlert: false,
  err_status: true,
  err_text: "",

  points: [],
  point: "",
  point_name: "",

  search_vendor: "",

  docs: [],
  doc: "",

  vendors: [],
  vendorsCopy: [],

  types: types,
  type: "",

  fullScreen: false,

  kinds: [],
  doc_base_id: "",

  number: "",
  number_factur: "",

  date: null,
  date_factur: null,
  date_items: null,

  is_load_store: false,
  module: "billing",

  imgs_bill: [],
  modalDialog: false,
  image: "",
  imgs_factur: [],

  vendor_name: "",

  bill_list: [],
  bill: null,

  is_new_doc: 0,

  users: [],
  user: [],

  comment: "",

  is_horizontal: false,
  is_vertical: false,

  DropzoneMain: null,
  DropzoneDop: null,

  openImgType: "",

  bill_base_id: 0,

  dragIndex: null,

  bill_items_initinal: [],
  bill_initinal: null,

  handleDrag: (event) => {
    set({
      dragIndex: event.currentTarget.id,
    });
  },

  handleDrop: (event) => {
    let bill_items = get().bill_items;

    const drop = bill_items[event.currentTarget.id];
    const drag = bill_items[get().dragIndex];

    bill_items[event.currentTarget.id] = drag;
    bill_items[get().dragIndex] = drop;

    set({
      bill_items,
    });
  },

  set_position: (is_horizontal, is_vertical) => {
    set({
      is_horizontal: is_horizontal,
      is_vertical: is_vertical,
    });
  },

  setImgList: (imgs_bill, imgs_factur) => {
    set({
      imgs_bill: imgs_bill,
      imgs_factur: imgs_factur,
    });
  },

  setPoints: (points) => {
    set({
      points,
    });
  },

  setAcces: (acces) => {
    set({
      acces,
    });
  },

  getData: (method, data = {}) => {
    set({
      is_load_store: true,
    });

    let res = api_laravel(get().module, method, data)
      .then((result) => result.data)
      .finally(() => {
        setTimeout(() => {
          set({
            is_load_store: false,
          });
        }, 500);
      });

    return res;
  },

  changeAutocomplite: (type, data) => {
    set({
      [type]: data,
    });
  },

  changeItemChecked: (event, data) => {
    const value = event.target.checked === true ? 1 : 0;

    set({
      [data]: value,
    });
  },

  getDataBill: (res, point, items, docs) => {
    set({
      is_load_store: true,
    });

    const bill_items_initinal = res.bill_items.reduce((newItems, item) => {
      let it = {};

      it.pq = item.pq;
      it.count = item.count;
      it.item_id = item.item_id ?? item.id;
      it.summ = item.price;
      it.summ_w_nds = item.price_w_nds;

      newItems.push(it);

      return newItems;
    }, []);

    const bill_initinal = {
      date_create: parseInt(res?.bill?.type_bill) == 1 ? res?.bill.date : res?.bill.date_create,
      number: res?.bill.number,
    };

    if (parseInt(res?.bill?.type_bill) !== 1) {
      bill_initinal.date_factur = res?.bill.date_factur;
      bill_initinal.number_factur = res?.bill.number_factur;
    }

    const bill_items = res.bill_items.map((item) => {
      item.all_ed_izmer = item.pq_item.map((it) => {
        it = { name: `${it.name}`, id: it.id };
        return it;
      });

      item.fact_unit = getBillingQuantityText(item.fact_unit);
      item.price_item = item.price;
      item.price = getBillItemUnitPrice(item);
      item.one_price_bill = item.price;

      const nds = get().check_nds_bill(
        Number(item.price_item) == 0
          ? 0
          : (Number(item.price_w_nds) - Number(item.price_item)) / (Number(item.price_item) / 100),
      );

      if (nds) {
        item.nds = nds;
        item.summ_nds = (Number(item.price_w_nds) - Number(item.price_item)).toFixed(2);
      } else {
        item.summ_nds = (0).toFixed(2);
        item.nds = "";
      }

      console.log("item", item);

      return item;
    });

    const allPrice = bill_items.reduce((all, item) => all + Number(item.price_item), 0).toFixed(2);
    const allPrice_w_nds = bill_items
      .reduce((all, item) => all + Number(item.price_w_nds), 0)
      .toFixed(2);

    set({
      vendor_items: items,
      vendor_itemsCopy: items,
      docs: docs.billings,
      doc: docs.billings.find((item) => parseInt(item.id) == parseInt(res?.bill.base_id))?.name,
      point: point ?? [],
      point_name: point?.name ?? "",
      vendors: res?.vendors ?? [],
      vendorsCopy: res?.vendors ?? [],
      vendor_name: res?.vendors[0]?.name ?? "",
      search_vendor: res?.vendors[0]?.name ?? "",
      is_new_doc: parseInt(res?.bill?.doc_true),
      bill_list: res?.bill_hist,
      imgs_bill: res?.bill_imgs ?? [],
      imgs_factur: res?.factur_imgs ?? [],
      allPrice,
      allPrice_w_nds,
      bill: res?.bill,
      bill_items,
      number: res.bill?.number,
      date: res.bill?.date && res.bill?.date !== "0000-00-00" ? dayjs(res.bill?.date) : null,
      date_items: res.bill?.date_items ? dayjs(res.bill?.date_items) : null,
      comment: res.bill?.comment,
      comment_bux: res.bill?.com_bux,
      delete_text: res.bill?.del_text,
      users: res?.users,
      user: res?.bill_users,
      types: types,
      //type: parseInt(res?.bill?.type_bill) == 1 ? 2 : 4,
      type: res?.bill?.type_bill,
      //doc_base_id: parseInt(res?.bill?.type_doc ?? 0) === 0 ? '' : parseInt(res?.bill?.type_doc),
      doc_base_id: res?.bill?.doc_base_id,
      is_load_store: false,

      number_factur: res.bill?.number_factur,
      date_factur:
        res.bill?.date_factur && res.bill?.date_factur !== "0000-00-00"
          ? dayjs(res.bill?.date_factur)
          : null,

      bill_base_id: res?.bill.base_id,

      bill_items_initinal,
      bill_initinal,
    });

    let base_doc_name = docs.billings.find((item) => item.number == res?.bill.number_base)?.name;

    if (parseInt(res?.bill?.doc_base_id) > 0) {
      get().search_doc({ targer: { value: base_doc_name } }, base_doc_name);
    }

    console.log("set bill_items", bill_items);

    set({
      bill_items,
    });

    setTimeout(() => {
      if (document.getElementById("img_bill")) {
        set({
          DropzoneMain: new Dropzone("#img_bill", dropzoneOptions_bill),
        });
      }

      if (parseInt(res?.bill?.type_bill) == 2) {
        if (document.getElementById("img_bill_type")) {
          set({
            DropzoneDop: new Dropzone("#img_bill_type", dropzoneOptions_bill_factur),
          });
        }
      }

      get().checkPriceItems();
      get().check_price_item_new();
    }, 500);

    get().changeKinds(res?.bill?.type_doc);
  },

  clearForm: () => {
    set({
      bill_items: [],
      search_item: "",
      vendor_items: [],
      vendor_itemsCopy: [],
      users: [],
      all_ed_izmer: [],
      pq: "",
      count: "",
      fact_unit: "",
      summ: "",
      sum_w_nds: "",
      bill_items_doc: [],
      docs: [],
      doc: "",
      points: [],
      point: "",
      point_name: "",
      vendors: [],
      vendor_name: "",
      bill_list: [],
      imgs_bill: [],
      allPrice: 0,
      allPrice_w_nds: 0,
      number: "",
      date: null,
      date_items: null,
      comment: "",
      user: [],
      type: "",
      doc_base_id: "",
      number_factur: "",
      date_factur: null,
      is_new_doc: 0,
    });
  },

  closeDialog: () => {
    document.body.style.overflow = "";
    set({
      modalDialog: false,
      is_horizontal: false,
      is_vertical: false,
      // openImgType: "",
    });
  },

  openImageBill: (image, type) => {
    get().handleResize();
    scrollToBillingCompareForm();

    console.log("type_type", type);

    set({
      modalDialog: true,
      image,
      openImgType: type,
    });
  },

  setOpenedImage: (image, type) => {
    set({
      image,
      openImgType: type,
    });
  },

  handleResize: () => {
    if (window.innerWidth < 601) {
      set({
        fullScreen: true,
      });
    } else {
      set({
        fullScreen: false,
      });
    }
  },

  changeDateRange(event, data) {
    set({
      [data]: event,
    });
  },

  changeInput(event, type) {
    set({
      [type]: event.target.value,
    });
  },

  search_doc: async (event, name) => {
    const search = event?.target?.value ? event?.target?.value : name ? name : "";

    if (search) {
      const docs = get().docs;
      const vendor_id = get().vendors[0]?.id;
      const point = get().point;
      const bill_items = get().bill_items;

      const billing_id = docs.find((doc) => doc.name === search)?.id;

      const obj = {
        billing_id,
        vendor_id,
        point_id: point.id,
      };

      const res = await get().getData("get_base_doc_data", obj);

      set({
        bill_items: [],
        //bill_items_doc: [],
        search_item: "",
        //vendor_items: res.items,
        //vendor_itemsCopy: res.items,
        users: res.users,
        all_ed_izmer: [],
        pq: "",
        count: "",
        fact_unit: "",
        summ: "",
        sum_w_nds: "",
        bill_items_doc: res.billing_items,
      });

      console.log("res.billing_items", res.billing_items);
      console.log("res.items", res.items);
      console.log("bill_items", bill_items);

      let check_this_bill = false;

      res.billing_items.map((item) => {
        let test = res.items.filter((v) => parseInt(v.id) === parseInt(item.item_id));

        let this_bill = bill_items.find(
          (b) =>
            parseInt(b.item_id) === parseInt(item.item_id) &&
            parseFloat(b.price_w_nds) == parseFloat(item.price_w_nds),
        );

        if (this_bill) {
          check_this_bill = true;
        } else {
          let this_bill_test = bill_items.find(
            (b) => parseInt(b.item_id) === parseInt(item.item_id),
          );

          if (this_bill_test) {
            check_this_bill = true;
          }
        }
      });

      const normalizePrice = (v) => Number(parseFloat(v).toFixed(2));

      const notFoundBillingItems = res.billing_items.filter(
        (item) =>
          !bill_items.some(
            (bill) =>
              Number(bill.item_id) === Number(item.item_id) &&
              normalizePrice(bill.price_w_nds) === normalizePrice(item.price_w_nds),
          ),
      );

      console.log("notFoundBillingItems", notFoundBillingItems);

      res.billing_items.forEach((item) => {
        const found = bill_items.some(
          (bill) =>
            Number(bill.item_id) === Number(item.item_id) &&
            normalizePrice(bill.price_w_nds) === normalizePrice(item.price_w_nds),
        );

        console.log(item, found ? "FOUND" : "NOT FOUND");
      });

      res.billing_items.map((item) => {
        let test = res.items.filter((v) => parseInt(v.id) === parseInt(item.item_id));

        let this_bill = bill_items.find(
          (b) =>
            parseInt(b.item_id) === parseInt(item.item_id) &&
            parseFloat(b.price_w_nds) == parseFloat(item.price_w_nds),
        );

        if (!this_bill) {
          this_bill = bill_items.find((b) => parseInt(b.item_id) === parseInt(item.item_id));
        }

        console.log("test123", check_this_bill, this_bill, item);

        if (check_this_bill) {
          if (this_bill) {
            get().addItem_fast(
              this_bill.count,
              this_bill.fact_unit,
              this_bill.price_item ?? this_bill.price,
              this_bill.price_w_nds,
              this_bill.ed_izmer_name,
              this_bill.pq,
              this_bill.item_id,
              test,
              1,
              this_bill.accounting_system,
            );
          } else {
            get().addItem_fast(
              0,
              0,
              0,
              item.price_w_nds,
              notFoundBillingItems[0].ed_izmer_name,
              notFoundBillingItems[0].pq,
              notFoundBillingItems[0].item_id,
              test,
              1,
              this_bill.accounting_system,
            );
          }
        } else {
          get().addItem_fast(
            item.count,
            item.count * item.pq,
            item.price,
            item.price_w_nds,
            item.ed_izmer_name,
            item.pq,
            item.item_id,
            test,
            0,
            this_bill.accounting_system,
          );
        }
      });

      set({
        doc: search,
      });
    } else {
      const point = get().point;
      const vendors = get().vendors;
      const docs = get().docs;

      if (point && vendors.length === 1 && docs.length) {
        const data = {
          point_id: point.id,
          vendor_id: vendors[0]?.id,
        };

        const res = await get().getData("get_vendor_items", data);

        set({
          //bill_items: [],
          //bill_items_doc: [],
          //vendor_items: res.items,
          //vendor_itemsCopy: res.items,
          users: res.users,
          search_item: "",
          all_ed_izmer: [],
          pq: "",
          count: "",
          fact_unit: "",
          summ: "",
          sum_w_nds: "",
        });
      }
    }
  },

  search_vendors: async (event, name) => {
    const search = event.target.value ? event.target.value : name ? name : "";

    const vendorsCopy = get().vendorsCopy;

    const vendors = vendorsCopy.filter((value) =>
      search ? value.name.toLowerCase() === search.toLowerCase() : value,
    );

    const vendor = get().vendors.find((value) => value.name == search);

    if (search && vendors.length) {
      const point = get().point;

      const data = {
        point_id: point.id,
        vendor_id: vendors[0].id,
      };

      const res = await get().getData("get_vendor_items", data);
      const docs = await get().getData("get_base_doc", data);

      set({
        vendor_items: res.items,
        vendor_itemsCopy: res.items,
        users: res.users,
        docs: docs.billings,
        doc: "",
        vendor: vendor,
      });
    } else {
      set({
        bill_items: [],
        bill_items_doc: [],
        search_item: "",
        vendor_items: [],
        vendor_itemsCopy: [],
        all_ed_izmer: [],
        pq: "",
        count: "",
        fact_unit: "",
        summ: "",
        sum_w_nds: "",
        docs: [],
        doc: "",
      });
    }

    set({
      search_vendor: search,
      //vendors,
    });
  },

  search_point: async (event, name) => {
    const search = event.target.value ? event.target.value : name ? name : "";

    const type = get().type;
    const points = get().points;
    const point = points.find((item) => item.name === search);

    set({
      bill_items: [],
      bill_items_doc: [],
      point: point ?? "",
      point_name: point?.name ?? "",
      search_vendor: "",
      search_item: "",
      vendor_items: [],
      vendor_itemsCopy: [],
      all_ed_izmer: [],
      pq: "",
      count: "",
      fact_unit: "",
      summ: "",
      sum_w_nds: "",
      users: [],
      docs: [],
      doc: "",
    });

    if (point && type) {
      const obj = {
        point_id: point.id,
        type,
      };

      const res = await get().getData("get_vendors", obj);

      set({
        vendors: res.vendors,
        vendorsCopy: res.vendors,
      });
    } else {
      set({
        vendors: [],
        vendorsCopy: [],
      });
    }
  },

  setData: (...props) => {
    set(...props);
  },

  search_vendor_items: (event, name) => {
    const search = event.target.value ? event.target.value : name ? name : "";

    const vendor_itemsCopy = JSON.parse(JSON.stringify(get().vendor_itemsCopy));

    let vendor_items = [];

    if (vendor_itemsCopy.length) {
      vendor_items = vendor_itemsCopy.filter((value) =>
        search ? value.name.toLowerCase() === search.toLowerCase() : value,
      );

      vendor_items.map((item) => {
        item.pq_item = item.pq_item.map((it) => {
          it = { name: `${it.name}`, id: it.id };
          return it;
        });
        return item;
      });

      set({
        vendor_items,
        all_ed_izmer: vendor_items.length ? vendor_items[0].pq_item : [],
        //pq: vendor_items.length ? vendor_items[0].pq_item[0].id : '',
        pq: "",
        count: "",
        fact_unit: "",
        summ: "",
        sum_w_nds: "",
      });
    }

    set({
      search_item: search,
    });
  },

  changeCount: (event) => {
    const count = event.target.value;
    const fact_unit = getBillingFactUnitText(count, get().pq);

    set({
      count,
      fact_unit,
    });
  },

  reCount: () => {
    const count = get().count;
    const fact_unit = getBillingFactUnitText(count, get().pq);

    set({
      fact_unit,
    });
  },

  changeData: async (data, event) => {
    get().handleResize();

    const value = event.target.value;
    const point = get().point;

    if (data === "type" && point) {
      // const vendors = get().vendors;

      // if(point) {

      const obj = {
        point_id: point.id,
        type: value,
      };

      const res = await get().getData("get_vendors", obj);

      // const data = {
      //   point_id: point.id,
      //   vendor_id: vendors[0]?.id
      // }

      // const res = await get().getData('get_vendor_items', data);

      set({
        vendors: res.vendors,
        vendorsCopy: res.vendors,
      });
      // }
    }

    if (data === "type" && (parseInt(value) === 3 || parseInt(value) === 2)) {
      get().changeKinds(value);
    }

    if (data === "type") {
      if (parseInt(value) === 2) {
        setTimeout(() => {
          set({
            DropzoneDop: new Dropzone("#img_bill_type", dropzoneOptions_bill_factur),
          });
        }, 1000);
      } else {
        set({
          DropzoneDop: null,
        });
      }
    }

    set({
      [data]: value,
    });

    get().reCount();
  },

  changeKinds: (value) => {
    let kinds = [];

    if (parseInt(value) === 2) {
      kinds = [
        {
          name: "Накладная",
          id: "1",
        },
        {
          name: "УПД",
          id: "2",
        },
      ];
    } else {
      kinds = [
        {
          name: "УКД",
          id: "3",
        },
      ];
    }

    set({
      kinds,
    });
  },

  reducePrice: () => {
    const bill_items = get().bill_items;

    const allPrice = bill_items.reduce((all, item) => all + Number(item.price_item), 0).toFixed(2);
    const allPrice_w_nds = bill_items
      .reduce((all, item) => all + Number(item.price_w_nds), 0)
      .toFixed(2);

    set({
      allPrice,
      allPrice_w_nds,
    });
  },

  deleteItem: (key) => {
    const bill_items = get().bill_items;

    bill_items.splice(key, 1);

    set({
      bill_items,
    });

    get().reducePrice();
    get().check_price_item_new();
  },

  closeAlert: () => {
    set({ openAlert: false });
  },

  showAlert: (status, text) => {
    set({
      openAlert: true,
      err_status: status,
      err_text: text,
    });
  },

  addItem: () => {
    const { count, fact_unit, summ, sum_w_nds, all_ed_izmer, pq, vendor_items } = get();

    let bill_items = JSON.parse(JSON.stringify(get().bill_items));

    if (!count || !fact_unit || !summ || !sum_w_nds || !pq || !all_ed_izmer.length) {
      set({
        openAlert: true,
        err_status: false,
        err_text: "Необходимо выбрать Товар / кол-во Товара / указать суммы",
      });

      return;
    }

    const nds = get().check_nds_bill(
      Number(summ) == 0 ? 0 : (Number(sum_w_nds) - Number(summ)) / (Number(summ) / 100),
    );

    if (!nds) {
      set({
        openAlert: true,
        err_status: false,
        err_text: "Суммы указаны неверно",
      });

      return;
    }

    /*const range_price_item = get().check_price_item(vendor_items[0].price, vendor_items[0].vend_percent, summ, pq)

    if(range_price_item) {
      vendor_items[0].color = false;
    } else {
      vendor_items[0].color = true;
    }*/

    vendor_items[0].summ_nds = (Number(sum_w_nds) - Number(summ)).toFixed(2);
    vendor_items[0].nds = nds;
    vendor_items[0].pq = pq;
    vendor_items[0].all_ed_izmer = all_ed_izmer;
    vendor_items[0].count = count;
    vendor_items[0].fact_unit = getBillingQuantityText(fact_unit);
    vendor_items[0].price_item = summ;
    vendor_items[0].price_w_nds = sum_w_nds;
    vendor_items[0].price = getBillItemUnitPrice(vendor_items[0]);
    vendor_items[0].one_price_bill = vendor_items[0].price;

    const bill_items_doc = get().bill_items_doc;

    if (bill_items_doc.length) {
      // const item = bill_items_doc.find((it) => it.item_id === vendor_items[0].id);
      const item = bill_items_doc.find(
        (it) =>
          it.item_id === vendor_items[0].id && parseFloat(sum_w_nds) == parseFloat(it.price_w_nds),
      );

      item.fact_unit = getBillingFactUnitText(item.count, item.pq);
      item.summ_nds = (Number(item.price_w_nds) - Number(item.price)).toFixed(2);

      const nds = get().check_nds_bill(
        Number(item.price) == 0
          ? 0
          : (Number(item.price_w_nds) - Number(item.price)) / (Number(item.price) / 100),
      );

      if (nds) {
        item.nds = nds;
      } else {
        item.nds = "";
      }

      vendor_items[0].data_bill = item;
    }

    bill_items.push(vendor_items[0]);

    const allPrice = bill_items.reduce((all, item) => all + Number(item.price_item), 0).toFixed(2);
    const allPrice_w_nds = bill_items
      .reduce((all, item) => all + Number(item.price_w_nds), 0)
      .toFixed(2);

    set({
      bill_items,
      allPrice,
      allPrice_w_nds,
      count: "",
      fact_unit: "",
      summ: "",
      sum_w_nds: "",
      search_item: "",
      pq: "",
    });

    get().check_price_item_new();
  },

  addItem_fast: (
    count,
    fact_unit,
    summ,
    sum_w_nds,
    all_ed_izmer,
    pq,
    item_id,
    vendor_items,
    is_add,
    accounting_system,
  ) => {
    if (vendor_items.length == 0) {
      return;
    }

    //const { count, fact_unit, summ, sum_w_nds, all_ed_izmer, pq, vendor_items } = get();

    let bill_items = JSON.parse(JSON.stringify(get().bill_items));

    const nds =
      is_add == 0
        ? ""
        : get().check_nds_bill(
            Number(summ) == 0 ? 0 : (Number(sum_w_nds) - Number(summ)) / (Number(summ) / 100),
          );

    vendor_items[0].color = false;

    vendor_items[0].summ_nds =
      is_add == 0 ? "" : Number(count) == 0 ? 0 : (Number(sum_w_nds) - Number(summ)).toFixed(2);
    vendor_items[0].nds = nds;

    console.log("check 0", bill_items);
    console.log("check 1", accounting_system);

    vendor_items[0].pq = is_add == 0 ? "" : pq;
    vendor_items[0].all_ed_izmer = all_ed_izmer;
    vendor_items[0].count = is_add == 0 ? "" : count;
    vendor_items[0].fact_unit = is_add == 0 ? "" : fact_unit;
    vendor_items[0].price_item = is_add == 0 ? "" : summ;
    vendor_items[0].price_w_nds = is_add == 0 ? "" : Number(count) == 0 ? 0 : sum_w_nds;
    vendor_items[0].item_id = is_add == 0 ? "" : item_id;
    vendor_items[0].accounting_system = accounting_system;

    vendor_items[0].price = getBillItemUnitPrice(vendor_items[0]);
    vendor_items[0].one_price_bill = vendor_items[0].price;

    const bill_items_doc = get().bill_items_doc;

    console.log("bill_items_doc", bill_items_doc, sum_w_nds);

    if (bill_items_doc.length) {
      // const item = bill_items_doc.find((it) => it.item_id === vendor_items[0].id);
      let item = bill_items_doc.find(
        (it) =>
          it.item_id === vendor_items[0].id && parseFloat(sum_w_nds) == parseFloat(it.price_w_nds),
      );

      if (!item) {
        item = bill_items_doc.find((it) => it.item_id === vendor_items[0].id);
      }

      item.fact_unit = getBillingFactUnitText(item.count, item.pq);
      // item.price_w_nds = Number(count) == 0 ? 0 : item.price_w_nds;
      item.summ_nds = (Number(item.price_w_nds) - Number(item.price)).toFixed(2);

      const nds = get().check_nds_bill(
        Number(item.price) == 0
          ? 0
          : (Number(item.price_w_nds) - Number(item.price)) / (Number(item.price) / 100),
      );

      if (nds) {
        item.nds = nds;
      } else {
        item.nds = "";
      }

      vendor_items[0].data_bill = item;
    }

    bill_items.push(vendor_items[0]);

    const allPrice = bill_items.reduce((all, item) => all + Number(item.price_item), 0).toFixed(2);
    const allPrice_w_nds = bill_items
      .reduce((all, item) => all + Number(item.price_w_nds), 0)
      .toFixed(2);

    console.log("bill_items_final", bill_items);

    set({
      bill_items,
      allPrice,
      allPrice_w_nds,
    });
  },

  check_nds_bill: (value) => {
    let nds = [];
    nds[0] = "без НДС";
    nds[5] = "5 %";
    nds[7] = "7 %";
    nds[10] = "10 %";
    nds[20] = "20 %";
    nds[22] = "22 %";
    nds[18] = "18 %";

    return nds[Math.round(value)] ? nds[Math.round(value)] : false;
  },

  check_price_item_new: () => {
    var err_items = [];
    var bill_items = get().bill_items;
    var vendor_items = get().vendor_items;
    const priceCheckLog = [];

    bill_items.map((item, key) => {
      const vendorItem = vendor_items.find((it) => parseInt(it.id) === parseInt(item["item_id"]));
      const priceCheck = getBillItemPriceCheckMeta(item, vendorItem);

      bill_items[key].price_check = priceCheck;
      bill_items[key].price = getBillItemUnitPrice(item);
      bill_items[key].one_price_bill = bill_items[key].price;

      priceCheckLog.push({
        id: item?.item_id ?? item?.id,
        name: item?.name ?? item?.item_name,
        vendor_price: priceCheck.vendorPrice,
        vendor_percent: priceCheck.vendorPercent,
        allowed_min: priceCheck.allowedMin,
        allowed_max: priceCheck.allowedMax,
        bill_unit_price: priceCheck.billUnitPrice,
        fact_unit: item?.fact_unit,
        total_with_vat: item?.price_w_nds,
        color: priceCheck.isError,
        status: priceCheck.isError ? "error" : "ok",
        reason: priceCheck.reason || null,
      });

      if (priceCheck.isError) {
        err_items.push(bill_items[key]);
        bill_items[key].color = true;
      } else {
        bill_items[key].color = false;
      }
    });

    set({
      bill_items,
      err_items,
    });

    console.groupCollapsed(`Billing edit price check (${priceCheckLog.length})`);
    console.table(priceCheckLog);
    console.log("Billing edit price check errors", err_items);
    console.groupEnd();
  },

  check_price_item: (price, percent, summ, pq) => {
    const res = (Number(price) / 100) * Number(percent);

    const price_item = Number(summ) / Number(pq);

    if (price_item >= Number(price) - res && price_item <= Number(price) + res) {
      return true;
    } else {
      return false;
    }
  },

  checkPriceItems: () => {
    //let bill_items = JSON.parse(JSON.stringify(get().bill_items));
    /*let bill_items = get().bill_items;

    bill_items.map((item) => {

      console.log( item.price, item.vend_percent, item.price_item, item.pq )
      console.log( 'item', item ) //

      const range_price_item = get().check_price_item(item.price, item.vend_percent, item.price_item, item.pq)

      if(range_price_item) {
        item.color = false;
      } else {
        item.color = true;
      }

      return item;
    })

    set({
      bill_items,
    });*/

    get().check_price_item_new();
  },

  changeDataTable: (event, type, id, key) => {
    const value = event.target.value;

    let bill_items = JSON.parse(JSON.stringify(get().bill_items));

    bill_items = bill_items.map((item, index) => {
      if (item.id === id && key === index) {
        item[type] = value;
        console.log(item.item_name, type, value);

        const numericCount = parseBillingNumericValue(item.count);
        const numericPq = parseBillingNumericValue(item.pq);
        const numericValue = parseBillingNumericValue(value);

        if (type === "pq") {
          item.fact_unit = getBillingFactUnitText(item.count, item.pq) || 0;
        }

        if (numericValue !== null && numericValue > 0 && type === "count") {
          item.fact_unit = getBillingFactUnitText(value, item.pq) || 0;
        } else {
          if (type === "count") {
            item.fact_unit = 0;
          }
        }

        if (type === "price_item" || type === "price_w_nds") {
          const nds = get().check_nds_bill(
            Number(item.price_item) == 0
              ? 0
              : (Number(item.price_w_nds) - Number(item.price_item)) /
                  (Number(item.price_item) / 100),
          );

          //const range_price_item = get().check_price_item(item.price, item.vend_percent, item.price_item, item.pq)

          if (nds) {
            item.nds = nds;
            item.summ_nds = (Number(item.price_w_nds) - Number(item.price_item)).toFixed(2);
          } else {
            item.summ_nds = 0;
            item.nds = "";
          }
        }

        item.price = getBillItemUnitPrice(item);
        item.one_price_bill = item.price;
      }

      return item;
    });

    if (type === "price_item") {
      const allPrice = bill_items
        .reduce((all, item) => all + Number(item.price_item), 0)
        .toFixed(2);

      set({
        allPrice,
      });
    }

    if (type === "price_w_nds") {
      const allPrice_w_nds = bill_items
        .reduce((all, item) => all + Number(item.price_w_nds), 0)
        .toFixed(2);

      set({
        allPrice_w_nds,
      });
    }

    set({
      bill_items,
    });

    get().check_price_item_new();
  },
}));

function FormHeader_new({ type_edit }) {
  const [
    point_name,
    types,
    type,
    changeData,
    vendors,
    search_vendor,
    kinds,
    doc_base_id,
    docs,
    doc,
    search_doc,
    changeInput,
    number,
    number_factur,
    changeDateRange,
    date,
    date_factur,
    fullScreen,
    bill,
  ] = useStore((state) => [
    state.point_name,
    state.types,
    state.type,
    state.changeData,
    state.vendors,
    state.search_vendor,
    state.kinds,
    state.doc_base_id,
    state.docs,
    state.doc,
    state.search_doc,
    state.changeInput,
    state.number,
    state.number_factur,
    state.changeDateRange,
    state.date,
    state.date_factur,
    state.fullScreen,
    state.bill,
  ]);

  return (
    <>
      <Grid
        id={BILLING_COMPARE_FORM_ANCHOR_ID}
        size={{
          xs: 12,
          sm: 4,
        }}
      >
        <MyTextInput
          label="Кафе"
          disabled={true}
          value={point_name}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 4,
        }}
      >
        <MySelect
          data={types}
          value={type}
          multiple={false}
          is_none={false}
          unifiedPopup
          disabled={true}
          func={(event) => changeData("type", event)}
          label="Тип"
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 4,
        }}
      >
        <MyTextInput
          label="Поставщик"
          disabled={true}
          value={search_vendor}
        />
      </Grid>
      {parseInt(type) === 2 || parseInt(type) === 3 ? (
        <>
          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <MySelect
              data={kinds}
              value={doc_base_id}
              multiple={false}
              is_none={false}
              unifiedPopup
              disabled={parseInt(bill?.type) == 5 ? false : true}
              func={(event) => changeData("doc_base_id", event)}
              label="Документ"
            />
          </Grid>
          {parseInt(type) === 2 ? (
            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            />
          ) : null}
        </>
      ) : null}
      {parseInt(type) === 3 || parseInt(type) === 4 ? (
        <>
          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <MyAutocomplite2
              data={docs}
              multiple={false}
              value={doc}
              unifiedPopup
              disabled={true}
              func={(event, name) => search_doc(event, name)}
              onBlur={(event, name) => search_doc(event, name)}
              label="Документ основание"
            />
          </Grid>
          {parseInt(type) === 4 ? (
            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            />
          ) : null}
        </>
      ) : null}
      <Grid
        size={{
          xs: 12,
          sm: 6,
        }}
      >
        <MyTextInput
          label="Номер документа"
          disabled={type_edit === "edit" ? false : true}
          value={number}
          func={(event) => changeInput(event, "number")}
        />
      </Grid>
      {parseInt(type) === 2 && parseInt(doc_base_id) == 5 && !fullScreen ? (
        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <MyTextInput
            label="Номер счет-фактуры"
            disabled={type_edit === "edit" ? false : true}
            value={number_factur}
            func={(event) => changeInput(event, "number_factur")}
          />
        </Grid>
      ) : null}
      <Grid
        size={{
          xs: 12,
          sm: 6,
        }}
      >
        <MyDatePickerNew
          label="Дата документа"
          format="DD-MM-YYYY"
          disabled={type_edit === "edit" ? false : true}
          value={date}
          func={(event) => changeDateRange(event, "date")}
        />
      </Grid>
      {parseInt(type) === 2 && parseInt(doc_base_id) == 5 && !fullScreen ? (
        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <MyDatePickerNew
            label="Дата счет-фактуры"
            format="DD-MM-YYYY"
            disabled={type_edit === "edit" ? false : true}
            value={date_factur}
            func={(event) => changeDateRange(event, "date_factur")}
          />
        </Grid>
      ) : null}
    </>
  );
}

function FormVendorItems() {
  const [bill, type, vendor_items, search_item, all_ed_izmer, changeCount, changeData, addItem] =
    useStore((state) => [
      state.bill,
      state.type,
      state.vendor_items,
      state.search_item,
      state.all_ed_izmer,
      state.changeCount,
      state.changeData,
      state.addItem,
    ]);
  const [search_vendor_items, pq, count, fact_unit, summ, sum_w_nds] = useStore((state) => [
    state.search_vendor_items,
    state.pq,
    state.count,
    state.fact_unit,
    state.summ,
    state.sum_w_nds,
  ]);

  if (parseInt(type) == 3) {
    return null;
  }

  return (
    <>
      <Grid
        size={{
          xs: 12,
          sm: 4,
        }}
      >
        <MyAutocomplite2
          label="Товар поставщика"
          freeSolo={true}
          multiple={false}
          unifiedPopup
          autocompleteSx={billingCompactAutocompleteSx}
          slotProps={billingCompactAutocompleteSlotProps}
          sx={billingCompactAutocompleteFieldSx}
          data={vendor_items}
          value={search_item?.name ?? search_item}
          func={(event, name) => search_vendor_items(event, name)}
          onBlur={(event, name) => search_vendor_items(event, name)}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 3,
        }}
      >
        {parseInt(bill?.type) == 5 || parseInt(bill?.type) == 2 ? (
          <MySelect
            label="Объем упаковки"
            multiple={false}
            is_none={false}
            unifiedPopup
            autocompleteSx={billingCompactAutocompleteSx}
            slotProps={billingCompactAutocompleteSlotProps}
            sx={billingCompactAutocompleteFieldSx}
            data={formatBillingPackOptions(all_ed_izmer)}
            value={findVendorPackOption(all_ed_izmer, pq)?.id ?? pq ?? ""}
            func={(event) => changeData("pq", event)}
          />
        ) : (
          <MyAutocomplite2
            label="Объем упаковки"
            freeSolo={true}
            multiple={false}
            unifiedPopup
            autocompleteSx={billingCompactAutocompleteSx}
            slotProps={billingCompactAutocompleteSlotProps}
            sx={billingCompactAutocompleteFieldSx}
            data={all_ed_izmer}
            value={pq}
            func={(event, data) =>
              changeData("pq", { target: { value: data ?? event.target.value } })
            }
            onBlur={(event, data) =>
              changeData("pq", { target: { value: data ?? event.target.value } })
            }
          />
        )}
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 3,
        }}
      >
        <MyTextInput
          type="text"
          inputProps={{ inputMode: "decimal" }}
          isDecimalMask
          decimalScale={BILLING_PACK_COUNT_SCALE}
          label="Кол-во упаковок"
          sx={billingCompactTextInputSx}
          value={count}
          func={(event) =>
            changeCount(getBillingDecimalEvent(event, { fractionDigits: BILLING_PACK_COUNT_SCALE }))
          }
          onBlur={(event) =>
            changeCount(
              getBillingDecimalEvent(event, {
                fractionDigits: BILLING_PACK_COUNT_SCALE,
                stripTrailingSeparator: true,
              }),
            )
          }
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 2,
        }}
      >
        <MyTextInput
          label="Кол-вo"
          disabled={true}
          value={formatBillingQuantityFieldValue(fact_unit)}
          sx={billingCompactTextInputSx}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 4,
        }}
      >
        <MyTextInput
          type="text"
          inputProps={{ inputMode: "decimal" }}
          isDecimalMask
          decimalScale={BILLING_DECIMAL_SCALE}
          label="Сумма без НДС"
          inputAdornment={<BillingRubleAdornment />}
          sx={billingFormNumericInputSx}
          value={summ}
          func={(event) => changeData("summ", getBillingDecimalEvent(event))}
          onBlur={(event) => changeData("summ", getBillingDecimalEvent(event, { fixed: true }))}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 4,
        }}
      >
        <MyTextInput
          type="text"
          inputProps={{ inputMode: "decimal" }}
          isDecimalMask
          decimalScale={BILLING_DECIMAL_SCALE}
          label="Сумма c НДС"
          inputAdornment={<BillingRubleAdornment />}
          sx={billingFormNumericInputSx}
          value={sum_w_nds}
          func={(event) => changeData("sum_w_nds", getBillingDecimalEvent(event))}
          onBlur={(event) =>
            changeData("sum_w_nds", getBillingDecimalEvent(event, { fixed: true }))
          }
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 4,
        }}
      >
        <Button
          variant="contained"
          fullWidth
          onClick={addItem}
          startIcon={<AddIcon />}
          sx={{
            minHeight: billingFieldMinHeight,
            borderRadius: billingFieldRadius,
            px: 2.5,
            justifyContent: "center",
            gap: 0.75,
            textTransform: "none",
            fontSize: { xs: "0.98rem", md: "1rem" },
            fontWeight: 800,
            letterSpacing: "0.01em",
            color: "#fff",
            background: "linear-gradient(135deg, #be123c 0%, #e11d48 100%)",
            boxShadow: "0 14px 28px rgba(190, 24, 93, 0.22)",
            "& .MuiButton-startIcon": {
              margin: 0,
            },
            "& .MuiSvgIcon-root": {
              fontSize: "1.2rem",
            },
            "&:hover": {
              background: "linear-gradient(135deg, #9f1239 0%, #be123c 100%)",
              boxShadow: "0 18px 34px rgba(159, 18, 57, 0.28)",
            },
          }}
        >
          Добавить позицию
        </Button>
      </Grid>
    </>
  );
}

function VendorItemsTableEdit({ showPriceWarnings = true }) {
  const [bill, type, deleteItem, changeDataTable, handleDrag, handleDrop] = useStore((state) => [
    state.bill,
    state.type,
    state.deleteItem,
    state.changeDataTable,
    state.handleDrag,
    state.handleDrop,
  ]);
  const [bill_items_doc, bill_items, allPrice, allPrice_w_nds, err_items] = useStore((state) => [
    state.bill_items_doc,
    state.bill_items,
    state.allPrice,
    state.allPrice_w_nds,
    state.err_items,
  ]);

  let summ_nds = 0;

  bill_items.map((item) => {
    summ_nds += parseFloat(item.summ_nds);
  });

  const draggable = parseInt(bill?.type) === 5 || parseInt(bill?.type) === 2 ? true : false;

  console.log("bill_items", bill_items);

  return (
    <>
      <Grid
        style={{ marginBottom: 20 }}
        size={{
          xs: 12,
          sm: 12,
        }}
      >
        {!showPriceWarnings ? null : <BillPriceWarningBanner count={err_items.length} />}
        <TableContainer
          component={Paper}
          elevation={0}
          sx={billingTableContainerSx}
        >
          <Table
            aria-label="a dense table"
            sx={billingTableSx}
          >
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                <TableCell style={{ minWidth: "150px" }}>Товар</TableCell>
                {bill_items_doc.length == 0 ? null : (
                  <TableCell style={{ minWidth: "130px" }}>Изменения</TableCell>
                )}
                <TableCell style={{ minWidth: "130px" }}>В упак.</TableCell>
                <TableCell style={{ minWidth: "130px" }}>Упак</TableCell>
                <TableCell>Кол-во</TableCell>
                <TableCell style={{ minWidth: "100px" }}>НДС</TableCell>
                <TableCell sx={billingNumericHeaderCellSx}>Сумма без НДС</TableCell>
                <TableCell sx={billingNumericHeaderCellSx}>Сумма НДС</TableCell>
                <TableCell sx={billingNumericHeaderCellSx}>Сумма с НДС</TableCell>
                <TableCell></TableCell>
                <TableCell sx={billingNumericHeaderCellSx}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bill_items.map((item, key) => (
                <React.Fragment key={key}>
                  {!item?.data_bill ? null : (
                    <TableRow
                      sx={
                        showPriceWarnings && item?.price_check?.isError
                          ? billingPriceWarningRowSx
                          : undefined
                      }
                      draggable={draggable}
                      onDragStart={handleDrag}
                      onDrop={handleDrop}
                      id={key}
                      onDragOver={(ev) => ev.preventDefault()}
                    >
                      <TableCell rowSpan={2}>
                        <BillItemNameContent
                          item={item}
                          showPriceWarnings={showPriceWarnings}
                        />
                      </TableCell>
                      <TableCell>До</TableCell>
                      <TableCell>
                        {formatBillingQuantityWithUnit(item?.data_bill?.pq, item.ed_izmer_name)}
                      </TableCell>
                      <TableCell>{formatBillingQuantity(item?.data_bill?.count)}</TableCell>
                      <TableCell style={{ whiteSpace: "nowrap" }}>
                        {formatBillingQuantityWithUnit(
                          item?.data_bill?.fact_unit,
                          item.ed_izmer_name,
                        )}
                      </TableCell>
                      <TableCell>{item?.data_bill?.nds}</TableCell>
                      <TableCell sx={billingNumericCellSx}>
                        {formatBillingCurrency(item?.data_bill?.price)}
                      </TableCell>
                      <TableCell sx={billingNumericCellSx}>
                        {formatBillingCurrency(item?.data_bill?.summ_nds)}
                      </TableCell>
                      <TableCell sx={billingNumericCellSx}>
                        {formatBillingCurrency(item?.data_bill?.price_w_nds)}
                      </TableCell>
                      <TableCell rowSpan={2}>
                        {parseInt(type) == 3 ? (
                          false
                        ) : (
                          <Button
                            onClick={() => deleteItem(key)}
                            style={{ cursor: "pointer" }}
                            color="error"
                            variant="contained"
                          >
                            <ClearIcon />
                          </Button>
                        )}
                      </TableCell>
                      <TableCell
                        rowSpan={2}
                        sx={billingNumericCellSx}
                      >
                        {formatBillingUnitPrice(item.price_w_nds, item.fact_unit)}
                      </TableCell>
                    </TableRow>
                  )}

                  <TableRow
                    hover
                    sx={
                      showPriceWarnings && item?.price_check?.isError
                        ? billingPriceWarningRowSx
                        : undefined
                    }
                    draggable={draggable}
                    onDragStart={handleDrag}
                    onDrop={handleDrop}
                    id={key}
                    onDragOver={(ev) => ev.preventDefault()}
                  >
                    {item?.data_bill ? null : (
                      <TableCell>
                        <BillItemNameContent
                          item={item}
                          showPriceWarnings={showPriceWarnings}
                        />
                      </TableCell>
                    )}
                    {!item?.data_bill ? null : <TableCell>После</TableCell>}
                    <TableCell className="ceil_white">
                      {parseInt(bill?.type) == 5 || parseInt(bill?.type) == 2 ? (
                        <MySelect
                          label=""
                          data={formatBillingPackOptions(item.pq_item)}
                          value={findVendorPackOption(item.pq_item, item.pq)?.id ?? item.pq ?? ""}
                          multiple={false}
                          is_none={false}
                          unifiedPopup
                          func={(event) => changeDataTable(event, "pq", item.id, key)}
                        />
                      ) : (
                        <MyAutocomplite2
                          label=""
                          freeSolo={true}
                          multiple={false}
                          unifiedPopup
                          data={item.pq_item}
                          value={item.pq}
                          func={(event, data) =>
                            changeDataTable(
                              { target: { value: data ?? event.target.value } },
                              "pq",
                              item.id,
                              key,
                            )
                          }
                          onBlur={(event, data) =>
                            changeDataTable(
                              { target: { value: data ?? event.target.value } },
                              "pq",
                              item.id,
                              key,
                            )
                          }
                        />
                      )}
                    </TableCell>
                    <TableCell className="ceil_white">
                      <MyTextInput
                        type="text"
                        inputProps={{ inputMode: "decimal" }}
                        isDecimalMask
                        decimalScale={BILLING_PACK_COUNT_SCALE}
                        label=""
                        sx={billingNumericInputSx}
                        value={item.count}
                        func={(event) =>
                          changeDataTable(
                            getBillingDecimalEvent(event, {
                              fractionDigits: BILLING_PACK_COUNT_SCALE,
                            }),
                            "count",
                            item.id,
                            key,
                          )
                        }
                        onBlur={(event) =>
                          changeDataTable(
                            getBillingDecimalEvent(event, {
                              fractionDigits: BILLING_PACK_COUNT_SCALE,
                              stripTrailingSeparator: true,
                            }),
                            "count",
                            item.id,
                            key,
                          )
                        }
                      />
                    </TableCell>
                    <TableCell sx={billingNumericCellSx}>
                      {formatBillingQuantityWithUnit(item.fact_unit, item.ed_izmer_name)}
                    </TableCell>
                    <TableCell>{item.nds}</TableCell>
                    <TableCell className="ceil_white">
                      <MyTextInput
                        type="text"
                        inputProps={{ inputMode: "decimal" }}
                        isDecimalMask
                        decimalScale={BILLING_DECIMAL_SCALE}
                        label=""
                        inputAdornment={<BillingRubleAdornment />}
                        sx={billingNumericInputSx}
                        value={item.price_item}
                        func={(event) =>
                          changeDataTable(getBillingDecimalEvent(event), "price_item", item.id, key)
                        }
                        onBlur={(event) =>
                          changeDataTable(
                            getBillingDecimalEvent(event, { fixed: true }),
                            "price_item",
                            item.id,
                            key,
                          )
                        }
                      />
                    </TableCell>
                    <TableCell sx={billingNumericCellSx}>
                      {formatBillingCurrency(item.summ_nds)}
                    </TableCell>
                    <TableCell className="ceil_white">
                      <MyTextInput
                        type="text"
                        inputProps={{ inputMode: "decimal" }}
                        isDecimalMask
                        decimalScale={BILLING_DECIMAL_SCALE}
                        label=""
                        inputAdornment={<BillingRubleAdornment />}
                        sx={billingNumericInputSx}
                        value={item.price_w_nds}
                        func={(event) =>
                          changeDataTable(
                            getBillingDecimalEvent(event),
                            "price_w_nds",
                            item.id,
                            key,
                          )
                        }
                        onBlur={(event) =>
                          changeDataTable(
                            getBillingDecimalEvent(event, { fixed: true }),
                            "price_w_nds",
                            item.id,
                            key,
                          )
                        }
                      />
                    </TableCell>
                    {item?.data_bill ? null : (
                      <>
                        <TableCell>
                          {parseInt(type) == 3 ? (
                            false
                          ) : (
                            <Button
                              onClick={() => deleteItem(key)}
                              style={{ cursor: "pointer" }}
                              color="error"
                              variant="contained"
                            >
                              <ClearIcon />
                            </Button>
                          )}
                        </TableCell>
                        <TableCell sx={billingNumericCellSx}>
                          {formatBillingUnitPrice(item.price_w_nds, item.fact_unit)}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                </React.Fragment>
              ))}
              {bill_items.length == 0 ? null : (
                <TableRow sx={{ "& td": { fontWeight: "bold" } }}>
                  <TableCell>Итого:</TableCell>
                  {bill_items_doc.length == 0 ? null : <TableCell></TableCell>}
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell sx={billingNumericCellSx}>{formatBillingCurrency(allPrice)}</TableCell>
                  <TableCell sx={billingNumericCellSx}>{formatBillingCurrency(summ_nds)}</TableCell>
                  <TableCell sx={billingNumericCellSx}>
                    {formatBillingCurrency(allPrice_w_nds)}
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell sx={billingNumericCellSx}></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </>
  );
}

function VendorItemsTableView({ showPriceWarnings = true }) {
  const [bill_items_doc, bill_items, allPrice, allPrice_w_nds, err_items] = useStore((state) => [
    state.bill_items_doc,
    state.bill_items,
    state.allPrice,
    state.allPrice_w_nds,
    state.err_items,
  ]);

  let summ_nds = 0;

  bill_items.map((item) => {
    summ_nds += parseFloat(item.summ_nds);
  });

  console.log("bill_items", bill_items);

  return (
    <Grid
      style={{ marginBottom: 20 }}
      size={{
        xs: 12,
        sm: 12,
      }}
    >
      {!showPriceWarnings ? null : <BillPriceWarningBanner count={err_items.length} />}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={billingTableContainerSx}
      >
        <Table
          aria-label="a dense table"
          sx={billingTableSx}
        >
          <TableHead>
            <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
              <TableCell>Товар</TableCell>
              {bill_items_doc.length == 0 ? null : <TableCell>Изменения</TableCell>}
              <TableCell>В упак.</TableCell>
              <TableCell>Упак</TableCell>
              <TableCell>Кол-во</TableCell>
              <TableCell>НДС</TableCell>
              <TableCell sx={billingNumericHeaderCellSx}>Сумма без НДС</TableCell>
              <TableCell sx={billingNumericHeaderCellSx}>Сумма НДС</TableCell>
              <TableCell sx={billingNumericHeaderCellSx}>Сумма с НДС</TableCell>
              <TableCell></TableCell>
              <TableCell sx={billingNumericHeaderCellSx}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bill_items.map((item, key) => (
              <React.Fragment key={key}>
                {!item?.data_bill ? null : (
                  <TableRow
                    sx={
                      showPriceWarnings && item?.price_check?.isError
                        ? billingPriceWarningRowSx
                        : undefined
                    }
                  >
                    <TableCell rowSpan={2}>
                      <BillItemNameContent
                        item={item}
                        showPriceWarnings={showPriceWarnings}
                      />
                    </TableCell>
                    <TableCell>До</TableCell>
                    <TableCell>
                      {formatBillingQuantityWithUnit(item?.data_bill?.pq, item.ed_izmer_name)}
                    </TableCell>
                    <TableCell>{formatBillingQuantity(item?.data_bill?.count)}</TableCell>
                    <TableCell style={{ whiteSpace: "nowrap" }}>
                      {formatBillingQuantityWithUnit(
                        item?.data_bill?.fact_unit,
                        item.ed_izmer_name,
                      )}
                    </TableCell>
                    <TableCell>{item?.data_bill?.nds}</TableCell>
                    <TableCell sx={billingNumericCellSx}>
                      {formatBillingCurrency(item?.data_bill?.price)}
                    </TableCell>
                    <TableCell sx={billingNumericCellSx}>
                      {formatBillingCurrency(item?.data_bill?.summ_nds)}
                    </TableCell>
                    <TableCell sx={billingNumericCellSx}>
                      {formatBillingCurrency(item?.data_bill?.price_w_nds)}
                    </TableCell>
                    <TableCell rowSpan={2}></TableCell>
                    <TableCell
                      rowSpan={2}
                      sx={billingNumericCellSx}
                    >
                      {formatBillingUnitPrice(item.price_w_nds, item.fact_unit)}
                    </TableCell>
                  </TableRow>
                )}

                <TableRow
                  hover
                  sx={
                    showPriceWarnings && item?.price_check?.isError
                      ? billingPriceWarningRowSx
                      : undefined
                  }
                >
                  {item?.data_bill ? null : (
                    <TableCell>
                      <BillItemNameContent
                        item={item}
                        showPriceWarnings={showPriceWarnings}
                      />
                    </TableCell>
                  )}
                  {!item?.data_bill ? null : <TableCell>После</TableCell>}
                  <TableCell className="ceil_white">{formatBillingQuantity(item.pq)}</TableCell>
                  <TableCell className="ceil_white">{formatBillingQuantity(item.count)}</TableCell>
                  <TableCell sx={billingNumericCellSx}>
                    {formatBillingQuantityWithUnit(item.fact_unit, item.ed_izmer_name)}
                  </TableCell>
                  <TableCell>{item.nds}</TableCell>
                  <TableCell
                    className="ceil_white"
                    sx={billingNumericCellSx}
                  >
                    {formatBillingCurrency(item.price_item)}
                  </TableCell>
                  <TableCell sx={billingNumericCellSx}>
                    {formatBillingCurrency(item.summ_nds)}
                  </TableCell>
                  <TableCell
                    className="ceil_white"
                    sx={billingNumericCellSx}
                  >
                    {formatBillingCurrency(item.price_w_nds)}
                  </TableCell>
                  {item?.data_bill ? null : (
                    <>
                      <TableCell></TableCell>
                      <TableCell sx={billingNumericCellSx}>
                        {formatBillingUnitPrice(item.price_w_nds, item.fact_unit)}
                      </TableCell>
                    </>
                  )}
                </TableRow>
              </React.Fragment>
            ))}
            {bill_items.length == 0 ? null : (
              <TableRow sx={{ "& td": { fontWeight: "bold" } }}>
                <TableCell>Итого:</TableCell>
                {bill_items_doc.length == 0 ? null : <TableCell></TableCell>}
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell sx={billingNumericCellSx}>{formatBillingCurrency(allPrice)}</TableCell>
                <TableCell sx={billingNumericCellSx}>{formatBillingCurrency(summ_nds)}</TableCell>
                <TableCell sx={billingNumericCellSx}>
                  {formatBillingCurrency(allPrice_w_nds)}
                </TableCell>
                <TableCell></TableCell>
                <TableCell sx={billingNumericCellSx}></TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  );
}

function VendorItemsTableView_min({ showPriceWarnings = true }) {
  const [bill_items_doc, bill_items, allPrice, allPrice_w_nds, err_items] = useStore((state) => [
    state.bill_items_doc,
    state.bill_items,
    state.allPrice,
    state.allPrice_w_nds,
    state.err_items,
  ]);

  let summ_nds = 0;

  bill_items.map((item) => {
    summ_nds += parseFloat(item.summ_nds);
  });

  return (
    <Box>
      {!showPriceWarnings ? null : <BillPriceWarningBanner count={err_items.length} />}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={billingTableContainerSx}
      >
        <Table
          aria-label="a dense table"
          sx={billingTableSx}
        >
          <TableHead>
            <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
              <TableCell>Товар</TableCell>
              {bill_items_doc.length == 0 ? null : <TableCell>Изменения</TableCell>}
              <TableCell>В упак.</TableCell>
              <TableCell>Упак</TableCell>
              <TableCell>Кол-во</TableCell>
              <TableCell>НДС</TableCell>
              <TableCell sx={billingNumericHeaderCellSx}>Сумма без НДС</TableCell>
              <TableCell sx={billingNumericHeaderCellSx}>Сумма НДС</TableCell>
              <TableCell sx={billingNumericHeaderCellSx}>Сумма с НДС</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bill_items.map((item, key) => (
              <React.Fragment key={key}>
                {!item?.data_bill ? null : (
                  <TableRow
                    sx={
                      showPriceWarnings && item?.price_check?.isError
                        ? billingPriceWarningRowSx
                        : undefined
                    }
                  >
                    <TableCell rowSpan={2}>
                      <BillItemNameContent
                        item={item}
                        showPriceWarnings={showPriceWarnings}
                      />
                    </TableCell>
                    <TableCell>До</TableCell>
                    <TableCell>
                      {formatBillingQuantityWithUnit(item?.data_bill?.pq, item.ed_izmer_name)}
                    </TableCell>
                    <TableCell>{formatBillingQuantity(item?.data_bill?.count)}</TableCell>
                    <TableCell style={{ whiteSpace: "nowrap" }}>
                      {formatBillingQuantityWithUnit(
                        item?.data_bill?.fact_unit,
                        item.ed_izmer_name,
                      )}
                    </TableCell>
                    <TableCell>{item?.data_bill?.nds}</TableCell>
                    <TableCell sx={billingNumericCellSx}>
                      {formatBillingCurrency(item?.data_bill?.price)}
                    </TableCell>
                    <TableCell sx={billingNumericCellSx}>
                      {formatBillingCurrency(item?.data_bill?.summ_nds)}
                    </TableCell>
                    <TableCell sx={billingNumericCellSx}>
                      {formatBillingCurrency(item?.data_bill?.price_w_nds)}
                    </TableCell>
                  </TableRow>
                )}

                <TableRow
                  hover
                  sx={
                    showPriceWarnings && item?.price_check?.isError
                      ? billingPriceWarningRowSx
                      : undefined
                  }
                >
                  {item?.data_bill ? null : (
                    <TableCell>
                      <BillItemNameContent
                        item={item}
                        showPriceWarnings={showPriceWarnings}
                      />
                    </TableCell>
                  )}
                  {!item?.data_bill ? null : <TableCell>После</TableCell>}
                  <TableCell className="ceil_white">{formatBillingQuantity(item.pq)}</TableCell>
                  <TableCell className="ceil_white">{formatBillingQuantity(item.count)}</TableCell>
                  <TableCell sx={billingNumericCellSx}>
                    {formatBillingQuantityWithUnit(item.fact_unit, item.ed_izmer_name)}
                  </TableCell>
                  <TableCell>{item.nds}</TableCell>
                  <TableCell
                    className="ceil_white"
                    sx={billingNumericCellSx}
                  >
                    {formatBillingCurrency(item.price_item)}
                  </TableCell>
                  <TableCell sx={billingNumericCellSx}>
                    {formatBillingCurrency(item.summ_nds)}
                  </TableCell>
                  <TableCell
                    className="ceil_white"
                    sx={billingNumericCellSx}
                  >
                    {formatBillingCurrency(item.price_w_nds)}
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
            {bill_items.length == 0 ? null : (
              <TableRow sx={{ "& td": { fontWeight: "bold" } }}>
                <TableCell>Итого:</TableCell>
                {bill_items_doc.length == 0 ? null : <TableCell></TableCell>}
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell sx={billingNumericCellSx}>{formatBillingCurrency(allPrice)}</TableCell>
                <TableCell sx={billingNumericCellSx}>{formatBillingCurrency(summ_nds)}</TableCell>
                <TableCell sx={billingNumericCellSx}>
                  {formatBillingCurrency(allPrice_w_nds)}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

function FormImage_new({
  type_edit,
  type_doc,
  onAddBillFilesClick,
  onAddFacturFilesClick,
  onOcrClick,
  isOcrLoad,
  isOcrDisabled,
  showOcrButton,
}) {
  const [
    type,
    imgs_bill,
    openImageBill,
    fullScreen,
    imgs_factur,
    number_factur,
    changeInput,
    changeDateRange,
    date_factur,
    doc_base_id,
  ] = useStore((state) => [
    state.type,
    state.imgs_bill,
    state.openImageBill,
    state.fullScreen,
    state.imgs_factur,
    state.number_factur,
    state.changeInput,
    state.changeDateRange,
    state.date_factur,
    state.doc_base_id,
  ]);

  const url = type_doc === "bill" ? "bill/" : "bill-ex-items/";
  const mainStorageBase = `https://storage.yandexcloud.net/${url}`;
  const facturStorageBase = "https://storage.yandexcloud.net/bill/";

  const renderStoredFiles = (files = [], baseUrl, imageType) => {
    if (!files.length) {
      return null;
    }

    return (
      <Grid
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 2,
          p: 2,
          borderRadius: "22px",
          border: "1px solid rgba(148, 163, 184, 0.18)",
          backgroundColor: "rgba(255,255,255,0.74)",
        }}
      >
        {files.map((img, key) => {
          const fileUrl = `${baseUrl}${img}`;
          const isPdf = img.toLowerCase().includes(".pdf");

          return (
            <Box
              key={`${imageType}-${img}-${key}`}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.25,
                p: 1.5,
                borderRadius: "18px",
                border: "1px solid rgba(148, 163, 184, 0.16)",
                backgroundColor: "#fff",
                boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
              }}
            >
              {isPdf ? (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    minHeight: 140,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    textDecoration: "none",
                    color: "#991b1b",
                    borderRadius: 14,
                    background:
                      "linear-gradient(135deg, rgba(255,247,237,1) 0%, rgba(254,226,226,0.92) 100%)",
                  }}
                >
                  <InsertDriveFileIcon style={{ fontSize: 72 }} />
                  <span style={{ fontWeight: 700 }}>PDF</span>
                </a>
              ) : (
                <Box
                  onClick={() => openImageBill(fileUrl, imageType)}
                  sx={{
                    minHeight: 140,
                    p: 1.5,
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    background:
                      "linear-gradient(135deg, rgba(241,245,249,1) 0%, rgba(226,232,240,0.92) 100%)",
                  }}
                >
                  <img
                    src={fileUrl}
                    alt="Image bill"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 110,
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                      borderRadius: 12,
                      boxShadow: "0 6px 18px rgba(15, 23, 42, 0.08)",
                    }}
                  />
                </Box>
              )}
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#1f2937",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {img}
              </Typography>
            </Box>
          );
        })}
      </Grid>
    );
  };

  return (
    <>
      {!imgs_bill.length ? null : (
        <Grid
          size={{
            xs: 12,
            sm: parseInt(type) === 2 ? 6 : 12,
          }}
        >
          {renderStoredFiles(imgs_bill, mainStorageBase, "bill")}
        </Grid>
      )}
      {parseInt(type) === 2 && parseInt(doc_base_id) == 5 && !fullScreen && type_doc === "bill" ? (
        !imgs_factur.length ? null : (
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            {renderStoredFiles(imgs_factur, facturStorageBase, "factur")}
          </Grid>
        )
      ) : null}
      {type_edit === "edit" ? (
        <Grid
          size={{
            xs: 12,
            sm: parseInt(type) === 2 && parseInt(doc_base_id) == 5 ? 6 : 12,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box
              component="div"
              className="dropzone"
              id="img_bill"
              sx={billingDropzoneSx}
            />
            <Box
              component="button"
              type="button"
              onClick={onAddBillFilesClick}
              sx={billingDropzoneAddActionSx}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "14px",
                  backgroundColor: "rgba(255,255,255,0.86)",
                  color: "#0284c7",
                  flexShrink: 0,
                  "& .MuiSvgIcon-root": {
                    fontSize: "1.4rem",
                  },
                }}
              >
                <AddIcon />
              </Box>
              <Box sx={{ display: "grid", gap: 0.35, textAlign: "left" }}>
                <Typography sx={{ fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>
                  Добавить ещё файлы
                </Typography>
                <Typography sx={{ fontSize: 13, lineHeight: 1.45, color: "#475569" }}>
                  Нажми, чтобы выбрать ещё страницы документа
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      ) : null}
      {type_edit === "edit" && parseInt(type) === 2 && parseInt(doc_base_id) == 5 && !fullScreen ? (
        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box
              component="div"
              className="dropzone"
              id="img_bill_type"
              sx={billingDropzoneSx}
            />
            <Box
              component="button"
              type="button"
              onClick={onAddFacturFilesClick}
              sx={billingDropzoneAddActionSx}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "14px",
                  backgroundColor: "rgba(255,255,255,0.86)",
                  color: "#0284c7",
                  flexShrink: 0,
                  "& .MuiSvgIcon-root": {
                    fontSize: "1.4rem",
                  },
                }}
              >
                <AddIcon />
              </Box>
              <Box sx={{ display: "grid", gap: 0.35, textAlign: "left" }}>
                <Typography sx={{ fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>
                  Добавить счёт-фактуру
                </Typography>
                <Typography sx={{ fontSize: 13, lineHeight: 1.45, color: "#475569" }}>
                  Выбери ещё изображения или PDF для счёт-фактуры
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      ) : null}
      {!showOcrButton ? null : (
        <Grid
          size={{
            xs: 12,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "center", mt: 0.5 }}>
            <Button
              variant="contained"
              color="info"
              onClick={onOcrClick}
              disabled={isOcrDisabled}
              sx={{
                minWidth: 160,
                whiteSpace: "nowrap",
                borderRadius: "14px",
                px: 3,
                boxShadow: "0 12px 24px rgba(2, 132, 199, 0.22)",
              }}
            >
              {isOcrLoad ? "Распознаем..." : "Распознать"}
            </Button>
          </Box>
        </Grid>
      )}
      {parseInt(type) === 2 && parseInt(doc_base_id) == 5 && fullScreen && type_doc === "bill" ? (
        <>
          <Grid
            size={{
              xs: 12,
            }}
          >
            <MyTextInput
              label="Номер счет-фактуры"
              disabled={type_edit === "edit" ? false : true}
              value={number_factur}
              func={(event) => changeInput(event, "number_factur")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
            }}
          >
            <MyDatePickerNew
              label="Дата счет-фактуры"
              format="DD-MM-YYYY"
              disabled={type_edit === "edit" ? false : true}
              value={date_factur}
              func={(event) => changeDateRange(event, "date_factur")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
            }}
          >
            {renderStoredFiles(imgs_factur, facturStorageBase, "factur")}
          </Grid>

          {type_edit === "edit" ? (
            <Grid
              size={{
                xs: 12,
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box
                  component="div"
                  className="dropzone"
                  id="img_bill_type"
                  sx={billingDropzoneSx}
                />
                <Box
                  component="button"
                  type="button"
                  onClick={onAddFacturFilesClick}
                  sx={billingDropzoneAddActionSx}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "14px",
                      backgroundColor: "rgba(255,255,255,0.86)",
                      color: "#0284c7",
                      flexShrink: 0,
                    }}
                  >
                    <AddIcon />
                  </Box>
                  <Box sx={{ display: "grid", gap: 0.35, textAlign: "left" }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>
                      Добавить счёт-фактуру
                    </Typography>
                    <Typography sx={{ fontSize: 13, lineHeight: 1.45, color: "#475569" }}>
                      Нажми, чтобы выбрать ещё изображения или PDF
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          ) : null}
        </>
      ) : null}
    </>
  );
}

function FormOther_new({ page, type_edit, type_doc }) {
  const [
    bill,
    type,
    date_items,
    changeDateRange,
    users,
    user,
    changeAutocomplite,
    comment,
    changeInput,
    changeItemChecked,
    is_new_doc,
    comment_bux,
    delete_text,
  ] = useStore((state) => [
    state.bill,
    state.type,
    state.date_items,
    state.changeDateRange,
    state.users,
    state.user,
    state.changeAutocomplite,
    state.comment,
    state.changeInput,
    state.changeItemChecked,
    state.is_new_doc,
    state.comment_bux,
    state.delete_text,
  ]);
  const hasAccountantComment = Boolean(comment_bux?.toString().trim());

  return (
    <>
      {page !== "new" && hasAccountantComment ? (
        <Grid
          size={{
            xs: 12,
            sm: 12,
          }}
        >
          <Box sx={billingAccountantCommentHighlightSx}>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#92400e",
              }}
            >
              Комментарий бухгалтера
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: 16, sm: 17 },
                lineHeight: 1.5,
                fontWeight: 600,
                color: "#111827",
                wordBreak: "break-word",
              }}
            >
              {comment_bux}
            </Typography>
          </Box>
        </Grid>
      ) : null}
      {parseInt(type) === 1 ? null : type_doc === "bill_ex" ? null : (
        <>
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <MyDatePickerNew
              label="Дата разгрузки"
              format="DD-MM-YYYY"
              disabled={type_edit === "edit" ? false : true}
              value={date_items}
              func={(event) => changeDateRange(event, "date_items")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <MyAutocomplite
              data={users}
              multiple={true}
              disabled={type_edit === "edit" ? false : true}
              value={user}
              func={(event, data) => changeAutocomplite("user", data)}
              label={"Сотрудники"}
            />
          </Grid>
        </>
      )}
      <Grid
        size={{
          xs: 12,
          sm: 12,
        }}
      >
        <MyTextInput
          label="Комментарии"
          multiline={true}
          disabled={type_edit === "edit" ? false : true}
          maxRows={3}
          value={comment}
          func={(event) => changeInput(event, "comment")}
        />
      </Grid>
      {page === "new" ? null : (
        <>
          <Grid
            style={{ display: "flex", marginBottom: 20 }}
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <Typography style={{ fontWeight: "bold", color: "#9e9e9e" }}>
              Причина удаления:&nbsp;
            </Typography>
            <Typography>{delete_text}</Typography>
          </Grid>
        </>
      )}
      {bill?.comment_gen_dir?.length > 0 ? (
        <Grid
          style={{ display: "flex", marginBottom: 20 }}
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <Typography style={{ fontWeight: "bold", color: "#9e9e9e" }}>
            Комментарии Отдела закупки:&nbsp;
          </Typography>
          <Typography>{bill?.comment_gen_dir}</Typography>
        </Grid>
      ) : null}
      <Grid
        size={{
          xs: 12,
          sm: 12,
        }}
        sx={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <MyCheckBox
          disabled={type_edit === "edit" ? false : true}
          value={parseInt(is_new_doc) === 1 ? true : false}
          func={(event) => changeItemChecked(event, "is_new_doc")}
          label="Поставщик привезет новый документ"
        />
      </Grid>
    </>
  );
}

function MyTooltip(props) {
  const { children, name, ...other } = props;

  return (
    <Tooltip
      title={name}
      arrow
      placement="bottom-start"
      {...other}
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: "#fff",
            color: "#000",
            fontSize: 16,
            border: "0.5px solid rgba(0, 0, 0, 0.87)",
            "& .MuiTooltip-arrow": {
              color: "#fff",
              "&::before": {
                backgroundColor: "white",
                border: "0.5px solid black",
              },
            },
          },
        },
      }}
    >
      {children}
    </Tooltip>
  );
}

function unwrapBillingHistoryValue(value) {
  if (value && typeof value === "object" && Object.prototype.hasOwnProperty.call(value, "color")) {
    return value.key;
  }

  return value;
}

function getBillingHistoryValueState(value) {
  if (value && typeof value === "object" && Object.prototype.hasOwnProperty.call(value, "color")) {
    return value.color;
  }

  return null;
}

function formatBillingHistoryDocumentDate(value) {
  const rawValue = unwrapBillingHistoryValue(value);

  if (!normalizeBillingText(rawValue).length) {
    return "—";
  }

  return getBillingHistoryValueState(value) ? rawValue : formatDateReverse(rawValue);
}

function getBillingHistoryCellTone(value) {
  const state = getBillingHistoryValueState(value);

  if (state === "del") {
    return {
      backgroundColor: "rgba(248, 113, 113, 0.1)",
      color: "#991b1b",
      textDecoration: "line-through",
    };
  }

  if (state === "true") {
    return {
      backgroundColor: "rgba(245, 158, 11, 0.12)",
      color: "#92400e",
    };
  }

  return null;
}

function getBillingHistoryChangeStats(items = []) {
  return items.reduce(
    (stats, row) => {
      const states = Object.values(row)
        .map((value) => getBillingHistoryValueState(value))
        .filter(Boolean);

      if (!states.length) {
        return stats;
      }

      if (states.includes("del")) {
        stats.removed += 1;
      } else {
        stats.changed += 1;
      }

      return stats;
    },
    { changed: 0, removed: 0 },
  );
}

function Billing_Accordion({ bill_list, bill_type }) {
  const hasHistory = Array.isArray(bill_list) && bill_list.length > 0;

  return (
    <Grid
      size={{
        xs: 12,
        sm: 12,
      }}
    >
      {!hasHistory ? (
        <Box
          sx={{
            borderRadius: "24px",
            border: "1px dashed rgba(148, 163, 184, 0.3)",
            backgroundColor: "rgba(248, 250, 252, 0.85)",
            px: { xs: 2.5, md: 3 },
            py: { xs: 2.75, md: 3.25 },
          }}
        >
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 700,
              color: "#111827",
            }}
          >
            История пока пуста
          </Typography>
          <Typography
            sx={{
              mt: 0.75,
              maxWidth: 640,
              color: "#6b7280",
              fontSize: 15,
              lineHeight: 1.65,
            }}
          >
            Когда по документу появятся изменения, здесь будут показаны версии накладной и
            расхождения по товарам.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          {bill_list.map((item, index) => (
            <Billing_Accordion_item
              key={index}
              bill={item}
              index={index}
              bill_list={bill_list}
              bill_type={bill_type}
            />
          ))}
        </Box>
      )}
    </Grid>
  );
}

// Аккродион с данными сравнение для выделение изменений в истории
function Billing_Accordion_item({ bill_list, bill, index, bill_type }) {
  const item = JSON.parse(JSON.stringify(bill));

  if (parseInt(index) !== 0) {
    let item_old = JSON.parse(JSON.stringify(bill_list[index - 1]));

    for (let key in item) {
      if (key === "base_id" && item[key] !== item_old[key]) {
        item[key] = { key: item[key], color: "true" };
      }

      if (key === "number" && item[key] !== item_old[key]) {
        item[key] = { key: item[key], color: "true" };
      }

      if (parseInt(bill_type) === 1) {
        if (key === "date" && formatDateReverse(item[key]) !== formatDateReverse(item_old[key])) {
          item[key] = { key: formatDateReverse(item[key]), color: "true" };
        }
      } else {
        if (
          key === "date_create" &&
          formatDateReverse(item[key]) !== formatDateReverse(item_old[key])
        ) {
          item[key] = { key: formatDateReverse(item[key]), color: "true" };
        }
      }

      if (key === "items") {
        item.items = item.items
          .reduce((newList, item) => {
            const it_old = item_old.items.find(
              (it) => parseInt(it.item_id) === parseInt(item.item_id),
            );

            if (it_old) {
              for (let key in item) {
                if (item[key] !== it_old[key]) {
                  item[key] = { key: item[key], color: "true" };
                }
              }
            } else {
              for (let key in item) {
                item[key] = { key: item[key], color: "true" };
              }
            }

            return (newList = [...newList, ...[item]]);
          }, [])
          .concat(
            item_old.items.filter((it) => {
              if (!item.items.find((item) => parseInt(item.item_id) === parseInt(it.item_id))) {
                for (let key in it) {
                  it[key] = { key: it[key], color: "del" };
                }
                return it;
              }
            }),
          );
      }
    }
  }

  let date_create = "";

  if (parseInt(bill_type) === 1) {
    date_create = item.date;
  } else {
    date_create = item.date_create;
  }

  const accentColor = normalizeBillingText(item.color) || "#f59e0b";
  const documentNumber = unwrapBillingHistoryValue(item.number) || "—";
  const documentDate = formatBillingHistoryDocumentDate(date_create);
  const summaryAmount = formatBillingCurrency(item.sum_w_nds);
  const updatedAtDate = formatDateReverse(item.date_update);
  const updatedAtTime = item.time_update || "";
  const updatedAt = [updatedAtDate, updatedAtTime].filter(Boolean).join(", ") || "—";
  const changeStats = getBillingHistoryChangeStats(item?.items);
  const hasDiffs = changeStats.changed > 0 || changeStats.removed > 0;
  const summaryMeta = [
    {
      label: "Создатель",
      value: item.creator_id || "—",
    },
    {
      label: "Редактор",
      value: item.editor_id || "—",
    },
    {
      label: "Обновлено",
      value: updatedAt,
    },
    {
      label: "Сумма",
      value: summaryAmount,
      numeric: true,
    },
  ];

  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        borderRadius: "24px !important",
        border: "1px solid rgba(148, 163, 184, 0.18)",
        background:
          "linear-gradient(180deg, rgba(255, 255, 255, 0.99) 0%, rgba(250, 247, 243, 0.98) 100%)",
        boxShadow: "0 14px 30px rgba(15, 23, 42, 0.06)",
        overflow: "hidden",
        "&:before": {
          display: "none",
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        sx={{
          px: 0,
          minHeight: "unset !important",
          alignItems: { xs: "flex-start", md: "center" },
          "& .MuiAccordionSummary-content": {
            my: 0,
          },
          "& .MuiAccordionSummary-expandIconWrapper": {
            mr: 2,
            color: "#64748b",
            alignSelf: { xs: "flex-start", md: "center" },
            mt: { xs: 1.5, md: 0 },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: { xs: 1.5, md: 2.25 },
            width: "100%",
            py: { xs: 1.75, md: 2.5 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", lg: "row" },
              alignItems: { xs: "stretch", lg: "flex-start" },
              gap: { xs: 1.5, md: 2.25 },
              width: "100%",
            }}
          >
            <Box
              sx={{
                flex: { xs: "0 0 auto", lg: "1 1 340px" },
                minWidth: 0,
                pl: { xs: 1.5, md: 2.75 },
                pr: { xs: 1.5, md: 1 },
                borderLeft: `4px solid ${accentColor}`,
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: 18, md: 22 },
                  lineHeight: 1.15,
                  fontWeight: 800,
                  color: "#111827",
                }}
              >
                {item.name || "Версия документа"}
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
                sx={{ mt: 1 }}
              >
                <Chip
                  size="small"
                  label={`№ ${documentNumber}`}
                  sx={{
                    borderRadius: "999px",
                    backgroundColor: "rgba(15, 23, 42, 0.05)",
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                />
                <Chip
                  size="small"
                  label={documentDate}
                  sx={{
                    borderRadius: "999px",
                    backgroundColor: "rgba(15, 23, 42, 0.05)",
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                />
                {!hasDiffs ? (
                  <Chip
                    size="small"
                    label="Исходная версия"
                    sx={{
                      borderRadius: "999px",
                      backgroundColor: "rgba(2, 132, 199, 0.1)",
                      color: "#075985",
                      fontWeight: 700,
                    }}
                  />
                ) : null}
                {changeStats.changed > 0 ? (
                  <Chip
                    size="small"
                    label={`Изменено позиций: ${changeStats.changed}`}
                    sx={{
                      borderRadius: "999px",
                      backgroundColor: "rgba(245, 158, 11, 0.14)",
                      color: "#92400e",
                      fontWeight: 700,
                    }}
                  />
                ) : null}
                {changeStats.removed > 0 ? (
                  <Chip
                    size="small"
                    label={`Удалено позиций: ${changeStats.removed}`}
                    sx={{
                      borderRadius: "999px",
                      backgroundColor: "rgba(248, 113, 113, 0.14)",
                      color: "#991b1b",
                      fontWeight: 700,
                    }}
                  />
                ) : null}
              </Stack>
            </Box>

            <Box
              sx={{
                flex: { xs: "0 0 auto", lg: "1 1 540px" },
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  md: `repeat(${summaryMeta.length}, minmax(0, 1fr))`,
                },
                gap: { xs: 0.75, md: 1.25 },
                px: { xs: 1.5, md: 2.75 },
              }}
            >
              {summaryMeta.map((meta) => (
                <Box
                  key={meta.label}
                  sx={{
                    minHeight: { xs: "auto", md: 42 },
                    borderRadius: { xs: "14px", md: "16px" },
                    border: "1px solid rgba(148, 163, 184, 0.16)",
                    backgroundColor: "rgba(255, 255, 255, 0.72)",
                    px: { xs: 1.1, md: 1.25 },
                    py: { xs: 0.8, md: 0.75 },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    gap: 0.2,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: 10, md: 11 },
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      whiteSpace: "nowrap",
                      lineHeight: 1,
                      color: "#94a3b8",
                    }}
                  >
                    {meta.label}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0,
                      fontSize: { xs: 13, md: 14 },
                      lineHeight: 1.2,
                      fontWeight: meta.numeric ? 800 : 700,
                      color: "#0f172a",
                      textAlign: "left",
                      fontVariantNumeric: meta.numeric ? "tabular-nums lining-nums" : undefined,
                      fontFeatureSettings: meta.numeric ? '"tnum" 1, "lnum" 1' : undefined,
                    }}
                  >
                    {meta.value || "—"}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          px: { xs: 2.25, md: 2.75 },
          pt: 0,
          pb: { xs: 2.5, md: 2.75 },
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          sx={{ mb: 2 }}
        >
          <Chip
            size="small"
            label="Жёлтым подсвечены изменённые значения"
            sx={{
              borderRadius: "999px",
              backgroundColor: "rgba(245, 158, 11, 0.14)",
              color: "#92400e",
            }}
          />
          <Chip
            size="small"
            label="Красным отмечены удалённые строки"
            sx={{
              borderRadius: "999px",
              backgroundColor: "rgba(248, 113, 113, 0.14)",
              color: "#991b1b",
            }}
          />
        </Stack>

        <Typography
          sx={{
            mb: 1.25,
            fontSize: 18,
            fontWeight: 800,
            color: "#0f172a",
          }}
        >
          Позиции в этой версии
        </Typography>

        <TableContainer
          component={Paper}
          elevation={0}
          sx={billingTableContainerSx}
        >
          <Table sx={{ ...billingTableSx, minWidth: { xs: 760, md: "100%" } }}>
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: 800 } }}>
                <TableCell>Товар</TableCell>
                <TableCell sx={billingNumericHeaderCellSx}>Объем упак.</TableCell>
                <TableCell sx={billingNumericHeaderCellSx}>Кол-во упак.</TableCell>
                <TableCell sx={billingNumericHeaderCellSx}>Кол-во</TableCell>
                <TableCell sx={billingNumericHeaderCellSx}>Сумма с НДС</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {item?.items?.map((itemRow, key) => {
                const nameTone = getBillingHistoryCellTone(itemRow.name);
                const pqTone = getBillingHistoryCellTone(itemRow.pq);
                const countTone = getBillingHistoryCellTone(itemRow.count);
                const factCountTone = getBillingHistoryCellTone(itemRow.fact_count);
                const priceTone = getBillingHistoryCellTone(itemRow.price_w_nds);

                return (
                  <TableRow
                    key={key}
                    hover
                    sx={{
                      "& td": {
                        borderColor: "rgba(148, 163, 184, 0.14)",
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        ...(nameTone ?? {}),
                        fontWeight: nameTone ? 700 : 500,
                      }}
                    >
                      {unwrapBillingHistoryValue(itemRow.name) || "—"}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...billingNumericCellSx,
                        ...(pqTone ?? {}),
                      }}
                    >
                      {formatBillingQuantityWithUnit(
                        unwrapBillingHistoryValue(itemRow.pq),
                        unwrapBillingHistoryValue(itemRow.ei_name),
                      )}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...billingNumericCellSx,
                        ...(countTone ?? {}),
                      }}
                    >
                      {formatBillingQuantity(unwrapBillingHistoryValue(itemRow.count))}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...billingNumericCellSx,
                        ...(factCountTone ?? {}),
                      }}
                    >
                      {formatBillingQuantityWithUnit(
                        unwrapBillingHistoryValue(itemRow.fact_count),
                        unwrapBillingHistoryValue(itemRow.ei_name),
                      )}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...billingNumericCellSx,
                        ...(priceTone ?? {}),
                        fontWeight: priceTone ? 800 : 700,
                      }}
                    >
                      {formatBillingCurrency(unwrapBillingHistoryValue(itemRow.price_w_nds))}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          sx={{
            mt: 2.25,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              borderRadius: "18px",
              border: "1px solid rgba(148, 163, 184, 0.16)",
              backgroundColor: "rgba(255, 255, 255, 0.72)",
              px: 2,
              py: 1.75,
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#94a3b8",
              }}
            >
              Номер документа
            </Typography>
            <Typography
              sx={{
                mt: 0.65,
                fontSize: 16,
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              {documentNumber}
            </Typography>
          </Box>

          <Box
            sx={{
              borderRadius: "18px",
              border: "1px solid rgba(148, 163, 184, 0.16)",
              backgroundColor: "rgba(255, 255, 255, 0.72)",
              px: 2,
              py: 1.75,
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#94a3b8",
              }}
            >
              Дата документа
            </Typography>
            <Typography
              sx={{
                mt: 0.65,
                fontSize: 16,
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              {documentDate}
            </Typography>
          </Box>

          <Box
            sx={{
              borderRadius: "18px",
              border: "1px solid rgba(148, 163, 184, 0.16)",
              backgroundColor: "rgba(255, 255, 255, 0.72)",
              px: 2,
              py: 1.75,
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#94a3b8",
              }}
            >
              Документ основание
            </Typography>
            <Typography
              sx={{
                mt: 0.65,
                fontSize: 16,
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              {unwrapBillingHistoryValue(item.base_id) || "—"}
            </Typography>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}

// модалка просмотра фото/картинок документов
const ZOOM_STEP = 0.2; // 0..1
class Billing_Modal extends React.Component {
  static imageStateCache = new Map();

  getDefaultViewerState = () => ({
    drag: { x: 0, y: 0 },
    rotate: 0,
    scaleX: 1,
    scaleY: 1,
    vertical: false,
    horizontal: true,
    initialScaleSet: false,
  });

  getImageCacheKey = (src) => String(src ?? "").split("?")[0];

  getInitialViewerState = (imageSrc) => {
    const cacheKey = this.getImageCacheKey(imageSrc);
    const cached = Billing_Modal.imageStateCache.get(cacheKey);

    if (!cached) {
      return this.getDefaultViewerState();
    }

    return {
      ...cached,
      drag: cached?.drag ?? { x: 0, y: 0 },
    };
  };

  constructor(props) {
    super(props);

    this.state = this.getInitialViewerState(props.image);
    this.containerRef = React.createRef();
  }

  cacheViewerState = (imageSrc = this.props.image) => {
    const cacheKey = this.getImageCacheKey(imageSrc);

    if (!cacheKey.length) {
      return;
    }

    Billing_Modal.imageStateCache.set(cacheKey, {
      drag: this.state.drag,
      rotate: this.state.rotate,
      scaleX: this.state.scaleX,
      scaleY: this.state.scaleY,
      vertical: this.state.vertical,
      horizontal: this.state.horizontal,
      initialScaleSet: this.state.initialScaleSet,
    });
  };

  getImageEntries = () => (Array.isArray(this.props.imageEntries) ? this.props.imageEntries : []);

  getCurrentImageIndex = () => {
    const currentImage = String(this.props.image ?? "");

    return this.getImageEntries().findIndex((entry) => String(entry?.url ?? "") === currentImage);
  };

  goToImageByOffset = (offset) => {
    const imageEntries = this.getImageEntries();

    if (imageEntries.length <= 1 || !this.props.onNavigateImage) {
      return;
    }

    const currentIndex = this.getCurrentImageIndex();
    const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = safeCurrentIndex + offset;

    if (nextIndex < 0 || nextIndex >= imageEntries.length) {
      return;
    }

    const nextEntry = imageEntries[nextIndex];

    if (!nextEntry?.url) {
      return;
    }

    this.cacheViewerState();
    this.props.onNavigateImage(nextEntry, nextIndex);
  };

  goToPrevImage = () => {
    this.goToImageByOffset(-1);
  };

  goToNextImage = () => {
    this.goToImageByOffset(1);
  };

  componentDidMount() {
    window.addEventListener("keydown", this.handleKeyDown);
    this.props.store.set_position(this.state.horizontal, this.state.vertical);
    scrollToBillingCompareForm();
    this.loadImageDimensions(this.props.image);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown);
    this.cacheViewerState();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.getImageCacheKey(prevProps.image) !== this.getImageCacheKey(this.props.image)) {
      this.cacheViewerState(prevProps.image);

      const nextViewerState = this.getInitialViewerState(this.props.image);

      this.setState(nextViewerState, () => {
        this.props.store.set_position(nextViewerState.horizontal, nextViewerState.vertical);
        this.loadImageDimensions(this.props.image);
      });
    }

    if (
      prevState.vertical !== this.state.vertical ||
      prevState.horizontal !== this.state.horizontal
    ) {
      requestAnimationFrame(() => {
        this.setState(
          {
            drag: { x: 0, y: 0 },
            initialScaleSet: false,
          },
          () => {
            this.tryComputeInitialScale();
          },
        );
      });
    }
  }

  handleKeyDown = (event) => {
    const activeElement = document?.activeElement;
    const activeTagName = String(activeElement?.tagName ?? "").toLowerCase();
    const isTextEditing =
      activeTagName === "input" ||
      activeTagName === "textarea" ||
      activeTagName === "select" ||
      Boolean(activeElement?.isContentEditable);

    if (event.key === "Escape") {
      this.props.onClose();
      return;
    }

    if (event.key === "ArrowLeft") {
      if (!isTextEditing) {
        event.preventDefault();
        this.goToPrevImage();
      }
      return;
    }

    if (event.key === "ArrowRight") {
      if (!isTextEditing) {
        event.preventDefault();
        this.goToNextImage();
      }
      return;
    }

    if (event.key === "0") {
      this.reset();
      return;
    }

    if (event.key === "+" || event.key === "=") {
      this.setZoomIn();
      return;
    }

    if (event.key === "-") {
      this.setZoomOut();
    }
  };

  loadImageDimensions(src) {
    const img = new Image();
    img.onload = () => {
      this.imageNaturalWidth = img.naturalWidth;
      this.imageNaturalHeight = img.naturalHeight;
      this.tryComputeInitialScale();
    };
    img.src = src;
  }

  getFitScale() {
    const container = this.containerRef.current;

    if (!container || !this.imageNaturalWidth || !this.imageNaturalHeight) {
      return 1;
    }

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    if (!containerWidth || !containerHeight) {
      return 1;
    }

    const widthScale =
      (containerWidth * (this.state.horizontal ? 0.72 : 0.86)) / this.imageNaturalWidth;
    const heightScale =
      (containerHeight * (this.state.horizontal ? 0.9 : 0.82)) / this.imageNaturalHeight;
    const nextScale = this.state.horizontal
      ? Math.max(heightScale, widthScale * 0.78)
      : Math.min(widthScale, heightScale);

    if (!Number.isFinite(nextScale) || nextScale <= 0) {
      return 1;
    }

    return Math.min(Math.max(0.15, nextScale), this.state.horizontal ? 1.15 : 5);
  }

  tryComputeInitialScale() {
    if (this.state.initialScaleSet) return;

    const baseScale = this.getFitScale();

    this.setState({
      scaleX: baseScale,
      scaleY: baseScale,
      initialScaleSet: true,
    });
  }

  setLeftRotate() {
    this.setState((prevState) => ({
      rotate: prevState.rotate - 90,
    }));
  }

  setRigthRotate() {
    this.setState((prevState) => ({
      rotate: prevState.rotate + 90,
    }));
  }

  setScaleHorizontal() {
    this.setState((prevState) => ({
      rotate: prevState.rotate + 180,
    }));
  }

  setScaleVertical() {
    this.setState((prevState) => ({
      rotate: prevState.rotate - 180,
    }));
  }

  setZoomIn() {
    this.setState((prevState) => ({
      scaleX: Math.min(prevState.scaleX + ZOOM_STEP, 5),
      scaleY: Math.min(prevState.scaleY + ZOOM_STEP, 5),
    }));
  }

  setZoomOut() {
    this.setState((prevState) => ({
      scaleX: Math.max(prevState.scaleX - ZOOM_STEP, ZOOM_STEP),
      scaleY: Math.max(prevState.scaleY - ZOOM_STEP, ZOOM_STEP),
    }));
  }

  setSplitVertical() {
    const nextVertical = !this.state.vertical;

    this.props.store.set_position(false, nextVertical);
    if (nextVertical) {
      scrollToBillingCompareForm();
    }

    this.setState({
      vertical: nextVertical,
      horizontal: false,
    });
  }

  setSplitHorizontal() {
    const nextHorizontal = !this.state.horizontal;

    this.props.store.set_position(nextHorizontal, false);
    if (nextHorizontal) {
      scrollToBillingCompareForm();
    }

    this.setState({
      horizontal: nextHorizontal,
      vertical: false,
    });
  }

  reset() {
    const fitScale = this.getFitScale();

    this.setState({
      drag: { x: 0, y: 0 },
      rotate: 0,
      scaleX: fitScale,
      scaleY: fitScale,
      initialScaleSet: true,
    });
  }

  renderActionButton({ label, icon, onClick, isDanger = false }) {
    return (
      <MyTooltip name={label}>
        <IconButton
          onClick={onClick}
          sx={{
            width: 42,
            height: 42,
            borderRadius: "14px",
            backgroundColor: isDanger ? "#ef4444" : "rgba(255,255,255,0.9)",
            color: isDanger ? "#fff" : "#334155",
            border: isDanger ? "none" : "1px solid rgba(148, 163, 184, 0.22)",
            boxShadow: "0 10px 22px rgba(15, 23, 42, 0.12)",
            "&:hover": {
              backgroundColor: isDanger ? "#dc2626" : "#ffffff",
            },
          }}
        >
          {icon}
        </IconButton>
      </MyTooltip>
    );
  }

  stopViewerEvent = (event) => {
    event.stopPropagation();
  };

  render() {
    const imageEntries = this.getImageEntries();
    const currentImageIndex = this.getCurrentImageIndex();
    const hasImageNavigation = imageEntries.length > 1;
    const canGoPrev = hasImageNavigation && currentImageIndex > 0;
    const canGoNext =
      hasImageNavigation && currentImageIndex >= 0 && currentImageIndex < imageEntries.length - 1;
    const isSplitMode = this.state.vertical || this.state.horizontal;
    const viewerSx = isSplitMode
      ? this.state.vertical
        ? {
            top: { xs: 16, md: 24 },
            right: { xs: 12, md: 24 },
            bottom: { xs: 12, md: 24 },
            width: { xs: "calc(100vw - 24px)", md: "48vw" },
            borderRadius: "28px",
          }
        : {
            left: { xs: 12, md: 24 },
            right: { xs: 12, md: 24 },
            bottom: { xs: 12, md: 24 },
            height: { xs: "52dvh", md: "48vh" },
            borderRadius: "28px",
          }
      : {
          inset: 0,
          borderRadius: 0,
        };
    const zoomPercent = `${Math.round(Math.max(this.state.scaleX, this.state.scaleY) * 100)}%`;

    return (
      <DndContext
        onDragEnd={({ delta }) => {
          this.setState((prev) => ({
            drag: {
              x: prev.drag.x + delta.x,
              y: prev.drag.y + delta.y,
            },
          }));
        }}
      >
        <Paper
          onClick={this.stopViewerEvent}
          onMouseDown={this.stopViewerEvent}
          elevation={0}
          sx={{
            position: "fixed",
            top: { xs: 12, md: 18 },
            right: { xs: 12, md: 18 },
            zIndex: 2002,
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
            px: 1,
            py: 1,
            borderRadius: "22px",
            backgroundColor: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.24)",
            boxShadow: "0 18px 36px rgba(15, 23, 42, 0.16)",
          }}
        >
          {this.props.isDelImg === true
            ? this.renderActionButton({
                label: "Удалить изображение",
                icon: <DeleteForeverIcon />,
                onClick: this.props.delImg.bind(this, this.props.image),
                isDanger: true,
              })
            : null}
          {this.renderActionButton({
            label: "Повернуть влево",
            icon: <RotateLeftIcon />,
            onClick: this.setLeftRotate.bind(this),
          })}
          {this.renderActionButton({
            label: "Повернуть вправо",
            icon: <RotateRightIcon />,
            onClick: this.setRigthRotate.bind(this),
          })}
          {this.renderActionButton({
            label: "Развернуть на 180°",
            icon: <ContrastIcon />,
            onClick: this.setScaleVertical.bind(this),
          })}
          {this.renderActionButton({
            label: "Уменьшить",
            icon: <ZoomOutIcon />,
            onClick: this.setZoomOut.bind(this),
          })}
          {this.renderActionButton({
            label: "Увеличить",
            icon: <ZoomInIcon />,
            onClick: this.setZoomIn.bind(this),
          })}
          {!hasImageNavigation
            ? null
            : this.renderActionButton({
                label: "Предыдущее изображение",
                icon: <ArrowBackIosNewIcon fontSize="small" />,
                onClick: this.goToPrevImage,
              })}
          {!hasImageNavigation
            ? null
            : this.renderActionButton({
                label: "Следующее изображение",
                icon: <ArrowForwardIosIcon fontSize="small" />,
                onClick: this.goToNextImage,
              })}
          {this.renderActionButton({
            label: isSplitMode ? "Развернуть на весь экран" : "Сравнить с формой",
            icon: <HorizontalSplitIcon />,
            onClick: this.setSplitHorizontal.bind(this),
          })}
          {this.renderActionButton({
            label: "Подогнать и сбросить",
            icon: <RestartAltIcon />,
            onClick: this.reset.bind(this),
          })}
          {this.renderActionButton({
            label: "Закрыть",
            icon: <CloseIcon />,
            onClick: this.props.onClose.bind(this),
          })}
        </Paper>

        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            pointerEvents: "none",
          }}
        >
          {!isSplitMode ? (
            <Box
              onClick={this.props.onClose.bind(this)}
              sx={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(2, 6, 23, 0.74)",
                backdropFilter: "blur(10px)",
                pointerEvents: "auto",
              }}
            />
          ) : null}

          <Box
            ref={this.containerRef}
            onClick={!isSplitMode ? this.props.onClose.bind(this) : undefined}
            sx={{
              position: "absolute",
              overflow: "hidden",
              background:
                "radial-gradient(circle at top, rgba(255,255,255,0.08), transparent 30%), rgba(2, 6, 23, 0.94)",
              boxShadow: "0 24px 60px rgba(2, 6, 23, 0.42)",
              border: isSplitMode ? "1px solid rgba(255,255,255,0.1)" : "none",
              pointerEvents: "auto",
              ...viewerSx,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 16%, rgba(255,255,255,0.03) 100%)",
              }}
            />
            {!hasImageNavigation ? null : (
              <>
                <IconButton
                  onClick={this.goToPrevImage}
                  disabled={!canGoPrev}
                  sx={{
                    position: "absolute",
                    left: { xs: 8, md: 14 },
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 1002,
                    width: 44,
                    height: 78,
                    borderRadius: "16px",
                    backgroundColor: "rgba(15, 23, 42, 0.42)",
                    color: "#fff",
                    pointerEvents: "auto",
                    border: "1px solid rgba(255,255,255,0.14)",
                    "&:hover": {
                      backgroundColor: "rgba(15, 23, 42, 0.62)",
                    },
                    "&.Mui-disabled": {
                      color: "rgba(255,255,255,0.38)",
                      backgroundColor: "rgba(15, 23, 42, 0.26)",
                      borderColor: "rgba(255,255,255,0.08)",
                    },
                  }}
                >
                  <ArrowBackIosNewIcon />
                </IconButton>
                <IconButton
                  onClick={this.goToNextImage}
                  disabled={!canGoNext}
                  sx={{
                    position: "absolute",
                    right: { xs: 8, md: 14 },
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 1002,
                    width: 44,
                    height: 78,
                    borderRadius: "16px",
                    backgroundColor: "rgba(15, 23, 42, 0.42)",
                    color: "#fff",
                    pointerEvents: "auto",
                    border: "1px solid rgba(255,255,255,0.14)",
                    "&:hover": {
                      backgroundColor: "rgba(15, 23, 42, 0.62)",
                    },
                    "&.Mui-disabled": {
                      color: "rgba(255,255,255,0.38)",
                      backgroundColor: "rgba(15, 23, 42, 0.26)",
                      borderColor: "rgba(255,255,255,0.08)",
                    },
                  }}
                >
                  <ArrowForwardIosIcon />
                </IconButton>
              </>
            )}
            <DraggableImage
              scaleX={this.state.scaleX}
              scaleY={this.state.scaleY}
              image={this.props.image}
              rotate={this.state.rotate}
              x={this.state.drag.x}
              y={this.state.drag.y}
            />
            <Box
              sx={{
                position: "absolute",
                left: { xs: 12, md: 18 },
                bottom: { xs: 12, md: 18 },
                px: 1.25,
                py: 0.9,
                borderRadius: "16px",
                backgroundColor: "rgba(15, 23, 42, 0.58)",
                backdropFilter: "blur(8px)",
                color: "rgba(255,255,255,0.9)",
                fontSize: 13,
                lineHeight: 1.45,
                pointerEvents: "none",
              }}
            >
              Потяни изображение внутри области просмотра, чтобы сверить документ с данными.
            </Box>
          </Box>
        </Box>
      </DndContext>
    );
  }
}

class Billing_Edit_ extends React.Component {
  isClick = false;
  isRedirectingAfterSave = false;
  ocrDropzone = null;

  constructor(props) {
    super(props);

    this.state = {
      module: "billing",
      module_name: "",
      is_load: false,
      isSavingAction: false,
      isUploadProcessing: false,
      uploadBackdropMeta: {
        mainFiles: 0,
        facturFiles: 0,
      },
      saveNoticeOpen: false,
      saveNoticeText: "",
      saveNoticeSeverity: "warning",
      saveNoticeKey: 0,

      acces: null,
      type_doc: "",
      isOcrLoad: false,
      mainDropzoneFilesCount: 0,
      ocrImageFilesCount: 0,
      ocrResolveDialog: false,
      ocrResolveItems: [],

      modelCheckDel: false,
      modelCheckDelImg: false,
      modelChecReturn: false,
      modelCheckErrItems: false,
      modelCheckDel1c: false,
      modelCheckPrice: false,
      modelCheckBuxComment: false,

      items_err: [],
      thisTypeSave: "",

      imgDel: "",
      delText: "",
    };
  }

  startSaveAction = () => {
    this.isClick = true;
    this.setState({
      isSavingAction: true,
    });
  };

  canStartSaveAction = () => {
    return !(
      this.isClick ||
      this.isRedirectingAfterSave ||
      this.state.isSavingAction ||
      this.state.isUploadProcessing
    );
  };

  lockSaveActionUntilRedirect = (nextState = {}) => {
    this.isClick = true;
    this.isRedirectingAfterSave = true;
    this.setState({
      isSavingAction: true,
      isUploadProcessing: false,
      ...nextState,
    });
  };

  finishSaveAction = (nextState = {}) => {
    this.isClick = false;
    this.isRedirectingAfterSave = false;
    this.setState({
      isSavingAction: false,
      ...nextState,
    });
  };

  showSaveNotice = (text, severity = "warning") => {
    this.setState({
      saveNoticeOpen: true,
      saveNoticeText: text,
      saveNoticeSeverity: severity,
      saveNoticeKey: Date.now(),
    });
  };

  closeSaveNotice = (_, reason) => {
    if (reason === "clickaway") {
      return;
    }

    this.setState({
      saveNoticeOpen: false,
    });
  };

  async componentDidMount() {
    const { clearForm } = this.props.store;

    clearForm();
    this.setState({
      thisTypeSave: "",
    });

    let data_bill = window.location.pathname;

    data_bill = data_bill.split("/");

    const bill = {
      id: data_bill[3],
      point_id: data_bill[4],
      type: data_bill[2],
    };

    let res;

    if (bill.type === "bill") {
      res = await this.getData("get_one", bill);
    } else {
      res = await this.getData("get_one_bill_ex", bill);
    }

    //console.log("🚀 === componentDidMount res:", res);

    const points = await this.getData("get_points");

    const point = points.points.find((point) => point.id === res.bill.point_id);

    const data = {
      point_id: bill["point_id"],
      vendor_id: res?.vendors[0]?.id,
    };

    const nextAcces = res?.upd_access ?? null;

    this.setState({
      acces: nextAcces,
      type_doc: data_bill[2],
    });

    const items = await this.getData("get_vendor_items", data);
    const docs = await this.getData("get_base_doc", data);

    const { getDataBill, setAcces } = this.props.store;

    setAcces(nextAcces);
    getDataBill(res, point, items.items, docs);
    const accountantComment = res?.bill?.com_bux?.toString().trim();
    const billStatus = parseInt(res?.bill?.status ?? res?.bill?.type);
    const isCreatedBill = billStatus === 2;

    if (accountantComment && isCreatedBill) {
      this.setState({
        modelCheckBuxComment: true,
      });
    }

    document.title = "Накладные";

    setTimeout(() => {
      this.bindOcrDropzoneEvents(this.props.store.DropzoneMain);
    }, 900);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.store.DropzoneMain !== this.props.store.DropzoneMain) {
      this.bindOcrDropzoneEvents(this.props.store.DropzoneMain);
    }
  }

  componentWillUnmount() {
    this.isClick = false;
    this.isRedirectingAfterSave = false;
    this.unbindOcrDropzoneEvents();
  }

  getData_old = (method, data = {}) => {
    this.setState({
      is_load: true,
    });

    return fetch("https://jacochef.ru/api/index_new.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: queryString.stringify({
        method: method,
        module: this.state.module,
        version: 2,
        login: localStorage.getItem("token"),
        data: JSON.stringify(data),
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.st === false && json.type == "redir") {
          window.location.pathname = "/";
          return;
        }

        if (json.st === false && json.type == "auth") {
          window.location.pathname = "/auth";
          return;
        }

        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 300);

        return json;
      })
      .catch((err) => {
        console.log(err);
      });
  };

  getData = (method, data = {}) => {
    this.setState({
      is_load: true,
    });

    let res = api_laravel(this.state.module, method, data)
      .then((result) => result.data)
      .finally(() => {
        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 500);
      });

    return res;
  };

  openMainDropzonePicker = () => {
    if (this.state.mainDropzoneFilesCount >= 10) {
      return;
    }

    this.props.store.DropzoneMain?.hiddenFileInput?.click?.();
  };

  openFacturDropzonePicker = () => {
    this.props.store.DropzoneDop?.hiddenFileInput?.click?.();
  };

  getMainDropzoneFiles = () => {
    const dropzoneFiles = this.props.store.DropzoneMain?.files ?? [];

    return dropzoneFiles.filter(
      (file) =>
        file && file.accepted !== false && file.status !== "canceled" && file.status !== "error",
    );
  };

  getOcrImageFiles = () => {
    return this.getMainDropzoneFiles().filter((file) => isImageDropzoneFile(file));
  };

  getPendingDropzoneFiles = (dropzone) => {
    if (!dropzone) {
      return [];
    }

    const queuedFiles = dropzone.getQueuedFiles?.() ?? [];
    const uploadingFiles = dropzone.getUploadingFiles?.() ?? [];
    const activeFiles = [...queuedFiles, ...uploadingFiles];

    if (activeFiles.length) {
      return activeFiles;
    }

    const acceptedFiles = dropzone.getAcceptedFiles?.() ?? dropzone.files ?? [];

    return acceptedFiles.filter(
      (file) =>
        file && file.status !== "success" && file.status !== "canceled" && file.status !== "error",
    );
  };

  waitForDropzoneQueue = (dropzone) => {
    const pendingFiles = this.getPendingDropzoneFiles(dropzone);

    if (!dropzone || !pendingFiles.length) {
      return Promise.resolve({ hasErrors: false, filesCount: 0 });
    }

    return new Promise((resolve) => {
      let isResolved = false;

      const finalize = () => {
        if (isResolved) {
          return;
        }

        isResolved = true;

        dropzone.off?.("queuecomplete", handleQueueComplete);

        resolve({
          hasErrors: dropzone.files.some((file) => file?.status === "error"),
          filesCount: pendingFiles.length,
        });
      };

      const handleQueueComplete = () => {
        finalize();
      };

      dropzone.on("queuecomplete", handleQueueComplete);
    });
  };

  getStoredOcrImageNames = () => {
    const { imgs_bill = [] } = this.props.store;

    return imgs_bill.filter((fileName) => isImageFileName(fileName));
  };

  getStoredOcrImageFiles = async () => {
    const imageNames = this.getStoredOcrImageNames();

    if (!imageNames.length) {
      return [];
    }

    const storageBucket = this.state.type_doc === "bill" ? "bill" : "bill-ex-items";

    const files = await Promise.all(
      imageNames.map(async (fileName) => {
        try {
          const params = new URLSearchParams({
            bucket: storageBucket,
            file: fileName,
          });
          const response = await fetch(`/api/storage-file?${params.toString()}`);

          if (!response.ok) {
            throw new Error(`Не удалось получить ${fileName}`);
          }

          const blob = await response.blob();

          return new File([blob], fileName, {
            type: blob.type || getFileMimeType(fileName),
          });
        } catch (error) {
          console.error("Failed to fetch stored OCR image", {
            fileName,
            error,
          });

          return null;
        }
      }),
    );

    return files.filter(Boolean);
  };

  syncDropzoneCounts = () => {
    const mainDropzoneFilesCount = this.getMainDropzoneFiles().length;
    const ocrImageFilesCount = this.getOcrImageFiles().length;

    this.setState((prevState) =>
      prevState.ocrImageFilesCount === ocrImageFilesCount &&
      prevState.mainDropzoneFilesCount === mainDropzoneFilesCount
        ? null
        : {
            mainDropzoneFilesCount,
            ocrImageFilesCount,
          },
    );
  };

  unbindOcrDropzoneEvents = (dropzone = this.ocrDropzone) => {
    if (!dropzone) {
      return;
    }

    ["addedfile", "removedfile", "canceled", "error", "reset"].forEach((eventName) => {
      dropzone.off?.(eventName, this.syncDropzoneCounts);
    });

    if (this.ocrDropzone === dropzone) {
      this.ocrDropzone = null;
    }
  };

  bindOcrDropzoneEvents = (dropzone = this.props.store.DropzoneMain) => {
    if (this.ocrDropzone === dropzone) {
      this.syncDropzoneCounts();
      return;
    }

    this.unbindOcrDropzoneEvents();

    if (!dropzone) {
      this.setState({
        mainDropzoneFilesCount: 0,
        ocrImageFilesCount: 0,
      });
      return;
    }

    this.ocrDropzone = dropzone;

    ["addedfile", "removedfile", "canceled", "error", "reset"].forEach((eventName) => {
      dropzone.off?.(eventName, this.syncDropzoneCounts);
      dropzone.on?.(eventName, this.syncDropzoneCounts);
    });

    this.syncDropzoneCounts();
  };

  clearBillItemsForOcr = () => {
    const { setData } = this.props.store;

    setData({
      bill_items: [],
      allPrice: 0,
      allPrice_w_nds: 0,
      err_items: [],
      search_item: "",
      pq: "",
      count: "",
      fact_unit: "",
      summ: "",
      sum_w_nds: "",
    });

    this.setState({
      items_err: [],
      modelCheckErrItems: false,
      ocrResolveDialog: false,
      ocrResolveItems: [],
    });
  };

  getCurrentVendorItems = async () => {
    const store = this.props.store;
    const storeState = useStore.getState();
    const currentVendorItems = storeState.vendor_itemsCopy?.length
      ? storeState.vendor_itemsCopy
      : storeState.vendor_items;

    if (currentVendorItems?.length) {
      return currentVendorItems;
    }

    if (!storeState.point?.id || !storeState.bill?.vendor_id) {
      return [];
    }

    const res = await store.getData("get_vendor_items", {
      point_id: storeState.point.id,
      vendor_id: storeState.bill.vendor_id,
    });

    const nextVendorItems = res?.items ?? [];

    store.setData({
      vendor_items: nextVendorItems,
      vendor_itemsCopy: nextVendorItems,
      users: res?.users ?? storeState.users,
    });

    return nextVendorItems;
  };

  getOcrResolveState = (ocrItem, selectedProduct = null, selectedPackOption = null) => {
    const resolvedPackOption = getResolvedVendorPackOption(
      selectedProduct,
      ocrItem,
      selectedPackOption,
    );

    return {
      selectedProduct,
      selectedPq: resolvedPackOption,
      resolveIssue: getOcrResolveIssue(ocrItem, selectedProduct, resolvedPackOption),
    };
  };

  addOcrItemToBill = (ocrItem, matchedVendorItem, selectedPackOption = null) => {
    if (!matchedVendorItem) {
      return false;
    }

    const store = this.props.store;
    const resolvedPackOption = getResolvedVendorPackOption(
      matchedVendorItem,
      ocrItem,
      selectedPackOption,
    );

    if (!resolvedPackOption) {
      return false;
    }

    const resolvedPq = normalizeBillingText(resolvedPackOption?.name ?? resolvedPackOption?.id);
    const { count, pq, factUnit } = getOcrQuantityData(ocrItem, resolvedPq);

    if (!normalizeBillingText(count).length || !normalizeBillingText(factUnit).length) {
      return false;
    }

    const priceItem = parseOcrAmount(ocrItem?.total_wo_vat);
    const priceWithVat = parseOcrAmount(ocrItem?.total_with_vat);
    const summNds = parseOcrAmount(ocrItem?.vat_amount);
    const nds =
      formatOcrVatRate(ocrItem?.vat_rate) ||
      (priceItem && priceWithVat && Number(priceItem) > 0
        ? store.check_nds_bill(
            (Number(priceWithVat) - Number(priceItem)) / (Number(priceItem) / 100),
          )
        : "");

    const editableVendorItem = JSON.parse(JSON.stringify(matchedVendorItem));
    const packOptions = Array.isArray(editableVendorItem?.pq_item)
      ? editableVendorItem.pq_item.map((option) => ({
          ...option,
          name: `${option?.name ?? option?.id}`,
        }))
      : [];

    editableVendorItem.pq_item = packOptions;

    store.addItem_fast(
      count,
      factUnit,
      priceItem,
      priceWithVat,
      packOptions,
      pq,
      editableVendorItem?.id ?? editableVendorItem?.item_id ?? ocrItem?.matched_id,
      [editableVendorItem],
      1,
      editableVendorItem?.accounting_system ?? [],
    );

    const storeState = useStore.getState();
    const nextBillItems = JSON.parse(JSON.stringify(storeState.bill_items ?? []));
    const addedIndex = nextBillItems.length - 1;

    if (addedIndex < 0) {
      return false;
    }

    nextBillItems[addedIndex].price_item = priceItem;
    nextBillItems[addedIndex].price_w_nds = priceWithVat;
    nextBillItems[addedIndex].summ_nds = summNds || nextBillItems[addedIndex].summ_nds;
    nextBillItems[addedIndex].nds = nds || nextBillItems[addedIndex].nds;
    nextBillItems[addedIndex].price = getBillItemUnitPrice(nextBillItems[addedIndex]);
    nextBillItems[addedIndex].one_price_bill = nextBillItems[addedIndex].price;

    store.setData({
      bill_items: nextBillItems,
    });
    store.reducePrice();

    return true;
  };

  changeOcrResolveItem = (index, selectedProduct) => {
    this.setState((prevState) => ({
      ocrResolveItems: prevState.ocrResolveItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              ...this.getOcrResolveState(item.ocrItem, selectedProduct),
            }
          : item,
      ),
    }));
  };

  changeOcrResolvePq = (index, selectedPq) => {
    this.setState((prevState) => ({
      ocrResolveItems: prevState.ocrResolveItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              selectedPq,
              resolveIssue: getOcrResolveIssue(item.ocrItem, item.selectedProduct, selectedPq),
            }
          : item,
      ),
    }));
  };

  closeOcrResolveDialog = () => {
    this.setState({
      ocrResolveDialog: false,
      ocrResolveItems: [],
    });
  };

  applyOcrResolveItems = () => {
    const { showAlert } = this.props.store;

    let addedItems = 0;
    let skippedItems = 0;

    this.state.ocrResolveItems.forEach((item) => {
      if (!item.selectedProduct) {
        skippedItems += 1;
        return;
      }

      if (this.addOcrItemToBill(item.ocrItem, item.selectedProduct, item.selectedPq)) {
        addedItems += 1;
      } else {
        skippedItems += 1;
      }
    });

    useStore.getState().check_price_item_new();

    this.closeOcrResolveDialog();

    if (!addedItems) {
      showAlert(false, "Для OCR-строк не выбраны товар и упаковка");
      return;
    }

    showAlert(
      true,
      `Добавлено ${addedItems} товаров из OCR${skippedItems ? `, пропущено ${skippedItems}` : ""}.`,
    );
  };

  applyOcrResponse = async (responseData) => {
    const store = this.props.store;
    const parsedDocuments = getParsedOcrDocuments(responseData);

    if (!parsedDocuments.length) {
      return {
        status: false,
        message: "OCR вернул JSON, но в нем нет merged.documents[].parsed",
      };
    }

    const invoice = getFirstOcrInvoice(parsedDocuments);
    const ocrItems = getMergedOcrItems(parsedDocuments);
    const invoiceDate = parseOcrDate(invoice?.date);
    const nextOcrState = {};

    if (normalizeBillingText(invoice?.number)) {
      nextOcrState.number = normalizeBillingText(invoice.number);
    }

    if (invoiceDate) {
      nextOcrState.date = invoiceDate;
    }

    if (Object.keys(nextOcrState).length) {
      store.setData(nextOcrState);
    }

    const vendorItems = await this.getCurrentVendorItems();

    if (!vendorItems.length) {
      return {
        status: true,
        message: "OCR заполнил реквизиты документа, но товары поставщика не загружены.",
      };
    }

    let addedItems = 0;
    const unresolvedItems = [];

    ocrItems.forEach((ocrItem, index) => {
      const matchedVendorItem = findMatchedVendorItem(vendorItems, ocrItem);
      const suggestedVendorItem =
        matchedVendorItem ?? findSuggestedVendorItem(vendorItems, ocrItem);
      const resolvedPackOption = getResolvedVendorPackOption(suggestedVendorItem, ocrItem);
      const quantityData = getOcrQuantityData(
        ocrItem,
        normalizeBillingText(resolvedPackOption?.name ?? resolvedPackOption?.id),
      );

      if (
        !matchedVendorItem ||
        !resolvedPackOption ||
        !normalizeBillingText(quantityData.count).length ||
        !normalizeBillingText(quantityData.factUnit).length
      ) {
        unresolvedItems.push({
          key: `${ocrItem?.__ocr_file_name ?? ocrItem?.line ?? index}-${ocrItem?.line ?? index}-${index}`,
          ocrItem,
          ...this.getOcrResolveState(ocrItem, suggestedVendorItem, resolvedPackOption),
        });
        return;
      }

      if (this.addOcrItemToBill(ocrItem, matchedVendorItem, resolvedPackOption)) {
        addedItems += 1;
      }
    });

    useStore.getState().check_price_item_new();

    if (!ocrItems.length) {
      return {
        status: true,
        message: "OCR заполнил реквизиты документа. Товаров в merged.documents не найдено.",
      };
    }

    if (unresolvedItems.length) {
      this.setState({
        ocrResolveDialog: true,
        ocrResolveItems: unresolvedItems,
      });

      return {
        status: true,
        message: `OCR обновил документ: добавлено ${addedItems} поз. Для ${unresolvedItems.length} поз. нужна ручная модерация.`,
      };
    }

    return {
      status: true,
      message: `OCR обновил документ: добавлено ${addedItems} поз.`,
    };
  };

  sendFilesToOcr = async () => {
    const { showAlert, point, type, bill } = this.props.store;

    if (!point?.id) {
      showAlert(false, "Сначала проверь кафе");
      return;
    }

    if (!type) {
      showAlert(false, "Сначала проверь тип документа");
      return;
    }

    if (![2, 5].includes(parseInt(bill?.type))) {
      showAlert(false, "Распознавание доступно только для статусов Шаблон и Заведенный");
      return;
    }

    const dropzoneImageFiles = this.getOcrImageFiles();
    const storedImageFiles = await this.getStoredOcrImageFiles();
    const imageFiles = [...storedImageFiles, ...dropzoneImageFiles];

    if (!imageFiles.length) {
      showAlert(false, "В дропзоне нет изображений для OCR");
      return;
    }

    this.clearBillItemsForOcr();

    this.setState({
      isOcrLoad: true,
    });

    console.log("OCR upload files", {
      point_id: point.id,
      files: imageFiles.map((file) => ({
        name: file?.name,
        type: file?.type,
        size: file?.size,
        status: file?.status,
        accepted: file?.accepted,
      })),
      stored_files: storedImageFiles.length,
      new_dropzone_files: dropzoneImageFiles.length,
    });

    try {
      const formData = new FormData();

      imageFiles.forEach((file) => {
        formData.append("files[]", file, file?.name || "ocr-file");
      });

      formData.append("point_id", String(point.id));
      formData.append("debug", "0");
      formData.append("use_lock", "1");
      formData.append("upload_to_cloud", "0");
      formData.append("overwrite_cloud", "0");

      const response = await fetch(url_ocr, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: formData,
      });

      const responseText = await response.text();
      const contentType = response.headers.get("content-type") || "";

      let responseData = null;

      if (responseText) {
        try {
          responseData = JSON.parse(responseText);
        } catch (error) {
          console.error("OCR pipeline returned non-JSON response", {
            endpoint: url_ocr,
            status: response.status,
            contentType,
            rawTextPreview: responseText.slice(0, 1000),
          });

          throw new Error("OCR вернул не JSON");
        }
      }

      console.log("OCR pipeline response", responseData);

      if (!response.ok || responseData?.st === false || responseData?.errors) {
        throw new Error(getOcrResponseText(responseData) || `Ошибка OCR (${response.status})`);
      }

      const ocrFillResult = await this.applyOcrResponse(responseData);

      showAlert(ocrFillResult.status, ocrFillResult.message);
    } catch (error) {
      console.error("OCR pipeline request failed", {
        endpoint: url_ocr,
        error,
      });

      showAlert(false, "OCR вернул ошибку, ответ в консоли");
    } finally {
      this.setState({
        isOcrLoad: false,
      });
    }
  };

  async saveEditBill(type_save, check_err = true) {
    if (!this.canStartSaveAction()) {
      this.showSaveNotice("Сохранение уже выполняется. Повторный клик заблокирован.");
      return;
    }

    this.startSaveAction();

    if (type_save != "type") {
      this.setState({
        thisTypeSave: type_save,
      });
    } else {
      type_save = this.state.thisTypeSave;
    }

    const {
      vendor,
      err_items,
      DropzoneMain,
      DropzoneDop,
      showAlert,
      number,
      point,
      date,
      number_factur,
      date_factur,
      type,
      doc,
      docs,
      doc_base_id,
      date_items,
      user,
      comment,
      is_new_doc,
      bill_items,
      imgs_bill,
      imgs_factur,
      bill,
    } = this.props.store;

    let doc_info = docs.find((item_doc) => item_doc.name === doc);

    const dateBill = date ? dayjs(date).format("YYYY-MM-DD") : "";
    const dateFactur = date_factur ? dayjs(date_factur).format("YYYY-MM-DD") : "";
    const dateItems = date_items ? dayjs(date_items).format("YYYY-MM-DD") : "";

    var items_color = [];

    let new_bill_items = bill_items.filter(
      (item) =>
        item.fact_unit.length == 0 || item.price_item.length == 0 || item.price_w_nds.length == 0,
    );

    // console.log('saveEditBill bill_items', bill_items)
    //this.isClick = false;
    //return ;

    if (new_bill_items.length > 0) {
      showAlert(false, "Не все даныне в товаре заполнены");
      this.showSaveNotice("Сохранение остановлено: не все данные по товарам заполнены.");

      this.finishSaveAction();

      return;
    }

    console.log("save bill_items", bill_items);

    const items = bill_items.reduce((newItems, item) => {
      let it = {};

      it.pq = item.pq;
      it.count = item.count;
      it.item_id = !item.item_id || item.item_id == "" ? item.id : item.item_id;
      it.summ = item.price_item;
      it.summ_w_nds = item.price_w_nds;
      it.color = item.color;

      if (item.color && item.color === true) {
        items_color.push(item);
      }

      console.log("nds 0", item?.nds);

      if (!item?.nds) {
        it.nds = -1;
      } else {
        const nds = item?.nds?.split(" %")[0];

        console.log("nds", nds);

        if (nds === "без НДС") {
          it.nds = -1;
        } else {
          it.nds = nds;
        }
      }

      newItems.push(it);

      return newItems;
    }, []);

    console.log("save items", items);

    // this.isClick = false;

    // return;

    if (check_err === true && items_color.length > 0) {
      this.setState({
        items_err: items_color,
        modelCheckErrItems: true,
      });
      this.showSaveNotice("Сохранение остановлено: есть позиции с предупреждением по ценнику.");

      this.finishSaveAction();

      return;
    }

    if (type_save !== "return") {
      if (imgs_bill.length == 0 && (!DropzoneMain || DropzoneMain["files"].length === 0)) {
        showAlert(false, "Нет изображений документа");
        this.showSaveNotice("Сохранение остановлено: не загружено изображение документа.");

        this.finishSaveAction();

        return;
      }

      if (
        imgs_factur.length == 0 &&
        parseInt(doc_base_id) == 5 &&
        parseInt(type) == 2 &&
        (!DropzoneDop || DropzoneDop["files"].length === 0)
      ) {
        showAlert(false, "Нет изображений счет-фактуры");
        this.showSaveNotice("Сохранение остановлено: не загружено изображение счет-фактуры.");

        this.finishSaveAction();

        return;
      }
    }

    if (DropzoneMain && DropzoneMain["files"].length > 0) {
      if (parseInt(type) == 1) {
        DropzoneMain.options.url = url_bill_ex;
        type_bill = "bill_ex";
      } else {
        DropzoneMain.options.url = url_bill;
        type_bill = "bill";
      }
    }

    let count_change = 0;

    if (parseInt(bill?.type) === 7) {
      const bill_new = {
        date_create: dateBill ? dateBill : null,
        date_factur: dateFactur ? dateFactur : null,
        number: number,
        number_factur: number_factur ?? null,
      };

      count_change = this.get_count_change(bill_new, items, type);
    }

    const data = {
      bill_id: bill.id,
      doc_info,
      type,
      items,
      number,
      text: this.state.delText,
      comment,
      is_new_doc,
      users: user,
      doc_base_id,
      number_factur,
      date: dateBill,
      date_items: dateItems,
      date_factur: dateFactur,
      point_id: bill.point_id,
      vendor_id: bill.vendor_id,
      type_save: type_save,
      err_items: items_color,
      count_change,
    };

    try {
      const res = await this.getData("save_edit", data);

      if (res.st === true) {
        if (res?.text && res.text.length > 0) {
          showAlert(res.st, res.text);
        }

        global_point_id = point?.id;
        global_new_bill_id = res.bill_id;

        const mainUploadFiles = DropzoneMain ? this.getPendingDropzoneFiles(DropzoneMain) : [];
        const facturUploadFiles =
          parseInt(type) == 2 && DropzoneDop ? this.getPendingDropzoneFiles(DropzoneDop) : [];
        const uploadTargets = [
          mainUploadFiles.length ? { dropzone: DropzoneMain } : null,
          facturUploadFiles.length ? { dropzone: DropzoneDop } : null,
        ].filter(Boolean);

        if (!uploadTargets.length) {
          this.lockSaveActionUntilRedirect();
          window.location.pathname = "/billing";
          return;
        }

        is_return = false;

        this.setState({
          isUploadProcessing: true,
          uploadBackdropMeta: {
            mainFiles: mainUploadFiles.length,
            facturFiles: facturUploadFiles.length,
          },
        });

        const uploadPromises = uploadTargets.map(({ dropzone }) =>
          this.waitForDropzoneQueue(dropzone),
        );

        if (mainUploadFiles.length) {
          i = imgs_bill.length + 1;
          DropzoneMain.processQueue();
        }

        if (facturUploadFiles.length) {
          i = imgs_factur.length + 1;
          DropzoneDop.processQueue();
        }

        const uploadResults = await Promise.all(uploadPromises);
        const hasUploadErrors = uploadResults.some((item) => item.hasErrors);

        this.finishSaveAction({
          isUploadProcessing: false,
          uploadBackdropMeta: {
            mainFiles: 0,
            facturFiles: 0,
          },
        });

        if (hasUploadErrors) {
          showAlert(false, "Документ сохранен, но часть изображений не загрузилась");
          this.showSaveNotice(
            "Документ сохранен, но часть изображений не загрузилась. Если повторится, сообщи разработчикам.",
            "warning",
          );
          return;
        }

        this.lockSaveActionUntilRedirect();
        window.location.pathname = "/billing";
      } else {
        showAlert(res.st, res.text);
        this.showSaveNotice(
          res?.text
            ? `Сохранение отклонено сервером: ${res.text}`
            : "Сохранение отклонено сервером.",
          "warning",
        );
        this.finishSaveAction();
      }
    } catch (error) {
      console.error("Failed to save billing edit document", error);
      this.finishSaveAction({
        isUploadProcessing: false,
        uploadBackdropMeta: {
          mainFiles: 0,
          facturFiles: 0,
        },
      });
      showAlert(false, "Не удалось сохранить документ. Попробуй еще раз");
      this.showSaveNotice(
        "Неожиданная ошибка при сохранении. Если проблема повторится, сообщи разработчикам.",
        "error",
      );
    }
  }

  get_count_change(bill, bill_items, type_bill) {
    const { bill_items_initinal, bill_initinal } = this.props.store;

    let count = 0;

    for (let key in bill) {
      if (key === "date_create" && bill[key] !== bill_initinal[key]) {
        count += 1;
      }

      if (key === "number" && bill[key] !== bill_initinal[key]) {
        count += 1;
      }

      if (parseInt(type_bill) !== 1) {
        if (key === "date_factur" && bill[key] !== bill_initinal[key]) {
          count += 1;
        }

        if (key === "number_factur" && bill[key] !== bill_initinal[key]) {
          count += 1;
        }
      }
    }

    bill_items_initinal.forEach((item) => {
      const it_old = bill_items.find((it) => parseInt(it.item_id) === parseInt(item.item_id));

      if (it_old) {
        for (let key in item) {
          if (item[key] !== it_old[key]) {
            count += 1;
          }
        }
      } else {
        count += 1;
      }
    });

    bill_items.forEach((it) => {
      if (!bill_items_initinal.find((item) => parseInt(item.item_id) === parseInt(it.item_id))) {
        count += 1;
      }
    });

    return count;
  }

  async saveDelDoc() {
    const { bill, point, showAlert } = this.props.store;

    if (this.state.delText.length <= 3) {
      showAlert(false, "Надо указать причину удаления");
      this.showSaveNotice("Удаление остановлено: укажи причину подробнее.", "warning");

      return;
    }

    const data = {
      bill_id: bill.id,
      point_id: point?.id,
      del_res: this.state.delText,
      bill_type: parseInt(bill.type_bill) == 1 ? "bill_ex" : "bill", //bill / bill_ex
    };

    const res = await this.getData("save_bill_del", data);

    if (res.st) {
      showAlert(res.st, res.text);

      this.setState({
        modelCheckDel: false,
      });

      window.location = "/billing";
    } else {
      showAlert(res.st, res.text);
      this.showSaveNotice(
        res?.text ? `Удаление отклонено: ${res.text}` : "Удаление отклонено сервером.",
        "warning",
      );
    }
  }

  delImg(img) {
    this.setState({
      imgDel: img,
      modelCheckDelImg: true,
    });
  }

  async delImgTrue() {
    const { bill, point, closeDialog, setImgList, showAlert, openImgType } = this.props.store;

    console.log("type_type delImgTrue", openImgType);
    console.log("type_type delImgTrue bill", this.props.store);

    const data = {
      bill_id: bill.id,
      point_id: point?.id,
      bill_type: parseInt(bill.type_bill) == 1 ? "bill_ex" : "bill", //bill / bill_ex
      type: openImgType, //bill / factur
      img_name: this.state.imgDel,
    };

    const res = await this.getData("delImg", data);

    if (res.st === true) {
      closeDialog();
      setImgList(res?.imgs_bill, res?.imgs_factur);

      this.setState({ modelCheckDelImg: false, imgDel: "" });
    } else {
      showAlert(res.st, res.text);
    }
  }

  async saveTruePrice() {
    const { bill, point, showAlert } = this.props.store;

    if (this.state.delText.length <= 3) {
      showAlert(false, "Надо указать комментарий");
      this.showSaveNotice("Подтверждение остановлено: добавь комментарий.", "warning");

      return;
    }

    const data = {
      bill_id: bill.id,
      point_id: point?.id,
      del_res: this.state.delText,
      type: parseInt(bill.type_bill) == 1 ? "bill_ex" : "bill", //bill / bill_ex
    };

    const res = await this.getData("save_true_price", data);

    if (res.st) {
      showAlert(res.st, res.text);

      this.setState({
        modelCheckPrice: false,
      });

      window.location = "/billing";
    } else {
      showAlert(res.st, res.text);
      this.showSaveNotice(
        res?.text
          ? `Подтверждение ценников отклонено: ${res.text}`
          : "Подтверждение ценников отклонено сервером.",
        "warning",
      );
    }
  }

  returnFN() {
    const { clearForm } = this.props.store;

    clearForm();
    window.location = "/billing";
  }

  async delete_1c() {
    const { bill, point, showAlert } = this.props.store;

    if (this.state.delText.length <= 3) {
      showAlert(false, "Надо указать причину удаления");
      this.showSaveNotice("Удаление из 1С остановлено: укажи причину подробнее.", "warning");

      return;
    }

    const data = {
      bill_id: bill.id,
      point_id: point?.id,
      del_res: this.state.delText,
      bill_type: parseInt(bill.type_bill) == 1 ? "bill_ex" : "bill", //bill / bill_ex
    };

    const res = await this.getData("delete_bill_1c", data);

    if (res.st) {
      //showAlert(res.st, res.text);

      window.location = "/billing";
    } else {
      showAlert(res.st, res.text);
      this.showSaveNotice(
        res?.text ? `Удаление из 1С отклонено: ${res.text}` : "Удаление из 1С отклонено сервером.",
        "warning",
      );
    }
  }

  async return_to_bux() {
    const { bill, point, showAlert } = this.props.store;

    const data = {
      bill_id: bill.id,
      point_id: point?.id,
      bill_type: parseInt(bill.type_bill) == 1 ? "bill_ex" : "bill", //bill / bill_ex
    };

    const res = await this.getData("return_from_bill_1c", data);

    if (res.st) {
      //showAlert(res.st, res.text);

      window.location = "/billing";
    } else {
      showAlert(res.st, res.text);
      this.showSaveNotice(
        res?.text
          ? `Возврат в бухгалтерию отклонен: ${res.text}`
          : "Возврат в бухгалтерию отклонен сервером.",
        "warning",
      );
    }
  }

  render() {
    const {
      acces,
      openAlert,
      err_status,
      err_text,
      closeAlert,
      is_load_store,
      modalDialog,
      fullScreen,
      image,
      closeDialog,
      bill,
      bill_list,
      bill_items,
      imgs_bill,
      imgs_factur,
      comment_bux,
      vendor_itemsCopy,
      point,
      is_horizontal,
      is_vertical,
      type,
      doc_base_id,
      setOpenedImage,
    } = this.props.store;

    const storedOcrImagesCount = (imgs_bill ?? []).filter((fileName) =>
      isImageFileName(fileName),
    ).length;
    const canUseOcr = [2, 5].includes(parseInt(bill?.type));
    const headerMode = getBillingSectionMode(acces, "header");
    const photoMode = getBillingSectionMode(acces, "photo");
    const itemsMode = getBillingSectionMode(acces, "items");
    const footerMode = getBillingSectionMode(acces, "footer");
    const isImageCompareMode = modalDialog && (is_horizontal || is_vertical);
    const viewerImageEntries = getBillingViewerImageEntries({
      typeDoc: this.state.type_doc,
      type,
      docBaseId: doc_base_id,
      imgsBill: imgs_bill,
      imgsFactur: imgs_factur,
    });

    const actionButtons = [
      hasBillingActionAccess(acces, "only_delete")
        ? {
            key: "delete",
            label: "Удалить документ",
            variant: "outlined",
            color: "error",
            onClick: () => {
              this.setState({ modelCheckDel: true });
            },
          }
        : null,
      hasBillingActionAccess(acces, "only_return")
        ? {
            key: "return-manager",
            label: "Ошибка: вернуть управляющему",
            variant: "contained",
            onClick: () => {
              this.setState({ modelChecReturn: true });
            },
          }
        : null,
      hasBillingActionAccess(acces, "only_save")
        ? {
            key: "save",
            label: "Сохранить изменения",
            variant: "contained",
            onClick: this.saveEditBill.bind(this, "current", true),
          }
        : null,
      hasBillingActionAccess(acces, "send_1c")
        ? {
            key: "send-1c",
            label: "Отправить в 1С",
            variant: "contained",
            onClick: this.saveEditBill.bind(this, "next", true),
          }
        : null,
      hasBillingActionAccess(acces, "pay")
        ? {
            key: "pay",
            label: "Оплатить",
            variant: "contained",
            onClick: this.saveEditBill.bind(this, "next", true),
          }
        : null,
      hasBillingActionAccess(acces, "true_price")
        ? {
            key: "confirm-prices",
            label: "Подтвердить ценники",
            variant: "contained",
            onClick: () => {
              this.setState({ modelCheckPrice: true });
            },
          }
        : null,
      hasBillingActionAccess(acces, "save_send")
        ? {
            key: "save-send",
            label: "Сохранить и отправить",
            variant: "contained",
            onClick: this.saveEditBill.bind(this, "next", true),
          }
        : null,
      hasBillingActionAccess(acces, "delete_1c")
        ? {
            key: "delete-1c",
            label: "Удалить из 1С",
            variant: "outlined",
            color: "error",
            onClick: () => {
              this.setState({ modelCheckDel1c: true });
            },
          }
        : null,
      hasBillingActionAccess(acces, "return_to_bux")
        ? {
            key: "return-bux",
            label: "Вернуть в бухгалтерию",
            variant: "contained",
            color: "info",
            onClick: this.return_to_bux.bind(this, "next", true),
          }
        : null,
    ].filter(Boolean);
    const isSaveActionLocked = this.state.isSavingAction || this.state.isUploadProcessing;
    let nextSectionStep = 1;
    const headerEyebrow = headerMode !== "hidden" ? `Шаг ${nextSectionStep++}` : null;
    const photoEyebrow = photoMode !== "hidden" ? `Шаг ${nextSectionStep++}` : null;
    const itemsFormEyebrow = itemsMode === "edit" ? `Шаг ${nextSectionStep++}` : null;
    const itemsTableEyebrow = itemsMode === "edit" ? `Шаг ${nextSectionStep++}` : null;
    const itemsViewEyebrow = itemsMode === "show" ? `Шаг ${nextSectionStep++}` : null;
    const footerEyebrow = footerMode !== "hidden" ? `Шаг ${nextSectionStep++}` : null;

    return (
      <>
        <Backdrop
          style={{ zIndex: 99 }}
          open={
            this.state.is_load ||
            this.state.isSavingAction ||
            this.state.isUploadProcessing ||
            this.state.isOcrLoad ||
            is_load_store
          }
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        {!modalDialog ? null : (
          <Billing_Modal
            onClose={closeDialog}
            fullScreen={fullScreen}
            image={image}
            store={this.props.store}
            delImg={this.delImg.bind(this)}
            isDelImg={hasBillingActionAccess(acces, "del_img")}
            imageEntries={viewerImageEntries}
            onNavigateImage={(entry) => setOpenedImage(entry?.url, entry?.type)}
          />
        )}
        <MyAlert
          isOpen={openAlert}
          onClose={closeAlert}
          status={err_status}
          text={err_text}
        />
        <Snackbar
          key={this.state.saveNoticeKey}
          open={this.state.saveNoticeOpen}
          autoHideDuration={4200}
          onClose={this.closeSaveNotice}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={this.closeSaveNotice}
            severity={this.state.saveNoticeSeverity}
            variant="filled"
            sx={{
              width: "100%",
              maxWidth: 420,
              boxShadow: "0 12px 30px rgba(15, 23, 42, 0.18)",
              alignItems: "center",
            }}
          >
            {this.state.saveNoticeText}
          </Alert>
        </Snackbar>
        <Dialog
          open={this.state.modelCheckBuxComment}
          onClose={() => {
            this.setState({ modelCheckBuxComment: false });
          }}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: billingConfirmDialogPaperSx }}
        >
          <DialogTitle
            sx={{
              px: { xs: 2.5, md: 4 },
              pt: { xs: 2.5, md: 3.5 },
              pb: { xs: 1.75, md: 2.25 },
              borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
            }}
          >
            <Typography sx={{ fontSize: 28, fontWeight: 800, lineHeight: 1.05, color: "#111827" }}>
              Комментарий бухгалтера
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ px: { xs: 2.5, md: 4 }, pt: 3.5, pb: { xs: 0.5, md: 1 } }}>
            <DialogContentText sx={{ mb: 2.5, color: "#334155", whiteSpace: "pre-wrap" }}>
              {comment_bux}
            </DialogContentText>
          </DialogContent>
          <DialogActions
            disableSpacing
            sx={{
              px: { xs: 2.5, md: 4 },
              pb: { xs: 2, md: 2.5 },
              pt: 0,
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="contained"
              onClick={() => {
                this.setState({ modelCheckBuxComment: false });
              }}
              color="success"
              sx={{
                ...billingDialogButtonSx,
                width: { xs: "100%", sm: "auto" },
                minWidth: { xs: 0, sm: 160 },
                height: 48,
              }}
            >
              Хорошо
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.modelCheckDel}
          onClose={() => {
            this.setState({ modelCheckDel: false });
          }}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: billingConfirmDialogPaperSx }}
        >
          <DialogTitle sx={{ px: { xs: 2.5, md: 4 }, pt: { xs: 2.5, md: 3.5 }, pb: 0 }}>
            <Typography sx={{ fontSize: 28, fontWeight: 800, lineHeight: 1.05, color: "#111827" }}>
              Удалить документ
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ px: { xs: 2.5, md: 4 }, pt: 2.25, pb: 0 }}>
            <DialogContentText sx={{ mb: 2.5 }}>
              Несохранённые изменения не будут применены. Укажи причину удаления документа.
            </DialogContentText>
            <MyTextInput
              label="Причина удаления"
              value={this.state.delText}
              func={(event) => {
                this.setState({ delText: event.target.value });
              }}
            />
          </DialogContent>
          <DialogActions
            disableSpacing
            sx={billingDialogActionsSx}
          >
            <Button
              variant="outlined"
              onClick={() => {
                this.setState({ modelCheckDel: false });
              }}
              color="inherit"
              sx={billingDialogButtonSx}
            >
              Отмена
            </Button>
            <Button
              variant="contained"
              onClick={this.saveDelDoc.bind(this)}
              color="error"
              sx={billingDialogButtonSx}
            >
              Удалить
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.modelCheckDel1c}
          onClose={() => {
            this.setState({ modelCheckDel1c: false });
          }}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: billingConfirmDialogPaperSx }}
        >
          <DialogTitle sx={{ px: { xs: 2.5, md: 4 }, pt: { xs: 2.5, md: 3.5 }, pb: 0 }}>
            <Typography sx={{ fontSize: 28, fontWeight: 800, lineHeight: 1.05, color: "#111827" }}>
              Удалить из 1С
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ px: { xs: 2.5, md: 4 }, pt: 2.25, pb: 0 }}>
            <DialogContentText sx={{ mb: 2.5 }}>
              Несохранённые изменения не будут применены. Укажи причину удаления подготовленного
              документа из 1С.
            </DialogContentText>
            <MyTextInput
              label="Причина удаления"
              value={this.state.delText}
              func={(event) => {
                this.setState({ delText: event.target.value });
              }}
            />
          </DialogContent>
          <DialogActions
            disableSpacing
            sx={billingDialogActionsSx}
          >
            <Button
              variant="outlined"
              onClick={() => {
                this.setState({ modelCheckDel1c: false });
              }}
              color="inherit"
              sx={billingDialogButtonSx}
            >
              Отмена
            </Button>
            <Button
              variant="contained"
              onClick={this.delete_1c.bind(this)}
              color="error"
              sx={billingDialogButtonSx}
            >
              Удалить
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.modelCheckPrice}
          onClose={() => {
            this.setState({ modelCheckPrice: false });
          }}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: billingConfirmDialogPaperSx }}
        >
          <DialogTitle sx={{ px: { xs: 2.5, md: 4 }, pt: { xs: 2.5, md: 3.5 }, pb: 0 }}>
            <Typography sx={{ fontSize: 28, fontWeight: 800, lineHeight: 1.05, color: "#111827" }}>
              Подтвердить ценники
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ px: { xs: 2.5, md: 4 }, pt: 2.25, pb: 0 }}>
            <DialogContentText sx={{ mb: 2.5 }}>
              Добавь комментарий к подтверждению ценников, чтобы зафиксировать решение.
            </DialogContentText>
            <MyTextInput
              label="Комментарий"
              value={this.state.delText}
              func={(event) => {
                this.setState({ delText: event.target.value });
              }}
            />
          </DialogContent>
          <DialogActions
            disableSpacing
            sx={billingDialogActionsSx}
          >
            <Button
              variant="outlined"
              onClick={() => {
                this.setState({ modelCheckPrice: false });
              }}
              color="inherit"
              sx={billingDialogButtonSx}
            >
              Отмена
            </Button>
            <Button
              variant="contained"
              onClick={this.saveTruePrice.bind(this)}
              color="success"
              sx={billingDialogButtonSx}
            >
              Подтвердить
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.modelChecReturn}
          onClose={() => {
            this.setState({ modelChecReturn: false, delText: "" });
          }}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: billingConfirmDialogPaperSx }}
        >
          <DialogTitle sx={{ px: { xs: 2.5, md: 4 }, pt: { xs: 2.5, md: 3.5 }, pb: 0 }}>
            <Typography sx={{ fontSize: 28, fontWeight: 800, lineHeight: 1.05, color: "#111827" }}>
              Вернуть управляющему
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ px: { xs: 2.5, md: 4 }, pt: 2.25, pb: 0 }}>
            <DialogContentText sx={{ mb: 2.5 }}>
              Укажи причину возврата, чтобы комментарий остался в карточке документа.
            </DialogContentText>
            <MyTextInput
              label="Причина возврата"
              value={this.state.delText}
              func={(event) => {
                this.setState({ delText: event.target.value });
              }}
            />
          </DialogContent>
          <DialogActions
            disableSpacing
            sx={billingDialogActionsSx}
          >
            <Button
              variant="outlined"
              onClick={() => {
                this.setState({ modelChecReturn: false, delText: "" });
              }}
              color="inherit"
              sx={billingDialogButtonSx}
            >
              Отмена
            </Button>
            <Button
              variant="contained"
              onClick={this.saveEditBill.bind(this, "return", false)}
              color="warning"
              disabled={isSaveActionLocked}
              sx={billingDialogButtonSx}
            >
              Вернуть
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.modelCheckDelImg}
          onClose={() => {
            this.setState({ modelCheckDelImg: false, imgDel: "" });
          }}
          fullWidth
          maxWidth="xs"
          sx={{ zIndex: 2100 }}
          PaperProps={{ sx: billingConfirmDialogPaperSx }}
        >
          <DialogTitle sx={{ px: { xs: 2.5, md: 4 }, pt: { xs: 2.5, md: 3.5 }, pb: 0 }}>
            <Typography sx={{ fontSize: 28, fontWeight: 800, lineHeight: 1.05, color: "#111827" }}>
              Удалить изображение
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ px: { xs: 2.5, md: 4 }, pt: 2.25, pb: 0 }}>
            <DialogContentText>
              Сохранённое изображение будет удалено из документа.
            </DialogContentText>
          </DialogContent>
          <DialogActions
            disableSpacing
            sx={billingDialogActionsSx}
          >
            <Button
              variant="outlined"
              onClick={() => {
                this.setState({ modelCheckDelImg: false, imgDel: "" });
              }}
              color="inherit"
              sx={billingDialogButtonSx}
            >
              Отмена
            </Button>
            <Button
              variant="contained"
              onClick={this.delImgTrue.bind(this)}
              color="error"
              sx={billingDialogButtonSx}
            >
              Удалить
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.modelCheckErrItems}
          onClose={() => {
            this.setState({ modelCheckErrItems: false });
          }}
          fullScreen={fullScreen}
          fullWidth
          maxWidth={fullScreen ? false : "lg"}
          scroll="paper"
          PaperProps={{
            sx: {
              ...billingConfirmDialogPaperSx,
              ...(fullScreen
                ? {
                    borderRadius: 0,
                    minHeight: "100dvh",
                    maxHeight: "100dvh",
                  }
                : {}),
            },
          }}
        >
          <DialogTitle sx={{ px: { xs: 2.5, md: 4 }, pt: { xs: 2.5, md: 3.5 }, pb: 0 }}>
            <Typography
              sx={{
                fontSize: { xs: 28, md: 32 },
                lineHeight: 1,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: "#111827",
              }}
            >
              Подтверждение перед сохранением
            </Typography>
            <Typography
              sx={{
                mt: 1.25,
                maxWidth: 760,
                color: "#6b7280",
                fontSize: 16,
                lineHeight: 1.6,
              }}
            >
              Проверь позиции с предупреждением по ценнику и только потом сохраняй документ.
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ px: { xs: 2.5, md: 4 }, pt: 2.5, pb: 0 }}>
            <VendorItemsTableView_min />
          </DialogContent>
          <DialogActions
            disableSpacing
            sx={billingDialogActionsSx}
          >
            <Button
              variant="outlined"
              onClick={() => {
                this.setState({ modelCheckErrItems: false });
              }}
              color="inherit"
              sx={billingDialogButtonSx}
            >
              Вернуться
            </Button>
            <Button
              variant="contained"
              onClick={this.saveEditBill.bind(this, "type", false)}
              color="success"
              disabled={isSaveActionLocked}
              sx={billingDialogButtonSx}
            >
              Сохранить документ
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.ocrResolveDialog}
          onClose={this.closeOcrResolveDialog}
          fullScreen={fullScreen}
          fullWidth={true}
          maxWidth={fullScreen ? false : "lg"}
          scroll="paper"
          PaperProps={{
            sx: {
              ...billingConfirmDialogPaperSx,
              ...(fullScreen
                ? {
                    borderRadius: 0,
                    minHeight: "100dvh",
                    maxHeight: "100dvh",
                  }
                : {}),
            },
          }}
        >
          <DialogTitle sx={{ px: { xs: 2.5, md: 4 }, pt: { xs: 2.5, md: 3.5 }, pb: 0 }}>
            <Typography
              sx={{
                fontSize: { xs: 24, md: 32 },
                lineHeight: 1,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: "#111827",
              }}
            >
              Сопоставить товары OCR
            </Typography>
            <Typography
              sx={{
                mt: 1.25,
                maxWidth: 780,
                color: "#6b7280",
                fontSize: { xs: 15, md: 16 },
                lineHeight: 1.6,
              }}
            >
              Для этих строк OCR не смог уверенно определить товар или упаковку. Проверь и подтверди
              их вручную.
            </Typography>
          </DialogTitle>
          <DialogContent
            sx={{
              px: { xs: 2, md: 4 },
              pt: 2.5,
              pb: 0,
              overflowY: "auto",
            }}
          >
            <Grid
              container
              spacing={2}
            >
              {this.state.ocrResolveItems.map((item, index) => (
                <Grid
                  key={item.key}
                  size={{
                    xs: 12,
                  }}
                >
                  <Box
                    sx={{
                      borderRadius: "22px",
                      border: "1px solid rgba(148, 163, 184, 0.16)",
                      background: "rgba(255,255,255,0.82)",
                      boxShadow: "0 14px 32px rgba(15, 23, 42, 0.06)",
                      px: { xs: 1.75, md: 2.5 },
                      py: { xs: 1.75, md: 2.25 },
                    }}
                  >
                    <Grid
                      container
                      spacing={2}
                    >
                      <Grid
                        size={{
                          xs: 12,
                          md: 4,
                        }}
                      >
                        <Typography style={{ fontWeight: 700, fontSize: 18 }}>
                          {normalizeBillingText(item.ocrItem?.name) ||
                            `Строка ${item.ocrItem?.line ?? index + 1}`}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.75 }}
                        >
                          Строка: {item.ocrItem?.line ?? index + 1}
                        </Typography>
                        {!normalizeBillingText(item.ocrItem?.__ocr_file_name) ? null : (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            Файл: {item.ocrItem.__ocr_file_name}
                          </Typography>
                        )}
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          OCR: {formatBillingQuantity(item.ocrItem?.quantity)}
                          {formatBillingQuantity(item.ocrItem?.quantity) === "—" ? "" : " упак."}
                          {normalizeBillingText(item.ocrItem?.pq)
                            ? ` x ${formatBillingQuantity(item.ocrItem?.pq)}`
                            : ""}
                          {item.selectedPq
                            ? ` = ${formatBillingQuantity(
                                getOcrQuantityData(
                                  item.ocrItem,
                                  normalizeBillingText(
                                    item.selectedPq?.name ?? item.selectedPq?.id,
                                  ),
                                ).factUnit,
                              )}`
                            : ""}
                        </Typography>
                        {!item.resolveIssue ? null : (
                          <Typography
                            variant="body2"
                            color="warning.main"
                            sx={{ mt: 1 }}
                          >
                            {item.resolveIssue}
                          </Typography>
                        )}
                      </Grid>
                      <Grid
                        size={{
                          xs: 12,
                          md: 4,
                        }}
                      >
                        <MyAutocomplite
                          data={vendor_itemsCopy ?? []}
                          multiple={false}
                          unifiedPopup
                          value={item.selectedProduct}
                          func={(event, value) => this.changeOcrResolveItem(index, value)}
                          isOptionEqualToValue={(option, value) => option?.id === value?.id}
                          label="Товар поставщика"
                          slotProps={{
                            popper: {
                              allowAdaptivePlacement: true,
                            },
                            listbox: {
                              sx: {
                                maxHeight: { xs: "min(220px, 40dvh)", sm: 320 },
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid
                        size={{
                          xs: 12,
                          md: 4,
                        }}
                      >
                        <MySelect
                          data={formatBillingPackOptions(item.selectedProduct?.pq_item ?? [])}
                          value={item.selectedPq?.id ?? ""}
                          multiple={false}
                          is_none={false}
                          unifiedPopup
                          disabled={!item.selectedProduct}
                          func={(event, value) =>
                            this.changeOcrResolvePq(
                              index,
                              value ??
                                item.selectedProduct?.pq_item?.find(
                                  (option) => String(option?.id) === String(event.target.value),
                                ) ??
                                null,
                            )
                          }
                          label="Упаковка"
                          slotProps={{
                            popper: {
                              allowAdaptivePlacement: true,
                            },
                            listbox: {
                              sx: {
                                maxHeight: { xs: "min(220px, 40dvh)", sm: 320 },
                              },
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions
            disableSpacing
            sx={billingDialogActionsSx}
          >
            <Button
              variant="outlined"
              onClick={this.closeOcrResolveDialog}
              color="inherit"
              sx={billingDialogButtonSx}
            >
              Пропустить
            </Button>
            <Button
              variant="contained"
              onClick={this.applyOcrResolveItems}
              color="success"
              sx={billingDialogButtonSx}
            >
              Добавить выбранные
            </Button>
          </DialogActions>
        </Dialog>
        <Grid
          container
          spacing={3}
          className="container_first_child"
          sx={{
            ...billingPageFieldSx,
            ...billingEditFieldOverridesSx,
            maxWidth: is_vertical ? "50%" : "100%",
            pb: is_horizontal
              ? {
                  xs: "calc(56dvh + 40px)",
                  md: "calc(54vh + 56px)",
                }
              : 0,
            mb: 4,
          }}
        >
          {isImageCompareMode ? null : (
            <BillingPageHero
              onBack={this.returnFN.bind(this)}
              title={bill?.number ? `Документ №${bill.number}` : "Редактирование документа"}
            />
          )}

          {headerMode === "hidden" ? null : (
            <BillingSection
              eyebrow={headerEyebrow}
              title="Реквизиты документа"
              description="Проверь кафе, тип документа, номер, даты и связанные реквизиты перед сохранением."
              hideHeader={isImageCompareMode}
            >
              <FormHeader_new
                type_doc={this.state.type_doc}
                page="edit"
                type_edit={headerMode}
              />
            </BillingSection>
          )}

          {isImageCompareMode || photoMode === "hidden" ? null : (
            <BillingSection
              eyebrow={photoEyebrow}
              title="Файлы документа"
              description="Проверь сохранённые изображения документа и дозагрузи новые страницы, если это нужно."
            >
              <FormImage_new
                type_doc={this.state.type_doc}
                type_edit={photoMode}
                onAddBillFilesClick={this.openMainDropzonePicker}
                onAddFacturFilesClick={this.openFacturDropzonePicker}
                onOcrClick={this.sendFilesToOcr}
                isOcrLoad={this.state.isOcrLoad}
                isOcrDisabled={
                  this.state.isOcrLoad ||
                  !point?.id ||
                  !type ||
                  this.state.ocrImageFilesCount + storedOcrImagesCount === 0
                }
                showOcrButton={canUseOcr}
              />
            </BillingSection>
          )}

          {itemsMode === "edit" ? (
            <>
              {isImageCompareMode ? null : (
                <BillingSection
                  eyebrow={itemsFormEyebrow}
                  title="Подбор товара поставщика"
                  description="Найди товар поставщика, выбери упаковку и добавь строку вручную, если нужно скорректировать документ."
                >
                  <FormVendorItems />
                </BillingSection>
              )}
              <BillingSection
                eyebrow={itemsTableEyebrow}
                title="Товары в документе"
                description={
                  isImageCompareMode
                    ? "Сверь строки документа с изображением и проверь ключевые суммы."
                    : "Проверь упаковку, суммы и предупреждения по ценнику. Изменения сравниваются с исходной накладной."
                }
                hideHeader={isImageCompareMode}
              >
                <VendorItemsTableEdit showPriceWarnings={!isImageCompareMode} />
              </BillingSection>
            </>
          ) : itemsMode === "show" ? (
            <BillingSection
              eyebrow={itemsViewEyebrow}
              title="Товары в документе"
              description={
                isImageCompareMode
                  ? "Сверь строки документа с изображением и проверь ключевые суммы."
                  : "Ниже показан текущий состав накладной и расхождения относительно исходных данных."
              }
              hideHeader={isImageCompareMode}
            >
              <VendorItemsTableView showPriceWarnings={!isImageCompareMode} />
            </BillingSection>
          ) : null}

          {isImageCompareMode || footerMode === "hidden" ? null : (
            <BillingSection
              eyebrow={footerEyebrow}
              title="Комментарии и приёмка"
              description="Укажи комментарии, сотрудников и дополнительные отметки по документу."
            >
              <FormOther_new
                type_doc={this.state.type_doc}
                page="edit"
                type_edit={footerMode}
              />
            </BillingSection>
          )}

          {isImageCompareMode ? null : (
            <BillingSection
              eyebrow="История"
              title="История документа"
              description="В этом блоке можно посмотреть предыдущие версии накладной и изменения по товарам."
            >
              <Billing_Accordion
                bill_list={bill_list}
                bill_items={bill_items}
                bill_type={type}
                type="edit"
              />
            </BillingSection>
          )}

          {!actionButtons.length ? null : (
            <BillingSection
              eyebrow="Действия"
              title="Операции с документом"
              description="Выбери действие в зависимости от статуса накладной: сохранить, отправить дальше по процессу или вернуть на корректировку."
              hideHeader={isImageCompareMode}
            >
              <Grid
                size={{
                  xs: 12,
                }}
              >
                <Box sx={billingActionsCardSx}>
                  <Grid
                    container
                    spacing={2}
                  >
                    {actionButtons.map((action) => (
                      <Grid
                        key={action.key}
                        size={{
                          xs: 12,
                          sm: 6,
                          md: 4,
                        }}
                      >
                        <Button
                          variant={action.variant}
                          fullWidth
                          onClick={action.onClick}
                          disabled={isSaveActionLocked}
                          sx={{
                            ...getBillingActionButtonSx(action.key),
                          }}
                        >
                          {action.label}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Grid>
            </BillingSection>
          )}
        </Grid>
      </>
    );
  }
}

const withStore = (BaseComponent) => (props) => {
  const store = useStore();
  return (
    <BaseComponent
      {...props}
      store={store}
    />
  );
};

const Billing_Edit_Store = withStore(Billing_Edit_);

export default function BillingEdit() {
  return <Billing_Edit_Store />;
}
