"use client";

import useMyAlert from "@/src/hooks/useMyAlert";
import MyAlert from "@/ui/MyAlert";
import TestAccess from "@/ui/TestAccess";
import { Backdrop, Box, CircularProgress, Grid, Paper, Tab, Tabs, Typography } from "@mui/material";
import useDDSStore from "./useDDSStore";
import { api_laravel } from "@/src/api_new";
import { useEffect, useState } from "react";

import a11yProps from "@/ui/TabPanel/a11yProps";
import TabPanel from "@/ui/TabPanel/TabPanel";

import TabList from "./tabs/TabList";
import TabSettings from "./tabs/TabSettings";

export default function DDS() {
  const { isAlert, showAlert, closeAlert, alertStatus, alertMessage } = useMyAlert();
  const { setStateKey, is_load, module, module_name } = useDDSStore();
  const setState = useDDSStore.setState;

  const [currentTab, setCurrentTab] = useState(0);

  const TABS = [
    {
      id: 0,
      key: "list",
      name: "Таблица",
      component: (
        <TabList
          getData={getData}
          showAlert={showAlert}
        />
      ),
    },
    {
      id: 1,
      key: "settings",
      name: "Настройки",
      component: (
        <TabSettings
          getData={getData}
          showAlert={showAlert}
        />
      ),
    },
  ];

  async function getBaseData() {
    const data = await getData("get_all");
    if (!data) {
      showAlert("Ошибка получения данных");
      return;
    }

    setState({
      access: data.acces,
      points: data.points,
      point: [],
      articles: data.articles,
      module_name: data.module_info.name,
    });

    document.title = data.module_info.name;
  }

  async function getData(method, data = {}) {
    setStateKey("is_load", true);

    const res = api_laravel(module, method, data)
      .then((result) => result.data)
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        setTimeout(() => {
          setStateKey("is_load", false);
        }, 500);
      });

    return res;
  }

  useEffect(() => {
    getBaseData();
  }, []);

  return (
    <>
      <Backdrop
        sx={{ zIndex: (theme) => theme.zIndex.modal + 2 }}
        open={is_load}
      >
        <CircularProgress />
      </Backdrop>

      {/* <TestAccess
        access={access}
        setAccess={(access) => setStateKey("acces", { ...acces })}
      /> */}

      <MyAlert
        isOpen={isAlert}
        onClose={closeAlert}
        status={alertStatus}
        text={alertMessage}
      />

      <Grid
        container
        spacing={3}
        mb={3}
        className="container_first_child"
      >
        <Grid size={12}>
          <Typography variant="h5">{module_name}</Typography>
        </Grid>
        <Grid size={12}>
          <Paper>
            <Tabs
              value={currentTab}
              onChange={(_, id) => setCurrentTab(+id || 0)}
              variant="scrollable"
              scrollButtons={false}
            >
              {TABS.map((tab) => (
                <Tab
                  {...a11yProps(tab.key)}
                  key={tab.key}
                  value={tab.id}
                  label={tab.name}
                  sx={{ minWidth: "fit-content", flex: 1 }}
                />
              ))}
            </Tabs>
          </Paper>

          {TABS.map((tab) => (
            <TabPanel
              key={tab.key}
              value={currentTab}
              index={tab.id}
              id={tab.key}
            >
              {tab.component}
            </TabPanel>
          ))}
        </Grid>
      </Grid>
    </>
  );
}
