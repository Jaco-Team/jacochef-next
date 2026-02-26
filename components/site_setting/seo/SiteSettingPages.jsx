"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSiteSettingStore } from "../useSiteSettingStore";
import { usePagesStore } from "./usePagesStore";
import useSavePage from "../hooks/useSavePage";
import {
  Box,
  Button,
  Divider,
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
import { PageTextModal } from "./PageTextModal";
import { MySelect, MyTextInput } from "@/ui/Forms";
import useApi from "@/src/hooks/useApi";
import { useDebounce } from "@/src/hooks/useDebounce";
import HistoryLog from "@/ui/history/HistoryLog";
import HistoryLogAccordion from "@/ui/history/HistoryLogAccordion";

export function SiteSettingPages() {
  const submodule = "seo";
  // Settings state
  const {
    city_id: cityId,
    cities,
    acces,
    setCityId,
    createModal,
    closeModal,
    setModalTitle,
    showAlert,
  } = useSiteSettingStore((s) => ({
    city_id: s.city_id,
    cities: s.cities,
    acces: s.acces,
    setCityId: s.setCityId,
    createModal: s.createModal,
    closeModal: s.closeModal,
    setModalTitle: s.setModalTitle,
    showAlert: s.showAlert,
  }));
  // Page text state
  const {
    setModuleName,
    setPages,
    setItem,
    setItemName,
    setCategories,
    setFilteredPages,
    pages,
    filteredPages,
    itemName,
    moduleName,
    history,
    setHistory,
  } = usePagesStore((s) => ({
    getData: s.getData,
    setModuleName: s.setModuleName,
    setPages: s.setPages,
    setItem: s.setItem,
    setItemName: s.setItemName,
    setCategories: s.setCategories,
    setFilteredPages: s.setFilteredPages,
    pages: s.pages,
    filteredPages: s.filteredPages,
    itemName: s.itemName,
    moduleName: s.moduleName,
    history: s.history,
    setHistory: s.setHistory,
  }));

  // fetching data
  const getData = async (method, data = {}) => {
    const { setIsLoad, module: parentModule } = useSiteSettingStore.getState();
    const { api_laravel } = useApi(parentModule);
    setIsLoad(true);
    try {
      // inject submodule type
      data.submodule = submodule;
      const result = await api_laravel(method, data);
      return result;
    } catch (e) {
      throw e;
    } finally {
      setIsLoad(false);
    }
  };

  const [modalPrefix, setModalPrefix] = useState(useSiteSettingStore.getState().modalTitle);

  const fetchCoreData = useCallback(async () => {
    const data = {
      city_id: cityId,
    };
    try {
      const res = await getData("get_page_text_data", data);
      if (!res?.st) throw new Error(res?.text || "Unknown error");
      setModuleName(res.submodule.name);
      setPages(res.pages);
      setCategories(res.categories);
      setHistory(res.history);
    } catch (e) {
      showAlert(`Fetch seo pages error: ${e.message}`, false);
    }
  }, [cityId]);

  // filtering with debounce
  const [query, setQuery] = useState("");

  const filterPages = useDebounce((search) => {
    if (!search || search.length < 3) {
      setFilteredPages(pages);
      return;
    }

    const q = search.toLowerCase();
    const filtered = pages.filter((p) =>
      [p.title, p.description, p.content].some((val) => val.toLowerCase().includes(q)),
    );
    setFilteredPages(filtered);
  }, 300);

  useEffect(() => {
    filterPages(query);
  }, [query, pages]);

  useEffect(() => {
    fetchCoreData();
  }, [cityId]);

  const { saveNew, saveEdit, setPageItem } = useSavePage(
    closeModal,
    showAlert,
    getData,
    fetchCoreData,
  );

  const openModal = async (action, title, id = null) => {
    setModalPrefix(title);
    setPageItem(id);
    createModal(
      () => (
        <PageTextModal
          cities={cities}
          action={action}
        />
      ),
      modalPrefix,
      () => (
        <>
          {acces.seo_edit ? (
            <Button
              variant="contained"
              onClick={async () => (action === "newPage" ? await saveNew() : await saveEdit())}
            >
              {action === "newPage" ? "Добавить" : "Сохранить"}
            </Button>
          ) : null}
        </>
      ),
      () => {
        (setItem(null), setItemName(""));
      },
    );
  };

  // update page name in modal title
  useEffect(
    () => setModalTitle(`${modalPrefix}${itemName ? `: ${itemName}` : ""}`),
    [modalPrefix, itemName],
  );

  return (
    <Grid
      container
      spacing={3}
    >
      <Grid
        sx={{
          display: "flex",
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          gap: "1em",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
        size={{
          xs: 12,
        }}
      >
        <Typography variant="h5">{moduleName}</Typography>

        <MyTextInput
          type="search"
          size="small"
          value={query}
          func={(e) => setQuery(e.target.value)}
          placeholder="Найти страницу…"
          sx={{ width: 300, ml: "auto" }}
        />

        {acces.seo_edit ? (
          <Button
            onClick={() => openModal("newPage", "Новая страница")}
            variant="contained"
          >
            Добавить новую страницу
          </Button>
        ) : null}
      </Grid>
      <Grid
        sx={{ p: 3 }}
        size={{
          xs: 12,
          sm: 12,
        }}
      >
        <MySelect
          data={cities}
          value={cityId}
          func={(e) => setCityId(e.target?.value)}
          label="Город"
          is_none={false}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 12,
        }}
      >
        <TableContainer sx={{ maxHeight: "50dvh" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell style={{ width: "2%" }}>#</TableCell>
                <TableCell style={{ width: "10%" }}>Название</TableCell>
                <TableCell style={{ width: "8%" }}>Город</TableCell>
                <TableCell style={{ width: "20%" }}>Заголовок (title)</TableCell>
                <TableCell style={{ width: "45%" }}>Описание (description)</TableCell>
                <TableCell style={{ width: "15%" }}>Последнее обновление</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPages.map((page, key) => (
                <TableRow
                  key={page.id}
                  hover
                  style={{ cursor: "pointer" }}
                  onClick={() => openModal("editPage", "Редактирование страницы", page.id)}
                >
                  <TableCell>{key + 1}</TableCell>
                  <TableCell style={{ color: "#ff1744", fontWeight: 700 }}>
                    {page.page_name}
                  </TableCell>
                  <TableCell>{page.city_name}</TableCell>
                  <TableCell>{page.title}</TableCell>
                  <TableCell>{page.description}</TableCell>
                  <TableCell>{page.date_time_update}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      {history?.length > 0 && (
        <Grid size={12}>
          <HistoryLogAccordion
            history={history}
            // customDiffView={CustomDiffView}
          />
        </Grid>
      )}
    </Grid>
  );
}
