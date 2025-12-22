import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import useDDSStore from "../useDDSStore";
import { useEffect, useRef, useState } from "react";
import useApi from "@/src/hooks/useApi";
import { formatNumber } from "@/src/helpers/utils/i18n";
import { useIntersectionObserver } from "@/src/hooks/useIntersectionObserver";
import { useDebounce } from "@/src/hooks/useDebounce";
import { EditOutlined } from "@mui/icons-material";

// globals
const FIRST_PAGE = 0;
const PER_PAGE = 50;

export default function ArticleTxTable({ articleId, type }) {
  const [point, date_start, date_end, module, setStatsArticleTx, is_load] = useDDSStore((s) => [
    s.point,
    s.date_start,
    s.date_end,
    s.module,
    s.setStatsArticleTx,
    s.is_load,
  ]);

  const setState = useDDSStore.setState;

  const { api_laravel } = useApi(module);

  const [articleTx, setArticleTx] = useState([]);
  const [hasMore, setHasMore] = useState(false);

  const loadArticleTx = async () => {
    try {
      setState({ is_load: true });
      if (!articleId && articleId !== null) return [];
      const state = useDDSStore.getState();
      const statRow = state.stats.find((s) => s.article_id === articleId);
      if (!statRow) return [];
      const page = statRow.page ?? FIRST_PAGE;
      const currentTx = statRow.transactions ?? [];

      const req = {
        article_ids: [articleId],
        date_start,
        date_end,
        points: point,
        page: page + 1,
        limit: PER_PAGE,
      };
      const res = await api_laravel("get_transactions_by_article", req);
      const newTx = [];
      if (res?.transactions?.length) {
        newTx.push(...res.transactions);
        setHasMore(res.has_more);
        setStatsArticleTx(articleId, [...currentTx, ...newTx], res.page, res.total);
      }

      // transform for rendering
      if (newTx.length) {
        const prettyTx =
          newTx
            ?.filter((tx) => tx.type === type)
            ?.map((tx) => ({
              ...tx,
              income: tx.income || 0,
              expense: tx.expense || 0,
              contractor: type === "income" ? tx.payer : tx.receiver,
            })) ?? [];

        setArticleTx((prev) => [...prev, ...prettyTx]);
      }
    } catch (e) {
      console.error("Error loading article transactions:", e);
    } finally {
      setState({ is_load: false });
    }
  };

  const handleEdit = (tx) => {
    setState({ selectedTx: [tx], isModalArticleTxOpen: true });
  };

  // const loaderRef = useIntersectionObserver({
  //   enabled: hasMore && !is_load,
  //   onVisible: useDebounce(async () => {
  //     await loadArticleTx();
  //   }, 300),
  // });

  const loaderRefBtn = useRef(null);

  // Load on dependency change
  useEffect(() => {
    if (!articleId && articleId !== null) return;
    const run = async () => {
      await loadArticleTx();
    };
    run();
  }, [articleId, type]);

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{
        borderRadius: 1,
        maxHeight: "50dvh",
        overflowY: "auto",
        overflowX: "auto",
        display: "block",
        width: "100%",
      }}
    >
      <Table
        size="small"
        stickyHeader
        sx={{ minWidth: 700 }}
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
          {articleTx?.map((t) => {
            const txKey = `${articleId}-${t.id || t.order_id}`;
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
                <TableCell>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleEdit(t)}
                  >
                    <EditOutlined fontSize="inherit" />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
          <TableRow>
            <TableCell
              colSpan={6}
              sx={{ textAlign: "center" }}
            >
              {/* <Box
                ref={loaderRef}
                sx={{
                  height: 40,
                  opacity: 0.3,
                  textAlign: "center",
                  visibility: hasMore ? "visible" : "hidden",
                }}
              >
                {is_load && "Загрузка..."}
              </Box> */}
              <Button
                ref={loaderRefBtn}
                variant="text"
                sx={{
                  textAlign: "center",
                  visibility: hasMore ? "visible" : "hidden",
                }}
                disabled={is_load}
                onClick={loadArticleTx}
              >
                Показать больше
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
