import React from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import TabList from "@mui/lab/TabList";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

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

class ReceptModule_Modal_Container extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: null,
      searchValue: "",
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!nextProps.event) {
      return null;
    }

    if (nextProps.event !== prevState.event) {
      return { item: nextProps.event };
    }
    return null;
  }

  searchPf(event) {
    this.setState({
      searchValue: event.target.value,
    });
  }

  render() {
    const {
      rec,
      allCount,
      storages,
      apps,
      pf_list,
      all_pf_list,
      changeItem,
      changeItemData,
      changeItemChecked,
      addIngredientsRecipe,
      dellIngredientsRecipe,
    } = this.props;

    return (
      <Grid
        container
        spacing={3}
        mt={3}
      >
        <Grid size={12}>
          <Grid
            container
            spacing={3}
            mb={2}
          >
            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <MyTextInput
                label="Наименование рецепта"
                value={rec.name}
                func={changeItem.bind(this, "name")}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <MyTextInput
                label="Время приготовления 1кг (ММ:СС)"
                value={rec.time_min}
                func={changeItem.bind(this, "time_min")}
              />
            </Grid>
          </Grid>
          <Grid
            container
            spacing={3}
            mb={2}
          >
            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <MyTextInput
                label="Срок хранения"
                value={rec.shelf_life}
                func={changeItem.bind(this, "shelf_life")}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <MyAutocomplite
                label="Должность на кухне"
                multiple={false}
                data={apps}
                value={rec.app_id}
                func={changeItemData.bind(this, "app_id")}
              />
            </Grid>
          </Grid>

          <Grid
            mb={3}
            size={{
              xs: 12,
            }}
          >
            <MyAutocomplite
              label="Места хранения"
              multiple={true}
              data={storages}
              value={rec.storages}
              func={changeItemData.bind(this, "storages")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
            }}
          >
            <MyCheckBox
              label="Активность"
              value={parseInt(rec.is_show) == 1 ? true : false}
              func={changeItemChecked.bind(this, "is_show")}
            />
          </Grid>

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
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Название</TableCell>
                    <TableCell>Кол-во</TableCell>
                    <TableCell colSpan={2}>Ед измер</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {all_pf_list.map((item, key) => (
                    <TableRow key={key}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <MyTextInput
                          type="number"
                          id={"item_for_add_" + item.id}
                          //defaultValue={''}
                          //func={changeQuantity.bind(this)}
                        />
                      </TableCell>
                      <TableCell>{item.ei_name}</TableCell>
                      <TableCell>
                        <AddIcon
                          onClick={addIngredientsRecipe.bind(this, item)}
                          style={{ cursor: "pointer" }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Название</TableCell>
                    <TableCell>Кол-во</TableCell>
                    <TableCell>%</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pf_list.map((item, key) => (
                    <TableRow key={key}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        {item.count} {item.ei_name}
                      </TableCell>
                      <TableCell>{item.percent} %</TableCell>
                      <TableCell>
                        <CloseIcon
                          onClick={dellIngredientsRecipe.bind(this, item)}
                          style={{ cursor: "pointer" }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ "& td": { border: 0 } }}>
                    <TableCell>Всего:</TableCell>
                    <TableCell>{allCount}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

class ReceptModule_Modal_Edit extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: null,

      ItemTab: "0",

      quantity: "",

      total: "",
    };
  }

  /*static getDerivedStateFromProps(nextProps, prevState) {

    if (!nextProps.event) {
      return null;
    }

    if (nextProps.event !== prevState.event) {
      return { item: nextProps.event }; 
    }
    return null;
  }*/

  changeTab(event, value) {
    this.setState({
      ItemTab: value,
    });

    if (parseInt(value) === -1) {
      this.props.openModalHistNew();
    }

    if (parseInt(value) === 0) {
      console.log(
        "Edit",
        this.props.rec && this.props.rec.rec_id ? this.props.rec.rec_id : this.props.rec.id,
      );
      this.props.openModalEdit(
        this.props.rec && this.props.rec.rec_id ? this.props.rec.rec_id : this.props.rec.id,
      );
    }

    if (parseInt(value) > 0) {
      console.log("HistEdit", value);
      this.props.openModalHistEdit(value);
    }
  }

  render() {
    const {
      isOpen,
      onClose,
      changeItem,
      changeItemData,
      changeItemChecked,
      addIngredientsRecipe,
      dellIngredientsRecipe,
      rec,
      storages,
      apps,
      pf_list,
      all_pf_list,
      allCount,
    } = this.props;

    const { changeDate, dateUpdate, saveNewHist, saveEditHist, hist } = this.props;

    return (
      <Dialog
        open={isOpen}
        fullWidth={true}
        maxWidth={"lg"}
        onClose={onClose.bind(this)}
      >
        <DialogTitle>
          {this.props.type == "new" ? "Новый рецепт" : "Редактирование рецепта"}
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
              <TabContext value={this.state.ItemTab}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <TabList
                    onChange={this.changeTab.bind(this)}
                    variant="fullWidth"
                  >
                    {hist.map((item, key) => (
                      <Tab
                        key={key}
                        label={item.date_start}
                        value={item.id}
                      />
                    ))}
                    <Tab
                      label="Текущая"
                      value="0"
                    />
                    <Tab
                      label="Добавить"
                      value="-1"
                    />
                  </TabList>
                </Box>

                <Grid
                  container
                  spacing={3}
                  style={{ marginTop: 5 }}
                >
                  {parseInt(this.state.ItemTab) == -1 || parseInt(this.state.ItemTab) > 0 ? (
                    <Grid
                      size={{
                        xs: 4,
                      }}
                    >
                      <MyDatePickerNew
                        label="Дата обновления"
                        value={dateUpdate}
                        func={changeDate.bind(this)}
                      />
                    </Grid>
                  ) : null}

                  <Grid
                    size={{
                      xs: 12,
                    }}
                  >
                    <ReceptModule_Modal_Container
                      rec={rec}
                      allCount={allCount}
                      storages={storages}
                      apps={apps}
                      pf_list={pf_list}
                      all_pf_list={all_pf_list}
                      changeItem={changeItem.bind(this)}
                      changeItemData={changeItemData.bind(this)}
                      changeItemChecked={changeItemChecked.bind(this)}
                      addIngredientsRecipe={addIngredientsRecipe.bind(this)}
                      dellIngredientsRecipe={dellIngredientsRecipe.bind(this)}
                    />
                  </Grid>
                </Grid>
              </TabContext>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          {parseInt(this.state.ItemTab) == -1 ? (
            <Button
              onClick={saveNewHist.bind(this)}
              color="primary"
            >
              Сохранить
            </Button>
          ) : null}
          {parseInt(this.state.ItemTab) == 0 ? (
            <Button
              onClick={
                this.props.type == "new"
                  ? this.props.saveNew.bind(this, this.state.item)
                  : this.props.saveEdit.bind(this, this.state.item)
              }
              color="primary"
            >
              {this.props.type == "new" ? "Сохранить" : "Обновить"}
            </Button>
          ) : null}
          {parseInt(this.state.ItemTab) > 0 ? (
            <Button
              onClick={saveEditHist.bind(this)}
              color="primary"
            >
              Сохранить
            </Button>
          ) : null}
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

class ReceptModule_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "recept_module",
      module_name: "",
      is_load: false,

      rec: null,
      storages: [],
      apps: [],
      pf_list: [],
      all_pf_list: [],
      allCount: 0,
      hist: [],

      dateUpdate: null,

      modalDialogNew: false,
      modalDialogEdit: false,
      method: null,

      items: [],

      operAlert: false,
      err_status: false,
      err_text: "",

      type: "new",
    };
  }

  async componentDidMount() {
    let res = await this.getData("get_all");

    this.setState({
      module_name: res.module_info.name,
      items: res.items,
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
            mb={3}
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <Button
              onClick={this.openModalNew.bind(this)}
              variant="contained"
            >
              Добавить рецепт
            </Button>
          </Grid>

          <ReceptModule_Modal_Edit
            isOpen={this.state.modalDialogEdit}
            onClose={() => {
              this.setState({ modalDialogEdit: false });
            }}
            changeItem={this.changeItem.bind(this)}
            changeItemData={this.changeItemData.bind(this)}
            changeItemChecked={this.changeItemChecked.bind(this)}
            addIngredientsRecipe={this.addIngredientsRecipe.bind(this)}
            dellIngredientsRecipe={this.dellIngredientsRecipe.bind(this)}
            openModalHistNew={this.openModalHistNew.bind(this)}
            rec={this.state.rec}
            allCount={this.state.allCount}
            storages={this.state.storages}
            apps={this.state.apps}
            pf_list={this.state.pf_list}
            all_pf_list={this.state.all_pf_list}
            saveEdit={this.saveEditItem.bind(this)}
            saveNew={this.saveNewItem.bind(this)}
            type={this.state.type}
            changeDate={this.changeDate.bind(this)}
            dateUpdate={this.state.dateUpdate}
            saveNewHist={this.saveNewHist.bind(this)}
            hist={this.state.hist}
            openModalHistEdit={this.openModalHistEdit.bind(this)}
            saveEditHist={this.saveEditHist.bind(this)}
            openModalEdit={this.openModalEdit.bind(this)}
          />

          <Grid
            size={{
              xs: 12,
            }}
          >
            <ReceptModule_Table
              recipes={this.state.items}
              isOpen={this.state.modalDialogEdit}
              onClose={() => {
                this.setState({ modalDialogEdit: false });
              }}
              openModalEdit={this.openModalEdit.bind(this)}
              changeTableCheck={this.changeTableCheck.bind(this)}
            />
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function ReceptModule() {
  return <ReceptModule_ />;
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
