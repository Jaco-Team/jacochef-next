"use client";

import {
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";

import {
  JacoAlert,
  JacoAutocomplete,
  JacoBackdropLoader,
  JacoButton,
  JacoCityCafe,
  JacoDatePicker,
  JacoIconButton,
  JacoSurface,
  uiColors,
} from "@/design-system/shared/ui";

import dayjs from "dayjs";

// import { api_laravel_local as api_laravel } from '@/src/api_new';
import { api_laravel } from "@/src/api_new";
import { formatNumber } from "@/src/helpers/utils/i18n";

import { Component, Fragment } from "react";
import { ExpandMore } from "@mui/icons-material";
import { formatDate } from "@/src/helpers/ui/formatDate";

export default class RasByBill_ extends Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "ras_by_bill",
      module_name: "",
      access: null,
      is_load: false,

      modalDialog: false,

      openAlert: false,
      err_status: true,
      err_text: "",

      points: [],
      point: [],
      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),
      rangeDate: [formatDate(new Date()), formatDate(new Date())],
      items: [],
      cats: [],
      items_cat: [],
      item_cat: null,

      myItems: [],

      calendar: [],
      openSuppliers: {},
    };
  }

  async componentDidMount() {
    const data = await this.getData("get_all");
    if (!data) {
      this.showAlert("Ошибка получения исходных данных");
      return;
    }
    this.setState({
      module_name: data.module_info.name,
      points: data.points,
      items: data.items,
      cats: data.cats,
      items_cat: data.items_cat,
    });

    document.title = data.module_info.name;
  }

  showAlert(text, status = false) {
    this.setState({
      openAlert: true,
      err_text: text,
      err_status: status,
    });
    setTimeout(() => {
      this.setState({
        openAlert: false,
      });
    }, 10000);
  }

  async getData(method, data = {}) {
    try {
      this.setState({ is_load: true });
      const result = await api_laravel(this.state.module, method, data);
      if (!result) throw new Error("Api call failed");
      return result.data;
    } catch (e) {
      this.showAlert(e.message || "text");
    } finally {
      this.setState({ is_load: false });
    }
  }

  changeItems(event, data) {
    this.setState({
      myItems: data,
    });
  }

  async getItems() {
    if (!this.state.point?.length) {
      this.showAlert("Выберите кафе");
      return;
    }
    const data = {
      points: this.state.point,
      items: this.state.myItems,
      item_cat: this.state.item_cat,
      start_date: dayjs(this.state.date_start).format("YYYY-MM-DD"),
      end_date: dayjs(this.state.date_end).format("YYYY-MM-DD"),
    };

    const res = await this.getData("get_this_rev", data);

    if (!res?.st) {
      this.showAlert(res?.text || "Ошибка");
      return;
    }

    let summ = 0;

    res.items_ras.map((item, key) => {
      summ += parseFloat(item.sum);
    });

    this.setState({
      resItems: {
        items_ras: res.items_ras,
        pf_ras: res.pf_ras,
        rec_ras: res.rec_ras,
        full_sum: summ.toFixed(2),
      },
      catItems: null,
      openSuppliers: {},
    });
  }

  async getCats() {
    if (!this.state.point?.length) {
      this.showAlert("Выберите кафе");
      return;
    }
    const data = {
      points: this.state.point,
      items: this.state.myItems,
      start_date: dayjs(this.state.date_start).format("YYYY-MM-DD"),
      end_date: dayjs(this.state.date_end).format("YYYY-MM-DD"),
    };

    const res = await this.getData("get_this_rev_cat", data);

    if (!res?.st) {
      this.showAlert(res?.text || "Ошибка");
      return;
    }

    let summ = 0;

    res.rec_ras.map((item, key) => {
      summ += parseFloat(item.this_price);
    });

    this.setState({
      catItems: {
        count_pos: res.count_pos,
        items_ras: res.items_ras,
        rec_ras: res.rec_ras,
        full_sum: summ.toFixed(2),
      },
      resItems: null,
    });
  }

  changeDateRange(data, event) {
    this.setState({
      [data]: event,
    });
  }

  canAccess = (property) => handleUserAccess(this.state.access)?.userCan("access", property);
  canView = (property) => handleUserAccess(this.state.access)?.userCan("view", property);
  canEdit = (property) => handleUserAccess(this.state.access)?.userCan("edit", property);

  render() {
    return (
      <>
        <JacoBackdropLoader open={this.state.is_load} />
        <JacoAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
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
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <JacoCityCafe
              points={this.state.points}
              value={this.state.point}
              onChange={(points) => this.setState({ point: points })}
              label="Кафе"
              placeholder="Выберите кафе"
              withAll={this.state.points.length > 0}
              withOrganizationMode={false}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <JacoDatePicker
              label="Дата от"
              value={this.state.date_start}
              onChange={this.changeDateRange.bind(this, "date_start")}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <JacoDatePicker
              label="Дата до"
              value={this.state.date_end}
              onChange={this.changeDateRange.bind(this, "date_end")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <JacoAutocomplete
              options={this.state.items_cat}
              isOptionEqualToValue={(option, value) => Number(option.id) === Number(value.id)}
              multiple={false}
              disableCloseOnSelect={false}
              value={this.state.item_cat || null}
              onChange={(_, value) => {
                this.setState({ item_cat: value });
              }}
              label="Категория товара"
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <JacoAutocomplete
              options={this.state.items}
              isOptionEqualToValue={(option, value) => Number(option.id) === Number(value.id)}
              multiple
              disableCloseOnSelect
              filterSelectedOptions
              value={this.state.myItems}
              onChange={this.changeItems.bind(this)}
              label="Заготовки"
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <JacoButton
              variant="contained"
              onClick={this.getItems.bind(this)}
            >
              Показать заготовки
            </JacoButton>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <JacoButton
              variant="contained"
              onClick={this.getCats.bind(this)}
            >
              Показать категории
            </JacoButton>
          </Grid>

          {this.state.resItems && this.state.resItems.items_ras ? (
            <>
              <Grid
                size={{
                  xs: 12,
                }}
              >
                <h1>Куплено по накладным</h1>
                <TableContainer component={JacoSurface}>
                  <Table aria-label="a dense table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Наименование товара</TableCell>
                        <TableCell>Объем товара</TableCell>
                        <TableCell>Объем заготовки</TableCell>
                        <TableCell>Сумма</TableCell>
                        <TableCell>Кол-во накладных</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {this.state.resItems.items_ras.map((item) => (
                        <Fragment key={item.item_id}>
                          <TableRow>
                            <TableCell>
                              <JacoIconButton
                                sx={{ mr: 0.5 }}
                                aria-label={`${this.state.openSuppliers[item.item_id] ? "Скрыть" : "Показать"} поставщиков: ${item.name}`}
                                aria-expanded={Boolean(this.state.openSuppliers[item.item_id])}
                                onClick={() =>
                                  this.setState((state) => ({
                                    openSuppliers: {
                                      ...state.openSuppliers,
                                      [item.item_id]: !state.openSuppliers[item.item_id],
                                    },
                                  }))
                                }
                              >
                                <ExpandMore />
                              </JacoIconButton>
                              {item.name}
                            </TableCell>
                            <TableCell>
                              {formatNumber(item.count_item)} {item.ei_name}
                            </TableCell>
                            <TableCell>
                              {formatNumber(item.count_pf)} {item.ei_name_pf}
                            </TableCell>
                            <TableCell>{formatNumber(item.sum)}</TableCell>
                            <TableCell>{formatNumber(item.count_bill, 0, 0)}</TableCell>
                          </TableRow>
                          {this.state.openSuppliers[item.item_id] && (
                            <>
                              <TableRow sx={{ bgcolor: uiColors.warningSoft }}>
                                <TableCell
                                  component="th"
                                  scope="col"
                                  sx={{ pl: 6 }}
                                >
                                  Поставщик
                                </TableCell>
                                <TableCell />
                                <TableCell />
                                <TableCell />
                                <TableCell />
                              </TableRow>
                              {item.suppliers?.length ? (
                                item.suppliers.map((supplier) => (
                                  <TableRow
                                    key={supplier.vendor_id ?? "unknown"}
                                    sx={{ bgcolor: uiColors.warningSoft }}
                                  >
                                    <TableCell sx={{ pl: 6 }}>{supplier.name}</TableCell>
                                    <TableCell>
                                      {formatNumber(supplier.count_item)} {item.ei_name}
                                    </TableCell>
                                    <TableCell />
                                    <TableCell>{formatNumber(supplier.sum)}</TableCell>
                                    <TableCell>{formatNumber(supplier.count_bill, 0, 0)}</TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow sx={{ bgcolor: uiColors.warningSoft }}>
                                  <TableCell
                                    colSpan={5}
                                    sx={{ pl: 6 }}
                                  >
                                    Нет данных о поставщиках
                                  </TableCell>
                                </TableRow>
                              )}
                            </>
                          )}
                        </Fragment>
                      ))}

                      <TableRow>
                        <TableCell> Всего: </TableCell>
                        <TableCell> </TableCell>
                        <TableCell> </TableCell>
                        <TableCell> {this.state.resItems.full_sum} </TableCell>
                        <TableCell> </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              {this.state.resItems.pf_ras?.length > 0 && (
                <Grid
                  size={{
                    xs: 12,
                  }}
                >
                  <h1>Расход заготовок (включая рецепты)</h1>
                  <TableContainer component={JacoSurface}>
                    <Table aria-label="a dense table">
                      <TableHead>
                        <TableRow>
                          <TableCell>Наименование заготовки</TableCell>
                          <TableCell>Объем заготовок</TableCell>
                          <TableCell>Кол-во роллов</TableCell>
                          <TableCell>Сумма роллов (примерно)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {this.state.resItems.pf_ras.map((item, key) => (
                          <TableRow key={key}>
                            <TableCell> {item.pf_name} </TableCell>
                            <TableCell>
                              {" "}
                              {formatNumber(item.count_pf) + " " + item.ei_name}{" "}
                            </TableCell>
                            <TableCell> {formatNumber(item.count_rolls)} </TableCell>
                            <TableCell> {formatNumber(item.price_rolls)} </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              )}
              {this.state.resItems.rec_ras?.length > 0 && (
                <Grid
                  size={{
                    xs: 12,
                  }}
                >
                  <h1>Расход рецептов</h1>
                  <TableContainer component={JacoSurface}>
                    <Table aria-label="a dense table">
                      <TableHead>
                        <TableRow>
                          <TableCell>Наименование заготовки</TableCell>
                          <TableCell>Объем заготовок</TableCell>
                          <TableCell>Кол-во роллов</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {this.state.resItems.rec_ras.map((item, key) => (
                          <TableRow key={key}>
                            <TableCell> {item.pf_name} </TableCell>
                            <TableCell>
                              {" "}
                              {formatNumber(item.count_pf) + " " + item.ei_name}{" "}
                            </TableCell>
                            <TableCell> {formatNumber(item.count_rolls)} </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              )}
            </>
          ) : null}

          {this.state.catItems && this.state.catItems.rec_ras ? (
            <Grid
              style={{ marginBottom: "40px" }}
              size={{
                xs: 12,
              }}
            >
              <Accordion
                disabled
                sx={{ "&.Mui-disabled": { backgroundColor: uiColors.surface, opacity: 1 } }}
              >
                <AccordionSummary>
                  <Typography style={{ width: "50%" }}>
                    Роллов: {formatNumber(this.state.catItems.count_pos.count_rolls, 0)}
                  </Typography>
                  <Typography style={{ width: "50%" }}>
                    Пиццы: {formatNumber(this.state.catItems.count_pos.count_pizza, 0)}
                  </Typography>
                </AccordionSummary>
              </Accordion>

              {this.state.catItems.rec_ras.map((item, key) => (
                <Accordion key={key}>
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-controls="panel1bh-content"
                  >
                    <Typography style={{ width: "60%" }}>{item.name}</Typography>
                    <Typography style={{ width: "20%" }}>
                      {formatNumber(item.this_price)}
                    </Typography>
                    <Typography style={{ width: "20%" }}>
                      {formatNumber(item.price_by_items)}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {item.parent_cat.map((it, k) => (
                      <Accordion key={k}>
                        <AccordionSummary
                          expandIcon={<ExpandMore />}
                          aria-controls="panel1bh-content"
                        >
                          <Typography style={{ width: "60%", paddingLeft: 20 }}>
                            {it.name}
                          </Typography>
                          <Typography style={{ width: "20%", paddingLeft: 20 }}>
                            {formatNumber(it.this_price)}
                          </Typography>
                          <Typography style={{ width: "20%", paddingLeft: 20 }}>
                            {formatNumber(it.price_by_items)}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Accordion
                            disabled
                            sx={{
                              "&.Mui-disabled": { backgroundColor: uiColors.surface, opacity: 1 },
                            }}
                          >
                            <AccordionSummary>
                              <Typography style={{ width: "20%", paddingLeft: 40 }}>
                                Товар
                              </Typography>
                              <Typography style={{ width: "20%", paddingLeft: 40 }}>
                                Товара
                              </Typography>
                              <Typography style={{ width: "20%", paddingLeft: 40 }}>
                                Заготовок
                              </Typography>
                              <Typography style={{ width: "20%", paddingLeft: 40 }}>
                                Накладных
                              </Typography>
                              <Typography style={{ width: "20%", paddingLeft: 40 }}>
                                Сумма
                              </Typography>
                            </AccordionSummary>
                          </Accordion>

                          {it.items.map((parent_items, parent_key) => (
                            <Accordion
                              key={parent_key}
                              disabled
                              sx={{
                                "&.Mui-disabled": { backgroundColor: uiColors.surface, opacity: 1 },
                              }}
                            >
                              <AccordionSummary>
                                <Typography style={{ width: "20%", paddingLeft: 40 }}>
                                  {parent_items.name}
                                </Typography>
                                <Typography style={{ width: "20%", paddingLeft: 40 }}>
                                  {formatNumber(parent_items.count_item)} {parent_items.ei_name}
                                </Typography>
                                <Typography style={{ width: "20%", paddingLeft: 40 }}>
                                  {formatNumber(parent_items.count_pf)} {parent_items.ei_name}
                                </Typography>
                                <Typography style={{ width: "20%", paddingLeft: 40 }}>
                                  {formatNumber(parent_items.count_bill, 0, 0)}
                                </Typography>
                                <Typography style={{ width: "20%", paddingLeft: 40 }}>
                                  {formatNumber(parent_items.sum)}
                                </Typography>
                              </AccordionSummary>
                            </Accordion>
                          ))}
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </AccordionDetails>
                </Accordion>
              ))}

              <Accordion
                disabled
                sx={{ "&.Mui-disabled": { backgroundColor: uiColors.surface, opacity: 1 } }}
              >
                <AccordionSummary>
                  <Typography style={{ width: "60%", marginRight: -15 }}>Всего:</Typography>
                  <Typography style={{ width: "40%" }}>
                    {formatNumber(this.state.catItems.full_sum)}
                  </Typography>
                </AccordionSummary>
              </Accordion>
            </Grid>
          ) : null}
        </Grid>
      </>
    );
  }
}
