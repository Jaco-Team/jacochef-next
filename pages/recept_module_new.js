import React from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import { MyCheckBox, MyTextInput, MyAutocomplite, MyDatePickerNew } from "@/ui/Forms";

import queryString from "query-string";

import dayjs from "dayjs";
import MyAlert from "@/ui/MyAlert";
import { IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";

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

class ReceptModuleNew_Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      list: [],
      all_w: 0,
      storages: [],
      date_start: null,
      date_end: null,
      name: "",
      shelf_life: "",
      cat_pf_id: null,
      structure: "",
      is_show: 0,
      show_in_rev: 0,
      my_allergens: [],
      my_other_allergens: [],
    };
  }

  chooseItemNew(event, data) {
    let list = this.state.list;

    list.push({
      name_id: data,
      ed: data.ei_name,
      brutto: 0,
      pr_1: 0,
      netto: 0,
      pr_2: 0,
      res: 0,
    });

    this.setState({ list });
  }

  changeItemData(type, key, event, data) {
    let list = this.state.list;

    let this_item = list[key];

    if (type == "name_id") {
      this_item[[type]] = data;
    } else {
      this_item[[type]] = event.target.value;
    }

    this_item.netto = roundTo(
      (parseFloat(this_item.brutto) * (100 - parseFloat(this_item.pr_1))) / 100,
      3,
    );
    this_item.res = roundTo(
      (parseFloat(this_item.netto) * (100 - parseFloat(this_item.pr_2))) / 100,
      3,
    );

    list[key] = this_item;

    let all_w = 0;

    list.map((it) => {
      all_w += parseFloat(it.res);
    });

    all_w = roundTo(all_w, 3);

    this.setState({ list, all_w });
  }

  changeItem(type, event, data) {
    if (type == "is_show" || type == "show_in_rev") {
      this.setState({
        [type]: event.target.checked === true ? 1 : 0,
      });
    } else {
      if (type == "date_start" || type == "date_end") {
        this.setState({
          [type]: event,
        });
      } else {
        this.setState({
          [type]: data ? data : event.target.value,
        });
      }
    }
  }

  save() {
    let data = {
      name: this.state.name,
      structure: this.state.structure,
      shelf_life: this.state.shelf_life,
      cat_pf_id: this.state.cat_pf_id?.id,
      storages: this.state.storages,
      date_start:
        this.state.date_start && this.state.date_start.length != 0
          ? dayjs(this.state.date_start).format("YYYY-MM-DD")
          : null,
      date_end:
        this.state.date_end && this.state.date_end.length != 0
          ? dayjs(this.state.date_end).format("YYYY-MM-DD")
          : null,
      is_active: this.state.is_show,
      show_in_rev: this.state.show_in_rev,
      my_other_allergens: this.state.my_other_allergens,
      my_allergens: this.state.my_allergens,
      list: this.state.list,
    };

    this.props.saveNewPF(data);
  }

  render() {
    const { is_open, onClose, items, storages, cats, allergens } = this.props;

    return (
      <Dialog
        open={is_open}
        fullWidth={true}
        maxWidth={"lg"}
        onClose={onClose.bind(this)}
      >
        <DialogTitle>
          Полуфабрикат
          <IconButton
            onClick={onClose.bind(this)}
            style={{ cursor: "pointer", position: "absolute", top: 0, right: 0, padding: 20 }}
          >
            <Close />
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
                sm: 6,
              }}
            >
              <MyTextInput
                label="Наименование"
                value={this.state.name}
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
                label="Категория"
                multiple={false}
                data={cats}
                value={this.state.cat_pf_id}
                func={this.changeItem.bind(this, "cat_pf_id")}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
              }}
            >
              <MyTextInput
                label="Срок хранения"
                value={this.state.shelf_life}
                func={this.changeItem.bind(this, "shelf_life")}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
              }}
            >
              <MyTextInput
                label="Состав"
                value={this.state.structure}
                func={this.changeItem.bind(this, "structure")}
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
                data={storages}
                value={this.state.storages}
                func={this.changeItem.bind(this, "storages")}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
              }}
            >
              <MyAutocomplite
                label="Аллергены"
                multiple={true}
                data={allergens}
                value={this.state.my_allergens}
                func={this.changeItem.bind(this, "my_allergens")}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
              }}
            >
              <MyAutocomplite
                label="Возможные аллергены"
                multiple={true}
                data={allergens}
                value={this.state.my_other_allergens}
                func={this.changeItem.bind(this, "my_other_allergens")}
              />
            </Grid>
            <Grid
              size={{
                xs: 6,
              }}
            >
              <MyDatePickerNew
                label="Дата от"
                value={this.state.date_start}
                func={this.changeItem.bind(this, "date_start")}
              />
            </Grid>
            <Grid
              size={{
                xs: 6,
              }}
            >
              <MyDatePickerNew
                label="Дата до"
                value={this.state.date_end}
                func={this.changeItem.bind(this, "date_end")}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <MyCheckBox
                label="Активность"
                value={parseInt(this.state.is_show) == 1 ? true : false}
                func={this.changeItem.bind(this, "is_show")}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <MyCheckBox
                label="Активность в ревизии"
                value={parseInt(this.state.show_in_rev) == 1 ? true : false}
                func={this.changeItem.bind(this, "show_in_rev")}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
              }}
            >
              <table>
                <thead>
                  <tr>
                    <td style={{ textAlign: "center", width: "30%" }}>Номенклатура</td>
                    <td style={{ textAlign: "center" }}>Единица</td>
                    <td style={{ textAlign: "center" }}>Брутто</td>
                    <td style={{ textAlign: "center" }}>% потери при ХО</td>
                    <td style={{ textAlign: "center" }}>Нетто</td>
                    <td style={{ textAlign: "center" }}>% потери при ГО</td>
                    <td style={{ textAlign: "center" }}>Выход</td>
                  </tr>
                </thead>
                <tbody>
                  {this.state.list.map((item, key) => (
                    <tr key={key}>
                      <td>
                        <MyAutocomplite
                          multiple={false}
                          data={items}
                          value={item.name_id}
                          func={this.changeItemData.bind(this, "name_id", key)}
                        />
                      </td>
                      <td>
                        <MyTextInput
                          value={item.ed}
                          type={"text"}
                          disabled={true}
                        />
                      </td>
                      <td>
                        <MyTextInput
                          value={item.brutto}
                          type={"number"}
                          func={this.changeItemData.bind(this, "brutto", key)}
                        />
                      </td>
                      <td>
                        <MyTextInput
                          value={item.pr_1}
                          type={"number"}
                          func={this.changeItemData.bind(this, "pr_1", key)}
                        />
                      </td>
                      <td>
                        <MyTextInput
                          value={item.netto}
                          type={"number"}
                          disabled={true}
                        />
                      </td>
                      <td>
                        <MyTextInput
                          value={item.pr_2}
                          type={"number"}
                          func={this.changeItemData.bind(this, "pr_2", key)}
                        />
                      </td>
                      <td>
                        <MyTextInput
                          value={item.res}
                          type={"text"}
                          disabled={true}
                        />
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td>
                      <MyAutocomplite
                        multiple={false}
                        data={items}
                        value={null}
                        func={this.chooseItemNew.bind(this)}
                      />
                    </td>
                    <td>
                      <MyTextInput
                        value={""}
                        //func={changeItem.bind(this, 'name')}
                      />
                    </td>
                    <td>
                      <MyTextInput
                        value={""}
                        //func={changeItem.bind(this, 'name')}
                      />
                    </td>
                    <td>
                      <MyTextInput
                        value={""}
                        //func={changeItem.bind(this, 'name')}
                      />
                    </td>
                    <td>
                      <MyTextInput
                        value={""}
                        //func={changeItem.bind(this, 'name')}
                      />
                    </td>
                    <td>
                      <MyTextInput
                        value={""}
                        //func={changeItem.bind(this, 'name')}
                      />
                    </td>
                    <td>
                      <MyTextInput
                        value={""}
                        //func={changeItem.bind(this, 'name')}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>
                      <MyTextInput
                        value={this.state.all_w}
                        type={"text"}
                        disabled={true}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={this.save.bind(this)}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class ReceptModuleEdit_Modal extends React.Component {
  constructor(props) {
    super(props);

    console.log(this.props?.pf_info);

    this.state = {
      list: [],
      all_w: 0,
      storages: [],
      date_start: null,
      date_end: null,
      name: this.props?.pf_info?.head?.name,
      shelf_life: "",
      cat_pf_id: parseInt(this.props?.pf_info?.head?.cat_pf_id),
      structure: "",
      is_show: parseInt(this.props?.pf_info?.head?.is_show),
      show_in_rev: parseInt(this.props?.pf_info?.head?.show_in_rev),
      my_allergens: [],
      my_other_allergens: [],
    };
  }

  chooseItemNew(event, data) {
    let list = this.state.list;

    list.push({
      name_id: data,
      ed: data.ei_name,
      brutto: 0,
      pr_1: 0,
      netto: 0,
      pr_2: 0,
      res: 0,
    });

    this.setState({ list });
  }

  changeItemData(type, key, event, data) {
    let list = this.state.list;

    let this_item = list[key];

    if (type == "name_id") {
      this_item[[type]] = data;
    } else {
      this_item[[type]] = event.target.value;
    }

    this_item.netto = roundTo(
      (parseFloat(this_item.brutto) * (100 - parseFloat(this_item.pr_1))) / 100,
      3,
    );
    this_item.res = roundTo(
      (parseFloat(this_item.netto) * (100 - parseFloat(this_item.pr_2))) / 100,
      3,
    );

    list[key] = this_item;

    let all_w = 0;

    list.map((it) => {
      all_w += parseFloat(it.res);
    });

    all_w = roundTo(all_w, 3);

    this.setState({ list, all_w });
  }

  changeItem(type, event, data) {
    if (type == "is_show" || type == "show_in_rev") {
      this.setState({
        [type]: event.target.checked === true ? 1 : 0,
      });
    } else {
      if (type == "date_start" || type == "date_end") {
        this.setState({
          [type]: event,
        });
      } else {
        this.setState({
          [type]: data ? data : event.target.value,
        });
      }
    }
  }

  save() {
    let data = {
      name: this.state.name,
      structure: this.state.structure,
      shelf_life: this.state.shelf_life,
      cat_pf_id: this.state.cat_pf_id?.id,
      storages: this.state.storages,
      date_start:
        this.state.date_start && this.state.date_start.length != 0
          ? dayjs(this.state.date_start).format("YYYY-MM-DD")
          : null,
      date_end:
        this.state.date_end && this.state.date_end.length != 0
          ? dayjs(this.state.date_end).format("YYYY-MM-DD")
          : null,
      is_active: this.state.is_show,
      show_in_rev: this.state.show_in_rev,
      my_other_allergens: this.state.my_other_allergens,
      my_allergens: this.state.my_allergens,
      list: this.state.list,
    };

    this.props.saveNewPF(data);
  }

  render() {
    const { is_open, onClose, items, storages, cats, allergens, pf_info } = this.props;

    return (
      <Dialog
        open={is_open}
        fullWidth={true}
        maxWidth={"lg"}
        onClose={onClose.bind(this)}
      >
        <DialogTitle>
          Полуфабрикат
          <IconButton
            onClick={onClose.bind(this)}
            style={{ cursor: "pointer", position: "absolute", top: 0, right: 0, padding: 20 }}
          >
            <Close />
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
                sm: 6,
              }}
            >
              <MyTextInput
                label="Наименование"
                value={this.state.name}
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
                label="Категория"
                multiple={false}
                data={cats}
                value={this.state.cat_pf_id}
                func={this.changeItem.bind(this, "cat_pf_id")}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <MyCheckBox
                label="Активность"
                value={parseInt(this.state.is_show) == 1 ? true : false}
                func={this.changeItem.bind(this, "is_show")}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <MyCheckBox
                label="Активность в ревизии"
                value={parseInt(this.state.show_in_rev) == 1 ? true : false}
                func={this.changeItem.bind(this, "show_in_rev")}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
              }}
            >
              <MyTextInput
                label="Срок хранения"
                value={this.state.shelf_life}
                func={this.changeItem.bind(this, "shelf_life")}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
              }}
            >
              <MyTextInput
                label="Состав"
                value={this.state.structure}
                func={this.changeItem.bind(this, "structure")}
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
                data={storages}
                value={this.state.storages}
                func={this.changeItem.bind(this, "storages")}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
              }}
            >
              <MyAutocomplite
                label="Аллергены"
                multiple={true}
                data={allergens}
                value={this.state.my_allergens}
                func={this.changeItem.bind(this, "my_allergens")}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
              }}
            >
              <MyAutocomplite
                label="Возможные аллергены"
                multiple={true}
                data={allergens}
                value={this.state.my_other_allergens}
                func={this.changeItem.bind(this, "my_other_allergens")}
              />
            </Grid>
            <Grid
              size={{
                xs: 6,
              }}
            >
              <MyDatePickerNew
                label="Дата от"
                value={this.state.date_start}
                func={this.changeItem.bind(this, "date_start")}
              />
            </Grid>
            <Grid
              size={{
                xs: 6,
              }}
            >
              <MyDatePickerNew
                label="Дата до"
                value={this.state.date_end}
                func={this.changeItem.bind(this, "date_end")}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
              }}
            >
              <table>
                <thead>
                  <tr>
                    <td style={{ textAlign: "center", width: "30%" }}>Номенклатура</td>
                    <td style={{ textAlign: "center" }}>Единица</td>
                    <td style={{ textAlign: "center" }}>Брутто</td>
                    <td style={{ textAlign: "center" }}>% потери при ХО</td>
                    <td style={{ textAlign: "center" }}>Нетто</td>
                    <td style={{ textAlign: "center" }}>% потери при ГО</td>
                    <td style={{ textAlign: "center" }}>Выход</td>
                  </tr>
                </thead>
                <tbody>
                  {this.state.list.map((item, key) => (
                    <tr key={key}>
                      <td>
                        <MyAutocomplite
                          multiple={false}
                          data={items}
                          value={item.name_id}
                          func={this.changeItemData.bind(this, "name_id", key)}
                        />
                      </td>
                      <td>
                        <MyTextInput
                          value={item.ed}
                          type={"text"}
                          disabled={true}
                        />
                      </td>
                      <td>
                        <MyTextInput
                          value={item.brutto}
                          type={"number"}
                          func={this.changeItemData.bind(this, "brutto", key)}
                        />
                      </td>
                      <td>
                        <MyTextInput
                          value={item.pr_1}
                          type={"number"}
                          func={this.changeItemData.bind(this, "pr_1", key)}
                        />
                      </td>
                      <td>
                        <MyTextInput
                          value={item.netto}
                          type={"number"}
                          disabled={true}
                        />
                      </td>
                      <td>
                        <MyTextInput
                          value={item.pr_2}
                          type={"number"}
                          func={this.changeItemData.bind(this, "pr_2", key)}
                        />
                      </td>
                      <td>
                        <MyTextInput
                          value={item.res}
                          type={"text"}
                          disabled={true}
                        />
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td>
                      <MyAutocomplite
                        multiple={false}
                        data={items}
                        value={null}
                        func={this.chooseItemNew.bind(this)}
                      />
                    </td>
                    <td>
                      <MyTextInput
                        value={""}
                        //func={changeItem.bind(this, 'name')}
                      />
                    </td>
                    <td>
                      <MyTextInput
                        value={""}
                        //func={changeItem.bind(this, 'name')}
                      />
                    </td>
                    <td>
                      <MyTextInput
                        value={""}
                        //func={changeItem.bind(this, 'name')}
                      />
                    </td>
                    <td>
                      <MyTextInput
                        value={""}
                        //func={changeItem.bind(this, 'name')}
                      />
                    </td>
                    <td>
                      <MyTextInput
                        value={""}
                        //func={changeItem.bind(this, 'name')}
                      />
                    </td>
                    <td>
                      <MyTextInput
                        value={""}
                        //func={changeItem.bind(this, 'name')}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>
                      <MyTextInput
                        value={this.state.all_w}
                        type={"text"}
                        disabled={true}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={this.save.bind(this)}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class ReceptModule_Table extends React.Component {
  render() {
    const { recipes, openModalEdit, changeTableCheck } = this.props;

    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell style={{ width: "2%" }}>#</TableCell>
            <TableCell style={{ width: "3%" }}>Активность</TableCell>
            <TableCell style={{ width: "3%" }}>Ревизия</TableCell>
            <TableCell style={{ width: "10%" }}>Обновление</TableCell>
            <TableCell style={{ width: "25%" }}>Название</TableCell>
            <TableCell style={{ width: "59%" }}>Место хранения</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {recipes.map((item, key) => (
            <TableRow key={key}>
              <TableCell>{key + 1}</TableCell>
              <TableCell>
                <MyCheckBox
                  label=""
                  value={parseInt(item.is_show) == 1 ? true : false}
                  func={changeTableCheck.bind(this, item.id, "is_show")}
                />
              </TableCell>
              <TableCell>
                <MyCheckBox
                  label=""
                  value={parseInt(item.show_in_rev) == 1 ? true : false}
                  func={changeTableCheck.bind(this, item.id, "show_in_rev")}
                />
              </TableCell>
              <TableCell>{item.date_update}</TableCell>
              <TableCell
                style={{ cursor: "pointer" }}
                onClick={openModalEdit.bind(this, item.id)}
              >
                {item.name}
              </TableCell>
              <TableCell>{item.storage_name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
}

class ReceptModuleNew_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "recept_module_new",
      module_name: "",
      is_load: false,

      rec: null,

      pf_list: [],
      all_pf_list: [],
      allCount: 0,
      hist: [],

      dateUpdate: "",

      modalDialogNew: false,
      modalDialogEdit: false,
      method: null,

      items: [],

      operAlert: false,
      err_status: false,
      err_text: "",

      type: "new",

      items_for_pf: [],
      is_open_modal_new_pf: false,
      apps: [],
      storages: [],
      cats: [],
      allergens: [],
      pf_info: null,

      is_open_modal_edit_pf: false,
    };
  }

  async componentDidMount() {
    let res = await this.getData("get_all");

    this.setState({
      module_name: res.module_info.name,
      pf_list: res.pf,
    });

    document.title = res.module_info.name;
  }

  async getItems() {
    let res = await this.getData("get_all");

    this.setState({
      items: res.items,
    });
  }

  getData = (method, data = {}) => {
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

  openModalRecipes(method, id) {
    // const item = this.state.item.find(el => el.id === id)

    if (method === "new") {
      // let res = await this.getData('get_all_for_new');

      // console.log(res)

      this.setState({
        modalDialogNew: true,
        method,
        // item:
      });
    } else {
      this.setState({
        modalDialogEdit: true,
        method,
      });
    }
  }

  async openModalNew() {
    let data = {
      id: 0,
    };

    let res = await this.getData("get_one", data);

    let allCount = 0;

    res.pf_list.map((it) => {
      allCount += parseFloat(it.count);
    });

    this.setState({
      modalDialogEdit: true,
      rec: res.rec,
      apps: res.apps,
      pf_list: res.pf_list,
      all_pf_list: res.all_pf_list,
      storages: res.all_storages,
      allCount: allCount,
      type: "new",
    });
  }

  async openModalHistNew() {
    let data = {
      id: this.state.rec.rec_id ? this.state.rec.rec_id : this.state.rec.id,
    };

    let res = await this.getData("get_one", data);

    let allCount = 0;

    res.pf_list.map((it) => {
      allCount += parseFloat(it.count);
    });

    res.rec.app_id = res.apps.find((app) => parseInt(app.id) == parseInt(res.rec.app_id));

    this.setState({
      modalDialogEdit: true,
      rec: res.rec,
      apps: res.apps,
      pf_list: res.pf_list,
      all_pf_list: res.all_pf_list,
      storages: res.all_storages,
      allCount: allCount,
      type: "edit",
    });
  }

  async openModalEdit(id) {
    let data = {
      id: id,
    };

    let res = await this.getData("get_one", data);

    let allCount = 0;

    res.pf_list.map((it) => {
      allCount += parseFloat(it.count);
    });

    res.rec.app_id = res.apps.find((app) => parseInt(app.id) == parseInt(res.rec.app_id));

    this.setState({
      modalDialogEdit: true,
      rec: res.rec,
      apps: res.apps,
      pf_list: res.pf_list,
      all_pf_list: res.all_pf_list,
      storages: res.all_storages,
      allCount: allCount,
      hist: res.hist,
      type: "edit",
    });
  }

  async openModalHistEdit(id) {
    let data = {
      rec_id: this.state.rec.id,
      hist_id: id,
    };

    let res = await this.getData("get_one_hist", data);

    let allCount = 0;

    res.pf_list.map((it) => {
      allCount += parseFloat(it.count);
    });

    res.rec.app_id = res.apps.find((app) => parseInt(app.id) == parseInt(res.rec.app_id));

    this.setState({
      modalDialogEdit: true,
      rec: res.rec,
      apps: res.apps,
      pf_list: res.pf_list,
      all_pf_list: res.all_pf_list,
      storages: res.all_storages,
      allCount: allCount,
      hist: res.hist,
      dateUpdate: res.rec.date_start,
      type: "edit",
    });
  }

  async saveNewItem() {
    let data = {
      rec: this.state.rec,
      pf_list: this.state.pf_list,
    };

    let res = await this.getData("save_new", data);

    if (res["st"] == true) {
      this.setState({
        modalDialogEdit: false,

        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

      setTimeout(() => {
        this.getItems();
      }, 300);
    } else {
      this.setState({
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  async saveEditItem() {
    let data = {
      rec: this.state.rec,
      pf_list: this.state.pf_list,
    };

    let res = await this.getData("save_edit", data);

    if (res["st"] == true) {
      this.setState({
        modalDialogEdit: false,

        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

      setTimeout(() => {
        this.getItems();
      }, 300);
    } else {
      this.setState({
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  async saveNewHist() {
    let data = {
      date_update: dayjs(this.state.dateUpdate).format("YYYY-MM-DD"),
      rec: this.state.rec,
      pf_list: this.state.pf_list,
    };

    let res = await this.getData("save_new_hist", data);

    if (res["st"] == true) {
      this.setState({
        modalDialogEdit: false,

        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

      setTimeout(() => {
        this.getItems();
      }, 300);
    } else {
      this.setState({
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  async saveEditHist() {
    let data = {
      date_update: dayjs(this.state.dateUpdate).format("YYYY-MM-DD"),
      rec: this.state.rec,
      pf_list: this.state.pf_list,
    };

    let res = await this.getData("save_edit_hist", data);

    if (res["st"] == true) {
      this.setState({
        modalDialogEdit: false,

        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

      setTimeout(() => {
        this.getItems();
      }, 300);
    } else {
      this.setState({
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  changeItem(type, event) {
    let rec = this.state.rec;
    rec[type] = event.target.value;

    this.setState({
      rec: rec,
    });
  }

  changeItemData(type, event, data) {
    let rec = this.state.rec;
    rec[type] = data;

    this.setState({
      rec: rec,
    });
  }

  changeItemChecked(data, event) {
    let rec = this.state.rec;
    rec[data] = event.target.checked === true ? 1 : 0;

    this.setState({
      rec: rec,
    });
  }

  addIngredientsRecipe(item) {
    let pf_list = [...this.state.pf_list];

    let check = pf_list.find((el) => el.id === item.id);

    let quantity = document.getElementById("item_for_add_" + item.id).value;

    if (check || quantity < 1) {
      document.getElementById("item_for_add_" + item.id).value = "";
      return;
    }

    pf_list.push({
      count: quantity,
      ei_name: item.ei_name,
      item_id: item.id,
      name: item.name,
      percent: 0,
      recipies_id: this.state.rec.id,
    });

    let allCount = 0;

    pf_list.map((it) => {
      allCount += parseFloat(it.count);
    });

    pf_list.map((el) => (el.percent = (100 / (allCount / parseFloat(el.count))).toFixed(2)));

    document.getElementById("item_for_add_" + item.id).value = "";

    this.setState({
      pf_list: pf_list,
      allCount: allCount,
    });
  }

  dellIngredientsRecipe(item) {
    let pf_list = [...this.state.pf_list];

    pf_list = pf_list.filter((el) => el.id !== item.id);

    let allCount = 0;

    pf_list.map((it) => {
      allCount += parseFloat(it.count);
    });

    pf_list.map((el) => (el.percent = (100 / (allCount / parseFloat(el.count))).toFixed(2)));

    this.setState({
      pf_list: pf_list,
      allCount: allCount,
    });
  }

  changeDate(data, event) {
    this.setState({
      dateUpdate: data,
    });
  }

  async changeTableCheck(id, type, event, value) {
    let data = {
      type: type,
      rec_id: id,
      value: value ? 1 : 0,
    };

    let res = await this.getData("save_check", data);

    if (res["st"] == true) {
      setTimeout(() => {
        this.getItems();
      }, 300);
    } else {
      this.setState({
        operAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    }
  }

  async openModalEdit_PF(id) {
    let data = {
      id: id,
    };

    let res = await this.getData("get_one_pf", data);
    console.log("🚀 === res:", res);

    console.log(res);

    this.setState({
      items_for_pf: res.items,
      allergens: res.allergens,
      storages: res.storages,
      cats: res.cats,
      is_open_modal_edit_pf: true,
      pf_info: res.info,
    });
  }

  async openModalNewPF() {
    let res = await this.getData("get_all_for_new_pf", {});

    this.setState({
      items_for_pf: res.items,
      allergens: res.allergens,
      storages: res.storages,
      cats: res.cats,
      is_open_modal_new_pf: true,
    });
  }

  async saveNewPF(data) {
    console.log(data);

    let res = await this.getData("save_pf_new", data);
  }

  closeModalNewPF() {
    this.setState({
      items_for_pf: [],
      allergens: [],
      storages: [],
      cats: [],
      is_open_modal_new_pf: false,
    });
  }

  closeModalEditPF() {
    this.setState({
      items_for_pf: [],
      allergens: [],
      storages: [],
      cats: [],
      is_open_modal_edit_pf: false,
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
        <MyAlert
          isOpen={this.state.operAlert}
          onClose={() => {
            this.setState({ operAlert: false });
          }}
          status={this.state.err_status}
          text={this.state.err_text}
        />
        <ReceptModuleNew_Modal
          is_open={this.state.is_open_modal_new_pf}
          items={this.state.items_for_pf}
          allergens={this.state.allergens}
          storages={this.state.storages}
          onClose={this.closeModalNewPF.bind(this)}
          saveNewPF={this.saveNewPF.bind(this)}
          cats={this.state.cats}
        />
        {this.state.is_open_modal_edit_pf === true ? (
          <ReceptModuleEdit_Modal
            is_open={this.state.is_open_modal_edit_pf}
            onClose={this.closeModalEditPF.bind(this)}
            saveEditPF={() => {}}
            items={this.state.items_for_pf}
            allergens={this.state.allergens}
            storages={this.state.storages}
            cats={this.state.cats}
            pf_info={this.state.pf_info}
          />
        ) : (
          false
        )}
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
            sx={{
              mb: 3,
            }}
          >
            <Button
              onClick={this.openModalNew.bind(this)}
              variant="contained"
            >
              Добавить рецепт
            </Button>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
            sx={{
              mb: 3,
            }}
          >
            <Button
              onClick={this.openModalNewPF.bind(this)}
              variant="contained"
            >
              Добавить полуфабрикат
            </Button>
          </Grid>
        </Grid>
        <Grid
          style={{ paddingLeft: "24px" }}
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <table>
            <tbody>
              {this.state.pf_list.map((item, key) => (
                <tr key={key}>
                  <td onClick={this.openModalEdit_PF.bind(this, item.id)}>{item.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Grid>
      </>
    );
  }
}

export default function ReceptModuleNew() {
  return <ReceptModuleNew_ />;
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
