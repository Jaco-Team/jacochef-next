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
import { MyAutocomplite, MyCheckBox, MyDatePickerNew, MySelect, MyTextInput } from "@/ui/Forms";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Dropzone from "dropzone";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import PropTypes from "prop-types";
const roundTo = (value, decimals) => {
  return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

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
    url: "https://apichef.jacochef.ru/api/site_setting/upload_banner",
  };

  myDropzone = null;
  isInit = false;
  click = false;

  constructor(props) {
    super(props);

    this.state = {
      name: "",
      date_start: null,
      date_end: null,
      art: "",
      category_id: {},
      count_part: "",
      stol: "",
      weight: "",
      activeTab: 0,
      is_price: "0",
      is_show: "0",
      protein: "0",
      fat: "0",
      carbohydrates: "0",
      time_stage_1: "",
      time_stage_2: "",
      time_stage_3: "",
      all_w: 0,
      all_w_brutto: 0,
      all_w_netto: 0,
      items_stage: null,
      item_items: null,
      tmp_desc: "",
      marc_desc: "",
      marc_desc_full: "",
      is_hit: "0",
      is_new: "0",
      is_updated: "0",
      show_program: "0",
      show_site: "0",
      img_app: "",
      openAlert: false,
      err_status: true,
      err_text: "",
      tags_all: [],
      tags_my: [],
      modalNewTag: false,
      tag_name_new: "",
    };
  }

  changeTab(event, val) {
    this.setState(
      {
        activeTab: val,
      },
      () => {
        if (val === 0) {
          this.initDropzone();
        }
      },
    );
  }

  initDropzone() {
    if (this.state.activeTab === 0) {
      this.myDropzone = new Dropzone("#for_img_edit_new", this.dropzoneOptions);
    }
  }

  componentDidUpdate(prevProps) {
    if (!this.props.item) {
      return;
    }

    if (this.props.item !== prevProps.item) {
      const tags = this.props.item?.tags_all
        ? [{ id: -1, name: "Новый" }, ...this.props.item.tags_all]
        : [{ id: -1, name: "Новый" }];
      this.setState({
        name: this.props.item?.name || "",
        art: this.props.item?.art || "",
        category_id: this.props.category.find((item) => this.props.item?.category_id) ?? {},
        count_part: this.props.item?.count_part || "",
        date_start: this.props.item?.date_start ? formatDate(this.props.item.date_start) : null,
        date_end: this.props.item?.date_end ? formatDate(this.props.item.date_end) : null,
        stol: this.props.item?.stol || "",
        weight: this.props.item?.weight || "",
        activeTab: 0,
        is_price: parseInt(this.props.item?.is_price) ? 1 : 0,
        is_show: parseInt(this.props.item?.is_show) ? 1 : 0,
        protein: this.props.item?.protein,
        fat: this.props.item?.fat,
        is_updated: this.props.item?.is_updated,
        carbohydrates: this.props.item?.carbohydrates,
        time_stage_1: this.props.item?.time_stage_1 || "",
        time_stage_2: this.props.item?.time_stage_2 || "",
        time_stage_3: this.props.item?.time_stage_3 || "",
        all_w: this.props.item?.all_w || 0,
        all_w_brutto: this.props.item?.all_w_brutto || 0,
        all_w_netto: this.props.item?.all_w_netto || 0,
        all_w_p: this.props.item?.all_w || 0,
        all_w_brutto_p: this.props.item?.all_w_brutto || 0,
        all_w_netto_p: this.props.item?.all_w_netto || 0,
        items_stage: this.props.items_stage || null,
        item_items: this.props.item_items || null,
        tmp_desc: this.props.item?.tmp_desc || "",
        marc_desc: this.props.item?.marc_desc || "",
        marc_desc_full: this.props.item?.marc_desc_full || "",
        is_hit: parseInt(this.props.item?.is_hit) ? 1 : 0,
        is_new: parseInt(this.props.item?.is_new) ? 1 : 0,
        show_program: parseInt(this.props.item?.show_program) ? 1 : 0,
        show_site: parseInt(this.props.item?.show_site) ? 1 : 0,
        img_app: this.props.item?.img_app || "",
        tags_all: tags,
        tags_my: this.props.item?.tags || [],
      });
      setTimeout(() => {
        this.myDropzone = new Dropzone("#for_img_edit_new", this.dropzoneOptions);
        this.recalculateWeights();
      }, 300);
    }
  }

  changeItem(type, event, data) {
    if (type === "marc_desc") {
      const value = event.target.value;

      // Проверяем ограничение в 20 символов
      if (value.length >= 20) {
        return;
      }
    }
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

  changeSelect(data, event) {
    this.setState({
      [data]: event.target.value,
    });
  }

  deleteItemData(index, type) {
    let items_stage = this.state.items_stage;
    let item_items = this.state.item_items;

    if (type === "stage_1" || type === "stage_2" || type === "stage_3" || type === "not_stage") {
      if (items_stage && items_stage[type]) {
        items_stage[type].splice(index, 1);
        this.setState({ items_stage });
      }
    }

    if (type === "this_items") {
      if (item_items && item_items[type]) {
        item_items[type].splice(index, 1);
        this.setState({ item_items });
      }
    }

    this.recalculateWeights();
  }

  chooseItem(type, event, data) {
    if (type === "stages") {
      let items_stage = { ...this.state.items_stage };
      if (!items_stage.not_stage) items_stage.not_stage = [];

      items_stage.not_stage.push({
        type_id: { id: data.id, name: data.name },
        ei_name: data.ei_name,
        type: data.type,
        brutto: 0,
        pr_1: 0,
        netto: 0,
        pr_2: 0,
        res: 0,
        stage: "",
      });

      this.setState({ items_stage });
    }

    if (type === "items") {
      let item_items = { ...this.state.item_items };
      if (!item_items.this_items) item_items.this_items = [];

      const find_item = item_items.this_items.find(
        (item) => parseInt(item.item_id?.id) === parseInt(data.id),
      );

      if (find_item) {
        this.setState({
          openAlert: true,
          err_status: false,
          err_text: "Данная позиция уже добавлена",
        });
        return;
      }

      item_items.this_items.push({
        item_id: { id: data.id, name: data.name },
        brutto: 0,
        pr_1: 0,
        netto: 0,
        pr_2: 0,
        res: 0,
        is_add: 0,
      });

      this.setState({ item_items });
    }
  }

  changeItemData(index, type, event, value) {
    if (
      value &&
      (type === "stage_1" || type === "stage_2" || type === "stage_3" || type === "not_stage")
    ) {
      let items_stage = { ...this.state.items_stage };

      const find_item = items_stage[type]?.find(
        (it) => it.type === value.type && parseInt(it.type_id?.id) === parseInt(value.id),
      );

      if (find_item) {
        this.setState({
          openAlert: true,
          err_status: false,
          err_text: "Данная позиция уже добавлена в указанный этап",
        });
        return;
      }

      const obj = {
        type_id: { id: value.id, name: value.name },
        ei_name: value.ei_name,
        type: value.type,
        brutto: items_stage[type][index]?.brutto || 0,
        pr_1: items_stage[type][index]?.pr_1 || 0,
        netto: items_stage[type][index]?.netto || 0,
        pr_2: items_stage[type][index]?.pr_2 || 0,
        res: items_stage[type][index]?.res || 0,
        stage: items_stage[type][index]?.stage || "",
      };

      items_stage[type][index] = obj;

      this.setState({ items_stage });
    }

    if (value && type === "this_items") {
      let item_items = { ...this.state.item_items };

      const find_item = item_items.this_items?.find(
        (item) => parseInt(item.item_id?.id) === parseInt(value.id),
      );

      if (find_item) {
        this.setState({
          openAlert: true,
          err_status: false,
          err_text: "Данная позиция уже добавлена",
        });
        return;
      }

      const obj = {
        item_id: { id: value.id, name: value.name },
        brutto: item_items[type][index]?.brutto || 0,
        pr_1: item_items[type][index]?.pr_1 || 0,
        netto: item_items[type][index]?.netto || 0,
        pr_2: item_items[type][index]?.pr_2 || 0,
        res: item_items[type][index]?.res || 0,
        is_add: item_items[type][index]?.is_add || 0,
      };

      item_items[type][index] = obj;

      this.setState({ item_items });
    }
  }

  changeItemSelect(data, index, type, item, event) {
    let items_stage = { ...this.state.items_stage };
    const stage = `stage_${event.target.value}`;

    const find_item = items_stage[stage]?.find(
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

    items_stage[type].splice(index, 1);
    item[data] = event.target.value;

    if (!items_stage[stage]) items_stage[stage] = [];
    items_stage[stage].push(item);

    this.setState({ items_stage });
  }

  changeItemList(type, key, stage, event) {
    let items_stage = this.state.items_stage;
    let item_items = this.state.item_items;
    let value = event.target.value;

    if (
      stage === "stage_1" ||
      stage === "stage_2" ||
      stage === "stage_3" ||
      stage === "not_stage"
    ) {
      if (!items_stage || !items_stage[stage]) return;

      if (value < 0) {
        items_stage[stage][key][type] = 0;
      } else {
        items_stage[stage][key][type] = value;
      }

      this.recalculateItemValues(items_stage[stage][key], type);
      this.setState({ items_stage });
    }

    if (stage === "this_items") {
      if (!item_items || !item_items[stage]) return;

      if (value < 0) {
        item_items[stage][key][type] = 0;
      } else {
        item_items[stage][key][type] = value;
      }

      this.recalculateItemValues(item_items[stage][key], type);
      this.setState({ item_items });
    }

    this.recalculateWeights();
  }

  recalculateItemValues(item, type) {
    if (type === "brutto" || type === "pr_1") {
      item.netto = roundTo(
        (parseFloat(item.brutto || 0) * (100 - parseFloat(item.pr_1 || 0))) / 100,
        3,
      );

      item.res = roundTo(
        (parseFloat(item.netto || 0) * (100 - parseFloat(item.pr_2 || 0))) / 100,
        3,
      );
    }

    if (type === "pr_2") {
      item.res = roundTo(
        (parseFloat(item.netto || 0) * (100 - parseFloat(item.pr_2 || 0))) / 100,
        3,
      );
    }
  }

  recalculateWeights() {
    const { items_stage, item_items } = this.state;

    let all_w_brutto_1 =
      items_stage?.stage_1?.reduce((sum, item) => sum + parseFloat(item.brutto || 0), 0) || 0;
    let all_w_brutto_2 =
      items_stage?.stage_2?.reduce((sum, item) => sum + parseFloat(item.brutto || 0), 0) || 0;
    let all_w_brutto_3 =
      items_stage?.stage_3?.reduce((sum, item) => sum + parseFloat(item.brutto || 0), 0) || 0;
    let all_w_brutto_4 =
      items_stage?.not_stage?.reduce((sum, item) => sum + parseFloat(item.brutto || 0), 0) || 0;
    let all_w_brutto_5 =
      item_items?.this_items?.reduce((sum, item) => sum + parseFloat(item.brutto || 0), 0) || 0;

    let all_w_brutto = all_w_brutto_5;
    all_w_brutto = roundTo(all_w_brutto, 3);

    let all_w_brutto_p = all_w_brutto_1 + all_w_brutto_2 + all_w_brutto_3 + all_w_brutto_4;
    all_w_brutto_p = roundTo(all_w_brutto_p, 3);

    let all_w_netto_1 =
      items_stage?.stage_1?.reduce((sum, item) => sum + parseFloat(item.netto || 0), 0) || 0;
    let all_w_netto_2 =
      items_stage?.stage_2?.reduce((sum, item) => sum + parseFloat(item.netto || 0), 0) || 0;
    let all_w_netto_3 =
      items_stage?.stage_3?.reduce((sum, item) => sum + parseFloat(item.netto || 0), 0) || 0;
    let all_w_netto_4 =
      items_stage?.not_stage?.reduce((sum, item) => sum + parseFloat(item.netto || 0), 0) || 0;
    let all_w_netto_5 =
      item_items?.this_items?.reduce((sum, item) => sum + parseFloat(item.netto || 0), 0) || 0;

    let all_w_netto = all_w_netto_5;
    all_w_netto = roundTo(all_w_netto, 3);

    let all_w_netto_p = all_w_netto_1 + all_w_netto_2 + all_w_netto_3 + all_w_netto_4;
    all_w_netto_p = roundTo(all_w_netto_p, 3);

    let all_w_1 =
      items_stage?.stage_1?.reduce((sum, item) => sum + parseFloat(item.res || 0), 0) || 0;
    let all_w_2 =
      items_stage?.stage_2?.reduce((sum, item) => sum + parseFloat(item.res || 0), 0) || 0;
    let all_w_3 =
      items_stage?.stage_3?.reduce((sum, item) => sum + parseFloat(item.res || 0), 0) || 0;
    let all_w_4 =
      items_stage?.not_stage?.reduce((sum, item) => sum + parseFloat(item.res || 0), 0) || 0;
    let all_w_5 =
      item_items?.this_items?.reduce((sum, item) => sum + parseFloat(item.res || 0), 0) || 0;

    let all_w = all_w_5;
    all_w = roundTo(all_w, 3);

    let all_w_p = all_w_1 + all_w_2 + all_w_3 + all_w_4;
    all_w_p = roundTo(all_w_p, 3);

    this.setState({ all_w_brutto, all_w_netto, all_w, all_w_brutto_p, all_w_netto_p, all_w_p });
  }

  save() {
    const items_stage = this.state.items_stage;
    if (items_stage?.not_stage?.length) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: "В Заготовках необходимо у всех позиций указать этап",
      });
      return;
    }

    if (this.state.name.length > 20 && !this.state.marc_desc.length) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: "Заполните короткое название",
      });
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
      is_hit: this.state.is_hit,
      is_new: this.state.is_new,
      show_program: this.state.show_program,
      show_site: this.state.show_site,
      img_app: this.state.img_app,
      link: this.props.item.link,
      tags: this.state.tags_my,
      category_id: this.state.category_id.id,
      size_pizza: this.state.category_id.id === 14 ? this.state.count_part : 0,
      count_part: this.state.category_id.id !== 14 ? this.state.count_part : 0,
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
      all_w: this.state.all_w + this.state.all_w_p,
      all_w_brutto: this.state.all_w_brutto + this.state.all_w_brutto_p,
      all_w_netto: this.state.all_w_netto + this.state.all_w_netto_p,
      items_stage: new_obj_stage,
      item_items: new_obj_item_items,
    };

    if (this.myDropzone && this.myDropzone["files"]?.length > 0) {
      if (this.myDropzone["files"].length > 0 && this.isInit === false) {
        this.isInit = true;

        let name = this.props.item.name,
          id = this.props.item.id;

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

    this.props.save(data);
  }

  openNewTag() {
    this.setState({
      modalNewTag: true,
      tag_name_new: "",
    });
  }

  onClose() {
    this.setState({
      name: "",
      date_start: null,
      date_end: null,
      art: "",
      category_id: {},
      count_part: "",
      stol: "",
      weight: "",
      activeTab: 0,
      is_price: "0",
      is_show: "0",
      protein: "0",
      fat: "0",
      carbohydrates: "0",
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
      marc_desc: "",
      marc_desc_full: "",
      is_hit: "0",
      is_new: "0",
      show_program: "0",
      show_site: "0",
      img_app: "",
      tags_all: [],
      tags_my: [],
      modalNewTag: false,
      tag_name_new: "",
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
    const { open, method, fullScreen, category, stages } = this.props;

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
          maxWidth={"xl"}
          onClose={this.onClose.bind(this)}
          fullScreen={fullScreen}
        >
          <DialogTitle className="button">
            <Typography>
              {method === "Новое блюдо" ? method : `Редактирование: ${method}`}
            </Typography>
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
                style={{ paddingBottom: 24 }}
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <Paper>
                  <Tabs
                    value={this.state.activeTab}
                    onChange={this.changeTab.bind(this)}
                    centered
                    variant="fullWidth"
                  >
                    <Tab
                      label="Основные"
                      {...a11yProps(0)}
                    />
                    <Tab
                      label="БЖУ"
                      {...a11yProps(1)}
                    />
                    <Tab
                      label="Описание"
                      {...a11yProps(1)}
                    />
                    <Tab
                      label="Теги"
                      {...a11yProps(1)}
                    />
                    <Tab
                      label="Активность"
                      {...a11yProps(1)}
                    />
                    <Tab
                      label="Состав"
                      {...a11yProps(1)}
                    />
                  </Tabs>
                </Paper>
              </Grid>
              {this.state.activeTab === 0 ? (
                <>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                    }}
                    style={
                      !this.props.acces?.name_edit && !this.props.acces?.name_view
                        ? { display: "none" }
                        : {}
                    }
                  >
                    <MyTextInput
                      label="Наименование"
                      disabled={method !== "Новое блюдо" && !this.props.acces?.name_edit}
                      value={this.state.name}
                      func={this.changeItem.bind(this, "name")}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 2,
                    }}
                    style={
                      !this.props.acces?.date_start_edit && !this.props.acces?.date_start_view
                        ? { display: "none" }
                        : {}
                    }
                  >
                    <MyDatePickerNew
                      label="Действует с"
                      value={this.state.date_start}
                      disabled={method !== "Новое блюдо" && !this.props.acces?.date_start_edit}
                      func={this.changeDateRange.bind(this, "date_start")}
                      minDate={dayjs(new Date())}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                    }}
                    style={
                      !this.props.acces?.art_edit && !this.props.acces?.art_view
                        ? { display: "none" }
                        : {}
                    }
                  >
                    <MyTextInput
                      label="Код 1С"
                      value={this.state.art}
                      disabled={method !== "Новое блюдо" && !this.props.acces?.art_edit}
                      func={this.changeItem.bind(this, "art")}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 12,
                    }}
                    style={
                      !this.props.acces?.marc_desc_edit && !this.props.acces?.marc_desc_view
                        ? { display: "none" }
                        : {}
                    }
                  >
                    <MyTextInput
                      label="Короткое название (в списке)"
                      value={this.state.marc_desc}
                      maxLength={20}
                      disabled={!this.props.acces?.marc_desc_edit}
                      func={this.changeItem.bind(this, "marc_desc")}
                      multiline={true}
                      maxRows={3}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                    }}
                    style={
                      !this.props.acces?.category_id_edit && !this.props.acces?.category_id_view
                        ? { display: "none" }
                        : {}
                    }
                  >
                    <MyAutocomplite
                      label="Категория"
                      multiple={false}
                      data={category}
                      disabled={method !== "Новое блюдо" && !this.props.acces?.category_id_edit}
                      value={this.state.category_id}
                      func={(event, value) => this.setState({ category_id: value })}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 2,
                    }}
                    style={
                      !this.props.acces?.stol_edit && !this.props.acces?.stol_view
                        ? { display: "none" }
                        : {}
                    }
                  >
                    <MyTextInput
                      label="Стол"
                      type="number"
                      onWheel={(e) => e.target.blur()}
                      value={this.state.stol}
                      disabled={method !== "Новое блюдо" && !this.props.acces?.stol_edit}
                      func={this.changeItem.bind(this, "stol")}
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
                          Картинка соотношением сторон (1:1) (пример: 2000х2000) только JPG
                        </Typography>
                      </Grid>
                      {this.state.img_app.length > 0 ? (
                        <Grid
                          size={{
                            xs: 12,
                            sm: 12,
                          }}
                        >
                          <img
                            style={{ maxHeight: 400, maxWidth: 800 }}
                            src={`https://storage.yandexcloud.net/site-home-img/${this.state?.img_app.toLowerCase()}site_items_2000x2000.jpg`}
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
                          key="dropzone-element"
                          ref={this.dropzoneRef}
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
                </>
              ) : null}
              {this.state.activeTab === 1 ? (
                <>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                    style={
                      !this.props.acces?.count_part_edit && !this.props.acces?.count_part_view
                        ? { display: "none" }
                        : {}
                    }
                  >
                    <MyTextInput
                      label="Кусочков или размер"
                      disabled={method !== "Новое блюдо" && !this.props.acces?.count_part_edit}
                      value={this.state.count_part}
                      func={this.changeItem.bind(this, "count_part")}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                    style={
                      !this.props.acces?.weight_edit && !this.props.acces?.weight_view
                        ? { display: "none" }
                        : {}
                    }
                  >
                    <MyTextInput
                      label="Вес"
                      value={this.state.weight}
                      disabled={method !== "Новое блюдо" && !this.props.acces?.weight_edit}
                      func={this.changeItem.bind(this, "weight")}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                    }}
                    style={
                      !this.props.acces?.protein_edit && !this.props.acces?.protein_view
                        ? { display: "none" }
                        : {}
                    }
                  >
                    <MyTextInput
                      label="Белки"
                      type="number"
                      onWheel={(e) => e.target.blur()}
                      value={this.state.protein}
                      disabled={method !== "Новое блюдо" && !this.props.acces?.protein_edit}
                      func={this.changeItem.bind(this, "protein")}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                    }}
                    style={
                      !this.props.acces?.fat_edit && !this.props.acces?.fat_view
                        ? { display: "none" }
                        : {}
                    }
                  >
                    <MyTextInput
                      label="Жиры"
                      type="number"
                      onWheel={(e) => e.target.blur()}
                      value={this.state.fat}
                      disabled={method !== "Новое блюдо" && !this.props.acces?.fat_edit}
                      func={this.changeItem.bind(this, "fat")}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                    }}
                    style={
                      !this.props.acces?.carbohydrates_edit && !this.props.acces?.carbohydrates_view
                        ? { display: "none" }
                        : {}
                    }
                  >
                    <MyTextInput
                      label="Углеводы"
                      type="number"
                      onWheel={(e) => e.target.blur()}
                      value={this.state.carbohydrates}
                      disabled={method !== "Новое блюдо" && !this.props.acces?.carbohydrates_edit}
                      func={this.changeItem.bind(this, "carbohydrates")}
                    />
                  </Grid>
                </>
              ) : null}
              {this.state.activeTab === 2 ? (
                <>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 12,
                    }}
                    style={
                      !this.props.acces?.tmp_desc_edit && !this.props.acces?.tmp_desc_view
                        ? { display: "none" }
                        : {}
                    }
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
                      sm: 12,
                    }}
                    style={
                      !this.props.acces?.marc_desc_full_edit &&
                      !this.props.acces?.marc_desc_full_view
                        ? { display: "none" }
                        : {}
                    }
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
                </>
              ) : null}
              {this.state.activeTab === 3 ? (
                <>
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
                      func={this.changeAutocomplite.bind(this, "tags_my")}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 2,
                    }}
                    style={
                      !this.props.acces?.is_new_edit && !this.props.acces?.is_new_view
                        ? { display: "none" }
                        : {}
                    }
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
                  >
                    <MyCheckBox
                      label="Обновлено"
                      value={parseInt(this.state.is_updated) == 1 ? true : false}
                      func={this.changeItemChecked.bind(this, "is_updated")}
                      style={{ justifyContent: "center" }}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                    }}
                    style={
                      !this.props.acces?._edit && !this.props.acces?._view
                        ? { display: "none" }
                        : {}
                    }
                  >
                    <MyCheckBox
                      label="Хит"
                      value={parseInt(this.state.is_hit) == 1 ? true : false}
                      disabled={!this.props.acces?.is_hit_edit}
                      func={this.changeItemChecked.bind(this, "is_hit")}
                    />
                  </Grid>
                </>
              ) : null}
              {this.state.activeTab === 4 ? (
                <>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 3,
                    }}
                    style={
                      !this.props.acces?.is_price_edit && !this.props.acces?.is_price_view
                        ? { display: "none" }
                        : {}
                    }
                  >
                    <MyCheckBox
                      label="Установить цену"
                      disabled={method !== "Новое блюдо" && !this.props.acces?.is_price_edit}
                      value={parseInt(this.state.is_price) == 1 ? true : false}
                      func={this.changeItemChecked.bind(this, "is_price")}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 3,
                    }}
                    style={
                      !this.props.acces?.is_show_edit && !this.props.acces?.is_show_view
                        ? { display: "none" }
                        : {}
                    }
                  >
                    <MyCheckBox
                      label="Активность"
                      disabled={method !== "Новое блюдо" && !this.props.acces?.is_show_edit}
                      value={parseInt(this.state.is_show) == 1 ? true : false}
                      func={this.changeItemChecked.bind(this, "is_show")}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                    }}
                    style={
                      !this.props.acces?.show_site_edit && !this.props.acces?.show_site_view
                        ? { display: "none" }
                        : {}
                    }
                  >
                    <MyCheckBox
                      label="На сайте и КЦ"
                      value={parseInt(this.state.show_site) == 1 ? true : false}
                      disabled={!this.props.acces?.show_site_edit}
                      func={this.changeItemChecked.bind(this, "show_site")}
                    />
                  </Grid>
                  {/*<Grid
                    size={{
                      xs: 12,
                      sm: 4,
                    }}
                    style={
                      !this.props.acces?.show_program_edit && !this.props.acces?.show_program_view
                        ? { display: "none" }
                        : {}
                    }
                  >
                    <MyCheckBox
                      label="На кассе"
                      value={parseInt(this.state.show_program) == 1 ? true : false}
                      disabled={!this.props.acces?.show_program_edit}
                      func={this.changeItemChecked.bind(this, "show_program")}
                    />
                  </Grid>*/}
                </>
              ) : null}
              {this.state.activeTab === 5 ? (
                <>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 3,
                    }}
                    style={
                      !this.props.acces?.time_stage_1_edit && !this.props.acces?.time_stage_1_view
                        ? { display: "none" }
                        : {}
                    }
                  >
                    <MyTextInput
                      label="Время на 1 этап MM:SS"
                      value={this.state.time_stage_1}
                      disabled={method !== "Новое блюдо" && !this.props.acces?.time_stage_1_edit}
                      func={this.changeItem.bind(this, "time_stage_1")}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 3,
                    }}
                    style={
                      !this.props.acces?.time_stage_2_edit && !this.props.acces?.time_stage_2_view
                        ? { display: "none" }
                        : {}
                    }
                  >
                    <MyTextInput
                      label="Время на 2 этап MM:SS"
                      value={this.state.time_stage_2}
                      disabled={method !== "Новое блюдо" && !this.props.acces?.time_stage_2_edit}
                      func={this.changeItem.bind(this, "time_stage_2")}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 3,
                    }}
                    style={
                      !this.props.acces?.time_stage_3_edit && !this.props.acces?.time_stage_3_view
                        ? { display: "none" }
                        : {}
                    }
                  >
                    <MyTextInput
                      label="Время на 3 этап MM:SS"
                      value={this.state.time_stage_3}
                      disabled={method !== "Новое блюдо" && !this.props.acces?.time_stage_3_edit}
                      func={this.changeItem.bind(this, "time_stage_3")}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 12,
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                          <TableCell width="30%">Номенклатура</TableCell>
                          <TableCell>Единица измерения</TableCell>
                          <TableCell>Брутто</TableCell>
                          <TableCell>% потери при ХО</TableCell>
                          <TableCell>Нетто</TableCell>
                          <TableCell>% потери при ГО</TableCell>
                          <TableCell>Выход</TableCell>
                          <TableCell>Этапы</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                        <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                          <TableCell colSpan={9}>Заготовки</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {this.state.items_stage?.stage_1.map((item, key) => (
                          <TableRow key={key}>
                            <TableCell>
                              <MyAutocomplite
                                multiple={false}
                                optionKey="un_id"
                                getOptionKey={(option) => `${option?.un_id}`}
                                data={this.state.items_stage?.all ?? []}
                                value={item.type_id}
                                func={this.changeItemData.bind(this, key, "stage_1")}
                              />
                            </TableCell>
                            <TableCell>
                              <MyTextInput
                                value={item.ei_name}
                                disabled={true}
                                className="disabled_input"
                              />
                            </TableCell>
                            <TableCell>
                              <MyTextInput
                                value={item.brutto}
                                type={"number"}
                                func={this.changeItemList.bind(this, "brutto", key, "stage_1")}
                              />
                            </TableCell>
                            <TableCell>
                              <MyTextInput
                                value={item.pr_1}
                                type={"number"}
                                func={this.changeItemList.bind(this, "pr_1", key, "stage_1")}
                              />
                            </TableCell>
                            <TableCell>
                              <MyTextInput
                                value={item.netto}
                                disabled={true}
                                className="disabled_input"
                              />
                            </TableCell>
                            <TableCell>
                              <MyTextInput
                                value={item.pr_2}
                                type={"number"}
                                func={this.changeItemList.bind(this, "pr_2", key, "stage_1")}
                              />
                            </TableCell>
                            <TableCell>
                              <MyTextInput
                                value={item.res}
                                disabled={true}
                                className="disabled_input"
                              />
                            </TableCell>
                            <TableCell>
                              <MySelect
                                is_none={false}
                                data={stages}
                                value={item.stage}
                                func={this.changeItemSelect.bind(
                                  this,
                                  "stage",
                                  key,
                                  "stage_1",
                                  item,
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton onClick={this.deleteItemData.bind(this, key, "stage_1")}>
                                <CloseIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                        {this.state.items_stage?.stage_2.map((item, key) => (
                          <TableRow key={key}>
                            <TableCell>
                              <MyAutocomplite
                                optionKey="un_id"
                                multiple={false}
                                data={this.state.items_stage?.all ?? []}
                                value={item.type_id}
                                func={this.changeItemData.bind(this, key, "stage_2")}
                              />
                            </TableCell>
                            <TableCell>
                              <MyTextInput
                                value={item.ei_name}
                                disabled={true}
                                className="disabled_input"
                              />
                            </TableCell>
                            <TableCell>
                              <MyTextInput
                                value={item.brutto}
                                type={"number"}
                                func={this.changeItemList.bind(this, "brutto", key, "stage_2")}
                              />
                            </TableCell>
                            <TableCell>
                              <MyTextInput
                                value={item.pr_1}
                                type={"number"}
                                func={this.changeItemList.bind(this, "pr_1", key, "stage_2")}
                              />
                            </TableCell>
                            <TableCell>
                              <MyTextInput
                                value={item.netto}
                                disabled={true}
                                className="disabled_input"
                              />
                            </TableCell>
                            <TableCell>
                              <MyTextInput
                                value={item.pr_2}
                                type={"number"}
                                func={this.changeItemList.bind(this, "pr_2", key, "stage_2")}
                              />
                            </TableCell>
                            <TableCell>
                              <MyTextInput
                                value={item.res}
                                disabled={true}
                                className="disabled_input"
                              />
                            </TableCell>
                            <TableCell>
                              <MySelect
                                is_none={false}
                                data={stages}
                                value={item.stage}
                                func={this.changeItemSelect.bind(
                                  this,
                                  "stage",
                                  key,
                                  "stage_2",
                                  item,
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton onClick={this.deleteItemData.bind(this, key, "stage_2")}>
                                <CloseIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                        {this.state.items_stage?.stage_3.map((item, key) => (
                          <TableRow key={key}>
                            <TableCell>
                              <MyAutocomplite
                                multiple={false}
                                optionKey="un_id"
                                data={this.state.items_stage?.all ?? []}
                                value={item.type_id}
                                func={this.changeItemData.bind(this, key, "stage_3")}
                              />
                            </TableCell>
                            <TableCell>
                              <MyTextInput
                                value={item.ei_name}
                                disabled={true}
                                className="disabled_input"
                              />
                            </TableCell>
                            <TableCell>
                              <MyTextInput
                                value={item.brutto}
                                type={"number"}
                                func={this.changeItemList.bind(this, "brutto", key, "stage_3")}
                              />
                            </TableCell>
                            <TableCell>
                              <MyTextInput
                                value={item.pr_1}
                                type={"number"}
                                func={this.changeItemList.bind(this, "pr_1", key, "stage_3")}
                              />
                            </TableCell>
                            <TableCell>
                              <MyTextInput
                                value={item.netto}
                                disabled={true}
                                className="disabled_input"
                              />
                            </TableCell>
                            <TableCell>
                              <MyTextInput
                                value={item.pr_2}
                                type={"number"}
                                func={this.changeItemList.bind(this, "pr_2", key, "stage_3")}
                              />
                            </TableCell>
                            <TableCell>
                              <MyTextInput
                                value={item.res}
                                disabled={true}
                                className="disabled_input"
                              />
                            </TableCell>
                            <TableCell>
                              <MySelect
                                is_none={false}
                                data={stages}
                                value={item.stage}
                                func={this.changeItemSelect.bind(
                                  this,
                                  "stage",
                                  key,
                                  "stage_3",
                                  item,
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton onClick={this.deleteItemData.bind(this, key, "stage_3")}>
                                <CloseIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                        {this.state.items_stage?.not_stage.map((item, key) => (
                          <TableRow key={key}>
                            <TableCell>
                              <MyAutocomplite
                                optionKey="un_id"
                                multiple={false}
                                data={this.state.items_stage?.all ?? []}
                                value={item.type_id}
                                func={this.changeItemData.bind(this, key, "not_stage")}
                              />
                            </TableCell>
                            <TableCell>
                              <MyTextInput
                                value={item.ei_name}
                                disabled={true}
                                className="disabled_input"
                              />
                            </TableCell>
                            <TableCell>
                              <MyTextInput
                                value={item.brutto}
                                type={"number"}
                                func={this.changeItemList.bind(this, "brutto", key, "not_stage")}
                              />
                            </TableCell>
                            <TableCell>
                              <MyTextInput
                                value={item.pr_1}
                                type={"number"}
                                func={this.changeItemList.bind(this, "pr_1", key, "not_stage")}
                              />
                            </TableCell>
                            <TableCell>
                              <MyTextInput
                                value={item.netto}
                                disabled={true}
                                className="disabled_input"
                              />
                            </TableCell>
                            <TableCell>
                              <MyTextInput
                                value={item.pr_2}
                                type={"number"}
                                func={this.changeItemList.bind(this, "pr_2", key, "not_stage")}
                              />
                            </TableCell>
                            <TableCell>
                              <MyTextInput
                                value={item.res}
                                disabled={true}
                                className="disabled_input"
                              />
                            </TableCell>
                            <TableCell>
                              <MySelect
                                is_none={false}
                                data={stages}
                                value={item.stage}
                                func={this.changeItemSelect.bind(
                                  this,
                                  "stage",
                                  key,
                                  "not_stage",
                                  item,
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton
                                onClick={this.deleteItemData.bind(this, key, "not_stage")}
                              >
                                <CloseIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell>
                            <MyAutocomplite
                              multiple={false}
                              data={this.state.items_stage?.all ?? []}
                              disabledItemsFocusable={true}
                              value={null}
                              optionKey="un_id"
                              blurOnSelect={true}
                              autoFocus={false}
                              func={this.chooseItem.bind(this, "stages")}
                            />
                          </TableCell>
                          <TableCell>
                            <MyTextInput
                              value={""}
                              disabled={true}
                            />
                          </TableCell>
                          <TableCell>
                            <MyTextInput
                              value={""}
                              disabled={true}
                            />
                          </TableCell>
                          <TableCell>
                            <MyTextInput
                              value={""}
                              disabled={true}
                            />
                          </TableCell>
                          <TableCell>
                            <MyTextInput
                              value={""}
                              disabled={true}
                            />
                          </TableCell>
                          <TableCell>
                            <MyTextInput
                              value={""}
                              disabled={true}
                            />
                          </TableCell>
                          <TableCell>
                            <MyTextInput
                              value={""}
                              disabled={true}
                            />
                          </TableCell>
                          <TableCell colSpan={2}></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={2} />
                          <TableCell>
                            <MyTextInput
                              value={this.state.all_w_brutto_p}
                              disabled={true}
                              className="disabled_input"
                            />
                          </TableCell>
                          <TableCell colSpan={1} />
                          <TableCell>
                            <MyTextInput
                              value={this.state.all_w_netto_p}
                              disabled={true}
                              className="disabled_input"
                            />
                          </TableCell>
                          <TableCell colSpan={1} />
                          <TableCell>
                            <MyTextInput
                              value={this.state.all_w_p}
                              disabled={true}
                              className="disabled_input"
                            />
                          </TableCell>
                          <TableCell colSpan={2}></TableCell>
                        </TableRow>
                        <TableRow sx={{ "& td": { fontWeight: "bold" } }}>
                          <TableCell>Позиции</TableCell>
                          <TableCell></TableCell>
                          <TableCell>Брутто</TableCell>
                          <TableCell>% потери при ХО</TableCell>
                          <TableCell>Нетто</TableCell>
                          <TableCell>% потери при ГО</TableCell>
                          <TableCell>Выход</TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                        {this.state.item_items?.this_items.map((item, key) => (
                          <TableRow key={key}>
                            <TableCell colSpan={2}>
                              <MyAutocomplite
                                multiple={false}
                                data={this.state.item_items?.all_items ?? []}
                                value={item.item_id}
                                func={this.changeItemData.bind(this, key, "this_items")}
                              />
                            </TableCell>
                            <TableCell>
                              <MyTextInput
                                value={item.brutto}
                                type={"number"}
                                func={this.changeItemList.bind(this, "brutto", key, "this_items")}
                              />
                            </TableCell>
                            <TableCell>
                              <MyTextInput
                                value={item.pr_1}
                                type={"number"}
                                func={this.changeItemList.bind(this, "pr_1", key, "this_items")}
                              />
                            </TableCell>
                            <TableCell>
                              <MyTextInput
                                value={item.netto}
                                disabled={true}
                                className="disabled_input"
                              />
                            </TableCell>
                            <TableCell>
                              <MyTextInput
                                value={item.pr_2}
                                type={"number"}
                                func={this.changeItemList.bind(this, "pr_2", key, "this_items")}
                              />
                            </TableCell>
                            <TableCell>
                              <MyTextInput
                                value={item.res}
                                disabled={true}
                                className="disabled_input"
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton
                                onClick={this.deleteItemData.bind(this, key, "this_items")}
                              >
                                <CloseIcon />
                              </IconButton>
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={2}>
                            <MyAutocomplite
                              multiple={false}
                              data={this.state.item_items?.all_items ?? []}
                              disabledItemsFocusable={true}
                              value={null}
                              blurOnSelect={true}
                              autoFocus={false}
                              func={this.chooseItem.bind(this, "items")}
                            />
                          </TableCell>
                          <TableCell>
                            <MyTextInput
                              value={""}
                              disabled={true}
                            />
                          </TableCell>
                          <TableCell>
                            <MyTextInput
                              value={""}
                              disabled={true}
                            />
                          </TableCell>
                          <TableCell>
                            <MyTextInput
                              value={""}
                              disabled={true}
                            />
                          </TableCell>
                          <TableCell>
                            <MyTextInput
                              value={""}
                              disabled={true}
                            />
                          </TableCell>
                          <TableCell>
                            <MyTextInput
                              value={""}
                              disabled={true}
                            />
                          </TableCell>
                          <TableCell colSpan={2}></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={2} />
                          <TableCell>
                            <MyTextInput
                              value={this.state.all_w_brutto}
                              disabled={true}
                              className="disabled_input"
                            />
                          </TableCell>
                          <TableCell colSpan={1} />
                          <TableCell>
                            <MyTextInput
                              value={this.state.all_w_netto}
                              disabled={true}
                              className="disabled_input"
                            />
                          </TableCell>
                          <TableCell colSpan={1} />
                          <TableCell>
                            <MyTextInput
                              value={this.state.all_w}
                              disabled={true}
                              className="disabled_input"
                            />
                          </TableCell>
                          <TableCell colSpan={2}></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Grid>
                </>
              ) : null}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              onClick={this.save.bind(this)}
              disabled={method !== "Новое блюдо" && !this.props.acces?.name_edit}
            >
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}
