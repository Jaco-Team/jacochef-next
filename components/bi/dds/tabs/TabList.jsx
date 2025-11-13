"use client";

import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Typography,
} from "@mui/material";
import { UploadFile, Download, Visibility } from "@mui/icons-material";
import CityCafeAutocomplete2 from "@/ui/CityCafeAutocomplete2";
import { MyDatePickerNew } from "@/ui/Forms";
import { formatDate } from "@/src/helpers/ui/formatDate";
import useDDSStore from "../useDDSStore";
import TabPanel from "@/ui/TabPanel/TabPanel";
import TransactionsTable from "./TransactionsTable";
import { useState } from "react";
import ArticlesTable from "./ArticlesTable";

const rows = [
  { name: "Выручка от покупателей", amount: "379 500 ₽", percent: "57.5 %", ops: 3 },
  { name: "Зарплата сотрудников", amount: "150 000 ₽", percent: "22.7 %", ops: 1 },
  { name: "Аренда помещений", amount: "80 000 ₽", percent: "12.1 %", ops: 1 },
  { name: "Закупка продуктов", amount: "45 000 ₽", percent: "6.8 %", ops: 1 },
  { name: "Возврат от поставщиков", amount: "5 000 ₽", percent: "0.8 %", ops: 1 },
];

export default function TabList() {
  const { points, point, date_start, date_end } = useDDSStore();
  const setState = useDDSStore.setState;
  const [currentTab, setCurrentTab] = useState(0);

  return (
    <Paper sx={{ p: 3 }}>
      <Grid
        container
        spacing={2}
      >
        <Grid size={{ xs: 12, sm: 8 }}>
          <Grid
            container
            spacing={2}
          >
            <Grid size={12}>
              <CityCafeAutocomplete2
                label="Кафе"
                points={points}
                value={point}
                onChange={(v) => setState({ point: v })}
                withAll
                withAllSelected
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <MyDatePickerNew
                func={(v) => setState({ date_start: formatDate(v) })}
                value={date_start}
                label="Начало периода"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <MyDatePickerNew
                func={(v) => setState({ date_end: formatDate(v) })}
                value={date_end}
                label="Конец периода"
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 1.5,
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ color: "text.secondary", fontWeight: 500 }}
            >
              Загрузка банка
            </Typography>

            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFile />}
              sx={{ height: 40 }}
            >
              Выбрать файл .txt
              <input
                type="file"
                accept=".txt"
                hidden
                onChange={(e) => console.log(e.target.files)}
              />
            </Button>

            <Button
              variant="contained"
              startIcon={<Download />}
              fullWidth
              sx={{ height: 40 }}
            >
              Скачать отчёт
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Inner tabs */}
      <Paper sx={{ mt: 4, mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={(_, id) => setCurrentTab(+id || 0)}
          variant="scrollable"
          scrollButtons={false}
        >
          <Tab
            key={"key"}
            value={0}
            label="Статьи"
          />
          <Tab
            key={"list"}
            value={1}
            label="Весь список"
          />
        </Tabs>
      </Paper>

      <TabPanel
        key={"key"}
        value={currentTab}
        index={0}
        id={0}
      >
        <ArticlesTable rows={rows} />
      </TabPanel>

      <TabPanel
        key={"list"}
        value={currentTab}
        index={1}
        id={1}
      >
        <TransactionsTable />
      </TabPanel>
    </Paper>
  );
}
