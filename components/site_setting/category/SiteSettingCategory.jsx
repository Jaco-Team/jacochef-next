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
import { Fragment, useCallback, useEffect, useState } from "react";
import useSaveCategory from "../hooks/useSaveCategory";
import { useCategoryStore } from "./useCategoryStore";
import { useSiteSettingStore } from "../useSiteSettingStore";
import { MyTextInput } from "@/ui/elements";
import { CategoryModal } from "./CategoryModal";

export function SiteSettingCategory() {
  const submodule = "category";
  // Settings state
  const cities = useSiteSettingStore((state) => state.cities);
  const createModal = useSiteSettingStore((state) => state.createModal);
  const closeModal = useSiteSettingStore((state) => state.closeModal);
  const setModalTitle = useSiteSettingStore((state) => state.setModalTitle);
  const showAlert = useSiteSettingStore((state) => state.showAlert);
  // Category store
  const { getData, setModuleName, setItem, setItemName, setCategories, changeSort } =
    useCategoryStore.getState();
  const itemName = useCategoryStore((s) => s.itemName);
  const moduleName = useCategoryStore((s) => s.moduleName);
  const isLoading = useCategoryStore((s) => s.isLoading);
  const categories = useCategoryStore((state) => state.categories);
  const rootCategories = categories.filter((c) => c.parent_id === 0);
  const getSubCategories = useCallback(
    (id) => categories.filter((c) => c.parent_id === id),
    [categories]
  );
  const [modalPrefix, setModalPrefix] = useState(useSiteSettingStore.getState().modalTitle);

  const fetchCoreData = useCallback(async () => {
    const data = {
      submodule,
    };
    try {
      const response = await getData("get_category_data", data);
      setModuleName(response.submodule.name);
      setCategories(response.categories);
    } catch (e) {
      showAlert(`Fetch error: ${e}`, false);
    }
  }, [setCategories]);

  const { saveNew, saveEdit, setCategoryItem } = useSaveCategory(
    closeModal,
    showAlert,
    getData,
    fetchCoreData
  );

  const saveSort = useCallback(async (id, event) => {
    const data = {
      id,
      sort: event.target.value,
    };
    const res = await getData("save_sort_category", data);
    if (!res.st) {
      showAlert(`Save error: ${res.text}`, false);
      return;
    }
    showAlert(`Сортировка изменена`, true);
    await fetchCoreData();
  }, []);

  const openModal = async (action, title, id = null) => {
    setModalPrefix(title);
    setCategoryItem(id);
    createModal(
      () => (
        <CategoryModal
          showAlert={showAlert}
          action={action}
        />
      ),
      modalPrefix,
      () => (
        <Button
          variant="contained"
          onClick={async () => (action === "newCategory" ? await saveNew() : await saveEdit())}
        >
          {action === "newCategory" ? "Добавить" : "Сохранить"}
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
        open={isLoading}
        style={{ zIndex: 99, position: "absolute", inset: 0 }}
      >
        <CircularProgress color="inherit" />
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
              onClick={() => openModal("newCategory", "Новая категория")}
              variant="contained"
            >
              Добавить новую категорию
            </Button>
          </Grid>
          <Grid
            item
            xs={12}
            sm={12}
            mb={10}
          >
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                    <TableCell>#</TableCell>
                    <TableCell sx={{ minWidth: "300px" }}>Название</TableCell>
                    <TableCell>Сортировка</TableCell>
                    <TableCell sx={{ minWidth: "500px" }}>Сроки хранения</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rootCategories.map((item, index) => {
                    const subcategories = getSubCategories(item.id);
                    return subcategories.length > 0 ? (
                      <Fragment key={item.id}>
                        <TableRow
                          hover
                          sx={{ "& th": { border: "none" } }}
                        >
                          <TableCell>{index + 1}</TableCell>
                          <TableCell
                            onClick={() =>
                              openModal("editCategory", "Редактирование категории", item.id)
                            }
                            sx={{ fontWeight: "bold", cursor: "pointer", color: "#c03" }}
                          >
                            {item.name}
                          </TableCell>
                          <TableCell>
                            <MyTextInput
                              label=""
                              value={item.sort}
                              func={(e) => changeSort(item.id, e)}
                              onBlur={(e) => saveSort(item.id, e)}
                            />
                          </TableCell>
                          <TableCell sx={{ minWidth: "500px" }}>{item.shelf_life}</TableCell>
                        </TableRow>
                        {subcategories.map((subcat, key) => (
                          <TableRow
                            hover
                            key={subcat.id}
                          >
                            <TableCell></TableCell>
                            <TableCell
                              onClick={() =>
                                openModal("editCategory", "Редактирование категории", subcat.id)
                              }
                              sx={{
                                paddingLeft: 10,
                                alignItems: "center",
                                minWidth: "300px",
                                cursor: "pointer",
                              }}
                            >
                              <Typography variant="body2">{subcat.name}</Typography>
                            </TableCell>
                            <TableCell>
                              <MyTextInput
                                label=""
                                value={subcat.sort}
                                func={(e) => changeSort(subcat.id, e)}
                                onBlur={(e) => saveSort(subcat.id, e)}
                              />
                            </TableCell>
                            <TableCell sx={{ minWidth: "500px" }}>{subcat.shelf_life}</TableCell>
                          </TableRow>
                        ))}
                      </Fragment>
                    ) : (
                      <TableRow
                        hover
                        key={item.id}
                        sx={{ "& th": { border: "none" } }}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell
                          onClick={() =>
                            openModal("editCategory", "Редактирование категории", item.id)
                          }
                          sx={{ fontWeight: "bold", cursor: "pointer", color: "#c03" }}
                        >
                          {item.name}
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            label=""
                            value={item.sort}
                            func={(e) => changeSort(item.id, e)}
                            onBlur={(e) => saveSort(item.id, e)}
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: "500px" }}>{item.shelf_life}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </>
      )}
    </Grid>
  );
}
