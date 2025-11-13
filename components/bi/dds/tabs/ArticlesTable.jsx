"use client";

import { Visibility } from "@mui/icons-material";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useState, useMemo } from "react";
import ModalArticleTransactions from "../modals/ModalArticleTransactions";
import useDDSStore from "../useDDSStore";
import { formatNumber } from "@/src/helpers/utils/i18n";

export default function ArticlesTable() {
  const [articles, transactions] = useDDSStore((s) => [s.articles, s.transactions]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const handleOpen = (article) => {
    setSelectedArticle(article);
    setOpenModal(true);
  };

  // Compute amount (absolute, by flow), percent share, and ops
  const computed = useMemo(() => {
    if (!articles?.length) return [];

    // per-article absolute sums based on flow
    const rows = articles.map((a) => {
      const related = transactions?.filter((t) => t.article_id === a.id) || [];
      const sumAbs = related.reduce((acc, t) => {
        if (a.flow === 1) return acc + (t.income || 0); // income articles: take income
        return acc + (t.expense || 0); // expense articles: take expense
      }, 0);

      return {
        ...a,
        _sum: sumAbs, // keep raw number for totals
        ops: related.length,
      };
    });

    const totalAbs = rows.reduce((acc, r) => acc + r._sum, 0);

    return rows.map((r) => ({
      ...r,
      amount: `${formatNumber(r._sum, 2, 2)} ₽`,
      percent: totalAbs ? `${((r._sum / totalAbs) * 100).toFixed(2)} %` : "0 %",
    }));
  }, [articles, transactions]);

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 2 }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Статья ДДС</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Сумма за период</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Доля %</TableCell>
              <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>Операций</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {computed.map((r) => (
              <TableRow
                key={r.id}
                hover
              >
                <TableCell>{r.name}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{r.amount}</TableCell>
                <TableCell>{r.percent}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{r.ops}</TableCell>
                <TableCell>
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<Visibility fontSize="small" />}
                    onClick={() => handleOpen(r)}
                    sx={{
                      textTransform: "none",
                      fontSize: 14,
                      fontWeight: 400,
                      px: 1,
                      color: "text.primary",
                      "&:hover": { backgroundColor: "action.hover" },
                    }}
                  >
                    Расшифровка
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ModalArticleTransactions
        open={openModal}
        onClose={() => setOpenModal(false)}
        article={selectedArticle}
      />
    </>
  );
}
