import { useCallback, useEffect, useState } from "react";
import { useSiteSettingStore } from "../useSiteSettingStore";
import { usePagesStore } from "./usePagesStore";
import useSavePage from "../hooks/useSavePage";
import {
  Backdrop,
  Button,
  CircularProgress,
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

export function SiteSettingPages() {
  const submodule = "seo";
  // Settings state
  const cityId = useSiteSettingStore((state) => state.city_id);
  const cities = useSiteSettingStore((state) => state.cities);
  const createModal = useSiteSettingStore((state) => state.createModal);
  const closeModal = useSiteSettingStore((state) => state.closeModal);
  const setModalTitle = useSiteSettingStore((state) => state.setModalTitle);
  const showAlert = useSiteSettingStore((state) => state.showAlert);
  // Page text state
  const { getData, setModuleName, setPages, setItem, setItemName, setCategories } =
    usePagesStore.getState();
  const pages = usePagesStore((s) => s.pages);
  const item = usePagesStore((s) => s.item);
  const itemName = usePagesStore((s) => s.itemName);
  const moduleName = usePagesStore((s) => s.moduleName);
  const isLoading = usePagesStore((s) => s.isLoading);

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

  const { saveNew, saveEdit, setPageItem } = useSavePage(closeModal, showAlert, getData, fetchCoreData);

  const openModal = async (action, title, id = null) => {
    setModalPrefix(title);
    setPageItem(id);
    createModal(
      () => (
        <PageTextModal
          showAlert={showAlert}
          cities={cities}
          pages={pages}
          action={action}
          itemName={itemName}
        />
      ),
      modalPrefix,
      () => (
        <Button
          variant="contained"
          onClick={async () => (action === "newPage" ? await saveNew() : await saveEdit())}
        >
          {action === "newPage" ? "Добавить" : "Сохранить"}
        </Button>
      ),
      () => {
        setItem(null), setItemName("");
      }
    );
  };

  useEffect(() => {
    fetchCoreData();
  }, [fetchCoreData]);

  // update banner name in modal title
  useEffect(
    () => setModalTitle(`${modalPrefix}${itemName ? `: ${itemName}` : ""}`),
    [modalPrefix, itemName]
  );

  return (
    <Grid
      container
      spacing={3}
      style={{ position: "relative" }}
    >
      <Backdrop
        style={{ zIndex: 99, position: "absolute", inset: 0 }}
        open={isLoading}
      >
        <CircularProgress
          color="inherit"
          style={{ top: "1em" }}
        />
      </Backdrop>
      {!!moduleName && (
        <>
          <Grid
            item
            xs={12}
            sx={{
              display: "flex",
              flexDirection: {
                xs: "column", // mobile = stacked
                sm: "row", // tablet+ = horizontal
              },
              gap: "1em",
              alignItems: "flex-start", // or 'center' based on your taste
              justifyContent: "space-between", // optional
            }}
          >
            <Typography variant="h5">{moduleName}</Typography>

            <Button
              onClick={() => openModal("newPage", "Новая страница")}
              variant="contained"
            >
              Добавить новую страницу
            </Button>
          </Grid>

          <Grid
            item
            xs={12}
            sm={12}
          >
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
                  {pages.map((page, key) => (
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
        </>
      )}
    </Grid>
  );
}
