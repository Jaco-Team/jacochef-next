import React from "react";

import PropTypes from "prop-types";
import { api_laravel } from "@/src/api_new";
import {
  Backdrop,
  Box,
  CircularProgress,
  Grid,
  Paper,
  Tab,
  Tabs,
} from "@mui/material";
import CookCatsTab from "@/components/show_cook/CookCatsTab";
import CookItemModal from "@/components/show_cook/CookItemModal";
import CookRecipesTab from "@/components/show_cook/CookRecipesTab";
import CookPfTab from "@/components/show_cook/CookPfTab";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

class ShowCook_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "show_cook",
      module_name: "",
      is_load: false,

      modalDialog: false,
      itemsEdit: null,

      stage_1: [],
      stage_2: [],
      stage_3: [],

      activeTab: 0,

      pf: [],
      rec: [],
      cats: [],
    };
  }

  async componentDidMount() {
    let res = await this.getData("get_all");

    this.setState({
      pf: res.pf,
      rec: res.rec,
      cats: res.cats,
      module_name: res.module_info.name,
    });
    document.title = res.module_info.name;
  }

  getData(method, data = {}) {
    this.setState({
      is_load: true,
    });

    let res = api_laravel(this.state.module, method, data)
      .then((result) => result.data)
      .catch((e) => {
        console.error("Fetch error: ", e);
      })
      .finally(() => {
        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 500);
      });
    return res;
  }

  async openItem(id) {
    const data = { id };
    try {
      const res = await this.getData("get_one", data);
      if (!res) throw new Error("empty response");
      this.setState({
        itemsEdit: res.item,
        stage_1: res.stage_1,
        stage_2: res.stage_2,
        stage_3: res.stage_3,
        modalDialog: true,
      });
    } catch (e) {
      console.error("Error fetching item: ", e);
    }
  }

  changeTab(_, val) {
    this.setState({
      activeTab: +val,
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

          {!!this.state.itemsEdit && (
            <CookItemModal
              isOpened={this.state.modalDialog}
              onClose={() => this.setState({ modalDialog: false, itemsEdit: null })}
              itemsEdit={this.state.itemsEdit}
              stage_1={this.state.stage_1}
              stage_2={this.state.stage_2}
              stage_3={this.state.stage_3}
            />
          )}

          <Grid
            item
            xs={12}
            sm={12}
            style={{ marginBottom: 24 }}
          >
            <Paper>
              <Tabs
                value={this.state.activeTab}
                onChange={this.changeTab.bind(this)}
                centered
                variant="fullWidth"
              >
                <Tab
                  label="Товары"
                  {...a11yProps(0)}
                />
                <Tab
                  label="Рецепты"
                  {...a11yProps(1)}
                />
                <Tab
                  label="Сроки хранения"
                  {...a11yProps(2)}
                />
              </Tabs>
            </Paper>
          </Grid>

          <Grid
            item
            xs={12}
            sm={12}
            style={{ paddingTop: 0, paddingBottom: "40px" }}
          >
            <TabPanel
              value={this.state.activeTab}
              index={0}
              id="items"
              style={{ width: "auto", display: "flex", justifyContent: "center" }}
            >
              <CookCatsTab cats={this.state.cats} openItem={async (id) => await this.openItem(id)} />
            </TabPanel>
          </Grid>

          <Grid
            item
            xs={12}
            sm={12}
            style={{ paddingTop: 0, paddingBottom: "40px" }}
          >
            <TabPanel
              value={this.state.activeTab}
              index={1}
              id="rec"
            >
              <CookRecipesTab rec={this.state.rec} />
            </TabPanel>
          </Grid>

          <Grid
            item
            xs={12}
            sm={12}
            style={{ paddingTop: 0, paddingBottom: "40px" }}
          >
            <TabPanel
              value={this.state.activeTab}
              index={2}
              id="pf"
              style={{ width: "auto", display: "flex", justifyContent: "center" }}
            >
              <CookPfTab pf={this.state.pf} />
            </TabPanel>
          </Grid>
        </Grid>
      </>
    );
  }
}

export default function ShowCook() {
  return <ShowCook_ />;
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
