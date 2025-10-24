"use client";

import { formatNumber } from "@/src/helpers/utils/i18n";
import { KeyboardArrowDown, KeyboardArrowUp, QueryStats } from "@mui/icons-material";
import {
  Box,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import CompositionOfOrdersTooltip from "./CompositionOfOrdersToolTip";
import { useRef } from "react";

export default function CompositionOfOrdersRow(props) {
  const { row, open, onToggle, getDataRow, openGraphModal, openGroupGraphModal } = props;
  // console.log(`page: ${row.page}, perPage: ${row.perPage}, total: ${row.total}`);

  const tableRef = useRef(null);

  const handleClick = () => {
    onToggle(row.name);

    if (row?.arr.length === 0) {
      getDataRow(row?.name, row.page, row.perPage);
    }
  };

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={handleClick}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell
          component="th"
          scope="row"
        >
          {row?.name} 
          <CompositionOfOrdersTooltip title={row?.title} />
          <IconButton onClick={() => openGraphModal(row?.name)}>
            <QueryStats />
          </IconButton>
        </TableCell>
        <TableCell
          align="right"
          style={{ paddingRight: 10 }}
        >
          {formatNumber(parseInt(row?.count))}
        </TableCell>
        <TableCell
          align="right"
          style={{ paddingRight: 10 }}
        >
          {formatNumber(row?.count_percent)}%
        </TableCell>
        <TableCell
          align="right"
          style={{ paddingRight: 10 }}
        >
          {formatNumber(row?.price)}
        </TableCell>
        <TableCell
          align="right"
          style={{ paddingRight: 10 }}
        >
          {formatNumber(row?.price_percent)}%
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell
          style={{ paddingBottom: 0, paddingTop: 0 }}
          colSpan={6}
        >
          <Collapse
            in={open}
            timeout="auto"
            unmountOnExit
          >
            <Box sx={{ margin: 1 }}>
              <TableContainer>
                <Table size="small" ref={tableRef}>
                  <TableHead style={{ backgroundColor: "#e6e6e6" }}>
                    <TableRow>
                      <TableCell>Группа</TableCell>
                      <TableCell></TableCell>
                      <TableCell align="right">Заказов, шт.</TableCell>
                      <TableCell align="right">Доля в заказах</TableCell>
                      <TableCell align="right">Выручка, руб.</TableCell>
                      <TableCell align="right">Доля в выручке, руб.</TableCell>
                      <TableCell align="right">Промокод</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row?.arr?.map((historyRow) => (
                      <TableRow key={historyRow.full_group}>
                        <TableCell>{historyRow.full_group}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => openGroupGraphModal(historyRow.full_group, historyRow.full_group_ids)}>
                            <QueryStats />
                          </IconButton>
                        </TableCell>
                        <TableCell
                          align="right"
                          style={{ paddingRight: 10 }}
                        >
                          {formatNumber(parseInt(historyRow?.count))}
                        </TableCell>
                        <TableCell
                          align="right"
                          style={{ paddingRight: 10 }}
                        >
                          {formatNumber(historyRow?.count_percent)}%
                        </TableCell>
                        <TableCell
                          align="right"
                          style={{ paddingRight: 10 }}
                        >
                          {formatNumber(historyRow?.sum_orders)}
                        </TableCell>
                        <TableCell
                          align="right"
                          style={{ paddingRight: 10 }}
                        >
                          {formatNumber(historyRow?.sum_percent)}%
                        </TableCell>
                        <TableCell
                          align="right"
                          style={{ paddingRight: 10 }}
                        >
                          {historyRow?.promo_name}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 30, 100, 500]}
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
                labelRowsPerPage="Записей на странице:"
                component="div"
                rowsPerPage={props.row.perPage}
                page={props.row.page}
                count={props.row.total ?? 0}
                onPageChange={async (_, newPage) => {
                  await getDataRow(row.name, newPage, row.perPage);
                  tableRef.current?.scrollIntoView({behavior: 'smooth'})
                }}
                onRowsPerPageChange={(event) => {
                  const newPerPage = parseInt(event.target.value, 10);
                  getDataRow(row.name, 0, newPerPage);
                }}
              />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
