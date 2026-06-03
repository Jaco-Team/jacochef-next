import React from "react";

import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import a11yProps from "@/ui/TabPanel/a11yProps";

export default function StatSaleTabs({ activeTab, fullScreen, onChange, canAccess }) {
  return (
    <Paper>
      <Tabs
        value={activeTab}
        onChange={onChange}
        variant={fullScreen ? "scrollable" : "fullWidth"}
        scrollButtons={false}
      >
        {canAccess("sale") && (
          <Tab
            label="Продажи"
            {...a11yProps(0)}
            sx={{ minWidth: "fit-content", flex: 1 }}
          />
        )}
        {canAccess("client") && (
          <Tab
            label="Клиенты"
            {...a11yProps(1)}
            sx={{ minWidth: "fit-content", flex: 1 }}
          />
        )}
        {canAccess("dynamic") && (
          <Tab
            label="Динамика"
            {...a11yProps(2)}
            sx={{ minWidth: "fit-content", flex: 1 }}
          />
        )}
        {canAccess("sale_dynamic") && (
          <Tab
            label="Динамика продаж"
            {...a11yProps(3)}
            sx={{ minWidth: "fit-content", flex: 1 }}
          />
        )}
        {(canAccess("setting_sale") ||
          canAccess("setting_clients") ||
          canAccess("setting_citizens") ||
          canAccess("setting_limits") ||
          canAccess("setting_limits_pay")) && (
          <Tab
            label="Настройки"
            {...a11yProps(4)}
            sx={{ minWidth: "fit-content", flex: 1 }}
          />
        )}
      </Tabs>
    </Paper>
  );
}
