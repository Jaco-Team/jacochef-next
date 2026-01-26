import {
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
import { formatRUR } from "@/src/helpers/utils/i18n";
import { EditOutlined } from "@mui/icons-material";
import { formatYMD } from "@/src/helpers/ui/formatDate";

// globals
const FIRST_PAGE = 1;
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
  const [page, setPage] = useState(FIRST_PAGE);
  const [hasMore, setHasMore] = useState(false);

  const loadArticleTx = async () => {
    try {
      setState({ is_load: true });
      if (!articleId && articleId !== null) return [];
      const state = useDDSStore.getState();
      const statRow = state.stats.find((s) => s.article_id === articleId);
      if (!statRow) return [];
      const currentTx = statRow.transactions ?? [];

      const req = {
        article_ids: [articleId],
        date_start: formatYMD(date_start),
        date_end: formatYMD(date_end),
        points: point,
        page: page,
        limit: PER_PAGE,
      };
      const res = await api_laravel("get_transactions_by_article", req);
      const newTx = [];
      if (res?.transactions?.length) {
        newTx.push(...res.transactions);
        setHasMore(res.has_more);
        setPage(res.page + 1);
        setStatsArticleTx(articleId, [...currentTx, ...newTx], res.total);
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
    loadArticleTx();
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
            const isIncome = t.type === "income";
            const isExpense = t.type === "expense";
            const amountFormatted = formatRUR(+t.amount);
            return (
              <TableRow
                key={txKey}
                hover
              >
                <TableCell>{t.date || "—"}</TableCell>
                <TableCell>{t.number || "—"}</TableCell>
                <TableCell sx={{ color: "success.main" }}>
                  {isIncome ? amountFormatted : "—"}
                </TableCell>
                <TableCell sx={{ color: "secondary.main" }}>
                  {isExpense ? amountFormatted : "—"}
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
              {!!hasMore && (
                <Button
                  ref={loaderRefBtn}
                  variant="text"
                  sx={{
                    textAlign: "center",
                  }}
                  disabled={is_load}
                  onClick={loadArticleTx}
                >
                  Показать больше
                </Button>
              )}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
