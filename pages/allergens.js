import React from "react";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import { MyAlert } from "@/ui/elements";

import { api_laravel } from "@/src/api_new";
import AllergensModal from "@/components/allergens/AllergensModal";

class Allergens_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "allergens",
      module_name: "",
      is_load: false,

      fullScreen: false,

      allergens: null,
      item: null,
      itemName: "",

      modalDialog: false,
      method: "",
      mark: "",

      openAlert: false,
      err_status: true,
      err_text: "",
    };
  }

  async componentDidMount() {
    const data = await this.getData("get_all");

    this.setState({
      allergens: data.allergens,
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

  openModal(mark, id) {
    this.handleResize();

    if (mark === "add") {
      this.setState({
        mark,
        item: { name: "", dop_name: "" },
        modalDialog: true,
        method: "Новый аллерген",
      });
    }

    if (mark === "edit") {
      const { allergens } = this.state;

      const page = allergens.find((item) => item.id === id);

      this.setState({
        mark,
        item: JSON.parse(JSON.stringify(page)),
        pageName: page.name,
        modalDialog: true,
        method: "Редактирование аллергена",
      });
    }
  }

  async save(data) {
    const mark = this.state.mark;

    let res;

    if (mark === "add") {
      res = await this.getData("save_new", data);
    }

    if (mark === "edit") {
      res = await this.getData("save_edit", data);
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

  async update() {
    const data = await this.getData("get_all");
    this.setState({
      allergens: data.allergens,
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

        <AllergensModal
          open={this.state.modalDialog}
          onClose={() => this.setState({ modalDialog: false, itemName: "", method: "" })}
          mark={this.state.mark}
          item={this.state.item}
          method={this.state.method}
          itemName={this.state.itemName}
          fullScreen={this.state.fullScreen}
          save={this.save.bind(this)}
        />

        <Grid
          container
          spacing={3}
          className="container_first_child"
        >
          <Grid
            item
            xs={12}
            sm={12}
          >
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid
            item
            xs={12}
            sm={12}
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
            item
            xs={12}
            sm={12}
            mb={5}
          >
            {!this.state.allergens ? null : (
              <Table>
                <TableHead>
                  <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                    <TableCell>#</TableCell>
                    <TableCell>Название</TableCell>
                    <TableCell>Доп. название</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {this.state.allergens.map((item, key) => (
                    <TableRow key={key}>
                      <TableCell>{key + 1}</TableCell>
                      <TableCell
                        onClick={this.openModal.bind(this, "edit", item.id)}
                        style={{ color: "#c03", fontWeight: 700, cursor: "pointer" }}
                      >
                        {item.name}
                      </TableCell>
                      <TableCell>{item.dop_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function Allergens() {
  return <Allergens_ />;
}

export async function getServerSideProps({ req, res, query }) {
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=3600");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT");

  return {
    props: {},
  };
}
