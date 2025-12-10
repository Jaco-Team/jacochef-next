"use client";

import React from "react";
import {
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";

import { MyTextInput } from "@/ui/Forms";
import { useSiteClientsStore } from "../useSiteClientsStore";
import dayjs from "dayjs";
import { Clear } from "@mui/icons-material";

export default function Client({ getData, showAlert }) {
  const { update, clients, search } = useSiteClientsStore();
  const changeSearch = (v) => {
    const newVal = v?.target?.value || "";
    update({ search: newVal });
  };

  const openModalClient = async (login, type) => {
    try {
      const res = await getData("get_one_client", { login });

      if (!res?.client_info) {
        return showAlert("Ответ пуст");
      }

      if (res?.client_info.date_bir) {
        const dateBir = res.client_info.date_bir;

        if (dateBir) {
          const d = dayjs(dateBir);

          if (d.isValid()) {
            res.client_info.day = d.date(); // 1–31
            res.client_info.month = d.month() + 1; // 1–12
          }
        }
      }

      if (type === "open") {
        update({
          modalDialog: true,
        });
      }

      update({
        client_id: res.client_info.id,
        client_login: login,
        client: res.client_info,
        orders: res.client_orders,
        err_orders: res.err_orders,
        comments: res.client_comments,
        login_sms: res.client_login_sms,
        login_yandex: res.client_login_yandex,
      });
    } catch (e) {}
  };

  const getClients = async () => {
    const search = useSiteClientsStore.getState().search;

    if (search?.length < 4) {
      return showAlert("Необходимо указать минимум 4 цифры из номера телефона", false);
    }

    const res = await getData("get_clients", { search });

    if (!res?.st) {
      return showAlert(res?.text || "Error", false);
    }
    if (!res.clients?.length) {
      showAlert("Клиенты с таким номером не найдены", false);
      update({
        clients: [],
      });
      return;
    }
    update({
      clients: res.clients,
    });
  };

  return (
    <Grid
      container
      spacing={3}
    >
      <Grid
        size={{
          xs: 12,
          sm: 6,
        }}
      >
        <MyTextInput
          type="text"
          className="input_login"
          label="Поиск по номеру телефона"
          value={search}
          func={changeSearch}
          inputAdornment={{
            endAdornment: !!search && (
              <IconButton>
                <Clear onClick={() => changeSearch("")} />
              </IconButton>
            ),
          }}
          // slotProps={{
          //   input: {
          //     endAdornment: !!search && (
          //       <IconButton>
          //         <Clear onClick={() => changeSearch("")} />
          //       </IconButton>
          //     ),
          //   },
          // }}
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 4,
        }}
      >
        <Button
          onClick={getClients}
          variant="contained"
        >
          Показать
        </Button>
      </Grid>

      <Grid
        mt={5}
        size={{
          xs: 12,
          sm: 12,
        }}
      >
        <TableContainer
          sx={{ maxHeight: { xs: "none", sm: 570 } }}
          component={Paper}
        >
          <Table
            stickyHeader
            size="small"
          >
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Имя</TableCell>
                <TableCell>Номер телефона</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((item, key) => (
                <TableRow
                  hover
                  key={key}
                  style={{ cursor: "pointer" }}
                  onClick={() => openModalClient(item.login, "open")}
                >
                  <TableCell>{key + 1}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.login}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
}
