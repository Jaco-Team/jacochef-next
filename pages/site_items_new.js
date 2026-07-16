import React, { useState } from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import EditNoteIcon from "@mui/icons-material/EditNote";
import AddIcon from "@mui/icons-material/Add";
import SyncIcon from "@mui/icons-material/Sync";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";

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

import { MySelect, MyCheckBox, MyTextInput, MyDatePickerNew, MyAutocomplite } from "@/ui/Forms";

import Dropzone from "dropzone";
import { api_laravel_local, api_laravel } from "@/src/api_new";
import dayjs from "dayjs";
import { formatDate } from "@/src/helpers/ui/formatDate";
import MyAlert from "@/ui/MyAlert";
import { SiteItemsModalTech } from "@/components/site_items_new/site_items_tech_modal";
import SiteItemsHistoryModal from "@/components/site_items_new/site_items_history_modal";
import {
  SITE_ITEMS_MODAL_FIELD_KEYS,
  canEditAccess,
  canViewAccess,
  filterCatsByActivity,
  filterCatsByName,
  hasAccessValue,
} from "@/components/site_items_new/site_items_access";
import { TableSortLabel, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const brandRed = "#DD1A32";
const blockBackground = "#F3F3F3";
const blockBorder = "#E5E5E5";
const textPrimary = "#3C3B3B";
const textSecondary = "#5E5E5E";
const siteItemModalAccessFields = SITE_ITEMS_MODAL_FIELD_KEYS;
const tableSortLabelSx = {
  fontWeight: 600,
  color: textPrimary,
  "&.Mui-active": {
    color: brandRed,
  },
  "& .MuiTableSortLabel-icon": {
    color: `${brandRed} !important`,
  },
};

function roundTo(n, digits) {
  if (n.length == 0) {
    return n;
  }

  var negative = false;
  if (digits === undefined) {
    digits = 0;
  }
  if (n < 0) {
    negative = true;
    n = n * -1;
  }
  var multiplicator = Math.pow(10, digits);
  n = parseFloat((n * multiplicator).toFixed(11));
  n = (Math.round(n) / multiplicator).toFixed(digits);
  if (negative) {
    n = (n * -1).toFixed(digits);
  }
  return n;
}

function getSiteItemHistoryTimestamp(item) {
  return item?.update_item || item?.date_update || item?.date_start || "";
}

function getSiteItemHistoryDateValue(item) {
  const timestamp = getSiteItemHistoryTimestamp(item);
  const parsed = timestamp ? new Date(timestamp).getTime() : 0;

  return Number.isNaN(parsed) ? 0 : parsed;
}

function getLatestSiteItemHistorySnapshot(hist = []) {
  return [...(Array.isArray(hist) ? hist : [])].sort(
    (a, b) => getSiteItemHistoryDateValue(b) - getSiteItemHistoryDateValue(a),
  )[0];
}

function formatSiteItemsTableDate(value, withTime = false) {
  if (!value) {
    return "—";
  }

  const parsed = dayjs(value);

  if (parsed.isValid()) {
    return parsed.format(withTime ? "DD.MM.YYYY HH:mm" : "DD.MM.YYYY");
  }

  return String(value);
}

function OutlineActionButton({ children, onClick, sx = {} }) {
  return (
    <Button
      variant="outlined"
      onClick={onClick}
      sx={{
        minHeight: 40,
        px: 2,
        borderRadius: 1.5,
        borderColor: blockBorder,
        color: textPrimary,
        backgroundColor: "#fff",
        textTransform: "none",
        fontSize: 14,
        lineHeight: "20px",
        fontWeight: 500,
        whiteSpace: "nowrap",
        "&:hover": {
          borderColor: "#CFCFCF",
          backgroundColor: "#FAFAFA",
        },
        ...sx,
      }}
    >
      {children}
    </Button>
  );
}

class SiteItems_Modal_Mark extends React.Component {
  dropzoneOptions = {
    autoProcessQueue: false,
    autoQueue: true,
    maxFiles: 1,
    timeout: 0,
    parallelUploads: 10,
    acceptedFiles: "image/jpeg,image/png",
    addRemoveLinks: true,
    url: "https://apichef.jacochef.ru/api/site_setting/upload_banner",
  };

  myDropzoneNew = null;
  isInit = false;
  click = false;

  constructor(props) {
    super(props);

    this.state = {
      date_start: null,
      date_end: null,
      tmp_desc: "",
      marc_desc: "",
      marc_desc_full: "",
      is_hit: "0",
      is_new: "0",
      show_program: "0",
      show_site: "0",
      img_app: "",
      openAlert: false,
      err_status: true,
      err_text: "",
      tags_all: [],
      tags_my: [],
      modalNewTag: "",
      tag_name_new: "",
    };
  }

  // Метод для валидации размеров изображения

  componentDidUpdate(prevProps) {
    if (!this.props.item) {
      return;
    }

    if (this.props.item !== prevProps.item) {
      const tags = [{ id: -1, name: "Добавить новый тег" }, ...this.props.item?.tags_all];
      this.setState({
        date_start: this.props.item?.date_start ? formatDate(this.props.item.date_start) : null,
        date_end: this.props.item?.date_end ? formatDate(this.props.item.date_end) : null,
        tmp_desc: this.props.item?.tmp_desc,
        marc_desc: this.props.item?.marc_desc,
        marc_desc_full: this.props.item?.marc_desc_full,
        is_hit: parseInt(this.props.item?.is_hit) ? 1 : 0,
        is_new: parseInt(this.props.item?.is_new) ? 1 : 0,
        show_program: parseInt(this.props.item?.show_program) ? 1 : 0,
        show_site: parseInt(this.props.item?.show_site) ? 1 : 0,
        img_app: this.props.item?.img_app ?? "",
        tags_all: tags ?? [],
        tags_my: this.props.item?.tags,
      });

      setTimeout(() => {
        this.myDropzone = new Dropzone("#for_img_edit_new", this.dropzoneOptions);
      }, 300);
    }
  }

  changeItem(type, event, data) {
    this.setState({
      [type]: data ? data : event.target.value,
    });
  }

  changeDateRange(data, event) {
    this.setState({
      [data]: event ? event : "",
    });
  }

  changeItemChecked(type, event) {
    this.setState({
      [type]: event.target.checked === true ? 1 : 0,
    });
  }

  async save() {
    if (!this.click) {
      this.click = true;

      const data = {
        date_start: this.state.date_start ? dayjs(this.state.date_start).format("YYYY-MM-DD") : "",
        date_end: this.state.date_end ? dayjs(this.state.date_end).format("YYYY-MM-DD") : "",
        tmp_desc: this.state.tmp_desc,
        marc_desc: this.state.marc_desc,
        marc_desc_full: this.state.marc_desc_full,
        is_hit: this.state.is_hit,
        is_new: this.state.is_new,
        show_program: this.state.show_program,
        show_site: this.state.show_site,
        img_app: this.state.img_app,
        id: this.props.item.id,
        name: this.props.item.name,
        link: this.props.item.link,
        category_id: this.props.item.category_id,
        weight: this.props.item.weight,
        stol: this.props.item.stol,
        type: this.props.item.type,
        tags: this.state.tags_my,
        type_save: "mark",
      };

      const res = await this.props.getData("save_edit", data);

      if (res.st === false) {
        this.setState({
          openAlert: true,
          err_status: res.st,
          err_text: res.text,
        });
      } else {
        if (this.myDropzone["files"].length > 0) {
          if (this.myDropzone["files"].length > 0 && this.isInit === false) {
            this.isInit = true;

            let name = this.props.item.name,
              id = this.props.item.id,
              type = "new";

            this.myDropzone.on("sending", (file, xhr, data) => {
              let file_type = file.name.split(".");
              file_type = file_type[file_type.length - 1];
              file_type = file_type.toLowerCase();

              data.append("type", "mini");
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

              if (check_img) {
              } else {
                setTimeout(() => {
                  this.onClose(true);
                  this.props.update();
                }, 1000);
              }

              this.isInit = false;
            });
          }

          this.myDropzone.processQueue();
        } else {
          this.onClose(true);
          this.props.update();
        }
      }

      setTimeout(() => {
        this.click = false;
      }, 300);
    }

    this.onClose();
  }

  openNewTag() {
    this.setState({
      modalNewTag: true,
      tag_name_new: "",
    });
  }

  onClose() {
    this.setState({
      date_start: null,
      date_end: null,
      tmp_desc: "",
      marc_desc: "",
      marc_desc_full: "",
      is_hit: "0",
      is_new: "0",
      show_program: "0",
      show_site: "0",
      img_app: "",
    });

    this.props.onClose();
  }

  changeAutocomplite(data, event, value) {
    let check = value.find((item) => parseInt(item.id) === -1);

    if (check) {
      this.openNewTag();

      return;
    } else {
      this.setState({
        [data]: value,
      });
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
    const { open, method, fullScreen } = this.props;

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
            maxWidth={"sm"}
            fullWidth={true}
            open={this.state.modalNewTag}
            onClose={() => this.setState({ modalNewTag: false })}
          >
            <DialogTitle className="button">
              <Typography style={{ alignSelf: "center" }}>Новый тег</Typography>
              <IconButton onClick={() => this.setState({ modalNewTag: false })}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Grid
                container
                spacing={3}
              >
                <Grid
                  size={{
                    xs: 12,
                  }}
                >
                  <MyTextInput
                    label=""
                    value={this.state.tag_name_new}
                    func={this.changeItem.bind(this, "tag_name_new")}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => this.setState({ modalNewTag: false })}>Отмена</Button>
              <Button
                type="submit"
                onClick={this.saveNewTag.bind(this)}
              >
                Сохранить
              </Button>
            </DialogActions>
          </Dialog>
        ) : null}
        <Dialog
          open={open}
          fullWidth={true}
          maxWidth={"lg"}
          onClose={this.onClose.bind(this)}
          fullScreen={fullScreen}
        >
          <DialogTitle className="button">
            <Typography>Описание блюда</Typography>
            <IconButton onClick={this.onClose.bind(this)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Grid
              container
              spacing={3}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <Typography>{method}</Typography>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <MyDatePickerNew
                  label="Действует с"
                  value={this.state.date_start}
                  disabled={!this.props.acces?.date_start_edit}
                  minDate={dayjs(new Date())}
                  func={this.changeDateRange.bind(this, "date_start")}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <MyTextInput
                  label="Состав"
                  value={this.state.tmp_desc}
                  disabled={!this.props.acces?.tmp_desc_edit}
                  func={this.changeItem.bind(this, "tmp_desc")}
                  multiline={true}
                  maxRows={3}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                }}
              >
                <MyAutocomplite
                  label="Теги"
                  multiple={true}
                  unifiedPopup
                  data={this.state.tags_all}
                  value={this.state.tags_my}
                  func={this.changeAutocomplite.bind(this, "tags_my")}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <MyTextInput
                  label="Короткое описание (в карточке)"
                  value={this.state.marc_desc}
                  disabled={!this.props.acces?.marc_desc_edit}
                  func={this.changeItem.bind(this, "marc_desc")}
                  multiline={true}
                  maxRows={3}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <MyTextInput
                  label="Полное описание (в карточке)"
                  value={this.state.marc_desc_full}
                  disabled={!this.props.acces?.marc_desc_full_edit}
                  func={this.changeItem.bind(this, "marc_desc_full")}
                  multiline={true}
                  maxRows={3}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 4,
                }}
              >
                <MyCheckBox
                  label="На кассе"
                  value={parseInt(this.state.show_program) == 1 ? true : false}
                  disabled={!this.props.acces?.show_program_edit}
                  func={this.changeItemChecked.bind(this, "show_program")}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 4,
                }}
              >
                <MyCheckBox
                  label="Новинка"
                  value={parseInt(this.state.is_new) == 1 ? true : false}
                  disabled={!this.props.acces?.is_new_edit}
                  func={this.changeItemChecked.bind(this, "is_new")}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 4,
                }}
              />
              <Grid
                size={{
                  xs: 12,
                  sm: 4,
                }}
              >
                <MyCheckBox
                  label="На сайте и КЦ"
                  value={parseInt(this.state.show_site) == 1 ? true : false}
                  disabled={!this.props.acces?.show_site_edit}
                  func={this.changeItemChecked.bind(this, "show_site")}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 4,
                }}
              >
                <MyCheckBox
                  label="Хит"
                  value={parseInt(this.state.is_hit) == 1 ? true : false}
                  disabled={!this.props.acces?.is_hit_edit}
                  func={this.changeItemChecked.bind(this, "is_hit")}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                }}
              >
                <Grid
                  container
                  spacing={3}
                >
                  <Grid
                    size={{
                      xs: 12,
                    }}
                  >
                    <Typography>
                      Картинка соотношением сторон 600х400 или 300х200 только JPG
                    </Typography>
                  </Grid>
                  {this.state.img_app.length > 0 ? (
                    <Grid
                      size={{
                        xs: 12,
                        sm: 6,
                      }}
                    >
                      <img
                        style={{ maxHeight: 300, maxWidth: 400 }}
                        src={`https://storage.yandexcloud.net/site-home-img/${this.state.img_app}site_items_600x400.jpg?date_update=${this.props.item.img_new_update}`}
                      />
                    </Grid>
                  ) : null}
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                  >
                    <div
                      className="dropzone"
                      id="for_img_edit_new"
                      style={{
                        width: "100%",
                        minHeight: 150,
                        ...(!this.props.acces?.dropzone_edit
                          ? {
                              pointerEvents: "none",
                              cursor: "not-allowed",
                              filter: "grayscale(50%)",
                            }
                          : {}),
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              onClick={this.save.bind(this)}
            >
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

const ModalEditTags = ({ open, onClose, save, title = "Редактирование тэгов", tags }) => {
  const [chooseTag, setChooseTag] = useState({});
  const [name, setName] = useState("");

  return (
    <Dialog
      maxWidth={false}
      fullWidth={true}
      open={open}
      onClose={onClose}
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
          {title}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            color: "#A6A6A6",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          px: 2,
          pt: 2,
          pb: 0,
        }}
      >
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
            <MyAutocomplite
              label="Тег"
              multiple={false}
              unifiedPopup
              data={tags}
              value={chooseTag}
              func={(data, value) => {
                setChooseTag(value || {});
                setName(value?.name || "");
              }}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
            }}
          >
            <MyTextInput
              label="Новое название"
              value={name}
              func={(event) => {
                setName(event.target.value);
              }}
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
          onClick={onClose}
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
          variant="contained"
          onClick={() => save(chooseTag, name)}
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
  );
};

class SiteItems_Table extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openChange: false,
      itemId: 1,
      cats: this.props.cats || [],
      sortField: "name",
      sortOrder: "asc",
      type: "",
      expandedCategories: [],
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.cats === this.props.cats || !this.props.cats) {
      return;
    }

    const tabChanged = prevProps.listTab !== this.props.listTab;
    const sortField = tabChanged ? "name" : this.state.sortField;
    const sortOrder = tabChanged ? "asc" : this.state.sortOrder;
    const nextCats = this.sortCats(this.props.cats, sortField, sortOrder);

    this.setState((state) => {
      const nextKeys = new Set(nextCats.map((cat, index) => this.getCategoryKey(cat, index)));

      return {
        cats: nextCats,
        sortField,
        sortOrder,
        expandedCategories: tabChanged
          ? []
          : state.expandedCategories.filter((key) => nextKeys.has(key)),
      };
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.timeUpdate !== nextProps.timeUpdate ||
      this.props.cats !== nextProps.cats ||
      this.props.listTab !== nextProps.listTab ||
      this.props.user_app !== nextProps.user_app ||
      this.props.acces !== nextProps.acces ||
      this.state.sortField !== nextState.sortField ||
      this.state.sortOrder !== nextState.sortOrder ||
      this.state.cats !== nextState.cats ||
      this.state.expandedCategories !== nextState.expandedCategories
    );
  }

  getCategoryKey = (cat, index) => String(cat?.id ?? cat?.category_id ?? index);

  toggleCategory = (categoryKey) => {
    this.setState((state) => ({
      expandedCategories: state.expandedCategories.includes(categoryKey)
        ? state.expandedCategories.filter((key) => key !== categoryKey)
        : [...state.expandedCategories, categoryKey],
    }));
  };

  toggleAllCategories = () => {
    this.setState((state) => {
      const allKeys = state.cats.map(this.getCategoryKey);
      const allExpanded =
        allKeys.length > 0 && allKeys.every((key) => state.expandedCategories.includes(key));

      return {
        expandedCategories: allExpanded ? [] : allKeys,
      };
    });
  };

  sortCats = (cats, field, sortOrder) =>
    (cats || []).map((category) => ({
      ...category,
      items: Array.isArray(category.items)
        ? [...category.items].sort((a, b) => {
            const valueA = this.prepareValueForSort(
              field === "date_update" ? a[field] || a.update_item : a[field],
              field,
            );
            const valueB = this.prepareValueForSort(
              field === "date_update" ? b[field] || b.update_item : b[field],
              field,
            );

            if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
            if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
            return 0;
          })
        : category.items,
    }));

  handleSort = (field) => {
    let sortOrder = "asc";
    if (this.state.sortField === field) {
      sortOrder = this.state.sortOrder === "asc" ? "desc" : "asc";
    }

    this.setState({
      cats: this.sortCats(this.state.cats, field, sortOrder),
      sortField: field,
      sortOrder,
    });
  };

  prepareValueForSort = (value, field) => {
    if (value === null || value === undefined) return "";
    if (value === "") return "";

    switch (field) {
      case "name":
        return value.toString().toLowerCase();

      case "date_start":
      case "date_end":
      case "date_update":
        if (typeof value === "string") {
          const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
          if (isoMatch) {
            const [_, year, month, day] = isoMatch;
            return new Date(year, month - 1, day).getTime();
          }

          const ruMatch = value.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
          if (ruMatch) {
            const [_, day, month, year] = ruMatch;
            return new Date(year, month - 1, day).getTime();
          }
        }
        return 0;

      case "sort":
        return parseInt(value) || 0;

      case "weight":
        return parseFloat(value) || 0;

      case "id":
        return parseInt(value) || 0;

      default:
        if (typeof value === "number") return value;
        return value.toString().toLowerCase();
    }
  };

  getSortProps = (field) => ({
    active: this.state.sortField === field,
    direction: this.state.sortField === field ? this.state.sortOrder : "asc",
    onClick: () => this.handleSort(field),
  });

  render() {
    const { user_app, acces } = this.props;
    const { changeSort, saveSort, changeTableCheck, openItem, openHistoryItem } = this.props;
    const activityLabel = user_app === "technologist" ? "Активность" : "Сайт и КЦ";
    const canOpenItem = siteItemModalAccessFields.some((field) => canViewAccess(acces, field));
    const canEditItem = siteItemModalAccessFields.some((field) => canEditAccess(acces, field));
    const canViewSort = user_app === "marketing" && canViewAccess(acces, "sort", true);
    const canEditSort = user_app === "marketing" && canEditAccess(acces, "sort", true);
    const canViewDateEnd = canViewAccess(acces, "date_end", true);
    const categoryKeys = this.state.cats.map(this.getCategoryKey);
    const allCategoriesExpanded =
      categoryKeys.length > 0 &&
      categoryKeys.every((key) => this.state.expandedCategories.includes(key));
    const mobileSortOptions = [
      {
        field: user_app === "technologist" ? "is_show" : "show_site",
        label: activityLabel,
        visible: canViewAccess(acces, "site_kc"),
      },
      {
        field: "show_program",
        label: "Касса",
        visible: canViewAccess(acces, "kassa"),
      },
      {
        field: "sort",
        label: "Сортировка",
        visible: canViewSort,
      },
      {
        field: "name",
        label: "Название",
        visible: canViewAccess(acces, "name"),
      },
      {
        field: "date_start",
        label: "Действует с",
        visible: canViewAccess(acces, "date_start"),
      },
      {
        field: "date_end",
        label: "Действует по",
        visible: canViewDateEnd,
      },
      {
        field: "date_update",
        label: "Обновление",
        visible: true,
      },
      {
        field: "art",
        label: "Код 1С",
        visible: user_app === "technologist" && canViewAccess(acces, "art"),
      },
    ].filter((option) => option.visible);
    const renderMobileSortButton = (field, label) => {
      const isActive = this.state.sortField === field;

      return (
        <Button
          key={field}
          variant="outlined"
          onClick={() => this.handleSort(field)}
          sx={{
            minHeight: 34,
            px: 1.25,
            borderRadius: 999,
            borderColor: isActive ? brandRed : blockBorder,
            color: isActive ? brandRed : textSecondary,
            backgroundColor: "#fff",
            textTransform: "none",
            fontSize: 13,
            lineHeight: "16px",
            fontWeight: isActive ? 600 : 400,
            whiteSpace: "nowrap",
            "&:hover": {
              borderColor: isActive ? brandRed : blockBorder,
              backgroundColor: "#fff",
            },
          }}
        >
          {label}
          {isActive ? ` ${this.state.sortOrder === "asc" ? "↑" : "↓"}` : ""}
        </Button>
      );
    };
    const renderMobileStatusControl = (label, checked, onChange, disabled) => (
      <Box
        key={label}
        sx={{
          flex: "1 1 140px",
          minWidth: 0,
          px: 1.25,
          py: 1,
          borderRadius: 2,
          border: `1px solid ${blockBorder}`,
          backgroundColor: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Typography
          sx={{
            fontSize: 13,
            lineHeight: "16px",
            color: textSecondary,
          }}
        >
          {label}
        </Typography>
        <Checkbox
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          size="small"
          sx={{
            p: 0.5,
            color: "#6F6F6F",
            "&.Mui-checked": {
              color: brandRed,
            },
          }}
        />
      </Box>
    );
    const renderMobileInfoItem = (label, value, fullWidth = false) => (
      <Box
        key={label}
        sx={{
          minWidth: 0,
          gridColumn: fullWidth ? "1 / -1" : "auto",
        }}
      >
        <Typography
          sx={{
            fontSize: 11,
            lineHeight: "14px",
            fontWeight: 600,
            color: "#8B8B8B",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            mt: 0.35,
            fontSize: 14,
            lineHeight: "18px",
            color: textPrimary,
            wordBreak: "break-word",
          }}
        >
          {value || "—"}
        </Typography>
      </Box>
    );
    const actionButtonSx = {
      flex: "1 1 0",
      minHeight: 40,
      borderRadius: 1.75,
      borderColor: blockBorder,
      color: textSecondary,
      backgroundColor: "#fff",
      textTransform: "none",
      fontSize: 14,
      lineHeight: "18px",
      "&:hover": {
        backgroundColor: blockBackground,
        borderColor: blockBorder,
      },
    };

    return (
      <Grid
        size={{
          xs: 12,
          sm: 12,
        }}
      >
        <Stack
          spacing={1.25}
          sx={{ pb: 2 }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: 0.25, pb: 0.25 }}
          >
            <Typography sx={{ color: textSecondary, fontSize: 13 }}>
              Выберите категорию, чтобы увидеть товары
            </Typography>
            <Button
              size="small"
              startIcon={allCategoriesExpanded ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
              onClick={this.toggleAllCategories}
              sx={{
                minHeight: 32,
                px: 1.25,
                borderRadius: 1.5,
                color: textSecondary,
                textTransform: "none",
                fontSize: 13,
                "&:hover": { backgroundColor: "#fff" },
              }}
            >
              {allCategoriesExpanded ? "Свернуть все" : "Развернуть все"}
            </Button>
          </Stack>

          {this.state.cats.map((cat, key) => {
            const categoryKey = this.getCategoryKey(cat, key);

            return (
              <Accordion
                key={categoryKey}
                expanded={this.state.expandedCategories.includes(categoryKey)}
                onChange={() => this.toggleCategory(categoryKey)}
                disableGutters
                elevation={0}
                sx={{
                  borderRadius: 2.5,
                  border: `1px solid ${blockBorder}`,
                  backgroundColor: "#fff",
                  boxShadow: "none",
                  overflow: "hidden",
                  "&::before": {
                    display: "none",
                  },
                  "&.Mui-expanded": {
                    margin: 0,
                    borderColor: "#D8D8D8",
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: textSecondary }} />}
                  sx={{
                    px: { xs: 1.5, lg: 2 },
                    py: 0,
                    minHeight: 56,
                    "&.Mui-expanded": {
                      minHeight: 56,
                      borderBottom: `1px solid ${blockBorder}`,
                    },
                    "& .MuiAccordionSummary-content": {
                      alignItems: "center",
                      gap: 1.25,
                      my: 1.25,
                    },
                    "& .MuiAccordionSummary-content.Mui-expanded": {
                      my: 1.25,
                    },
                    "&:hover": {
                      backgroundColor: "#FAFAFA",
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 16,
                      lineHeight: "20px",
                      fontWeight: 600,
                      color: textPrimary,
                    }}
                  >
                    {cat.name}
                  </Typography>
                  <Box
                    sx={{
                      minWidth: 28,
                      height: 24,
                      px: 1,
                      borderRadius: 999,
                      backgroundColor: blockBackground,
                      color: textSecondary,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      lineHeight: 1,
                      fontWeight: 600,
                    }}
                  >
                    {cat.items?.length || 0}
                  </Box>
                </AccordionSummary>

                <AccordionDetails
                  className="accordion_details"
                  sx={{
                    px: 0,
                    pt: 0,
                    pb: { xs: 1.5, lg: 2 },
                    backgroundColor: blockBackground,
                  }}
                >
                  <Box sx={{ display: { xs: "none", sm: "block" } }}>
                    <TableContainer
                      component={Paper}
                      elevation={0}
                      sx={{
                        mx: { xs: 1, lg: 2 },
                        borderRadius: 2.5,
                        border: `1px solid ${blockBorder}`,
                        boxShadow: "none",
                        backgroundColor: "#fff",
                        overflow: "hidden",
                      }}
                    >
                      <Table
                        aria-label={`Категория ${cat.name}`}
                        sx={{
                          width: "100%",
                          tableLayout: "fixed",
                          "& th, & td": {
                            px: { xs: 1, lg: 1.25 },
                            py: 1.5,
                            fontSize: { xs: 12, lg: 14 },
                            lineHeight: { xs: "16px", lg: "20px" },
                            verticalAlign: "middle",
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                          },
                          "& thead th": {
                            backgroundColor: blockBackground,
                            borderBottom: `1px solid ${blockBorder}`,
                          },
                          "& tbody td": {
                            borderBottom: `1px solid ${blockBorder}`,
                            color: textSecondary,
                          },
                          "& tbody tr:last-of-type td": {
                            borderBottom: "none",
                          },
                          "& tbody tr": {
                            transition: "background-color 0.15s ease",
                          },
                          "& tbody tr:hover": {
                            backgroundColor: "#FAFAFA",
                          },
                          "& .MuiTableSortLabel-root": {
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                            width: "100%",
                            whiteSpace: "normal",
                          },
                        }}
                      >
                        <TableHead>
                          <TableRow sx={{ "& th": { fontWeight: "bold", color: textPrimary } }}>
                            <TableCell sx={{ width: "3%" }}>№</TableCell>

                            {canViewAccess(acces, "site_kc") && (
                              <TableCell sx={{ width: "8%" }}>
                                <TableSortLabel
                                  {...this.getSortProps(
                                    user_app === "technologist" ? "is_show" : "show_site",
                                  )}
                                  sx={tableSortLabelSx}
                                >
                                  {activityLabel}
                                </TableSortLabel>
                              </TableCell>
                            )}

                            {canViewAccess(acces, "kassa") && (
                              <TableCell sx={{ width: "8%" }}>
                                <TableSortLabel
                                  {...this.getSortProps("show_program")}
                                  sx={tableSortLabelSx}
                                >
                                  Касса
                                </TableSortLabel>
                              </TableCell>
                            )}

                            {canViewSort && (
                              <TableCell sx={{ width: "9%" }}>
                                <TableSortLabel
                                  {...this.getSortProps("sort")}
                                  sx={tableSortLabelSx}
                                >
                                  Сортировка
                                </TableSortLabel>
                              </TableCell>
                            )}

                            {canViewAccess(acces, "name") && (
                              <TableCell
                                sx={{ width: user_app === "technologist" ? "18%" : "21%" }}
                              >
                                <TableSortLabel
                                  {...this.getSortProps("name")}
                                  sx={tableSortLabelSx}
                                >
                                  Название
                                </TableSortLabel>
                              </TableCell>
                            )}

                            {canViewAccess(acces, "date_start") && (
                              <TableCell sx={{ width: "11%" }}>
                                <TableSortLabel
                                  {...this.getSortProps("date_start")}
                                  sx={tableSortLabelSx}
                                >
                                  Действует с
                                </TableSortLabel>
                              </TableCell>
                            )}

                            {canViewDateEnd && (
                              <TableCell sx={{ width: "9%" }}>
                                <TableSortLabel
                                  {...this.getSortProps("date_end")}
                                  sx={tableSortLabelSx}
                                >
                                  по
                                </TableSortLabel>
                              </TableCell>
                            )}

                            <TableCell sx={{ width: "12%" }}>
                              <TableSortLabel
                                {...this.getSortProps("date_update")}
                                sx={tableSortLabelSx}
                              >
                                Обновление
                              </TableSortLabel>
                            </TableCell>

                            {user_app === "technologist" && canViewAccess(acces, "art") && (
                              <TableCell sx={{ width: "10%" }}>
                                <TableSortLabel
                                  {...this.getSortProps("art")}
                                  sx={tableSortLabelSx}
                                >
                                  Код для 1С
                                </TableSortLabel>
                              </TableCell>
                            )}

                            {canOpenItem && (
                              <TableCell
                                align="center"
                                sx={{ width: "7%" }}
                              >
                                {canEditItem ? "Редактирование" : "Просмотр"}
                              </TableCell>
                            )}
                            <TableCell
                              align="center"
                              sx={{ width: "7%" }}
                            >
                              История изменений
                            </TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {cat.items &&
                            cat.items.map((item, index) => (
                              <TableRow key={item.id || index}>
                                <TableCell sx={{ color: textPrimary, fontWeight: 500 }}>
                                  {index + 1}
                                </TableCell>

                                {canViewAccess(acces, "site_kc") && (
                                  <TableCell align="center">
                                    <MyCheckBox
                                      label=""
                                      value={
                                        parseInt(
                                          user_app === "technologist"
                                            ? item.is_show
                                            : item.show_site,
                                        ) === 1
                                      }
                                      func={changeTableCheck.bind(
                                        this,
                                        key,
                                        index,
                                        item.id,
                                        user_app === "technologist" ? "is_show" : "show_site",
                                      )}
                                      disabled={!canEditAccess(acces, "site_kc")}
                                    />
                                  </TableCell>
                                )}

                                {canViewAccess(acces, "kassa") && (
                                  <TableCell align="center">
                                    <MyCheckBox
                                      label=""
                                      value={parseInt(item.show_program) === 1}
                                      func={changeTableCheck.bind(
                                        this,
                                        key,
                                        index,
                                        item.id,
                                        "show_program",
                                      )}
                                      disabled={!canEditAccess(acces, "kassa")}
                                    />
                                  </TableCell>
                                )}

                                {canViewSort && (
                                  <TableCell>
                                    {canEditSort ? (
                                      <MyTextInput
                                        label=""
                                        value={item.sort}
                                        func={changeSort.bind(this, item.id)}
                                        onBlur={saveSort.bind(this, item.id, "sort")}
                                      />
                                    ) : (
                                      item.sort
                                    )}
                                  </TableCell>
                                )}

                                {canViewAccess(acces, "name") && (
                                  <TableCell sx={{ color: textPrimary, fontWeight: 500 }}>
                                    {item.name}
                                  </TableCell>
                                )}
                                {canViewAccess(acces, "date_start") && (
                                  <TableCell>{item.date_start}</TableCell>
                                )}
                                {canViewDateEnd && <TableCell>{item.date_end}</TableCell>}
                                <TableCell>{item.date_update || item.update_item}</TableCell>

                                {user_app === "technologist" && canViewAccess(acces, "art") && (
                                  <TableCell>{item.art}</TableCell>
                                )}

                                {canOpenItem && (
                                  <TableCell align="center">
                                    <IconButton
                                      onClick={openItem.bind(this, item.id, item.name)}
                                      sx={{
                                        color: textSecondary,
                                        border: `1px solid ${blockBorder}`,
                                        borderRadius: 1.5,
                                        backgroundColor: "#fff",
                                        "&:hover": {
                                          backgroundColor: blockBackground,
                                          color: textPrimary,
                                        },
                                      }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                )}

                                <TableCell align="center">
                                  <IconButton
                                    onClick={openHistoryItem.bind(
                                      this,
                                      item.id,
                                      "История изменений",
                                    )}
                                    sx={{
                                      color: textSecondary,
                                      border: `1px solid ${blockBorder}`,
                                      borderRadius: 1.5,
                                      backgroundColor: "#fff",
                                      "&:hover": {
                                        backgroundColor: blockBackground,
                                        color: textPrimary,
                                      },
                                    }}
                                  >
                                    <EditNoteIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>

                  <Box
                    sx={{
                      display: { xs: "block", sm: "none" },
                      mx: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: mobileSortOptions.length ? "block" : "none",
                        px: 1.25,
                        py: 1.25,
                        borderRadius: 2.5,
                        border: `1px solid ${blockBorder}`,
                        backgroundColor: "#fff",
                      }}
                    >
                      <Typography
                        sx={{
                          mb: 1,
                          fontSize: 12,
                          lineHeight: "16px",
                          fontWeight: 600,
                          color: "#8B8B8B",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        Сортировка списка
                      </Typography>
                      <Stack
                        direction="row"
                        flexWrap="wrap"
                        useFlexGap
                        gap={0.75}
                      >
                        {mobileSortOptions.map((option) =>
                          renderMobileSortButton(option.field, option.label),
                        )}
                      </Stack>
                    </Box>

                    <Stack
                      spacing={1}
                      sx={{ mt: 1 }}
                    >
                      {cat.items &&
                        cat.items.map((item, index) => (
                          <Box
                            key={item.id || index}
                            sx={{
                              borderRadius: 2.5,
                              border: `1px solid ${blockBorder}`,
                              backgroundColor: "#fff",
                              p: 1.25,
                            }}
                          >
                            <Stack spacing={1.25}>
                              <Stack
                                direction="row"
                                alignItems="flex-start"
                                justifyContent="space-between"
                                spacing={1.25}
                              >
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                  <Typography
                                    sx={{
                                      fontSize: 16,
                                      lineHeight: "20px",
                                      fontWeight: 700,
                                      color: textPrimary,
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {index + 1}
                                    {canViewAccess(acces, "name")
                                      ? `. ${item.name || "Без названия"}`
                                      : ""}
                                  </Typography>
                                  {user_app === "technologist" && canViewAccess(acces, "art") ? (
                                    <Typography
                                      sx={{
                                        mt: 0.4,
                                        fontSize: 13,
                                        lineHeight: "16px",
                                        color: textSecondary,
                                      }}
                                    >
                                      Код 1С: {item.art || "—"}
                                    </Typography>
                                  ) : null}
                                </Box>

                                {canViewSort ? (
                                  <Box sx={{ width: 88, flexShrink: 0 }}>
                                    {canEditSort ? (
                                      <MyTextInput
                                        label=""
                                        value={item.sort}
                                        func={changeSort.bind(this, item.id)}
                                        onBlur={saveSort.bind(this, item.id, "sort")}
                                      />
                                    ) : (
                                      <Typography sx={{ color: textSecondary }}>
                                        {item.sort ?? "—"}
                                      </Typography>
                                    )}
                                  </Box>
                                ) : null}
                              </Stack>

                              <Box
                                sx={{
                                  display: "grid",
                                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                                  gap: 1.25,
                                }}
                              >
                                {canViewAccess(acces, "date_start") &&
                                  renderMobileInfoItem(
                                    "Действует с",
                                    formatSiteItemsTableDate(item.date_start),
                                  )}
                                {canViewDateEnd &&
                                  renderMobileInfoItem(
                                    "По",
                                    formatSiteItemsTableDate(item.date_end),
                                  )}
                                {renderMobileInfoItem(
                                  "Обновление",
                                  formatSiteItemsTableDate(
                                    item.date_update || item.update_item,
                                    true,
                                  ),
                                  true,
                                )}
                              </Box>

                              <Stack
                                direction="row"
                                flexWrap="wrap"
                                useFlexGap
                                gap={0.75}
                              >
                                {canViewAccess(acces, "site_kc") &&
                                  renderMobileStatusControl(
                                    activityLabel,
                                    parseInt(
                                      user_app === "technologist" ? item.is_show : item.show_site,
                                    ) === 1,
                                    changeTableCheck.bind(
                                      this,
                                      key,
                                      index,
                                      item.id,
                                      user_app === "technologist" ? "is_show" : "show_site",
                                    ),
                                    !canEditAccess(acces, "site_kc"),
                                  )}

                                {canViewAccess(acces, "kassa") &&
                                  renderMobileStatusControl(
                                    "Касса",
                                    parseInt(item.show_program) === 1,
                                    changeTableCheck.bind(
                                      this,
                                      key,
                                      index,
                                      item.id,
                                      "show_program",
                                    ),
                                    !canEditAccess(acces, "kassa"),
                                  )}
                              </Stack>

                              <Stack
                                direction="row"
                                spacing={1}
                              >
                                {canOpenItem && (
                                  <Button
                                    variant="outlined"
                                    startIcon={<EditIcon fontSize="small" />}
                                    onClick={openItem.bind(this, item.id, item.name)}
                                    sx={actionButtonSx}
                                  >
                                    {canEditItem ? "Изменить" : "Открыть"}
                                  </Button>
                                )}
                                <Button
                                  variant="outlined"
                                  startIcon={<EditNoteIcon fontSize="small" />}
                                  onClick={openHistoryItem.bind(this, item.id, "История изменений")}
                                  sx={actionButtonSx}
                                >
                                  История
                                </Button>
                              </Stack>
                            </Stack>
                          </Box>
                        ))}
                    </Stack>
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Stack>
      </Grid>
    );
  }
}

class SiteItems_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "site_items_new",
      module_name: "",
      is_load: false,

      user_app: "",

      cats: [],
      displayCats: [],
      listCounts: {
        activeCategories: 0,
        activeItems: 0,
        archiveCategories: 0,
        archiveItems: 0,
      },
      confirmDialog: false,
      timeUpdate: new Date(),
      fullScreen: false,
      listTab: "active",
      searchItem: "",

      openAlert: false,
      err_status: false,
      err_text: "",

      modalDialogTech: false,
      itemTech: null,
      modalChangeTags: false,

      modalDialogMark: false,
      itemMark: null,

      modalDialogHist: false,
      itemHist: null,
      tags: [],
      modalEditTags: false,

      acces: {},

      items_stage: null,
      item_items: null,

      category: [],
      stages: [],
    };

    this.changeSort = this.changeSort.bind(this);
    this.saveSort = this.saveSort.bind(this);
    this.changeTableCheck = this.changeTableCheck.bind(this);
    this.openItemTech = this.openItemTech.bind(this);
    this.openHistoryTech = this.openHistoryTech.bind(this);
    this.openHistoryMark = this.openHistoryMark.bind(this);
  }

  buildListView(cats, listTab, searchItem) {
    const activeCats = filterCatsByActivity(cats, false);
    const archiveCats = filterCatsByActivity(cats, true);
    const byActivity = listTab === "archive" ? archiveCats : activeCats;
    const displayCats = filterCatsByName(byActivity, searchItem);
    const countItems = (list) =>
      (list || []).reduce((sum, cat) => sum + (cat.items?.length || 0), 0);

    return {
      displayCats,
      listCounts: {
        activeCategories: activeCats.length,
        activeItems: countItems(activeCats),
        archiveCategories: archiveCats.length,
        archiveItems: countItems(archiveCats),
      },
    };
  }

  async componentDidMount() {
    const data = await this.getData("get_all");

    this.setState({
      module_name: data.module_info.name,
      cats: data.cats,
      ...this.buildListView(data.cats, this.state.listTab, this.state.searchItem),
      acces: data.acces,
      user_app: data.user_app,
      timeUpdate: new Date(),
      tags: data.tags,
    });

    document.title = data.module_info.name;
  }

  getData = (method, data = {}) => {
    this.setState({
      is_load: true,
    });

    let res = api_laravel(this.state.module, method, data)
      .then((result) => result.data)
      .finally(() => {
        this.setState({
          is_load: false,
        });
      });

    return res;
  };

  handleResize() {
    if (window.innerWidth < 601) {
      this.setState({
        fullScreen: true,
      });
    } else {
      this.setState({
        fullScreen: false,
      });
    }
  }

  async update() {
    const data = await this.getData("get_all");

    this.setState({
      cats: data.cats,
      ...this.buildListView(data.cats, this.state.listTab, this.state.searchItem),
      user_app: data.user_app,
      timeUpdate: new Date(),
      tags: data.tags,
    });
  }

  async openItemNew(method) {
    if (!hasAccessValue(this.state.acces?.new_item_access)) {
      return;
    }

    this.handleResize();

    let res = await this.getData("get_all_for_new_tech");

    res.items_stage.not_stage = [];
    const stages = [
      { id: "1", name: "1 этап" },
      { id: "2", name: "2 этап" },
      { id: "3", name: "3 этап" },
    ];
    res.item.category_id = "";
    res.item.tags_all = res?.tags_all;

    this.setState({
      itemTech: res.item,
      modalDialogTech: true,
      method,
      category: res.cat_list,
      items_stage: res.items_stage,
      item_items: res.item_items,
      stages,
    });
  }

  async openItemTech(id, method) {
    if (!siteItemModalAccessFields.some((field) => canViewAccess(this.state.acces, field))) {
      return;
    }

    this.handleResize();

    const data = {
      id,
    };

    const res = await this.getData("get_one_tech", data);

    const stageOptionsByKey = new Map(
      (res.items_stage?.all || []).map((item) => [`${item.type}:${item.id}`, item]),
    );

    ["stage_1", "stage_2", "stage_3"].forEach((stage) => {
      res.items_stage[stage] = (res.items_stage?.[stage] || []).map((item) => {
        const itemId = item.type === "rec" ? item.rec_id : item.pf_id;
        const value = stageOptionsByKey.get(`${item.type}:${itemId}`);

        return {
          ...item,
          type_id: value ? { id: value.id, name: value.name } : { id: "", name: item.name },
        };
      });
    });

    res.items_stage.not_stage = [];

    const itemOptionsById = new Map(
      (res.item_items?.all_items || []).map((item) => [String(item.id), item]),
    );
    res.item_items.this_items = (res.item_items?.this_items || []).map((item) => {
      const currentItemId = typeof item.item_id === "object" ? item.item_id?.id : item.item_id;
      const value = itemOptionsById.get(String(currentItemId));

      return {
        ...item,
        item_id: value ? { id: value.id, name: value.name } : { id: "", name: item.name },
      };
    });

    const stages = [
      { id: "1", name: "1 этап" },
      { id: "2", name: "2 этап" },
      { id: "3", name: "3 этап" },
    ];
    res.item.tags_all = res.tags_all;

    this.setState({
      itemTech: res.item,
      modalDialogTech: true,
      method,
      category: res.cat_list,
      items_stage: res.items_stage,
      item_items: res.item_items,
      tags_all: res.tags_all,
      stages,
    });
  }

  async openItemMark(id, method) {
    this.handleResize();

    const data = {
      id,
    };

    const res = await this.getData("get_one_mark", data);
    res.item.tags_all = res?.tags_all;
    this.setState({
      itemMark: res.item,
      modalDialogTech: true,
      method,
    });
  }

  async updateVK() {
    if (!hasAccessValue(this.state.acces?.reload_vk_access)) {
      return;
    }

    this.setState({
      confirmDialog: false,
    });

    await this.getData("updateVK", {});
  }

  updateCatItemById(id, patch) {
    const cats = (this.state.cats || []).map((cat) => ({
      ...cat,
      items: (cat.items || []).map((item) =>
        String(item?.id) === String(id) ? { ...item, ...patch } : item,
      ),
    }));

    this.setState({
      cats,
      ...this.buildListView(cats, this.state.listTab, this.state.searchItem),
      timeUpdate: new Date(),
    });
  }

  changeSort(itemId, event) {
    if (itemId === undefined || itemId === null) {
      return;
    }

    this.updateCatItemById(itemId, { sort: event.target.value });
  }

  async saveSort(id, type, event) {
    if (!canEditAccess(this.state.acces, "sort", true)) {
      return;
    }

    const value = event.target.value;

    const data = {
      id,
      type,
      value,
    };

    const res = await this.getData("save_check", data);

    if (res?.st === false) {
      await this.update();
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: res?.text || "Не удалось сохранить сортировку",
      });
    }
  }

  async changeTableCheck(key_cat, key_item, id, type, event, val) {
    const accessKey = type === "show_program" ? "kassa" : "site_kc";
    if (!canEditAccess(this.state.acces, accessKey)) {
      return;
    }

    const value = val ? 1 : 0;
    this.updateCatItemById(id, { [type]: value });

    const data = {
      id,
      type,
      value,
    };

    const res = await this.getData("save_check", data);

    if (res?.st === false) {
      await this.update();
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: res?.text || "Не удалось сохранить изменение",
      });
    }
  }

  async saveTech(item_) {
    const method = this.state.method;

    const item = JSON.parse(JSON.stringify(item_));

    item.item_items.this_items = item.item_items.this_items.map((it) => {
      it.item_id = it.item_id.id;
      return it;
    });

    const pf_stage_1 = item.items_stage.stage_1.reduce((newIt, it) => {
      if (it.type === "pf") {
        it.pf_id = it.type_id.id;
        newIt.push(it);
      }
      return newIt;
    }, []);

    const pf_stage_2 = item.items_stage.stage_2.reduce((newIt, it) => {
      if (it.type === "pf") {
        it.pf_id = it.type_id.id;
        newIt.push(it);
      }
      return newIt;
    }, []);

    const pf_stage_3 = item.items_stage.stage_3.reduce((newIt, it) => {
      if (it.type === "pf") {
        it.pf_id = it.type_id.id;
        newIt.push(it);
      }
      return newIt;
    }, []);

    const rec_stage_1 = item.items_stage.stage_1.reduce((newIt, it) => {
      if (it.type === "rec") {
        it.rec_id = it.type_id.id;
        newIt.push(it);
      }
      return newIt;
    }, []);

    const rec_stage_2 = item.items_stage.stage_2.reduce((newIt, it) => {
      if (it.type === "rec") {
        it.rec_id = it.type_id.id;
        newIt.push(it);
      }
      return newIt;
    }, []);

    const rec_stage_3 = item.items_stage.stage_3.reduce((newIt, it) => {
      if (it.type === "rec") {
        it.rec_id = it.type_id.id;
        newIt.push(it);
      }
      return newIt;
    }, []);

    const data = {
      ...item,
      pf_stage_1,
      pf_stage_2,
      pf_stage_3,
      rec_stage_1,
      rec_stage_2,
      rec_stage_3,
    };

    let res;

    if (method === "Новое блюдо") {
      res = await this.getData("save_new", data);
    } else {
      res = await this.getData("save_edit", data);
    }

    if (res.st) {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
        modalDialogTech: false,
        itemTech: null,
      });

      setTimeout(async () => {
        this.update();
      }, 300);
    } else {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
    return res;
  }

  async openHistoryMark(id, method) {
    return this.openHistoryTech(id, method);
  }

  async openHistoryTech(id, method, type) {
    this.handleResize();

    const data = {
      id,
    };

    const res = await this.getData("get_one_hist_tech", data);

    if (res.hist.length) {
      const latestSnapshot = getLatestSiteItemHistorySnapshot(res.hist);

      this.setState({
        modalDialogHist: true,
        itemHist: res.hist,
        itemName: latestSnapshot?.name || "",
        method,
      });
    } else {
      const data = {
        id,
      };

      const res = await this.getData(
        this.state.user_app === "technologist" ? "get_one_tech" : "get_one_mark",
        data,
      );

      if (res.item_items && res.items_stage) {
        res.item.items = res.item_items.this_items;
        res.item.stage_1 = res.items_stage.stage_1;
        res.item.stage_2 = res.items_stage.stage_2;
        res.item.stage_3 = res.items_stage.stage_3;
      }

      if (res.cat_list) {
        if (res.item.category_id) {
          res.item.category_name =
            res.cat_list.find((cat) => parseInt(cat.id) === parseInt(res.item.category_id))?.name ??
            "";
        } else {
          res.item.category_name =
            res.cat_list.find((cat) => parseInt(cat.id) === parseInt(res.item.category_id2))
              ?.name ?? "";
        }
      }

      this.setState({
        modalDialogHist: true,
        itemHist: [res.item],
        itemName: res.item.name,
        method,
      });
    }
  }

  async changeTags(chooseTag, name) {
    if (!hasAccessValue(this.state.acces?.change_tag_access)) {
      return;
    }

    const res = await this.getData("edit_tag", { chooseTag, name });
    if (res.st) {
      this.setState({
        modalEditTags: false,
        tags: res.tags,
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    } else {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  render() {
    return (
      <>
        <Backdrop
          open={this.state.is_load}
          style={{ zIndex: 99999 }}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />
        {this.state.modalEditTags ? (
          <ModalEditTags
            tags={this.state.tags}
            onClose={() => this.setState({ modalEditTags: false })}
            open={this.state.modalEditTags}
            save={this.changeTags.bind(this)}
          />
        ) : null}
        <SiteItemsModalTech
          open={this.state.modalDialogTech}
          onClose={() => this.setState({ modalDialogTech: false, itemTech: null })}
          item={this.state.itemTech}
          method={this.state.method}
          category={this.state.category}
          save={this.saveTech.bind(this)}
          getData={this.getData.bind(this)}
          update={this.update.bind(this)}
          tags_all={this.state.tags_all}
          fullScreen={this.state.fullScreen}
          acces={this.state.acces}
          item_items={this.state.item_items}
          items_stage={this.state.items_stage}
          stages={this.state.stages}
        />
        <SiteItemsHistoryModal
          open={this.state.modalDialogHist}
          onClose={() => this.setState({ modalDialogHist: false, itemHist: null })}
          snapshots={this.state.itemHist}
          tagsAll={this.state.tags}
          fullScreen={this.state.fullScreen}
          itemName={this.state.itemName}
          access={this.state.acces}
        />
        <Dialog
          sx={{
            "& .MuiDialog-paper": {
              width: "80%",
              maxHeight: 435,
            },
          }}
          maxWidth="sm"
          open={this.state.confirmDialog}
          onClose={() => this.setState({ confirmDialog: false })}
        >
          <DialogTitle>Подтвердите действие</DialogTitle>
          <DialogContent
            align="center"
            sx={{ fontWeight: "bold" }}
          >
            Точно обновить товары в VK ?
          </DialogContent>
          <DialogActions>
            <Button
              autoFocus
              onClick={() => this.setState({ confirmDialog: false })}
            >
              Отмена
            </Button>
            <Button onClick={this.updateVK.bind(this)}>Ok</Button>
          </DialogActions>
        </Dialog>
        <Box
          className="container_first_child"
          sx={{
            px: { xs: 0, lg: 2.5 },
            pb: { xs: 0, lg: 3 },
          }}
        >
          <Box
            sx={{
              bgcolor: "#fff",
              border: { lg: `1px solid ${blockBorder}` },
              borderRadius: { xs: 0, lg: 3 },
              mx: { xs: -3, lg: 0 },
              px: { xs: 1.5, lg: 2.5 },
              py: { xs: 2, lg: 2.25 },
              mb: 2,
            }}
          >
            <Stack spacing={2}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", lg: "row" },
                  alignItems: { xs: "flex-start", lg: "center" },
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Typography
                  component="h1"
                  sx={{
                    fontSize: { xs: 26, lg: 30 },
                    lineHeight: { xs: "32px", lg: "36px" },
                    fontWeight: 600,
                    color: textPrimary,
                  }}
                >
                  {this.state.module_name}
                </Typography>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  useFlexGap
                  flexWrap="wrap"
                  sx={{ width: { xs: "100%", lg: "auto" } }}
                >
                  {hasAccessValue(this.state.acces?.new_item_access) ? (
                    <Button
                      onClick={this.openItemNew.bind(this, "Новое блюдо")}
                      variant="contained"
                      startIcon={<AddIcon />}
                      sx={{
                        minHeight: 40,
                        px: 2,
                        borderRadius: 1.5,
                        backgroundColor: brandRed,
                        color: "#fff",
                        textTransform: "none",
                        fontSize: 14,
                        lineHeight: "20px",
                        fontWeight: 600,
                        boxShadow: "none",
                        "&:hover": {
                          backgroundColor: brandRed,
                          boxShadow: "none",
                        },
                      }}
                    >
                      Новый товар
                    </Button>
                  ) : null}

                  {hasAccessValue(this.state.acces?.change_tag_access) ? (
                    <OutlineActionButton
                      onClick={() => this.setState({ modalEditTags: true })}
                      sx={{ width: { xs: "100%", sm: "auto" } }}
                    >
                      <LocalOfferOutlinedIcon sx={{ mr: 1, fontSize: 18 }} />
                      Редактировать теги
                    </OutlineActionButton>
                  ) : null}

                  {hasAccessValue(this.state.acces?.reload_vk_access) ? (
                    <OutlineActionButton
                      onClick={() => this.setState({ confirmDialog: true })}
                      sx={{ width: { xs: "100%", sm: "auto" } }}
                    >
                      <SyncIcon sx={{ mr: 1, fontSize: 18 }} />
                      Обновить товары VK
                    </OutlineActionButton>
                  ) : null}
                </Stack>
              </Box>
            </Stack>
          </Box>

          <Box
            sx={{
              bgcolor: blockBackground,
              borderRadius: { xs: 0, lg: 3 },
              mx: { xs: -3, lg: 0 },
              px: { xs: 1.5, lg: 2 },
              py: { xs: 2, lg: 2.5 },
            }}
          >
            {(() => {
              const displayCats = this.state.displayCats;
              const counts = this.state.listCounts;
              const isArchive = this.state.listTab === "archive";
              const visibleItems = displayCats.reduce(
                (sum, cat) => sum + (cat.items?.length || 0),
                0,
              );
              const searchValue = this.state.searchItem || "";

              return (
                <Stack spacing={2}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 1.5, lg: 2 },
                      borderRadius: 2.5,
                      border: `1px solid ${blockBorder}`,
                      backgroundColor: "#fff",
                    }}
                  >
                    <Stack spacing={1.75}>
                      <Stack
                        direction={{ xs: "column", lg: "row" }}
                        spacing={1.5}
                        alignItems={{ xs: "stretch", lg: "center" }}
                        justifyContent="space-between"
                      >
                        <Box>
                          <Typography
                            sx={{
                              fontSize: 20,
                              lineHeight: "24px",
                              fontWeight: 500,
                              color: textPrimary,
                            }}
                          >
                            {isArchive ? "Архив товаров" : "Каталог товаров"}
                          </Typography>
                          <Typography
                            sx={{
                              mt: 0.5,
                              fontSize: 14,
                              lineHeight: "18px",
                              color: textSecondary,
                            }}
                          >
                            {this.state.cats.length === 0
                              ? "Загрузите данные, чтобы начать работу"
                              : isArchive
                                ? "Позиции с выключенной активностью"
                                : "Активные позиции, сгруппированные по категориям"}
                          </Typography>
                        </Box>

                        <TextField
                          size="small"
                          placeholder="Поиск по названию"
                          value={searchValue}
                          onChange={(event) => {
                            const searchItem = event.target.value;
                            this.setState((state) => ({
                              searchItem,
                              ...this.buildListView(state.cats, state.listTab, searchItem),
                            }));
                          }}
                          sx={{
                            width: { xs: "100%", lg: 320 },
                            backgroundColor: "#fff",
                            borderRadius: 1.5,
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 1.5,
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon sx={{ color: textSecondary, fontSize: 20 }} />
                              </InputAdornment>
                            ),
                            endAdornment: searchValue ? (
                              <InputAdornment position="end">
                                <IconButton
                                  size="small"
                                  aria-label="Очистить поиск"
                                  onClick={() =>
                                    this.setState((state) => ({
                                      searchItem: "",
                                      ...this.buildListView(state.cats, state.listTab, ""),
                                    }))
                                  }
                                  edge="end"
                                >
                                  <CloseIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </InputAdornment>
                            ) : null,
                          }}
                        />
                      </Stack>

                      <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={1.5}
                        alignItems={{ xs: "stretch", md: "center" }}
                        justifyContent="space-between"
                      >
                        <Box
                          sx={{
                            display: "inline-flex",
                            p: 0.5,
                            borderRadius: 2,
                            backgroundColor: "#fff",
                            border: `1px solid ${blockBorder}`,
                            width: { xs: "100%", md: "auto" },
                          }}
                        >
                          {[
                            {
                              value: "active",
                              label: "Активные",
                              count: counts.activeItems,
                            },
                            {
                              value: "archive",
                              label: "Архив",
                              count: counts.archiveItems,
                            },
                          ].map((tab) => {
                            const selected = this.state.listTab === tab.value;

                            return (
                              <Button
                                key={tab.value}
                                onClick={() =>
                                  this.setState((state) => ({
                                    listTab: tab.value,
                                    ...this.buildListView(state.cats, tab.value, state.searchItem),
                                  }))
                                }
                                sx={{
                                  flex: { xs: 1, md: "none" },
                                  minHeight: 36,
                                  px: 1.75,
                                  borderRadius: 1.5,
                                  textTransform: "none",
                                  fontSize: 14,
                                  fontWeight: selected ? 600 : 400,
                                  color: selected ? "#fff" : textSecondary,
                                  backgroundColor: selected ? brandRed : "transparent",
                                  boxShadow: "none",
                                  "&:hover": {
                                    backgroundColor: selected ? brandRed : blockBackground,
                                    boxShadow: "none",
                                  },
                                }}
                              >
                                {tab.label}
                                <Box
                                  component="span"
                                  sx={{
                                    ml: 1,
                                    minWidth: 22,
                                    height: 20,
                                    px: 0.75,
                                    borderRadius: 999,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    backgroundColor: selected
                                      ? "rgba(255,255,255,0.2)"
                                      : blockBackground,
                                    color: selected ? "#fff" : textSecondary,
                                  }}
                                >
                                  {tab.count}
                                </Box>
                              </Button>
                            );
                          })}
                        </Box>

                        {this.state.cats.length > 0 ? (
                          <Typography
                            sx={{
                              fontSize: 13,
                              lineHeight: "18px",
                              color: textSecondary,
                              textAlign: { xs: "left", md: "right" },
                            }}
                          >
                            Показано {displayCats.length}{" "}
                            {displayCats.length === 1 ? "категория" : "категорий"}
                            {" · "}
                            {visibleItems} {visibleItems === 1 ? "товар" : "товаров"}
                            {searchValue.trim() ? ` по запросу «${searchValue.trim()}»` : ""}
                          </Typography>
                        ) : null}
                      </Stack>
                    </Stack>
                  </Paper>

                  {this.state.cats.length == 0 ? (
                    <Box
                      sx={{
                        borderRadius: 2.5,
                        border: `1px solid ${blockBorder}`,
                        backgroundColor: "#fff",
                        px: 2,
                        py: 4,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 16,
                          lineHeight: "20px",
                          color: textSecondary,
                        }}
                      >
                        Категории пока не загружены.
                      </Typography>
                    </Box>
                  ) : displayCats.length === 0 ? (
                    <Box
                      sx={{
                        borderRadius: 2.5,
                        border: `1px dashed ${blockBorder}`,
                        backgroundColor: "#fff",
                        px: 2,
                        py: 5,
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 16,
                          lineHeight: "22px",
                          fontWeight: 500,
                          color: textPrimary,
                        }}
                      >
                        {isArchive
                          ? "В архиве пока нет товаров"
                          : searchValue.trim()
                            ? "Ничего не найдено"
                            : "Нет активных товаров"}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.75,
                          fontSize: 14,
                          lineHeight: "20px",
                          color: textSecondary,
                        }}
                      >
                        {searchValue.trim()
                          ? "Попробуйте изменить запрос или сбросить поиск."
                          : isArchive
                            ? "Сюда попадают позиции с выключенной активностью."
                            : "Активные позиции появятся здесь после включения активности."}
                      </Typography>
                      {searchValue.trim() ? (
                        <Button
                          onClick={() =>
                            this.setState((state) => ({
                              searchItem: "",
                              ...this.buildListView(state.cats, state.listTab, ""),
                            }))
                          }
                          sx={{
                            mt: 2,
                            minHeight: 36,
                            px: 2,
                            borderRadius: 1.5,
                            border: `1px solid ${blockBorder}`,
                            color: textPrimary,
                            textTransform: "none",
                          }}
                        >
                          Сбросить поиск
                        </Button>
                      ) : null}
                    </Box>
                  ) : (
                    <SiteItems_Table
                      listTab={this.state.listTab}
                      user_app={this.state.user_app}
                      cats={displayCats}
                      timeUpdate={this.state.timeUpdate}
                      changeSort={this.changeSort}
                      saveSort={this.saveSort}
                      changeTableCheck={this.changeTableCheck}
                      acces={this.state.acces}
                      openItem={this.openItemTech}
                      openHistoryItem={
                        this.state.user_app === "technologist"
                          ? this.openHistoryTech
                          : this.openHistoryMark
                      }
                    />
                  )}
                </Stack>
              );
            })()}
          </Box>
        </Box>
      </>
    );
  }
}

export default function SiteItems() {
  return <SiteItems_ />;
}

export async function getServerSideProps({ req, res, query }) {
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=3600");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT");

  return {
    props: {},
  };
}
