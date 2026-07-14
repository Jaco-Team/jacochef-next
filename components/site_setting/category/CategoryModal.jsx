"use client";

import CloseIcon from "@mui/icons-material/Close";
import {
  Button,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useCategoryStore } from "./useCategoryStore";
import { MyAutocomplite, MyTextInput } from "@/ui/Forms";
import { useSiteSettingStore } from "@/components/site_setting/useSiteSettingStore";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";

export function CategoryModal() {
  const currentItem = useCategoryStore((state) => state.item);
  const itemsNew = useCategoryStore((state) => state.itemsNew);
  const [rootCategories] = useCategoryStore((state) => [
    state.categories.filter((c) => c.parent_id === 0),
  ]);

  const access = useSiteSettingStore((state) => state.access);
  const canEdit = (key) => handleUserAccess(access).userCan("edit", key);
  const canViewCategoryItems = handleUserAccess(access).userCan("view", "category_items");
  const canEditCategoryItems = handleUserAccess(access).userCan("edit", "category_items");

  const {
    addCategoryItem,
    changeAutoComplete,
    changeCategoryItem,
    changeCategoryItemCount,
    changeItemProp,
    deleteCategoryItem,
  } = useCategoryStore.getState();
  const categoryItems = currentItem?.items || [];

  return (
    <>
      <Grid
        container
        spacing={3}
      >
        <Grid
          size={{
            xs: 12,
            sm: 12,
          }}
        >
          <MyTextInput
            label="Название категории"
            disabled={!canEdit("category")}
            value={currentItem?.name || ""}
            func={(e) => changeItemProp("name", e)}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 12,
          }}
        >
          <MyTextInput
            label="Сроки хранения"
            multiline={true}
            disabled={!canEdit("category")}
            maxRows={4}
            value={currentItem?.shelf_life || ""}
            func={(e) => changeItemProp("shelf_life", e)}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 12,
          }}
        >
          {/* <MySelect
            label="Родительская категория"
            data={listCat ? listCat : []}
            value={currentItem ? currentItem.parent_id : ""}
            func={(e) => changeItemProp("parent_id", e)}
          /> */}
          <MyAutocomplite
            label="Родительская категория"
            multiple={false}
            disabled={!canEdit("category")}
            data={rootCategories || []}
            disableCloseOnSelect={false}
            value={
              rootCategories?.find((c) => c.id === currentItem?.parent_id) || {
                id: 0,
                name: "Не задано",
              }
            }
            func={(...params) => changeAutoComplete("parent_id", ...params)}
          />
        </Grid>

        {canViewCategoryItems ? (
          <Grid size={12}>
            <Grid
              container
              mb={1}
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="subtitle1">Товары категории</Typography>
              {canEditCategoryItems ? (
                <Button
                  variant="outlined"
                  onClick={addCategoryItem}
                >
                  Добавить товар
                </Button>
              ) : null}
            </Grid>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                    <TableCell>Товар</TableCell>
                    <TableCell sx={{ width: "180px" }}>Количество</TableCell>
                    <TableCell sx={{ width: "56px" }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categoryItems.map((categoryItem, index) => {
                    const selectedItemIds = categoryItems
                      .filter((_, itemIndex) => itemIndex !== index)
                      .map((item) => Number(item.item_id))
                      .filter((itemId) => itemId > 0);
                    const availableItems = itemsNew.filter(
                      (item) => !selectedItemIds.includes(Number(item.id)),
                    );

                    return (
                      <TableRow key={`category-item-${index}`}>
                        <TableCell>
                          <MyAutocomplite
                            multiple={false}
                            disabled={!canEditCategoryItems}
                            data={availableItems}
                            disableCloseOnSelect={false}
                            value={
                              itemsNew.find(
                                (item) => Number(item.id) === Number(categoryItem.item_id),
                              ) || null
                            }
                            func={(...params) => changeCategoryItem(index, ...params)}
                          />
                        </TableCell>
                        <TableCell>
                          <MyTextInput
                            type="number"
                            min={1}
                            step={1}
                            disabled={!canEditCategoryItems}
                            value={categoryItem.count}
                            func={(event) => changeCategoryItemCount(index, event)}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {canEditCategoryItems ? (
                            <IconButton
                              aria-label="Удалить товар"
                              onClick={() => deleteCategoryItem(index)}
                              size="small"
                            >
                              <CloseIcon />
                            </IconButton>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        ) : null}
      </Grid>
    </>
  );
}
