"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { MyAutocomplite, MyCheckBox, MyTextInput } from "@/ui/Forms";
import { createEmptyMail, getPointOptions } from "./vendorFormUtils";

function VendorEditorForm({
  mode = "create",
  vendor,
  vendorCities,
  allCities,
  mails,
  allPoints,
  onVendorChange,
  onVendorToggle,
  onVendorCitiesChange,
  onMailChange,
  onAddMail,
  onRemoveMail,
  onCancel,
  onSubmit,
  isSubmitting,
}) {
  const pointOptions = getPointOptions(allPoints, vendorCities);

  return (
    <Stack spacing={3}>
      <Card
        variant="outlined"
        sx={{ borderRadius: 3 }}
      >
        <CardContent>
          <Stack spacing={3}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700 }}
            >
              Основное
            </Typography>

            <Grid
              container
              spacing={2}
            >
              <Grid size={{ xs: 12, md: 6 }}>
                <MyTextInput
                  label="Наименование"
                  value={vendor.name}
                  func={(event) => onVendorChange("name", event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <MyTextInput
                  label="Мин. сумма заказа"
                  value={vendor.min_price}
                  isDecimalMask
                  func={(event) => onVendorChange("min_price", event.target.value)}
                />
              </Grid>
              <Grid size={12}>
                <MyTextInput
                  label="Описание"
                  value={vendor.text}
                  func={(event) => onVendorChange("text", event.target.value)}
                  multiline
                  minRows={3}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <MyTextInput
                  label="ИНН"
                  value={vendor.inn}
                  func={(event) => onVendorChange("inn", event.target.value)}
                  type="number"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <MyTextInput
                  label="ОГРН"
                  value={vendor.ogrn}
                  func={(event) => onVendorChange("ogrn", event.target.value)}
                  type="number"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <MyTextInput
                  label="БИК"
                  value={vendor.bik}
                  func={(event) => onVendorChange("bik", event.target.value)}
                  type="number"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <MyTextInput
                  label="Расчетный счет"
                  value={vendor.rc}
                  func={(event) => onVendorChange("rc", event.target.value)}
                  type="number"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <MyTextInput
                  label="Телефон"
                  value={vendor.phone}
                  func={(event) => onVendorChange("phone", event.target.value)}
                  type="tel"
                />
              </Grid>
              <Grid size={12}>
                <MyTextInput
                  label="Юридический адрес"
                  value={vendor.addr}
                  func={(event) => onVendorChange("addr", event.target.value)}
                  multiline
                  minRows={2}
                />
              </Grid>
              <Grid size={12}>
                <MyAutocomplite
                  multiple
                  label="Локации"
                  data={allCities}
                  value={vendorCities}
                  func={(_, value) => onVendorCitiesChange(value)}
                />
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Card>

      <Card
        variant="outlined"
        sx={{ borderRadius: 3 }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700 }}
            >
              Настройки
            </Typography>

            <Grid
              container
              spacing={1}
            >
              {mode === "update" ? (
                <Grid size={{ xs: 12, md: 4 }}>
                  <MyCheckBox
                    label="Активность"
                    value={Boolean(Number(vendor.is_show))}
                    func={() => onVendorToggle("is_show")}
                  />
                </Grid>
              ) : null}
              <Grid size={{ xs: 12, md: 4 }}>
                <MyCheckBox
                  label="Работа по счетам"
                  value={Boolean(Number(vendor.bill_ex))}
                  func={() => onVendorToggle("bill_ex")}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <MyCheckBox
                  label="Необходима картинка накладной"
                  value={Boolean(Number(vendor.need_img_bill_ex))}
                  func={() => onVendorToggle("need_img_bill_ex")}
                />
              </Grid>
              {mode === "update" ? (
                <Grid size={{ xs: 12, md: 4 }}>
                  <MyCheckBox
                    label="Приоритетный поставщик"
                    value={Boolean(Number(vendor.is_priority))}
                    func={() => onVendorToggle("is_priority")}
                  />
                </Grid>
              ) : null}
            </Grid>
          </Stack>
        </CardContent>
      </Card>

      <Card
        variant="outlined"
        sx={{ borderRadius: 3 }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700 }}
              >
                Контакты по точкам
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => onAddMail(createEmptyMail())}
              >
                Добавить email
              </Button>
            </Stack>

            {(mails || []).length === 0 ? (
              <Typography color="text.secondary">Пока нет привязанных email.</Typography>
            ) : null}

            {(mails || []).map((mail, index) => (
              <Box key={`${mail.point_id?.id ?? "new"}-${index}`}>
                <Grid
                  container
                  spacing={2}
                  alignItems="flex-start"
                >
                  <Grid size={{ xs: 12, md: 4 }}>
                    <MyAutocomplite
                      multiple={false}
                      label="Точка"
                      data={pointOptions}
                      value={mail.point_id}
                      func={(_, value) => onMailChange(index, "point_id", value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <MyTextInput
                      label="Email"
                      value={mail.mail}
                      func={(event) => onMailChange(index, "mail", event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 10, md: 3 }}>
                    <MyTextInput
                      label="Комментарий"
                      value={mail.comment}
                      func={(event) => onMailChange(index, "comment", event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 2, md: 1 }}>
                    <IconButton
                      sx={{ mt: 0.5 }}
                      onClick={() => onRemoveMail(index)}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Grid>
                </Grid>
                {index < mails.length - 1 ? <Divider sx={{ mt: 2 }} /> : null}
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Stack
        direction={{ xs: "column-reverse", sm: "row" }}
        spacing={2}
        justifyContent="flex-end"
      >
        {onCancel ? <Button onClick={onCancel}>Отмена</Button> : null}
        <Button
          variant="contained"
          startIcon={<SaveOutlinedIcon />}
          onClick={onSubmit}
          disabled={isSubmitting || !vendor.name?.trim()}
        >
          {mode === "update" ? "Сохранить" : "Создать поставщика"}
        </Button>
      </Stack>
    </Stack>
  );
}

export default VendorEditorForm;
