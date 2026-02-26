"use client";

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
import { Fragment, useCallback, useEffect, useState } from "react";
import useSaveCategory from "../hooks/useSaveCategory";
import { useCategoryStore } from "./useCategoryStore";
import { useSiteSettingStore } from "../useSiteSettingStore";
import { MyTextInput } from "@/ui/Forms";
import { CategoryModal } from "./CategoryModal";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ColorPickerCell } from "@/ui/Forms/ColorPickerCell";
import useApi from "@/src/hooks/useApi";
import HistoryLog from "@/ui/history/HistoryLog";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";

export function SiteSettingCategory() {
  const submodule = "category";

  const getData = async (method, data = {}) => {
    const { setIsLoad, module: parentModule } = useSiteSettingStore.getState();
    setIsLoad(true);
    try {
      const { api_laravel } = useApi(parentModule);
      // inject submodule type
      data.submodule = "category";
      const result = await api_laravel(method, data);
      return result;
    } catch (e) {
      throw e;
    } finally {
      setIsLoad(false);
    }
  };
  // Settings store
  const createModal = useSiteSettingStore((state) => state.createModal);
  const closeModal = useSiteSettingStore((state) => state.closeModal);
  const setModalTitle = useSiteSettingStore((state) => state.setModalTitle);
  const showAlert = useSiteSettingStore((state) => state.showAlert);
  const access = useSiteSettingStore((state) => state.access);

  const canEdit = (key) => handleUserAccess(access).userCan("edit", key);
  // Category store
  const {
    itemName,
    moduleName,
    categories,
    setModuleName,
    setItem,
    setItemName,
    setCategories,
    changeSort,
    setHistory,
    history,
  } = useCategoryStore((s) => ({
    itemName: s.itemName,
    moduleName: s.moduleName,
    categories: s.categories,
    setModuleName: s.setModuleName,
    setItem: s.setItem,
    setItemName: s.setItemName,
    setCategories: s.setCategories,
    changeSort: s.changeSort,
    setHistory: s.setHistory,
    history: s.history,
  }));

  const rootCategories = categories.filter((c) => c.parent_id === 0);
  const getSubCategories = useCallback(
    (id) => categories.filter((c) => c.parent_id === id),
    [categories],
  );
  const [modalPrefix, setModalPrefix] = useState(useSiteSettingStore.getState().modalTitle);
  const [color, setColor] = useState("#000000");

  const fetchCoreData = useCallback(async () => {
    const data = {
      submodule,
    };
    try {
      const res = await getData("get_category_data", data);
      if (!res?.st) {
        throw new Error(res?.text || "Unknown error");
      }
      setModuleName(res.submodule.name);
      setCategories(res.categories);
      setHistory(res.history);
    } catch (e) {
      console.error(e);
      showAlert(`Fetch error: ${e}`, false);
    }
  }, [setCategories]);

  const { saveNew, saveEdit, setCategoryItem } = useSaveCategory(
    closeModal,
    showAlert,
    getData,
    fetchCoreData,
  );

  const saveSort = useDebounce(async (id, event) => {
    const targetCategory = useCategoryStore.getState().categories.find((cat) => cat.id === id);
    const data = {
      id,
      sort: event.target.value,
    };
    const res = await getData("save_sort_category", data);
    if (!res.st) {
      showAlert(`Save error: ${res.text}`, false);
      return;
    }
    showAlert(`Сортировка изменена: ${targetCategory.name} ${event.target.value}`, true);
    await fetchCoreData();
  }, 1000);

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
        <>
          {canEdit("category") ? (
            <Button
              variant="contained"
              onClick={async () => (action === "newCategory" ? await saveNew() : await saveEdit())}
            >
              {action === "newCategory" ? "Добавить" : "Сохранить"}
            </Button>
          ) : null}
        </>
      ),
      () => {
        (setItem(null), setItemName(""));
      },
    );
  };

  useEffect(() => {
    fetchCoreData();
  }, []);

  // update banner name in modal title
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
        {canEdit("category") ? (
          <Button
            onClick={() => openModal("newCategory", "Новая категория")}
            variant="contained"
          >
            Добавить новую категорию
          </Button>
        ) : null}
      </Grid>
      <Grid
        mb={10}
        size={{
          xs: 12,
          sm: 12,
        }}
      >
        <TableContainer>
          <Table
            size="small"
            stickyHeader
          >
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                <TableCell>#</TableCell>
                <TableCell sx={{ minWidth: "200px" }}>Название</TableCell>
                <TableCell>Сортировка</TableCell>
                <TableCell sx={{ minWidth: "200px" }}>Сроки хранения</TableCell>
                <TableCell sx={{ minWidth: "200px" }}>Для курьеров</TableCell>
                <TableCell sx={{ minWidth: "200px" }}>Для кухни</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rootCategories.map((item, index) => {
                const subcategories = getSubCategories(item.id);
                return subcategories.length > 0 ? (
                  <Fragment key={`parent-${item.id}-f`}>
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
                          type="number"
                          label=""
                          disabled={!canEdit("category")}
                          value={item.sort}
                          func={(e) => changeSort(item.id, e)}
                          onBlur={(e) => saveSort(item.id, e)}
                        />
                      </TableCell>
                      <TableCell sx={{ minWidth: "200px" }}>{item.shelf_life}</TableCell>
                      <ColorPickerCell
                        value={color}
                        onChange={(e) => setColor(e)}
                      />
                      <ColorPickerCell
                        value={color}
                        onChange={(e) => setColor(e)}
                      />
                    </TableRow>
                    {subcategories.map((subcat, key) => (
                      <TableRow
                        hover
                        key={`sub-${subcat.id}`}
                      >
                        <TableCell>{`${index + 1}.${key + 1}`}</TableCell>
                        <TableCell
                          onClick={() =>
                            openModal("editCategory", "Редактирование категории", subcat.id)
                          }
                          sx={{
                            paddingLeft: "2em",
                            alignItems: "center",
                            minWidth: "200px",
                            cursor: "pointer",
                          }}
                        >
                          <Typography variant="body2">{subcat.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            type="number"
                            label=""
                            disabled={!canEdit("category")}
                            value={subcat.sort}
                            func={(e) => changeSort(subcat.id, e)}
                            onBlur={(e) => saveSort(subcat.id, e)}
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: "200px" }}>{subcat.shelf_life}</TableCell>
                        <ColorPickerCell
                          value={color}
                          onChange={(e) => setColor(e)}
                        />
                        <ColorPickerCell
                          value={color}
                          onChange={(e) => setColor(e)}
                        />
                      </TableRow>
                    ))}
                  </Fragment>
                ) : (
                  <TableRow
                    hover
                    key={`parent-${item.id}`}
                    sx={{ "& th": { border: "none" } }}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell
                      onClick={() => openModal("editCategory", "Редактирование категории", item.id)}
                      sx={{ fontWeight: "bold", cursor: "pointer", color: "#c03" }}
                    >
                      {item.name}
                    </TableCell>
                    <TableCell>
                      <MyTextInput
                        type="number"
                        label=""
                        disabled={!canEdit("category")}
                        value={item.sort}
                        func={(e) => changeSort(item.id, e)}
                        onBlur={(e) => saveSort(item.id, e)}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: "200px" }}>{item.shelf_life}</TableCell>
                    <ColorPickerCell
                      value={color}
                      onChange={(e) => setColor(e)}
                    />
                    <ColorPickerCell
                      value={color}
                      onChange={(e) => setColor(e)}
                    />
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      {history?.length > 0 && (
        <Grid size={12}>
          <HistoryLog history={history} />
        </Grid>
      )}
    </Grid>
  );
}
