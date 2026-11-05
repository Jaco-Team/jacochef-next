"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Chip,
  Grid,
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
  JacoResponsiveModalShell,
  JacoSearchField,
  JacoSurface,
  JacoTextInput,
} from "@/design-system/shared/ui";
import SkladItemNameButton from "../SkladItemNameButton";
import { interactiveRowProps } from "../table/interactiveRow";
import { sortAllergens } from "./sortAllergens.mjs";

async function request(method, payload = {}) {
  const response = await api_laravel("allergens", method, payload);
  if (!response?.data || response.data.st === false) {
    throw new Error(
      response?.data?.text || response?.text || "Не удалось выполнить запрос к аллергенам",
    );
  }
  return response.data;
}

export default function SkladAllergensTab({ showAlert, refreshToken, allowed }) {
  const [rows, setRows] = useState([]);
  const [sortDraft, setSortDraft] = useState({});
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const alive = useRef(true);
  const requestId = useRef(0);
  const editedInput = useRef(null);

  const load = useCallback(
    async ({ preserveSort = false } = {}) => {
      if (allowed !== true) return;
      const id = ++requestId.current;
      setLoading(true);
      setLoadError("");
      try {
        const data = await request("get_all");
        if (!Array.isArray(data.allergens))
          throw new Error("Некорректный ответ справочника аллергенов");
        if (alive.current && id === requestId.current) {
          setRows(data.allergens);
          if (!preserveSort) setSortDraft({});
        }
      } catch (error) {
        if (alive.current && id === requestId.current)
          setLoadError(error?.message || "Ошибка загрузки аллергенов");
      } finally {
        if (alive.current && id === requestId.current) setLoading(false);
      }
    },
    [allowed],
  );

  useEffect(() => {
    alive.current = true;
    load();
    return () => {
      alive.current = false;
      requestId.current += 1;
    };
  }, [load, refreshToken]);

  useLayoutEffect(() => {
    const input = editedInput.current;
    editedInput.current = null;
    if (!input?.isConnected) return;
    if (document.activeElement === document.body) {
      input.focus({ preventScroll: true });
    }
    if (document.activeElement !== input) return;
    const bounds = input.getBoundingClientRect();
    if (bounds.top < 0 || bounds.bottom > document.documentElement.clientHeight) {
      input.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }, [sortDraft]);

  const filtered = useMemo(() => {
    const value = search.trim().toLocaleLowerCase("ru");
    const visible = value
      ? rows.filter((row) =>
          [row.name, row.dop_name].some((part) =>
            String(part || "")
              .toLocaleLowerCase("ru")
              .includes(value),
          ),
        )
      : rows;
    return sortAllergens(visible, sortDraft);
  }, [rows, search, sortDraft]);

  const save = async () => {
    if (!modal || busy || allowed !== true) return;
    setBusy(true);
    try {
      const payload = { name: modal.name, dop_name: modal.dop_name };
      if (modal.id != null) payload.id = modal.id;
      await request(modal.id == null ? "save_new" : "save_edit", payload);
      if (!alive.current) return;
      setModal(null);
      showAlert("Аллерген сохранён", true);
      await load({ preserveSort: true });
    } catch (error) {
      if (alive.current) showAlert(error?.message || "Ошибка сохранения аллергена", false);
    } finally {
      if (alive.current) setBusy(false);
    }
  };

  const saveSort = async () => {
    if (busy || allowed !== true) return;
    const aller = Object.entries(sortDraft).map(([id, sort]) => ({
      id: Number(id),
      sort: String(sort).trim(),
    }));
    if (!aller.length) return;
    if (aller.some((row) => row.sort === "" || !/^\d+$/.test(row.sort))) {
      showAlert("Укажите целый неотрицательный порядок сортировки", false);
      return;
    }
    setBusy(true);
    try {
      await request("save_sort", { aller });
      if (!alive.current) return;
      showAlert("Порядок сохранён", true);
      await load();
    } catch (error) {
      if (alive.current) showAlert(error?.message || "Ошибка сохранения порядка", false);
    } finally {
      if (alive.current) setBusy(false);
    }
  };

  const sortInput = (row) => (
    <JacoTextInput
      type="number"
      min={0}
      step={1}
      value={sortDraft[row.id] ?? row.sort ?? ""}
      onChange={(event) => {
        editedInput.current = event.currentTarget;
        setSortDraft((current) => ({ ...current, [row.id]: event.target.value }));
      }}
      disabled={busy}
      inputProps={{ "aria-label": `Сортировка: ${row.name}` }}
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
              Аллергены
            </Typography>
            <Chip
              size="small"
              label={rows.length}
            />
          </Stack>
          <JacoButton
            startIcon={<AddIcon />}
            onClick={() => setModal({ name: "", dop_name: "" })}
            disabled={busy || loading || Boolean(loadError)}
            sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
          >
            Добавить аллерген
          </JacoButton>
        </Stack>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ alignItems: { xs: "stretch", sm: "center" } }}
        >
          <JacoSearchField
            label="Поиск"
            value={search}
            minLength={1}
            onValueChange={setSearch}
            sx={{ maxWidth: { sm: 360 } }}
          />
          <JacoButton
            tone="secondary"
            onClick={saveSort}
            disabled={busy || loading || Boolean(loadError) || !Object.keys(sortDraft).length}
            sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
          >
            Сохранить порядок
          </JacoButton>
        </Stack>
        {loading ? (
          <Typography>Загрузка аллергенов…</Typography>
        ) : loadError ? (
          <Stack spacing={1}>
            <Typography color="error">{loadError}</Typography>
            <Box>
              <JacoButton
                tone="secondary"
                onClick={load}
              >
                Повторить
              </JacoButton>
            </Box>
          </Stack>
        ) : !filtered.length ? (
          <Typography color="text.secondary">
            {search ? "Аллергены не найдены" : "Аллергенов пока нет"}
          </Typography>
        ) : (
          <>
            <TableContainer sx={{ display: { xs: "none", sm: "block" }, maxWidth: "100%" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Название</TableCell>
                    <TableCell>Доп. название</TableCell>
                    <TableCell>Сортировка</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((row) => (
                    <TableRow
                      key={row.id}
                      {...interactiveRowProps(
                        row.name,
                        () =>
                          setModal({
                            id: row.id,
                            name: row.name || "",
                            dop_name: row.dop_name || "",
                          }),
                        !busy,
                      )}
                    >
                      <TableCell>{row.name || "—"}</TableCell>
                      <TableCell>{row.dop_name || "—"}</TableCell>
                      <TableCell onClick={(event) => event.stopPropagation()}>
                        {sortInput(row)}
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
              {filtered.map((row) => (
                <JacoSurface
                  key={row.id}
                  sx={{ p: 1.5 }}
                >
                  <Stack spacing={1}>
                    <SkladItemNameButton
                      name={row.name}
                      onClick={() =>
                        setModal({ id: row.id, name: row.name || "", dop_name: row.dop_name || "" })
                      }
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {row.dop_name || "—"}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: "center", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2">Сортировка</Typography>
                      {sortInput(row)}
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
        title={modal?.id == null ? "Новый аллерген" : "Редактирование аллергена"}
        maxWidth="sm"
        actions={
          <Stack
            direction="row"
            spacing={1}
            sx={{ width: "100%", justifyContent: "space-between" }}
          >
            <JacoButton
              tone="danger"
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
        <Grid
          container
          spacing={2}
        >
          <Grid size={12}>
            <JacoTextInput
              label="Название"
              value={modal?.name || ""}
              disabled={busy}
              onChange={(event) =>
                setModal((current) => ({ ...current, name: event.target.value }))
              }
            />
          </Grid>
          <Grid size={12}>
            <JacoTextInput
              label="Доп. название"
              value={modal?.dop_name || ""}
              disabled={busy}
              onChange={(event) =>
                setModal((current) => ({ ...current, dop_name: event.target.value }))
              }
            />
          </Grid>
        </Grid>
      </JacoResponsiveModalShell>
    </JacoSurface>
  );
}
