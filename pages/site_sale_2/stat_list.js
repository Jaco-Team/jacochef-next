import React from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import { MyDatePickerNew } from "@/ui/Forms";
import Typography from "@mui/material/Typography";

import dayjs from "dayjs";

import { api_laravel } from "@/src/api_new";
import { formatDate } from "@/src/helpers/ui/formatDate";

class SiteSale2_StatList_ extends React.Component {
  click = false;

  constructor(props) {
    super(props);

    this.state = {
      module: "site_sale_2",
      module_name: "",
      is_load: false,

      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),

      promo_list: [],
    };
  }

  async componentDidMount() {
    let data = await this.getData("get_spam_list");

    console.log(data);

    this.setState({
      module_name: data.module_info.name,
      spam_list: data.spam_list,
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

  async show() {
    let data = {
      spam_id: this.state.spam_id,
    };

    let res = await this.getData("get_spam_data", data);

    console.log(res);

    this.setState({
      spam_list_data: res.spam_list,
      spam_list_data_stat: res.stat,
    });
  }

  async getUsers() {
    let data = {
      dateStart: dayjs(this.state.date_start).format("YYYY-MM-DD"),
      dateEnd: dayjs(this.state.date_end).format("YYYY-MM-DD"),
    };

    let res = await this.getData("get_promo_users", data);

    this.setState({
      promo_list: res.promo_list,
    });
  }

  changeDateRange(data, event) {
    this.setState({
      [data]: event,
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
        <Grid
          container
          style={{ marginTop: "80px", paddingLeft: "24px" }}
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
            container
            direction="row"
            style={{ paddingTop: 20 }}
            spacing={3}
          >
            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <MyDatePickerNew
                label="Дата от"
                value={this.state.date_start}
                func={this.changeDateRange.bind(this, "date_start")}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <MyDatePickerNew
                label="Дата до"
                value={this.state.date_end}
                func={this.changeDateRange.bind(this, "date_end")}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <Button
                variant="contained"
                onClick={this.getUsers.bind(this)}
              >
                Обновить
              </Button>
            </Grid>
          </Grid>

          <Grid
            style={{ marginTop: 20 }}
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            {this.state.promo_list.map((item, key) => (
              <Accordion
                key={key}
                style={{ width: "100%" }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{item.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Table
                    size={"small"}
                    style={{ marginTop: 15 }}
                  >
                    <TableBody>
                      {item.promo_list.map((promo, k) => (
                        <TableRow
                          key={k}
                          style={{
                            backgroundColor: parseInt(promo.is_delete) == 1 ? "#c03" : "white",
                            color: parseInt(promo.is_delete) == 1 ? "white" : "black",
                          }}
                        >
                          <TableCell style={{ color: "inherit" }}>{k + 1}</TableCell>
                          <TableCell
                            style={{
                              color: "inherit",
                              backgroundColor: parseInt(promo.count) == 0 ? "green" : "#c03",
                            }}
                          >
                            {promo.name}
                          </TableCell>
                          <TableCell style={{ color: "inherit" }}>{promo.coment}</TableCell>
                          <TableCell style={{ color: "inherit" }}>
                            {parseInt(promo.count) == 0 ? <CheckIcon /> : <CloseIcon />}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            ))}
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function SiteSale2_StatList() {
  return <SiteSale2_StatList_ />;
}
