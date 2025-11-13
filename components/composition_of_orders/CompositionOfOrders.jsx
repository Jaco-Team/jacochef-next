"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { MyCheckBox, MyDatePickerNew, MyAutoCompleteWithAll, MyAutocomplite } from "@/ui/Forms";
import { Grid, Button, Backdrop, CircularProgress, Tab, Tabs, Paper } from "@mui/material";

import { api_laravel } from "@/src/api_new";
import dayjs from "dayjs";
import MyAlert from "@/ui/MyAlert";
import CityCafeAutocomplete2 from "@/ui/CityCafeAutocomplete2";
import a11yProps from "@/ui/TabPanel/a11yProps";
import TabPanel from "@/ui/TabPanel/TabPanel";
import COOTabGrouped from "./tabs/COOTabGrouped";
import useCompositionOfOrdersStore from "./store/useCompositionOfOrdersStore";
import useMyAlert from "@/src/hooks/useMyAlert";
import COOTabBySets from "./tabs/COOTabBySets";
import COOTabNoSets from "./tabs/COOTabNoSets";

const CompositionOfOrdersGraphModal = dynamic(
  () => import("@/components/composition_of_orders/CompositionOfOrdersGraphModal"),
  { ssr: false },
);
const CompositionOfOrdersGroupGraphModal = dynamic(
  () => import("@/components/composition_of_orders/CompositionOfOrdersGroupGraphModal"),
  { ssr: false },
);

export default function CompositionOfOrders() {
  const { isAlert, showAlert, closeAlert, alertStatus, alertMessage } = useMyAlert();
  const state = useCompositionOfOrdersStore();
  const { currentTab, items, setState, is_load } = useCompositionOfOrdersStore();

  const { resetOpenRows, sort } = useCompositionOfOrdersStore();

  const changeTab = (_, tabId) => setState({ currentTab: +tabId || 0 });

  const getCurrentTabData = useCallback(async () => {
    switch (currentTab) {
      case 0:
        await getGroupedData();
      case 1:
        await getBySetsData();
      case 2:
        await getNoSetsData();
    }
  }, [currentTab]);

  const getData = useCallback(async (method, data = {}) => {
    setState({
      is_load: true,
    });

    const res = await api_laravel(state.module, method, data);
    const result = res?.data;
    setTimeout(() => {
      setState({
        is_load: false,
      });
    }, 500);

    return result;
  }, []);

  function changeDateRange(key, event) {
    setState({
      [key]: event ? event : "",
    });
  }

  function changeItemChecked(key, event) {
    setState({
      [key]: event.target.checked === true ? 1 : 0,
    });
  }

  async function getGroupedData() {
    const { point, dow, date_start, date_end, pay, now_time, pred_time } = state;

    if (!point.length) {
      showAlert("Необходимо выбрать точки");
      return;
    }

    const data = {
      date_start: date_start ? dayjs(date_start).format("YYYY-MM-DD") : "",
      date_end: date_end ? dayjs(date_end).format("YYYY-MM-DD") : "",
      point,
      dow,
      pay,
      now_time,
      pred_time,
      item_ids: items?.map((i) => i.id),
    };

    const res = await getData("get_stat_orders", data);

    setState({
      stat: res?.res,
      all_price: res?.all_price,
      all_count: res?.all_count,

      sort_count: "asc",
      sort_count_percent: "asc",
      sort_price_percent: "desc",
      sort_price: "asc",
      graph: null,
    });

    resetOpenRows();
  }

  async function getBySetsData() {
    const state = useCompositionOfOrdersStore.getState();
    if (!state.items?.length) {
      setState({ itemsTabAll: null });
      showAlert("Выберите хотя бы одну позицию");
      return;
    }
    const { point, dow, date_start, date_end, pay, now_time, pred_time } = state;
    const payload = {
      date_start: date_start ? dayjs(date_start).format("YYYY-MM-DD") : "",
      date_end: date_end ? dayjs(date_end).format("YYYY-MM-DD") : "",
      point,
      dow,
      pay,
      now_time,
      pred_time,
      item_ids: state.items?.map((i) => i.id),
    };
    const res = await getData("get_items_full", payload);
    if (!res) {
      showAlert(`Ошибка сервера: ${res?.text || "500"}`);
      return;
    }
    setState({ itemsTabAll: res });
  }

  async function getNoSetsData() {
    const state = useCompositionOfOrdersStore.getState();
    if (!state.items?.length) {
      setState({ itemsTabAll: null });
      showAlert("Выберите хотя бы одну позицию");
      return;
    }
    const { point, dow, date_start, date_end, pay, now_time, pred_time } = state;
    const payload = {
      date_start: date_start ? dayjs(date_start).format("YYYY-MM-DD") : "",
      date_end: date_end ? dayjs(date_end).format("YYYY-MM-DD") : "",
      point,
      dow,
      pay,
      now_time,
      pred_time,
      item_ids: state.items?.map((i) => i.id),
    };
    const res = await getData("get_items_notfull", payload);
    if (!res) {
      showAlert(`Ошибка сервера: ${res?.text || "500"}`);
      return;
    }
    setState({ itemsTabNotAll: res });
  }

  const TABS = useMemo(
    () => [
      {
        id: 0,
        key: "grouped",
        name: "Группировка по типу",
        content: (
          <COOTabGrouped
            sort={sort}
            getData={getData}
            showAlert={showAlert}
          />
        ),
      },
      {
        id: 1,
        key: "sets",
        name: "С разбивкой сетов",
        content: (
          <COOTabBySets
            data={state.itemsTabAll}
            getData={getBySetsData}
            showAlert={showAlert}
          />
        ),
      },
      {
        id: 2,
        key: "plain",
        name: "Без разбивки сетов",
        content: (
          <COOTabNoSets
            data={state.itemsTabNotAll}
            getData={getNoSetsData}
            showAlert={showAlert}
          />
        ),
      },
    ],
    [state, getData, showAlert],
  );

  // EFFECTS

  useEffect(() => {
    getData("get_all").then((data) => {
      setState({
        points: data.points,
        module_name: data.module_info.name,
        allItems: data.items ?? [],
      });
      document.title = data.module_info.name;
    });
  }, [getData]);

  return (
    <>
      <Backdrop
        style={{ zIndex: 99 }}
        open={is_load}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <MyAlert
        isOpen={isAlert}
        onClose={closeAlert}
        status={alertStatus}
        text={alertMessage}
      />
      <CompositionOfOrdersGraphModal
        open={state.graphModal}
        rowName={state.graphRowName}
        onClose={() => setState({ graphModal: false })}
        data={state.graph}
      />
      <CompositionOfOrdersGroupGraphModal
        open={state.groupGraphModal}
        rowName={state.graphRowName}
        onClose={() => setState({ groupGraphModal: false })}
        data={state.groupGraph}
      />
      <Grid
        container
        spacing={3}
        mb={3}
        className="container_first_child"
      >
        <Grid
          size={{
            xs: 12,
            sm: 12,
          }}
        >
          <h1>{state.module_name}</h1>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <CityCafeAutocomplete2
            label="Кафе"
            points={state.points}
            value={state.point}
            onChange={(v) => {
              setState({ point: v });
            }}
            withAll
            withAllSelected
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <MyDatePickerNew
            label="Дата от"
            value={state.date_start}
            func={(e) => changeDateRange("date_start", e)}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <MyDatePickerNew
            label="Дата до"
            value={state.date_end}
            func={(e) => changeDateRange("date_end", e)}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <MyAutoCompleteWithAll
            label="День недели"
            options={state.dows}
            value={state.dow}
            onChange={(v) => {
              setState({ dow: v });
            }}
            withAll
            withAllSelected
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <MyAutoCompleteWithAll
            label="Способ оплаты"
            options={state.pays}
            value={state.pay}
            onChange={(v) => {
              setState({ pay: v });
            }}
            withAll
            withAllSelected
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <MyAutocomplite
            label="Товар"
            multiple={true}
            data={state.allItems || []}
            value={items || []}
            func={(_, v) => {
              setState({ items: v });
            }}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 2,
          }}
        >
          <MyCheckBox
            defa
            label="Оформлен на ближайшее время"
            value={parseInt(state.now_time) === 1 ? true : false}
            func={(e) => changeItemChecked("now_time", e)}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 2,
          }}
        >
          <MyCheckBox
            label="Оформлен предзаказ"
            value={parseInt(state.pred_time) === 1 ? true : false}
            func={(e) => changeItemChecked("pred_time", e)}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <Button
            onClick={() => getCurrentTabData()}
            variant="contained"
            disableElevation
          >
            Показать
          </Button>
        </Grid>

        <Grid
          style={{ marginBottom: 100 }}
          size={{
            xs: 12,
            sm: 12,
          }}
        >
          <Paper>
            <Tabs
              value={currentTab}
              onChange={changeTab}
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
              {tab.content}
            </TabPanel>
          ))}
        </Grid>
      </Grid>
    </>
  );
}
