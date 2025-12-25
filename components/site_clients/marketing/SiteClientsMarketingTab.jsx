"use client";

import { useState } from "react";
import { MyAutocomplite, MyDatePickerNew } from "@/ui/Forms";
import { Button, Grid, Stack, Tab, Tabs } from "@mui/material";
import dayjs from "dayjs";
import useMarketingTabStore from "./useMarketingTabStore";
import ModalOrder from "../ModalOrder";
import a11yProps from "@/ui/TabPanel/a11yProps";
import TabPanel from "@/ui/TabPanel/TabPanel";
import InnerTabStats from "./InnerTabStats";
import InnerTabSources from "./InnerTabSources";
import SiteClientsMarketingOrdersTable from "./SiteClientsMarketingOrdersTable";
import InnerTabUtm from "./InnerTabUtm";
import InnerTabPromo from "./InnerTabPromo";
import useMarketingClientStore from "./useMarketingClientStore";
import SiteClientsMarketingOrdersModal from "./SiteClientsMarketingOrdersModal";
import SiteClientsClientModal from "./SiteClientsClientModal";
import { LoadingProvider } from "./useClientsLoadingContext";
import { useSiteClientsStore } from "../useSiteClientsStore";

export default function SiteClientsMarketingTab(props) {
  const { showAlert, getData, canAccess } = props;

  // TODO: move order modal state out
  const [order, setOrder] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState(0);

  const {
    points: allPoints = [],
    is_load,
    update,
    date_start_marketing,
    date_end_marketing,
  } = useSiteClientsStore();

  const { isModalOpen, setIsModalOpen, points, setPoints, refresh } = useMarketingTabStore();

  const [tabDateStart, setTabDateStart] = useState(date_start_marketing || dayjs());
  const [tabDateEnd, setTabDateEnd] = useState(date_end_marketing || dayjs());
  const [tabPoints, setTabPoints] = useState(points || []);

  const applyRange = () => {
    update({
      date_start_marketing: tabDateStart,
      date_end_marketing: tabDateEnd,
    });
    setPoints(tabPoints);
    refresh();
  };

  const openOrder = async (point_id, order_id) => {
    try {
      setOrder(null);
      update({ is_load: true });
      const resData = await getData("get_order", { point_id, order_id });
      if (!resData) {
        showAlert(resData?.text || "Ошибка запроса заказа", false);
        return;
      }
      setOrder(resData || null);
      setIsOrderModalOpen(true);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      update({ is_load: false });
    }
  };

  const { clientModalOpened } = useMarketingClientStore();

  const openClient = async (login) => {
    const { setClientLogin, setClientModalOpened } = useMarketingClientStore.getState();
    update({ is_load: true });
    setClientLogin(login);
    setClientModalOpened(true);
  };

  return (
    <LoadingProvider
      isLoading={is_load}
      setIsLoading={(loading) => update({ is_load: loading })}
    >
      <SiteClientsMarketingOrdersModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Заказы"
      >
        <>
          <SiteClientsMarketingOrdersTable
            openOrder={openOrder}
            openClient={openClient}
            showAlert={showAlert}
            getData={getData}
            canExport={canAccess("export_items")}
          />
        </>
      </SiteClientsMarketingOrdersModal>
      <ModalOrder
        open={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        order={order}
      />
      {clientModalOpened && (
        <SiteClientsClientModal
          canAccess={canAccess}
          showAlert={showAlert}
          openOrder={openOrder}
        />
      )}
      <Grid
        container
        spacing={3}
        maxWidth="lg"
      >
        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <MyAutocomplite
            label="Кафе"
            multiple={true}
            data={allPoints ?? []}
            value={tabPoints ?? []}
            func={(_, value) => setTabPoints(value)}
            // onBlur={() => setPoints(pointsTemp)}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <Grid
            container
            spacing={1}
          >
            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <MyDatePickerNew
                label="Дата от"
                customActions={true}
                value={dayjs(tabDateStart)}
                func={setTabDateStart}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <MyDatePickerNew
                label="Дата до"
                customActions={true}
                value={dayjs(tabDateEnd)}
                func={setTabDateEnd}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 2,
          }}
        >
          <Stack
            spacing={1}
            alignContent={"stretch"}
          >
            <Button
              onClick={applyRange}
              variant="contained"
              type="submit"
            >
              Применить
            </Button>
          </Stack>
        </Grid>
      </Grid>

      <Grid
        container
        spacing={0}
        sx={{ mt: 3 }}
      >
        <Grid
          style={{ paddingBottom: 24 }}
          size={{
            xs: 12,
            sm: 12,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            // variant={this.state.fullScreen ? 'scrollable' : 'fullWidth'}
            variant="scrollable"
            scrollButtons={false}
          >
            <Tab
              label={"Статистика"}
              {...a11yProps("stats")}
              key={"stats"}
            />
            <Tab
              label={"Источники"}
              {...a11yProps("sources")}
              key={"sources"}
            />
            <Tab
              label={"UTM"}
              {...a11yProps("utm")}
              key={"utm"}
            />
            <Tab
              label={"Промокоды"}
              {...a11yProps("promo")}
              key={"promo"}
            />
          </Tabs>
        </Grid>
        {/* статистика */}
        <Grid
          size={{
            xs: 12,
          }}
        >
          <TabPanel
            value={activeTab}
            index={0}
            id="stats"
          >
            <InnerTabStats
              getData={getData}
              showAlert={showAlert}
            />
          </TabPanel>
        </Grid>

        {/* источники */}
        <Grid
          size={{
            xs: 12,
          }}
        >
          <TabPanel
            value={activeTab}
            index={1}
            id="sources"
          >
            <InnerTabSources
              getData={getData}
              showAlert={showAlert}
              canExport={canAccess("export_items")}
            />
          </TabPanel>
        </Grid>

        {/* utm */}
        <Grid
          size={{
            xs: 12,
          }}
        >
          <TabPanel
            value={activeTab}
            index={2}
            id="utm"
          >
            <InnerTabUtm
              getData={getData}
              showAlert={showAlert}
              canExport={canAccess("export_items")}
            />
          </TabPanel>
        </Grid>

        {/* промокоды */}
        <Grid
          size={{
            xs: 12,
          }}
        >
          <TabPanel
            value={activeTab}
            index={3}
            id="promo"
          >
            <InnerTabPromo
              getData={getData}
              showAlert={showAlert}
              canExport={canAccess("export_items")}
            />
          </TabPanel>
        </Grid>
      </Grid>
    </LoadingProvider>
  );
}
