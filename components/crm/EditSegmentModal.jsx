import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import { Close, Tune } from "@mui/icons-material";
import React, { useState, useEffect } from "react";
import {
  MyAutocomplite,
  MyCheckBox,
  MyDatePickerNew,
  MyTextInput,
  MyAutoCompleteWithAll,
} from "@/ui/Forms";
import dayjs from "dayjs";
import useMyAlert from "@/src/hooks/useMyAlert";
import MyAlert from "@/ui/MyAlert";

const orderTypes = [
  { id: 1, name: "Доставка", type: "delivery" },
  { id: 2, name: "Самовывоз", type: "pickup" },
  { id: 3, name: "В зале", type: "in_hall" },
  { id: 4, name: "На вынос", type: "takeaway" },
];

const sources = [
  { id: 1, name: "Сайт", type: "site" },
  { id: 2, name: "Кафе", type: "cafe" },
  { id: 3, name: "КЦ", type: "kc" },
];

const genderOptions = [
  { id: 1, name: "Все", type: "all", value: "all" },
  { id: 2, name: "Мужчина", type: "male", value: "male" },
  { id: 3, name: "Женщина", type: "female", value: "female" },
];

const emailConsentOptions = [
  { id: 1, name: "Да", value: 1 },
  { id: 2, name: "Нет", value: 0 },
];

// Секция с заголовком
const Section = ({ title, icon: Icon, children }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      mb: 3,
      border: "1px solid #e0e0e0",
      borderRadius: 2,
      bgcolor: "#fafafa",
    }}
  >
    <Typography
      variant="subtitle1"
      sx={{
        mb: 2,
        pb: 1,
        borderBottom: "2px solid #1976d2",
        display: "flex",
        alignItems: "center",
        gap: 1,
        fontWeight: 600,
      }}
    >
      {Icon && (
        <Icon
          fontSize="small"
          color="primary"
        />
      )}
      {title}
    </Typography>
    {children}
  </Paper>
);

// Компонент для диапазона (от - до)
const RangeInput = ({ label, valueMin, valueMax, onChangeMin, onChangeMax }) => (
  <Grid
    container
    spacing={1}
  >
    <Grid size={{ xs: 6 }}>
      <MyTextInput
        type="number"
        label={`${label} от`}
        value={valueMin}
        func={onChangeMin}
      />
    </Grid>
    <Grid size={{ xs: 6 }}>
      <MyTextInput
        type="number"
        label={`${label} до`}
        value={valueMax}
        func={onChangeMax}
      />
    </Grid>
  </Grid>
);

const parseIdsToArray = (str, dataArray) => {
  if (!str) return [];
  const ids = String(str)
    .split(",")
    .map((id) => parseInt(id.trim()));
  return dataArray.filter((item) => ids.includes(item.id));
};

export const EditSegmentModal = ({
  open,
  onClose,
  categories,
  points,
  cities,
  updateSegment,
  segmentData,
}) => {
  const [form, setForm] = useState({
    id: null,
    // Клиентские данные
    gender: null,
    segment_name: "",
    birth_date_start: null,
    birth_date_end: null,
    days_before_birthday: "",
    has_email: null,
    consent_email: null,
    consent_sms: null,
    consent_push: null,

    // Заказы
    orders_count_min: "",
    orders_count_max: "",
    avg_check_min: "",
    avg_check_max: "",
    total_sum_min: "",
    total_sum_max: "",
    last_order_date_start: null,
    last_order_date_end: null,
    days_from_last: "",
    days_from_first: "",
    period_days: "",
    categories: [],
    promo: "",
    order_types: [],

    // География
    cities: [],
    points: [],

    // Маркетинг
    sources: [],

    // UTM
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_term: "",
    utm_content: "",
  });

  useEffect(() => {
    if (segmentData && open) {
      setForm({
        id: segmentData.id || null,
        segment_name: segmentData.segment_name || "",
        gender: genderOptions.find((val) => val.type === segmentData.gender) || null,
        birth_date_start: segmentData.birth_date_start || null,
        birth_date_end: segmentData.birth_date_end || null,
        days_before_birthday: segmentData.days_before_birthday || "",
        has_email:
          segmentData.has_email !== null
            ? emailConsentOptions.find((val) => val.value === segmentData.has_email)
            : null,
        consent_email:
          segmentData.consent_email !== null
            ? emailConsentOptions.find((val) => val.value === segmentData.consent_email)
            : null,
        consent_sms:
          segmentData.consent_sms !== null
            ? emailConsentOptions.find((val) => val.value === segmentData.consent_sms)
            : null,
        consent_push:
          segmentData.consent_push !== null
            ? emailConsentOptions.find((val) => val.value === segmentData.consent_push)
            : null,
        orders_count_min: segmentData.orders_count_min || "",
        orders_count_max: segmentData.orders_count_max || "",
        avg_check_min: segmentData.avg_check_min || "",
        avg_check_max: segmentData.avg_check_max || "",
        total_sum_min: segmentData.total_sum_min || "",
        total_sum_max: segmentData.total_sum_max || "",
        last_order_date_start: segmentData.last_order_date_start || null,
        last_order_date_end: segmentData.last_order_date_end || null,
        days_from_last: segmentData.days_from_last || "",
        days_from_first: segmentData.days_from_first || "",
        period_days: segmentData.period_days || "",
        categories: parseIdsToArray(segmentData.categories, categories),
        promo: segmentData.promo || "",
        order_types: parseIdsToArray(segmentData.order_types, orderTypes),
        cities: parseIdsToArray(segmentData.cities, cities),
        points: parseIdsToArray(segmentData.points, points),
        sources: parseIdsToArray(segmentData.sources, sources),
        utm_source: segmentData.utm_source || "",
        utm_medium: segmentData.utm_medium || "",
        utm_campaign: segmentData.utm_campaign || "",
        utm_term: segmentData.utm_term || "",
        utm_content: segmentData.utm_content || "",
      });
    }
  }, [segmentData, open, categories, cities, points]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isUtmFilled = () => {
    return (
      form.utm_source || form.utm_medium || form.utm_campaign || form.utm_term || form.utm_content
    );
  };

  const isFormValid = () => {
    const hasAnyFilter =
      form.gender ||
      form.birth_date_start ||
      form.days_before_birthday ||
      form.has_email !== null ||
      form.consent_email !== null ||
      form.consent_sms !== null ||
      form.consent_push !== null ||
      form.orders_count_min ||
      form.orders_count_max ||
      form.avg_check_min ||
      form.avg_check_max ||
      form.total_sum_min ||
      form.total_sum_max ||
      form.last_order_date_start ||
      form.days_from_last ||
      form.days_from_first ||
      form.period_days ||
      form.categories.length ||
      form.promo ||
      form.cities.length ||
      form.points.length ||
      form.order_types.length ||
      form.sources.length ||
      isUtmFilled();

    return hasAnyFilter;
  };
  const { isAlert, showAlert, closeAlert, alertStatus, alertMessage } = useMyAlert();

  const handleSave = () => {
    if (!form.segment_name) {
      showAlert("Заполните название сегментации", false);
      return;
    }
    if (!isFormValid()) {
      showAlert("Заполните хотя бы одно условие для создания сегмента", false);
      return;
    }

    const saveData = {
      ...form,
      categories: form.categories.map((cat) => cat.id).join(","),
      order_types: form.order_types.map((type) => type.id).join(","),
      cities: form.cities.map((city) => city.id).join(","),
      points: form.points.map((point) => point.id).join(","),
      sources: form.sources.map((source) => source.id).join(","),
    };

    updateSegment(saveData);
    console.log("Update segment data:", saveData);
    onClose();
  };

  const handleReset = () => {
    // Сброс к исходным данным сегмента
    if (segmentData) {
      setForm({
        id: segmentData.id || null,
        segment_name: segmentData.segment_name || "",
        gender: segmentData.gender || null,
        birth_date_start: segmentData.birth_date_start || null,
        birth_date_end: segmentData.birth_date_end || null,
        days_before_birthday: segmentData.days_before_birthday || "",
        has_email: segmentData.has_email !== null ? segmentData.has_email : null,
        consent_email: segmentData.consent_email !== null ? segmentData.consent_email : null,
        consent_sms: segmentData.consent_sms !== null ? segmentData.consent_sms : null,
        consent_push: segmentData.consent_push !== null ? segmentData.consent_push : null,
        orders_count_min: segmentData.orders_count_min || "",
        orders_count_max: segmentData.orders_count_max || "",
        avg_check_min: segmentData.avg_check_min || "",
        avg_check_max: segmentData.avg_check_max || "",
        total_sum_min: segmentData.total_sum_min || "",
        total_sum_max: segmentData.total_sum_max || "",
        last_order_date_start: segmentData.last_order_date_start || null,
        last_order_date_end: segmentData.last_order_date_end || null,
        days_from_last: segmentData.days_from_last || "",
        days_from_first: segmentData.days_from_first || "",
        period_days: segmentData.period_days || "",
        categories: parseIdsToArray(segmentData.categories, categories),
        promo: segmentData.promo || "",
        order_types: parseIdsToArray(segmentData.order_types, orderTypes),
        cities: parseIdsToArray(segmentData.cities, cities),
        points: parseIdsToArray(segmentData.points, points),
        sources: parseIdsToArray(segmentData.sources, sources),
        utm_source: segmentData.utm_source || "",
        utm_medium: segmentData.utm_medium || "",
        utm_campaign: segmentData.utm_campaign || "",
        utm_term: segmentData.utm_term || "",
        utm_content: segmentData.utm_content || "",
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      scroll="paper"
    >
      <MyAlert
        isOpen={isAlert}
        onClose={closeAlert}
        status={alertStatus}
        text={alertMessage}
      />
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "#cc0033",
          color: "white",
        }}
      >
        <Typography
          variant="h6"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <Tune />
          Редактирование сегмента клиентов
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ color: "white" }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{ bgcolor: "#f5f5f5", p: 3 }}
      >
        <Section title="Название сегментации">
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <MyTextInput
              type="text"
              label="Название сегментации"
              value={form.segment_name}
              func={({ target }) => setField("segment_name", target?.value)}
            />
          </Grid>
        </Section>

        <Section
          title="Клиентские данные"
          icon={null}
        >
          <Grid
            container
            spacing={2}
          >
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MyAutocomplite
                label="Пол"
                multiple={false}
                data={genderOptions}
                value={form.gender}
                func={(data, value) => setField("gender", value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MyDatePickerNew
                label="Дата рождения от"
                value={form.birth_date_start ? dayjs(form.birth_date_start) : null}
                func={(e) => setField("birth_date_start", e)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MyDatePickerNew
                label="Дата рождения до"
                value={form.birth_date_end ? dayjs(form.birth_date_end) : null}
                func={(e) => setField("birth_date_end", e)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MyTextInput
                type="number"
                label="Дней до дня рождения"
                value={form.days_before_birthday}
                func={({ target }) => setField("days_before_birthday", target?.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MyAutocomplite
                label="Наличие E-mail"
                multiple={false}
                data={emailConsentOptions}
                value={form.has_email}
                func={(data, value) => setField("has_email", value)}
              />
            </Grid>
          </Grid>

          <Typography
            variant="subtitle2"
            sx={{ mt: 2, mb: 1, color: "#666" }}
          >
            Согласие на рассылки
          </Typography>
          <Grid
            container
            spacing={2}
          >
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MyAutocomplite
                label="Email рассылка"
                multiple={false}
                data={emailConsentOptions}
                value={form.consent_email}
                func={(data, value) => setField("consent_email", value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MyAutocomplite
                label="SMS рассылка"
                multiple={false}
                data={emailConsentOptions}
                value={form.consent_sms}
                func={(data, value) => setField("consent_sms", value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MyAutocomplite
                label="Push уведомления"
                multiple={false}
                data={emailConsentOptions}
                value={form.consent_push}
                func={(data, value) => setField("consent_push", value)}
              />
            </Grid>
          </Grid>
        </Section>

        {/* Секция 2: Параметры заказов */}
        <Section
          title="Параметры заказов"
          icon={null}
        >
          <Typography
            variant="subtitle2"
            sx={{ mb: 1, color: "#666" }}
          >
            Количество заказов
          </Typography>
          <Grid
            container
            spacing={2}
          >
            <Grid size={{ xs: 12, sm: 6 }}>
              <RangeInput
                label="Кол-во заказов"
                valueMin={form.orders_count_min}
                valueMax={form.orders_count_max}
                onChangeMin={({ target }) => setField("orders_count_min", target?.value)}
                onChangeMax={({ target }) => setField("orders_count_max", target?.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <RangeInput
                label="Средний чек"
                valueMin={form.avg_check_min}
                valueMax={form.avg_check_max}
                onChangeMin={({ target }) => setField("avg_check_min", target?.value)}
                onChangeMax={({ target }) => setField("avg_check_max", target?.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <RangeInput
                label="Сумма заказов"
                valueMin={form.total_sum_min}
                valueMax={form.total_sum_max}
                onChangeMin={({ target }) => setField("total_sum_min", target?.value)}
                onChangeMax={({ target }) => setField("total_sum_max", target?.value)}
              />
            </Grid>
          </Grid>

          <Typography
            variant="subtitle2"
            sx={{ mt: 2, mb: 1, color: "#666" }}
          >
            Даты заказов
          </Typography>
          <Grid
            container
            spacing={2}
          >
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MyDatePickerNew
                label="Дата последнего заказа от"
                value={form.last_order_date_start ? dayjs(form.last_order_date_start) : null}
                func={(e) => setField("last_order_date_start", e)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MyDatePickerNew
                label="Дата последнего заказа до"
                value={form.last_order_date_end ? dayjs(form.last_order_date_end) : null}
                func={(e) => setField("last_order_date_end", e)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MyTextInput
                type="number"
                label="Дней с последнего заказа"
                value={form.days_from_last}
                func={({ target }) => setField("days_from_last", target?.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MyTextInput
                type="number"
                label="Дней с первого заказа"
                value={form.days_from_first}
                func={({ target }) => setField("days_from_first", target?.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MyTextInput
                type="number"
                label="Период (за последние N дней)"
                value={form.period_days}
                func={({ target }) => setField("period_days", target?.value)}
              />
            </Grid>
          </Grid>

          <Typography
            variant="subtitle2"
            sx={{ mt: 2, mb: 1, color: "#666" }}
          >
            Состав заказа
          </Typography>
          <Grid
            container
            spacing={2}
          >
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MyAutocomplite
                label="Категории в заказе"
                multiple={true}
                data={categories}
                value={form.categories}
                func={(data, value) => setField("categories", value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MyTextInput
                type="text"
                label="Промокод"
                value={form.promo}
                func={({ target }) => setField("promo", target?.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MyAutocomplite
                label="Тип заказа"
                multiple={true}
                data={orderTypes}
                value={form.order_types}
                func={(data, value) => setField("order_types", value)}
              />
            </Grid>
          </Grid>
        </Section>

        {/* Секция 3: География */}
        <Section
          title="География"
          icon={null}
        >
          <Grid
            container
            spacing={2}
          >
            <Grid size={{ xs: 12, sm: 6 }}>
              <MyAutocomplite
                label="Город"
                multiple={true}
                data={cities}
                value={form.cities}
                func={(data, value) => setField("cities", value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <MyAutocomplite
                label="Адрес кафе"
                multiple={true}
                data={points}
                value={form.points}
                func={(data, value) => setField("points", value)}
              />
            </Grid>
          </Grid>
        </Section>

        {/* Секция 4: Маркетинг */}
        <Section
          title="Маркетинг"
          icon={null}
        >
          <Grid
            container
            spacing={2}
          >
            <Grid size={{ xs: 12, sm: 6 }}>
              <MyAutocomplite
                label="Источник"
                multiple={true}
                data={sources}
                value={form.sources}
                func={(data, value) => setField("sources", value)}
              />
            </Grid>
          </Grid>
        </Section>

        {/* Секция 5: UTM метки */}
        <Section
          title="UTM метки"
          icon={null}
        >
          <Typography
            variant="caption"
            sx={{ mb: 2, display: "block", color: "#999" }}
          >
            Минимум одно поле должно быть заполнено
          </Typography>
          <Grid
            container
            spacing={2}
          >
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MyTextInput
                type="text"
                label="UTM Source"
                value={form.utm_source}
                func={({ target }) => setField("utm_source", target?.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MyTextInput
                type="text"
                label="UTM Medium"
                value={form.utm_medium}
                func={({ target }) => setField("utm_medium", target?.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MyTextInput
                type="text"
                label="UTM Campaign"
                value={form.utm_campaign}
                func={({ target }) => setField("utm_campaign", target?.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MyTextInput
                type="text"
                label="UTM Term"
                value={form.utm_term}
                func={({ target }) => setField("utm_term", target?.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <MyTextInput
                type="text"
                label="UTM Content"
                value={form.utm_content}
                func={({ target }) => setField("utm_content", target?.value)}
              />
            </Grid>
          </Grid>
        </Section>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleReset}
          variant="outlined"
          color="secondary"
        >
          Сбросить
        </Button>
        <Button
          onClick={onClose}
          variant="outlined"
        >
          Отмена
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
        >
          Обновить сегмент
        </Button>
      </DialogActions>
    </Dialog>
  );
};
