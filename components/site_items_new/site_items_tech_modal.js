import React from "react";
import { formatDate } from "@/src/helpers/ui/formatDate";
import dayjs from "dayjs";
import MyAlert from "@/ui/MyAlert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { MyAutocomplite, MyDatePickerNew, MySelect, MyTextInput } from "@/ui/Forms";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dropzone from "dropzone";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import TabList from "@mui/lab/TabList";
import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";
const roundTo = (value, decimals) => {
  return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
};

const brandRed = "#DD1A32";
const blockBackground = "#F3F3F3";
const blockBorder = "#E5E5E5";
const textPrimary = "#3C3B3B";
const textSecondary = "#5E5E5E";
const modalSections = [
  {
    value: "0",
    label: "Основные",
    description: "Наименование, категория и изображение",
  },
  {
    value: "1",
    label: "БЖУ",
    description: "Вес, порция и пищевая ценность",
  },
  {
    value: "2",
    label: "Описание",
    description: "Тексты для карточки и списка",
  },
  {
    value: "3",
    label: "Теги",
    description: "Теги и промо-маркеры",
  },
  {
    value: "4",
    label: "Активность",
    description: "Публикация и продажи",
  },
  {
    value: "5",
    label: "Состав",
    description: "Тайминги, заготовки и позиции",
  },
];

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}
export class SiteItemsModalTech extends React.Component {
  dropzoneOptions = {
    autoProcessQueue: false,
    autoQueue: true,
    maxFiles: 1,
    timeout: 0,
    parallelUploads: 10,
    acceptedFiles: "image/jpeg,image/png",
    addRemoveLinks: true,
    url: "https://apichef.jacochef.ru/api/site_items_new/upload_img",
  };

  myDropzone = null;
  isInit = false;
  click = false;
  dropzoneInitialized = false;
  compositionPrefetchHandle = null;

  constructor(props) {
    super(props);
    this.dropzoneRef = React.createRef();

    this.state = {
      ...this.getDefaultFormState(),
      openAlert: false,
      err_status: true,
      err_text: "",
    };
  }

  getDefaultFormState() {
    return {
      name: "",
      date_start: null,
      date_end: null,
      art: "",
      category_id: null,
      count_part: "",
      stol: "",
      weight: "",
      activeTab: "0",
      is_price: "0",
      is_show: "0",
      protein: "",
      fat: "",
      carbohydrates: "",
      time_stage_1: "",
      time_stage_2: "",
      time_stage_3: "",
      all_w: 0,
      all_w_brutto: 0,
      all_w_netto: 0,
      all_w_p: 0,
      all_w_brutto_p: 0,
      all_w_netto_p: 0,
      items_stage: null,
      item_items: null,
      tmp_desc: "",
      short_name: "",
      marc_desc: "",
      marc_desc_full: "",
      is_hit: "0",
      is_new: "0",
      is_updated: "0",
      show_program: "0",
      show_site: "0",
      img_app: "",
      hasDropzoneFile: false,
      tags_all: [],
      tags_my: [],
      modalNewTag: false,
      tag_name_new: "",
      compositionTabMounted: false,
      err_valid: {},
    };
  }

  isNewItem() {
    return this.props.method === "Новое блюдо";
  }

  getEditableFieldValue(value, blankZero = false) {
    if (value === null || value === undefined) {
      return "";
    }

    if (this.isNewItem() && blankZero && (value === 0 || value === "0")) {
      return "";
    }

    return value;
  }

  updateFieldValue(field, value) {
    this.setState((prevState) => ({
      [field]: value,
      err_valid: prevState.err_valid?.[field]
        ? {
            ...prevState.err_valid,
            [field]: false,
          }
        : prevState.err_valid,
    }));
  }

  clearFieldError(field) {
    this.setState((prevState) =>
      prevState.err_valid?.[field]
        ? {
            err_valid: {
              ...prevState.err_valid,
              [field]: false,
            },
          }
        : null,
    );
  }

  getErrorFieldSx(field) {
    if (!this.state.err_valid?.[field]) {
      return {};
    }

    return {
      "& .MuiOutlinedInput-root": {
        backgroundColor: "#F5F5F5",
        "& fieldset": {
          borderColor: "#D32F2F !important",
          borderWidth: "2px",
        },
      },
      "& .MuiPickersOutlinedInput-root": {
        backgroundColor: "#F5F5F5",
        "& fieldset": {
          borderColor: "#D32F2F !important",
          borderWidth: "2px",
        },
      },
    };
  }

  isEmptyTextValue(value) {
    return String(value ?? "").trim() === "";
  }

  isShortNameRequired() {
    return String(this.state.name ?? "").trim().length > 20;
  }

  isShortNameTooLong() {
    return String(this.state.short_name ?? "").trim().length > 20;
  }

  hasAccessFlag(value) {
    return value === true || value === 1 || value === "1";
  }

  getFieldAccess(field, type = "edit") {
    return this.hasAccessFlag(this.props.acces?.[`${field}_${type}`]);
  }

  getNormalizedAccess() {
    return Object.entries(this.props.acces || {}).reduce((acc, [key, value]) => {
      acc[key] = key.endsWith("_edit") || key.endsWith("_view") ? this.hasAccessFlag(value) : value;
      return acc;
    }, {});
  }

  hasAnyEditableField() {
    return Object.entries(this.getNormalizedAccess()).some(
      ([key, value]) => key.endsWith("_edit") && value,
    );
  }

  isEmptySelectValue(value) {
    if (!value) {
      return true;
    }

    if (typeof value === "object") {
      return value.id === null || value.id === undefined || String(value.id).trim() === "";
    }

    return String(value).trim() === "";
  }

  isInvalidTimeMmSs(value) {
    const time = String(value ?? "").trim();

    if (!/^\d{2}:\d{2}$/.test(time)) {
      return true;
    }

    const [minutes, seconds] = time.split(":").map(Number);

    return Number.isNaN(minutes) || Number.isNaN(seconds) || seconds > 59;
  }

  normalizeDecimalInput(value) {
    const normalizedValue = String(value ?? "")
      .replace(/\s/g, "")
      .replace(/\./g, ",")
      .replace(/[^\d,]/g, "");
    const [integerPart = "", decimalPart = ""] = normalizedValue.split(",");

    return decimalPart.length ? `${integerPart}.${decimalPart.slice(0, 3)}` : integerPart;
  }

  parseDecimalValue(value) {
    const parsedValue = parseFloat(
      String(value ?? "")
        .replace(/\s/g, "")
        .replace(",", "."),
    );

    return Number.isNaN(parsedValue) ? 0 : parsedValue;
  }

  formatDecimalValue(value) {
    return this.parseDecimalValue(value).toFixed(3);
  }

  normalizeRecipeRow(item) {
    if (!item) {
      return item;
    }

    return {
      ...item,
      brutto: this.formatDecimalValue(item.brutto),
      netto: this.formatDecimalValue(item.netto),
      res: this.formatDecimalValue(item.res),
    };
  }

  isAutoRecipeField(type) {
    return type === "netto" || type === "res";
  }

  getAutoRecipeValues(source = {}, current = {}) {
    const brutto = this.formatDecimalValue(source?.brutto ?? 0);
    const pr_1 = this.parseDecimalValue(current?.pr_1 ?? 0);
    const pr_2 = this.parseDecimalValue(current?.pr_2 ?? 0);
    const netto =
      source?.netto !== undefined && source?.netto !== null
        ? this.formatDecimalValue(source.netto)
        : this.formatDecimalValue(
            roundTo((this.parseDecimalValue(brutto) * (100 - pr_1)) / 100, 3),
          );
    const res =
      source?.res !== undefined && source?.res !== null
        ? this.formatDecimalValue(source.res)
        : this.formatDecimalValue(roundTo((this.parseDecimalValue(netto) * (100 - pr_2)) / 100, 3));

    return {
      brutto,
      netto,
      res,
    };
  }

  normalizeItemsStage(items_stage) {
    if (!items_stage) {
      return items_stage;
    }

    return {
      ...items_stage,
      stage_1: (items_stage.stage_1 || []).map((item) => this.normalizeRecipeRow(item)),
      stage_2: (items_stage.stage_2 || []).map((item) => this.normalizeRecipeRow(item)),
      stage_3: (items_stage.stage_3 || []).map((item) => this.normalizeRecipeRow(item)),
      not_stage: (items_stage.not_stage || []).map((item) => this.normalizeRecipeRow(item)),
    };
  }

  normalizeItemItems(item_items) {
    if (!item_items) {
      return item_items;
    }

    return {
      ...item_items,
      this_items: (item_items.this_items || []).map((item) => this.normalizeRecipeRow(item)),
    };
  }

  formatDecimalListField(type, key, stage) {
    if (this.isAutoRecipeField(type)) {
      return;
    }

    const items_stage = this.state.items_stage;
    const item_items = this.state.item_items;

    if (
      stage === "stage_1" ||
      stage === "stage_2" ||
      stage === "stage_3" ||
      stage === "not_stage"
    ) {
      if (!items_stage?.[stage]?.[key]) {
        return;
      }

      const nextStageItems = [...items_stage[stage]];
      const nextStageItem = { ...nextStageItems[key] };

      nextStageItem[type] = this.formatDecimalValue(nextStageItem[type]);
      this.recalculateItemValues(nextStageItem, type);
      nextStageItems[key] = nextStageItem;

      const nextItemsStage = {
        ...items_stage,
        [stage]: nextStageItems,
      };

      this.setState({
        items_stage: nextItemsStage,
        ...this.getWeightState(nextItemsStage, item_items),
      });
      return;
    }

    if (stage === "this_items") {
      if (!item_items?.[stage]?.[key]) {
        return;
      }

      const nextItemRows = [...item_items[stage]];
      const nextItem = { ...nextItemRows[key] };

      nextItem[type] = this.formatDecimalValue(nextItem[type]);
      this.recalculateItemValues(nextItem, type);
      nextItemRows[key] = nextItem;

      const nextItemItems = {
        ...item_items,
        [stage]: nextItemRows,
      };

      this.setState({
        item_items: nextItemItems,
        ...this.getWeightState(items_stage, nextItemItems),
      });
    }
  }

  validateBeforeSave() {
    const requiredFields = [
      {
        key: "name",
        label: "Наименование",
        tab: "0",
        missing: this.getFieldAccess("name") && this.isEmptyTextValue(this.state.name),
      },
      {
        key: "short_name",
        label: "Короткое название (20 символов)",
        tab: "0",
        missing:
          this.getFieldAccess("short_name") &&
          ((this.isShortNameRequired() && this.isEmptyTextValue(this.state.short_name)) ||
            this.isShortNameTooLong()),
      },
      {
        key: "art",
        label: "Код 1С",
        tab: "0",
        missing: this.getFieldAccess("art") && this.isEmptyTextValue(this.state.art),
      },
      {
        key: "date_start",
        label: "Действует с",
        tab: "0",
        missing: this.getFieldAccess("date_start") && !this.state.date_start,
      },
      {
        key: "category_id",
        label: "Категория",
        tab: "0",
        missing:
          this.getFieldAccess("category_id") && this.isEmptySelectValue(this.state.category_id),
      },
      {
        key: "stol",
        label: "Стол",
        tab: "0",
        missing: this.getFieldAccess("stol") && this.isEmptyTextValue(this.state.stol),
      },
      {
        key: "count_part",
        label: "Кусочков или размер",
        tab: "1",
        missing: this.getFieldAccess("count_part") && this.isEmptyTextValue(this.state.count_part),
      },
      {
        key: "weight",
        label: "Вес",
        tab: "1",
        missing: this.getFieldAccess("weight") && this.isEmptyTextValue(this.state.weight),
      },
      {
        key: "protein",
        label: "Белки",
        tab: "1",
        missing: this.getFieldAccess("protein") && this.isEmptyTextValue(this.state.protein),
      },
      {
        key: "fat",
        label: "Жиры",
        tab: "1",
        missing: this.getFieldAccess("fat") && this.isEmptyTextValue(this.state.fat),
      },
      {
        key: "carbohydrates",
        label: "Углеводы",
        tab: "1",
        missing:
          this.getFieldAccess("carbohydrates") && this.isEmptyTextValue(this.state.carbohydrates),
      },
      {
        key: "tmp_desc",
        label: "Состав",
        tab: "2",
        missing: this.getFieldAccess("tmp_desc") && this.isEmptyTextValue(this.state.tmp_desc),
      },
      {
        key: "marc_desc_full",
        label: "Полное описание (в карточке)",
        tab: "2",
        missing:
          this.getFieldAccess("marc_desc_full") && this.isEmptyTextValue(this.state.marc_desc_full),
      },
      {
        key: "marc_desc",
        label: "Короткое описание (в списке)",
        tab: "2",
        missing: this.getFieldAccess("marc_desc") && this.isEmptyTextValue(this.state.marc_desc),
      },
      {
        key: "tags_my",
        label: "Теги",
        tab: "3",
        missing: !Array.isArray(this.state.tags_my) || this.state.tags_my.length === 0,
      },
      {
        key: "time_stage_1",
        label: "Время на 1 этап MM:SS",
        tab: "5",
        missing:
          this.getFieldAccess("time_stage_1") && this.isInvalidTimeMmSs(this.state.time_stage_1),
      },
      {
        key: "time_stage_2",
        label: "Время на 2 этап MM:SS",
        tab: "5",
        missing:
          this.getFieldAccess("time_stage_2") && this.isInvalidTimeMmSs(this.state.time_stage_2),
      },
      {
        key: "time_stage_3",
        label: "Время на 3 этап MM:SS",
        tab: "5",
        missing:
          this.getFieldAccess("time_stage_3") && this.isInvalidTimeMmSs(this.state.time_stage_3),
      },
    ];

    const err_valid = requiredFields.reduce((acc, field) => {
      acc[field.key] = field.missing;
      return acc;
    }, {});
    const missingFields = requiredFields.filter((field) => field.missing);

    this.setState({
      err_valid,
      activeTab: missingFields[0]?.tab || this.state.activeTab,
    });

    if (missingFields.length) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: `Проверьте поля: ${missingFields.map((field) => field.label).join(", ")}`,
      });
      return false;
    }

    return true;
  }

  changeTab(event, val) {
    if (val === "5" && !this.state.compositionTabMounted) {
      this.setState({
        activeTab: val,
        compositionTabMounted: true,
      });
      return;
    }

    this.setState({
      activeTab: val,
    });
  }

  ensureCompositionTabMounted(callback) {
    if (this.state.compositionTabMounted) {
      if (callback) {
        callback();
      }
      return;
    }

    this.setState(
      {
        compositionTabMounted: true,
      },
      callback,
    );
  }

  cancelCompositionTabPrefetch() {
    if (!this.compositionPrefetchHandle || typeof window === "undefined") {
      return;
    }

    if (
      this.compositionPrefetchHandle.type === "idle" &&
      typeof window.cancelIdleCallback === "function"
    ) {
      window.cancelIdleCallback(this.compositionPrefetchHandle.id);
    } else {
      window.clearTimeout(this.compositionPrefetchHandle.id);
    }

    this.compositionPrefetchHandle = null;
  }

  scheduleCompositionTabPrefetch() {
    if (this.state.compositionTabMounted || typeof window === "undefined") {
      return;
    }

    this.cancelCompositionTabPrefetch();

    const mountCompositionTab = () => {
      this.compositionPrefetchHandle = null;
      this.ensureCompositionTabMounted();
    };

    if (typeof window.requestIdleCallback === "function") {
      this.compositionPrefetchHandle = {
        type: "idle",
        id: window.requestIdleCallback(mountCompositionTab, { timeout: 500 }),
      };
      return;
    }

    this.compositionPrefetchHandle = {
      type: "timeout",
      id: window.setTimeout(mountCompositionTab, 180),
    };
  }

  componentDidMount() {
    // Инициализируем Dropzone один раз при монтировании
    this.initDropzone();
  }

  destroyDropzone() {
    const activeDropzone = this.myDropzone ?? this.dropzoneRef.current?.dropzone;

    if (activeDropzone) {
      activeDropzone.destroy();
    }

    if (this.dropzoneRef.current?.dropzone) {
      delete this.dropzoneRef.current.dropzone;
    }

    this.myDropzone = null;
    this.dropzoneInitialized = false;
  }

  initDropzone(forceRecreate = false) {
    if (!this.dropzoneRef.current) {
      return;
    }

    if (forceRecreate || this.myDropzone || this.dropzoneRef.current?.dropzone) {
      this.destroyDropzone();
    }

    try {
      this.myDropzone = new Dropzone(this.dropzoneRef.current, this.dropzoneOptions);
      this.dropzoneInitialized = true;
      this.setupDropzoneEvents();
    } catch (error) {
      console.error("Error initializing Dropzone:", error);
    }
  }

  setupDropzoneEvents() {
    if (!this.myDropzone) return;
    this.myDropzone.on("addedfile", () => {
      this.setState({
        hasDropzoneFile: true,
      });
    });

    this.myDropzone.on("removedfile", () => {
      this.setState({
        hasDropzoneFile: this.myDropzone?.files?.length > 0,
      });
    });

    this.myDropzone.on("queuecomplete", (data) => {
      var check_img = false;

      this.myDropzone["files"].map((item, key) => {
        if (item["status"] == "error") {
          check_img = true;
        }
      });

      if (!check_img) {
        setTimeout(() => {
          this.onClose(true);
        }, 1000);
      }

      this.isInit = false;
    });
  }

  componentDidUpdate(prevProps) {
    if (!this.props.item) {
      return;
    }

    if (this.props.item !== prevProps.item) {
      const isNewItem = this.isNewItem();
      const tags = this.props.item?.tags_all
        ? [{ id: -1, name: "Новый" }, ...this.props.item.tags_all]
        : [{ id: -1, name: "Новый" }];
      const normalizedItemsStage = this.normalizeItemsStage(this.props.items_stage);
      const normalizedItemItems = this.normalizeItemItems(this.props.item_items);
      const selectedCategory = isNewItem
        ? null
        : (this.props.category?.find(
            (categoryItem) => parseInt(categoryItem?.id) === parseInt(this.props.item?.category_id),
          ) ?? null);

      this.setState(
        {
          ...this.getDefaultFormState(),
          name: isNewItem ? "" : this.props.item?.name || "",
          art: isNewItem ? "" : this.props.item?.art || "",
          category_id: selectedCategory,
          count_part: isNewItem
            ? ""
            : this.getEditableFieldValue(this.props.item?.count_part, true),
          date_start:
            !isNewItem && this.props.item?.date_start
              ? formatDate(this.props.item.date_start)
              : null,
          date_end:
            !isNewItem && this.props.item?.date_end ? formatDate(this.props.item.date_end) : null,
          stol: isNewItem ? "" : this.getEditableFieldValue(this.props.item?.stol, true),
          weight: isNewItem ? "" : this.getEditableFieldValue(this.props.item?.weight, true),
          is_price: isNewItem ? "0" : parseInt(this.props.item?.is_price) ? 1 : 0,
          is_show: isNewItem ? "0" : parseInt(this.props.item?.is_show) ? 1 : 0,
          protein: isNewItem ? "" : this.getEditableFieldValue(this.props.item?.protein, true),
          fat: isNewItem ? "" : this.getEditableFieldValue(this.props.item?.fat, true),
          is_updated: isNewItem ? "0" : parseInt(this.props.item?.is_updated) ? 1 : 0,
          carbohydrates: isNewItem
            ? ""
            : this.getEditableFieldValue(this.props.item?.carbohydrates, true),
          time_stage_1: isNewItem ? "" : this.props.item?.time_stage_1 || "",
          time_stage_2: isNewItem ? "" : this.props.item?.time_stage_2 || "",
          time_stage_3: isNewItem ? "" : this.props.item?.time_stage_3 || "",
          all_w: this.props.item?.all_w || 0,
          all_w_brutto: this.props.item?.all_w_brutto || 0,
          all_w_netto: this.props.item?.all_w_netto || 0,
          all_w_p: this.props.item?.all_w || 0,
          all_w_brutto_p: this.props.item?.all_w_brutto || 0,
          all_w_netto_p: this.props.item?.all_w_netto || 0,
          items_stage: normalizedItemsStage || null,
          item_items: normalizedItemItems || null,
          tmp_desc: isNewItem ? "" : this.props.item?.tmp_desc || "",
          marc_desc: isNewItem ? "" : this.props.item?.marc_desc || "",
          short_name: isNewItem ? "" : this.props.item?.short_name || "",
          marc_desc_full: isNewItem ? "" : this.props.item?.marc_desc_full || "",
          is_hit: isNewItem ? "0" : parseInt(this.props.item?.is_hit) ? 1 : 0,
          is_new: isNewItem ? "0" : parseInt(this.props.item?.is_new) ? 1 : 0,
          show_program: isNewItem ? "0" : parseInt(this.props.item?.show_program) ? 1 : 0,
          show_site: isNewItem ? "0" : parseInt(this.props.item?.show_site) ? 1 : 0,
          img_app: isNewItem ? "" : this.props.item?.img_app || "",
          tags_all: tags,
          tags_my: isNewItem ? [] : this.props.item?.tags || [],
          ...this.getWeightState(normalizedItemsStage || null, normalizedItemItems || null),
        },
        () => {
          this.initDropzone(true);
          this.scheduleCompositionTabPrefetch();
        },
      );
    }
  }

  changeItem(type, event, data) {
    const value = data !== undefined ? data : event.target.value;

    if (type === "short_name") {
      if (value.length > 20) {
        return;
      }
    }

    this.updateFieldValue(type, value);
  }

  changeDateRange(data, event) {
    this.updateFieldValue(data, event ? event : "");
  }

  changeItemChecked(type, event) {
    this.updateFieldValue(type, event.target.checked === true ? 1 : 0);
  }

  componentWillUnmount() {
    // Уничтожаем Dropzone при размонтировании
    this.cancelCompositionTabPrefetch();
    this.destroyDropzone();
  }

  changeSelect(data, event) {
    this.updateFieldValue(data, event.target.value);
  }

  deleteItemData(index, type) {
    const items_stage = this.state.items_stage;
    const item_items = this.state.item_items;

    if (type === "stage_1" || type === "stage_2" || type === "stage_3" || type === "not_stage") {
      if (items_stage && items_stage[type]) {
        const nextItemsStage = {
          ...items_stage,
          [type]: items_stage[type].filter((_, itemIndex) => itemIndex !== index),
        };

        this.setState({
          items_stage: nextItemsStage,
          ...this.getWeightState(nextItemsStage, item_items),
        });
      }

      return;
    }

    if (type === "this_items") {
      if (item_items && item_items[type]) {
        const nextItemItems = {
          ...item_items,
          [type]: item_items[type].filter((_, itemIndex) => itemIndex !== index),
        };

        this.setState({
          item_items: nextItemItems,
          ...this.getWeightState(items_stage, nextItemItems),
        });
      }
    }
  }

  chooseItem(type, event, data) {
    if (type === "stages") {
      const items_stage = this.state.items_stage || {};
      const nextItemsStage = {
        ...items_stage,
        not_stage: [
          ...(items_stage.not_stage || []),
          {
            type_id: { id: data.id, name: data.name },
            ei_name: data.ei_name,
            type: data.type,
            ...this.getAutoRecipeValues(data),
            pr_1: 0,
            pr_2: 0,
            stage: "",
          },
        ],
      };

      this.setState({
        items_stage: nextItemsStage,
        ...this.getWeightState(nextItemsStage, this.state.item_items),
      });
    }

    if (type === "items") {
      const item_items = this.state.item_items || {};
      const nextItems = item_items.this_items || [];

      const find_item = nextItems.find((item) => parseInt(item.item_id?.id) === parseInt(data.id));

      if (find_item) {
        this.setState({
          openAlert: true,
          err_status: false,
          err_text: "Данная позиция уже добавлена",
        });
        return;
      }

      const nextItemItems = {
        ...item_items,
        this_items: [
          ...nextItems,
          {
            item_id: { id: data.id, name: data.name },
            ...this.getAutoRecipeValues(data),
            pr_1: 0,
            pr_2: 0,
            is_add: 0,
          },
        ],
      };

      this.setState({
        item_items: nextItemItems,
        ...this.getWeightState(this.state.items_stage, nextItemItems),
      });
    }
  }

  changeItemData(index, type, event, value) {
    if (
      value &&
      (type === "stage_1" || type === "stage_2" || type === "stage_3" || type === "not_stage")
    ) {
      const items_stage = this.state.items_stage || {};
      const stageItems = items_stage[type] || [];

      const find_item = stageItems.find(
        (it, itemIndex) =>
          itemIndex !== index &&
          it.type === value.type &&
          parseInt(it.type_id?.id) === parseInt(value.id),
      );

      if (find_item) {
        this.setState({
          openAlert: true,
          err_status: false,
          err_text: "Данная позиция уже добавлена в указанный этап",
        });
        return;
      }

      const nextStageItems = [...stageItems];
      const currentItem = nextStageItems[index] || {};
      const obj = {
        type_id: { id: value.id, name: value.name },
        ei_name: value.ei_name,
        type: value.type,
        ...this.getAutoRecipeValues(value, currentItem),
        pr_1: currentItem?.pr_1 || 0,
        pr_2: currentItem?.pr_2 || 0,
        stage: currentItem?.stage || "",
      };

      nextStageItems[index] = obj;

      const nextItemsStage = {
        ...items_stage,
        [type]: nextStageItems,
      };

      this.setState({
        items_stage: nextItemsStage,
        ...this.getWeightState(nextItemsStage, this.state.item_items),
      });
    }

    if (value && type === "this_items") {
      const item_items = this.state.item_items || {};
      const nextItems = item_items.this_items || [];

      const find_item = nextItems.find(
        (item, itemIndex) =>
          itemIndex !== index && parseInt(item.item_id?.id) === parseInt(value.id),
      );

      if (find_item) {
        this.setState({
          openAlert: true,
          err_status: false,
          err_text: "Данная позиция уже добавлена",
        });
        return;
      }

      const nextItemRows = [...nextItems];
      const currentItem = nextItemRows[index] || {};
      const obj = {
        item_id: { id: value.id, name: value.name },
        ...this.getAutoRecipeValues(value, currentItem),
        pr_1: currentItem?.pr_1 || 0,
        pr_2: currentItem?.pr_2 || 0,
        is_add: currentItem?.is_add || 0,
      };

      nextItemRows[index] = obj;

      const nextItemItems = {
        ...item_items,
        [type]: nextItemRows,
      };

      this.setState({
        item_items: nextItemItems,
        ...this.getWeightState(this.state.items_stage, nextItemItems),
      });
    }
  }

  changeItemSelect(data, index, type, item, event) {
    const items_stage = this.state.items_stage || {};
    const stage = `stage_${event.target.value}`;
    const sourceItems = items_stage[type] || [];
    const targetItems = items_stage[stage] || [];

    const find_item = targetItems.find(
      (it) => it.type === item.type && parseInt(it.type_id?.id) === parseInt(item.type_id?.id),
    );

    if (find_item) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: "Данная позиция уже добавлена в указанный этап",
      });
      return;
    }

    const nextItem = {
      ...item,
      [data]: event.target.value,
    };

    const nextItemsStage = {
      ...items_stage,
      [type]: sourceItems.filter((_, itemIndex) => itemIndex !== index),
      [stage]: [...targetItems, nextItem],
    };

    this.setState({
      items_stage: nextItemsStage,
      ...this.getWeightState(nextItemsStage, this.state.item_items),
    });
  }

  changeItemList(type, key, stage, event) {
    if (this.isAutoRecipeField(type)) {
      return;
    }

    const items_stage = this.state.items_stage;
    const item_items = this.state.item_items;
    const value = event.target.value;

    if (
      stage === "stage_1" ||
      stage === "stage_2" ||
      stage === "stage_3" ||
      stage === "not_stage"
    ) {
      if (!items_stage || !items_stage[stage]) return;

      const nextStageItems = [...items_stage[stage]];
      const nextStageItem = { ...nextStageItems[key] };

      if (type === "brutto") {
        nextStageItem[type] = this.normalizeDecimalInput(value);
      } else if (value < 0) {
        nextStageItem[type] = 0;
      } else {
        nextStageItem[type] = value;
      }

      this.recalculateItemValues(nextStageItem, type);
      nextStageItems[key] = nextStageItem;

      const nextItemsStage = {
        ...items_stage,
        [stage]: nextStageItems,
      };

      this.setState({
        items_stage: nextItemsStage,
        ...this.getWeightState(nextItemsStage, item_items),
      });
      return;
    }

    if (stage === "this_items") {
      if (!item_items || !item_items[stage]) return;

      const nextItemRows = [...item_items[stage]];
      const nextItem = { ...nextItemRows[key] };

      if (type === "brutto") {
        nextItem[type] = this.normalizeDecimalInput(value);
      } else if (value < 0) {
        nextItem[type] = 0;
      } else {
        nextItem[type] = value;
      }

      this.recalculateItemValues(nextItem, type);
      nextItemRows[key] = nextItem;

      const nextItemItems = {
        ...item_items,
        [stage]: nextItemRows,
      };

      this.setState({
        item_items: nextItemItems,
        ...this.getWeightState(items_stage, nextItemItems),
      });
    }
  }

  recalculateItemValues(item, type) {
    if (type === "brutto" || type === "pr_1") {
      item.netto = this.formatDecimalValue(
        roundTo(
          (this.parseDecimalValue(item.brutto || 0) * (100 - parseFloat(item.pr_1 || 0))) / 100,
          3,
        ),
      );

      item.res = this.formatDecimalValue(
        roundTo(
          (this.parseDecimalValue(item.netto || 0) * (100 - parseFloat(item.pr_2 || 0))) / 100,
          3,
        ),
      );
    }

    if (type === "pr_2") {
      item.res = this.formatDecimalValue(
        roundTo(
          (this.parseDecimalValue(item.netto || 0) * (100 - parseFloat(item.pr_2 || 0))) / 100,
          3,
        ),
      );
    }
  }

  getWeightState(items_stage = this.state.items_stage, item_items = this.state.item_items) {
    let all_w_brutto_1 =
      items_stage?.stage_1?.reduce(
        (sum, item) => sum + this.parseDecimalValue(item.brutto || 0),
        0,
      ) || 0;
    let all_w_brutto_2 =
      items_stage?.stage_2?.reduce(
        (sum, item) => sum + this.parseDecimalValue(item.brutto || 0),
        0,
      ) || 0;
    let all_w_brutto_3 =
      items_stage?.stage_3?.reduce(
        (sum, item) => sum + this.parseDecimalValue(item.brutto || 0),
        0,
      ) || 0;
    let all_w_brutto_4 =
      items_stage?.not_stage?.reduce(
        (sum, item) => sum + this.parseDecimalValue(item.brutto || 0),
        0,
      ) || 0;
    let all_w_brutto_5 =
      item_items?.this_items?.reduce(
        (sum, item) => sum + this.parseDecimalValue(item.brutto || 0),
        0,
      ) || 0;

    let all_w_brutto = all_w_brutto_5;
    all_w_brutto = this.formatDecimalValue(roundTo(all_w_brutto, 3));

    let all_w_brutto_p = all_w_brutto_1 + all_w_brutto_2 + all_w_brutto_3 + all_w_brutto_4;
    all_w_brutto_p = this.formatDecimalValue(roundTo(all_w_brutto_p, 3));

    let all_w_netto_1 =
      items_stage?.stage_1?.reduce(
        (sum, item) => sum + this.parseDecimalValue(item.netto || 0),
        0,
      ) || 0;
    let all_w_netto_2 =
      items_stage?.stage_2?.reduce(
        (sum, item) => sum + this.parseDecimalValue(item.netto || 0),
        0,
      ) || 0;
    let all_w_netto_3 =
      items_stage?.stage_3?.reduce(
        (sum, item) => sum + this.parseDecimalValue(item.netto || 0),
        0,
      ) || 0;
    let all_w_netto_4 =
      items_stage?.not_stage?.reduce(
        (sum, item) => sum + this.parseDecimalValue(item.netto || 0),
        0,
      ) || 0;
    let all_w_netto_5 =
      item_items?.this_items?.reduce(
        (sum, item) => sum + this.parseDecimalValue(item.netto || 0),
        0,
      ) || 0;

    let all_w_netto = all_w_netto_5;
    all_w_netto = this.formatDecimalValue(roundTo(all_w_netto, 3));

    let all_w_netto_p = all_w_netto_1 + all_w_netto_2 + all_w_netto_3 + all_w_netto_4;
    all_w_netto_p = this.formatDecimalValue(roundTo(all_w_netto_p, 3));

    let all_w_1 =
      items_stage?.stage_1?.reduce((sum, item) => sum + this.parseDecimalValue(item.res || 0), 0) ||
      0;
    let all_w_2 =
      items_stage?.stage_2?.reduce((sum, item) => sum + this.parseDecimalValue(item.res || 0), 0) ||
      0;
    let all_w_3 =
      items_stage?.stage_3?.reduce((sum, item) => sum + this.parseDecimalValue(item.res || 0), 0) ||
      0;
    let all_w_4 =
      items_stage?.not_stage?.reduce(
        (sum, item) => sum + this.parseDecimalValue(item.res || 0),
        0,
      ) || 0;
    let all_w_5 =
      item_items?.this_items?.reduce(
        (sum, item) => sum + this.parseDecimalValue(item.res || 0),
        0,
      ) || 0;

    let all_w = all_w_5;
    all_w = this.formatDecimalValue(roundTo(all_w, 3));

    let all_w_p = all_w_1 + all_w_2 + all_w_3 + all_w_4;
    all_w_p = this.formatDecimalValue(roundTo(all_w_p, 3));

    return { all_w_brutto, all_w_netto, all_w, all_w_brutto_p, all_w_netto_p, all_w_p };
  }

  recalculateWeights(items_stage = this.state.items_stage, item_items = this.state.item_items) {
    this.setState(this.getWeightState(items_stage, item_items));
  }

  save() {
    const items_stage = this.state.items_stage;
    if (items_stage?.not_stage?.length) {
      this.setState({
        activeTab: "5",
        openAlert: true,
        err_status: false,
        err_text: "В Заготовках необходимо у всех позиций указать этап",
      });
      return;
    }

    if (!this.validateBeforeSave()) {
      return;
    }

    // Сохраняем маркетинговые данные
    const obj_stage = this.state.items_stage;
    const { all, ...new_obj_stage } = obj_stage;
    const obj_item_items = this.state.item_items;
    const { all_items, ...new_obj_item_items } = obj_item_items;
    // Сохраняем технологические данные
    const data = {
      id: this.props.item?.id,
      type: this.props.item?.type,
      name: this.state.name,
      art: this.state.art,
      tmp_desc: this.state.tmp_desc,
      marc_desc: this.state.marc_desc,
      marc_desc_full: this.state.marc_desc_full,
      short_name: this.state.short_name,
      is_hit: this.state.is_hit,
      is_new: this.state.is_new,
      show_program: this.state.show_program,
      show_site: this.state.show_site,
      img_app: this.state.img_app,
      link: this.props.item?.link,
      tags: this.state.tags_my,
      category_id: this.state.category_id?.id || "",
      size_pizza: parseInt(this.state.category_id?.id) === 14 ? this.state.count_part : 0,
      count_part: parseInt(this.state.category_id?.id) !== 14 ? this.state.count_part : 0,
      stol: this.state.stol,
      weight: this.state.weight,
      is_price: this.state.is_price,
      is_show: this.state.is_show,
      protein: this.state.protein,
      fat: this.state.fat,
      is_updated: this.state.is_updated,
      carbohydrates: this.state.carbohydrates,
      time_stage_1: this.state.time_stage_1,
      time_stage_2: this.state.time_stage_2,
      time_stage_3: this.state.time_stage_3,
      date_start: this.state.date_start ? dayjs(this.state.date_start).format("YYYY-MM-DD") : "",
      date_end: this.state.date_end ? dayjs(this.state.date_end).format("YYYY-MM-DD") : "",
      all_w: this.formatDecimalValue(
        this.parseDecimalValue(this.state.all_w) + this.parseDecimalValue(this.state.all_w_p),
      ),
      all_w_brutto: this.formatDecimalValue(
        this.parseDecimalValue(this.state.all_w_brutto) +
          this.parseDecimalValue(this.state.all_w_brutto_p),
      ),
      all_w_netto: this.formatDecimalValue(
        this.parseDecimalValue(this.state.all_w_netto) +
          this.parseDecimalValue(this.state.all_w_netto_p),
      ),
      items_stage: new_obj_stage,
      item_items: new_obj_item_items,
    };

    const resp = this.props.save(data);
    let idGet = 0;
    if (resp.id && resp.st) {
      idGet = resp.id;
    }
    resp.then((data) => {
      let idGet = 0;
      if (data.id && data.st) {
        idGet = data.id;
      }
      if (
        this.myDropzone &&
        this.myDropzone["files"]?.length > 0 &&
        (this.props.item?.id || idGet)
      ) {
        if (this.myDropzone["files"].length > 0 && this.isInit === false) {
          this.isInit = true;

          let name = this.state.name,
            id = this.props.item?.id ? this.props.item.id : idGet;
          this.myDropzone.on("sending", (file, xhr, data) => {
            let file_type = file.name.split(".");
            file_type = file_type[file_type.length - 1];
            file_type = file_type.toLowerCase();

            data.append("type", "site_items");
            data.append("name", name + "site_items");
            data.append("login", localStorage.getItem("token"));
            data.append("id", id);
          });

          this.myDropzone.on("queuecomplete", (data) => {
            var check_img = false;

            this.myDropzone["files"].map((item, key) => {
              if (item["status"] == "error") {
                check_img = true;
              }
            });

            if (!check_img) {
              setTimeout(() => {
                this.onClose(true);
              }, 1000);
            }

            this.isInit = false;
          });
        }

        this.myDropzone.processQueue();
      } else {
        this.onClose(true);
      }
    });
  }

  openNewTag() {
    this.setState({
      modalNewTag: true,
      tag_name_new: "",
    });
  }

  onClose() {
    this.cancelCompositionTabPrefetch();
    this.setState({
      ...this.getDefaultFormState(),
      openAlert: false,
      err_status: true,
      err_text: "",
    });

    this.props.onClose();
  }

  changeAutocomplite(data, event, value) {
    let check = value?.find((item) => parseInt(item.id) === -1);

    if (check) {
      this.openNewTag();
      return;
    } else {
      this.updateFieldValue(data, value);
    }
  }

  async saveNewTag() {
    let data = {
      name: this.state.tag_name_new,
    };

    let res = await this.props.getData("saveNewTag", data);

    if (res.st === true) {
      this.setState({
        tags_all: res.tags_all,
        modalNewTag: false,
      });
    }
  }

  render() {
    const { open, method, fullScreen, category, stages } = this.props;
    const access = this.getNormalizedAccess();
    const activeSection =
      modalSections.find((section) => section.value === this.state.activeTab) || modalSections[0];
    const canSave = this.hasAnyEditableField();
    const hiddenIf = (condition) => (condition ? { display: "none" } : {});
    const isChecked = (value) => parseInt(value) === 1;

    const dialogPaperSx = fullScreen
      ? {
          borderRadius: 0,
          boxShadow: "none",
        }
      : {
          width: "100%",
          maxWidth: {
            xs: "calc(100vw - 20px)",
            xl: 1380,
          },
          m: {
            xs: 1.25,
            sm: 2,
          },
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "none",
        };

    const sectionCardSx = {
      borderRadius: 3,
      border: `1px solid ${blockBorder}`,
      boxShadow: "none",
      overflow: "hidden",
      backgroundColor: "#FFFFFF",
    };

    const dialogContentSx = {
      px: {
        xs: 1.25,
        md: 2.5,
      },
      pt: {
        xs: 2.25,
        md: 3,
      },
      pb: {
        xs: 2,
        md: 2.5,
      },
      bgcolor: "#FAFAFA",
      "& .MuiOutlinedInput-root, & .MuiPickersOutlinedInput-root": {
        borderRadius: "14px",
        color: textPrimary,
        backgroundColor: "#FFFFFF",
        "& fieldset": {
          borderColor: blockBorder,
        },
        "&:hover fieldset": {
          borderColor: blockBorder,
        },
        "&.Mui-focused fieldset": {
          borderColor: blockBorder,
          borderWidth: "2px",
        },
        "&.Mui-disabled": {
          backgroundColor: "#F7F7F7",
        },
      },
      "& .MuiOutlinedInput-input, & .MuiInputBase-input": {
        color: textPrimary,
        WebkitTextFillColor: textPrimary,
        "&::placeholder": {
          color: "#BABABA",
          opacity: 1,
        },
      },
      "& .MuiInputLabel-root": {
        color: textSecondary,
        "&.Mui-focused": {
          color: textSecondary,
        },
      },
      "& .MuiAutocomplete-tag": {
        backgroundColor: blockBackground,
        color: textPrimary,
      },
      "& .MuiCheckbox-root": {
        color: "#9E9E9E",
      },
      "& .MuiCheckbox-root.Mui-checked": {
        color: brandRed,
      },
      "& .MuiFormControlLabel-root": {
        m: 0,
        width: "100%",
        alignItems: "center",
      },
      "& .MuiFormControlLabel-label": {
        color: textPrimary,
        fontSize: 15,
        lineHeight: "20px",
      },
      "& .MuiFormGroup-root": {
        width: "100%",
      },
    };

    const mobileTabListSx = {
      minHeight: "auto",
      mb: 2,
      "& .MuiTabs-scroller": {
        overflowY: "visible !important",
      },
      "& .MuiTabs-flexContainer": {
        gap: 1,
      },
      "& .MuiTabs-indicator": {
        display: "none",
      },
      "& .MuiTab-root": {
        minHeight: 42,
        px: 1.5,
        py: 1,
        borderRadius: 2,
        border: `1px solid ${blockBorder}`,
        backgroundColor: blockBackground,
        color: textSecondary,
        textTransform: "none",
        fontWeight: 500,
      },
      "& .MuiTab-root.Mui-selected": {
        backgroundColor: "#FFFFFF",
        color: textPrimary,
        borderColor: brandRed,
      },
    };

    const desktopNavPaperSx = {
      display: {
        xs: "none",
        lg: "block",
      },
      width: 252,
      flexShrink: 0,
      alignSelf: "flex-start",
      p: 1.5,
      borderRadius: 3,
      border: `1px solid ${blockBorder}`,
      backgroundColor: blockBackground,
      boxShadow: "none",
      position: "sticky",
      top: 0,
      mt: 2.5,
    };

    const desktopNavButtonSx = (active) => ({
      width: "100%",
      px: 1.5,
      py: 1.25,
      borderRadius: 2.5,
      justifyContent: "flex-start",
      alignItems: "flex-start",
      textTransform: "none",
      border: `1px solid ${active ? brandRed : "transparent"}`,
      backgroundColor: active ? "#FFFFFF" : "transparent",
      color: active ? textPrimary : textSecondary,
      boxShadow: "none",
      "&:hover": {
        backgroundColor: "#FFFFFF",
        borderColor: active ? brandRed : blockBorder,
        boxShadow: "none",
      },
    });

    const tableWrapperSx = {
      overflowX: "auto",
      borderRadius: 2.5,
      border: `1px solid ${blockBorder}`,
      backgroundColor: "#FFFFFF",
    };

    const tableHeaderCellSx = {
      fontWeight: 700,
      color: textPrimary,
      backgroundColor: blockBackground,
      borderBottom: `1px solid ${blockBorder}`,
      whiteSpace: "normal",
    };

    const tableSectionRowSx = {
      "& td": {
        py: 1.25,
        backgroundColor: blockBackground,
        color: textPrimary,
        fontWeight: 700,
        borderBottom: `1px solid ${blockBorder}`,
      },
    };

    const tableTotalRowSx = {
      "& td": {
        backgroundColor: "#FAFAFA",
        borderTop: `1px solid ${blockBorder}`,
      },
    };

    const tableSx = {
      minWidth: 980,
      "& th, & td": {
        px: 1,
        py: 1.25,
      },
      "& td": {
        borderBottom: `1px solid ${blockBorder}`,
        verticalAlign: "top",
      },
      "& tbody tr:last-of-type td": {
        borderBottom: "none",
      },
    };

    const positionTableSx = {
      minWidth: 820,
      "& th, & td": {
        px: 1,
        py: 1.25,
      },
      "& td": {
        borderBottom: `1px solid ${blockBorder}`,
        verticalAlign: "top",
      },
      "& tbody tr:last-of-type td": {
        borderBottom: "none",
      },
    };

    const actionIconButtonSx = {
      color: brandRed,
      borderRadius: 2,
      "&:hover": {
        backgroundColor: "rgba(221, 26, 50, 0.08)",
      },
    };

    const renderSectionCard = (eyebrow, title, description, children, sx = {}, contentSx = {}) => (
      <Paper
        sx={{
          ...sectionCardSx,
          ...sx,
        }}
      >
        <Box
          sx={{
            px: {
              xs: 2,
              md: 2.5,
            },
            py: {
              xs: 1.75,
              md: 2,
            },
            borderBottom: `1px solid ${blockBorder}`,
            backgroundColor: "#FFFFFF",
          }}
        >
          {eyebrow ? (
            <Typography
              sx={{
                mb: 0.5,
                color: brandRed,
                fontSize: 12,
                lineHeight: "16px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {eyebrow}
            </Typography>
          ) : null}
          <Typography
            sx={{
              color: textPrimary,
              fontSize: {
                xs: 18,
                md: 20,
              },
              lineHeight: "26px",
              fontWeight: 700,
            }}
          >
            {title}
          </Typography>
          {description ? (
            <Typography
              sx={{
                mt: 0.75,
                maxWidth: 720,
                color: textSecondary,
                fontSize: 14,
                lineHeight: "20px",
              }}
            >
              {description}
            </Typography>
          ) : null}
        </Box>
        <Box
          sx={{
            px: {
              xs: 2,
              md: 2.5,
            },
            py: {
              xs: 2,
              md: 2.5,
            },
            ...contentSx,
          }}
        >
          {children}
        </Box>
      </Paper>
    );

    const renderToggleCard = (label, value, onChange, disabled = false, sx = {}) => {
      const handleToggle = () => {
        if (disabled) {
          return;
        }

        onChange({ target: { checked: !value } });
      };

      return (
        <Paper
          sx={{
            borderRadius: 2.5,
            border: `1px solid ${value ? brandRed : blockBorder}`,
            boxShadow: "none",
            backgroundColor: value ? "#FFF7F8" : "#FFFFFF",
            minHeight: 92,
            p: 1.75,
            display: "flex",
            alignItems: "center",
            transition: "background-color 0.2s ease, border-color 0.2s ease",
            opacity: disabled ? 0.72 : 1,
            ...sx,
          }}
        >
          <Box
            role="checkbox"
            aria-checked={value}
            tabIndex={disabled ? -1 : 0}
            onClick={handleToggle}
            onKeyDown={(event) => {
              if (disabled) {
                return;
              }

              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleToggle();
              }
            }}
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              cursor: disabled ? "not-allowed" : "pointer",
              outline: "none",
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                backgroundColor: value ? "rgba(221, 26, 50, 0.08)" : blockBackground,
                transition: "background-color 0.2s ease",
              }}
            >
              <Checkbox
                checked={value}
                disabled={disabled}
                onChange={onChange}
                onClick={(event) => event.stopPropagation()}
                disableRipple
                sx={{
                  p: 0,
                  color: "#A6A6A6",
                  "&:hover": {
                    backgroundColor: "transparent",
                  },
                  "&.Mui-checked": {
                    color: brandRed,
                  },
                }}
              />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  color: textPrimary,
                  fontSize: 18,
                  lineHeight: "24px",
                  fontWeight: 600,
                }}
              >
                {label}
              </Typography>
              <Typography
                sx={{
                  mt: 0.5,
                  color: textSecondary,
                  fontSize: 13,
                  lineHeight: "18px",
                }}
              >
                {disabled
                  ? "Поле доступно только для просмотра"
                  : value
                    ? "Переключатель включен"
                    : "Нажмите, чтобы включить"}
              </Typography>
            </Box>
          </Box>
        </Paper>
      );
    };

    const renderPreparationRows = (stageKey, stageLabel) => {
      const rows = this.state.items_stage?.[stageKey] || [];

      if (!rows.length) {
        return null;
      }

      return (
        <React.Fragment key={stageKey}>
          <TableRow sx={tableSectionRowSx}>
            <TableCell colSpan={9}>{stageLabel}</TableCell>
          </TableRow>
          {rows.map((item, key) => (
            <TableRow key={`${stageKey}-${key}`}>
              <TableCell sx={{ width: "28%" }}>
                <MyAutocomplite
                  multiple={false}
                  disableNoSsr
                  optionKey="un_id"
                  getOptionKey={(option) => `${option?.un_id}`}
                  data={this.state.items_stage?.all ?? []}
                  value={item.type_id}
                  func={this.changeItemData.bind(this, key, stageKey)}
                />
              </TableCell>
              <TableCell sx={{ width: "7%" }}>
                <MyTextInput
                  value={item.ei_name}
                  disabled={true}
                  className="disabled_input"
                />
              </TableCell>
              <TableCell sx={{ width: "9%" }}>
                <MyTextInput
                  value={item.brutto}
                  isDecimalMask
                  func={this.changeItemList.bind(this, "brutto", key, stageKey)}
                  onBlur={this.formatDecimalListField.bind(this, "brutto", key, stageKey)}
                />
              </TableCell>
              <TableCell sx={{ width: "9%" }}>
                <MyTextInput
                  value={item.pr_1}
                  type={"number"}
                  func={this.changeItemList.bind(this, "pr_1", key, stageKey)}
                />
              </TableCell>
              <TableCell sx={{ width: "11%" }}>
                <MyTextInput
                  value={item.netto}
                  isDecimalMask
                  disabled={true}
                  className="disabled_input"
                />
              </TableCell>
              <TableCell sx={{ width: "11%" }}>
                <MyTextInput
                  value={item.pr_2}
                  type={"number"}
                  func={this.changeItemList.bind(this, "pr_2", key, stageKey)}
                />
              </TableCell>
              <TableCell sx={{ width: "11%" }}>
                <MyTextInput
                  value={item.res}
                  isDecimalMask
                  disabled={true}
                  className="disabled_input"
                />
              </TableCell>
              <TableCell sx={{ width: "11%" }}>
                <MySelect
                  is_none={false}
                  data={stages}
                  value={item.stage}
                  func={this.changeItemSelect.bind(this, "stage", key, stageKey, item)}
                />
              </TableCell>
              <TableCell
                align="center"
                sx={{ width: "3%" }}
              >
                <IconButton
                  onClick={this.deleteItemData.bind(this, key, stageKey)}
                  sx={actionIconButtonSx}
                >
                  <CloseIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </React.Fragment>
      );
    };

    const renderItemRows = () =>
      (this.state.item_items?.this_items || []).map((item, key) => (
        <TableRow key={`item-row-${key}`}>
          <TableCell sx={{ width: "38%" }}>
            <MyAutocomplite
              multiple={false}
              disableNoSsr
              data={this.state.item_items?.all_items ?? []}
              value={item.item_id}
              func={this.changeItemData.bind(this, key, "this_items")}
            />
          </TableCell>
          <TableCell sx={{ width: "13%" }}>
            <MyTextInput
              value={item.brutto}
              isDecimalMask
              func={this.changeItemList.bind(this, "brutto", key, "this_items")}
              onBlur={this.formatDecimalListField.bind(this, "brutto", key, "this_items")}
            />
          </TableCell>
          <TableCell sx={{ width: "10%" }}>
            <MyTextInput
              value={item.pr_1}
              type={"number"}
              func={this.changeItemList.bind(this, "pr_1", key, "this_items")}
            />
          </TableCell>
          <TableCell sx={{ width: "13%" }}>
            <MyTextInput
              value={item.netto}
              isDecimalMask
              disabled={true}
              className="disabled_input"
            />
          </TableCell>
          <TableCell sx={{ width: "10%" }}>
            <MyTextInput
              value={item.pr_2}
              type={"number"}
              func={this.changeItemList.bind(this, "pr_2", key, "this_items")}
            />
          </TableCell>
          <TableCell sx={{ width: "13%" }}>
            <MyTextInput
              value={item.res}
              isDecimalMask
              disabled={true}
              className="disabled_input"
            />
          </TableCell>
          <TableCell
            align="center"
            sx={{ width: "3%" }}
          >
            <IconButton
              onClick={this.deleteItemData.bind(this, key, "this_items")}
              sx={actionIconButtonSx}
            >
              <CloseIcon />
            </IconButton>
          </TableCell>
        </TableRow>
      ));

    return (
      <>
        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />
        {this.state.modalNewTag ? (
          <Dialog
            maxWidth={false}
            fullWidth={true}
            open={this.state.modalNewTag}
            onClose={() => this.setState({ modalNewTag: false })}
            slotProps={{
              paper: {
                sx: {
                  width: "100%",
                  maxWidth: {
                    xs: "calc(100vw - 20px)",
                    sm: 520,
                  },
                  borderRadius: 3,
                  m: {
                    xs: 1.25,
                    sm: 2,
                  },
                  overflow: "hidden",
                  boxShadow: "none",
                },
              },
              backdrop: {
                sx: {
                  backgroundColor: "rgba(0,0,0,0.3)",
                },
              },
            }}
          >
            <DialogTitle
              sx={{
                minHeight: 56,
                px: 2,
                py: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: blockBackground,
                borderBottom: `1px solid ${blockBorder}`,
                color: textSecondary,
              }}
            >
              <Typography
                sx={{
                  color: textPrimary,
                  fontSize: 18,
                  lineHeight: "24px",
                  fontWeight: 700,
                }}
              >
                Новый тег
              </Typography>
              <IconButton
                onClick={() => this.setState({ modalNewTag: false })}
                sx={{
                  color: "#A6A6A6",
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={dialogContentSx}>
              <Grid
                container
                spacing={2.5}
              >
                <Grid
                  size={{
                    xs: 12,
                  }}
                  style={{ paddingTop: 20 }}
                >
                  <MyTextInput
                    label="Название тега"
                    value={this.state.tag_name_new}
                    func={this.changeItem.bind(this, "tag_name_new")}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions
              sx={{
                px: 2,
                pb: 2,
                pt: 2,
                justifyContent: "space-between",
              }}
            >
              <Button
                onClick={() => this.setState({ modalNewTag: false })}
                sx={{
                  minHeight: 42,
                  px: 2,
                  borderRadius: 2,
                  border: `1px solid ${blockBorder}`,
                  color: textPrimary,
                  backgroundColor: "#FFFFFF",
                  textTransform: "none",
                  "&:hover": {
                    borderColor: blockBorder,
                    backgroundColor: "#FFFFFF",
                  },
                }}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                onClick={this.saveNewTag.bind(this)}
                variant="contained"
                sx={{
                  minHeight: 42,
                  px: 2.5,
                  borderRadius: 2,
                  backgroundColor: brandRed,
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: brandRed,
                    boxShadow: "none",
                  },
                }}
              >
                Сохранить
              </Button>
            </DialogActions>
          </Dialog>
        ) : null}
        <Dialog
          open={open}
          maxWidth={false}
          onClose={this.onClose.bind(this)}
          fullScreen={fullScreen}
          slotProps={{
            paper: {
              sx: dialogPaperSx,
            },
            backdrop: {
              sx: {
                backgroundColor: "rgba(0,0,0,0.3)",
              },
            },
          }}
        >
          <DialogTitle
            sx={{
              px: {
                xs: 1.5,
                md: 2.5,
              },
              py: {
                xs: 1.25,
                md: 1.5,
              },
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 2,
              bgcolor: blockBackground,
              borderBottom: `1px solid ${blockBorder}`,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  color: textSecondary,
                  fontSize: 13,
                  lineHeight: "18px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {activeSection.label}
              </Typography>
              <Typography
                sx={{
                  mt: 0.5,
                  color: textPrimary,
                  fontSize: {
                    xs: 20,
                    md: 24,
                  },
                  lineHeight: {
                    xs: "26px",
                    md: "32px",
                  },
                  fontWeight: 700,
                }}
              >
                {method === "Новое блюдо" ? "Новая карточка блюда" : method}
              </Typography>
              <Typography
                sx={{
                  mt: 0.75,
                  maxWidth: 720,
                  color: textSecondary,
                  fontSize: 14,
                  lineHeight: "20px",
                }}
              >
                {activeSection.description}
              </Typography>
            </Box>
            <IconButton
              onClick={this.onClose.bind(this)}
              sx={{
                mt: {
                  xs: -0.25,
                  md: 0,
                },
                color: "#A6A6A6",
                borderRadius: "50%",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={dialogContentSx}>
            <TabContext value={this.state.activeTab}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: {
                    xs: "column",
                    lg: "row",
                  },
                  gap: {
                    xs: 2,
                    lg: 2,
                  },
                  minHeight: {
                    lg: 680,
                  },
                }}
              >
                <Box
                  sx={{
                    display: {
                      xs: "block",
                      lg: "none",
                    },
                  }}
                >
                  <TabList
                    onChange={this.changeTab.bind(this)}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={mobileTabListSx}
                  >
                    {modalSections.map((section, index) => (
                      <Tab
                        key={section.value}
                        label={section.label}
                        value={section.value}
                        {...a11yProps(index)}
                      />
                    ))}
                  </TabList>
                </Box>

                <Paper sx={desktopNavPaperSx}>
                  <Stack spacing={1}>
                    <Typography
                      sx={{
                        color: textPrimary,
                        fontSize: 18,
                        lineHeight: "24px",
                        fontWeight: 700,
                      }}
                    >
                      Разделы
                    </Typography>

                    {modalSections.map((section) => {
                      const active = this.state.activeTab === section.value;

                      return (
                        <Button
                          key={section.value}
                          onClick={(event) => this.changeTab(event, section.value)}
                          sx={desktopNavButtonSx(active)}
                        >
                          <Box sx={{ textAlign: "left" }}>
                            <Typography
                              sx={{
                                color: active ? textPrimary : textSecondary,
                                fontSize: 15,
                                lineHeight: "20px",
                                fontWeight: 700,
                              }}
                            >
                              {section.label}
                            </Typography>
                            <Typography
                              sx={{
                                mt: 0.5,
                                color: active ? textSecondary : "#737373",
                                fontSize: 12,
                                lineHeight: "17px",
                              }}
                            >
                              {section.description}
                            </Typography>
                          </Box>
                        </Button>
                      );
                    })}
                  </Stack>
                </Paper>

                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    mt: 2.5,
                  }}
                >
                  <TabPanel
                    value="0"
                    sx={{ p: 0 }}
                  >
                    <Stack spacing={2.5}>
                      {renderSectionCard(
                        "Основные данные",
                        "Карточка блюда",
                        "Заполните ключевые поля карточки: название, код, дату начала действия, категорию и параметры для зала.",
                        <Grid
                          container
                          spacing={2.5}
                        >
                          <Grid
                            size={{
                              xs: 12,
                              md: 6,
                            }}
                            style={hiddenIf(!access?.name_edit && !access?.name_view)}
                          >
                            <MyTextInput
                              label="Наименование"
                              disabled={!access?.name_edit}
                              value={this.state.name}
                              onFocus={() => this.clearFieldError("name")}
                              sx={this.getErrorFieldSx("name")}
                              func={this.changeItem.bind(this, "name")}
                            />
                          </Grid>
                          <Grid
                            size={{
                              xs: 12,
                              md: 6,
                            }}
                            style={hiddenIf(!access?.short_name_edit && !access?.short_name_view)}
                          >
                            <MyTextInput
                              label="Короткое название (20 символов)"
                              value={this.state.short_name}
                              inputProps={{ maxLength: 20 }}
                              disabled={!access?.short_name_edit}
                              onFocus={() => this.clearFieldError("short_name")}
                              sx={this.getErrorFieldSx("short_name")}
                              func={this.changeItem.bind(this, "short_name")}
                              multiline={true}
                              maxRows={3}
                            />
                          </Grid>
                          <Grid
                            size={{
                              xs: 12,
                              md: 4,
                            }}
                            style={hiddenIf(!access?.art_edit && !access?.art_view)}
                          >
                            <MyTextInput
                              label="Код 1С"
                              value={this.state.art}
                              disabled={!access?.art_edit}
                              onFocus={() => this.clearFieldError("art")}
                              sx={this.getErrorFieldSx("art")}
                              func={this.changeItem.bind(this, "art")}
                            />
                          </Grid>
                          <Grid
                            size={{
                              xs: 12,
                              md: 3,
                            }}
                            style={hiddenIf(!access?.date_start_edit && !access?.date_start_view)}
                          >
                            <MyDatePickerNew
                              label="Действует с"
                              value={this.state.date_start}
                              disabled={!access?.date_start_edit}
                              sx={this.getErrorFieldSx("date_start")}
                              func={this.changeDateRange.bind(this, "date_start")}
                              minDate={dayjs(new Date())}
                            />
                          </Grid>
                          <Grid
                            size={{
                              xs: 12,
                              md: 3,
                            }}
                            style={hiddenIf(!access?.category_id_edit && !access?.category_id_view)}
                          >
                            <MyAutocomplite
                              label="Категория"
                              multiple={false}
                              data={category}
                              disabled={!access?.category_id_edit}
                              value={this.state.category_id}
                              onFocus={() => this.clearFieldError("category_id")}
                              sx={this.getErrorFieldSx("category_id")}
                              func={(event, value) => this.updateFieldValue("category_id", value)}
                            />
                          </Grid>
                          <Grid
                            size={{
                              xs: 12,
                              md: 2,
                            }}
                            style={hiddenIf(!access?.stol_edit && !access?.stol_view)}
                          >
                            <MyTextInput
                              label="Стол"
                              type="number"
                              onWheel={(e) => e.target.blur()}
                              value={this.state.stol}
                              disabled={!access?.stol_edit}
                              onFocus={() => this.clearFieldError("stol")}
                              sx={this.getErrorFieldSx("stol")}
                              func={this.changeItem.bind(this, "stol")}
                            />
                          </Grid>
                        </Grid>,
                      )}
                    </Stack>
                  </TabPanel>

                  <TabPanel
                    value="1"
                    sx={{ p: 0 }}
                  >
                    <Stack spacing={2.5}>
                      {renderSectionCard(
                        "Порция",
                        "Размер и выход порции",
                        "Поля используются для базовых параметров блюда и отображения в карточке.",
                        <Grid
                          container
                          spacing={2.5}
                        >
                          <Grid
                            size={{
                              xs: 12,
                              md: 6,
                            }}
                            style={hiddenIf(!access?.count_part_edit && !access?.count_part_view)}
                          >
                            <MyTextInput
                              label="Кусочков или размер"
                              type="number"
                              onWheel={(e) => e.target.blur()}
                              disabled={!access?.count_part_edit}
                              value={this.state.count_part}
                              onFocus={() => this.clearFieldError("count_part")}
                              sx={this.getErrorFieldSx("count_part")}
                              func={this.changeItem.bind(this, "count_part")}
                            />
                          </Grid>
                          <Grid
                            size={{
                              xs: 12,
                              md: 6,
                            }}
                            style={hiddenIf(!access?.weight_edit && !access?.weight_view)}
                          >
                            <MyTextInput
                              label="Вес"
                              type="number"
                              onWheel={(e) => e.target.blur()}
                              value={this.state.weight}
                              disabled={!access?.weight_edit}
                              onFocus={() => this.clearFieldError("weight")}
                              sx={this.getErrorFieldSx("weight")}
                              func={this.changeItem.bind(this, "weight")}
                            />
                          </Grid>
                        </Grid>,
                      )}
                      {renderSectionCard(
                        "БЖУ",
                        "Пищевая ценность",
                        "Блок для показателей на 100 г или на порцию, в зависимости от принятой логики заполнения.",
                        <Grid
                          container
                          spacing={2.5}
                        >
                          <Grid
                            size={{
                              xs: 12,
                              md: 4,
                            }}
                            style={hiddenIf(!access?.protein_edit && !access?.protein_view)}
                          >
                            <MyTextInput
                              label="Белки"
                              type="number"
                              onWheel={(e) => e.target.blur()}
                              value={this.state.protein}
                              disabled={!access?.protein_edit}
                              onFocus={() => this.clearFieldError("protein")}
                              sx={this.getErrorFieldSx("protein")}
                              func={this.changeItem.bind(this, "protein")}
                            />
                          </Grid>
                          <Grid
                            size={{
                              xs: 12,
                              md: 4,
                            }}
                            style={hiddenIf(!access?.fat_edit && !access?.fat_view)}
                          >
                            <MyTextInput
                              label="Жиры"
                              type="number"
                              onWheel={(e) => e.target.blur()}
                              value={this.state.fat}
                              disabled={!access?.fat_edit}
                              onFocus={() => this.clearFieldError("fat")}
                              sx={this.getErrorFieldSx("fat")}
                              func={this.changeItem.bind(this, "fat")}
                            />
                          </Grid>
                          <Grid
                            size={{
                              xs: 12,
                              md: 4,
                            }}
                            style={hiddenIf(
                              !access?.carbohydrates_edit && !access?.carbohydrates_view,
                            )}
                          >
                            <MyTextInput
                              label="Углеводы"
                              type="number"
                              onWheel={(e) => e.target.blur()}
                              value={this.state.carbohydrates}
                              disabled={!access?.carbohydrates_edit}
                              onFocus={() => this.clearFieldError("carbohydrates")}
                              sx={this.getErrorFieldSx("carbohydrates")}
                              func={this.changeItem.bind(this, "carbohydrates")}
                            />
                          </Grid>
                        </Grid>,
                      )}
                    </Stack>
                  </TabPanel>

                  <TabPanel
                    value="2"
                    sx={{ p: 0 }}
                  >
                    <Stack spacing={2.5}>
                      {renderSectionCard(
                        "Описание",
                        "Тексты для карточки",
                        "Соберите текстовую часть блюда: состав, полное описание и короткий анонс для списка.",
                        <Grid
                          container
                          spacing={2.5}
                        >
                          <Grid
                            size={{
                              xs: 12,
                            }}
                            style={hiddenIf(!access?.tmp_desc_edit && !access?.tmp_desc_view)}
                          >
                            <MyTextInput
                              label="Состав"
                              value={this.state.tmp_desc}
                              disabled={!access?.tmp_desc_edit}
                              onFocus={() => this.clearFieldError("tmp_desc")}
                              sx={this.getErrorFieldSx("tmp_desc")}
                              func={this.changeItem.bind(this, "tmp_desc")}
                              multiline={true}
                              minRows={4}
                            />
                          </Grid>
                          <Grid
                            size={{
                              xs: 12,
                            }}
                            style={hiddenIf(
                              !access?.marc_desc_full_edit && !access?.marc_desc_full_view,
                            )}
                          >
                            <MyTextInput
                              label="Полное описание (в карточке)"
                              value={this.state.marc_desc_full}
                              disabled={!access?.marc_desc_full_edit}
                              onFocus={() => this.clearFieldError("marc_desc_full")}
                              sx={this.getErrorFieldSx("marc_desc_full")}
                              func={this.changeItem.bind(this, "marc_desc_full")}
                              multiline={true}
                              minRows={4}
                            />
                          </Grid>
                          <Grid
                            size={{
                              xs: 12,
                            }}
                            style={hiddenIf(!access?.marc_desc_edit && !access?.marc_desc_view)}
                          >
                            <MyTextInput
                              label="Короткое описание (в списке)"
                              value={this.state.marc_desc}
                              maxLength={20}
                              disabled={!access?.marc_desc_edit}
                              onFocus={() => this.clearFieldError("marc_desc")}
                              sx={this.getErrorFieldSx("marc_desc")}
                              func={this.changeItem.bind(this, "marc_desc")}
                              multiline={true}
                              minRows={3}
                            />
                          </Grid>
                        </Grid>,
                      )}
                    </Stack>
                  </TabPanel>

                  <TabPanel
                    value="3"
                    sx={{ p: 0 }}
                  >
                    <Stack spacing={2.5}>
                      {renderSectionCard(
                        "Теги",
                        "Подборка тегов",
                        "Теги помогают быстрее находить блюдо и формировать тематические подборки.",
                        <Grid
                          container
                          spacing={2.5}
                        >
                          <Grid
                            size={{
                              xs: 12,
                            }}
                          >
                            <MyAutocomplite
                              label="Теги"
                              multiple={true}
                              data={this.state.tags_all}
                              value={this.state.tags_my}
                              onFocus={() => this.clearFieldError("tags_my")}
                              sx={this.getErrorFieldSx("tags_my")}
                              func={this.changeAutocomplite.bind(this, "tags_my")}
                            />
                          </Grid>
                        </Grid>,
                      )}
                      {renderSectionCard(
                        "Промо-маркеры",
                        "Визуальные акценты",
                        "Настройте ярлыки, которые будут выделять блюдо на витрине и в подборках.",
                        <Grid
                          container
                          spacing={2}
                        >
                          <Grid
                            size={{
                              xs: 12,
                              md: 4,
                            }}
                            style={hiddenIf(!access?.is_new_edit && !access?.is_new_view)}
                          >
                            {renderToggleCard(
                              "Новинка",
                              isChecked(this.state.is_new),
                              this.changeItemChecked.bind(this, "is_new"),
                              !access?.is_new_edit,
                            )}
                          </Grid>
                          <Grid
                            size={{
                              xs: 12,
                              md: 4,
                            }}
                          >
                            {renderToggleCard(
                              "Обновлено",
                              isChecked(this.state.is_updated),
                              this.changeItemChecked.bind(this, "is_updated"),
                            )}
                          </Grid>
                          <Grid
                            size={{
                              xs: 12,
                              md: 4,
                            }}
                            style={hiddenIf(!access?.is_hit_edit && !access?.is_hit_view)}
                          >
                            {renderToggleCard(
                              "Хит",
                              isChecked(this.state.is_hit),
                              this.changeItemChecked.bind(this, "is_hit"),
                              !access?.is_hit_edit,
                            )}
                          </Grid>
                        </Grid>,
                      )}
                    </Stack>
                  </TabPanel>

                  <TabPanel
                    value="4"
                    sx={{ p: 0 }}
                  >
                    <Stack spacing={2.5}>
                      {renderSectionCard(
                        "Активность",
                        "Публикация и продажи",
                        "Определите, где блюдо доступно и должно ли участвовать в сценариях показа и продаж.",
                        <Grid
                          container
                          spacing={2}
                        >
                          <Grid
                            size={{
                              xs: 12,
                              md: 6,
                            }}
                            style={hiddenIf(!access?.is_price_edit && !access?.is_price_view)}
                          >
                            {renderToggleCard(
                              "Установить цену",
                              isChecked(this.state.is_price),
                              this.changeItemChecked.bind(this, "is_price"),
                              !access?.is_price_edit,
                            )}
                          </Grid>
                          <Grid
                            size={{
                              xs: 12,
                              md: 6,
                            }}
                            style={hiddenIf(!access?.is_show_edit && !access?.is_show_view)}
                          >
                            {renderToggleCard(
                              "Активность",
                              isChecked(this.state.is_show),
                              this.changeItemChecked.bind(this, "is_show"),
                              !access?.is_show_edit,
                            )}
                          </Grid>
                          <Grid
                            size={{
                              xs: 12,
                              md: 6,
                            }}
                            style={hiddenIf(!access?.show_site_edit && !access?.show_site_view)}
                          >
                            {renderToggleCard(
                              "На сайте и КЦ",
                              isChecked(this.state.show_site),
                              this.changeItemChecked.bind(this, "show_site"),
                              !access?.show_site_edit,
                            )}
                          </Grid>
                          <Grid
                            size={{
                              xs: 12,
                              md: 6,
                            }}
                            style={hiddenIf(
                              !access?.show_program_edit && !access?.show_program_view,
                            )}
                          >
                            {renderToggleCard(
                              "На кассе",
                              isChecked(this.state.show_program),
                              this.changeItemChecked.bind(this, "show_program"),
                              !access?.show_program_edit,
                            )}
                          </Grid>
                        </Grid>,
                      )}
                    </Stack>
                  </TabPanel>

                  <TabPanel
                    value="5"
                    keepMounted={this.state.compositionTabMounted}
                    sx={{ p: 0 }}
                  >
                    <Stack spacing={2.5}>
                      {renderSectionCard(
                        "Тайминги",
                        "Время по этапам",
                        "Укажите продолжительность для каждого производственного этапа в формате MM:SS.",
                        <Grid
                          container
                          spacing={2.5}
                        >
                          <Grid
                            size={{
                              xs: 12,
                              md: 4,
                            }}
                            style={hiddenIf(
                              !access?.time_stage_1_edit && !access?.time_stage_1_view,
                            )}
                          >
                            <MyTextInput
                              label="Время на 1 этап MM:SS"
                              value={this.state.time_stage_1}
                              disabled={!access?.time_stage_1_edit}
                              onFocus={() => this.clearFieldError("time_stage_1")}
                              sx={this.getErrorFieldSx("time_stage_1")}
                              isTimeMask={true}
                              placeholder="MM:SS"
                              func={this.changeItem.bind(this, "time_stage_1")}
                            />
                          </Grid>
                          <Grid
                            size={{
                              xs: 12,
                              md: 4,
                            }}
                            style={hiddenIf(
                              !access?.time_stage_2_edit && !access?.time_stage_2_view,
                            )}
                          >
                            <MyTextInput
                              label="Время на 2 этап MM:SS"
                              value={this.state.time_stage_2}
                              disabled={!access?.time_stage_2_edit}
                              onFocus={() => this.clearFieldError("time_stage_2")}
                              sx={this.getErrorFieldSx("time_stage_2")}
                              isTimeMask={true}
                              placeholder="MM:SS"
                              func={this.changeItem.bind(this, "time_stage_2")}
                            />
                          </Grid>
                          <Grid
                            size={{
                              xs: 12,
                              md: 4,
                            }}
                            style={hiddenIf(
                              !access?.time_stage_3_edit && !access?.time_stage_3_view,
                            )}
                          >
                            <MyTextInput
                              label="Время на 3 этап MM:SS"
                              value={this.state.time_stage_3}
                              disabled={!access?.time_stage_3_edit}
                              onFocus={() => this.clearFieldError("time_stage_3")}
                              sx={this.getErrorFieldSx("time_stage_3")}
                              isTimeMask={true}
                              placeholder="MM:SS"
                              func={this.changeItem.bind(this, "time_stage_3")}
                            />
                          </Grid>
                        </Grid>,
                      )}

                      {renderSectionCard(
                        "Заготовки",
                        "Состав технологической карты",
                        "Добавляйте заготовки, управляйте потерями и перемещайте их по этапам.",
                        <Box sx={tableWrapperSx}>
                          <Table sx={tableSx}>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={tableHeaderCellSx}>Номенклатура</TableCell>
                                <TableCell sx={tableHeaderCellSx}>Ед. изм.</TableCell>
                                <TableCell sx={tableHeaderCellSx}>Брутто</TableCell>
                                <TableCell sx={tableHeaderCellSx}>% потери при ХО</TableCell>
                                <TableCell sx={tableHeaderCellSx}>Нетто</TableCell>
                                <TableCell sx={tableHeaderCellSx}>% потери при ГО</TableCell>
                                <TableCell sx={tableHeaderCellSx}>Выход</TableCell>
                                <TableCell sx={tableHeaderCellSx}>Этап</TableCell>
                                <TableCell
                                  align="center"
                                  sx={tableHeaderCellSx}
                                />
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {renderPreparationRows("stage_1", "1 этап")}
                              {renderPreparationRows("stage_2", "2 этап")}
                              {renderPreparationRows("stage_3", "3 этап")}
                              {renderPreparationRows("not_stage", "Без этапа")}
                              <TableRow>
                                <TableCell>
                                  <MyAutocomplite
                                    multiple={false}
                                    disableNoSsr
                                    data={this.state.items_stage?.all ?? []}
                                    disabledItemsFocusable={true}
                                    value={null}
                                    optionKey="un_id"
                                    blurOnSelect={true}
                                    autoFocus={false}
                                    func={this.chooseItem.bind(this, "stages")}
                                  />
                                </TableCell>
                                <TableCell colSpan={8} />
                              </TableRow>
                              <TableRow sx={tableTotalRowSx}>
                                <TableCell colSpan={2}>
                                  <Typography
                                    sx={{
                                      color: textPrimary,
                                      fontWeight: 700,
                                    }}
                                  >
                                    Итого по заготовкам
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <MyTextInput
                                    value={this.state.all_w_brutto_p}
                                    isDecimalMask
                                    disabled={true}
                                    className="disabled_input"
                                  />
                                </TableCell>
                                <TableCell />
                                <TableCell>
                                  <MyTextInput
                                    value={this.state.all_w_netto_p}
                                    isDecimalMask
                                    disabled={true}
                                    className="disabled_input"
                                  />
                                </TableCell>
                                <TableCell />
                                <TableCell>
                                  <MyTextInput
                                    value={this.state.all_w_p}
                                    isDecimalMask
                                    disabled={true}
                                    className="disabled_input"
                                  />
                                </TableCell>
                                <TableCell colSpan={2} />
                              </TableRow>
                            </TableBody>
                          </Table>
                        </Box>,
                        {},
                        {
                          px: {
                            xs: 1.25,
                            md: 1.5,
                          },
                          py: {
                            xs: 1.5,
                            md: 1.75,
                          },
                        },
                      )}

                      {renderSectionCard(
                        "Позиции",
                        "Финальные товары",
                        "Управляйте позициями, которые формируют итоговый состав блюда.",
                        <Box sx={tableWrapperSx}>
                          <Table sx={positionTableSx}>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={tableHeaderCellSx}>Позиция</TableCell>
                                <TableCell sx={tableHeaderCellSx}>Брутто</TableCell>
                                <TableCell sx={tableHeaderCellSx}>% потери при ХО</TableCell>
                                <TableCell sx={tableHeaderCellSx}>Нетто</TableCell>
                                <TableCell sx={tableHeaderCellSx}>% потери при ГО</TableCell>
                                <TableCell sx={tableHeaderCellSx}>Выход</TableCell>
                                <TableCell
                                  align="center"
                                  sx={tableHeaderCellSx}
                                />
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {renderItemRows()}
                              <TableRow>
                                <TableCell>
                                  <MyAutocomplite
                                    multiple={false}
                                    disableNoSsr
                                    data={this.state.item_items?.all_items ?? []}
                                    disabledItemsFocusable={true}
                                    value={null}
                                    blurOnSelect={true}
                                    autoFocus={false}
                                    func={this.chooseItem.bind(this, "items")}
                                  />
                                </TableCell>
                                <TableCell colSpan={6} />
                              </TableRow>
                              <TableRow sx={tableTotalRowSx}>
                                <TableCell>
                                  <Typography
                                    sx={{
                                      color: textPrimary,
                                      fontWeight: 700,
                                    }}
                                  >
                                    Итого по позициям
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <MyTextInput
                                    value={this.state.all_w_brutto}
                                    isDecimalMask
                                    disabled={true}
                                    className="disabled_input"
                                  />
                                </TableCell>
                                <TableCell />
                                <TableCell>
                                  <MyTextInput
                                    value={this.state.all_w_netto}
                                    isDecimalMask
                                    disabled={true}
                                    className="disabled_input"
                                  />
                                </TableCell>
                                <TableCell />
                                <TableCell>
                                  <MyTextInput
                                    value={this.state.all_w}
                                    isDecimalMask
                                    disabled={true}
                                    className="disabled_input"
                                  />
                                </TableCell>
                                <TableCell />
                              </TableRow>
                            </TableBody>
                          </Table>
                        </Box>,
                        {},
                        {
                          px: {
                            xs: 1.25,
                            md: 1.5,
                          },
                          py: {
                            xs: 1.5,
                            md: 1.75,
                          },
                        },
                      )}
                    </Stack>
                  </TabPanel>

                  <Box
                    sx={{
                      display: this.state.activeTab === "0" ? "block" : "none",
                      mt: this.state.activeTab === "0" ? 2.5 : 0,
                    }}
                  >
                    {renderSectionCard(
                      "Изображение",
                      "Фото для карточки",
                      "Нужен квадратный исходник 1:1, например 2000x2000. Загружаем только JPG.",
                      <Grid
                        container
                        spacing={2.5}
                        alignItems="flex-start"
                      >
                        {this.state.img_app.length > 0 ? (
                          <Grid
                            size={{
                              xs: 12,
                              xl: 6,
                            }}
                          >
                            <Box
                              sx={{
                                borderRadius: 3,
                                overflow: "hidden",
                                border: `1px solid ${blockBorder}`,
                                backgroundColor: blockBackground,
                              }}
                            >
                              <img
                                src={`https://storage.yandexcloud.net/site-img/${this.state?.img_app.toLowerCase()}site_items_2000x2000.jpg`}
                                alt="Изображение"
                                style={{
                                  width: "100%",
                                  height: "auto",
                                  display: "block",
                                  objectFit: "cover",
                                }}
                              />
                            </Box>
                          </Grid>
                        ) : null}
                        <Grid
                          size={{
                            xs: 12,
                            xl: this.state.img_app.length > 0 ? 6 : 12,
                          }}
                        >
                          <Box
                            sx={{
                              position: "relative",
                              borderRadius: 3,
                              border: `1px dashed ${blockBorder}`,
                              backgroundColor: access?.dropzone_edit ? "#FFFFFF" : blockBackground,
                              overflow: "hidden",
                              "& .dz-message": {
                                display: "none",
                              },
                              "& .dz-preview": {
                                margin: 1.5,
                              },
                              ...(!access?.dropzone_edit
                                ? {
                                    opacity: 0.75,
                                  }
                                : {}),
                            }}
                          >
                            {!this.state.hasDropzoneFile ? (
                              <Stack
                                spacing={0.75}
                                sx={{
                                  position: "absolute",
                                  inset: 0,
                                  px: 3,
                                  alignItems: "center",
                                  justifyContent: "center",
                                  textAlign: "center",
                                  pointerEvents: "none",
                                  zIndex: 1,
                                }}
                              >
                                <Typography
                                  sx={{
                                    color: textPrimary,
                                    fontWeight: 700,
                                    fontSize: {
                                      xs: 18,
                                      md: 20,
                                    },
                                    lineHeight: 1.2,
                                  }}
                                >
                                  Перетащите изображение сюда
                                </Typography>
                                <Typography
                                  sx={{
                                    maxWidth: 420,
                                    color: textSecondary,
                                    fontSize: 15,
                                    lineHeight: 1.45,
                                  }}
                                >
                                  Или нажмите на область загрузки, чтобы выбрать JPG или PNG с
                                  компьютера.
                                </Typography>
                              </Stack>
                            ) : null}
                            <div
                              className="dropzone"
                              id="for_img_edit_new"
                              ref={this.dropzoneRef}
                              style={{
                                width: "100%",
                                minHeight: 220,
                                position: "relative",
                                zIndex: 2,
                                ...(!access?.dropzone_edit
                                  ? {
                                      pointerEvents: "none",
                                      cursor: "not-allowed",
                                      filter: "grayscale(50%)",
                                    }
                                  : {}),
                              }}
                            />
                          </Box>
                        </Grid>
                      </Grid>,
                    )}
                  </Box>
                </Box>
              </Box>
            </TabContext>
          </DialogContent>
          <DialogActions
            sx={{
              px: {
                xs: 1.5,
                md: 2.5,
              },
              py: {
                xs: 1.5,
                md: 2,
              },
              borderTop: `1px solid ${blockBorder}`,
              backgroundColor: "#FFFFFF",
              justifyContent: "space-between",
            }}
          >
            <Button
              onClick={this.onClose.bind(this)}
              sx={{
                minHeight: 44,
                px: 2,
                borderRadius: 2,
                border: `1px solid ${blockBorder}`,
                color: textPrimary,
                backgroundColor: "#FFFFFF",
                textTransform: "none",
                "&:hover": {
                  borderColor: blockBorder,
                  backgroundColor: "#FFFFFF",
                },
              }}
            >
              Закрыть
            </Button>
            <Button
              variant="contained"
              onClick={this.save.bind(this)}
              disabled={!canSave}
              sx={{
                minHeight: 44,
                px: 2.5,
                borderRadius: 2,
                backgroundColor: brandRed,
                textTransform: "none",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: brandRed,
                  boxShadow: "none",
                },
                "&.Mui-disabled": {
                  backgroundColor: "#F0B7BF",
                  color: "#FFFFFF",
                },
              }}
            >
              {method === "Новое блюдо" ? "Создать блюдо" : "Сохранить изменения"}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}
