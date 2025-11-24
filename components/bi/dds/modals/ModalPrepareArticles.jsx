"use client";

import { useState, useMemo } from "react";
import {
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
} from "@mui/material";
import { Delete } from "@mui/icons-material";

import MyModal from "@/ui/MyModal";
import { MySelect } from "@/ui/Forms";
import useDDSStore from "../useDDSStore";
import { GROUPS, OPERATIONS } from "../config";
import useApi from "@/src/hooks/useApi";
import { formatPlural } from "@/src/helpers/utils/i18n";

export default function ModalPrepareArticles({ open, onClose, showAlert, onConfirm }) {
  const { parsedArticles, module } = useDDSStore();
  const setState = useDDSStore.setState;

  const { api_laravel } = useApi(module);

  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");

  const handleCancel = () => {
    setState({ parsedArticles: null });
    onClose();
  };

  const handleSort = (column) => {
    const asc = orderBy === column && order === "asc";
    setOrder(asc ? "desc" : "asc");
    setOrderBy(column);
  };

  const sortedRows = useMemo(() => {
    if (!parsedArticles) return [];
    return [...parsedArticles].sort((a, b) => {
      const x = a[orderBy];
      const y = b[orderBy];
      if (x < y) return order === "asc" ? -1 : 1;
      if (x > y) return order === "asc" ? 1 : -1;
      return 0;
    });
  }, [parsedArticles, order, orderBy]);

  const [selected, setSelected] = useState({});

  const toggleRow = (idx) => {
    setSelected((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleAll = () => {
    const rows = parsedArticles || [];
    const all = Object.keys(selected).length !== rows.length;

    if (all) {
      const next = {};
      rows.forEach((_, i) => (next[i] = true));
      setSelected(next);
    } else {
      setSelected({});
    }
  };

  const allSelected =
    parsedArticles?.length > 0 && Object.keys(selected).length === parsedArticles.length;

  const indeterminate =
    Object.keys(selected).length > 0 &&
    Object.keys(selected).length < (parsedArticles?.length || 0);

  const deleteRow = (absIndex) => {
    const next = parsedArticles?.filter((_, i) => i !== absIndex);
    setState({ parsedArticles: next });

    const selCopy = { ...selected };
    delete selCopy[absIndex];
    setSelected(selCopy);
  };

  // inline editing — updates store directly
  const updateField = (index, patch) => {
    const list = [...parsedArticles];
    list[index] = { ...list[index], ...patch };
    setState({ parsedArticles: list });
  };

  const handleSubmitSelected = async () => {
    try {
      setState({ is_load: true });
      const rows = parsedArticles || [];
      const chosen = rows
        ?.filter((_, i) => selected[i])
        ?.map((item) => ({
          name: item.name,
          group: item.group_id,
          type: item.type ?? null,
          operation: OPERATIONS.find((op) => +op.id === +item.operation_id)?.name || null,
        }));
      const res = await api_laravel("articles/add_parsed_articles", { articles: chosen });
      if (!res?.st) {
        throw new Error(res?.text || "Ошибка добавления статей");
      }
      setState({ articlesRefreshToken: Date.now(), parsedArticles: null });
      showAlert(`Добавили ${formatPlural(res.count, ["статью", "статьи", "статей"])}`, true);
      onClose();
    } catch (error) {
      showAlert(error?.message || "Ошибка добавления статей");
    } finally {
      setState({ is_load: false });
    }
  };

  return (
    <MyModal
      open={open}
      onClose={onClose}
      maxWidth="xl"
      title="Подготовка списка статей"
      actions={<></>}
      fullWidth
    >
      <DialogContent
        dividers
        sx={{ pt: 2 }}
      >
        <TableContainer sx={{ maxHeight: "60vh" }}>
          <Table
            size="small"
            stickyHeader
          >
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={indeterminate}
                    onChange={toggleAll}
                  />
                </TableCell>

                <TableCell sortDirection={orderBy === "name" ? order : false}>
                  <TableSortLabel
                    active={orderBy === "name"}
                    direction={orderBy === "name" ? order : "asc"}
                    onClick={() => handleSort("name")}
                  >
                    Наименование
                  </TableSortLabel>
                </TableCell>

                <TableCell sortDirection={orderBy === "group_id" ? order : false}>
                  <TableSortLabel
                    active={orderBy === "group_id"}
                    direction={orderBy === "group_id" ? order : "asc"}
                    onClick={() => handleSort("group_id")}
                  >
                    Группа
                  </TableSortLabel>
                </TableCell>

                <TableCell>Вид операции</TableCell>

                <TableCell padding="checkbox" />
              </TableRow>
            </TableHead>

            <TableBody>
              {sortedRows.map((row, sortedIndex) => {
                const absoluteIndex = parsedArticles.indexOf(row);
                const isChecked = !!selected[absoluteIndex];

                const opsForGroup = OPERATIONS.filter((op) => +op.group_id === +row.group_id);

                return (
                  <TableRow
                    key={absoluteIndex}
                    hover
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isChecked}
                        onChange={() => toggleRow(absoluteIndex)}
                      />
                    </TableCell>

                    {/* NAME EDIT */}
                    <TableCell sx={{ minWidth: 260 }}>
                      <TextField
                        value={row.name}
                        onChange={(e) => updateField(absoluteIndex, { name: e.target.value })}
                        fullWidth
                        size="small"
                      />
                    </TableCell>

                    {/* GROUP EDIT */}
                    <TableCell sx={{ minWidth: 220 }}>
                      <MySelect
                        label=""
                        data={GROUPS}
                        value={row.group_id}
                        func={(e) => {
                          const newGroup = e.target.value;
                          const defaultOp = OPERATIONS.find((op) => +op.group_id === +newGroup)?.id;

                          updateField(absoluteIndex, {
                            group_id: newGroup,
                            operation_id: defaultOp,
                          });
                        }}
                        is_none={false}
                        size="small"
                      />
                    </TableCell>

                    {/* OPERATION EDIT */}
                    <TableCell sx={{ minWidth: 220 }}>
                      <MySelect
                        label=""
                        data={opsForGroup}
                        value={row.operation_id}
                        func={(e) =>
                          updateField(absoluteIndex, {
                            operation_id: e.target.value,
                          })
                        }
                        is_none={false}
                        size="small"
                      />
                    </TableCell>

                    <TableCell padding="checkbox">
                      <IconButton
                        size="small"
                        onClick={() => deleteRow(absoluteIndex)}
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
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Отмена</Button>
        <Button
          variant="contained"
          onClick={handleSubmitSelected}
        >
          Импортировать выбранные ({Object.keys(selected).length})
        </Button>
      </DialogActions>
    </MyModal>
  );
}
