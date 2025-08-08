import { MyAutocomplite, MySelect, MyTextInput, TextEditor } from "@/ui/elements";
import { usePagesStore } from "./usePagesStore";
import { Grid, Typography } from "@mui/material";

export function PageTextModal({ itemName, cities, showAlert, ...restProps }) {
  const { categories, changeItemProp, changeItemText, changeAutoComplete } =
    usePagesStore.getState();
  const currentItem = usePagesStore((s) => s.item);
  return (
    <Grid
      container
      spacing={3}
    >
      <Grid
        item
        xs={12}
        sm={6}
      >
        <MySelect
          is_none={false}
          label="Город"
          data={cities || []}
          value={currentItem?.city_id || -1}
          func={(e) => changeItemProp("city_id", e)}
        />
      </Grid>

      <Grid
        item
        xs={12}
        sm={6}
      >
        <MyAutocomplite
          label="Категория"
          multiple={false}
          data={categories || []}
          disableCloseOnSelect={false}
          value={categories.find((c) => c.id === currentItem?.category_id) || 0}
          func={(...params) => changeAutoComplete("category_id", ...params)}
        />
      </Grid>

      <Grid
        item
        xs={12}
        sm={6}
      >
        <MyTextInput
          label="Страница"
          value={currentItem?.page_name || ""}
          func={(e) => changeItemProp("page_name", e)}
        />
      </Grid>

      <Grid
        item
        xs={12}
        sm={6}
      >
        <MyTextInput
          label="Ссылка"
          value={currentItem?.link || ""}
          func={(e) => changeItemProp("link", e)}
        />
      </Grid>

      <Grid
        item
        xs={12}
        sm={6}
      >
        <MyTextInput
          label="Заголовок (H1-H2)"
          value={currentItem?.page_h || ""}
          func={(e) => changeItemProp("page_h", e)}
        />
      </Grid>

      <Grid
        item
        xs={12}
        sm={6}
      >
        <MyTextInput
          label="Заголовок (title)"
          value={currentItem?.title || ""}
          func={(e) => changeItemProp("title", e)}
        />
      </Grid>

      <Grid
        item
        xs={12}
        sm={12}
      >
        <MyTextInput
          label="Описание (description)"
          multiline={true}
          maxRows={5}
          value={currentItem?.description || ""}
          func={(e) => changeItemProp("description", e)}
        />
      </Grid>

      <Grid
        item
        xs={12}
        sm={12}
      >
        <Typography gutterBottom>Текст на сайте</Typography>
        <TextEditor
          value={currentItem?.content || ""}
          func={(e) => changeItemText("content", e)}
        />
      </Grid>
    </Grid>
  );
}
