import React from "react";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import { MyTextInput, MySelect } from "@/ui/Forms";

import { api_laravel_local, api_laravel } from "@/src/api_new";
import MyAlert from "@/ui/MyAlert";

class AppWorkPoint_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "app_work_point",
      module_name: "",
      is_load: false,

      points: [],
      point_id: 0,

      apps: [],
      app_id: 0,

      allList: [],
      allListRender: [],
      thisList: [],

      openAlert: false,
      err_status: true,
      err_text: "",
    };
  }

  async componentDidMount() {
    let data = await this.getData("get_all");

    this.setState(
      {
        module_name: data.module_info.name,
        points: data.points,
        point_id: data.points[0].id,
        apps: data.apps,
        app_id: data.apps[0].id,
      },
      () => {
        this.getWorks();
      },
    );

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

  changeApp(event) {
    this.setState(
      {
        app_id: event.target.value,
      },
      () => {
        this.getWorks();
      },
    );
  }

  async getWorks() {
    let data = {
      point_id: this.state.point_id,
      app_id: this.state.app_id,
    };

    let res = await this.getData("get_works", data);

    this.setState(
      {
        allList: res.all_work,
        thisList: res.this_work,
      },
      () => {
        this.checkList();
      },
    );
  }

  checkList() {
    const { allList, thisList } = this.state;

    const thisListIds = new Set(thisList.map((item) => Number(item.id)));

    const allListRender = allList.filter((item) => !thisListIds.has(Number(item.id)));

    this.setState({ allListRender });
  }

  add(id, name) {
    let thisList = [...this.state.thisList];
    let allList = this.state.allList;

    let check = thisList.find((item) => parseInt(item.id) === parseInt(id));
    let thisItem = allList.find((item) => parseInt(item.id) === parseInt(id));

    if (!check && thisItem) {
      thisList.push({ id, name, dop_time: 0, time_min: thisItem.time_min });
    }

    this.setState({ thisList }, this.checkList);
  }

  del(id) {
    const new_arr = this.state.thisList.filter((item) => parseInt(item.id) !== parseInt(id));

    this.setState({ thisList: new_arr }, this.checkList);
  }

  async save() {
    let data = {
      point_id: this.state.point_id,
      app_id: this.state.app_id,
      items: this.state.thisList,
    };

    let fake_item = null;

    this.state.thisList.map((item) => {
      if (item.dop_time.length == 0) {
        fake_item = item;
      }
    });

    // console.log(fake_item  )

    if (fake_item) {
      this.openAlert(false, 'У позиции "' + fake_item.name + '" не указано доп время');

      return;
    }

    let res = await this.getData("save", data);

    //console.log( res )

    this.openAlert(res.st, res.text);

    if (res.st) {
      this.getWorks();
    }
  }

  changeDopTime(key, event) {
    let raw = event.target.value;

    let digitsOnly = raw.replace(/\D/g, "");

    let value = digitsOnly === "" ? 0 : parseInt(digitsOnly, 10);
    value = Math.max(0, value);

    this.setState((prev) => {
      const newList = [...prev.thisList];
      newList[key] = {
        ...newList[key],
        dop_time: value,
      };
      return { thisList: newList };
    });
  }

  openAlert = (status, text) => {
    this.setState({
      openAlert: true,
      err_status: status,
      err_text: text,
    });
  };

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
            <MySelect
              is_none={false}
              data={this.state.points}
              value={this.state.point_id}
              func={(event) => {
                this.setState({ point_id: event.target.value });
              }}
              label="Точка"
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MySelect
              is_none={false}
              data={this.state.apps}
              value={this.state.app_id}
              func={this.changeApp.bind(this)}
              label="Должность"
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 2,
            }}
          >
            <Button
              variant="contained"
              onClick={this.getWorks.bind(this)}
            >
              Обновить данные
            </Button>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <Button
              onClick={this.save.bind(this)}
              color="success"
              variant="contained"
              style={{ whiteSpace: "nowrap" }}
            >
              Сохранить изменения
            </Button>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
            sx={{
              mb: 5,
            }}
          >
            <List style={{ width: "100%" }}>
              {this.state.allListRender.map((item, key) => (
                <ListItem
                  key={key}
                  style={{ borderBottom: "1px solid #e5e5e5" }}
                >
                  <ListItemText primary={item.name} />
                  <SendIcon onClick={this.add.bind(this, item.id, item.name)} />
                </ListItem>
              ))}
            </List>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
            sx={{
              mb: 5,
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Наименование</TableCell>
                  <TableCell>Основное время</TableCell>
                  <TableCell>Доп время (в минутах)</TableCell>
                  <TableCell>
                    <CloseIcon />
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {this.state.thisList.map((item, key) => (
                  <TableRow key={key}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.time_min} мин.</TableCell>
                    <TableCell>
                      <MyTextInput
                        value={item.dop_time}
                        func={this.changeDopTime.bind(this, key)}
                        label=""
                      />
                    </TableCell>
                    <TableCell>
                      <CloseIcon
                        onClick={this.del.bind(this, item.id, item.name)}
                        style={{ cursor: "pointer" }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function AppWorkPoint() {
  return <AppWorkPoint_ />;
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
