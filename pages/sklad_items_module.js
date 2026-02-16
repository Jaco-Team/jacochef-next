import React from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableContainer from "@mui/material/TableContainer";

import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

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

import { MySelect, MyCheckBox, MyAutocomplite, MyTextInput } from "@/ui/Forms";

import queryString from "query-string";

class SkladItemsModule_Modal_Edit extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show_in_rev: "",
      handle_price: "",
      is_show: "",
    };
  }

  componentDidUpdate(prevProps) {
    // console.log(this.props.is_show);

    if (!this.props) {
      return;
    }

    if (this.props !== prevProps) {
      this.setState({
        show_in_rev: this.props.show_in_rev,
        handle_price: this.props.handle_price,
        is_show: this.props.is_show,
      });
    }
  }

  changeItem(event) {
    let vendor = this.state.handle_price;
    vendor = event.target.value;

    this.setState({
      handle_price: vendor,
    });
  }

  changeItemChecked(data, event) {
    let vendor = this.state[data];
    vendor = event.target.checked === true ? 1 : 0;

    this.setState({
      [data]: vendor,
    });
  }

  save() {
    this.props.changeTableItem(
      this.props.id,
      this.props.type,
      this.state.show_in_rev,
      this.state.handle_price,
      this.state.is_show,
    );

    this.onClose();
  }

  onClose() {
    this.setState({
      show_in_rev: "",
      handle_price: "",
      is_show: "",
    });

    this.props.onClose();
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.onClose.bind(this)}
        fullWidth={true}
        maxWidth={"sm"}
        fullScreen={this.props.fullScreen}
      >
        <DialogTitle className="button">
          <Typography>{this.props.itemName} изменить:</Typography>
          {this.props.fullScreen ? (
            <IconButton
              onClick={this.onClose.bind(this)}
              style={{ cursor: "pointer" }}
            >
              <CloseIcon />
            </IconButton>
          ) : null}
        </DialogTitle>
        <DialogTitle>
          <Typography>- Активность</Typography>
          <Typography>- Ревизию</Typography>
          <Typography>- Цену</Typography>
        </DialogTitle>

        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ width: "30%" }}>Активность</TableCell>
                  <TableCell style={{ width: "30%" }}>Ревизия</TableCell>
                  <TableCell style={{ width: "40%" }}>Моя цена</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow sx={{ "& td": { border: 0 } }}>
                  <TableCell>
                    <MyCheckBox
                      label=""
                      value={parseInt(this.state.is_show) == 1 ? true : false}
                      func={this.changeItemChecked.bind(this, "is_show")}
                    />
                  </TableCell>
                  <TableCell>
                    <MyCheckBox
                      label=""
                      value={parseInt(this.state.show_in_rev) == 1 ? true : false}
                      func={this.changeItemChecked.bind(this, "show_in_rev")}
                    />
                  </TableCell>
                  <TableCell>
                    <MyTextInput
                      label=""
                      value={this.state.handle_price}
                      func={this.changeItem.bind(this)}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>

        <DialogActions>
          <Button onClick={this.save.bind(this)}>Сохранить</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class SkladItemsModule_Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      itemEdit: null,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    //console.log(nextProps.event);

    if (!nextProps.event) {
      return null;
    }

    if (nextProps.event !== prevState.event) {
      return { itemEdit: nextProps.event }; // <- this is setState equivalent
    }
    return null;
  }

  changeItem(data, event) {
    let vendor = this.state.itemEdit;
    vendor.item[data] = event.target.value;

    this.setState({
      itemEdit: vendor,
    });
  }

  changeItemChecked(data, event) {
    let vendor = this.state.itemEdit;
    vendor.item[data] = event.target.checked === true ? 1 : 0;

    this.setState({
      itemEdit: vendor,
    });
  }

  onClose() {
    this.setState({
      itemEdit: this.props.event ? this.props.event : null,
    });
    this.props.onClose();
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        fullWidth={true}
        maxWidth={"md"}
        onClose={this.onClose.bind(this)}
        fullScreen={this.props.fullScreen}
      >
        <DialogTitle className="button">
          <Typography>
            {this.props.method}
            {this.props.itemName ? `: ${this.props.itemName}` : ""}
          </Typography>
          {this.props.fullScreen ? (
            <IconButton
              onClick={this.onClose.bind(this)}
              style={{ cursor: "pointer" }}
            >
              <CloseIcon />
            </IconButton>
          ) : null}
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid
            container
            spacing={3}
          >
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
                    sm: 6,
                  }}
                >
                  <MyTextInput
                    label="Название товара"
                    disabled={!this.props.acces_edit}
                    value={this.state.itemEdit ? this.state.itemEdit.item.name : ""}
                    func={this.changeItem.bind(this, "name")}
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <MyAutocomplite
                    label="Заготовка"
                    multiple={false}
                    disabled={!this.props.acces_edit}
                    data={this.state.itemEdit ? this.state.itemEdit.pf_list : []}
                    value={
                      this.state.itemEdit
                        ? this.state.itemEdit.item.pf_id == "0"
                          ? null
                          : this.state.itemEdit.item.pf_id
                        : ""
                    }
                    func={(event, value) => {
                      let this_storages = this.state.itemEdit;
                      this_storages.item.pf_id = value;
                      this.setState({ itemEdit: this_storages });
                    }}
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <MyTextInput
                    label="Название товара для поставщика"
                    disabled={!this.props.acces_edit}
                    value={this.state.itemEdit ? this.state.itemEdit.item.name_for_vendor : ""}
                    func={this.changeItem.bind(this, "name_for_vendor")}
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <MyTextInput
                    label="Код для 1с"
                    disabled={!this.props.acces_edit}
                    value={this.state.itemEdit ? this.state.itemEdit.item.art : ""}
                    func={this.changeItem.bind(this, "art")}
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <MyTextInput
                    disabled={!this.props.acces_edit}
                    label="Максимальное количество заказов в месяц (0 - без ограничений)"
                    value={this.state.itemEdit ? this.state.itemEdit.item.max_count_in_m : ""}
                    func={this.changeItem.bind(this, "max_count_in_m")}
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <MyAutocomplite
                    label="Категория"
                    multiple={false}
                    disabled={!this.props.acces_edit}
                    data={this.state.itemEdit ? this.state.itemEdit.cats : []}
                    value={
                      this.state.itemEdit
                        ? this.state.itemEdit.item.cat_id === "0"
                          ? ""
                          : this.state.itemEdit.item.cat_id
                        : ""
                    }
                    func={(event, value) => {
                      let this_storages = this.state.itemEdit;
                      this_storages.item.cat_id = value;
                      this.setState({ itemEdit: this_storages });
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <MyTextInput
                label="Количество в упаковке"
                disabled={!this.props.acces_edit}
                value={this.state.itemEdit ? this.state.itemEdit.item.pq : ""}
                func={this.changeItem.bind(this, "pq")}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <MySelect
                data={this.state.itemEdit ? this.state.itemEdit.ed_izmer : []}
                disabled={!this.props.acces_edit}
                value={
                  this.state.itemEdit
                    ? this.state.itemEdit.item.ed_izmer_id === "0"
                      ? ""
                      : this.state.itemEdit.item.ed_izmer_id
                    : ""
                }
                func={this.changeItem.bind(this, "ed_izmer_id")}
                label="Ед измер"
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <MySelect
                data={this.state.itemEdit ? this.state.itemEdit.apps : []}
                disabled={!this.props.acces_edit}
                value={
                  this.state.itemEdit
                    ? this.state.itemEdit.item.app_id === "0"
                      ? ""
                      : this.state.itemEdit.item.app_id
                    : ""
                }
                func={this.changeItem.bind(this, "app_id")}
                label="Должность на кухне"
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <MyTextInput
                label="Время приготовления ММ:SS (15:20)"
                disabled={!this.props.acces_edit}
                value={this.state.itemEdit ? this.state.itemEdit.item.time_min : ""}
                func={this.changeItem.bind(this, "time_min")}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <MyTextInput
                label="Дополнительное время ММ:SS (15:20)"
                disabled={!this.props.acces_edit}
                value={this.state.itemEdit ? this.state.itemEdit.item.time_dop_min : ""}
                func={this.changeItem.bind(this, "time_dop_min")}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <MyTextInput
                label="Время разгрузки ММ:SS.iiii (00:20.004)"
                disabled={!this.props.acces_edit}
                value={this.state.itemEdit ? this.state.itemEdit.item.time_min_other : ""}
                func={this.changeItem.bind(this, "time_min_other")}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <MyTextInput
                label="% потерь"
                disabled={!this.props.acces_edit}
                value={this.state.itemEdit ? this.state.itemEdit.item.los_percent : ""}
                func={this.changeItem.bind(this, "los_percent")}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <MyTextInput
                label="% заявки"
                disabled={!this.props.acces_edit}
                value={this.state.itemEdit ? this.state.itemEdit.item.percent : ""}
                func={this.changeItem.bind(this, "percent")}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <MyTextInput
                label="% повышения ценника"
                disabled={!this.props.acces_edit}
                value={this.state.itemEdit ? this.state.itemEdit.item.vend_percent : ""}
                func={this.changeItem.bind(this, "vend_percent")}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <MyCheckBox
                label="Вес заготовки"
                disabled={!this.props.acces_edit}
                value={
                  this.state.itemEdit
                    ? parseInt(this.state.itemEdit.item.w_pf) == 1
                      ? true
                      : false
                    : false
                }
                func={this.changeItemChecked.bind(this, "w_pf")}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <MyCheckBox
                label="Вес отхода"
                disabled={!this.props.acces_edit}
                value={
                  this.state.itemEdit
                    ? parseInt(this.state.itemEdit.item.w_trash) == 1
                      ? true
                      : false
                    : false
                }
                func={this.changeItemChecked.bind(this, "w_trash")}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <MyCheckBox
                label="Вес товара"
                disabled={!this.props.acces_edit}
                value={
                  this.state.itemEdit
                    ? parseInt(this.state.itemEdit.item.w_item) == 1
                      ? true
                      : false
                    : false
                }
                func={this.changeItemChecked.bind(this, "w_item")}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <MyCheckBox
                label="Два сотрудника"
                disabled={!this.props.acces_edit}
                value={
                  this.state.itemEdit
                    ? parseInt(this.state.itemEdit.item.two_user) == 1
                      ? true
                      : false
                    : false
                }
                func={this.changeItemChecked.bind(this, "two_user")}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
              }}
            >
              <MyAutocomplite
                label="Места хранения"
                multiple={true}
                disabled={!this.props.acces_edit}
                data={this.state.itemEdit ? this.state.itemEdit.storages : []}
                value={this.state.itemEdit ? this.state.itemEdit.this_storages : ""}
                func={(event, value) => {
                  let this_storages = this.state.itemEdit;
                  this_storages.this_storages = value;
                  this.setState({ itemEdit: this_storages });
                }}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
              }}
            >
              <MyAutocomplite
                label="Системы учета"
                multiple={true}
                disabled={!this.props.acces_edit}
                data={this.state.itemEdit ? this.state.itemEdit.accounting_system : []}
                value={this.state.itemEdit ? this.state.itemEdit.this_accounting_system : ""}
                func={(event, value) => {
                  let this_storages = this.state.itemEdit;
                  this_storages.this_accounting_system = value;
                  this.setState({ itemEdit: this_storages });
                }}
              />
            </Grid>

            {this.props.method === "Редактирование товара" ? (
              <Grid
                size={{
                  xs: 12,
                }}
              >
                <MyCheckBox
                  label="Активность"
                  disabled={!this.props.acces_edit}
                  value={parseInt(this.state.itemEdit.item.is_show) == 1 ? true : false}
                  func={this.changeItemChecked.bind(this, "is_show")}
                />
              </Grid>
            ) : null}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={!this.props.acces_edit}
            onClick={
              this.props.method === "Редактирование товара"
                ? this.props.checkArt.bind(this, this.state.itemEdit)
                : this.props.checkArtNew.bind(this, this.state.itemEdit)
            }
            color="primary"
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class SkladItemsModule_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "sklad_items_module",
      module_name: "",
      is_load: false,
      acces_edit: false,
      acces_view: false,
      cats: [],
      allItems: [],
      vendor_items: [],

      modalDialog: false,
      modalDialogEdit: false,

      method: null,
      itemEdit: null,
      itemName: "",

      checkArtDialog: false,
      checkArtList: [],

      freeItems: [],

      searchItem: "",

      show_in_rev: "",
      handle_price: "",
      is_show: "",
      id: "",
      type: 0,

      fullScreen: false,
    };
  }

  async componentDidMount() {
    let data = await this.getData("get_all");

    // console.log(data)
    const acces = data.acces.find((i) => i.param === "form");
    this.setState({
      module_name: data.module_info.name,
      cats: data.cats,
      freeItems: data.items_free,
      acces_edit: acces?.edit === "1",
      acces_view: acces?.view === "1",
    });

    document.title = data.module_info.name;
  }

  getData = (method, data = {}, is_load = true) => {
    if (is_load == true) {
      this.setState({
        is_load: true,
      });
    }

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
        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 300);
        console.log(err);
      });
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

  async changeCity(event) {
    let data = {
      city: event.target.value,
    };

    let res = await this.getData("get_vendors", data);

    this.setState({
      vendors: res,
      city: event.target.value,
    });
  }

  changeSort(data, event) {
    this.state.vendor_items.map((item, key) => {
      if (parseInt(item.item_id) == parseInt(data)) {
        this.state.vendor_items[key]["sort"] = event.target.value;
      }
    });

    this.setState({
      vendor_items: this.state.vendor_items,
    });
  }

  async showEditItem(id, method) {
    this.handleResize();

    let data = {
      item_id: id,
    };

    let res = await this.getData("get_one", data);
    console.log("🚀 === res:", res);

    res.item.pf_id = res.pf_list.find((item) => item.id === res.item.pf_id);
    res.item.cat_id = res.cats.find((item) => item.id === res.item.cat_id);

    this.setState({
      modalDialog: true,
      method,
      itemEdit: res,
      itemName: res.item.name,
    });
  }

  async saveEditItem(itemEdit, main_item_id = 0) {
    let pf_id = itemEdit.item.pf_id.id;
    let cat_id = itemEdit.item.cat_id.id;

    itemEdit.item.pf_id = pf_id;
    itemEdit.item.cat_id = cat_id;

    let data = {
      id: itemEdit.item.id,
      item: itemEdit.item,
      storages: itemEdit.this_storages,
      accounting_system: itemEdit.this_accounting_system,
      main_item_id: parseInt(main_item_id) == 0 ? itemEdit.item.id : parseInt(main_item_id),
    };

    let res = await this.getData("saveEditItem", data);

    if (res.st === false) {
      alert(res.text);
    } else {
      this.setState({
        modalDialog: false,
        itemEdit: null,
        checkArtDialog: false,
        checkArtList: [],
      });

      setTimeout(async () => {
        this.search();
      }, 300);
    }
  }

  async saveNewItem(itemEdit, main_item_id = 0) {
    let pf_id = itemEdit.item.pf_id.id;
    let cat_id = itemEdit.item.cat_id.id;

    itemEdit.item.pf_id = pf_id;
    itemEdit.item.cat_id = cat_id;

    let data = {
      id: itemEdit.item.id,
      item: itemEdit.item,
      storages: itemEdit.this_storages,
      accounting_system: itemEdit.this_accounting_system,
      main_item_id: parseInt(main_item_id) == 0 ? itemEdit.item.id : parseInt(main_item_id),
    };

    let res = await this.getData("saveNewItem", data);

    if (res.st === false) {
      alert(res.text);
    } else {
      this.setState({
        modalDialog: false,
        itemEdit: null,
        checkArtDialog: false,
        checkArtList: [],
      });

      setTimeout(async () => {
        this.search();
      }, 300);
    }
  }

  async checkArt(itemEdit) {
    let data = {
      id: itemEdit.item.id,
      art: itemEdit.item.art,
    };

    let res = await this.getData("checkArt", data);

    if (res.st === false) {
      this.setState({
        checkArtDialog: true,
        checkArtList: res.data,
        itemEdit: itemEdit,
      });
    } else {
      this.saveEditItem(itemEdit);
    }
  }

  async checkArtNew(itemEdit) {
    let data = {
      id: itemEdit.item.id,
      art: itemEdit.item.art,
    };

    let res = await this.getData("checkArt", data);

    if (res.st === false) {
      res.data.push({ id: -1, name: this.state.itemEdit.item.name });

      this.setState({
        checkArtDialog: true,
        checkArtList: res.data,
      });
    } else {
      this.saveNewItem(itemEdit);
    }
  }

  chooseArt(item_id) {
    if (this.state.modalItemNew === true) {
      this.saveNewItem(item_id);
    } else {
      this.saveEditItem(this.state.itemEdit, item_id);
    }
  }

  openModalItemEdit(id, type, name, show_in_rev, handle_price, is_show) {
    this.handleResize();

    this.setState({
      modalDialogEdit: true,
      show_in_rev,
      handle_price,
      is_show,
      id,
      type,
      itemName: name,
    });
  }

  async openModalItemNew(method) {
    this.handleResize();

    let res = await this.getData("get_all_for_new");

    this.setState({
      modalDialog: true,
      itemEdit: res,
      itemName: "",
      method,
    });
  }

  async saveItem(item_id, type, value) {
    let data = {
      item_id: item_id,
      type: type,
      value: value,
    };

    let res = await this.getData("saveItem", data, false);

    if (res.st === false) {
      alert(res.text);
    } else {
      this.setState({
        modalItemNew: false,
        modalItemEdit: false,
        itemEdit: null,
        checkArtDialog: false,
        checkArtList: [],
      });

      res = await this.getData("get_all");

      this.setState({
        cats: res.cats,
        freeItems: res.items_free,
      });
    }
  }

  changeTableItem(item_id, type, show_in_rev, handle_price, is_show) {
    if (parseInt(type) == 1) {
      if (this.state.show_in_rev !== show_in_rev) {
        this.saveItem(item_id, "show_in_rev", show_in_rev);
      }

      if (this.state.handle_price !== handle_price) {
        this.saveItem(item_id, "handle_price", handle_price);
      }

      if (this.state.is_show !== is_show) {
        this.saveItem(item_id, "active", is_show);
      }
    }

    if (parseInt(type) == 2) {
      if (this.state.show_in_rev !== show_in_rev) {
        this.saveItem(item_id, "show_in_rev", show_in_rev);
      }

      if (this.state.handle_price !== handle_price) {
        this.saveItem(item_id, "handle_price", handle_price);
      }

      if (this.state.is_show !== is_show) {
        this.saveItem(item_id, "active", is_show);
      }
    }
  }

  async search() {
    let data = {
      item: this.state.searchItem,
    };

    let res = await this.getData("get_all_search", data);

    this.setState({
      cats: res.cats,
      freeItems: res.items_free,
    });
  }

  render() {
    return (
      <>
        <Backdrop
          style={{ zIndex: 99 }}
          open={this.state.is_load}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <Dialog
          onClose={() => {
            this.setState({ checkArtDialog: false, checkArtList: [] });
          }}
          open={this.state.checkArtDialog}
        >
          <DialogTitle>Такой код 1с уже задан у следующих позиций:</DialogTitle>
          <List sx={{ pt: 0 }}>
            {this.state.checkArtList.map((item, key) => (
              <ListItemButton
                onClick={this.chooseArt.bind(this, item.id)}
                key={key}
              >
                <ListItemText primary={item.name} />
              </ListItemButton>
            ))}
          </List>
        </Dialog>
        <SkladItemsModule_Modal
          open={this.state.modalDialog}
          onClose={() => {
            this.setState({ modalDialog: false });
          }}
          checkArtNew={this.checkArtNew.bind(this)}
          checkArt={this.checkArt.bind(this)}
          method={this.state.method}
          event={this.state.itemEdit}
          acces_edit={this.state.acces_edit}
          itemName={this.state.itemName}
          fullScreen={this.state.fullScreen}
        />
        <SkladItemsModule_Modal_Edit
          open={this.state.modalDialogEdit}
          onClose={() => {
            this.setState({ modalDialogEdit: false });
          }}
          id={this.state.id}
          type={this.state.type}
          itemName={this.state.itemName}
          show_in_rev={this.state.show_in_rev}
          is_show={this.state.is_show}
          handle_price={this.state.handle_price}
          changeTableItem={this.changeTableItem.bind(this)}
          fullScreen={this.state.fullScreen}
        />
        <Grid
          container
          spacing={3}
          className="container_first_child"
        >
          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <Button
              onClick={this.openModalItemNew.bind(this, "Новый товар")}
              variant="contained"
              disabled={!this.state.acces_edit}
            >
              Добавить товар
            </Button>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyTextInput
              label="Поиск"
              value={this.state.searchItem}
              func={(event) => {
                this.setState({ searchItem: event.target.value });
              }}
              onBlur={this.search.bind(this)}
            />
          </Grid>

          <Grid
            style={{ paddingBottom: "40px" }}
            size={{
              xs: 12,
            }}
          >
            {this.state.cats.map((item, key) => (
              <Accordion key={key}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{item.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {item.cats.map((category, key_cat) => (
                    <Accordion key={key_cat}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>{category.name}</Typography>
                      </AccordionSummary>
                      <AccordionDetails style={{ width: "100%", overflow: "scroll" }}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell style={{ width: "2%" }}>id</TableCell>
                              <TableCell style={{ width: "2%" }}>Активность</TableCell>
                              <TableCell style={{ width: "3%" }}>Ревизия</TableCell>
                              <TableCell style={{ width: "15%" }}>Товар</TableCell>
                              <TableCell style={{ width: "10%" }}>% потерь</TableCell>
                              <TableCell style={{ width: "10%" }}>% заявки</TableCell>
                              <TableCell style={{ width: "15%" }}>Заготовка</TableCell>
                              <TableCell style={{ width: "5%" }}>Ед. измер</TableCell>
                              <TableCell style={{ width: "9%" }}>Место хранения</TableCell>
                              <TableCell style={{ width: "9%", minWidth: 150 }}>Моя цена</TableCell>
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            {category.items.map((it, k) => (
                              <TableRow key={k}>
                                <TableCell>{it.id}</TableCell>
                                <TableCell
                                  onClick={this.openModalItemEdit.bind(
                                    this,
                                    it.id,
                                    1,
                                    it.name,
                                    it.show_in_rev,
                                    it.handle_price,
                                    it.is_show,
                                  )}
                                >
                                  <MyCheckBox
                                    label=""
                                    disabled={!this.state.acces_edit}
                                    value={parseInt(it.is_show) == 1 ? true : false}
                                  />
                                </TableCell>
                                <TableCell
                                  onClick={this.openModalItemEdit.bind(
                                    this,
                                    it.id,
                                    1,
                                    it.name,
                                    it.show_in_rev,
                                    it.handle_price,
                                    it.is_show,
                                  )}
                                >
                                  <MyCheckBox
                                    label=""
                                    disabled={!this.state.acces_edit}
                                    value={parseInt(it.show_in_rev) == 1 ? true : false}
                                  />
                                </TableCell>
                                <TableCell
                                  style={{ cursor: "pointer" }}
                                  onClick={this.showEditItem.bind(
                                    this,
                                    it.id,
                                    "Редактирование товара",
                                  )}
                                >
                                  {it.name}
                                </TableCell>
                                <TableCell>{it.los_percent} %</TableCell>
                                <TableCell>{it.percent} %</TableCell>
                                <TableCell>{it.pf_name}</TableCell>
                                <TableCell>{it.ei_name}</TableCell>
                                <TableCell>{it.storage_name}</TableCell>
                                <TableCell
                                  style={{ cursor: "pointer" }}
                                  onClick={this.openModalItemEdit.bind(
                                    this,
                                    it.id,
                                    1,
                                    it.name,
                                    it.show_in_rev,
                                    it.handle_price,
                                    it.is_show,
                                  )}
                                >
                                  <span style={{ borderBottom: "1px dotted red" }}>
                                    {it.handle_price}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </AccordionDetails>
              </Accordion>
            ))}
            {this.state.freeItems.length == 0 ? null : (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Без категории</Typography>
                </AccordionSummary>
                <AccordionDetails style={{ width: "100%", overflow: "scroll" }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ width: "2%" }}>id</TableCell>
                        <TableCell style={{ width: "2%" }}>Активность</TableCell>
                        <TableCell style={{ width: "3%" }}>Ревизия</TableCell>
                        <TableCell style={{ width: "15%" }}>Товар</TableCell>
                        <TableCell style={{ width: "10%" }}>% потерь</TableCell>
                        <TableCell style={{ width: "10%" }}>% заявки</TableCell>
                        <TableCell style={{ width: "15%" }}>Заготовка</TableCell>
                        <TableCell style={{ width: "5%" }}>Ед. измер</TableCell>
                        <TableCell style={{ width: "9%" }}>Место хранения</TableCell>
                        <TableCell style={{ width: "9%", minWidth: 150 }}>Моя цена</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {this.state.freeItems.map((cat, key) => (
                        <TableRow key={key}>
                          <TableCell>{cat.id}</TableCell>
                          <TableCell
                            onClick={this.openModalItemEdit.bind(
                              this,
                              cat.id,
                              2,
                              cat.name,
                              cat.show_in_rev,
                              cat.handle_price,
                              cat.is_show,
                            )}
                          >
                            <MyCheckBox
                              label=""
                              value={parseInt(cat.is_show) == 1 ? true : false}
                            />
                          </TableCell>
                          <TableCell
                            onClick={this.openModalItemEdit.bind(
                              this,
                              cat.id,
                              2,
                              cat.name,
                              cat.show_in_rev,
                              cat.handle_price,
                              cat.is_show,
                            )}
                          >
                            <MyCheckBox
                              label=""
                              value={parseInt(cat.show_in_rev) == 1 ? true : false}
                            />
                          </TableCell>
                          <TableCell
                            style={{ cursor: "pointer" }}
                            onClick={this.showEditItem.bind(this, cat.id, "Редактирование товара")}
                          >
                            {cat.name}
                          </TableCell>
                          <TableCell>{cat.los_percent} %</TableCell>
                          <TableCell>{cat.percent} %</TableCell>
                          <TableCell>{cat.pf_name}</TableCell>
                          <TableCell>{cat.ei_name}</TableCell>
                          <TableCell>{cat.storage_name}</TableCell>
                          <TableCell
                            style={{ cursor: "pointer" }}
                            onClick={this.openModalItemEdit.bind(
                              this,
                              cat.id,
                              2,
                              cat.name,
                              cat.show_in_rev,
                              cat.handle_price,
                              cat.is_show,
                            )}
                          >
                            <span style={{ borderBottom: "1px dotted red" }}>
                              {cat.handle_price}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            )}
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function SkladItemsModule() {
  return <SkladItemsModule_ />;
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
