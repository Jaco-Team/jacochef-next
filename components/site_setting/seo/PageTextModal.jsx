"use client";

import { MyAutocomplite, MySelect, MyTextInput, TextEditor } from "@/ui/Forms";
import { usePagesStore } from "./usePagesStore";
import { Grid, Typography } from "@mui/material";
import { useSiteSettingStore } from "@/components/site_setting/useSiteSettingStore";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";

export function PageTextModal({ cities }) {
  const { categories, changeItemProp, changeItemText, changeAutoComplete } =
    usePagesStore.getState();
  const currentItem = usePagesStore((s) => s.item);

  const access = useSiteSettingStore((state) => state.access);
  const canEdit = (key) => handleUserAccess(access).userCan("edit", key);
  const canAccess = (key) => handleUserAccess(access).userCan("access", key);

  return (
    <Grid
      container
      spacing={3}
    >
      <Grid
        size={{
          xs: 12,
          sm: 6,
        }}
      >
        <MySelect
          is_none={false}
          label="Город"
          data={cities || []}
          disabled={!canEdit("seo")}
          value={currentItem?.city_id || -1}
          func={(e) => changeItemProp("city_id", e)}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 6,
        }}
      >
        <MyAutocomplite
          label="Категория"
          multiple={false}
          disabled={!canEdit("seo")}
          data={categories || []}
          disableCloseOnSelect={false}
          value={categories.find((c) => c.id === currentItem?.category_id) || 0}
          func={(...params) => changeAutoComplete("category_id", ...params)}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 6,
        }}
      >
        <MyTextInput
          label="Страница"
          disabled={!canEdit("seo")}
          value={currentItem?.page_name || ""}
          func={(e) => changeItemProp("page_name", e)}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 6,
        }}
      >
        <MyTextInput
          label="Ссылка"
          disabled={!canEdit("seo")}
          value={currentItem?.link || ""}
          func={(e) => changeItemProp("link", e)}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 6,
        }}
      >
        <MyTextInput
          label="Заголовок (H1-H2)"
          disabled={!canEdit("seo")}
          value={currentItem?.page_h || ""}
          func={(e) => changeItemProp("page_h", e)}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 6,
        }}
      >
        <MyTextInput
          label="Заголовок (title)"
          disabled={!canEdit("seo")}
          value={currentItem?.title || ""}
          func={(e) => changeItemProp("title", e)}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 12,
        }}
      >
        <MyTextInput
          label="Описание (description)"
          multiline={true}
          disabled={!canEdit("seo")}
          maxRows={5}
          value={currentItem?.description || ""}
          func={(e) => changeItemProp("description", e)}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 12,
        }}
      >
        <Typography gutterBottom>Текст на сайте</Typography>
        <TextEditor
          disabled={
            !canEdit("seo") || (!canAccess("edit_spec_text") && currentItem?.rule_edit_text)
          }
          value={currentItem?.content || ""}
          func={(e) => changeItemText("content", e)}
        />
      </Grid>
    </Grid>
  );
}
