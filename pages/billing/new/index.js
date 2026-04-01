import React from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

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
import MyAlert from "@/ui/MyAlert";
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
  /*{
    "name": "Возврат",
    "id": "4"
  },*/
];

function isImageDropzoneFile(file) {
  const fileName = file?.name?.toLowerCase() ?? "";

  return (
    file?.type?.startsWith("image/") || /\.(jpe?g|png|gif|bmp|webp|heic|heif)$/i.test(fileName)
  );
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

function normalizeOcrText(value) {
  return String(value ?? "").trim();
}

function normalizeOcrSearchValue(value) {
  return normalizeOcrText(value)
    .toLowerCase()
    .replace(/[\"'`«»]/g, "")
    .replace(/\s+/g, " ");
}

function parseOcrNumericValue(value) {
  const normalized = normalizeOcrText(value).replace(/\s+/g, "").replace(",", ".");

  if (!normalized.length) {
    return null;
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

function parseOcrAmount(value, fractionDigits = 2) {
  const parsed = parseOcrNumericValue(value);

  return Number.isFinite(parsed) ? parsed.toFixed(fractionDigits) : "";
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
            normalizeOcrSearchValue(item?.name) === normalizeOcrSearchValue(candidate?.name),
        ),
      )
      .find(Boolean) ??
    matchSuggestions
      .map((suggestion) =>
        vendorItems.find(
          (item) => normalizeOcrSearchValue(item?.name) === normalizeOcrSearchValue(suggestion),
        ),
      )
      .find(Boolean) ??
    null
  );
}

function findVendorPackOption(pqItems, value) {
  const normalizedValue = normalizeOcrText(value);

  if (!normalizedValue.length || !Array.isArray(pqItems) || !pqItems.length) {
    return null;
  }

  const parsedValue = parseOcrNumericValue(value);

  return (
    pqItems.find((option) => normalizeOcrText(option?.name ?? option?.id) === normalizedValue) ??
    pqItems.find((option) => normalizeOcrText(String(option?.id ?? "")) === normalizedValue) ??
    pqItems.find((option) => {
      const optionValue = parseOcrNumericValue(option?.name ?? option?.id);

      return (
        parsedValue !== null && optionValue !== null && Math.abs(optionValue - parsedValue) < 0.0001
      );
    }) ??
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

  const ocrPq = normalizeOcrText(ocrItem?.pq);

  if (ocrPq.length) {
    return findVendorPackOption(pqItems, ocrPq);
  }

  return findVendorPackOption(pqItems, "1") ?? (pqItems.length === 1 ? pqItems[0] : null);
}

function getOcrResolveIssue(ocrItem, vendorItem, selectedPackOption) {
  if (!vendorItem) {
    return "OCR не смог уверенно определить товар";
  }

  const ocrPq = normalizeOcrText(ocrItem?.pq);
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
  const quantity = parseOcrAmount(ocrItem?.quantity, 2);
  const resolvedPq = normalizeOcrText(pqValue);
  const pqNumber = parseOcrNumericValue(resolvedPq || ocrItem?.pq);

  if (quantity && pqNumber !== null && pqNumber > 0) {
    return {
      count: quantity,
      pq: resolvedPq || parseOcrAmount(pqNumber, 2),
      factUnit: (Number(quantity) * pqNumber).toFixed(2),
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
  const normalized = normalizeOcrText(value);

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

      return Boolean(normalizeOcrText(invoice?.number) || normalizeOcrText(invoice?.date));
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

function getFirstOcrSellerData(parsedDocuments) {
  return (
    parsedDocuments.find((document) => {
      const seller = document?.parsed?.seller ?? {};

      return Boolean(
        normalizeOcrText(seller?.vendor?.name || seller?.vendor_name || seller?.name) ||
        seller?.vendor?.id ||
        seller?.vendor_id,
      );
    })?.parsed?.seller ?? {}
  );
}

function getOcrVendorName(sellerData) {
  return sellerData?.vendor?.name || sellerData?.vendor_name || sellerData?.name || "";
}

function getOcrVendorValue(sellerData) {
  const vendorName = getOcrVendorName(sellerData);
  const vendorId = sellerData?.vendor?.id ?? sellerData?.vendor_id;

  return sellerData?.vendor ?? (vendorId ? { id: vendorId, name: vendorName } : null);
}

function getBillItemUnitPrice(item) {
  const factUnit = parseOcrNumericValue(item?.fact_unit);
  const priceWithVat = parseOcrNumericValue(item?.price_w_nds);

  if (factUnit === null || factUnit <= 0 || priceWithVat === null) {
    return 0;
  }

  return priceWithVat / factUnit;
}

const BILLING_DECIMAL_SCALE = 2;

function formatBillingNumber(
  value,
  minimumFractionDigits = 0,
  maximumFractionDigits = BILLING_DECIMAL_SCALE,
) {
  const numericValue = parseOcrNumericValue(value);

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

function formatBillingInteger(value) {
  return formatBillingNumber(value, 0, 0);
}

function formatBillingCurrency(value) {
  const formattedValue = formatBillingAmount(value);

  return formattedValue === "—" ? "—" : `${formattedValue} ₽`;
}

function formatBillingFieldValue(value) {
  const normalizedValue = normalizeOcrText(value);

  if (!normalizedValue.length) {
    return "";
  }

  const numericValue = parseOcrNumericValue(value);

  return numericValue === null
    ? normalizedValue.replace(/\./g, ",")
    : formatBillingAmount(numericValue);
}

function formatBillingValueWithUnit(value, unit = "") {
  const formattedValue = formatBillingNumber(value);

  if (formattedValue === "—") {
    return unit ? `— ${unit}` : "—";
  }

  return unit ? `${formattedValue} ${unit}` : formattedValue;
}

function formatBillingPackOptions(options = []) {
  return (Array.isArray(options) ? options : []).map((option) => {
    const rawValue = option?.name ?? option?.id;
    const numericValue = parseOcrNumericValue(rawValue);

    if (numericValue === null) {
      return option;
    }

    return {
      ...option,
      name: formatBillingNumber(numericValue),
    };
  });
}

function normalizeBillingDecimalText(value, fractionDigits = BILLING_DECIMAL_SCALE) {
  const rawValue = normalizeOcrText(value).replace(/\s+/g, "");
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
  const numericValue = parseOcrNumericValue(value);

  return numericValue === null ? "" : numericValue.toFixed(fractionDigits);
}

function getBillingDecimalEvent(
  event,
  { fixed = false, fractionDigits = BILLING_DECIMAL_SCALE } = {},
) {
  const nextValue = fixed
    ? getRoundedBillingDecimalText(event?.target?.value, fractionDigits)
    : normalizeBillingDecimalText(event?.target?.value, fractionDigits);

  if (event?.target) {
    event.target.value = nextValue;
  }

  if (event?.currentTarget) {
    event.currentTarget.value = nextValue;
  }

  return event;
}

function formatBillingUnitPrice(totalValue, quantityValue) {
  const total = parseOcrNumericValue(totalValue);
  const quantity = parseOcrNumericValue(quantityValue);

  if (total === null || quantity === null || quantity <= 0) {
    return formatBillingAmount(0);
  }

  return formatBillingAmount(total / quantity);
}

function getBillItemUnitLabel(item) {
  return normalizeOcrText(item?.ed_izmer_name).replace(/\.+$/g, "") || "ед.";
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

function getBillItemPriceWarningText(item) {
  const priceCheck = item?.price_check;

  if (!priceCheck?.isError) {
    return "";
  }

  return priceCheck.reason;
}

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
        Найдено позиций с отклонением: {formatBillingInteger(count)}. Такие строки отмечены плашкой
        "Проверить ценник".
      </Typography>
    </Box>
  );
}

function BillItemNameContent({ item }) {
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
      {!item?.price_check?.isError ? null : (
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
            {getBillItemPriceWarningText(item)}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

function findMatchedVendorItem(vendorItems, ocrItem) {
  const matchedId = ocrItem?.matched_product?.id ?? ocrItem?.matched_id;
  const matchedName = ocrItem?.matched_product?.name ?? ocrItem?.matched_name;
  const normalizedMatchedName = normalizeOcrSearchValue(matchedName);
  const normalizedItemName = normalizeOcrSearchValue(ocrItem?.name);

  return (
    vendorItems.find(
      (item) =>
        matchedId &&
        (parseInt(item?.id) === parseInt(matchedId) ||
          parseInt(item?.item_id) === parseInt(matchedId)),
    ) ??
    vendorItems.find((item) => normalizeOcrSearchValue(item?.name) === normalizedMatchedName) ??
    vendorItems.find((item) => normalizeOcrSearchValue(item?.name) === normalizedItemName) ??
    null
  );
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
const API_URL = "https://apichef.jacochef.ru/api";
// const API_URL = "http://127.0.0.1:8000/api";
const url_bill = `${API_URL}/bill-items/upload`;
const url_bill_ex = `${API_URL}/bill-ex-items/upload`;
const url_ocr = `${API_URL}/ocr/files/pipeline`;

function BillingUploadBackdropContent({ mainFiles = 0, facturFiles = 0 }) {
  const totalFiles = mainFiles + facturFiles;

  return (
    <Box
      sx={{
        width: { xs: "min(92vw, 380px)", md: 460 },
        px: { xs: 2.5, md: 3.5 },
        py: { xs: 3, md: 3.5 },
        borderRadius: "30px",
        border: "1px solid rgba(255,255,255,0.16)",
        background:
          "linear-gradient(180deg, rgba(17, 24, 39, 0.92) 0%, rgba(30, 41, 59, 0.9) 100%)",
        boxShadow: "0 28px 80px rgba(15, 23, 42, 0.42)",
        color: "#fff",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 1.5,
          mb: 3,
          minHeight: 150,
          "@keyframes billingUploadFloat": {
            "0%, 100%": {
              transform: "translateY(0px)",
            },
            "50%": {
              transform: "translateY(-10px)",
            },
          },
          "@keyframes billingUploadGlow": {
            "0%, 100%": {
              boxShadow: "0 20px 38px rgba(15, 23, 42, 0.2)",
            },
            "50%": {
              boxShadow: "0 28px 54px rgba(14, 165, 233, 0.24)",
            },
          },
          "@keyframes billingUploadBar": {
            "0%": {
              transform: "translateX(-120%)",
            },
            "100%": {
              transform: "translateX(220%)",
            },
          },
        }}
      >
        {[0, 1, 2].map((index) => (
          <Box
            key={index}
            sx={{
              width: { xs: 78, md: 94 },
              height: { xs: 106, md: 128 },
              borderRadius: "24px",
              background:
                index === 1
                  ? "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(241,245,249,0.96) 100%)"
                  : "linear-gradient(180deg, rgba(255,255,255,0.86) 0%, rgba(226,232,240,0.92) 100%)",
              border: "1px solid rgba(255,255,255,0.26)",
              transform:
                index === 0
                  ? "rotate(-10deg) translateY(14px)"
                  : index === 2
                    ? "rotate(10deg) translateY(14px)"
                    : "translateY(0)",
              animation: `billingUploadFloat 1.8s ease-in-out ${index * 0.18}s infinite, billingUploadGlow 1.8s ease-in-out ${index * 0.18}s infinite`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                p: 1.5,
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "18px",
                  background:
                    index === 1
                      ? "linear-gradient(180deg, rgba(224,242,254,1) 0%, rgba(186,230,253,0.88) 100%)"
                      : "linear-gradient(180deg, rgba(254,242,242,1) 0%, rgba(254,226,226,0.88) 100%)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    inset: "14px 16px auto 16px",
                    height: 6,
                    borderRadius: "999px",
                    backgroundColor: "rgba(255,255,255,0.7)",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    inset: "28px 16px auto 16px",
                    height: 6,
                    borderRadius: "999px",
                    backgroundColor: "rgba(255,255,255,0.52)",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    inset: "42px 16px auto 16px",
                    height: 6,
                    borderRadius: "999px",
                    backgroundColor: "rgba(255,255,255,0.4)",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    left: 16,
                    right: 16,
                    bottom: 14,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    sx={{
                      px: 1.15,
                      py: 0.45,
                      borderRadius: "999px",
                      backgroundColor: "rgba(255,255,255,0.88)",
                      color: index === 1 ? "#0369a1" : "#be123c",
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                    }}
                  >
                    {index === 1 ? "IMG" : "PDF"}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      <Typography
        sx={{
          fontSize: { xs: 24, md: 28 },
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: "-0.04em",
        }}
      >
        Загружаем изображения документа
      </Typography>
      <Typography
        sx={{
          mt: 1.25,
          color: "rgba(255,255,255,0.74)",
          fontSize: 15,
          lineHeight: 1.6,
        }}
      >
        {totalFiles
          ? `Отправляем ${formatBillingInteger(totalFiles)} файлов на сервер. Не закрывай страницу, пока загрузка не завершится.`
          : "Файлы отправляются на сервер. Не закрывай страницу, пока загрузка не завершится."}
      </Typography>

      <Box
        sx={{
          mt: 2.5,
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box
          sx={{
            px: 1.25,
            py: 0.8,
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.14)",
            backgroundColor: "rgba(255,255,255,0.08)",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          Документ: {formatBillingInteger(mainFiles)}
        </Box>
        {!facturFiles ? null : (
          <Box
            sx={{
              px: 1.25,
              py: 0.8,
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.14)",
              backgroundColor: "rgba(255,255,255,0.08)",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Счет-фактура: {formatBillingInteger(facturFiles)}
          </Box>
        )}
      </Box>

      <Box
        sx={{
          mt: 2.75,
          height: 10,
          borderRadius: "999px",
          overflow: "hidden",
          backgroundColor: "rgba(255,255,255,0.12)",
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            width: "38%",
            borderRadius: "999px",
            background: "linear-gradient(90deg, #38bdf8 0%, #22c55e 55%, #f59e0b 100%)",
            animation: "billingUploadBar 1.6s linear infinite",
          }}
        />
      </Box>
    </Box>
  );
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
    <div class="billing-dropzone-add-card">
      <span class="billing-dropzone-add-icon">+</span>
      <div class="billing-dropzone-add-title">Добавить файлы</div>
      <div class="billing-dropzone-add-subtitle">Нажми или перетащи ещё страницы документа</div>
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
    transition: "transform 0.18s ease, opacity 0.18s ease",
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
  "&.dropzone .billing-dropzone-add-card": {
    display: "none",
  },
  "&.dropzone.dz-started .dz-message": {
    gridColumn: "auto",
    minHeight: "auto",
    alignItems: "stretch",
    justifyContent: "stretch",
    textAlign: "left",
    order: 999,
  },
  "&.dropzone.dz-started .billing-dropzone-message": {
    width: "100%",
    maxWidth: "none",
    minHeight: 100,
    display: "flex",
  },
  "&.dropzone.dz-started .billing-dropzone-badge, &.dropzone.dz-started .billing-dropzone-title, &.dropzone.dz-started .billing-dropzone-subtitle":
    {
      display: "none",
    },
  "&.dropzone.dz-started .billing-dropzone-add-card": {
    width: "100%",
    minHeight: 100,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: "8px",
    padding: "18px 20px",
    borderRadius: "20px",
    border: "1.5px dashed rgba(2, 132, 199, 0.28)",
    background:
      "linear-gradient(180deg, rgba(240, 249, 255, 0.96) 0%, rgba(224, 242, 254, 0.88) 100%)",
    boxShadow: "0 16px 34px rgba(14, 165, 233, 0.10)",
    transition: "transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease",
  },
  "&.dropzone.dz-started .dz-message:hover .billing-dropzone-add-card": {
    transform: "translateY(-2px)",
    borderColor: "rgba(2, 132, 199, 0.42)",
    boxShadow: "0 20px 38px rgba(14, 165, 233, 0.16)",
  },
  "&.dropzone.dz-started .billing-dropzone-add-icon": {
    width: 38,
    height: 38,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    backgroundColor: "rgba(255,255,255,0.86)",
    color: "#0284c7",
    fontSize: "26px",
    fontWeight: 700,
    lineHeight: 1,
  },
  "&.dropzone.dz-started .billing-dropzone-add-title": {
    color: "#0f172a",
    fontSize: "17px",
    fontWeight: 800,
    lineHeight: 1.2,
  },
  "&.dropzone.dz-started .billing-dropzone-add-subtitle": {
    color: "#475569",
    fontSize: "13px",
    lineHeight: 1.45,
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
  "&.dropzone .dz-preview:hover": {
    zIndex: 2,
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
  "&.dropzone .dz-preview:hover .dz-image img": {
    transform: "none",
    filter: "none",
  },
  "&.dropzone .dz-preview.dz-file-preview .dz-image": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    padding: "24px",
    background:
      "linear-gradient(135deg, rgba(255, 247, 237, 1) 0%, rgba(254, 226, 226, 0.92) 100%)",
  },
  "&.dropzone .dz-preview.dz-file-preview .dz-image img": {
    display: "none",
  },
  "&.dropzone .dz-preview.dz-file-preview .dz-image::before": {
    content: '""',
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
    transition: "background-color 0.16s ease, border-color 0.16s ease",
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
  dictMaxFilesExceeded: "Нельзя загрузить больше {{maxFiles}} файлов",

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
  dictMaxFilesExceeded: "Нельзя загрузить больше {{maxFiles}} файлов",

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

      //window.location.pathname = "/billing";
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

  my_acces: [],

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

  DropzoneDop: null,

  bill_base_id: 0,

  dragIndex: null,

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

    const bill_items = res.bill_items.map((item) => {
      item.all_ed_izmer = item.pq_item.map((it) => {
        it = { name: `${it.name}`, id: it.id };
        return it;
      });

      item.fact_unit = Number(item.fact_unit).toFixed(2);
      item.price_item = item.price;
      item.price = getBillItemUnitPrice(item);

      const nds = get().check_nds_bill(
        (Number(item.price_w_nds) - Number(item.price_item)) / (Number(item.price_item) / 100),
      );

      if (nds) {
        item.nds = nds;
        item.summ_nds = (Number(item.price_w_nds) - Number(item.price_item)).toFixed(2);
      } else {
        item.summ_nds = (0).toFixed(2);
        item.nds = "";
      }

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
      point: point ?? [],
      point_name: point?.name ?? "",
      vendors: res?.vendors ?? [],
      vendor_name: res?.vendors[0]?.name ?? "",
      bill_list: res?.bill_hist,
      imgs_bill: res?.bill_imgs,
      allPrice,
      allPrice_w_nds,
      bill: res?.bill,
      bill_items,
      number: res.bill?.number,
      date: res.bill?.date && res.bill?.date !== "0000-00-00" ? dayjs(res.bill?.date) : null,
      date_items: res.bill?.date_items ? dayjs(res.bill?.date_items) : null,
      comment: res.bill?.comment,
      users: res?.users,
      user: res?.bill_users,
      types: types,
      type: parseInt(res?.bill?.type_bill) == 1 ? 2 : 4,
      doc_base_id: parseInt(res?.bill?.type_doc),
      is_load_store: false,

      number_factur: res.bill?.number_factur,
      date_factur: res.bill?.date_factur,
    });

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
    });
  },

  openImageBill: (image) => {
    get().handleResize();

    set({
      modalDialog: true,
      image,
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
    const search = event.target.value ? event.target.value : name ? name : "";

    console.log("search", search);

    if (search) {
      const docs = get().docs;
      const vendor_id = get().vendor?.id;
      const point = get().point;

      const vendor_items = get().vendor_items;

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
        vendor_items: res.items,
        vendor_itemsCopy: res.items,
        users: res.users,
        all_ed_izmer: [],
        pq: "",
        count: "",
        fact_unit: "",
        summ: "",
        sum_w_nds: "",
        bill_items_doc: res.billing_items,
        bill_base_id: billing_id,
      });

      res.billing_items.map((item) => {
        let test = res.items.filter((v) => parseInt(v.id) === parseInt(item.item_id));

        console.log("test_item", item, test);

        get().addItem_fast(
          item.count,
          item.count * item.pq,
          item.price,
          item.price_w_nds,
          item.ed_izmer_name,
          item.pq,
          item.item_id,
          test,
          test[0].accounting_system,
        );
      });
    } else {
      const point = get().point;
      const vendors = get().vendors;
      const docs = get().docs;

      if (point && vendors.length === 1 && docs.length) {
        const data = {
          point_id: point.id,
          vendor_id: vendor?.id,
        };

        const res = await get().getData("get_vendor_items", data);

        set({
          bill_items: [],
          bill_items_doc: [],
          vendor_items: res.items,
          vendor_itemsCopy: res.items,
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

    set({
      doc: search,
    });
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
        //search_item: '',
      });
    }

    set({
      search_item: search,
    });
  },

  changeCount: (event) => {
    const count = event.target.value;
    const numericPq = parseOcrNumericValue(get().pq);
    const numericCount = parseOcrNumericValue(count);
    const fact_unit =
      numericPq !== null && numericCount !== null ? (numericPq * numericCount).toFixed(2) : "";

    set({
      count,
      fact_unit: fact_unit ? fact_unit : "",
    });
  },

  reCount: () => {
    const count = get().count;
    const numericPq = parseOcrNumericValue(get().pq);
    const numericCount = parseOcrNumericValue(count);
    const fact_unit =
      numericPq !== null && numericCount !== null ? (numericPq * numericCount).toFixed(2) : "";

    set({
      fact_unit: fact_unit ? fact_unit : "",
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
        vendor_name: "",
        bill_items: [],
        bill_items_doc: [],
        vendor_items: [],
        vendor_itemsCopy: [],
        users: [],
        search_vendor: "",
        // vendor_items: res.items,
        // vendor_itemsCopy: res.items,
        // users: res.users,
        search_item: "",
        all_ed_izmer: [],
        pq: "",
        count: "",
        fact_unit: "",
        summ: "",
        sum_w_nds: "",
        doc: "",
      });
      // }
    }

    if (data === "type" && (parseInt(value) === 3 || parseInt(value) === 2)) {
      get().changeKinds(value);
    }

    if (data === "type") {
      if (parseInt(value) === 2 && parseInt(get().doc_base_id) == 5) {
        setTimeout(() => {
          if (document.getElementById("img_bill_type")) {
            set({
              DropzoneDop: new Dropzone("#img_bill_type", dropzoneOptions_bill_factur),
            });
          }
        }, 1000);
      } else {
        set({
          DropzoneDop: null,
        });
      }

      /*set({
        vendor_items: [],
        vendors: [],
        vendor_name: '',
      })*/
    }

    if (data === "doc_base_id") {
      if (parseInt(value) === 1 && parseInt(get().type) == 2) {
        setTimeout(() => {
          if (document.getElementById("img_bill_type")) {
            set({
              DropzoneDop: new Dropzone("#img_bill_type", dropzoneOptions_bill_factur),
            });
          }
        }, 1000);
      } else {
        set({
          DropzoneDop: null,
        });
      }
    }

    set({
      [data]: event.target.value,
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

    let bill_items = get().bill_items;

    console.log("bill_items_bill_items", bill_items);

    if (!count || !fact_unit || !summ || !sum_w_nds || !pq || !all_ed_izmer.length) {
      set({
        openAlert: true,
        err_status: false,
        err_text: "Необходимо выбрать Товар / кол-во Товара / указать суммы",
      });

      return;
    }

    const nds = get().check_nds_bill((Number(sum_w_nds) - Number(summ)) / (Number(summ) / 100));

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
    vendor_items[0].fact_unit = Number(fact_unit).toFixed(2);
    vendor_items[0].price_item = summ;
    vendor_items[0].price_w_nds = sum_w_nds;
    vendor_items[0].price = getBillItemUnitPrice(vendor_items[0]);

    const bill_items_doc = get().bill_items_doc;

    if (bill_items_doc.length) {
      // const item = bill_items_doc.find((it) => it.item_id === vendor_items[0].id);
      const item = bill_items_doc.find(
        (it) =>
          it.item_id === vendor_items[0].id && parseFloat(sum_w_nds) == parseFloat(it.price_w_nds),
      );

      item.fact_unit = (Number(item.count) * Number(item.pq)).toFixed(2);
      item.summ_nds = (Number(item.price_w_nds) - Number(item.price)).toFixed(2);

      const nds = get().check_nds_bill(
        (Number(item.price_w_nds) - Number(item.price)) / (Number(item.price) / 100),
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
    accounting_system,
    options = {},
  ) => {
    if (vendor_items.length == 0) {
      return;
    }

    const { preserveValues = false, nds = "", summ_nds = "" } = options;

    //const { count, fact_unit, summ, sum_w_nds, all_ed_izmer, pq, vendor_items } = get();

    let bill_items = JSON.parse(JSON.stringify(get().bill_items));

    console.log("stage1", get().bill_items);

    //const nds = get().check_nds_bill((Number(sum_w_nds) - Number(summ)) / (Number(summ) / 100))

    console.log("accounting_system", accounting_system);

    vendor_items[0].color = false;

    vendor_items[0].summ_nds = preserveValues ? summ_nds : "";
    vendor_items[0].nds = preserveValues ? nds : "";
    vendor_items[0].pq = preserveValues ? pq : "";
    vendor_items[0].all_ed_izmer = all_ed_izmer;
    vendor_items[0].count = preserveValues ? count : "";
    vendor_items[0].fact_unit = preserveValues ? fact_unit : "";
    vendor_items[0].price_item = preserveValues ? summ : "";
    vendor_items[0].price_w_nds = preserveValues ? sum_w_nds : "";
    vendor_items[0].price = getBillItemUnitPrice(vendor_items[0]);
    vendor_items[0].accounting_system = accounting_system;

    const bill_items_doc = get().bill_items_doc;

    console.log("stage1.5", get().bill_items_doc, sum_w_nds);
    console.log("stage1.7", vendor_items[0].id, sum_w_nds);

    if (bill_items_doc.length) {
      const item = bill_items_doc.find(
        (it) =>
          it.item_id === vendor_items[0].id && parseFloat(sum_w_nds) == parseFloat(it.price_w_nds),
      );

      // if(item){
      item.fact_unit = (Number(item.count) * Number(item.pq)).toFixed(2);
      item.summ_nds = (Number(item.price_w_nds) - Number(item.price)).toFixed(2);

      const nds = get().check_nds_bill(
        (Number(item.price_w_nds) - Number(item.price)) / (Number(item.price) / 100),
      );

      if (nds) {
        item.nds = nds;
      } else {
        item.nds = "";
      }

      vendor_items[0].data_bill = item;
      // }
    }

    console.log("stage2", vendor_items[0]);

    bill_items.push(vendor_items[0]);

    const allPrice = bill_items.reduce((all, item) => all + Number(item.price_item), 0).toFixed(2);
    const allPrice_w_nds = bill_items
      .reduce((all, item) => all + Number(item.price_w_nds), 0)
      .toFixed(2);

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
      const vendorItem = vendor_items.find((it) => parseInt(it.id) === parseInt(item["id"]));
      const priceCheck = getBillItemPriceCheckMeta(item, vendorItem);

      priceCheckLog.push({
        id: item?.id,
        name: item?.name ?? item?.item_name,
        vendor_price: Number.isFinite(priceCheck.vendorPrice)
          ? Number(priceCheck.vendorPrice.toFixed(2))
          : null,
        vendor_percent: Number.isFinite(priceCheck.vendorPercent) ? priceCheck.vendorPercent : null,
        allowed_min: Number.isFinite(priceCheck.allowedMin)
          ? Number(priceCheck.allowedMin.toFixed(2))
          : null,
        allowed_max: Number.isFinite(priceCheck.allowedMax)
          ? Number(priceCheck.allowedMax.toFixed(2))
          : null,
        bill_unit_price: Number.isFinite(priceCheck.billUnitPrice)
          ? Number(priceCheck.billUnitPrice.toFixed(2))
          : null,
        fact_unit: item?.fact_unit,
        total_with_vat: item?.price_w_nds,
        color: priceCheck.isError,
        status: priceCheck.isError ? "error" : "ok",
        reason: priceCheck.reason || null,
      });

      bill_items[key].price_check = priceCheck;

      if (priceCheck.isError) {
        bill_items[key].color = true;
        err_items.push(bill_items[key]);
      } else {
        bill_items[key].color = false;
      }
    });

    set({
      bill_items,
      err_items,
    });

    console.groupCollapsed(`Billing price check (${priceCheckLog.length})`);
    console.table(priceCheckLog);
    console.log("Billing price check errors", err_items);
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

  changeDataTable: (event, type, id, key) => {
    const value = event.target.value;

    let bill_items = JSON.parse(JSON.stringify(get().bill_items));

    bill_items = bill_items.map((item, index) => {
      if (item.id === id && key === index) {
        item[type] = value;
        const numericCount = parseOcrNumericValue(item.count);
        const numericPq = parseOcrNumericValue(item.pq);
        const numericValue = parseOcrNumericValue(value);

        if (type === "pq") {
          item.fact_unit =
            numericPq !== null && numericCount !== null ? (numericPq * numericCount).toFixed(2) : 0;
        }

        if (numericValue !== null && numericValue > 0 && type === "count") {
          item.fact_unit =
            numericValue !== null && numericPq !== null ? (numericValue * numericPq).toFixed(2) : 0;
        } else {
          if (type === "count") {
            item.fact_unit = 0;
          }

          //item.color = true;
        }

        if (type === "price_item" || type === "price_w_nds") {
          const nds = get().check_nds_bill(
            (Number(item.price_w_nds) - Number(item.price_item)) / (Number(item.price_item) / 100),
          );

          if (nds) {
            item.nds = nds;
            item.summ_nds = (Number(item.price_w_nds) - Number(item.price_item)).toFixed(2);
          } else {
            item.summ_nds = 0;
            item.nds = "";
          }
        }

        item.price = getBillItemUnitPrice(item);
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

function FormVendorItems({ showHeader = true }) {
  const [type, vendor_items, search_item, all_ed_izmer, changeCount, changeData, addItem] =
    useStore((state) => [
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
      {!showHeader ? null : (
        <Grid
          size={{
            xs: 12,
            sm: 12,
          }}
        >
          <h2>Товары поставщика</h2>
          <Divider style={{ backgroundColor: "rgba(0, 0, 0, 0.87)" }} />
        </Grid>
      )}
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
          data={vendor_items}
          value={search_item?.name}
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
        <MySelect
          label="Объем упаковки"
          multiple={false}
          data={formatBillingPackOptions(all_ed_izmer)}
          is_none={false}
          unifiedPopup
          value={findVendorPackOption(all_ed_izmer, pq)?.id ?? pq ?? ""}
          func={(event) => changeData("pq", event)}
        />
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
          decimalScale={BILLING_DECIMAL_SCALE}
          label="Кол-во упаковок"
          value={count}
          func={(event) => changeCount(getBillingDecimalEvent(event))}
          onBlur={(event) => changeCount(getBillingDecimalEvent(event, { fixed: true }))}
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
          value={formatBillingFieldValue(fact_unit)}
          className="disabled_input"
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

function VendorItemsTableEdit({ showHeader = true }) {
  const [type, deleteItem, changeDataTable, handleDrag, handleDrop] = useStore((state) => [
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

  console.log("bill_items", bill_items);

  return (
    <>
      {!showHeader ? null : (
        <Grid
          size={{
            xs: 12,
            sm: 12,
          }}
        >
          <h2>Товары в документе</h2>
          <Divider style={{ backgroundColor: "rgba(0, 0, 0, 0.87)" }} />
        </Grid>
      )}
      <Grid
        style={{ marginBottom: 20 }}
        size={{
          xs: 12,
          sm: 12,
        }}
      >
        <BillPriceWarningBanner count={err_items.length} />
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
                <TableCell style={{ minWidth: "130px" }}>Сумма без НДС</TableCell>
                <TableCell>Сумма НДС</TableCell>
                <TableCell style={{ minWidth: "130px" }}>Сумма с НДС</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bill_items.map((item, key) => (
                <React.Fragment key={key}>
                  {!item?.data_bill ? null : (
                    <TableRow
                      sx={item?.price_check?.isError ? billingPriceWarningRowSx : undefined}
                      draggable={true}
                      onDragStart={handleDrag}
                      onDrop={handleDrop}
                      id={key}
                      onDragOver={(ev) => ev.preventDefault()}
                    >
                      <TableCell rowSpan={2}>
                        <BillItemNameContent item={item} />
                      </TableCell>
                      <TableCell>До</TableCell>
                      <TableCell>
                        {formatBillingValueWithUnit(item?.data_bill?.pq, item.ed_izmer_name)}
                      </TableCell>
                      <TableCell>{formatBillingNumber(item?.data_bill?.count)}</TableCell>
                      <TableCell style={{ whiteSpace: "nowrap" }}>
                        {formatBillingValueWithUnit(item?.data_bill?.fact_unit, item.ed_izmer_name)}
                      </TableCell>
                      <TableCell>{item?.data_bill?.nds}</TableCell>
                      <TableCell>{formatBillingCurrency(item?.data_bill?.price)}</TableCell>
                      <TableCell style={{ whiteSpace: "nowrap" }}>
                        {formatBillingCurrency(item?.data_bill?.summ_nds)}
                      </TableCell>
                      <TableCell>{formatBillingCurrency(item?.data_bill?.price_w_nds)}</TableCell>
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
                      <TableCell rowSpan={2}>
                        {Number(item.count) === 0
                          ? formatBillingAmount(item.count)
                          : formatBillingUnitPrice(item.price_w_nds, item.fact_unit)}
                      </TableCell>
                    </TableRow>
                  )}

                  <TableRow
                    hover
                    sx={item?.price_check?.isError ? billingPriceWarningRowSx : undefined}
                    draggable={true}
                    onDragStart={handleDrag}
                    onDrop={handleDrop}
                    id={key}
                    onDragOver={(ev) => ev.preventDefault()}
                  >
                    {item?.data_bill ? null : (
                      <TableCell>
                        <BillItemNameContent item={item} />
                      </TableCell>
                    )}
                    {!item?.data_bill ? null : <TableCell>После</TableCell>}
                    <TableCell className="ceil_white">
                      <MySelect
                        label=""
                        data={formatBillingPackOptions(item.pq_item)}
                        multiple={false}
                        is_none={false}
                        unifiedPopup
                        value={findVendorPackOption(item.pq_item, item.pq)?.id ?? item.pq ?? ""}
                        func={(event) => changeDataTable(event, "pq", item.id, key)}
                      />
                    </TableCell>
                    <TableCell className="ceil_white">
                      <MyTextInput
                        type="text"
                        inputProps={{ inputMode: "decimal" }}
                        isDecimalMask
                        decimalScale={BILLING_DECIMAL_SCALE}
                        label=""
                        value={item.count}
                        func={(event) =>
                          changeDataTable(getBillingDecimalEvent(event), "count", item.id, key)
                        }
                        onBlur={(event) =>
                          changeDataTable(
                            getBillingDecimalEvent(event, { fixed: true }),
                            "count",
                            item.id,
                            key,
                          )
                        }
                      />
                    </TableCell>
                    <TableCell style={{ whiteSpace: "nowrap" }}>
                      {formatBillingValueWithUnit(item.fact_unit, item.ed_izmer_name)}
                    </TableCell>
                    <TableCell>{item.nds}</TableCell>
                    <TableCell className="ceil_white">
                      <MyTextInput
                        type="text"
                        inputProps={{ inputMode: "decimal" }}
                        isDecimalMask
                        decimalScale={BILLING_DECIMAL_SCALE}
                        label=""
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
                    <TableCell style={{ whiteSpace: "nowrap" }}>
                      {formatBillingCurrency(item.summ_nds)}
                    </TableCell>
                    <TableCell className="ceil_white">
                      <MyTextInput
                        type="text"
                        inputProps={{ inputMode: "decimal" }}
                        isDecimalMask
                        decimalScale={BILLING_DECIMAL_SCALE}
                        label=""
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
                        <TableCell>
                          {Number(item.count) === 0
                            ? formatBillingAmount(item.count)
                            : formatBillingUnitPrice(item.price_w_nds, item.fact_unit)}
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
                  <TableCell>{formatBillingCurrency(allPrice)}</TableCell>
                  <TableCell>{formatBillingCurrency(summ_nds)}</TableCell>
                  <TableCell>{formatBillingCurrency(allPrice_w_nds)}</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </>
  );
}

function VendorItemsTableView({ showHeader = true }) {
  const [deleteItem, changeDataTable] = useStore((state) => [
    state.deleteItem,
    state.changeDataTable,
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

  return (
    <>
      {!showHeader ? null : (
        <Grid
          size={{
            xs: 12,
            sm: 12,
          }}
        >
          <h2>Товары в документе</h2>
          <Divider style={{ backgroundColor: "rgba(0, 0, 0, 0.87)" }} />
        </Grid>
      )}
      <Grid
        style={{ marginBottom: 20 }}
        size={{
          xs: 12,
          sm: 12,
        }}
      >
        <BillPriceWarningBanner count={err_items.length} />
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
                <TableCell>Сумма без НДС</TableCell>
                <TableCell>Сумма НДС</TableCell>
                <TableCell>Сумма с НДС</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bill_items.map((item, key) => (
                <React.Fragment key={key}>
                  {!item?.data_bill ? null : (
                    <TableRow
                      sx={item?.price_check?.isError ? billingPriceWarningRowSx : undefined}
                    >
                      <TableCell rowSpan={2}>
                        <BillItemNameContent item={item} />
                      </TableCell>
                      <TableCell>До</TableCell>
                      <TableCell>
                        {formatBillingValueWithUnit(item?.data_bill?.pq, item.ed_izmer_name)}
                      </TableCell>
                      <TableCell>{formatBillingNumber(item?.data_bill?.count)}</TableCell>
                      <TableCell style={{ whiteSpace: "nowrap" }}>
                        {formatBillingValueWithUnit(item?.data_bill?.fact_unit, item.ed_izmer_name)}
                      </TableCell>
                      <TableCell>{item?.data_bill?.nds}</TableCell>
                      <TableCell>{formatBillingCurrency(item?.data_bill?.price)}</TableCell>
                      <TableCell style={{ whiteSpace: "nowrap" }}>
                        {formatBillingCurrency(item?.data_bill?.summ_nds)}
                      </TableCell>
                      <TableCell>{formatBillingCurrency(item?.data_bill?.price_w_nds)}</TableCell>
                      <TableCell rowSpan={2}></TableCell>
                      <TableCell rowSpan={2}>
                        {Number(item.count) === 0
                          ? formatBillingAmount(item.count)
                          : formatBillingUnitPrice(item.price_w_nds, item.count)}
                      </TableCell>
                    </TableRow>
                  )}

                  <TableRow
                    hover
                    sx={item?.price_check?.isError ? billingPriceWarningRowSx : undefined}
                  >
                    {item?.data_bill ? null : (
                      <TableCell>
                        <BillItemNameContent item={item} />
                      </TableCell>
                    )}
                    {!item?.data_bill ? null : <TableCell>После</TableCell>}
                    <TableCell className="ceil_white">{formatBillingNumber(item.pq)}</TableCell>
                    <TableCell className="ceil_white">{formatBillingNumber(item.count)}</TableCell>
                    <TableCell style={{ whiteSpace: "nowrap" }}>
                      {formatBillingValueWithUnit(item.fact_unit, item.ed_izmer_name)}
                    </TableCell>
                    <TableCell>{item.nds}</TableCell>
                    <TableCell className="ceil_white">
                      {formatBillingAmount(item.price_item)}
                    </TableCell>
                    <TableCell style={{ whiteSpace: "nowrap" }}>
                      {formatBillingCurrency(item.summ_nds)}
                    </TableCell>
                    <TableCell className="ceil_white">
                      {formatBillingAmount(item.price_w_nds)}
                    </TableCell>
                    {item?.data_bill ? null : (
                      <>
                        <TableCell></TableCell>
                        <TableCell>
                          {Number(item.count) === 0
                            ? formatBillingAmount(item.count)
                            : formatBillingUnitPrice(item.price_w_nds, item.count)}
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
                  <TableCell>{formatBillingCurrency(allPrice)}</TableCell>
                  <TableCell>{formatBillingCurrency(summ_nds)}</TableCell>
                  <TableCell>{formatBillingCurrency(allPrice_w_nds)}</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </>
  );
}

function VendorItemsTableView_min() {
  const [deleteItem, changeDataTable] = useStore((state) => [
    state.deleteItem,
    state.changeDataTable,
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

  return (
    <Box>
      <BillPriceWarningBanner count={err_items.length} />
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
              <TableCell>Сумма без НДС</TableCell>
              <TableCell>Сумма НДС</TableCell>
              <TableCell>Сумма с НДС</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bill_items.map((item, key) => (
              <React.Fragment key={key}>
                {!item?.data_bill ? null : (
                  <TableRow sx={item?.price_check?.isError ? billingPriceWarningRowSx : undefined}>
                    <TableCell rowSpan={2}>
                      <BillItemNameContent item={item} />
                    </TableCell>
                    <TableCell>До</TableCell>
                    <TableCell>
                      {formatBillingValueWithUnit(item?.data_bill?.pq, item.ed_izmer_name)}
                    </TableCell>
                    <TableCell>{formatBillingNumber(item?.data_bill?.count)}</TableCell>
                    <TableCell style={{ whiteSpace: "nowrap" }}>
                      {formatBillingValueWithUnit(item?.data_bill?.fact_unit, item.ed_izmer_name)}
                    </TableCell>
                    <TableCell>{item?.data_bill?.nds}</TableCell>
                    <TableCell>{formatBillingCurrency(item?.data_bill?.price)}</TableCell>
                    <TableCell style={{ whiteSpace: "nowrap" }}>
                      {formatBillingCurrency(item?.data_bill?.summ_nds)}
                    </TableCell>
                    <TableCell>{formatBillingCurrency(item?.data_bill?.price_w_nds)}</TableCell>
                  </TableRow>
                )}

                <TableRow
                  hover
                  sx={item?.price_check?.isError ? billingPriceWarningRowSx : undefined}
                >
                  {item?.data_bill ? null : (
                    <TableCell>
                      <BillItemNameContent item={item} />
                    </TableCell>
                  )}
                  {!item?.data_bill ? null : <TableCell>После</TableCell>}
                  <TableCell className="ceil_white">{formatBillingNumber(item.pq)}</TableCell>
                  <TableCell className="ceil_white">{formatBillingNumber(item.count)}</TableCell>
                  <TableCell style={{ whiteSpace: "nowrap" }}>
                    {formatBillingValueWithUnit(item.fact_unit, item.ed_izmer_name)}
                  </TableCell>
                  <TableCell>{item.nds}</TableCell>
                  <TableCell className="ceil_white">
                    {formatBillingAmount(item.price_item)}
                  </TableCell>
                  <TableCell style={{ whiteSpace: "nowrap" }}>
                    {formatBillingCurrency(item.summ_nds)}
                  </TableCell>
                  <TableCell className="ceil_white">
                    {formatBillingAmount(item.price_w_nds)}
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
                <TableCell>{formatBillingCurrency(allPrice)}</TableCell>
                <TableCell>{formatBillingCurrency(summ_nds)}</TableCell>
                <TableCell>{formatBillingCurrency(allPrice_w_nds)}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

function FormHeader_new({ page, type_edit }) {
  const [
    points,
    point_name,
    search_point,
    types,
    type,
    changeData,
    search_vendors,
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
    vendor_name,
  ] = useStore((state) => [
    state.points,
    state.point_name,
    state.search_point,
    state.types,
    state.type,
    state.changeData,
    state.search_vendors,
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
    state.vendor_name,
  ]);

  //doc

  console.log(kinds);
  console.log(doc_base_id);
  console.log(type);

  return (
    <>
      {page === "new" ? (
        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <MyAutocomplite2
            data={points}
            value={point_name}
            multiple={false}
            unifiedPopup
            disabled={type_edit === "edit" ? false : true}
            func={(event, name) => search_point(event, name)}
            onBlur={(event, name) => search_point(event, name)}
            label="Кафе"
          />
        </Grid>
      ) : (
        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <MyTextInput
            label="Кафе"
            disabled={type_edit === "edit" ? false : true}
            value={point_name}
            className="disabled_input"
          />
        </Grid>
      )}
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
          disabled={type_edit === "edit" ? false : true}
          func={(event) => changeData("type", event)}
          label="Тип"
        />
      </Grid>
      {page === "new" ? (
        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <MyAutocomplite2
            label="Поставщик"
            freeSolo={true}
            multiple={false}
            data={vendors}
            value={search_vendor}
            unifiedPopup
            disabled={type_edit === "edit" ? false : true}
            func={(event, name) => search_vendors(event, name)}
            onBlur={(event, name) => search_vendors(event, name)}
          />
        </Grid>
      ) : (
        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <MyTextInput
            label="Поставщик"
            disabled={type_edit === "edit" ? false : true}
            value={vendor_name}
            className="disabled_input"
          />
        </Grid>
      )}
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
              disabled={type_edit === "edit" ? false : true}
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
            ></Grid>
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
              disabled={type_edit === "edit" ? false : true}
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
            ></Grid>
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

function FormImage_new({
  type_edit,
  onOcrClick,
  isOcrLoad,
  isOcrDisabled,
  onAddFilesClick,
  mainDropzoneFilesCount = 0,
}) {
  const [
    type,
    doc_base_id,
    imgs_bill,
    openImageBill,
    fullScreen,
    imgs_factur,
    number_factur,
    changeInput,
    changeDateRange,
    date_factur,
  ] = useStore((state) => [
    state.type,
    state.doc_base_id,
    state.imgs_bill,
    state.openImageBill,
    state.fullScreen,
    state.imgs_factur,
    state.number_factur,
    state.changeInput,
    state.changeDateRange,
    state.date_factur,
  ]);

  const url = parseInt(type) === 1 ? "bill-ex-items/" : "bill/";

  return (
    <>
      {!imgs_bill.length ? null : (
        <Grid
          size={{
            xs: 12,
            sm: parseInt(type) === 2 && parseInt(doc_base_id) == 5 ? 6 : 12,
          }}
        >
          <TableContainer>
            <Grid
              style={{ fontWeight: "bold", gap: "10px" }}
              sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
                padding: 2,
                borderRadius: "22px",
                border: "1px solid rgba(148, 163, 184, 0.18)",
                backgroundColor: "rgba(255,255,255,0.74)",
              }}
            >
              {imgs_bill.map((img, key) => (
                <img
                  key={key}
                  src={"https://storage.yandexcloud.net/" + url + img}
                  alt="Image bill"
                  className="img_modal_bill"
                  onClick={() => openImageBill("https://storage.yandexcloud.net/" + url + img)}
                />
              ))}
            </Grid>
          </TableContainer>
        </Grid>
      )}
      {parseInt(type) === 2 && parseInt(doc_base_id) == 5 && !fullScreen && imgs_factur.length ? (
        <Grid
          style={{ fontWeight: "bold", gap: "10px" }}
          size={{
            xs: 12,
            sm: 6,
          }}
          sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
          }}
        >
          {imgs_factur.map((img, key) => (
            <img
              key={key}
              src={"https://storage.yandexcloud.net/bill/" + img}
              alt="Image bill"
              className="img_modal_bill"
              onClick={() => openImageBill("https://storage.yandexcloud.net/bill/" + img)}
            />
          ))}
        </Grid>
      ) : null}
      {type_edit === "edit" ? (
        <Grid
          size={{
            xs: 12,
            sm: parseInt(type) === 2 ? 6 : 12,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <Box
              component="div"
              className="dropzone"
              id="img_bill"
              sx={{
                ...billingDropzoneSx,
                flex: 1,
                minHeight: 180,
              }}
            />
            {mainDropzoneFilesCount > 0 && mainDropzoneFilesCount < 10 ? (
              <Box
                component="button"
                type="button"
                onClick={onAddFilesClick}
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
            ) : null}
            <Button
              variant="contained"
              color="info"
              onClick={onOcrClick}
              disabled={isOcrDisabled}
              sx={{
                minWidth: 160,
                alignSelf: "center",
                whiteSpace: "nowrap",
                borderRadius: "14px",
                px: 3,
                boxShadow: "0 12px 24px rgba(2, 132, 199, 0.22)",
              }}
            >
              {isOcrLoad ? "Распознаем..." : "Распознать"}
            </Button>
          </div>
        </Grid>
      ) : null}
      {type_edit === "edit" && parseInt(type) === 2 && parseInt(doc_base_id) == 5 && !fullScreen ? (
        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <Box
            component="div"
            className="dropzone"
            id="img_bill_type"
            sx={{
              ...billingDropzoneSx,
              minHeight: 150,
            }}
          />
        </Grid>
      ) : null}
      {parseInt(type) === 2 && parseInt(doc_base_id) == 5 && fullScreen ? (
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

          {!imgs_factur.length ? null : (
            <Grid
              size={{
                xs: 12,
              }}
            >
              <TableContainer>
                <Grid
                  style={{ fontWeight: "bold", gap: "10px" }}
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                  }}
                >
                  {imgs_factur.map((img, key) => (
                    <img
                      key={key}
                      src={"https://storage.yandexcloud.net/bill/" + img}
                      alt="Image bill"
                      className="img_modal_bill"
                      onClick={() => openImageBill("https://storage.yandexcloud.net/bill/" + img)}
                    />
                  ))}
                </Grid>
              </TableContainer>
            </Grid>
          )}

          {type_edit === "edit" ? (
            <Grid
              size={{
                xs: 12,
              }}
            >
              <Box
                component="div"
                className="dropzone"
                id="img_bill_type"
                sx={{
                  ...billingDropzoneSx,
                  minHeight: 150,
                }}
              />
            </Grid>
          ) : null}
        </>
      ) : null}
    </>
  );
}

function FormOther_new({ page, type_edit }) {
  const [
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
  ] = useStore((state) => [
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
  ]);

  return (
    <>
      {parseInt(type) === 1 ? null : (
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
              unifiedPopup
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
            <Typography></Typography>
          </Grid>

          <Grid
            style={{ display: "flex", marginBottom: 20 }}
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <Typography style={{ fontWeight: "bold", color: "#9e9e9e" }}>
              Комментарий бухгалтера:&nbsp;
            </Typography>
            <Typography>Переделать фото</Typography>
          </Grid>
        </>
      )}
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

// Аккродион с данными из накладной
class Billing_Accordion extends React.Component {
  shouldComponentUpdate(nextProps) {
    var array1 = nextProps.bill_list;
    var array2 = this.props.bill_list;

    var is_same =
      array1.length == array2.length &&
      array1.every(function (element, index) {
        return element === array2[index];
      });

    return !is_same;
  }

  render() {
    const { bill_list, bill_items, type } = this.props;

    return (
      <Grid
        size={{
          xs: 12,
          sm: 12,
        }}
        sx={{
          mb: 5,
        }}
      >
        <AccordionDetails>
          <AccordionSummary
            style={{ cursor: "default" }}
            expandIcon={<ExpandMoreIcon sx={{ opacity: 0 }} />}
            aria-controls="panel1a-content"
          >
            <Grid
              sx={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <Typography style={{ width: "1%" }}></Typography>
              <Typography style={{ width: "4%", minWidth: "210px" }}>
                Тип {type === "edit" ? " документа" : " накладной"}
              </Typography>
              <Typography style={{ width: "12%" }}>Бумажный носитель</Typography>
              <Typography style={{ width: "11%" }}></Typography>
              <Typography style={{ width: "11%" }}>
                Номер {type === "edit" ? " документа" : " накладной"}
              </Typography>
              <Typography style={{ width: "11%" }}>
                Дата в {type === "edit" ? " документе" : " накладной"}
              </Typography>
              <Typography style={{ width: "14%", minWidth: "200px" }}>Создатель</Typography>
              <Typography style={{ width: "10%" }}>Дата обновления</Typography>
              <Typography style={{ width: "14%", minWidth: "200px" }}>Редактор</Typography>
              <Typography style={{ width: "11%" }}>Время обновления</Typography>
              <Typography style={{ width: "8%" }}>Сумма с НДС</Typography>
            </Grid>
          </AccordionSummary>

          {bill_list.map((item, i) => (
            <Accordion key={i}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                className="accordion_summary"
                style={{ paddingRight: "1%" }}
              >
                <Grid
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <Typography
                    component="div"
                    style={{ width: "1%", backgroundColor: item.color, marginRight: "1%" }}
                  ></Typography>

                  <Typography
                    style={{
                      width: "4%",
                      minWidth: "210px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {item.name}
                  </Typography>

                  <Typography
                    className="checkbox_disable"
                    component="div"
                    style={{ width: "12%", display: "flex", alignItems: "center" }}
                  >
                    <MyCheckBox
                      value={parseInt(item.real_doc) == 1 ? true : false}
                      label=""
                      checked={false}
                    />
                  </Typography>

                  <Typography style={{ width: "11%", display: "flex", alignItems: "center" }}>
                    {item.number}
                  </Typography>

                  <Typography style={{ width: "11%", display: "flex", alignItems: "center" }}>
                    {item.date}
                  </Typography>

                  <Typography
                    style={{
                      width: "14%",
                      minWidth: "200px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {item.creator_id}
                  </Typography>

                  <Typography style={{ width: "10%", display: "flex", alignItems: "center" }}>
                    {item.date_update}
                  </Typography>

                  <Typography
                    style={{
                      width: "14%",
                      minWidth: "200px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {item.editor_id}
                  </Typography>

                  <Typography style={{ width: "11%", display: "flex", alignItems: "center" }}>
                    {item.time_update}
                  </Typography>

                  <Typography style={{ width: "8%", display: "flex", alignItems: "center" }}>
                    {formatBillingCurrency(item.sum_w_nds)}
                  </Typography>
                </Grid>
              </AccordionSummary>

              <AccordionDetails style={{ width: "100%" }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                      <TableCell>Товар</TableCell>
                      <TableCell>Объем упак.</TableCell>
                      <TableCell>Кол-во упак.</TableCell>
                      <TableCell>Кол-во</TableCell>
                      <TableCell>Сумма с НДС</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {bill_items?.map((item, key) => (
                      <TableRow
                        key={key}
                        hover
                      >
                        <TableCell> {item.item_name} </TableCell>
                        <TableCell>
                          {formatBillingValueWithUnit(item.pq, item.ed_izmer_name)}
                        </TableCell>
                        <TableCell>{formatBillingNumber(item.count)}</TableCell>
                        <TableCell>
                          {formatBillingValueWithUnit(item.fact_unit, item.ed_izmer_name)}
                        </TableCell>
                        <TableCell>{formatBillingCurrency(item.price_w_nds)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionDetails>
            </Accordion>
          ))}
        </AccordionDetails>
      </Grid>
    );
  }
}

const ZOOM_STEP = 0.2;

// модалка просмотра фото/картинок документов
class Billing_Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      drag: { x: 0, y: 0 },
      rotate: 0,
      scaleX: 1,
      scaleY: 1,
      vertical: false,
      horizontal: true,
      initialScaleSet: false,
    };
    this.containerRef = React.createRef();
  }

  componentDidMount() {
    window.addEventListener("keydown", this.handleKeyDown);
    this.props.store.set_position(true, false);
    this.loadImageDimensions(this.props.image);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.image !== this.props.image) {
      this.setState(
        {
          drag: { x: 0, y: 0 },
          rotate: 0,
          scaleX: 1,
          scaleY: 1,
          vertical: false,
          horizontal: true,
          initialScaleSet: false,
        },
        () => {
          this.props.store.set_position(true, false);
          this.loadImageDimensions(this.props.image);
        },
      );
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
    if (event.key === "Escape") {
      this.props.onClose();
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

  getImageLabel() {
    const rawPath = String(this.props.image ?? "");

    if (!rawPath) {
      return "Изображение документа";
    }

    try {
      const cleanPath = rawPath.split("?")[0];
      const fileName = cleanPath.split("/").filter(Boolean).pop();

      return decodeURIComponent(fileName || cleanPath);
    } catch (err) {
      return rawPath;
    }
  }

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

    this.setState({
      vertical: nextVertical,
      horizontal: false,
    });
  }

  setSplitHorizontal() {
    const nextHorizontal = !this.state.horizontal;

    this.props.store.set_position(nextHorizontal, false);

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

  renderActionButton({ label, icon, onClick, isAccent = false }) {
    return (
      <MyTooltip name={label}>
        <IconButton
          onClick={onClick}
          sx={{
            width: 42,
            height: 42,
            borderRadius: "14px",
            backgroundColor: isAccent ? "rgba(219, 39, 119, 0.12)" : "rgba(255,255,255,0.9)",
            color: isAccent ? "#be185d" : "#334155",
            border: isAccent
              ? "1px solid rgba(219, 39, 119, 0.18)"
              : "1px solid rgba(148, 163, 184, 0.22)",
            boxShadow: "0 10px 22px rgba(15, 23, 42, 0.12)",
            "&:hover": {
              backgroundColor: isAccent ? "rgba(219, 39, 119, 0.18)" : "#ffffff",
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
    const isSplitMode = this.state.vertical || this.state.horizontal;
    const zoomPercent = `${Math.round(Math.max(this.state.scaleX, this.state.scaleY) * 100)}%`;
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
          {this.renderActionButton({
            label: isSplitMode ? "Развернуть на весь экран" : "Сравнить с формой",
            icon: <HorizontalSplitIcon />,
            onClick: this.setSplitHorizontal.bind(this),
            isAccent: isSplitMode,
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
                backgroundColor: "rgba(2, 6, 23, 0.72)",
                backdropFilter: "blur(8px)",
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
              Потяни изображение внутри области просмотра, чтобы быстро сверить документ с формой.
            </Box>
          </Box>
        </Box>
      </DndContext>
    );
  }
}

class Billing_Edit_ extends React.Component {
  myDropzone = null;
  isClick = false;

  constructor(props) {
    super(props);

    this.state = {
      module: "billing",
      module_name: "",
      is_load: false,
      isUploadProcessing: false,
      uploadBackdropMeta: {
        mainFiles: 0,
        facturFiles: 0,
      },

      items_err: [],
      modelCheckErrItems: false,

      thisTypeSave: "",

      acces: null,
      isOcrLoad: false,
      mainDropzoneFilesCount: 0,
      ocrImageFilesCount: 0,
      ocrResolveDialog: false,
      ocrResolveItems: [],
    };
  }

  async componentDidMount() {
    const { clearForm } = this.props.store;

    clearForm();

    this.setState({
      thisTypeSave: "",
    });

    const res = await this.getData("get_all_for_new");

    this.setState({
      acces: res?.acces,
    });

    const { setAcces, setPoints } = this.props.store;

    setAcces(res?.acces);
    setPoints(res?.points);

    document.title = "Накладные";

    setTimeout(() => {
      this.myDropzone = new Dropzone("#img_bill", dropzoneOptions_bill);
      this.bindOcrDropzoneEvents();
    }, 500);
  }

  componentWillUnmount() {
    if (!this.myDropzone) {
      return;
    }

    ["addedfile", "removedfile", "canceled", "error", "reset"].forEach((eventName) => {
      this.myDropzone.off?.(eventName, this.syncDropzoneCounts);
    });
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

  getMainDropzoneFiles = () => {
    const dropzoneFiles = this.myDropzone?.files ?? [];

    return dropzoneFiles.filter(
      (file) =>
        file && file.accepted !== false && file.status !== "canceled" && file.status !== "error",
    );
  };

  getOcrImageFiles = () => {
    return this.getMainDropzoneFiles().filter((file) => isImageDropzoneFile(file));
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

  bindOcrDropzoneEvents = () => {
    if (!this.myDropzone) {
      return;
    }

    ["addedfile", "removedfile", "canceled", "error", "reset"].forEach((eventName) => {
      this.myDropzone.off?.(eventName, this.syncDropzoneCounts);
      this.myDropzone.on?.(eventName, this.syncDropzoneCounts);
    });

    this.syncDropzoneCounts();
  };

  openMainDropzonePicker = () => {
    if (!this.myDropzone || this.state.mainDropzoneFilesCount >= 10) {
      return;
    }

    this.myDropzone.hiddenFileInput?.click?.();
  };

  clearBillItemsForOcr = () => {
    const { setData } = this.props.store;

    setData({
      bill_items: [],
      allPrice: 0,
      allPrice_w_nds: 0,
      err_items: [],
    });

    this.setState({
      items_err: [],
      modelCheckErrItems: false,
      ocrResolveDialog: false,
      ocrResolveItems: [],
    });
  };

  sendFilesToOcr = async () => {
    const { showAlert, point, type } = this.props.store;

    if (!point?.id) {
      showAlert(false, "Сначала выбери кафе");

      return;
    }

    if (!type) {
      showAlert(false, "Сначала выбери тип документа");

      return;
    }

    const imageFiles = this.getOcrImageFiles();

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

    const resolvedPq = normalizeOcrText(resolvedPackOption?.name ?? resolvedPackOption?.id);
    const { count, pq, factUnit } = getOcrQuantityData(ocrItem, resolvedPq);
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

    store.addItem_fast(
      count,
      factUnit,
      priceItem,
      priceWithVat,
      matchedVendorItem?.ed_izmer_name ?? ocrItem?.unit ?? "",
      pq,
      matchedVendorItem?.id ?? matchedVendorItem?.item_id ?? ocrItem?.matched_id,
      [JSON.parse(JSON.stringify(matchedVendorItem))],
      matchedVendorItem?.accounting_system,
      {
        preserveValues: true,
        nds,
        summ_nds: summNds,
      },
    );

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
    const sellerData = getFirstOcrSellerData(parsedDocuments);
    const ocrItems = getMergedOcrItems(parsedDocuments);

    let storeState = useStore.getState();

    if (!storeState.type) {
      await store.changeData("type", { target: { value: "2" } });
      storeState = useStore.getState();
    }

    const vendorName = getOcrVendorName(sellerData);
    const invoiceDate = parseOcrDate(invoice?.date);

    const nextOcrState = {};

    if (normalizeOcrText(invoice?.number)) {
      nextOcrState.number = normalizeOcrText(invoice.number);
    }

    if (invoiceDate) {
      nextOcrState.date = invoiceDate;
    }

    if (vendorName) {
      nextOcrState.search_vendor = vendorName;
      nextOcrState.vendor_name = vendorName;
    }

    const resolvedOcrVendor = getOcrVendorValue(sellerData);

    if (resolvedOcrVendor?.id) {
      nextOcrState.vendor = resolvedOcrVendor;
    }

    if (Object.keys(nextOcrState).length) {
      store.setData(nextOcrState);
    }

    storeState = useStore.getState();

    if (!storeState.point?.id) {
      return {
        status: true,
        message: "OCR заполнил номер, дату и поставщика. Выбери кафе, чтобы подставить товары.",
      };
    }

    if (!storeState.vendorsCopy?.length) {
      const vendorsRes = await store.getData("get_vendors", {
        point_id: storeState.point.id,
        type: storeState.type,
      });

      store.setData({
        vendors: vendorsRes?.vendors ?? [],
        vendorsCopy: vendorsRes?.vendors ?? [],
      });

      storeState = useStore.getState();
    }

    const resolvedVendor =
      storeState.vendorsCopy.find(
        (vendor) =>
          resolvedOcrVendor?.id && parseInt(vendor?.id) === parseInt(resolvedOcrVendor.id),
      ) ??
      storeState.vendorsCopy.find(
        (vendor) => normalizeOcrSearchValue(vendor?.name) === normalizeOcrSearchValue(vendorName),
      ) ??
      storeState.vendor;

    if (!resolvedVendor?.id) {
      return {
        status: true,
        message: "OCR заполнил реквизиты, но поставщик не найден в списке выбранной точки.",
      };
    }

    const vendorData = {
      point_id: storeState.point.id,
      vendor_id: resolvedVendor.id,
    };

    const vendorItemsRes = await store.getData("get_vendor_items", vendorData);
    const docsRes = await store.getData("get_base_doc", vendorData);

    const vendorItems = vendorItemsRes?.items ?? [];

    store.setData({
      vendor: resolvedVendor,
      vendor_name: resolvedVendor.name,
      search_vendor: resolvedVendor.name,
      vendor_items: vendorItems,
      vendor_itemsCopy: vendorItems,
      users: vendorItemsRes?.users ?? [],
      docs: docsRes?.billings ?? [],
      doc: "",
      bill_items: [],
      allPrice: 0,
      allPrice_w_nds: 0,
      err_items: [],
    });

    let addedItems = 0;
    const unresolvedItems = [];

    ocrItems.forEach((ocrItem, index) => {
      const matchedVendorItem = findMatchedVendorItem(vendorItems, ocrItem);
      const suggestedVendorItem =
        matchedVendorItem ?? findSuggestedVendorItem(vendorItems, ocrItem);
      const resolvedPackOption = getResolvedVendorPackOption(suggestedVendorItem, ocrItem);

      if (!matchedVendorItem || !resolvedPackOption) {
        console.warn("OCR item requires moderation", {
          ocrItem,
          matchedVendorItem,
          suggestedVendorItem,
          resolvedPackOption,
        });
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
        message: `OCR заполнил документ: добавлено ${addedItems} поз. Для ${unresolvedItems.length} поз. нужна ручная модерация.`,
      };
    }

    return {
      status: true,
      message: `OCR заполнил документ: добавлено ${addedItems} поз.`,
    };
  };

  async saveNewBill(type_save, check_err = true) {
    if (this.isClick === true) return;

    this.isClick = true;

    if (type_save != "type") {
      this.setState({
        thisTypeSave: type_save,
      });
    } else {
      type_save = this.state.thisTypeSave;
    }

    const {
      bill_base_id,
      vendor,
      err_items,
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
    } = this.props.store;

    this.setState({
      modelCheckErrItems: false,
    });

    let doc_info = docs.find((item_doc) => item_doc.name === doc);

    const dateBill = date ? dayjs(date).format("YYYY-MM-DD") : "";
    const dateFactur = date_factur ? dayjs(date_factur).format("YYYY-MM-DD") : "";
    const dateItems = date_items ? dayjs(date_items).format("YYYY-MM-DD") : "";

    var items_color = [];

    let new_bill_items = bill_items.filter(
      (item) =>
        item.fact_unit.length == 0 || item.price_item.length == 0 || item.price_w_nds.length == 0,
    );

    if (new_bill_items.length > 0) {
      showAlert(false, "Не все даныне в товаре заполнены");

      this.isClick = false;

      return;
    }

    console.log("save bill_items", bill_items);

    const items = bill_items.reduce((newItems, item) => {
      let it = {};

      it.pq = item.pq;
      it.count = item.count;
      // it.item_id = item.id;
      it.item_id = !item.item_id || item.item_id == "" ? item.id : item.item_id;
      it.summ = item.price_item;
      it.summ_w_nds = item.price_w_nds;
      it.color = item.color;

      if (item.color && item.color === true) {
        items_color.push(item);
      }

      const nds = item.nds.split(" %")[0];

      if (nds === "без НДС") {
        it.nds = -1;
      } else {
        it.nds = nds;
      }

      newItems.push(it);

      return newItems;
    }, []);

    console.log("save items", items);

    if (check_err === true && items_color.length > 0) {
      this.setState({
        items_err: items_color,
        modelCheckErrItems: true,
      });

      this.isClick = false;

      return;
    }

    if (!this.myDropzone || this.myDropzone["files"].length === 0) {
      showAlert(false, "Нет изображений документа");

      this.isClick = false;

      return;
    }

    if (
      parseInt(type) == 2 &&
      parseInt(doc_base_id) == 5 &&
      (!DropzoneDop || DropzoneDop["files"].length === 0)
    ) {
      showAlert(false, "Нет изображений счет-фактуры");

      this.isClick = false;

      return;
    }

    if (parseInt(type) == 1) {
      this.myDropzone.options.url = url_bill_ex;
      type_bill = "bill_ex";
      is_return = true;
    } else {
      this.myDropzone.options.url = url_bill;
      type_bill = "bill";
      is_return = true;
    }

    if (!DropzoneDop || DropzoneDop["files"].length === 0) {
      is_return = true;
    }

    const data = {
      doc_info,
      type,
      items,
      number,
      comment,
      is_new_doc,
      users: user,
      doc_base_id,
      number_factur,
      date: dateBill,
      date_items: dateItems,
      date_factur: dateFactur,
      point_id: point?.id ?? "",
      vendor_id: vendor?.id,
      imgs: this.myDropzone["files"].length,
      type_save: type_save,
      err_items: items_color,
      bill_base_id: bill_base_id,
    };

    const res = await this.getData("save_new", data);

    if (res.st === true) {
      if (res?.text && res.text.length > 0) {
        showAlert(res.st, res.text);
      }

      global_point_id = point?.id;
      global_new_bill_id = res.bill_id;

      const mainUploadFiles = this.getPendingDropzoneFiles(this.myDropzone);
      const facturUploadFiles =
        parseInt(type) == 2 && DropzoneDop ? this.getPendingDropzoneFiles(DropzoneDop) : [];
      const uploadTargets = [
        mainUploadFiles.length ? { dropzone: this.myDropzone } : null,
        facturUploadFiles.length ? { dropzone: DropzoneDop } : null,
      ].filter(Boolean);

      is_return = false;

      this.setState({
        isUploadProcessing: uploadTargets.length > 0,
        uploadBackdropMeta: {
          mainFiles: mainUploadFiles.length,
          facturFiles: facturUploadFiles.length,
        },
      });

      const uploadPromises = uploadTargets.map(({ dropzone }) =>
        this.waitForDropzoneQueue(dropzone),
      );

      this.myDropzone.processQueue();

      if (parseInt(type) == 2 && DropzoneDop && facturUploadFiles.length > 0) {
        DropzoneDop.processQueue();
      }

      const uploadResults = await Promise.all(uploadPromises);
      const hasUploadErrors = uploadResults.some((item) => item.hasErrors);

      this.setState({
        isUploadProcessing: false,
        uploadBackdropMeta: {
          mainFiles: 0,
          facturFiles: 0,
        },
      });

      this.isClick = false;

      if (hasUploadErrors) {
        showAlert(false, "Документ сохранен, но часть изображений не загрузилась");
        return;
      }

      window.location = "/billing";
    } else {
      this.isClick = false;
      showAlert(res.st, res.text);
    }
  }

  returnFN() {
    const { clearForm } = this.props.store;

    clearForm();
    window.location = "/billing";
  }

  render() {
    const {
      isPink,
      openAlert,
      err_status,
      err_text,
      closeAlert,
      is_load_store,
      vendor_itemsCopy,
      modalDialog,
      fullScreen,
      image,
      closeDialog,
      bill,
      bill_list,
      is_horizontal,
      is_vertical,
    } = this.props.store;

    return (
      <>
        <Backdrop
          sx={{
            zIndex: 99,
            backgroundColor: this.state.isUploadProcessing
              ? "rgba(15, 23, 42, 0.56)"
              : "rgba(15, 23, 42, 0.42)",
            backdropFilter: this.state.isUploadProcessing ? "blur(8px)" : "none",
          }}
          open={
            this.state.is_load ||
            this.state.isOcrLoad ||
            this.state.isUploadProcessing ||
            is_load_store
          }
        >
          {this.state.isUploadProcessing ? (
            <BillingUploadBackdropContent
              mainFiles={this.state.uploadBackdropMeta?.mainFiles}
              facturFiles={this.state.uploadBackdropMeta?.facturFiles}
            />
          ) : (
            <CircularProgress color="inherit" />
          )}
        </Backdrop>
        {!modalDialog ? null : (
          <Billing_Modal
            onClose={closeDialog}
            fullScreen={fullScreen}
            image={image}
            store={this.props.store}
          />
        )}
        <MyAlert
          isOpen={openAlert}
          onClose={closeAlert}
          status={err_status}
          text={err_text}
        />
        <Dialog
          open={this.state.modelCheckErrItems}
          onClose={() => {
            this.setState({ modelCheckErrItems: false });
          }}
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
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: "stretch",
              gap: 1.25,
              px: { xs: 2.5, md: 4 },
              py: { xs: 2, md: 2.5 },
              mt: 2,
              borderTop: "1px solid rgba(148, 163, 184, 0.16)",
              backgroundColor: "rgba(248, 250, 252, 0.88)",
              position: { xs: "sticky", sm: "static" },
              bottom: 0,
              zIndex: 2,
              "& > :not(style)": {
                m: 0,
              },
            }}
          >
            <Button
              variant="outlined"
              onClick={() => {
                this.setState({ modelCheckErrItems: false });
              }}
              color="inherit"
              sx={{
                minWidth: { xs: 0, sm: 150 },
                width: { xs: "100%", sm: "auto" },
                height: 48,
                borderRadius: "14px",
              }}
            >
              Вернуться
            </Button>
            <Button
              variant="contained"
              onClick={this.saveNewBill.bind(this, "type", false)}
              color="success"
              sx={{
                minWidth: { xs: 0, sm: 210 },
                width: { xs: "100%", sm: "auto" },
                height: 48,
                borderRadius: "14px",
                boxShadow: "none",
              }}
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
                          {normalizeOcrText(item.ocrItem?.name) ||
                            `Строка ${item.ocrItem?.line ?? index + 1}`}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.75 }}
                        >
                          Строка: {item.ocrItem?.line ?? index + 1}
                        </Typography>
                        {!normalizeOcrText(item.ocrItem?.__ocr_file_name) ? null : (
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
                          OCR: {formatBillingNumber(item.ocrItem?.quantity)}
                          {formatBillingNumber(item.ocrItem?.quantity) === "—" ? "" : " упак."}
                          {normalizeOcrText(item.ocrItem?.pq)
                            ? ` x ${formatBillingNumber(item.ocrItem?.pq)}`
                            : ""}
                          {item.selectedPq
                            ? ` = ${formatBillingNumber(
                                getOcrQuantityData(
                                  item.ocrItem,
                                  normalizeOcrText(item.selectedPq?.name ?? item.selectedPq?.id),
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
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: "stretch",
              gap: 1.25,
              px: { xs: 2.5, md: 4 },
              py: { xs: 2, md: 2.5 },
              mt: 2,
              borderTop: "1px solid rgba(148, 163, 184, 0.16)",
              backgroundColor: "rgba(248, 250, 252, 0.88)",
              position: { xs: "sticky", sm: "static" },
              bottom: 0,
              zIndex: 2,
              "& > :not(style)": {
                m: 0,
              },
            }}
          >
            <Button
              variant="outlined"
              onClick={this.closeOcrResolveDialog}
              color="inherit"
              sx={{
                minWidth: { xs: 0, sm: 150 },
                width: { xs: "100%", sm: "auto" },
                height: 48,
                borderRadius: "14px",
              }}
            >
              Пропустить
            </Button>
            <Button
              variant="contained"
              onClick={this.applyOcrResolveItems}
              color="success"
              sx={{
                minWidth: { xs: 0, sm: 240 },
                width: { xs: "100%", sm: "auto" },
                height: 48,
                borderRadius: "14px",
                boxShadow: "none",
              }}
            >
              Добавить выбранные
            </Button>
          </DialogActions>
        </Dialog>
        <Box
          sx={{
            minHeight: "100vh",
            background: "linear-gradient(180deg, #f6f1ea 0%, #f8fafc 46%, #ffffff 100%)",
            ...billingPageFieldSx,
          }}
        >
          <Grid
            container
            spacing={{ xs: 2.5, md: 3 }}
            style={{
              marginTop: "64px",
              maxWidth: is_vertical ? "50%" : "100%",
              marginBottom: is_horizontal ? 700 : 30,
            }}
            sx={{
              mb: 10,
              mx: "auto",
              px: { xs: 2, md: 3 },
              pt: { xs: 3, md: 4 },
            }}
          >
            <BillingPageHero
              onBack={this.returnFN.bind(this)}
              title="Новый документ"
              subtitle="Собери накладную в одном потоке: проверь реквизиты, загрузи фотографии, распознай OCR и сразу отмодерируй позиции перед сохранением."
            />

            <BillingSection
              eyebrow="Шаг 1"
              title="Реквизиты документа"
              description="Выбери кафе, тип документа и поставщика, затем проверь номер и даты до загрузки позиций."
            >
              <FormHeader_new
                page={"new"}
                type_edit={parseInt(this.state.acces?.header) == 1 ? "edit" : "show"}
              />
            </BillingSection>

            <BillingSection
              eyebrow="Шаг 2"
              title="Файлы и распознавание"
              description="Добавь фото или сканы документа. После загрузки можно сразу запустить OCR и быстро заполнить реквизиты и товары."
            >
              <FormImage_new
                type_edit={parseInt(this.state.acces?.photo) == 1 ? "edit" : "show"}
                onOcrClick={this.sendFilesToOcr}
                isOcrLoad={this.state.isOcrLoad}
                onAddFilesClick={this.openMainDropzonePicker}
                mainDropzoneFilesCount={this.state.mainDropzoneFilesCount}
                isOcrDisabled={
                  this.state.isOcrLoad ||
                  !this.props.store.point?.id ||
                  !this.props.store.type ||
                  this.state.ocrImageFilesCount === 0
                }
              />
            </BillingSection>

            {parseInt(this.state.acces?.items) == 1 ? (
              <>
                <BillingSection
                  eyebrow="Шаг 3"
                  title="Подбор товара поставщика"
                  description="Найди товар поставщика, выбери упаковку и добавь строку вручную, если OCR не справился или нужно скорректировать позицию."
                >
                  <FormVendorItems showHeader={false} />
                </BillingSection>

                <BillingSection
                  eyebrow="Шаг 4"
                  title="Товары в документе"
                  description="Проверь упаковку, суммы и предупреждения по ценнику. Проблемные строки подсветятся автоматически."
                >
                  <VendorItemsTableEdit showHeader={false} />
                </BillingSection>
              </>
            ) : (
              <BillingSection
                eyebrow="Шаг 3"
                title="Товары в документе"
                description="Здесь собраны все позиции документа, включая строки, полученные из OCR."
              >
                <VendorItemsTableView showHeader={false} />
              </BillingSection>
            )}

            <BillingSection
              eyebrow="Шаг 5"
              title="Комментарий и приемка"
              description="Добавь служебный комментарий, дату разгрузки и сотрудников, если это нужно для дальнейшего маршрута документа."
            >
              <FormOther_new
                page={"new"}
                type_edit={parseInt(this.state.acces?.footer) == 1 ? "edit" : "show"}
              />
            </BillingSection>

            {!bill_list.length ? null : (
              <BillingSection
                eyebrow="История"
                title="Связанные документы"
                description="Сравни текущую накладную с предыдущими версиями и быстро проверь изменения по позициям."
              >
                <Billing_Accordion
                  bill_list={bill_list}
                  bill_items={bill_items}
                  type="new"
                />
              </BillingSection>
            )}

            {parseInt(this.state.acces?.only_save) === 0 &&
            parseInt(this.state.acces?.save_send) === 0 ? null : (
              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    ...billingSectionPaperSx,
                    background:
                      "linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.98) 100%)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 24px 50px rgba(15, 23, 42, 0.18)",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      alignItems: { xs: "stretch", md: "center" },
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          textTransform: "uppercase",
                          letterSpacing: "0.14em",
                          fontSize: 12,
                          fontWeight: 700,
                          color: "rgba(255,255,255,0.68)",
                          mb: 0.75,
                        }}
                      >
                        Финальный шаг
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: { xs: 24, md: 28 },
                          fontWeight: 800,
                          letterSpacing: "-0.03em",
                          mb: 0.75,
                        }}
                      >
                        Сохранение документа
                      </Typography>
                      <Typography sx={{ color: "rgba(255,255,255,0.72)", maxWidth: 640 }}>
                        Когда все позиции проверены, сохрани документ или сразу отправь его дальше
                        по процессу.
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        gap: 1.5,
                        width: { xs: "100%", md: "auto" },
                      }}
                    >
                      {parseInt(this.state.acces?.only_save) === 0 ? null : (
                        <Button
                          variant="contained"
                          color="success"
                          onClick={this.saveNewBill.bind(this, "current", true)}
                          sx={{
                            minWidth: { xs: "100%", sm: 180 },
                            height: 48,
                            borderRadius: "14px",
                            boxShadow: "none",
                          }}
                        >
                          Сохранить
                        </Button>
                      )}

                      {parseInt(this.state.acces?.save_send) === 0 ? null : (
                        <Button
                          variant="contained"
                          color="info"
                          onClick={this.saveNewBill.bind(this, "next", true)}
                          sx={{
                            minWidth: { xs: "100%", sm: 220 },
                            height: 48,
                            borderRadius: "14px",
                            boxShadow: "none",
                          }}
                        >
                          Сохранить и отправить
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
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

export default function BillingNew() {
  return <Billing_Edit_Store />;
}
