"use client";

import { useState } from "react";
import { MyAutocomplite, MyDatePickerNew } from "@/ui/elements";
import { Button, Grid, Stack, Tab, Tabs } from "@mui/material";
import dayjs from "dayjs";
import useMarketingTabStore from "./useMarketingTabStore";
import ModalOrder from "../ModalOrder";
import a11yProps from "@/components/shared/TabPanel/a11yProps";
import TabPanel from "@/components/shared/TabPanel/TabPanel";
import InnerTabStats from "./InnerTabStats";
import InnerTabSources from "./InnerTabSources";
import SiteClientsMarketingOrdersTable from "./SiteClientsMarketingOrdersTable";
import InnerTabUtm from "./InnerTabUtm";
import InnerTabPromo from "./InnerTabPromo";
import useMarketingClientStore from "./useMarketingClientStore";
import SiteClientsMarketingOrdersModal from "./SiteClientsMarketingOrdersModal";
import SiteClientsClientModal from "./SiteClientsClientModal";
import { LoadingProvider } from "./useClientsLoadingContext";

export default function SiteClientsMarketingTab(props) {
  const { points: allPoints = [], showAlert, getData, canAccess, isLoading, setIsLoading } = props;

  // TODO: move order modal state out
  const [order, setOrder] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState(0);

  const {
    dateStart,
    dateEnd,
    isModalOpen,
    setDateStart,
    setDateEnd,
    setIsModalOpen,
    loadingOrders,
    points,
    setPoints,
  } = useMarketingTabStore();

  const [tabDateStart, setTabDateStart] = useState(dateStart || dayjs());
  const [tabDateEnd, setTabDateEnd] = useState(dateEnd || dayjs());
  const [tabPoints, setTabPoints] = useState(points || []);

  const applyRange = () => {
    setDateStart(tabDateStart);
    setDateEnd(tabDateEnd);
    setPoints(tabPoints);
  };

  const setLastWeek = () => {
    setTabDateStart(dayjs().subtract(7, "day"));
    setTabDateEnd(dayjs());
    applyRange();
  };

  const setLastMonth = () => {
    setTabDateStart(dayjs().subtract(1, "month"));
    setTabDateEnd(dayjs());
    applyRange();
  };

  const openOrder = async (point_id, order_id) => {
    try {
      setOrder(null);
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const { clientModalOpened } = useMarketingClientStore();

  const openClient = async (login) => {
    const { setClientLogin, setClientModalOpened } = useMarketingClientStore.getState();
    setIsLoading(true);
    setClientLogin(login);
    setClientModalOpened(true);
  };

  return (
    <LoadingProvider isLoading={isLoading} setIsLoading={setIsLoading}>
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
          />
        </>
      </SiteClientsMarketingOrdersModal>

      <ModalOrder
        open={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        order={order?.order}
        order_items={order?.order_items}
        err_order={order?.err_order}
        feedback_forms={order?.feedback_forms}
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
      >
        <Grid
          item
          xs={12}
          sm={4}
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
          item
          xs={12}
          sm={6}
        >
          <Grid
            container
            spacing={1}
          >
            <Grid
              item
              xs={12}
              sm={6}
            >
              <MyDatePickerNew
                label="Дата от"
                customActions={true}
                value={dayjs(tabDateStart)}
                func={setTabDateStart}
              />
            </Grid>

            <Grid
              item
              xs={12}
              sm={6}
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
          item
          xs={12}
          sm={2}
        >
          {" "}
          <Stack
            spacing={1}
            alignContent={"stretch"}
          >
            <Button
              onClick={setLastWeek}
              variant="contained"
              type="submit"
            >
              За неделю
            </Button>
            <Button
              onClick={setLastMonth}
              variant="contained"
              type="submit"
            >
              За месяц
            </Button>
            <Button
              onClick={applyRange}
              variant="contained"
              type="submit"
            >
              Применить
            </Button>
          </Stack>
        </Grid>

        <Grid
          item
          xs={12}
          sm={12}
          style={{ paddingBottom: 24 }}
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
      </Grid>

      <Grid
        container
        spacing={0}
      >
        {/* статистика */}
        <Grid
          item
          xs={12}
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
          item
          xs={12}
        >
          <TabPanel
            value={activeTab}
            index={1}
            id="sources"
          >
            <InnerTabSources
              getData={getData}
              showAlert={showAlert}
            />
          </TabPanel>
        </Grid>

        {/* utm */}
        <Grid
          item
          xs={12}
        >
          <TabPanel
            value={activeTab}
            index={2}
            id="utm"
          >
            <InnerTabUtm
              getData={getData}
              showAlert={showAlert}
            />
          </TabPanel>
        </Grid>

        {/* промокоды */}
        <Grid
          item
          xs={12}
        >
          <TabPanel
            value={activeTab}
            index={3}
            id="promo"
          >
            <InnerTabPromo
              getData={getData}
              showAlert={showAlert}
            />
          </TabPanel>
        </Grid>
      </Grid>
    </LoadingProvider>
  );
}
