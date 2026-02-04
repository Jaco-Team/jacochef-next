import React from "react";

import { MyTextInput } from "@/ui/Forms";
// import { api_laravel_local as api_laravel } from "@/src/api_new";
import { api_laravel } from "@/src/api_new";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AppointmentModal from "@/components/appointment/AppointmentModal";
import AppointmentUnitModal from "@/components/appointment/AppointmentUnitModal";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { ModalAdd } from "@/components/general/ModalAdd";
import { ModalAccept } from "@/components/general/ModalAccept";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import Paper from "@mui/material/Paper";
import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";
import MyAlert from "@/ui/MyAlert";

class Appointment_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "appointment",
      module_name: "",
      access: null,

      modalDialog: false,
      modalUnit: false,
      method: "",
      item: [],
      fullScreen: false,
      itemEdit: {},
      itemEditName: "",
      modalUsers: false,
      pr: [],

      is_load: false,

      openAlert: false,
      err_status: true,
      err_text: "",

      confirmDialog: false,
      items: [],
      units: [],
      unitsWithItems: [],

      openApp: null,
      openUnit: null,
      full_menu: [],

      modalCopy: false,
      modalDelete: false,
      new_app: "",

      // dataSelect: [
      //   {id: false, name: 'Без активности'},
      //   {id: 'show', name: 'Показывать'},
      //   {id: 'edit', name: 'Редактировать'},
      // ],
    };
  }

  async componentDidMount() {
    const data = await this.getData("get_all");
    if (!data) return;
    this.setState({
      module_name: data.module_info.name,
      access: data.access,
      items: data.apps,
      units: data.units,
    });

    document.title = data.module_info.name;
  }

  componentDidUpdate(_, prevState) {
    if (prevState.units !== this.state.units || prevState.items !== this.state.items) {
      this.groupItemsByUnits();
      // this.applyAppsSortingChangeUI();
    }
  }

  getData = async (method, data = {}) => {
    this.setState({
      is_load: true,
    });
    try {
      const response = await api_laravel(this.state.module, method, data);
      if (!response) throw new Error("Server error");
      const res = response?.data;
      return res;
    } catch (e) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: e.message || "Ошибка сервера",
      });
    } finally {
      setTimeout(() => {
        this.setState({
          is_load: false,
        });
      }, 500);
    }
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

  async saveSort() {
    let data = {
      app_list: this.state.items,
    };

    let res = await this.getData("save_sort", data);

    if (res.st) {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

      this.updateList();
    }
  }

  changeItem(data, id, event) {
    let items = this.state.items;

    items.forEach((item) => {
      if (parseInt(item.id) === parseInt(id)) {
        item[data] = event.target.value;
      }
    });

    this.setState({
      items,
    });
  }

  async updateList() {
    const res = await this.getData("get_all");
    if (!res?.st) {
      this.setState({
        openAlert: true,
        err_status: res?.st,
        err_text: res.text || "Ошибка сервера",
      });
      return;
    }
    this.setState({
      unitsWithItems: null,
      items: res.apps,
      units: res.units,
    });
  }

  async openModal(id) {
    this.handleResize();
    const data = {
      app_id: id,
    };

    const res = await this.getData("get_one", data);

    this.setState({
      modalDialog: true,
      openApp: res.appointment,
      full_menu: res.full_menu,
      method: "Редактирование должности",
    });
  }

  async saveEdit(app, full_menu) {
    const data = {
      app,
      full_menu,
    };

    const res = await this.getData("save_edit", data);

    if (res.st === false) {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    } else {
      this.setState({
        modalDialog: false,
        openApp: null,
        full_menu: [],
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

      this.updateList();
    }
  }

  async saveNew(app, full_menu) {
    const data = {
      app,
      full_menu,
    };

    const res = await this.getData("save_new", data);

    if (res.st === false) {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    } else {
      this.setState({
        modalDialog: false,
        openApp: null,
        full_menu: [],
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

      this.updateList();
    }
  }

  async saveUnit(unit) {
    const res = await this.getData("save_unit", { unit });

    this.setState({
      openAlert: true,
      err_status: res?.st,
      err_text: res?.st ? res?.text : "Ошибка",
    });

    if (res.st) {
      this.setState({
        modalUnit: false,
        openUnit: null,
      });
      await this.updateList();
    }
  }

  async openNewApp() {
    this.handleResize();

    const res = await this.getData("get_all_for_new");

    this.setState({
      modalDialog: true,
      openApp: res.appointment,
      full_menu: res.full_menu,
      method: "Новая должность",
    });
  }

  copyModalItem = async (item) => {
    this.setState({
      itemEdit: item,
      itemEditName: `${item.name}_копия`,
      modalCopy: true,
    });
  };

  deleteModalItem = async (item) => {
    const result = await this.getData("get_all_delete", { item });
    if (result.pr?.length) {
      this.setState({
        itemEdit: item,
        modalUsers: true,
        pr: result.pr,
      });
    } else {
      this.setState({
        itemEdit: item,
        modalDelete: true,
      });
    }
  };

  saveCopy = async (name) => {
    const result = await this.getData("copy", { item: this.state.itemEdit, name });
    if (result.st) {
      this.setState({
        openAlert: true,
        err_status: true,
        err_text: "Успешно скопирован",
        modalCopy: false,
      });
      const res = await this.getData("get_all");
      this.setState({
        unitsWithItems: null,
        items: res.apps,
        units: res.units,
      });
    }
  };

  saveDelete = async () => {
    const result = await this.getData("delete", { item: this.state.itemEdit });
    this.setState({
      openAlert: true,
      err_status: true,
      err_text: "Успешно удален",
      modalDelete: false,
    });
    const res = await this.getData("get_all");
    this.setState({
      unitsWithItems: null,
      items: res.apps,
      units: res.units,
    });
  };

  async openUnitModal(unit_id = null, e) {
    if (!this.canView("units")) return;

    e.stopPropagation();
    this.handleResize();
    const unit = {
      name: "",
      sort: null,
      apps: [],
    };

    if (unit_id !== null) {
      const data = {
        unit_id,
      };
      const result = await this.getData("get_unit", data);
      if (!result?.st) {
        this.setState({
          openAlert: true,
          err_status: false,
          err_text: result?.text || "Ошибка",
        });
        return;
      }
      if (result.unit) {
        unit.id = result.unit.id;
        unit.name = result.unit.name;
        unit.sort = result.unit.sort;
        unit.apps = result.unit.apps;
      }
    }

    this.setState({
      modalUnit: true,
      openUnit: unit,
      method: "Новый отдел",
    });
  }

  groupItemsByUnits() {
    const { units, items } = this.state;

    const unitMap = units?.reduce((acc, unit) => {
      acc[unit.id] = { ...unit, items: [] };
      return acc;
    }, {});

    const unassigned = [];

    // Distribute apps into units or unassigned
    items.forEach((item) => {
      if (unitMap[item.unit_id]) {
        unitMap[item.unit_id].items.push(item);
      } else {
        unassigned.push(item);
      }
    });

    const unitsWithItems = Object.values(unitMap).sort((a, b) => a.sort - b.sort);

    if (unassigned.length > 0) {
      unitsWithItems.push({
        id: null,
        name: "Без отдела",
        sort: 9999,
        items: unassigned,
      });
    }
    this.setState({ unitsWithItems });
  }

  applyAppsSortingChangeUI() {
    const { unitsWithItems } = this.state;
    if (!unitsWithItems?.length) return;
    const sortedUnits = [...unitsWithItems]
      .sort((a, b) => a.sort - b.sort)
      .map((unit) => ({
        ...unit,
        items: [...sortAppointmentsListKindSort(unit.items)],
      }));
    this.setState({ unitsWithItems: sortedUnits });
  }

  canView(key) {
    const { userCan } = handleUserAccess(this.state?.access);
    return userCan("view", key);
  }

  canEdit(key) {
    const { userCan } = handleUserAccess(this.state?.access);
    return userCan("edit", key);
  }

  render() {
    const { unitsWithItems } = this.state;
    return (
      <>
        <Backdrop
          style={{ zIndex: 99 }}
          open={this.state.is_load}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <Grid
          container
          spacing={3}
          className="container_first_child"
          sx={{
            mb: 3,
            mt: 10,
          }}
        >
          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
            sx={{ paddingTop: "16px" }}
          >
            <h1>{this.state.module_name}</h1>
          </Grid>
          {this.state.modalUsers ? (
            <Dialog
              sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
              maxWidth="xs"
              open={this.state.modalUsers}
              onClose={() => this.setState({ modalUsers: false })}
            >
              <DialogTitle>Список пользователей с должностью</DialogTitle>
              <DialogContent
                align="center"
                sx={{ fontWeight: "bold" }}
              >
                <TableContainer>
                  <Table
                    stickyHeader
                    aria-label="sticky table"
                  >
                    <TableHead>
                      <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                        <TableCell>#</TableCell>
                        <TableCell>Пользователь</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {this.state.pr
                        .filter((it) => it.short_name)
                        .map((it, key) => (
                          <TableRow key={key}>
                            <TableCell>{key + 1}</TableCell>
                            <TableCell>{it.short_name}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </DialogContent>
              <DialogActions>
                <Button
                  autoFocus
                  onClick={() => this.setState({ modalUsers: false })}
                >
                  Закрыть
                </Button>
              </DialogActions>
            </Dialog>
          ) : null}

          <MyAlert
            isOpen={this.state.openAlert}
            onClose={() => this.setState({ openAlert: false })}
            status={this.state.err_status}
            text={this.state.err_text}
          />
          <ModalAdd
            open={this.state.modalCopy}
            onClose={() => {
              this.setState({ modalCopy: false });
            }}
            title={`Скопировть ${this.state.itemEdit.name}`}
            save={this.saveCopy}
            defaultValue={this.state.itemEditName}
          />
          <ModalAccept
            open={this.state.modalDelete}
            onClose={() => {
              this.setState({ modalDelete: false });
            }}
            save={this.saveDelete}
            title={`Удалить ${this.state.itemEdit.name}`}
          />

          <AppointmentModal
            open={this.state.modalDialog}
            onClose={() => this.setState({ modalDialog: false, openApp: null })}
            item={this.state.openApp}
            units={this.state.units}
            full_menu={this.state.full_menu}
            fullScreen={this.state.fullScreen}
            save={
              parseInt(this.state.openApp?.id) == -1
                ? this.saveNew.bind(this)
                : this.saveEdit.bind(this)
            }
            method={this.state.method}
            canEdit={this.canEdit.bind(this)}
            canView={this.canView.bind(this)}
          />

          <AppointmentUnitModal
            open={this.state.modalUnit}
            onClose={() => this.setState({ modalUnit: false, openUnit: null })}
            unit={this.state.openUnit}
            apps={this.state.items}
            fullScreen={this.state.fullScreen}
            save={this.saveUnit.bind(this)}
            method={this.state.method}
            canEdit={this.canEdit.bind(this)}
            canView={this.canView.bind(this)}
          />

          <Grid
            style={{ display: "flex", gap: "1em" }}
            size={{
              xs: 12,
            }}
            sx={{
              mb: 1,
            }}
          >
            {this.canEdit("app") && this.canEdit("app_create") && (
              <Button
                variant="outlined"
                onClick={this.openNewApp.bind(this)}
              >
                Новая должность
              </Button>
            )}
            {this.canEdit("units") && this.canEdit("unit_create") && (
              <Button
                variant="contained"
                onClick={this.openUnitModal.bind(this, null)}
              >
                Добавить отдел
              </Button>
            )}
          </Grid>
          <Grid
            size={{
              xs: 12,
            }}
            sx={{
              mb: 1,
            }}
          >
            {unitsWithItems?.map((unit) => (
              <Accordion
                defaultExpanded={unit.id !== null}
                key={`u_${unit.id}`}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box style={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography style={{ paddingBlock: ".666em", marginRight: 20 }}>
                      {unit.name}
                    </Typography>
                    {unit.id !== null && this.canEdit("units") && (
                      <IconButton
                        component="span"
                        onClick={(e) => this.openUnitModal(unit.id, e)}
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow key={`unit_${unit.id}`}>
                          <TableCell style={{ width: "1%" }}>#</TableCell>
                          <TableCell style={{ width: "49%" }}>Должность</TableCell>
                          <TableCell style={{ width: "5%" }}>Старшенство</TableCell>
                          <TableCell style={{ width: "5%" }}>Сортировка</TableCell>
                          <TableCell style={{ width: "5%" }}></TableCell>
                          <TableCell style={{ width: "5%" }}></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {unit.items?.map((item, key) => {
                          return (
                            <TableRow
                              key={key}
                              hover
                            >
                              <TableCell style={{ width: "1%" }}>{key + 1}</TableCell>
                              <TableCell
                                onClick={
                                  this.canView("app") ? this.openModal.bind(this, item.id) : null
                                }
                                style={{ cursor: "pointer", fontWeight: "bold" }}
                              >
                                {item.name}
                              </TableCell>
                              <TableCell>
                                <MyTextInput
                                  type="number"
                                  label=""
                                  value={item.kind}
                                  disabled={!this.canEdit("app")}
                                  func={this.changeItem.bind(this, "kind", item.id)}
                                  onBlur={() => this.applyAppsSortingChangeUI()}
                                />
                              </TableCell>
                              <TableCell>
                                <MyTextInput
                                  type="number"
                                  inputProps={{ min: 0 }}
                                  label=""
                                  value={item.sort}
                                  disabled={!this.canEdit("app")}
                                  func={this.changeItem.bind(this, "sort", item.id)}
                                  onBlur={() => this.applyAppsSortingChangeUI()}
                                />
                              </TableCell>
                              <TableCell>
                                <IconButton onClick={() => this.copyModalItem(item)}>
                                  <ContentCopyIcon style={{ color: "blue" }} />
                                </IconButton>
                              </TableCell>
                              <TableCell>
                                <IconButton onClick={() => this.deleteModalItem(item)}>
                                  <DeleteIcon style={{ color: "red" }} />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            ))}
          </Grid>

          <Grid
            size={{
              xs: 12,
            }}
            sx={{
              mb: 1,
            }}
          >
            <Button
              color="primary"
              variant="contained"
              onClick={this.saveSort.bind(this)}
              disabled={!this.canEdit("app")}
            >
              Сохранить сортировку
            </Button>
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function Appointment() {
  return <Appointment_ />;
}

export async function getServerSideProps({ res }) {
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

function sortAppointmentsListKindSort(items) {
  return [...items].sort((a, b) => {
    // If kind is numeric
    if (typeof a.kind === "number" && typeof b.kind === "number") {
      if (a.kind !== b.kind) return a.kind - b.kind;
    }
    // If kind is string
    else if (typeof a.kind === "string" && typeof b.kind === "string") {
      const cmp = a.kind.localeCompare(b.kind);
      if (cmp !== 0) return cmp;
    }
    // fallback if one is undefined or mixed types
    else {
      if (a.kind == null) return 1;
      if (b.kind == null) return -1;
      return String(a.kind).localeCompare(String(b.kind));
    }
    return a.sort - b.sort;
  });
}
