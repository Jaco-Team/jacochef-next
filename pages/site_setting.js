import React from "react";
import Grid from "@mui/material/Grid";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import { MyAlert, MySelect } from "@/ui/elements";

import { api_laravel } from "@/src/api_new";
import { SiteSettingSocial } from "@/components/site_setting/SiteSettingSocial";

class SiteSetting_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "site_setting",
      module_name: "",
      is_load: false,

      cities: [],
      city_id: 0,

      fullScreen: false,

      data: null,
      modalDialog: false,
      method: "",

      openAlert: false,
      error: {status: true, text: ''}
    };
  }

  async componentDidMount() {
    const data = await this.getData("get_all");

    this.setState({
      data,
      cities: data.cities,
      module_name: data.module_info.name,
    });

    document.title = data.module_info.name;
  }

  getData = (method, data = {}) => {
    this.setState({
      is_load: true,
    });

    const res = api_laravel(this.state.module, method, data)
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

  changeCity(event) {
    let data = event.target.value;
    this.setState({
      city_id: data,
      dataInfo: null,
    });
  }

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

  showAlert(error) {
    this.setState({ openAlert: true, err_status: error.status, err_text: error.text });
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
 {/* <SiteSettingModal
        open={modal}
        onClose={setModal(false)}
        mark={this.state.mark}
        item={this.state.item}
        method={this.state.method}
        itemName={this.state.pageName}
        fullScreen={this.state.fullScreen}
        save={this.save.bind(this)}
      /> */}

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
            <MySelect
              data={this.state.cities}
              value={this.state.city_id}
              func={this.changeCity.bind(this)}
              label="Город"
              is_none={false}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={12}
          >
            <SiteSettingSocial
              cityId={this.state.city_id}
              parentModule={this.state.module}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={12}
            mb={5}
          >
            {!this.state.pages ? null : (
              <Table>
                <TableHead>
                  <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                    <TableCell>#</TableCell>
                    <TableCell>Название</TableCell>
                    <TableCell>Адрес</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {this.state.pages.map((item, key) => (
                    <TableRow key={key}>
                      <TableCell>{key + 1}</TableCell>
                      <TableCell
                        onClick={this.openModal.bind(this, "edit", item.id)}
                        style={{ color: "#c03", fontWeight: 700, cursor: "pointer" }}
                      >
                        {item.name}
                      </TableCell>
                      <TableCell>{item.link}</TableCell>
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

export default function SiteSetting() {
  return <SiteSetting_ />;
}

export async function getServerSideProps({ res }) {
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
