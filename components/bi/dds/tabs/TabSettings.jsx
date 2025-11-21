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
} from "@mui/material";
import { UploadFile, Add, Edit, Delete } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useConfirm } from "@/src/hooks/useConfirm";
import useDDSStore from "../useDDSStore";
import ModalAddArticle from "../modals/ModalAddArticle";
import useApi from "@/src/hooks/useApi";
import { formatPlural } from "@/src/helpers/utils/i18n";
import { formatYMD } from "@/src/helpers/ui/formatDate";

const GROUP_NAMES = [
  { id: 1, name: "Операционные поступления" },
  { id: 2, name: "Операционные платежи" },
];

export default function TabSettings({ showAlert }) {
  const { withConfirm, ConfirmDialog } = useConfirm();
  const { articles, articlesRefreshToken, module } = useDDSStore();
  const setState = useDDSStore.setState;

  const { api_laravel } = useApi(module);

  const [openAdd, setOpenAdd] = useState(false);

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

  const getGroupName = (id) => {
    const group = GROUP_NAMES.find((g) => g.id === id);
    return group ? group.name : "Неизвестная группа";
  };

  useEffect(() => {
    if (!articlesRefreshToken) return;
    fetchArticles();
  }, [articlesRefreshToken]);

  return (
    <Paper sx={{ p: 3 }}>
      <ConfirmDialog />
      <ModalAddArticle
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        showAlert={showAlert}
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
              startIcon={<UploadFile />}
              sx={{ justifyContent: "flex-start", height: 40 }}
            >
              Выбрать файл
              <input
                type="file"
                hidden
                onChange={(e) => console.log(e.target.files)}
              />
            </Button>
          </Grid>

          <Grid size={{ xs: 12, sm: "auto" }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{ height: 40, whiteSpace: "nowrap" }}
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
        <Typography
          variant="h6"
          fontWeight={600}
          sx={{ mb: 2 }}
        >
          Справочник статей ДДС
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Наименование</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Группа</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Тип показателя</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Вид операции</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Использований</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Обновлено</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Действия</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {articles.map((r) => {
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
