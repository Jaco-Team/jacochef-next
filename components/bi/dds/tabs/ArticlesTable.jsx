"use client";

import { KeyboardArrowDown, KeyboardArrowUp, Edit } from "@mui/icons-material";
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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState, useMemo, Fragment } from "react";
import useDDSStore from "../useDDSStore";
import { formatNumber } from "@/src/helpers/utils/i18n";

export default function ArticlesTable() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [articles, transactions] = useDDSStore((s) => [s.articles, s.transactions]);
  const setState = useDDSStore.setState;

  const [openGroups, setOpenGroups] = useState({ income: true, expense: false });
  const [openArticles, setOpenArticles] = useState({});

  const toggleGroup = (key) => setOpenGroups((p) => ({ ...p, [key]: !p[key] }));
  const toggleArticle = (id) => setOpenArticles((p) => ({ ...p, [id]: !p[id] }));

  const groups = useMemo(() => {
    const g = {
      income: { id: 1, title: "Операционные поступления", rows: [] },
      expense: { id: 2, title: "Операционные платежи", rows: [] },
    };

    if (Array.isArray(transactions)) {
      for (const t of transactions) {
        const key = (t.income || 0) > 0 ? "income" : (t.expense || 0) > 0 ? "expense" : null;
        if (!key) continue;
        g[key].rows.push(t);
      }
    }

    const aMap = new Map((articles || []).map((a) => [a.id, a.name]));

    const buildArticles = (rows, flowKey) => {
      const map = {};
      for (const t of rows) {
        const id = t.article_id ?? null;
        const keyId = id === null ? `${flowKey}-unclassified` : id;
        const name = id === null ? "Требует классификации" : aMap.get(t.article_id) || "—";
        if (!map[keyId]) map[keyId] = { id, keyId, name, rows: [], total: 0 };
        const amt = flowKey === "income" ? t.income || 0 : t.expense || 0;
        map[keyId].rows.push(t);
        map[keyId].total += amt;
      }
      return Object.values(map);
    };

    for (const k of Object.keys(g)) {
      g[k].articles = buildArticles(g[k].rows, k);
      g[k].total = g[k].articles.reduce((a, x) => a + x.total, 0);
    }

    return g;
  }, [articles, transactions]);

  const totalIncome = groups.income?.total || 0;
  const totalExpense = groups.expense?.total || 0;
  const balance = totalIncome - totalExpense;
  const balanceColor =
    balance > 0 ? "success.main" : balance < 0 ? "secondary.main" : "text.primary";

  const handleEdit = (tx) => {
    setState({ selectedTx: [tx.number], isModalArticleTxOpen: true });
  };

  const renderTxTable = (txs) => (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{
        borderRadius: 1,
        maxHeight: "50dvh",
        overflowY: "auto",
        overflowX: "auto",
        display: "block", // critical: restores horizontal scrolling
        width: "100%", // ensures it fills parent width
      }}
    >
      <Table
        size="small"
        stickyHeader
        sx={{ minWidth: 700 }} // let wide tables scroll naturally
      >
        <TableHead>
          <TableRow>
            <TableCell>Дата</TableCell>
            <TableCell>Номер</TableCell>
            <TableCell>Поступление</TableCell>
            <TableCell>Списание</TableCell>
            <TableCell>Контрагент</TableCell>
            <TableCell>Назначение платежа</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {txs.map((t) => {
            const txKey =
              t.id ||
              `${t.number || "no-num"}-${t.date || "no-date"}-${(t.income || 0) + (t.expense || 0)}`;
            return (
              <TableRow
                key={txKey}
                hover
              >
                <TableCell>{t.date || "—"}</TableCell>
                <TableCell>{t.number || "—"}</TableCell>
                <TableCell sx={{ color: "success.main" }}>
                  {(t.income || 0) > 0 ? `${formatNumber(t.income, 2, 2)} ₽` : "—"}
                </TableCell>
                <TableCell sx={{ color: "secondary.main" }}>
                  {(t.expense || 0) > 0 ? `-${formatNumber(t.expense, 2, 2)} ₽` : "—"}
                </TableCell>
                <TableCell>{(t.income || 0) > 0 ? t.payer || "—" : t.receiver || "—"}</TableCell>
                <TableCell sx={{ minWidth: 300 }}>{t.payment_description || "—"}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleEdit(t)}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

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
                {g.rows.length} документов
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
                    key={`${key}-${a.keyId}`}
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
                        {formatNumber(a.total || 0, 2, 2)} ₽
                      </Grid>
                      <Grid
                        sx={{
                          minWidth: 120,
                          textAlign: "right",
                          opacity: 0.7,
                        }}
                      >
                        {a.rows.length} операций
                      </Grid>
                    </Grid>

                    <Collapse
                      in={openArticles[a.keyId]}
                      timeout="auto"
                      unmountOnExit
                    >
                      <Grid sx={{ pt: 1 }}>{renderTxTable(a.rows)}</Grid>
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

  return transactions?.length > 0 ? (
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
