import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import useDDSStore from "../useDDSStore";
import { useEffect, useState } from "react";
import useApi from "@/src/hooks/useApi";
import { formatNumber } from "@/src/helpers/utils/i18n";

export default function ArticleTxTable({ articleId, type, open }) {
  const [is_load, point, date_start, date_end, module, setStatsArticleTx] = useDDSStore((s) => [
    s.is_load,
    s.point,
    s.date_start,
    s.date_end,
    s.module,
    s.setStatsArticleTx,
  ]);

  const setState = useDDSStore.setState;

  const { api_laravel } = useApi(module);

  const [articleTx, setArticleTx] = useState([]);

  // Helper: load and cache article transactions
  const loadArticleTx = async () => {
    try {
      setState({ is_load: true });
      const stats = useDDSStore.getState().stats;
      if (!articleId && articleId !== null) return [];

      // find stats row by BACKEND FIELD!
      const statRow = stats?.find((s) => s.article_id === articleId);

      let allTxs = statRow?.transactions;

      if (!allTxs) {
        const req = {
          article_ids: [articleId],
          date_start,
          date_end,
          points: point,
        };
        console.log("Fetching article transactions:", req);
        const res = await api_laravel("get_transactions_by_article", req);

        if (res?.transactions) {
          allTxs = res.transactions;
          // attach into stats cache
          setStatsArticleTx(articleId, res.transactions);
        }
      }

      return (
        allTxs
          ?.filter((tx) => tx.type === type)
          ?.map((tx) => ({
            id: tx.id,
            date: tx.date,
            number: tx.number,
            income: tx.income || 0,
            expense: tx.expense || 0,
            contractor: type === "income" ? tx.payer : tx.receiver,
            naznachenie_platezha: tx.naznachenie_platezha,
          })) ?? []
      );
    } catch (e) {
      console.error("Error loading article transactions:", e);
    } finally {
      setState({ is_load: false });
    }
  };

  // Load on dependency change
  useEffect(() => {
    console.log("render:", { open, articleId, type });
    if (!open) {
      console.log("unmounting");
      setArticleTx([]);
      return;
    }
    if (!articleId && articleId !== null) return;
    let isMounted = true;
    console.log("effect");
    const run = async () => {
      const list = await loadArticleTx();
      if (isMounted) setArticleTx(list);
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [open, articleId, type]);

  return (
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
          </TableRow>
        </TableHead>
        <TableBody>
          {articleTx?.map((t) => {
            const txKey = t.id;
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
                <TableCell>{t.contractor || "—"}</TableCell>
                <TableCell sx={{ minWidth: 300 }}>{t.naznachenie_platezha || "—"}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
