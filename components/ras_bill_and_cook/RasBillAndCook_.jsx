"use client";

import { Component } from "react";

import {
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { MySelect, MyDatePickerNew } from "@/components/shared/Forms";

import dayjs from "dayjs";
import { api_laravel } from "@/src/api_new";
import { formatNumber } from "@/src/helpers/utils/i18n";
import { formatDate } from "@/src/helpers/ui/formatDate";
import MyAlert from "../shared/MyAlert";

export default class RasBillAndCook_ extends Component {
  click = false;

  constructor(props) {
    super(props);

    const data = props.initialData?.data || null;
    this.state = {
      module: "ras_bill_and_cook",
      module_name: data?.module_info?.name || "",
      is_load: false,

      points: data?.points || [],
      point: data?.point || [],

      rev_list: data?.rev_list || [],
      rev: data?.rev || null,
      cats: [],

      date_end: formatDate(new Date()),

      openAlert: false,
      err_status: true,
      err_text: "",
    };
  }

  async componentDidMount() {
    if (!this.props.initialData) {
      // console.log(`SSR failed, fetching`);
      const data = await this.getData("get_all");
      if (!data?.st) {
        this.showAlert(data?.text || "Ошибка при получении базовых данных");
        return;
      }
      this.setState({
        points: data?.points,
        point: data?.points?.[0].id,
        module_name: data?.module_info?.name,
      });

      setTimeout(() => {
        this.changePoint({ target: { value: data.points[0].id } });
      }, 300);
    }
    document.title = this.state.module_name;
  }

  showAlert = (message, status = false) => {
    this.setState({
      openAlert: true,
      err_status: status,
      err_text: message,
    });
    setTimeout(() => {
      this.setState({
        openAlert: false,
      });
    }, 3000);
  };

  async getData(method, data = {}) {
    this.setState({
      is_load: true,
    });
    try {
      const response = await api_laravel(this.state.module, method, data);
      if (!response?.data) {
        throw new Error("API error, no data");
      }
      return response.data;
    } catch (e) {
      this.showAlert(e.message || "Ошибка");
    } finally {
      this.setState({
        is_load: false,
      });
    }
  }

  async updateData() {
    const data = {
      point_id: this.state.point,
      rev_start: this.state.rev,
      date_end: dayjs(this.state.date_end).format("YYYY-MM-DD"),
    };

    const res = await this.getData("show", data);
    if (!res?.st) {
      this.showAlert(res?.text || "Ошибка получения данных");
      return;
    }
    console.log(res);

    this.setState({
      cats: res.cats,
    });
  }

  async changePoint(event) {
    let point = event.target.value;

    let data = {
      point_id: point,
    };

    let res = await this.getData("get_rev_list", data);

    this.setState({
      point: point,
      rev_list: res,
      rev: res[0].id,
    });
  }

  async changeRev(event) {
    let rev = event.target.value;

    this.setState({
      rev: rev,
    });
  }

  changeDate(data) {
    this.setState({
      date_end: data,
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
            size={12}
          >
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid
           size={{ xs: 12, sm: 4 }}
          >
            <MySelect
              is_none={false}
              data={this.state.points}
              value={this.state.point || ''}
              func={this.changePoint.bind(this)}
              label="Точка"
            />
          </Grid>

          <Grid
            size={{ xs: 12, sm: 4 }}
          >
            <MySelect
              is_none={false}
              data={this.state.rev_list}
              value={this.state.rev || ''}
              func={this.changeRev.bind(this)}
              label="Ревизия"
            />
          </Grid>

          <Grid
            size={{ xs: 12, sm: 4 }}
          >
            <MyDatePickerNew
              label="Дата до"
              value={this.state.date_end}
              func={this.changeDate.bind(this)}
            />
          </Grid>

          <Grid
            size={{ xs: 12, sm: 6 }}
          >
            <Button
              variant="contained"
              onClick={this.updateData.bind(this)}
            >
              Обновить данные
            </Button>
          </Grid>

          <Grid
            size={12}
          >
            {this.state.cats.map((item, key) => (
              <Accordion key={key}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{item.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {item.cats.map((cat, key_cat) => (
                    <Accordion key={key_cat}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>{cat.name}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell style={{ width: "5%" }}>#</TableCell>

                              <TableCell style={{ width: "20%" }}>Товар</TableCell>
                              <TableCell style={{ width: "20%" }}>Ревизия</TableCell>

                              <TableCell style={{ width: "15%" }}>Кол-во по накладным</TableCell>
                              <TableCell style={{ width: "15%" }}>Кол-во по продажам</TableCell>

                              <TableCell style={{ width: "15%" }}>Разница</TableCell>
                              <TableCell style={{ width: "10%" }}>Ед. измер</TableCell>
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            {cat.items?.map((it, k) => (
                              <TableRow key={k}>
                                <TableCell>{k + 1}</TableCell>
                                <TableCell>{it.name}</TableCell>
                                <TableCell>{formatNumber(it.count_rev, 0, 2)}</TableCell>
                                <TableCell>{formatNumber(it.count_bill, 0, 2)}</TableCell>
                                <TableCell>{formatNumber(it.count_ras, 0, 2)}</TableCell>
                                <TableCell>{formatNumber(it.count_res, 0, 2)}</TableCell>
                                <TableCell>{it.ei_name}</TableCell>
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
          </Grid>
        </Grid>
      </>
    );
  }
}
