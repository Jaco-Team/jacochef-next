"use client";

import {
  Grid,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TableSortLabel,
  TextField,
  Stack,
} from "@mui/material";
import { UploadFile, Add, Edit, Delete, FilterAlt, Clear } from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import { useConfirm } from "@/src/hooks/useConfirm";
import useDDSStore from "../useDDSStore";
import ModalAddEditArticle from "../modals/ModalAddEditArticle";
import useApi from "@/src/hooks/useApi";
import { formatPlural } from "@/src/helpers/utils/i18n";
import { formatYMD } from "@/src/helpers/ui/formatDate";
import { parseArticlesFile } from "../helpers/parseArticles";
import ModalPrepareArticles from "../modals/ModalPrepareArticles";
import { GROUPS } from "../config";

export default function TabSettings({ showAlert }) {
  const { withConfirm, ConfirmDialog } = useConfirm();
  const { articles, articlesRefreshToken, module } = useDDSStore();
  const setState = useDDSStore.setState;

  const { api_laravel } = useApi(module);

  const [openAdd, setOpenAdd] = useState(false);
  const [pickedArticle, setPickedArticle] = useState(null);

  const [prepareModalOpen, setPrepareModalOpen] = useState(false);

  const [orderBy, setOrderBy] = useState(null); // column key
  const [order, setOrder] = useState("asc"); // asc | desc

  // SORTING AND FILTERING

  const columns = [
    { key: "name", label: "Наименование" },
    { key: "group", label: "Группа" },
    { key: "type", label: "Тип показателя" },
    { key: "operation", label: "Вид операции" },
    { key: "used", label: "Использований" },
    { key: "updated", label: "Обновлено" },
  ];

  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = useMemo(() => {
    if (!searchQuery?.trim()) return articles;

    const q = searchQuery.trim().toLowerCase();

    return articles.filter((a) => a.name.toLowerCase().includes(q));
  }, [articles, searchQuery]);

  const sortData = (rows) => {
    if (!orderBy) return rows;

    const sorted = [...rows].sort((a, b) => {
      const x = a[orderBy];
      const y = b[orderBy];

      if (x == null) return 1;
      if (y == null) return -1;

      if (typeof x === "number" && typeof y === "number") {
        return order === "asc" ? x - y : y - x;
      }

      return order === "asc"
        ? String(x).localeCompare(String(y))
        : String(y).localeCompare(String(x));
    });

    return sorted;
  };

  const handleSort = (col) => {
    if (orderBy === col) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setOrderBy(col);
      setOrder("asc");
    }
  };

  const fetchArticles = async () => {
    const res = await api_laravel("get_articles");
    if (!res?.st) {
      return showAlert("Ошибка загрузки статей ДДС");
    }
    setState({ articles: res.articles || [] });
  };

  // Handle deletion
  const handleDelete = async (id) => {
    if (!id) {
      console.log("No ID provided");
      return;
    }
    try {
      setState({ is_load: true });
      const res = await api_laravel("articles/delete", { id });
      if (!res?.st) {
        throw new Error("Ошибка удаления статьи");
      }
      setState({
        refreshToken: Date.now(),
        statsRefreshToken: Date.now(),
        articlesRefreshToken: Date.now(),
      });
      showAlert(
        res.text ||
          `Удалена статья ${id}, ${formatPlural(res.untied_tx, ["отвязана", "отвязано", "отвязано"])} ${formatPlural(res.affected, ["транзакция", "транзакции", "транзакций"])}`,
        true,
      );
    } catch (e) {
      showAlert(e?.message || "Ошибка удаления статьи");
    } finally {
      setState({ is_load: false });
    }
  };

  const handleEdit = (article) => {
    setPickedArticle(article);
    setOpenAdd(true);
  };

  const handleFile = async (e) => {
    try {
      setState({ is_load: true });
      const file = e.target.files?.[0];
      if (!file) return;

      const parsed = await parseArticlesFile(file);
      setState({ parsedArticles: parsed });
      setPrepareModalOpen(true);
      e.target.value = null;
    } catch (error) {
      showAlert(error?.message || "Ошибка загрузки файла");
    } finally {
      setState({ is_load: false });
    }
  };

  const getGroupName = (id) => {
    const group = GROUPS.find((g) => g.id === id);
    return group ? group.name : "Неизвестная группа";
  };

  useEffect(() => {
    if (!articlesRefreshToken) return;
    fetchArticles();
  }, [articlesRefreshToken]);

  return (
    <Paper sx={{ p: 3 }}>
      <ConfirmDialog />
      <ModalPrepareArticles
        showAlert={showAlert}
        open={prepareModalOpen}
        onClose={() => setPrepareModalOpen(false)}
      />
      <ModalAddEditArticle
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        showAlert={showAlert}
        article={pickedArticle}
      />
      <Paper
        variant="outlined"
        sx={{ p: 3, mb: 3 }}
      >
        <Typography
          variant="h6"
          fontWeight={600}
          sx={{ mb: 2 }}
        >
          Загрузка справочника статей
        </Typography>

        <Grid
          container
          spacing={2}
          alignItems="center"
        >
          <Grid size={{ xs: 12, sm: "auto" }}>
            <Button
              variant="outlined"
              component="label"
              size="small"
              startIcon={<UploadFile fontSize="small" />}
              sx={{ justifyContent: "flex-start" }}
            >
              Выбрать файл
              <input
                type="file"
                hidden
                onInput={handleFile}
              />
            </Button>
          </Grid>

          <Grid size={{ xs: 12, sm: "auto" }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{ whiteSpace: "nowrap" }}
              onClick={() => setOpenAdd(true)}
            >
              Добавить статью
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper
        variant="outlined"
        sx={{ p: 2 }}
      >
        <Stack
          direction="row"
          spacing={2}
          justifyContent={"space-between"}
          sx={{ pb: 2 }}
        >
          <Typography
            variant="h6"
            fontWeight={600}
            sx={{ mb: 2 }}
          >
            Справочник статей ДДС
          </Typography>
          <TextField
            size="small"
            placeholder="Наименование…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: <FilterAlt sx={{ mr: 1, color: "text.disabled" }} />,
                endAdornment: searchQuery ? (
                  <IconButton onClick={() => setSearchQuery("")}>
                    <Clear fontSize="small" />
                  </IconButton>
                ) : null,
              },
            }}
            sx={{ width: 240, marginLeft: "auto" }}
          />
        </Stack>
        <TableContainer sx={{ maxHeight: "60vh" }}>
          <Table
            size="small"
            stickyHeader
          >
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    sortDirection={orderBy === col.key ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === col.key}
                      direction={orderBy === col.key ? order : "asc"}
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                    </TableSortLabel>
                  </TableCell>
                ))}

                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {sortData(filteredArticles)?.map((r) => {
                const isIncome = r.group === 1;
                const color = isIncome ? "success.main" : "primary.main";

                return (
                  <TableRow
                    key={r.id}
                    hover
                  >
                    <TableCell>{r.name}</TableCell>
                    <TableCell sx={{ color }}>{getGroupName(r.group)}</TableCell>
                    <TableCell>{r.type}</TableCell>
                    <TableCell>{r.operation}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{r.used}</TableCell>
                    <TableCell>{formatYMD(r.updated)}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        sx={{ color: "text.secondary" }}
                        onClick={() => handleEdit(r)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={withConfirm(
                          () => handleDelete(r.id),
                          `Точно удалить статью "${r.name}"?`,
                          3,
                        )}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Paper>
  );
}
