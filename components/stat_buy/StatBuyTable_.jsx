"use client";

import React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
} from "@mui/material";

import { TabPanel } from "@mui/lab";
import dayjs from "dayjs";

export default class Stat_buy_Table_ extends React.Component {
  shouldComponentUpdate(nextProps) {
    return (
      nextProps.ItemTab !== this.props.ItemTab || nextProps.getDataCell !== this.props.getDataCell
    );
  }

  render() {
    const { ItemTab, getDataCell, catsData, unic_date } = this.props;
    return (
      <TabPanel
        value={ItemTab}
        style={{ padding: "24px 0" }}
        className="tender"
      >
        <TableContainer sx={{ maxHeight: { xs: "none", sm: 1000 } }}>
          <Table
            stickyHeader
            size="small"
          >
            <TableHead style={{ position: "sticky", top: 0, zIndex: 7 }}>
              <TableRow>
                <TableCell sx={{ zIndex: 30, minWidth: 150 }}>Категория</TableCell>
                {ItemTab === "1" ? <TableCell sx={{ zIndex: 20 }}>Ед измерения</TableCell> : null}
                {unic_date.map((item, key) => (
                  <TableCell
                    key={key}
                    sx={{ textTransform: "capitalize", zIndex: 7, minWidth: 150 }}
                  >
                    {dayjs(item.date).format("MMMM YYYY")}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {catsData.map((item, key) => (
                <React.Fragment key={key}>
                  <TableRow>
                    <TableCell
                      style={{ position: "sticky", display: "flex", backgroundColor: "#ADD8E6" }}
                    >
                      {item.name}
                    </TableCell>
                    <TableCell
                      style={{ backgroundColor: "#ADD8E6" }}
                      colSpan={`${ItemTab === "1" ? 2 + unic_date.length : 1 + unic_date.length}`}
                    ></TableCell>
                  </TableRow>

                  {item.cats.map((category, key_cat) => (
                    <React.Fragment key={key_cat}>
                      <TableRow
                        hover
                        sx={{ "& td": { backgroundColor: "#ADD8E6", borderRight: "none" } }}
                      >
                        <TableCell>{category.name}</TableCell>
                        <TableCell
                          style={{ backgroundColor: "#ADD8E6" }}
                          colSpan={`${
                            ItemTab === "1" ? 2 + unic_date.length : 1 + unic_date.length
                          }`}
                        ></TableCell>
                      </TableRow>

                      {category.items.map((item, k) => (
                        <TableRow
                          key={k}
                          hover
                        >
                          <TableCell
                            variant="head"
                            style={{ minWidth: 150 }}
                          >
                            {item.name}
                          </TableCell>
                          {ItemTab === "1" ? <TableCell>{item.ei_name}</TableCell> : null}
                          {unic_date.map((data, key) => getDataCell(item.id, data.date, key))}
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
    );
  }
}
