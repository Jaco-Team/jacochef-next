import React from "react";

import Link from "next/link";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";

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

import { MySelect, MyTextInput } from "@/ui/Forms";
import Typography from "@mui/material/Typography";

import queryString from "query-string";

class SiteSaleMin_ extends React.Component {
  click = false;

  constructor(props) {
    super(props);

    this.state = {
      module: "site_sale_min",
      module_name: "",
      is_load: false,
      modalText: "",

      modalDialog: false,
      modalLink: "",

      city_list: [],
      city_id: "",
      promoName: "",

      findPromoList: [],
    };
  }

  async componentDidMount() {
    let data = await this.getData("get_all");

    this.setState({
      module_name: data.module_info.name,
      city_list: data.all_city_list,
    });

    document.title = data.module_info.name;
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

        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 300);
      });
  };

  async showPromoList() {
    let data = {
      city_id: this.state.city_id,
      promo_name: this.state.promoName,
    };

    let res = await this.getData("search_promo", data);

    console.log(res);

    this.setState({
      findPromoList: res,
    });
  }

  async delPromo(promo_id) {
    let check = confirm("Удалить промокод ?");

    if (check) {
      let data = {
        promo_id: promo_id,
      };

      let res = await this.getData("remove_promo", data);

      setTimeout(() => {
        this.showPromoList();
      }, 300);
    }
  }

  // <Link href={"/site_sale_min/new"} style={{ zIndex: 10 }}>
  //   <Button variant="contained">Новый промокод</Button>
  // </Link>

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
          open={this.state.modalDialog}
          onClose={() => {
            this.setState({ modalDialog: false, modalLink: "" });
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Результат операции</DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Typography>{this.state.modalText}</Typography>
            <br />
            {this.state.modalLink == "" ? null : (
              <a
                href={this.state.modalLink}
                style={{ color: "red" }}
              >
                Скачать
              </a>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              onClick={() => {
                this.setState({ modalDialog: false });
              }}
            >
              Хорошо
            </Button>
          </DialogActions>
        </Dialog>
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
            <h1>Промокоды контакт-центр</h1>
          </Grid>

          <Grid
            container
            direction="row"
            style={{ paddingTop: 20 }}
            spacing={3}
            sx={{
              justifyContent: "center",
            }}
          >
            <Grid
              size={{
                xs: 12,
              }}
            >
              <Link
                href={"/site_sale_min/stat_list"}
                style={{ zIndex: 10, marginLeft: 20 }}
              >
                <Button variant="contained">Выписанные промокоды</Button>
              </Link>
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <MySelect
                is_none
                data={this.state.city_list}
                value={this.state.city_id}
                func={(event) => {
                  this.setState({ city_id: event.target.value });
                }}
                label="Город"
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <MyTextInput
                value={this.state.promoName}
                func={(event) => {
                  this.setState({ promoName: event.target.value });
                }}
                label="Промокод"
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <Button
                variant="contained"
                onClick={this.showPromoList.bind(this)}
              >
                Найти
              </Button>
            </Grid>
          </Grid>

          <Grid
            container
            direction="row"
            style={{ paddingTop: 20 }}
            spacing={3}
            sx={{
              justifyContent: "center",
            }}
          >
            <Grid
              size={{
                xs: 12,
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Промокод</TableCell>
                    <TableCell>Город</TableCell>
                    <TableCell>Было кол-во</TableCell>
                    <TableCell>Ост. кол-во</TableCell>
                    <TableCell>Дата окончания</TableCell>
                    <TableCell>Описание</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.findPromoList.map((item, key) => (
                    <TableRow key={key}>
                      <TableCell>
                        <Link
                          href={"/site_sale_min/edit/" + item.id}
                          style={{
                            zIndex: 10,
                            textDecoration: "none",
                            color: "rgba(0, 0, 0, 0.87)",
                          }}
                        >
                          {item.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {parseInt(item.city_id) == 0 ? "Все города" : item.city_name}
                      </TableCell>
                      <TableCell>{item.def_count}</TableCell>
                      <TableCell>{item.count}</TableCell>
                      <TableCell>{item.date2}</TableCell>
                      <TableCell>{item.coment}</TableCell>
                      <TableCell>
                        {" "}
                        <CloseIcon
                          style={{ cursor: "pointer" }}
                          onClick={this.delPromo.bind(this, item.id)}
                        />{" "}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Grid>
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function SiteSaleMin() {
  return <SiteSaleMin_ />;
}
