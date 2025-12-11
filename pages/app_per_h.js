import React from "react";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { api_laravel, api_laravel_local } from "@/src/api_new";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccordionDetails from "@mui/material/AccordionDetails";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { ModalAccept } from "@/components/general/ModalAccept";
import MyAlert from "@/ui/MyAlert";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { Close } from "@mui/icons-material";
import { MyAutocomplite, MySelect, MyTextInput } from "@/ui/Forms";
dayjs.locale("ru");

class AppPerH_ extends React.Component {
  constructor(props) {
    super(props);
    const getDateCoefs = () => {
      const today = dayjs();
      const currentDate = today.date();

      const getPeriodName = (start, end) => {
        if (start.date() === 1 && end.date() === 15) {
          return `с 1 по 15 ${end.format("D MMMM YYYY").replace(/^\d+\s/, "")} г.`; // no D makes nominative
        } else {
          return `с ${start.format("D")} по ${end.format("D MMMM YYYY")} г.`;
        }
      };

      if (currentDate <= 15) {
        const period1Start = today.startOf("month");
        const period1End = today.date(15);

        const period2Start = today.date(16);
        const period2End = today.endOf("month");

        const nextMonth = today.add(1, "month");
        const period3Start = nextMonth.startOf("month");
        const period3End = nextMonth.date(15);

        return [
          {
            id: 1,
            name: getPeriodName(period1Start, period1End),
            value: period1Start.format("YYYY-MM-DD"),
            end_date: period1End.format("YYYY-MM-DD"),
          },
          {
            id: 2,
            name: getPeriodName(period2Start, period2End),
            value: period2Start.format("YYYY-MM-DD"),
            end_date: period2End.format("YYYY-MM-DD"),
          },
          {
            id: 3,
            name: getPeriodName(period3Start, period3End),
            value: period3Start.format("YYYY-MM-DD"),
            end_date: period3End.format("YYYY-MM-DD"),
          },
        ];
      } else {
        const period1Start = today.date(16);
        const period1End = today.endOf("month");

        const nextMonth = today.add(1, "month");
        const period2Start = nextMonth.startOf("month");
        const period2End = nextMonth.date(15);

        const period3Start = nextMonth.date(16);
        const period3End = nextMonth.endOf("month");

        return [
          {
            id: 1,
            name: getPeriodName(period1Start, period1End),
            value: period1Start.format("YYYY-MM-DD"),
            end_date: period1End.format("YYYY-MM-DD"),
          },
          {
            id: 2,
            name: getPeriodName(period2Start, period2End),
            value: period2Start.format("YYYY-MM-DD"),
            end_date: period2End.format("YYYY-MM-DD"),
          },
          {
            id: 3,
            name: getPeriodName(period3Start, period3End),
            value: period3Start.format("YYYY-MM-DD"),
            end_date: period3End.format("YYYY-MM-DD"),
          },
        ];
      }
    };
    this.state = {
      module: "app_per_h",
      module_name: "",
      is_load: false,
      points: [],
      point: "",
      point_chose: [],
      items: [],
      openAlert: false,
      err_status: true,
      err_text: "",
      dateCoefs: getDateCoefs(),
      dateCoef: null,
      deleteItem: {},
      openDelete: false,
      confirmDialog: false,
      app_history: {},
      coefDialog: false,
      k_pizza: "",
      k_rolls: "",
    };
  }

  async componentDidMount() {
    const data = await this.getData("get_all");
    const point = {
      point_id: data.points[0].id,
    };

    const res = await this.getData("get_one", point);

    this.setState({
      items: res.lavel_price,
      points: data.points,
      point: data.points[0],
      k_pizza: res.ps?.k_pizza,
      k_rolls: res.ps?.k_rolls,
      module_name: data.module_info.name,
      app_history: res.app_history,
    });

    document.title = data.module_info.name;
  }

  getData = (method, data = {}, dop_type = {}) => {
    this.setState({
      is_load: true,
    });

    return api_laravel(this.state.module, method, data, dop_type)
      .then((result) => {
        return result.data;
      })
      .finally(() => {
        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 500);
      });
  };

  async changeCity(data, event, value) {
    const datas = {
      point_id: event.id,
    };

    const res = await this.getData("get_one", datas);

    this.setState({
      point: event,
      items: res.lavel_price,
      app_history: res.app_history,
      k_pizza: res.ps?.k_pizza,
      k_rolls: res.ps?.k_rolls,
    });
  }

  changeItem(data, id, event) {
    const items = this.state.items;

    items.forEach((item) => {
      if (parseInt(item.app_id) === parseInt(id)) {
        item[data] = event.target.value;
      }
    });

    this.setState({
      items,
    });
  }

  async save() {
    const { items, point_chose, k_pizza, k_rolls } = this.state;
    const dateStart = this.state.dateCoefs.find((item) => item.id == this.state.dateCoef);
    const data = {
      points: point_chose,
      app_list: items,
      dateStart,
      k_pizza,
      k_rolls,
    };

    await this.getData("save_edit", data);

    this.setState(
      {
        openAlert: true,
        err_status: true,
        err_text: "Обновлено",
      },
      () => {
        (this.update(), this.setState({ confirmDialog: false }));
      },
    );
  }

  async update() {
    const { point } = this.state;

    const data = {
      point_id: point,
    };

    const res = await this.getData("get_one", data);

    this.setState({
      items: res.lavel_price,
      app_history: res.app_history,
      k_pizza: res.ps?.k_pizza,
      k_rolls: res.ps?.k_rolls,
    });
  }

  changeCoef(data, event) {
    this.setState({
      dateCoef: event.target.value,
    });
  }

  async saveLevel(data) {
    const res = await this.getData("del_history", this.state.deleteItem);
    this.setState(
      {
        openAlert: true,
        err_status: true,
        err_text: "Обновлено",
      },
      () => this.update(),
    );
  }

  render() {
    const {
      is_load,
      items,
      openAlert,
      err_text,
      err_status,
      module_name,
      points,
      point,
      point_chose,
    } = this.state;
    const itemsInGraph = items.filter((value) => value.is_graph === 1);
    const itemsNotGraph = items.filter((value) => value.is_graph === 0);
    const { openDelete } = this.state;
    return (
      <>
        <Backdrop
          style={{ zIndex: 99 }}
          open={is_load}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <MyAlert
          isOpen={openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={err_status}
          text={err_text}
        />
        {openDelete && (
          <ModalAccept
            open={openDelete}
            onClose={() => this.setState({ openDelete: false })}
            title="Удалить запись?"
            save={() => {
              this.saveLevel();
              this.setState({ openDelete: false });
            }}
          />
        )}
        {/*Модалка с кэфом бонуса и пмериодом*/}
        {this.state.confirmDialog ? (
          <Dialog
            open={this.state.confirmDialog}
            onClose={() => this.setState({ confirmDialog: false })}
            maxWidth="sm"
          >
            <DialogTitle>
              Подтвердите действие
              <IconButton
                onClick={() => this.setState({ confirmDialog: false })}
                style={{ cursor: "pointer", position: "absolute", top: 0, right: 0, padding: 20 }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent
              align="center"
              sx={{ fontWeight: "bold" }}
            >
              <MySelect
                label="Период"
                style={{ marginTop: "10px" }}
                is_none={false}
                data={this.state.dateCoefs || []}
                value={this.state.dateCoef || ""}
                func={this.changeCoef.bind(this, "dateCoef")}
                fullWidth
              />
              <MyAutocomplite
                label="Кафе"
                style={{ marginTop: "10px" }}
                multiple={true}
                data={points}
                value={point_chose}
                func={(event, value) => this.setState({ point_chose: value })}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => this.setState({ confirmDialog: false })}>Отмена</Button>
              <Button onClick={this.save.bind(this)}>Сохранить</Button>
            </DialogActions>
          </Dialog>
        ) : null}
        <Grid
          container
          spacing={3}
          className="container_first_child"
          sx={{
            mb: 3,
          }}
        >
          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <h1>{module_name}</h1>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyAutocomplite
              label="Кафе"
              multiple={false}
              data={points}
              value={point}
              func={this.changeCity.bind(this)}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 9,
            }}
          >
            <Button
              onClick={() => this.setState({ confirmDialog: true })}
              variant="contained"
              style={{ marginRight: "10px", marginBottom: "10px" }}
            >
              Выбрать период
            </Button>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyTextInput
              label="Коэф. пиццы для бонуса"
              style={{ marginTop: "10px" }}
              value={this.state.k_pizza || ""}
              func={(e) => this.setState({ k_pizza: e.target.value })}
              type="number"
              step="0.01"
              onWheel={(e) => e.target.blur()}
              fullWidth
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyTextInput
              label="Коэф. роллов для бонуса"
              style={{ marginTop: "10px" }}
              value={this.state.k_rolls || ""}
              func={(e) => this.setState({ k_rolls: e.target.value })}
              type="number"
              onWheel={(e) => e.target.blur()}
              step="0.01"
              fullWidth
            />
          </Grid>

          <SectionHeader title="В графике работы" />
          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <SalaryTable
              items={itemsInGraph}
              onChange={this.changeItem.bind(this)}
            />
          </Grid>
          <SectionHeader title="Без графика" />
          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <SalaryTable
              items={itemsNotGraph}
              onChange={this.changeItem.bind(this)}
            />
          </Grid>
          {Object.entries(this.state.app_history).length ? (
            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              <Accordion style={{ width: "100%" }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography style={{ fontWeight: "bold" }}>История изменений</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(this.state.app_history).map(([k, it]) => (
                        <TableRow
                          hover
                          key={k}
                        >
                          <TableCell>
                            <Accordion style={{ width: "100%" }}>
                              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography style={{ fontWeight: "bold" }}>{k}</Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Table>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>#</TableCell>
                                      <TableCell>Точка</TableCell>
                                      <TableCell>Дата изменения</TableCell>
                                      <TableCell>Дата создания</TableCell>
                                      <TableCell style={{ textAlign: "center" }}>Оклад</TableCell>
                                      <TableCell style={{ textAlign: "center" }}>
                                        Минимальная ставка
                                      </TableCell>
                                      <TableCell style={{ textAlign: "center" }}>
                                        Максимальная ставка
                                      </TableCell>
                                      <TableCell style={{ textAlign: "center" }}>
                                        Средняя ставка
                                      </TableCell>
                                      <TableCell style={{ textAlign: "center" }}>Изменил</TableCell>
                                      <TableCell style={{ textAlign: "center" }}></TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {it.map((app, i) => (
                                      <TableRow
                                        hover
                                        key={i}
                                      >
                                        <TableCell>{i + 1}</TableCell>
                                        <TableCell>{app.city_name}</TableCell>
                                        <TableCell>{app.date_start}</TableCell>
                                        <TableCell>{app.date_update}</TableCell>
                                        <TableCell>{app.oklad}</TableCell>
                                        <TableCell>{app.min_price}</TableCell>
                                        <TableCell>{app.max_price}</TableCell>
                                        <TableCell>{app.avg_price}</TableCell>
                                        <TableCell>{app.creator}</TableCell>
                                        <TableCell>
                                          {app.date_start >
                                          dayjs(new Date()).format("YYYY-MM-DD") ? (
                                            <IconButton
                                              size="small"
                                              onClick={() => {
                                                this.setState({
                                                  deleteItem: app,
                                                  openDelete: true,
                                                });
                                              }}
                                              sx={{
                                                color: "text.secondary",
                                                "&:hover": {
                                                  color: "error.main",
                                                },
                                              }}
                                            >
                                              <DeleteIcon fontSize="small" />
                                            </IconButton>
                                          ) : null}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </AccordionDetails>
                            </Accordion>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            </Grid>
          ) : null}
        </Grid>
      </>
    );
  }
}

export default function AppPerH() {
  return <AppPerH_ />;
}

const tableCellStyles = {
  "#": { width: "5%" },
  Должность: { width: "35%" },
  Оклад: { width: "15%" },
  "Минимальная ставка": { width: "15%" },
  "Средняя ставка": { width: "15%" },
  "Максимальная ставка": { width: "15%" },
};

const SalaryTable = ({ items, onChange }) => {
  const fields = ["oklad", "min_price", "avg_price", "max_price"];
  const fieldLabels = ["Оклад", "Минимальная ставка", "Средняя ставка", "Максимальная ставка"];

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {Object.entries(tableCellStyles).map(([label, style]) => (
              <TableCell
                key={label}
                style={style}
              >
                {label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {items.length > 0 ? (
            items.map((item, index) => (
              <TableRow
                key={item.app_id}
                hover
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.app_name}</TableCell>
                {fields.map((field) => (
                  <TableCell key={`${item.app_id}-${field}`}>
                    <MyTextInput
                      label=""
                      value={item[field]}
                      func={onChange.bind(this, field, item.app_id)}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={6}
                align="center"
              >
                Нет данных
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const SectionHeader = ({ title }) => (
  <Grid
    size={{
      xs: 12,
      sm: 12,
    }}
  >
    <Typography
      variant="h5"
      component="h1"
      gutterBottom
    >
      {title}
    </Typography>
  </Grid>
);

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
