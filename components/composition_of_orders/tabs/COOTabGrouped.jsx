"use client";

import { Table, TableBody, TableCell, TableFooter, TableHead, TableRow } from "@mui/material";
import CompositionOfOrdersIconSort from "../CompositionOfOrdersIconSort";
import CompositionOfOrdersTooltip from "../CompositionOfOrdersToolTip";
import CompositionOfOrdersRow from "../CompositionOfOrdersRow";
import useCompositionOfOrdersStore from "../store/useCompositionOfOrdersStore";
import { formatNumber } from "@/src/helpers/utils/i18n";
import dayjs from "dayjs";

const COOTabGrouped = ({ sort, getData, showAlert }) => {
  const state = useCompositionOfOrdersStore();
  const { openRows, setPage, setRowsPerPage, setState, toggleRow } = useCompositionOfOrdersStore();

  async function getDataRow(row_name, page = null, perPage = null) {
    const { point, dow, date_start, date_end, pay, now_time, pred_time, stat } =
      useCompositionOfOrdersStore.getState();
    // const row = stat.find((i) => i.name === row_name) || {};
    const data = {
      date_start: date_start ? dayjs(date_start).format("YYYY-MM-DD") : "",
      date_end: date_end ? dayjs(date_end).format("YYYY-MM-DD") : "",
      point,
      dow,
      pay,
      now_time,
      pred_time,
      row_name,
      page: (page ?? 0) + 1,
      perPage: perPage ?? 30,
      item_ids: state.items?.map((i) => i.id),
    };

    const res = await getData("get_stat_orders_row", data);

    const newStat = [...stat].map((item) => {
      return item.name === row_name
        ? {
            ...item,
            arr_main: res?.array.slice(0, 20),
            arr_dop: res?.array.slice(20),
            arr: res?.array,
            total: res?.pagination?.total,
            page: res?.pagination?.page > 0 ? res?.pagination?.page - 1 : 0,
            perPage: res?.pagination?.perPage > 0 ? res?.pagination?.perPage : 30,
            loading: false,
          }
        : item;
    });

    setState({ stat: newStat });
  }

  async function getGraphData() {
    if (state.graph) return;

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
      item_ids: state.items?.map((i) => i.id),
    };

    const res = await getData("get_stat_graph", data);
    if (!res?.graph) {
      showAlert("Ошибка получения данных графика");
      return;
    }
    setState({
      graph: res?.graph,
    });
  }

  async function getGroupGraphData(row_name, ids) {
    const { point, dow, date_start, date_end, pay, now_time, pred_time } = state;

    if (!point.length) {
      showAlert("Необходимо выбрать кафе");
      return;
    }
    if (!date_start || !date_end) {
      showAlert("Необходимо выбрать даты");
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
      row_name,
      item_ids: state.items?.map((i) => i.id),
      full_group_ids: ids,
    };

    const res = await getData("get_group_stat_graph", data);
    if (!res?.graph) {
      showAlert("Ошибка получения данных графика");
      return;
    }
    setState({
      groupGraph: res?.graph,
    });
  }

  async function openGraphModal(rowName) {
    await getGraphData();
    setState({
      graphRowName: rowName,
      graphModal: true,
    });
  }

  function openGroupGraphModal(rowName = null) {
    return async (title = null, ids = null) => {
      if (!rowName || !title || !ids?.length) {
        showAlert("Error openGroupGraphModal, some parameters missing");
        return;
      }
      await getGroupGraphData(rowName, ids);
      setState({
        groupGraphModal: true,
        graphRowName: title,
      });
    };
  }

  return (
    <Table aria-label="collapsible table">
      <TableHead style={{ backgroundColor: "#e6e6e6" }}>
        <TableRow>
          <TableCell />
          <TableCell>
            Позиция меню
            <CompositionOfOrdersTooltip
              title={
                "Берутся к учёту только те заказы, в которых есть то, что написано ниже списком. Блюда берутся в единственном и множественном числе."
              }
            />
          </TableCell>
          <TableCell align="right">
            <span
              style={{ cursor: "pointer" }}
              onClick={() => sort("sort_count")}
            >
              <CompositionOfOrdersIconSort type={state.sort_count} />
            </span>
            Заказов, шт.
            <CompositionOfOrdersTooltip title={"Общее количество таких заказов"} />
          </TableCell>
          <TableCell align="right">
            <span
              style={{ cursor: "pointer" }}
              onClick={() => sort("sort_count_percent")}
            >
              <CompositionOfOrdersIconSort type={state.sort_count_percent} />
            </span>
            Доля в заказах
            <CompositionOfOrdersTooltip title={"% от общего количества таких заказов"} />
          </TableCell>
          <TableCell align="right">
            <span
              style={{ cursor: "pointer" }}
              onClick={() => sort("sort_price")}
            >
              <CompositionOfOrdersIconSort type={state.sort_price} />
            </span>
            Выручка, руб.
            <CompositionOfOrdersTooltip title={"Общая выручка таких заказов в руб."} />
          </TableCell>
          <TableCell align="right">
            <span
              style={{ cursor: "pointer" }}
              onClick={() => sort("sort_price_percent")}
            >
              <CompositionOfOrdersIconSort type={state.sort_price_percent} />
            </span>
            Доля в выручке
            <CompositionOfOrdersTooltip title={"% от общей суммы выручки таких заказов"} />
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {state.stat?.map((row) => (
          <CompositionOfOrdersRow
            key={row.name}
            row={row}
            open={openRows[row.name] || false}
            getDataRow={getDataRow}
            setPage={setPage}
            setRowsPerPage={setRowsPerPage}
            onToggle={toggleRow}
            openGraphModal={() => openGraphModal(row.name)}
            openGroupGraphModal={openGroupGraphModal(row.name)}
          />
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell style={{ borderBottom: 0 }}></TableCell>
          <TableCell style={{ borderBottom: 0 }}>Итого</TableCell>
          <TableCell
            align="right"
            style={{ paddingRight: 10, borderBottom: 0 }}
          >
            {formatNumber(parseInt(state.all_count))}
          </TableCell>
          <TableCell
            align="right"
            style={{ paddingRight: 10, borderBottom: 0 }}
          >
            100%
          </TableCell>
          <TableCell
            align="right"
            style={{ paddingRight: 10, borderBottom: 0 }}
          >
            {formatNumber(parseInt(state.all_price))}
          </TableCell>
          <TableCell
            align="right"
            style={{ paddingRight: 10, borderBottom: 0 }}
          >
            100%
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};
export default COOTabGrouped;
