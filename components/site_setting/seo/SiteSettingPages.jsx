"use client";

import { useCallback, useEffect, useState } from "react";
import { useSiteSettingStore } from "../useSiteSettingStore";
import { usePagesStore } from "./usePagesStore";
import useSavePage from "../hooks/useSavePage";
import {
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { PageTextModal } from "./PageTextModal";
import { MySelect } from "@/components/shared/Forms";

export function SiteSettingPages() {
  const submodule = "seo";
  // Settings state
  const [cityId, cities, acces, setCityId] = useSiteSettingStore((state) => [
    state.city_id,
    state.cities,
    state.acces,
    state.setCityId,
  ]);
  const createModal = useSiteSettingStore((state) => state.createModal);
  const closeModal = useSiteSettingStore((state) => state.closeModal);
  const setModalTitle = useSiteSettingStore((state) => state.setModalTitle);
  const showAlert = useSiteSettingStore((state) => state.showAlert);
  // Page text state
  const { getData, setModuleName, setPages, setItem, setItemName, setCategories } =
    usePagesStore.getState();
  const pages = usePagesStore((s) => s.pages);
  const itemName = usePagesStore((s) => s.itemName);
  const moduleName = usePagesStore((s) => s.moduleName);

  const [modalPrefix, setModalPrefix] = useState(useSiteSettingStore.getState().modalTitle);

  const fetchCoreData = useCallback(async () => {
    const data = {
      submodule,
      city_id: cityId,
    };
    try {
      const response = await getData("get_page_text_data", data);
      setModuleName(response.submodule.name);
      setPages(response.pages);
      setCategories(response.categories);
    } catch (e) {
      showAlert(`Fetch error: ${e}`, false);
    }
  }, [cityId]);

  useEffect(() => {
    const data = {
      submodule,
      city_id: cityId,
    };
    getData("get_page_text_data", data).then((response) => {
      setModuleName(response.submodule.name);
      setPages(response.pages);
      setCategories(response.categories);
    }).catch((e) => {
      showAlert(`Fetch error: ${e}`, false);
    })
  }, [cityId]);

  const { saveNew, saveEdit, setPageItem } = useSavePage(
    closeModal,
    showAlert,
    getData,
    fetchCoreData
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
        setItem(null), setItemName("");
      }
    );
  };

  useEffect(() => {
    fetchCoreData();
  }, []);

  // update page name in modal title
  useEffect(
    () => setModalTitle(`${modalPrefix}${itemName ? `: ${itemName}` : ""}`),
    [modalPrefix, itemName]
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
          xs: 12
        }}>
        <Typography variant="h5">{moduleName}</Typography>

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
          sm: 12
        }}>
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
          sm: 12
        }}>
        <TableContainer>
          <Table>
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
              {pages
                .map((page, key) => (
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
    </Grid>
  );
}
