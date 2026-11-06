"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { api_laravel } from "@/src/api_new";
import {
  JacoButton,
  JacoCompactTabs,
  JacoResponsiveModalShell,
  JacoSearchField,
  JacoSurface,
  JacoTextInput,
} from "@/design-system/shared/ui";

import { interactiveRowProps } from "../table/interactiveRow";
import SkladItemNameButton from "../SkladItemNameButton";

const CATALOGS = [
  {
    key: "list",
    label: "Места хранения",
    singular: "место хранения",
    sortMethod: "save_sort",
    addMethod: "save_new",
    editMethod: "save_edit",
  },
  {
    key: "accounting_system",
    label: "Системы учета",
    singular: "систему учета",
    sortMethod: "save_sort_as",
    addMethod: "save_new_as",
    editMethod: "save_edit_as",
  },
];

async function request(method, data = {}) {
  const response = await api_laravel("sklad_storage", method, data);
  if (!response?.data || response.data.st === false) {
    throw new Error(response?.data?.text || "Не удалось выполнить запрос к справочнику");
  }
  return response.data;
}

export default function SkladStorageTab({ allowed, showAlert, refreshToken, onChanged }) {
  const [catalogIndex, setCatalogIndex] = useState(0);
  const [catalogs, setCatalogs] = useState({ list: [], accounting_system: [] });
  const [search, setSearch] = useState("");
  const [drafts, setDrafts] = useState({ list: {}, accounting_system: {} });
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const alive = useRef(true);
  const requestId = useRef(0);
  const catalog = CATALOGS[catalogIndex];

  const load = useCallback(async () => {
    if (allowed !== true) return;
    const id = ++requestId.current;
    setLoading(true);
    setError("");
    try {
      const data = await request("get_all");
      if (!Array.isArray(data.list) || !Array.isArray(data.accounting_system))
        throw new Error("Некорректный ответ справочника");
      if (alive.current && id === requestId.current) {
        setCatalogs({ list: data.list, accounting_system: data.accounting_system });
      }
    } catch (err) {
      if (alive.current && id === requestId.current)
        setError(err?.message || "Ошибка загрузки справочника");
    } finally {
      if (alive.current && id === requestId.current) setLoading(false);
    }
  }, [allowed]);

  useEffect(() => {
    alive.current = true;
    load();
    return () => {
      alive.current = false;
      requestId.current += 1;
    };
  }, [load, refreshToken]);

  const rows = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("ru");
    return catalogs[catalog.key].filter((item) =>
      String(item.name || "")
        .toLocaleLowerCase("ru")
        .includes(query),
    );
  }, [catalogs, catalog.key, search]);

  const save = async () => {
    if (!modal || busy || allowed !== true) return;
    const name = modal.name.trim();
    if (!name) {
      showAlert("Укажите название", false);
      return;
    }
    setBusy(true);
    try {
      await request(
        modal.id == null ? catalog.addMethod : catalog.editMethod,
        modal.id == null ? { name } : { id: modal.id, name },
      );
      onChanged();
      if (!alive.current) return;
      setModal(null);
      showAlert("Изменения сохранены", true);
    } catch (err) {
      if (alive.current) showAlert(err?.message || "Ошибка сохранения", false);
    } finally {
      if (alive.current) setBusy(false);
    }
  };

  const saveSort = async (item) => {
    const raw = drafts[catalog.key][item.id];
    if (raw === undefined || busy || allowed !== true) return;
    const value = String(raw).trim();
    if (!/^\d+$/.test(value)) {
      showAlert("Укажите целый неотрицательный порядок сортировки", false);
      return;
    }
    if (value === String(item.sort)) {
      setDrafts((old) => {
        const next = { ...old[catalog.key] };
        delete next[item.id];
        return { ...old, [catalog.key]: next };
      });
      return;
    }
    setBusy(true);
    try {
      await request(catalog.sortMethod, { id: item.id, value });
      onChanged();
      if (alive.current) {
        setDrafts((old) => {
          const next = { ...old[catalog.key] };
          delete next[item.id];
          return { ...old, [catalog.key]: next };
        });
        showAlert("Порядок сохранён", true);
      }
    } catch (err) {
      if (alive.current) showAlert(err?.message || "Ошибка сохранения порядка", false);
    } finally {
      if (alive.current) setBusy(false);
    }
  };

  const sortInput = (item) => (
    <JacoTextInput
      type="number"
      min={0}
      step={1}
      value={drafts[catalog.key][item.id] ?? item.sort ?? ""}
      onChange={(event) => {
        const value = event.target.value;
        setDrafts((old) => ({ ...old, [catalog.key]: { ...old[catalog.key], [item.id]: value } }));
      }}
      onBlur={() => saveSort(item)}
      disabled={busy || loading}
      inputProps={{ "aria-label": `Сортировка: ${item.name}` }}
      sx={{ width: 110 }}
    />
  );

  return (
    <JacoSurface
      sx={{
        width: "100%",
        maxWidth: 1080,
        minWidth: 0,
        boxSizing: "border-box",
        mx: "auto",
        p: { xs: 1.5, sm: 2 },
      }}
    >
      <Stack spacing={2}>
        <JacoCompactTabs
          value={catalogIndex}
          onChange={(_, value) => {
            setCatalogIndex(value);
            setSearch("");
          }}
          items={CATALOGS.map((item, value) => ({ id: item.key, value, label: item.label }))}
          aria-label="Справочники мест хранения"
        />
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" } }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center" }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700 }}
            >
              {catalog.label}
            </Typography>
            <Chip
              size="small"
              label={catalogs[catalog.key].length}
            />
          </Stack>
          <JacoButton
            startIcon={<AddIcon />}
            onClick={() => setModal({ name: "" })}
            disabled={busy || loading || Boolean(error)}
            sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
          >
            Добавить {catalog.singular}
          </JacoButton>
        </Stack>
        <JacoSearchField
          label="Поиск"
          value={search}
          minLength={1}
          onValueChange={setSearch}
          sx={{ maxWidth: { sm: 360 } }}
        />
        {loading ? (
          <Typography role="status">Загрузка справочника…</Typography>
        ) : error ? (
          <Stack spacing={1}>
            <Typography color="error">{error}</Typography>
            <Box>
              <JacoButton
                tone="secondary"
                onClick={load}
              >
                Повторить
              </JacoButton>
            </Box>
          </Stack>
        ) : !rows.length ? (
          <Typography color="text.secondary">
            {search ? "Ничего не найдено" : "Записей пока нет"}
          </Typography>
        ) : (
          <>
            <TableContainer sx={{ display: { xs: "none", sm: "block" }, maxWidth: "100%" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Название</TableCell>
                    <TableCell>Сортировка</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((item) => (
                    <TableRow
                      key={item.id}
                      {...interactiveRowProps(
                        item.name,
                        () => setModal({ id: item.id, name: item.name || "" }),
                        !busy,
                      )}
                    >
                      <TableCell>{item.name}</TableCell>
                      <TableCell onClick={(event) => event.stopPropagation()}>
                        {sortInput(item)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Stack
              spacing={1}
              sx={{ display: { xs: "flex", sm: "none" } }}
            >
              {rows.map((item) => (
                <JacoSurface
                  key={item.id}
                  sx={{ p: 1.5 }}
                >
                  <Stack spacing={1}>
                    <SkladItemNameButton
                      name={item.name}
                      onClick={() => setModal({ id: item.id, name: item.name || "" })}
                      disabled={busy}
                    />
                    <Stack
                      direction="row"
                      sx={{ justifyContent: "space-between", alignItems: "center" }}
                    >
                      <Typography variant="body2">Сортировка</Typography>
                      {sortInput(item)}
                    </Stack>
                  </Stack>
                </JacoSurface>
              ))}
            </Stack>
          </>
        )}
      </Stack>
      <JacoResponsiveModalShell
        open={Boolean(modal)}
        onClose={() => {
          if (!busy) setModal(null);
        }}
        title={`${modal?.id == null ? "Добавить" : "Изменить"} ${catalog.singular}`}
        maxWidth="sm"
        actions={
          <Stack
            direction="row"
            spacing={1}
            sx={{ width: "100%", justifyContent: "space-between" }}
          >
            <JacoButton
              tone="secondary"
              disabled={busy}
              onClick={() => setModal(null)}
            >
              Отмена
            </JacoButton>
            <JacoButton
              tone="success"
              disabled={busy}
              onClick={save}
            >
              Сохранить
            </JacoButton>
          </Stack>
        }
      >
        <JacoTextInput
          label="Название"
          value={modal?.name || ""}
          disabled={busy}
          onChange={(event) => setModal((old) => ({ ...old, name: event.target.value }))}
        />
      </JacoResponsiveModalShell>
    </JacoSurface>
  );
}
