"use client";

import { Grid } from "@mui/material";
import { useCategoryStore } from "./useCategoryStore";
import { MyAutocomplite, MyTextInput } from "@/components/shared/Forms";
import {useSiteSettingStore} from "@/components/site_setting/useSiteSettingStore";

export function CategoryModal() {
  const currentItem = useCategoryStore((state) => state.item);
  const [rootCategories] = useCategoryStore((state) => [
    state.categories.filter((c) => c.parent_id === 0),
  ]);
  const [acces] = useSiteSettingStore((state) => [
    state.acces,
  ]);
  const { changeItemProp, changeAutoComplete } = useCategoryStore.getState();
  return (
    <>
      <Grid
        container
        spacing={3}
      >
        <Grid
          size={{
            xs: 12,
            sm: 12
          }}>
          <MyTextInput
            label="Название категории"
            disabled={acces.category_view && !acces.category_edit}
            value={currentItem?.name || ""}
            func={(e) => changeItemProp("name", e)}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 12
          }}>
          <MyTextInput
            label="Сроки хранения"
            multiline={true}
            disabled={acces.category_view && !acces.category_edit}
            maxRows={4}
            value={currentItem?.shelf_life || ""}
            func={(e) => changeItemProp("shelf_life", e)}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 12
          }}>
          {/* <MySelect
            label="Родительская категория"
            data={listCat ? listCat : []}
            value={currentItem ? currentItem.parent_id : ""}
            func={(e) => changeItemProp("parent_id", e)}
          /> */}
          <MyAutocomplite
            label="Родительская категория"
            multiple={false}
            disabled={acces.category_view && !acces.category_edit}
            data={rootCategories || []}
            disableCloseOnSelect={false}
            value={rootCategories?.find((c) => c.id === currentItem?.parent_id) || {id:0,name:"Не задано"}}
            func={(...params) => changeAutoComplete("parent_id", ...params)}
          />
        </Grid>
      </Grid>
    </>
  );
}
