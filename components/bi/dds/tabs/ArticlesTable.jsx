"use client";

import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import {
  Collapse,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useState, useMemo, Fragment } from "react";
import useDDSStore from "../useDDSStore";
import { formatNumber, formatPlural } from "@/src/helpers/utils/i18n";
import ArticleTxTable from "./ArticleTxTable";
import dayjs from "dayjs";

const getMoneyColor = (type, value) => {
  if (value === 0) return "text.primary";
  return type === "income" ? "success.main" : "secondary.main";
};

export default function ArticlesTable() {
  const stats = useDDSStore((s) => s.stats);

  const [openGroups, setOpenGroups] = useState({
    income: true,
    expense: true,
  });

  const [openArticles, setOpenArticles] = useState({});

  const toggleGroup = (key) => setOpenGroups((p) => ({ ...p, [key]: !p[key] }));

  const toggleArticle = (id) => setOpenArticles((p) => ({ ...p, [id]: !p[id] }));

  const monthKeys = useMemo(() => {
    if (!stats) return [];
    const set = new Set();
    for (const a of stats) {
      for (const m of Object.keys(a.months || {})) set.add(m);
    }
    return Array.from(set).sort();
  }, [stats]);

  const groups = useMemo(() => {
    const base = {
      income: { title: "Операционные поступления", articles: [], totals: {} },
      expense: { title: "Операционные платежи", articles: [], totals: {} },
    };

    for (const a of stats || []) {
      const type = a.type;
      if (!type) continue;

      const safeId = `${type}-${a.article_id}`;

      const row = {
        id: safeId,
        rawId: a.article_id,
        name: a.article_name,
        type,
        months: {},
      };

      for (const m of monthKeys) {
        const v = a.months?.[m];
        const sum = v?.sum || 0;
        const tx = v?.tx || 0;

        row.months[m] = { sum, tx };

        base[type].totals[m] = (base[type].totals[m] || 0) + sum;
      }

      base[type].articles.push(row);
    }

    return base;
  }, [stats, monthKeys]);

  const totalIncome = useMemo(
    () => Object.values(groups.income.totals).reduce((s, v) => s + v, 0),
    [groups],
  );

  const totalExpense = useMemo(
    () => Object.values(groups.expense.totals).reduce((s, v) => s + v, 0),
    [groups],
  );

  const balance = totalIncome - totalExpense;

  const balanceColor =
    balance > 0 ? "success.main" : balance < 0 ? "secondary.main" : "text.primary";

  const renderArticleRow = (a) => (
    <Fragment key={`art-${a.id}`}>
      <TableRow hover>
        <TableCell sx={{ width: "50%", fontWeight: 500, whiteSpace: "nowrap" }}>
          <IconButton
            size="small"
            onClick={() => toggleArticle(a.id)}
          >
            {openArticles[a.id] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
          {a.name}
        </TableCell>

        {monthKeys.map((m) => {
          const { sum, tx } = a.months[m];
          return (
            <TableCell
              key={`${a.id}-${m}`}
              sx={{
                textAlign: "right",
                whiteSpace: "nowrap",
                color: getMoneyColor(a.type, sum),
              }}
            >
              {formatNumber(sum, 2, 2)} ₽
              <Typography
                variant="caption"
                sx={{ opacity: 0.6, display: "block" }}
              >
                {formatPlural(tx, ["транзакция", "транзакции", "транзакций"])}
              </Typography>
            </TableCell>
          );
        })}
      </TableRow>

      <TableRow>
        <TableCell
          colSpan={monthKeys.length + 1}
          sx={{ p: 0, bgcolor: "background.default" }}
        >
          <Collapse
            in={openArticles[a.id]}
            unmountOnExit
          >
            <ArticleTxTable
              articleId={a.rawId}
              type={a.type}
            />
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );

  const renderGroup = (key) => {
    const g = groups[key];
    return (
      <Fragment key={`group-${key}`}>
        <TableRow sx={{ bgcolor: "action.hover" }}>
          <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
            <IconButton
              size="small"
              onClick={() => toggleGroup(key)}
            >
              {openGroups[key] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
            {g.title}
          </TableCell>

          {monthKeys.map((m) => (
            <TableCell
              key={m}
              sx={{
                textAlign: "right",
                fontWeight: 600,
                whiteSpace: "nowrap",
                color: getMoneyColor(key, g.totals[m] || 0),
              }}
            >
              {formatNumber(g.totals[m] || 0, 2, 2)} ₽
            </TableCell>
          ))}
        </TableRow>

        <TableRow>
          <TableCell
            colSpan={monthKeys.length + 1}
            sx={{ p: 0 }}
          >
            <Collapse
              in={openGroups[key]}
              unmountOnExit
            >
              <Table
                size="small"
                sx={{ tableLayout: "fixed", width: "100%" }}
              >
                <TableBody>{g.articles.map(renderArticleRow)}</TableBody>
              </Table>
            </Collapse>
          </TableCell>
        </TableRow>
      </Fragment>
    );
  };

  return stats?.length > 0 ? (
    <>
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 2 }}
      >
        <Table
          stickyHeader
          sx={{ tableLayout: "fixed" }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: "50%", fontWeight: 600 }}>Статья</TableCell>

              {monthKeys.map((m) => (
                <TableCell
                  key={`head-${m}`}
                  sx={{
                    fontWeight: 600,
                    textAlign: "right",
                    whiteSpace: "nowrap",
                  }}
                >
                  {dayjs(m).format("MMM YYYY")}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {renderGroup("income")}
            {renderGroup("expense")}
          </TableBody>
        </Table>
      </TableContainer>

      <Grid
        container
        justifyContent="flex-end"
        sx={{ mt: 2, pr: 4 }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600 }}
        >
          Баланс:&nbsp;
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, color: balanceColor }}
        >
          {formatNumber(balance, 2, 2)} ₽
        </Typography>
      </Grid>
    </>
  ) : (
    <Typography
      variant="body2"
      sx={{ p: 2 }}
    >
      Нет данных для отображения
    </Typography>
  );
}
