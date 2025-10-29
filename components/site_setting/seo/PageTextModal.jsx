"use client";

import { MyAutocomplite, MySelect, MyTextInput, TextEditor } from "@/ui/Forms";
import { usePagesStore } from "./usePagesStore";
import { Grid, Typography } from "@mui/material";
import { useSiteSettingStore } from "@/components/site_setting/useSiteSettingStore";

export function PageTextModal({ cities }) {
  const { categories, changeItemProp, changeItemText, changeAutoComplete } =
    usePagesStore.getState();
  const currentItem = usePagesStore((s) => s.item);
  const [acces] = useSiteSettingStore((state) => [state.acces]);
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
          disabled={acces.seo_view && !acces.seo_edit}
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
          disabled={acces.seo_view && !acces.seo_edit}
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
          disabled={acces.seo_view && !acces.seo_edit}
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
          disabled={acces.seo_view && !acces.seo_edit}
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
          disabled={acces.seo_view && !acces.seo_edit}
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
          disabled={acces.seo_view && !acces.seo_edit}
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
          disabled={acces.seo_view && !acces.seo_edit}
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
            (acces.seo_view && !acces.seo_edit) ||
            (!acces.edit_spec_text_access && currentItem?.rule_edit_text)
          }
          value={currentItem?.content || ""}
          func={(e) => changeItemText("content", e)}
        />
      </Grid>
    </Grid>
  );
}
