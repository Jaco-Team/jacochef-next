"use client";

import {
  Checkbox,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Button,
  Box,
} from "@mui/material";
import { EditOutlined } from "@mui/icons-material";
import { useState } from "react";
import { useConfirm } from "@/src/hooks/useConfirm";

const rows = [
  {
    id: 1,
    date: "01.11.2024",
    number: "00001",
    income: 125000,
    expense: null,
    contractor: "ИП Иванов А.А.",
    purpose: "Оплата по договору №123",
    article: "Выручка от покупателей",
  },
  {
    id: 2,
    date: "02.11.2024",
    number: "00002",
    income: null,
    expense: 45000,
    contractor: 'ООО "Поставщик продуктов"',
    purpose: "Закупка кофейных зерен",
    article: "Закупка продуктов",
  },
  {
    id: 3,
    date: "03.11.2024",
    number: "00003",
    income: null,
    expense: 80000,
    contractor: 'ООО "Арендодатель"',
    purpose: "Аренда за ноябрь 2024",
    article: "Аренда помещений",
  },
  {
    id: 4,
    date: "05.11.2024",
    number: "00004",
    income: 98500,
    expense: null,
    contractor: 'ООО "Корпоративный клиент"',
    purpose: "Оплата за услуги кейтеринга",
    article: "Выручка от покупателей",
  },
  {
    id: 5,
    date: "10.11.2024",
    number: "00005",
    income: null,
    expense: 150000,
    contractor: "Сотрудники",
    purpose: "Выплата заработной платы за октябрь",
    article: "Зарплата сотрудников",
  },
  {
    id: 6,
    date: "12.11.2024",
    number: "00006",
    income: 5000,
    expense: null,
    contractor: 'ООО "Поставщик продуктов"',
    purpose: "Возврат за бракованный товар",
    article: "Возврат от поставщиков",
  },
  {
    id: 7,
    date: "15.11.2024",
    number: "00007",
    income: null,
    expense: 23000,
    contractor: 'ООО "Коммунальные услуги"',
    purpose: "Оплата электроэнергии и воды",
    article: null,
  },
  {
    id: 8,
    date: "18.11.2024",
    number: "00008",
    income: 156000,
    expense: null,
    contractor: "ИП Петров В.В.",
    purpose: "Оплата по договору №456",
    article: "Выручка от покупателей",
  },
];

export default function TransactionsTable() {
  const [selected, setSelected] = useState([]);

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    if (selected.length === rows.length) setSelected([]);
    else setSelected(rows.map((r) => r.id));
  };

  const totalIncome = rows.reduce((a, b) => a + (b.income || 0), 0);
  const totalExpense = rows.reduce((a, b) => a + (b.expense || 0), 0);

  const { withConfirm, ConfirmDialog } = useConfirm();

  return (
    <>
      <ConfirmDialog />
      <Paper sx={{ p: 2 }}>
        <Box sx={{ p: 1 }}>
          <Button
            variant="text"
            size="small"
            startIcon={<Typography fontSize={14}>🏷️</Typography>}
            onClick={withConfirm((e) => console.log(e), "Точно нажать?", 5)}
          >
            Присвоить статью ({selected.length})
          </Button>
        </Box>

        {/* Table */}
        <TableContainer sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.length === rows.length}
                    indeterminate={selected.length > 0 && selected.length < rows.length}
                    onChange={toggleAll}
                  />
                </TableCell>
                <TableCell>Дата</TableCell>
                <TableCell>№</TableCell>
                <TableCell>Поступление</TableCell>
                <TableCell>Списание</TableCell>
                <TableCell>Контрагент</TableCell>
                <TableCell>Назначение</TableCell>
                <TableCell>Статья ДДС</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => {
                const checked = selected.includes(r.id);
                return (
                  <TableRow
                    key={r.id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => toggleSelect(r.id)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox checked={checked} />
                    </TableCell>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>{r.number}</TableCell>
                    <TableCell sx={{ color: "success.main", fontWeight: 500 }}>
                      {r.income ? `${r.income.toLocaleString()} ₽` : "—"}
                    </TableCell>
                    <TableCell sx={{ color: "error.main", fontWeight: 500 }}>
                      {r.expense ? `${r.expense.toLocaleString()} ₽` : "—"}
                    </TableCell>
                    <TableCell>{r.contractor}</TableCell>
                    <TableCell>{r.purpose}</TableCell>
                    <TableCell>
                      {r.article ? (
                        <>
                          {r.article}
                          <IconButton size="small">
                            <EditOutlined fontSize="inherit" />
                          </IconButton>
                        </>
                      ) : (
                        <Chip
                          size="small"
                          color="warning"
                          variant="outlined"
                          label="Требует классификации"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}

              {/* Summary row */}
              <TableRow sx={{ backgroundColor: "action.hover" }}>
                <TableCell colSpan={2}>
                  <Typography fontWeight={600}>Итого:</Typography>
                </TableCell>
                <TableCell />
                <TableCell sx={{ color: "success.main", fontWeight: 600 }}>
                  {totalIncome.toLocaleString()} ₽
                </TableCell>
                <TableCell sx={{ color: "error.main", fontWeight: 600 }}>
                  {totalExpense.toLocaleString()} ₽
                </TableCell>
                <TableCell colSpan={2} />
                <TableCell sx={{ fontWeight: 600, color: "success.main" }}>
                  Баланс: {(totalIncome - totalExpense).toLocaleString()} ₽
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
}
