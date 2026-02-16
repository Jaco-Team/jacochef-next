import React from "react";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

import { MyTextInput } from "@/ui/Forms";

import queryString from "query-string";
import { api_laravel, api_laravel_local } from "@/src/api_new";
import MyAlert from "@/ui/MyAlert";

function CustomTabPanel(props) {
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

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

class SkladStorage_Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: null,
    };
  }

  componentDidUpdate(prevProps) {
    //console.log(this.props);

    if (!this.props.item) {
      return;
    }

    if (this.props.item !== prevProps.item) {
      this.setState({
        item: this.props.item,
      });
    }
  }

  changeItem(data, event) {
    const item = this.state.item;

    item[data] = event.target.value;

    this.setState({
      item,
    });
  }

  save() {
    const item = this.state.item;

    this.props.save(item);

    this.onClose();
  }

  onClose() {
    this.setState({
      item: null,
    });

    this.props.onClose();
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.onClose.bind(this)}
        fullScreen={this.props.fullScreen}
        fullWidth={true}
        maxWidth="md"
      >
        <DialogTitle className="button">
          {this.props.method}
          {this.props.itemName ? `: ${this.props.itemName}` : null}
        </DialogTitle>
        <IconButton
          onClick={this.onClose.bind(this)}
          style={{ cursor: "pointer", position: "absolute", top: 0, right: 0, padding: 20 }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid
            container
            spacing={3}
          >
            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              <MyTextInput
                label="Название"
                value={this.state.item ? this.state.item.name : ""}
                func={this.changeItem.bind(this, "name")}
              />
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
    );
  }
}

class SkladStorage_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "sklad_storage",
      module_name: "",
      is_load: false,

      fullScreen: false,

      list: null,
      accounting_system: null,
      item: null,

      mark: null,
      modalDialog: false,
      method: "",
      itemName: "",
      type: "",

      itemNew: {
        name: "",
      },

      activeTab: 0,

      openAlert: false,
      err_status: true,
      err_text: "",
    };
  }

  async componentDidMount() {
    const data = await this.getData("get_all");

    this.setState({
      list: data.list,
      accounting_system: data.accounting_system,
      module_name: data.module_info.name,
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
        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 500);
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

  async openModal(mark, id) {
    this.handleResize();

    if (mark === "add") {
      this.setState({
        type: "SS",
        mark,
        item: JSON.parse(JSON.stringify(this.state.itemNew)),
        modalDialog: true,
        method: "Новое место хранения",
      });
    }

    if (mark === "edit") {
      const data = {
        id,
      };

      const res = await this.getData("get_one", data);

      this.setState({
        type: "SS",
        mark,
        item: res.item,
        itemName: res.item.name,
        modalDialog: true,
        method: "Редактирование места хранения",
      });
    }
  }

  async openModalAS(mark, id) {
    this.handleResize();

    if (mark === "add") {
      this.setState({
        type: "AS",
        mark,
        item: JSON.parse(JSON.stringify(this.state.itemNew)),
        modalDialog: true,
        method: "Новая система учета",
      });
    }

    if (mark === "edit") {
      const data = {
        id,
      };

      const res = await this.getData("get_one_as", data);

      this.setState({
        type: "AS",
        mark,
        item: res.item,
        itemName: res.item.name,
        modalDialog: true,
        method: "Редактирование системы учета",
      });
    }
  }

  async save(data) {
    const mark = this.state.mark;
    const type = this.state.type;

    let res;

    if (mark === "add") {
      if (type == "SS") res = await this.getData("save_new", data);

      if (type == "AS") res = await this.getData("save_new_as", data);
    }

    if (mark === "edit") {
      if (type == "SS") res = await this.getData("save_edit", data);

      if (type == "AS") res = await this.getData("save_edit_as", data);
    }

    if (!res.st) {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    } else {
      setTimeout(() => {
        this.update();
      }, 300);
    }
  }

  changeSort(index, event) {
    const type = this.state.type;
    const list = this.state.list;
    const accounting_system = this.state.accounting_system;

    type == "SS";
    list[index].sort = event.target.value;

    type == "AS";
    accounting_system[index].sort = event.target.value;

    this.setState({
      list,
      accounting_system,
    });
  }

  async saveSort(id, event) {
    const data = {
      id,
      value: event.target.value,
    };

    const type = this.state.type;

    const res = await this.getData(type == "SS" ? "save_sort" : "save_sort_as", data);

    if (!res.st) {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    } else {
      setTimeout(() => {
        this.update();
      }, 300);
    }
  }

  async update() {
    const data = await this.getData("get_all");

    this.setState({
      list: data.list,
      accounting_system: data.accounting_system,
    });
  }

  handleChangeTab(event, index) {
    this.setState({
      activeTab: index,
    });
  }

  render() {
    return (
      <>
        <Backdrop
          open={this.state.is_load}
          style={{ zIndex: 99 }}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />
        <SkladStorage_Modal
          open={this.state.modalDialog}
          onClose={() => this.setState({ modalDialog: false, itemName: "", method: "" })}
          mark={this.state.mark}
          item={this.state.item}
          method={this.state.method}
          itemName={this.state.itemName}
          fullScreen={this.state.fullScreen}
          type={this.state.type}
          save={this.save.bind(this)}
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

          <Box sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={this.state.activeTab}
                onChange={this.handleChangeTab.bind(this)}
                aria-label="basic tabs example"
              >
                <Tab
                  label="Места хранения"
                  {...a11yProps(0)}
                />
                <Tab
                  label="Система учета"
                  {...a11yProps(1)}
                />
              </Tabs>
            </Box>
            <CustomTabPanel
              value={this.state.activeTab}
              index={0}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  style={{ whiteSpace: "nowrap" }}
                  onClick={this.openModal.bind(this, "add", null)}
                >
                  Добавить
                </Button>
              </Grid>

              <Grid
                className="sklad_storage"
                size={{
                  xs: 12,
                  sm: 8,
                }}
                sx={{
                  mb: 5,
                }}
              >
                {!this.state.list ? null : (
                  <Table>
                    <TableHead>
                      <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                        <TableCell>#</TableCell>
                        <TableCell>Сортировка</TableCell>
                        <TableCell>Название</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {this.state.list.map((item, key) => (
                        <TableRow key={key}>
                          <TableCell>{key + 1}</TableCell>
                          <TableCell className="tableCellInput">
                            <MyTextInput
                              label=""
                              value={item.sort}
                              func={this.changeSort.bind(this, key)}
                              onBlur={this.saveSort.bind(this, item.id)}
                            />
                          </TableCell>
                          <TableCell
                            onClick={this.openModal.bind(this, "edit", item.id)}
                            style={{ color: "#c03", fontWeight: 700, cursor: "pointer" }}
                          >
                            {item.name}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Grid>
            </CustomTabPanel>
            <CustomTabPanel
              value={this.state.activeTab}
              index={1}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  style={{ whiteSpace: "nowrap" }}
                  onClick={this.openModalAS.bind(this, "add", null)}
                >
                  Добавить
                </Button>
              </Grid>

              <Grid
                className="sklad_storage"
                size={{
                  xs: 12,
                  sm: 8,
                }}
                sx={{
                  mb: 5,
                }}
              >
                {!this.state.accounting_system ? null : (
                  <Table>
                    <TableHead>
                      <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                        <TableCell>#</TableCell>
                        <TableCell>Сортировка</TableCell>
                        <TableCell>Название</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {this.state.accounting_system.map((item, key) => (
                        <TableRow key={key}>
                          <TableCell>{key + 1}</TableCell>
                          <TableCell className="tableCellInput">
                            <MyTextInput
                              label=""
                              value={item.sort}
                              func={this.changeSort.bind(this, key)}
                              onBlur={this.saveSort.bind(this, item.id)}
                            />
                          </TableCell>
                          <TableCell
                            onClick={this.openModalAS.bind(this, "edit", item.id)}
                            style={{ color: "#c03", fontWeight: 700, cursor: "pointer" }}
                          >
                            {item.name}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Grid>
            </CustomTabPanel>
          </Box>
        </Grid>
      </>
    );
  }
}

export default function SkladStorage() {
  return <SkladStorage_ />;
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
