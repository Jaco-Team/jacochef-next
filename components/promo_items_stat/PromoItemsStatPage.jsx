"use client";

import { Backdrop, CircularProgress, Grid, Paper, Tab, Tabs } from "@mui/material";
import MyAlert from "@/ui/MyAlert";
import a11yProps from "@/ui/TabPanel/a11yProps";
import TabPanel from "@/ui/TabPanel/TabPanel";
import PromoItemsStatFilters from "./PromoItemsStatFilters";
import PromoItemsStatTable from "./PromoItemsStatTable";
import usePromoItemsStatPage from "./usePromoItemsStatPage";
import usePromoItemsStatStore from "./usePromoItemsStatStore";

export default function PromoItemsStatPage() {
  const { alert, isLoad, tab, moduleName, handleRefresh, loadPromoItems } = usePromoItemsStatPage();
  const setTab = usePromoItemsStatStore((state) => state.setTab);

  const tabs = [{ label: "Промокоды" }, { label: "Анализ" }];

  return (
    <>
      <Backdrop
        sx={{ zIndex: (theme) => theme.zIndex.modal + 2 }}
        open={isLoad}
      >
        <CircularProgress />
      </Backdrop>

      <MyAlert
        isOpen={alert.isAlert}
        onClose={alert.closeAlert}
        status={alert.alertStatus}
        text={alert.alertMessage}
      />

      <Grid
        container
        spacing={3}
        className="container_first_child"
      >
        <Grid size={12}>
          <h1>{moduleName}</h1>
        </Grid>

        <Grid size={12}>
          <PromoItemsStatFilters onRefresh={handleRefresh} />
        </Grid>

        <Grid size={12}>
          <Paper>
            <Tabs
              value={tab}
              onChange={(_, value) => setTab(value)}
              aria-label="promo items statistic tabs"
              sx={{ mb: 3 }}
            >
              {tabs.map((item, index) => (
                <Tab
                  key={item.label}
                  label={item.label}
                  {...a11yProps(index)}
                />
              ))}
            </Tabs>
          </Paper>
        </Grid>

        <Grid size={12}>
          {tabs.map((item, index) => (
            <TabPanel
              key={item.label}
              value={tab}
              index={index}
            >
              <PromoItemsStatTable
                type={index === 0 ? "promo" : "legacy"}
                onRefresh={handleRefresh}
                onLoadPromoItems={loadPromoItems}
              />
            </TabPanel>
          ))}
        </Grid>
      </Grid>
    </>
  );
}
