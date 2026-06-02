import React from "react";

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
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Tooltip from "@mui/material/Tooltip";

import { MyTextInput } from "@/ui/Forms";
import TabPanel from "@/ui/TabPanel/TabPanel";
import a11yProps from "@/ui/TabPanel/a11yProps";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";

import {
  StatSale_Tab_Sett_Dynamics,
  StatSale_Tab_Sett_Dynamics_Pay,
} from "./StatSaleSettingsDynamics";
import {
  StatSale_Tab_Sett_Modal_Rate,
  StatSale_Tab_Sett_Modal_Rate_Clients,
} from "./StatSaleSettingsModals";

// ---------- Таб Настройки ----------
class StatSale_Tab_Sett extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      active_tab: 0,
      rows: this.initializeRows(),
      rows_clietns: this.initializeRows_clients(),
      rows_edit: [],
      item_id_edit: null,
      type_modal: null,
      color_edit: null,
      modalDialogRate: false,
      modalDialogRate_clients: false,
      points: [],
      value_edit: 0,
      name_row: "",
      item_type: "",
    };
  }

  componentDidMount() {
    this.get_data_rows();
    this.get_data_rows_clietns();
    this.syncActiveSettingsTab();

    if (this.props.points) {
      this.setState({ points: this.props.points });
    }
  }

  canAccess = (key) => {
    const { userCan } = handleUserAccess(this.props.acces ?? {});
    return userCan("access", key);
  };

  getSettingsTabIndexes = () => {
    const indexes = {};
    let nextIndex = 0;

    [
      "setting_sale",
      "setting_clients",
      "setting_citizens",
      "setting_limits",
      "setting_limits_pay",
    ].forEach((key) => {
      if (this.canAccess(key)) {
        indexes[key] = nextIndex;
        nextIndex += 1;
      }
    });

    return indexes;
  };

  syncActiveSettingsTab = () => {
    const availableIndexes = Object.values(this.getSettingsTabIndexes());

    if (!availableIndexes.length || availableIndexes.includes(this.state.active_tab)) {
      return;
    }

    this.setState({
      active_tab: availableIndexes[0],
    });
  };

  // Добавьте метод для сохранения динамики
  save_dynamics = async (data, points) => {
    const res = await this.props.getData("save_dynamics", { data, points });
    this.props.openAlert(res.st, res.text);

    if (res.st) {
      setTimeout(() => this.props.getDataSet(), 100);
    }
  };

  save_dynamics_pay = async (data, points) => {
    const res = await this.props.getData("save_dynamics_pay", { data, points });
    this.props.openAlert(res.st, res.text);

    if (res.st) {
      setTimeout(() => this.props.getDataSet(), 100);
    }
  };

  initializeRows() {
    return [
      { id: 1, type: "percent", data: [] },
      {
        id: 2,
        name: "1.КЛИЕНТЫ",
        fontWeight_name: "bold",
        color_name: "#fff",
        backgroundColor_name: "#B22222",
        type: "clients",
        data: [],
      },
      { id: 3, data: [] },
      {
        id: 4,
        name: "2.АКТИВНОСТЬ",
        fontWeight_name: "bold",
        color_name: "#fff",
        backgroundColor_name: "#FF8C00",
        type: "active",
        data: [],
      },
      { id: 5, data: [] },
      {
        id: 6,
        name: "3.ЧАСТОТА ЗАКАЗОВ",
        fontWeight_name: "bold",
        color_name: "#fff",
        backgroundColor_name: "#3CB371",
        type: "rate",
        data: [],
      },
      { id: 7, data: [] },
      {
        id: 8,
        name: "4.ЦЕЛИ ПО БЛЮДАМ",
        fontWeight_name: "bold",
        color_name: "#fff",
        backgroundColor_name: "#8B008B",
        data: [],
      },
      { id: 9, name: "Роллы", type: "rolls_count", data: [] },
      { id: 10, name: "Пицца", type: "pizza_count", data: [] },
      { id: 11, data: [] },
      { id: 12, name: "Роллы Х4 (город)", type: "rolls_count_city", data: [] },
      { id: 13, name: "Пицца Х4 (город)", type: "pizza_count_city", data: [] },
      { id: 14, data: [] },
      { id: 15, name: "Роллы Х8 (вся сеть)", type: "rolls_count_all", data: [] },
      { id: 16, name: "Пицца Х8 (вся сеть)", type: "pizza_count_all", data: [] },
      { id: 17, data: [] },
      {
        id: 18,
        name: "4.СРЕДНИЙ ЧЕК",
        fontWeight_name: "bold",
        color_name: "#fff",
        backgroundColor_name: "#4169E1",
        type: "avg",
        data: [],
      },
      { id: 19, name: "рейтинг", type: "rating", data: [] },
    ];
  }

  initializeRows_clients() {
    return [
      {
        id: 1,
        name: "1.КЛИЕНТЫ",
        fontWeight_name: "bold",
        color_name: "#fff",
        backgroundColor_name: "#B22222",
        type: "clients",
        data: [],
      },
      { id: 2, data: [] },
      {
        id: 3,
        name: "2.АКТИВНОСТЬ",
        fontWeight_name: "bold",
        color_name: "#fff",
        backgroundColor_name: "#FF8C00",
        type: "active",
        data: [],
      },
      { id: 4, data: [] },
      {
        id: 5,
        name: "3.ЗАКАЗЫ",
        fontWeight_name: "bold",
        color_name: "#fff",
        backgroundColor_name: "#3CB371",
        type: "orders",
        data: [],
      },
      { id: 6, data: [] },
      {
        id: 7,
        name: "4.СРЕДНИЙ ЧЕК",
        fontWeight_name: "bold",
        color_name: "#fff",
        backgroundColor_name: "#4169E1",
        type: "avg",
        data: [],
      },
    ];
  }

  componentDidUpdate(prevProps) {
    if (this.props.rows !== prevProps.rows) {
      this.get_data_rows();
    }

    if (this.props.rows_clietns !== prevProps.rows_clietns) {
      this.get_data_rows_clietns();
    }

    if (this.props.points !== prevProps.points) {
      this.setState({ points: this.props.points });
    }

    if (this.props.acces !== prevProps.acces) {
      this.syncActiveSettingsTab();
    }
  }

  changeTab = (_, val) => {
    this.setState({
      active_tab: val,
    });
  };

  openModalRate = (type_modal, id) => {
    let rows_edit = [];

    if (type_modal === "edit") {
      rows_edit = this.state.rows.reduce((acc, row) => {
        if (!row || !Array.isArray(row.data) || row.data.length === 0) {
          acc.push(row);
          return acc;
        }

        const found = row.data.find((item) => parseInt(item.id) === parseInt(id));

        if (found) {
          if (row.type === "percent") {
            this.setState({ color_edit: found.backgroundColor });
          }

          acc.push({
            ...row,
            value: found.value ?? 0,
          });
        } else {
          acc.push(row);
        }

        return acc;
      }, []);
    }

    this.setState({
      item_id_edit: id,
      rows_edit,
      type_modal,
      modalDialogRate: true,
    });
  };

  openModalRate_clients = (type_modal, name_row, item_type, id, value_edit, color_edit) => {
    this.setState({
      value_edit,
      color_edit,
      item_id_edit: id,
      type_modal,
      item_type,
      name_row: name_row
        .replace(/^\d+\./, "")
        .toLowerCase()
        .replace(/^./, (char) => char.toUpperCase()),
      modalDialogRate_clients: true,
    });
  };

  save_sett_rate_clients = async (data) => {
    if (this.state.type_modal === "edit") {
      data.id = this.state.item_id_edit;
    }

    data.type = this.state.type_modal;
    data.item_type = this.state.item_type;

    if (data.item_type === "orders") {
      const numericValue = Number(data.value);
      if (numericValue > 0 && numericValue < 1) {
        data.value = Math.round(numericValue * 100);
      }
    }

    const res = await this.props.getData("save_sett_rate_clients", data);

    this.props.openAlert(res.st, res.text);

    if (res.st) {
      setTimeout(() => this.props.getDataSet(), 100);
    }
  };

  save_sett_rate = async (data) => {
    if (this.state.type_modal === "edit") {
      data.id = this.state.item_id_edit;
    }

    data.type = this.state.type_modal;

    const res = await this.props.getData("save_sett_rate", data);

    this.props.openAlert(res.st, res.text);

    if (res.st) {
      setTimeout(() => this.props.getDataSet(), 100);
    }
  };

  get_data_rows() {
    if (!Array.isArray(this.props.rows) || this.props.rows.length === 0) return;

    const updatedRows = this.state.rows.map((row) => {
      const typeKey = row.type?.trim().toLowerCase();

      return {
        ...row,
        data: this.props.rows.map((item) => {
          let value = item[typeKey] || "";
          let value_percent = "";

          if (typeKey === "percent") {
            if (item.max_percent !== undefined && item.min_percent !== undefined) {
              value_percent = `${item.max_percent} - ${item.min_percent}`;
            } else {
              value_percent = `${item.percent} - 0`;
            }
          }

          return {
            id: item.id,
            value,
            value_percent,
            backgroundColor: typeKey === "percent" ? item.percent_color : undefined,
            fontWeight: typeKey === "percent" ? "900" : undefined,
          };
        }),
      };
    });

    this.setState({ rows: updatedRows });
  }

  get_data_rows_clietns() {
    if (!Array.isArray(this.props.rows_clietns) || this.props.rows_clietns.length === 0) return;

    const updatedRows = this.state.rows_clietns.map((row) => {
      const typeKey = row.type?.trim().toLowerCase();

      return {
        ...row,
        data: this.props.rows_clietns
          .filter((item) => item.type?.trim().toLowerCase() === typeKey)
          .map((item) => {
            if (typeKey === "orders") {
              return {
                id: item.id,
                value: item.value,
                value_range: `${item.max_value} - ${item.min_value}`,
                backgroundColor: item.value_color,
              };
            } else {
              return {
                id: item.id,
                value: item.value,
                value_range: `${item.max_value} - ${item.min_value}`,
                backgroundColor: item.value_color,
              };
            }
          }),
      };
    });

    this.setState({ rows_clietns: updatedRows });
  }

  changeItem = (index, event) => {
    let value = event.target.value;

    if (value === "") {
      value = "0";
    } else {
      value = value.replace(/^0+(?=\d)/, "");
    }

    let numericValue = Math.max(Number(value), 0);

    let points = [...this.state.points];
    points[index].count = numericValue.toString();

    this.setState({ points });
  };

  save_sett_points = async () => {
    const points = this.state.points.map((point) => ({
      ...point,
      count: Math.max(Number(point.count), 0),
    }));

    const data = {
      points,
    };

    const res = await this.props.getData("save_sett_points", data);

    this.props.openAlert(res.st, res.text);

    if (res.st) {
      setTimeout(() => this.props.getDataSet(), 100);
    }
  };

  delete_sett_rate = async () => {
    const data = {
      id: this.state.item_id_edit,
    };

    const res = await this.props.getData("delete_sett_rate", data);

    this.props.openAlert(res.st, res.text);

    if (res.st) {
      setTimeout(() => this.props.getDataSet(), 100);
    }
  };

  delete_sett_rate_clients = async () => {
    const data = {
      id: this.state.item_id_edit,
    };

    const res = await this.props.getData("delete_sett_rate_clients", data);

    this.props.openAlert(res.st, res.text);

    if (res.st) {
      setTimeout(() => this.props.getDataSet(), 100);
    }
  };

  render() {
    const { activeTab, fullScreen, openAlert, dynamics, dynamics_pay } = this.props;
    const { active_tab, rows, points, rows_clietns } = this.state;
    const settingsTabIndexes = this.getSettingsTabIndexes();

    const cellStyles = {
      name: {
        border: "1px solid #ccc",
        minHeight: "15px",
        width: "400px",
        position: "sticky",
        left: 0,
        zIndex: 20,
      },
      default: {
        border: "1px solid #ccc",
        minHeight: "15px",
        width: "150px",
      },
    };

    const maxDataLength = Math.max(...rows.map((r) => r.data?.length || 0));
    const tableWidth = Math.max(500, maxDataLength * 150 + 500);

    const maxDataLength_cliens = Math.max(...rows_clietns.map((r) => r.data?.length || 0));
    const tableWidth_clietns = Math.max(500, maxDataLength_cliens * 150 + 500);

    return (
      <>
        <StatSale_Tab_Sett_Modal_Rate
          open={this.state.modalDialogRate}
          onClose={() => this.setState({ modalDialogRate: false })}
          fullScreen={fullScreen}
          save={this.save_sett_rate.bind(this)}
          rows={this.state.rows_edit}
          type_modal={this.state.type_modal}
          color_edit={this.state.color_edit}
          openAlert={openAlert}
          delete={this.delete_sett_rate.bind(this)}
        />
        <StatSale_Tab_Sett_Modal_Rate_Clients
          open={this.state.modalDialogRate_clients}
          onClose={() =>
            this.setState({
              modalDialogRate_clients: false,
              value_edit: 0,
              type_modal: null,
              color_edit: null,
              name_row: "",
            })
          }
          fullScreen={fullScreen}
          save={this.save_sett_rate_clients.bind(this)}
          value={this.state.value_edit}
          type_modal={this.state.type_modal}
          color_edit={this.state.color_edit}
          openAlert={openAlert}
          name_row={this.state.name_row}
          delete={this.delete_sett_rate_clients.bind(this)}
        />
        <Grid
          style={{ paddingTop: 0 }}
          size={{
            xs: 12,
            sm: 12,
          }}
        >
          <TabPanel
            value={activeTab}
            index={4}
            id="clients"
          >
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
                <Paper>
                  <Tabs
                    value={active_tab}
                    onChange={this.changeTab}
                    centered
                    variant="fullWidth"
                  >
                    {this.canAccess("setting_sale") && (
                      <Tab
                        label="Коэффициенты (Продажи)"
                        {...a11yProps(settingsTabIndexes.setting_sale)}
                      />
                    )}
                    {this.canAccess("setting_clients") && (
                      <Tab
                        label="Коэффициенты (Клиенты)"
                        {...a11yProps(settingsTabIndexes.setting_clients)}
                      />
                    )}
                    {this.canAccess("setting_citizens") && (
                      <Tab
                        label="Жители (Клиенты)"
                        {...a11yProps(settingsTabIndexes.setting_citizens)}
                      />
                    )}
                    {this.canAccess("setting_limits") && (
                      <Tab
                        label="Лимиты (Динамика)"
                        {...a11yProps(settingsTabIndexes.setting_limits)}
                      />
                    )}
                    {this.canAccess("setting_limits_pay") && (
                      <Tab
                        label="Лимиты (Динамика продаж)"
                        {...a11yProps(settingsTabIndexes.setting_limits_pay)}
                      />
                    )}
                  </Tabs>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 12 }}>
                <TabPanel
                  value={active_tab}
                  index={settingsTabIndexes.setting_limits}
                  id="clients"
                >
                  <StatSale_Tab_Sett_Dynamics
                    dynamics={dynamics || []}
                    points={this.props.pointsCurrent}
                    getDataSetOne={this.props.getDataSetOne}
                    saveDynamics={this.save_dynamics}
                    openAlert={openAlert}
                  />
                </TabPanel>
              </Grid>

              <Grid size={{ xs: 12, sm: 12 }}>
                <TabPanel
                  value={active_tab}
                  index={settingsTabIndexes.setting_limits_pay}
                  id="clients"
                >
                  <StatSale_Tab_Sett_Dynamics_Pay
                    dynamics={dynamics_pay || []}
                    points={this.props.pointsCurrent}
                    getDataSetOne={this.props.getDataSetOne}
                    saveDynamics={this.save_dynamics_pay}
                    openAlert={openAlert}
                  />
                </TabPanel>
              </Grid>

              {/* Коэффициенты (Продажи) */}
              <Grid
                style={{ paddingTop: 0 }}
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <TabPanel
                  value={active_tab}
                  index={settingsTabIndexes.setting_sale}
                  id="clients"
                >
                  <Grid
                    container
                    spacing={3}
                  >
                    <Grid
                      size={{
                        xs: 12,
                        sm: 12,
                      }}
                      sx={{
                        mt: 3,
                        mb: 5,
                      }}
                    >
                      <TableContainer
                        style={{
                          overflowX: "auto",
                          maxWidth: "100%",
                          paddingBottom: 20,
                          width: tableWidth,
                        }}
                      >
                        <Table size="small">
                          <TableBody>
                            {rows.map((item, key) => (
                              <TableRow key={key}>
                                <TableCell
                                  style={{
                                    ...cellStyles.name,
                                    backgroundColor: item.backgroundColor_name || "#fff",
                                    fontWeight: item.fontWeight_name,
                                    color: item.color_name,
                                  }}
                                >
                                  {item?.name ?? "\u00A0"}
                                </TableCell>
                                {item?.data.map((it, k) => {
                                  const cellContent = (
                                    <>
                                      {item.id === 1
                                        ? it?.value_percent
                                        : it?.value
                                          ? it?.value
                                          : "\u00A0"}
                                      {[1, 2, 4].includes(item?.id) ? "%" : ""}
                                    </>
                                  );

                                  const cell = (
                                    <TableCell
                                      key={k}
                                      style={{
                                        ...cellStyles.default,
                                        backgroundColor: it?.backgroundColor || "#fff",
                                        textAlign: "center",
                                        fontWeight: it?.fontWeight || "normal",
                                        cursor: item.id === 1 ? "pointer" : "default",
                                      }}
                                      onClick={
                                        item.id === 1
                                          ? () => this.openModalRate("edit", it.id)
                                          : null
                                      }
                                    >
                                      {cellContent}
                                    </TableCell>
                                  );

                                  return item.id === 1 ? (
                                    <Tooltip
                                      key={k}
                                      title={
                                        <Typography color="inherit">
                                          Редактировать данные в столбце
                                        </Typography>
                                      }
                                    >
                                      {cell}
                                    </Tooltip>
                                  ) : (
                                    cell
                                  );
                                })}

                                {key === 0 && (
                                  <TableCell
                                    rowSpan={19}
                                    onClick={() => this.openModalRate("new", null)}
                                    style={{ border: "none" }}
                                  >
                                    <Button variant="contained">+</Button>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                </TabPanel>
              </Grid>
              {/* Коэффициенты (Продажи) */}

              {/* Коэффициенты (Клиенты) */}
              <Grid
                style={{ paddingTop: 0 }}
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <TabPanel
                  value={active_tab}
                  index={settingsTabIndexes.setting_clients}
                  id="clients"
                >
                  <Grid
                    container
                    spacing={3}
                  >
                    <Grid
                      size={{
                        xs: 12,
                        sm: 12,
                      }}
                      sx={{
                        mt: 3,
                        mb: 5,
                      }}
                    >
                      <TableContainer
                        style={{
                          overflowX: "auto",
                          maxWidth: "100%",
                          paddingBottom: 20,
                          width: tableWidth_clietns,
                        }}
                      >
                        <Table size="small">
                          <TableBody>
                            {rows_clietns.map((item, key) => (
                              <TableRow key={key}>
                                <TableCell
                                  style={{
                                    ...cellStyles.name,
                                    backgroundColor: item.backgroundColor_name || "#fff",
                                    fontWeight: item.fontWeight_name,
                                    color: item.color_name,
                                    border: item?.name ? "1px solid #ccc" : "none",
                                  }}
                                >
                                  {item?.name ?? "\u00A0"}
                                </TableCell>
                                {item?.data.map((it, k) => (
                                  <Tooltip
                                    key={k}
                                    title={
                                      <Typography color="inherit">
                                        Редактировать данные в ячейке
                                      </Typography>
                                    }
                                  >
                                    <TableCell
                                      style={{
                                        ...cellStyles.default,
                                        backgroundColor: it?.backgroundColor || "#fff",
                                        textAlign: "center",
                                        fontWeight: "900",
                                        cursor: "pointer",
                                        border: "1px solid #ccc",
                                      }}
                                      onClick={() =>
                                        this.openModalRate_clients(
                                          "edit",
                                          item.name,
                                          item.type,
                                          it.id,
                                          it.value,
                                          it.backgroundColor,
                                        )
                                      }
                                    >
                                      {it?.value_range ?? 0}
                                    </TableCell>
                                  </Tooltip>
                                ))}

                                {item?.name && (
                                  <TableCell
                                    onClick={() =>
                                      this.openModalRate_clients(
                                        "new",
                                        item.name,
                                        item.type,
                                        null,
                                        0,
                                        null,
                                      )
                                    }
                                    style={{ border: "none" }}
                                  >
                                    <Button variant="contained">+</Button>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                </TabPanel>
              </Grid>
              {/* Коэффициенты (Клиенты) */}

              {/* Жители (Клиенты) */}
              <Grid
                style={{ paddingTop: 0 }}
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <TabPanel
                  value={active_tab}
                  index={settingsTabIndexes.setting_citizens}
                  id="clients"
                >
                  <Grid
                    container
                    spacing={3}
                  >
                    <Grid
                      size={{
                        xs: 12,
                        sm: 12,
                      }}
                      sx={{
                        mt: 3,
                      }}
                    >
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>#</TableCell>
                              <TableCell>Точка</TableCell>
                              <TableCell>Количество жителей</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {points.map((item, key) => (
                              <TableRow key={key}>
                                <TableCell>{key + 1}</TableCell>
                                <TableCell>{item.addr}</TableCell>
                                <TableCell>
                                  <MyTextInput
                                    type="number"
                                    value={item.count}
                                    func={(e) => this.changeItem(key, e)}
                                    onBlur={(e) => this.changeItem(key, e)}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>

                    <Grid
                      size={{
                        xs: 12,
                        sm: 12,
                      }}
                      sx={{
                        mb: 5,
                        display: "grid",
                      }}
                    >
                      <Button
                        variant="contained"
                        color="success"
                        style={{ whiteSpace: "nowrap", justifySelf: "flex-end" }}
                        onClick={this.save_sett_points}
                      >
                        Сохранить
                      </Button>
                    </Grid>
                  </Grid>
                </TabPanel>
              </Grid>
              {/* Жители (Клиенты) */}
            </Grid>
          </TabPanel>
        </Grid>
      </>
    );
  }
}

export default StatSale_Tab_Sett;
