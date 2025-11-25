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
  TableRow,
  Typography,
} from "@mui/material";
import { useState, useMemo, Fragment } from "react";
import useDDSStore from "../useDDSStore";
import { formatNumber, formatPlural } from "@/src/helpers/utils/i18n";
import ArticleTxTable from "./ArticleTxTable";

export default function ArticlesTable() {
  const stats = useDDSStore((s) => s.stats);

  const [openGroups, setOpenGroups] = useState({
    income: true,
    expense: false,
  });

  const [openArticles, setOpenArticles] = useState({});

  const toggleGroup = (key) => setOpenGroups((p) => ({ ...p, [key]: !p[key] }));

  const toggleArticle = (id) => setOpenArticles((p) => ({ ...p, [id]: !p[id] }));

  // Build groups from get_stats()
  const groups = useMemo(() => {
    const g = {
      income: {
        id: 1,
        title: "Операционные поступления",
        articles: [],
        total: 0,
        count: 0,
      },
      expense: {
        id: 2,
        title: "Операционные платежи",
        articles: [],
        total: 0,
        count: 0,
      },
    };

    if (!Array.isArray(stats)) return g;

    for (const article of stats) {
      const type = article.type; // "income" | "expense"
      if (!type) continue;

      const id = article.article_id ?? null;
      const keyId = id === null ? `${type}-unclassified` : id;
      const name = article.article_name;

      const total = type === "income" ? article.income_total : article.expense_total;

      const count = type === "income" ? article.tx_income_count : article.tx_expense_count;

      g[type].articles.push({
        id,
        keyId,
        name,
        total,
        count,
      });

      g[type].total += total;
      g[type].count += count;
    }

    return g;
  }, [stats]);

  // Balance
  const totalIncome = groups.income.total;
  const totalExpense = groups.expense.total;

  const balance = totalIncome - totalExpense;

  const balanceColor =
    balance > 0 ? "success.main" : balance < 0 ? "secondary.main" : "text.primary";

  // Render group block
  const renderGroupRow = (key) => {
    const g = groups[key];
    const sumLabel = (key === "expense" ? "-" : "") + formatNumber(g.total || 0, 2, 2) + " ₽";

    return (
      <Fragment key={`group-${key}`}>
        <TableRow>
          <TableCell colSpan={3}>
            <Grid
              container
              alignItems="center"
              spacing={1}
            >
              <Grid>
                <IconButton
                  size="small"
                  onClick={() => toggleGroup(key)}
                >
                  {openGroups[key] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                </IconButton>
              </Grid>

              <Grid sx={{ fontWeight: 600 }}>{g.title}</Grid>

              <Grid
                sx={{
                  ml: "auto",
                  fontWeight: 600,
                  color: key === "income" ? "success.main" : "secondary.main",
                }}
              >
                {sumLabel}
              </Grid>

              <Grid
                sx={{
                  minWidth: 100,
                  textAlign: "right",
                  opacity: 0.7,
                }}
              >
                {formatPlural(g.count, ["транзакция", "транзакции", "транзакций"])}
              </Grid>
            </Grid>
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell
            colSpan={3}
            sx={{ p: 0 }}
          >
            <Collapse
              in={openGroups[key]}
              timeout="auto"
              unmountOnExit
            >
              <Grid
                container
                direction="column"
                sx={{
                  p: 2,
                  bgcolor: "action.hover",
                  gap: 1,
                  overflow: "visible",
                }}
              >
                {g.articles.map((a) => (
                  <Grid
                    key={a.keyId}
                    container
                    direction="column"
                  >
                    <Grid
                      container
                      alignItems="center"
                      spacing={1}
                      sx={{
                        borderRadius: 1,
                        px: 1,
                        py: 0.5,
                        bgcolor: a.id === null ? "background.neutral" : "transparent",
                      }}
                    >
                      <Grid>
                        <IconButton
                          size="small"
                          onClick={() => toggleArticle(a.keyId)}
                        >
                          {openArticles[a.keyId] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </IconButton>
                      </Grid>

                      <Grid sx={{ fontWeight: 500 }}>{a.name}</Grid>

                      <Grid
                        sx={{
                          ml: "auto",
                          fontWeight: 600,
                          color: key === "income" ? "success.main" : "secondary.main",
                        }}
                      >
                        {key === "expense" ? "-" : ""}
                        {formatNumber(a.total, 2, 2)} ₽
                      </Grid>

                      <Grid
                        sx={{
                          minWidth: 120,
                          textAlign: "right",
                          opacity: 0.7,
                        }}
                      >
                        {formatPlural(a.count, ["транзакция", "транзакции", "транзакций"])}
                      </Grid>
                    </Grid>

                    <Collapse
                      in={openArticles[a.keyId]}
                      timeout="auto"
                      unmountOnExit
                    >
                      <ArticleTxTable
                        articleId={a.id}
                        type={key}
                        key={`tx-${a.keyId}-${key}`}
                      />
                    </Collapse>
                  </Grid>
                ))}
              </Grid>
            </Collapse>
          </TableCell>
        </TableRow>
      </Fragment>
    );
  };

  // Render root
  return stats?.length > 0 ? (
    <>
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 2 }}
      >
        <Table>
          <TableBody>
            {renderGroupRow("income")}
            {renderGroupRow("expense")}
          </TableBody>
        </Table>
      </TableContainer>

      <Grid
        container
        justifyContent="flex-end"
        sx={{ mt: 2, pr: 1 }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600 }}
        >
          Баланс:&nbsp;
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            color: balanceColor,
          }}
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
