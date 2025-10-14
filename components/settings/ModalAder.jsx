"use client";

import { MyAutocomplite, MyCheckBox, MyDatePickerNew, MyTextInput } from "@/ui/Forms";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Slide,
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

export default function ModalAder({
  open,
  onClose,
  getData,
  setErrStatus,
  setErrText,
  setOpenAlert,
}) {
  const [formData, setFormData] = useState({
    date_start: dayjs(new Date()).format("YYYY-MM-DD"),
    date_end: dayjs(new Date()).add(7, "day").format("YYYY-MM-DD"),
    where_active: 0,
    city_ids: [],
    point_ids: [],
    name: "",
    description: "",
    order_type: 0,
    pay_type: [],
    sum_order: 0,
    in_order: 0,
    items_ids: [],
    category_ids: [],
    name_pack: "",
  });
  const [points, setPoints] = useState([]);
  const [cities, setCities] = useState([]);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);

  const showAlert = (text, status = false) => {
    setErrStatus(status);
    setErrText(text);
    setOpenAlert(true);
  };

  const saveNewAder = () => {
    if (!formData.items_ids && !formData.category_ids) {
      showAlert(
        `Необходимо выбрать хотя бы ${formData.in_order === 0 ? "одно блюдо" : "одну категорию"}`,
        false,
      );
      return;
    }
    const formatData = {
      ...formData,
      date_start: dayjs(formData.date_start).format("YYYY-MM-DD"),
      date_end: dayjs(formData.date_end).format("YYYY-MM-DD"),
      point_ids: formData.point_ids.map((el) => el.id).join(","),
      items_ids: formData.items_ids.map((el) => el.id).join(","),
      city_ids: formData.city_ids.map((el) => el.id).join(","),
      category_ids: formData.category_ids.map((el) => el.id).join(","),
      pay_type: formData.pay_type.join(","),
    };
    getData("save_ader", { formatData }).then((data) => {
      if (!data.st) {
        showAlert(data.text, data.st);
      } else {
        onClose();
      }
    });
  };

  useEffect(() => {
    getData("get_all_ader").then((data) => {
      setPoints(data.points);
      setItems(data.items);
      setCities(data.cities);
      setCategories(data.categories);
    });
  }, []);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      TransitionComponent={Slide}
      TransitionProps={{ direction: "up" }}
    >
      <DialogTitle>Добавление новой рекламы</DialogTitle>
      <DialogContent>
        <Grid
          container
          spacing={2}
          style={{ marginBottom: 16, marginTop: 4 }}
        >
          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <Typography> Общее</Typography>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyTextInput
              label="Название"
              value={formData.name}
              func={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <MyTextInput
              label="Описание"
              multiline={true}
              maxRows={5}
              value={formData.description}
              func={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </Grid>
        </Grid>

        <Grid
          container
          spacing={2}
          style={{ marginBottom: 16, marginTop: 4 }}
        >
          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyDatePickerNew
              label="Дата начала"
              value={formData.date_start}
              func={(e) => setFormData((prev) => ({ ...prev, date_start: e }))}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyDatePickerNew
              label="Дата окончания"
              value={formData.date_end}
              func={(e) => setFormData((prev) => ({ ...prev, date_end: e }))}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <Autocomplete
              size="small"
              options={[0, 1, 2]}
              getOptionLabel={(option) => {
                switch (option) {
                  case 0:
                    return "Вся сеть";
                  case 1:
                    return "В городе";
                  case 2:
                    return "В кафе";
                  default:
                    return option;
                }
              }}
              value={formData.where_active}
              onChange={(_, value) => {
                setFormData((prev) => ({ ...prev, where_active: value }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Где работает"
                />
              )}
              sx={{ mb: 2 }}
            />
          </Grid>
          {formData.where_active === 2 && (
            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <MyAutocomplite
                label="Кафе"
                data={points}
                multiple={true}
                value={formData.point_ids}
                func={(event, data) => {
                  setFormData((prev) => ({ ...prev, point_ids: data }));
                }}
              />
            </Grid>
          )}
          {formData.where_active === 1 && (
            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <MyAutocomplite
                label="Город"
                data={cities}
                multiple={true}
                value={formData.city_ids}
                func={(event, data) => {
                  setFormData((prev) => ({ ...prev, city_ids: data }));
                }}
              />
            </Grid>
          )}
        </Grid>

        <Grid
          container
          spacing={2}
          style={{ marginBottom: 16, marginTop: 4 }}
        >
          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <Typography>Условие</Typography>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyCheckBox
              label="На первый заказ клиента"
              value={!!formData.order_type}
              func={(_, value) => {
                setFormData((prev) => ({ ...prev, order_type: +value }));
              }}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyTextInput
              label="Сумма заказа от"
              value={formData.sum_order}
              type="number"
              func={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  sum_order: e.target.value,
                }))
              }
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <Autocomplete
              size="small"
              multiple
              options={["Кафе", "Контакт-центр", "Клиент"]}
              value={formData.pay_type}
              onChange={(_, value) => {
                setFormData((prev) => ({ ...prev, pay_type: value }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Тип оформления"
                />
              )}
              sx={{ mb: 2 }}
            />
          </Grid>
        </Grid>
        <Grid
          container
          spacing={2}
          style={{ marginBottom: 16 }}
        >
          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <Autocomplete
              size="small"
              options={[0, 1]}
              getOptionLabel={(option) => {
                switch (option) {
                  case 0:
                    return "Блюдо";
                  case 1:
                    return "Категория";
                  default:
                    return option;
                }
              }}
              value={formData.in_order}
              onChange={(_, value) => {
                setFormData((prev) => ({ ...prev, in_order: value }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="В заказе есть"
                />
              )}
              sx={{ mb: 2 }}
            />
          </Grid>
          {formData.in_order === 0 && (
            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <MyAutocomplite
                label="Блюда"
                data={items}
                multiple={true}
                value={formData.items_ids}
                func={(event, data) => {
                  setFormData((prev) => ({ ...prev, items_ids: data }));
                }}
              />
            </Grid>
          )}
          {formData.in_order === 1 && (
            <Grid
              size={{
                xs: 12,
                sm: 3,
              }}
            >
              <MyAutocomplite
                label="Категории"
                data={categories}
                multiple={true}
                value={formData.category_ids}
                func={(event, data) => {
                  setFormData((prev) => ({ ...prev, category_ids: data }));
                }}
              />
            </Grid>
          )}
        </Grid>
        <Grid
          container
          spacing={2}
          style={{ marginBottom: 16, marginTop: 4 }}
        >
          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <Typography>Добавляемая позиция</Typography>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyTextInput
              label="Название на сборке"
              value={formData.name_pack}
              func={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name_pack: e.target.value,
                }))
              }
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          onClick={saveNewAder}
        >
          Добавить
        </Button>
      </DialogActions>
    </Dialog>
  );
}
