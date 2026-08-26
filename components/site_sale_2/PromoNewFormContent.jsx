import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  TextareaAutosize,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableFooter from "@mui/material/TableFooter";
import { MyAutocomplite, MyDatePickerNew, MySelect, MyTextInput, MyTimePicker } from "@/ui/Forms";
import { FieldWithHint, LabelWithHint, PROMO_HINTS } from "./promoNewHints";
import { PromoExcludeDatePicker } from "./promoNewShared";
import {
  getActionSummary,
  getBenefitSummary,
  getConditionsSummary,
  getLocationSummary,
  getScheduleSummary,
  getWeekdaysPreview,
} from "./promoNewSummaries";
import { PROMO_PRESETS } from "./promoNewPresets";
import { formatPromoPhone, normalizePromoEmail, normalizePromoPhone } from "./promoPhone";

const WEEKDAYS = [
  { key: "day_1", short: "Пн", full: "Понедельник" },
  { key: "day_2", short: "Вт", full: "Вторник" },
  { key: "day_3", short: "Ср", full: "Среда" },
  { key: "day_4", short: "Чт", full: "Четверг" },
  { key: "day_5", short: "Пт", full: "Пятница" },
  { key: "day_6", short: "Сб", full: "Суббота" },
  { key: "day_7", short: "Вс", full: "Воскресенье" },
];

function SectionCard({ title, subtitle, children }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2,
        mb: 2.5,
        overflow: "hidden",
        borderLeft: "3px solid",
        borderLeftColor: "primary.main",
      }}
    >
      {title ? (
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h6"
            sx={{ fontSize: { xs: 18, sm: 20 }, fontWeight: 700 }}
          >
            {title}
          </Typography>
          {subtitle ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {subtitle}
            </Typography>
          ) : null}
        </Box>
      ) : null}
      {children}
    </Paper>
  );
}

function ChoiceCard({ checked, label, description, onChange, sx }) {
  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={checked}
          onChange={onChange}
          color="primary"
          size="small"
          sx={{ alignSelf: "flex-start", p: 0.5, mr: 1.25 }}
        />
      }
      label={
        <Box sx={{ py: 0.25 }}>
          <Typography sx={{ fontWeight: 600, lineHeight: 1.35 }}>{label}</Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, lineHeight: 1.4 }}
          >
            {description}
          </Typography>
        </Box>
      }
      sx={{
        m: 0,
        px: 0,
        py: 1,
        width: "100%",
        boxSizing: "border-box",
        alignItems: "flex-start",
        "& .MuiCheckbox-root.Mui-focusVisible": {
          outline: "2px solid",
          outlineColor: "primary.light",
          outlineOffset: 2,
          borderRadius: 1,
        },
        "& .MuiFormControlLabel-label": {
          flex: 1,
          minWidth: 0,
        },
        ...sx,
      }}
    />
  );
}

function SettingsAccordion({ title, summary, children, defaultExpanded = false }) {
  return (
    <Accordion
      disableGutters
      defaultExpanded={defaultExpanded}
      slotProps={{
        transition: {
          timeout: { enter: 180, exit: 140 },
          unmountOnExit: true,
        },
      }}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "8px !important",
        overflow: "hidden",
        transition: "border-color 0.2s, box-shadow 0.2s",
        "&:before": { display: "none" },
        "&.Mui-expanded": {
          borderColor: "primary.light",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        },
        "& .MuiCollapse-root": { overflow: "hidden" },
        "& .MuiCollapse-wrapper, & .MuiCollapse-wrapperInner": { minHeight: 0 },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          px: { xs: 1.5, sm: 2 },
          py: 0.5,
          minHeight: 64,
          bgcolor: "grey.50",
          borderRadius: "8px",
          "&.Mui-expanded": {
            minHeight: 64,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderBottom: "1px solid",
            borderColor: "divider",
          },
          "& .MuiAccordionSummary-content": { my: 1.25 },
          "& .MuiAccordionSummary-content.Mui-expanded": { my: 1.25 },
        }}
      >
        <Box sx={{ minWidth: 0, pr: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: { xs: 15, sm: 16 } }}>{title}</Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.25,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {summary}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ px: { xs: 1.5, sm: 2 }, pb: 3, pt: { xs: 2, sm: 2.5 } }}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
}

function WeekdaySelector({ state, onToggleDay }) {
  return (
    <Box>
      <LabelWithHint
        text="Дни недели"
        hint={PROMO_HINTS.weekdays}
      />
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 0.5 }}>
        {WEEKDAYS.map(({ key, short, full }) => (
          <Chip
            key={key}
            label={short}
            title={full}
            clickable
            color={state[key] ? "primary" : "default"}
            variant={state[key] ? "filled" : "outlined"}
            onClick={() => onToggleDay(key)}
            sx={{ minWidth: 44, fontWeight: 700 }}
          />
        ))}
      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 1 }}
      >
        {getWeekdaysPreview(state)}
      </Typography>
    </Box>
  );
}

function PromoPresetsBar({ activePresetId, onApplyPreset }) {
  return (
    <SectionCard
      title="Готовые сценарии"
      subtitle="Выберите подходящий вариант — настройки можно изменить после применения"
    >
      <Stack
        direction="row"
        flexWrap="wrap"
        useFlexGap
        sx={{ gap: 1 }}
      >
        {PROMO_PRESETS.map((preset) => {
          const isActive = activePresetId === preset.id;

          return (
            <Chip
              key={preset.id}
              label={preset.label}
              title={preset.description}
              clickable
              color={isActive ? "primary" : "default"}
              variant={isActive ? "filled" : "outlined"}
              onClick={() => onApplyPreset(preset.id)}
              sx={{
                height: "auto",
                py: 0.75,
                "& .MuiChip-label": {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  whiteSpace: "normal",
                  lineHeight: 1.3,
                  px: 2,
                },
                fontWeight: 700,
                borderRadius: 1.5,
                ...(!isActive && {
                  borderColor: "divider",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: "primary.50",
                  },
                }),
              }}
            />
          );
        })}
      </Stack>
    </SectionCard>
  );
}

export default function PromoNewFormContent({
  state,
  moduleName,
  changeData,
  changeDataCheck,
  changeDataData,
  changeDateRange,
  addItemAdd,
  delItemAdd,
  priceItemAdd,
  delItemPrice,
  changeItemPrice,
  onSave,
  isEdit = false,
  created,
  historySection = null,
  onApplyPreset = null,
  activePresetId = "",
}) {
  const toggleDay = (key) => {
    changeDataCheck(key, { target: { checked: !state[key] } });
  };

  const cafeOptions = (state.points || []).map((item) => ({
    ...item,
    name: item.name === "Все точки" ? "Все кафе" : item.name,
  }));
  const selectedCafe = cafeOptions.find((item) => String(item.id) === String(state.point)) || null;
  const deliveryAction = parseInt(state.where_promo, 10);
  const isPhoneDelivery = deliveryAction === 4 || deliveryAction === 6;
  const isEmailDelivery = deliveryAction === 3;
  const recipientValue = isPhoneDelivery
    ? formatPromoPhone(state.numberList)
    : isEmailDelivery
      ? normalizePromoEmail(state.numberList)
      : state.numberList;

  const changeRecipient = (event) => {
    const value = isPhoneDelivery
      ? normalizePromoPhone(event.target.value)
      : isEmailDelivery
        ? normalizePromoEmail(event.target.value)
        : event.target.value;

    changeData("numberList", { target: { value } });
  };

  const changeDeliveryAction = (event) => {
    if (parseInt(event.target.value, 10) !== deliveryAction && state.numberList) {
      changeData("numberList", { target: { value: "" } });
    }

    changeData("where_promo", event);
  };

  return (
    <Grid
      container
      spacing={2.5}
      sx={{
        mt: { xs: 9, sm: 10 },
        px: { xs: 2, sm: 3 },
        pb: 4,
        width: "100%",
        maxWidth: 1400,
        mx: "auto",
      }}
    >
      <Grid size={12}>
        <Box
          sx={{
            pb: 1,
            borderBottom: "2px solid",
            borderColor: "primary.main",
            mb: 0.5,
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{ fontWeight: 700, fontSize: { xs: 24, sm: 32 } }}
          >
            {moduleName}
          </Typography>
          {isEdit && created ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Был создан: {created}
            </Typography>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.75 }}
            >
              {isEdit ? "Редактирование промокода" : "Создание нового промокода"}
            </Typography>
          )}
        </Box>
      </Grid>

      {!isEdit && onApplyPreset ? (
        <Grid size={12}>
          <PromoPresetsBar
            activePresetId={activePresetId}
            onApplyPreset={onApplyPreset}
          />
        </Grid>
      ) : null}

      <Grid size={12}>
        <SectionCard
          title="Промокод"
          subtitle={isEdit ? "Код и лимиты активаций" : "Название, генерация и лимиты"}
        >
          <Grid
            container
            spacing={2}
          >
            {isEdit ? (
              <>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 700, py: 1 }}
                  >
                    Промокод: {state.promo_name}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FieldWithHint hint={PROMO_HINTS.count_action}>
                    <MyTextInput
                      value={state.count_action}
                      func={changeData.bind(null, "count_action")}
                      label="Количество активаций"
                    />
                  </FieldWithHint>
                </Grid>
              </>
            ) : (
              <>
                {state.generate_new ? (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FieldWithHint hint={PROMO_HINTS.promo_length}>
                      <MyTextInput
                        value={state.promo_length}
                        func={changeData.bind(null, "promo_length")}
                        label="Длина промокода"
                      />
                    </FieldWithHint>
                  </Grid>
                ) : (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FieldWithHint hint={PROMO_HINTS.promo_name}>
                      <MyTextInput
                        value={state.promo_name}
                        func={changeData.bind(null, "promo_name")}
                        label="Название промокода"
                      />
                    </FieldWithHint>
                  </Grid>
                )}

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ChoiceCard
                    checked={state.generate_new}
                    onChange={changeDataCheck.bind(null, "generate_new")}
                    label="Сгенерировать промокод"
                    description={PROMO_HINTS.generate_new}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FieldWithHint hint={PROMO_HINTS.count_action}>
                    <MyTextInput
                      value={state.count_action}
                      func={changeData.bind(null, "count_action")}
                      label="Количество активаций"
                    />
                  </FieldWithHint>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FieldWithHint hint={PROMO_HINTS.promo_count}>
                    <MyTextInput
                      value={state.promo_count}
                      func={changeData.bind(null, "promo_count")}
                      label="Количество промокодов"
                    />
                  </FieldWithHint>
                </Grid>
              </>
            )}
          </Grid>
        </SectionCard>
      </Grid>

      <Grid size={12}>
        <SectionCard
          title="Ограничения для клиентов"
          subtitle="Кому можно применить промокод"
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
              columnGap: 2,
              rowGap: 0.5,
            }}
            role="group"
            aria-label="Ограничения для клиентов"
          >
            {[
              {
                key: "for_new",
                label: "Для новых клиентов (на первый заказ)",
                hint: PROMO_HINTS.for_new,
              },
              {
                key: "once_number",
                label: "1 раз на номер телефона",
                hint: PROMO_HINTS.once_number,
              },
              {
                key: "for_registred",
                label: "Только для зарегистрированных клиентов",
                hint: PROMO_HINTS.for_registred,
              },
              {
                key: "for_number",
                label: "Привязан к номеру телефона",
                hint: PROMO_HINTS.for_number,
              },
            ].map(({ key, label, hint }) => (
              <Box key={key}>
                <ChoiceCard
                  checked={state[key]}
                  onChange={changeDataCheck.bind(null, key)}
                  label={label}
                  description={hint}
                />

                {key === "for_number" && state.for_number ? (
                  <Box sx={{ mt: 0.75, ml: 4.5, maxWidth: 420 }}>
                    <FieldWithHint hint={PROMO_HINTS.for_number_text}>
                      <MyTextInput
                        value={formatPromoPhone(state.for_number_text)}
                        func={(event) =>
                          changeData("for_number_text", {
                            target: { value: normalizePromoPhone(event.target.value) },
                          })
                        }
                        label="Номер телефона"
                        type="tel"
                        placeholder="8 (___) ___-__-__"
                        inputProps={{ inputMode: "tel", maxLength: 18 }}
                      />
                    </FieldWithHint>
                  </Box>
                ) : null}
              </Box>
            ))}
          </Box>
        </SectionCard>
      </Grid>

      <Grid size={12}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            width: "100%",
          }}
        >
          <SettingsAccordion
            title="Что даёт промокод"
            summary={getBenefitSummary(state)}
          >
            <Grid
              container
              spacing={2}
            >
              <Grid
                size={{ xs: 12, sm: 6, md: 4 }}
                sx={{ mb: 2 }}
              >
                <FieldWithHint hint={PROMO_HINTS.promo_action}>
                  <MySelect
                    data={state.promo_action_list}
                    value={state.promo_action}
                    func={changeData.bind(null, "promo_action")}
                    label="Промокод даёт"
                    is_none={false}
                  />
                </FieldWithHint>
              </Grid>
            </Grid>

            {parseInt(state.promo_action, 10) === 1 ? (
              <Grid
                container
                spacing={2}
                sx={{ mt: 0.5 }}
              >
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FieldWithHint hint={PROMO_HINTS.type_sale}>
                    <MySelect
                      data={state.sale_list}
                      value={state.type_sale}
                      func={changeData.bind(null, "type_sale")}
                      label="Скидка"
                      is_none={false}
                    />
                  </FieldWithHint>
                </Grid>

                {parseInt(state.type_sale, 10) === 1 ? (
                  <Grid size={12}>
                    <MyAutocomplite
                      data={state.items}
                      value={state.saleItem}
                      func={(event, data) => changeDataData("saleItem", data)}
                      multiple
                      label="Товары"
                    />
                  </Grid>
                ) : null}

                {parseInt(state.type_sale, 10) === 2 ? (
                  <Grid size={12}>
                    <MyAutocomplite
                      data={state.cats}
                      value={state.saleCat}
                      func={(event, data) => changeDataData("saleCat", data)}
                      multiple
                      label="Категории"
                    />
                  </Grid>
                ) : null}

                {parseInt(state.sale_type, 10) === 1 ? (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FieldWithHint hint={PROMO_HINTS.promo_sale}>
                      <MyTextInput
                        value={state.promo_sale}
                        func={changeData.bind(null, "promo_sale")}
                        label="Размер скидки"
                      />
                    </FieldWithHint>
                  </Grid>
                ) : (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FieldWithHint hint={PROMO_HINTS.promo_sale}>
                      <MySelect
                        data={state.promo_sale_list}
                        value={state.promo_sale}
                        func={changeData.bind(null, "promo_sale")}
                        label="Размер скидки"
                        is_none={false}
                      />
                    </FieldWithHint>
                  </Grid>
                )}

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FieldWithHint hint={PROMO_HINTS.sale_type}>
                    <MySelect
                      data={state.type_sale_list}
                      value={state.sale_type}
                      func={changeData.bind(null, "sale_type")}
                      label="Какая скидка"
                      is_none={false}
                    />
                  </FieldWithHint>
                </Grid>
              </Grid>
            ) : null}

            {parseInt(state.promo_action, 10) === 2 ? (
              <>
                <Grid
                  container
                  spacing={2}
                  sx={{ mt: 0.5 }}
                >
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <MyAutocomplite
                      data={state.items}
                      value={state.addItem}
                      func={(event, data) => changeDataData("addItem", data)}
                      label="Позиция"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <MyTextInput
                      value={state.addItemCount}
                      func={changeData.bind(null, "addItemCount")}
                      label="Количество"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <MyTextInput
                      value={state.addItemPrice}
                      func={changeData.bind(null, "addItemPrice")}
                      label="Цена за все"
                    />
                  </Grid>
                  <Grid size={12}>
                    <Button
                      variant="contained"
                      onClick={addItemAdd}
                    >
                      Добавить позицию
                    </Button>
                  </Grid>
                </Grid>

                {state.itemsAdd?.length ? (
                  <Box sx={{ mt: 2, overflowX: "auto" }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Позиция</TableCell>
                          <TableCell>Количество</TableCell>
                          <TableCell>Цена за все</TableCell>
                          <TableCell width={48} />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {state.itemsAdd.map((item, key) => (
                          <TableRow key={key}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.count}</TableCell>
                            <TableCell>{item.price}</TableCell>
                            <TableCell>
                              <CloseIcon
                                onClick={() => delItemAdd(item)}
                                style={{ cursor: "pointer" }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell colSpan={2}>Итого</TableCell>
                          <TableCell>{state.addItemAllPrice}</TableCell>
                          <TableCell />
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </Box>
                ) : null}
              </>
            ) : null}

            {parseInt(state.promo_action, 10) === 3 ? (
              <>
                <Grid
                  container
                  spacing={2}
                  sx={{ mt: 0.5 }}
                >
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <MyAutocomplite
                      data={state.items}
                      value={state.priceItem}
                      func={(event, data) => changeDataData("priceItem", data)}
                      label="Позиция"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <MyTextInput
                      value={state.addItemCount}
                      func={changeData.bind(null, "addItemCount")}
                      label="Цена за 1 ед"
                    />
                  </Grid>
                  <Grid size={12}>
                    <Button
                      variant="contained"
                      onClick={priceItemAdd}
                    >
                      Добавить позицию
                    </Button>
                  </Grid>
                </Grid>

                {state.itemsAddPrice?.length ? (
                  <Box sx={{ mt: 2, overflowX: "auto" }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Позиция</TableCell>
                          <TableCell>Цена за 1 ед</TableCell>
                          <TableCell width={48} />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {state.itemsAddPrice.map((item, key) => (
                          <TableRow key={key}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>
                              <MyTextInput
                                value={item.price}
                                func={(event) => changeItemPrice(item, event)}
                              />
                            </TableCell>
                            <TableCell>
                              <CloseIcon
                                onClick={() => delItemPrice(item)}
                                style={{ cursor: "pointer" }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                ) : null}
              </>
            ) : null}
          </SettingsAccordion>

          <SettingsAccordion
            title="Условия применения"
            summary={getConditionsSummary(state)}
          >
            <Grid
              container
              spacing={2}
            >
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <FieldWithHint hint={PROMO_HINTS.promo_conditions}>
                  <MySelect
                    data={state.promo_conditions_list}
                    value={state.promo_conditions}
                    func={changeData.bind(null, "promo_conditions")}
                    label="Условие"
                    is_none={false}
                  />
                </FieldWithHint>
              </Grid>

              {parseInt(state.promo_conditions, 10) === 1 ? (
                <Grid size={12}>
                  <MyAutocomplite
                    data={state.items}
                    value={state.conditionItems}
                    func={(event, data) => changeDataData("conditionItems", data)}
                    multiple
                    label="Товары"
                  />
                </Grid>
              ) : null}

              {parseInt(state.promo_conditions, 10) === 3 ? (
                <Grid size={12}>
                  <MyAutocomplite
                    data={state.cats}
                    value={state.conditionCat}
                    func={(event, data) => changeDataData("conditionCat", data)}
                    multiple
                    label="Категории"
                  />
                </Grid>
              ) : null}

              {parseInt(state.promo_conditions, 10) === 2 ? (
                <>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FieldWithHint hint={PROMO_HINTS.price_start}>
                      <MyTextInput
                        value={state.price_start}
                        func={changeData.bind(null, "price_start")}
                        label="Сумма от"
                      />
                    </FieldWithHint>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FieldWithHint hint={PROMO_HINTS.price_end}>
                      <MyTextInput
                        value={state.price_end}
                        func={changeData.bind(null, "price_end")}
                        label="Сумма до"
                      />
                    </FieldWithHint>
                  </Grid>
                </>
              ) : null}
            </Grid>
          </SettingsAccordion>

          <SettingsAccordion
            title="Срок и расписание"
            summary={getScheduleSummary(state)}
          >
            <Grid
              container
              spacing={2}
            >
              <Grid size={12}>
                <FieldWithHint hint={PROMO_HINTS.date_promo}>
                  <MySelect
                    data={state.date_promo_list}
                    value={state.date_promo}
                    func={changeData.bind(null, "date_promo")}
                    label="Когда работает промокод"
                    is_none={false}
                  />
                </FieldWithHint>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <MyDatePickerNew
                  label="Дата от"
                  value={state.date_start}
                  func={changeDateRange.bind(null, "date_start")}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <MyDatePickerNew
                  label="Дата до"
                  value={state.date_end}
                  func={changeDateRange.bind(null, "date_end")}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <MyTimePicker
                  label="Время от"
                  value={state.time_start}
                  func={changeData.bind(null, "time_start")}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <MyTimePicker
                  label="Время до"
                  value={state.time_end}
                  func={changeData.bind(null, "time_end")}
                />
              </Grid>

              <Grid size={12}>
                <LabelWithHint
                  text="Исключить даты"
                  hint={PROMO_HINTS.testDate}
                  sx={{ mb: 1.25 }}
                />
                <PromoExcludeDatePicker
                  label="Добавить дату"
                  value={state.testDate}
                  func={changeDataData.bind(null, "testDate")}
                />
              </Grid>

              <Grid size={12}>
                <WeekdaySelector
                  state={state}
                  onToggleDay={toggleDay}
                />
              </Grid>
            </Grid>
          </SettingsAccordion>

          <SettingsAccordion
            title="География и тип заказа"
            summary={getLocationSummary(state)}
          >
            <Grid
              container
              spacing={2}
            >
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <FieldWithHint hint={PROMO_HINTS.type_order}>
                  <MySelect
                    data={state.type_order_list}
                    value={state.type_order}
                    func={changeData.bind(null, "type_order")}
                    label="Тип заказа"
                    is_none={false}
                  />
                </FieldWithHint>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <FieldWithHint hint={PROMO_HINTS.where_order}>
                  <MySelect
                    data={state.where_order_list}
                    value={state.where_order}
                    func={changeData.bind(null, "where_order")}
                    label="Где работает"
                    is_none={false}
                  />
                </FieldWithHint>
              </Grid>

              {parseInt(state.where_order, 10) === 1 ? (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <MySelect
                    data={state.cities}
                    value={state.city}
                    func={changeData.bind(null, "city")}
                    label="Город"
                    is_none={false}
                  />
                </Grid>
              ) : null}

              {parseInt(state.where_order, 10) === 2 ? (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <MyAutocomplite
                    data={cafeOptions}
                    value={selectedCafe}
                    func={(event, data) =>
                      changeData("point", { target: { value: data?.id ?? 0 } })
                    }
                    label="Кафе"
                    placeholder="Выберите кафе"
                    multiple={false}
                    disableClearable
                  />
                </Grid>
              ) : null}
            </Grid>
          </SettingsAccordion>

          {!isEdit ? (
            <SettingsAccordion
              title="Действие после создания"
              summary={getActionSummary(state)}
            >
              <Grid
                container
                spacing={2}
              >
                <Grid size={{ xs: 12, sm: 6, md: 5 }}>
                  <FieldWithHint hint={PROMO_HINTS.where_promo}>
                    <MySelect
                      data={state.where_promo_list}
                      value={state.where_promo}
                      func={changeDeliveryAction}
                      label="Что сделать с промокодом"
                      is_none={false}
                    />
                  </FieldWithHint>
                </Grid>

                {parseInt(state.where_promo, 10) === 1 ||
                parseInt(state.where_promo, 10) === 2 ||
                parseInt(state.where_promo, 10) === 7 ||
                parseInt(state.where_promo, 10) === 9 ? null : parseInt(state.where_promo, 10) ===
                  5 ? (
                  <Grid size={12}>
                    <LabelWithHint
                      text="Список номеров для рассылки"
                      hint={PROMO_HINTS.numberList}
                    />
                    <TextareaAutosize
                      minRows={3}
                      value={state.numberList}
                      onChange={changeData.bind(null, "numberList")}
                      style={{ width: "100%", marginTop: 8, padding: 12, borderRadius: 8 }}
                      placeholder="89999999999,89999999999"
                    />
                  </Grid>
                ) : (
                  <Grid size={{ xs: 12, sm: 6, md: 5 }}>
                    <FieldWithHint
                      hint={
                        isPhoneDelivery
                          ? PROMO_HINTS.delivery_phone
                          : isEmailDelivery
                            ? PROMO_HINTS.delivery_email
                            : PROMO_HINTS.numberList
                      }
                    >
                      <MyTextInput
                        value={recipientValue}
                        func={changeRecipient}
                        placeholder={
                          isPhoneDelivery
                            ? "8 (___) ___-__-__"
                            : deliveryAction === 8
                              ? "id юзера ВК"
                              : "example@mail.ru"
                        }
                        label={
                          isPhoneDelivery
                            ? "Номер телефона"
                            : isEmailDelivery
                              ? "E-mail"
                              : "Куда отправить"
                        }
                        type={isPhoneDelivery ? "tel" : isEmailDelivery ? "email" : "text"}
                        inputProps={
                          isPhoneDelivery
                            ? { inputMode: "tel", maxLength: 18 }
                            : isEmailDelivery
                              ? { inputMode: "email", autoComplete: "email" }
                              : undefined
                        }
                      />
                    </FieldWithHint>
                  </Grid>
                )}

                {parseInt(state.where_promo, 10) === 8 ? (
                  <Grid size={12}>
                    <LabelWithHint
                      text="Текст рассылки"
                      hint={PROMO_HINTS.promo_prizw_vk}
                    />
                    <TextareaAutosize
                      minRows={4}
                      value={state.promo_prizw_vk}
                      onChange={changeData.bind(null, "promo_prizw_vk")}
                      style={{ width: "100%", marginTop: 8, padding: 12, borderRadius: 8 }}
                    />
                  </Grid>
                ) : null}

                {parseInt(state.where_promo, 10) === 5 ? (
                  <Grid size={12}>
                    <FieldWithHint hint={PROMO_HINTS.spamNameSMS}>
                      <MyTextInput
                        value={state.spamNameSMS}
                        func={changeData.bind(null, "spamNameSMS")}
                        label="Наименование рассылки"
                      />
                    </FieldWithHint>
                  </Grid>
                ) : null}

                {parseInt(state.where_promo, 10) === 4 || parseInt(state.where_promo, 10) === 5 ? (
                  <Grid size={12}>
                    <FieldWithHint hint={PROMO_HINTS.textSMS}>
                      <MyTextInput
                        value={state.textSMS}
                        func={changeData.bind(null, "textSMS")}
                        label="Текст СМС (--promo_name--)"
                      />
                    </FieldWithHint>
                  </Grid>
                ) : null}

                {parseInt(state.where_promo, 10) === 7 || parseInt(state.where_promo, 10) === 9 ? (
                  <Grid size={12}>
                    <FieldWithHint hint={PROMO_HINTS.cert_text}>
                      <MyTextInput
                        value={state.cert_text}
                        func={changeData.bind(null, "cert_text")}
                        label="Текст для описания сертификата"
                      />
                    </FieldWithHint>
                  </Grid>
                ) : null}
              </Grid>
            </SettingsAccordion>
          ) : null}
        </Box>
      </Grid>

      <Grid size={12}>
        <SectionCard title="Тексты для клиента">
          <Stack spacing={2}>
            <ChoiceCard
              checked={state.auto_text}
              onChange={changeDataCheck.bind(null, "auto_text")}
              label="Автоматически составлять тексты"
              description={PROMO_HINTS.auto_text}
              sx={{ maxWidth: { xs: "100%", sm: 520 } }}
            />

            <FieldWithHint hint={PROMO_HINTS.promo_desc_true}>
              <MyTextInput
                value={state.promo_desc_true}
                func={changeData.bind(null, "promo_desc_true")}
                label="Описание после активации (Промокод даёт: )"
              />
            </FieldWithHint>

            <FieldWithHint hint={PROMO_HINTS.promo_desc_false}>
              <MyTextInput
                value={state.promo_desc_false}
                func={changeData.bind(null, "promo_desc_false")}
                label="Условие, когда промокод нельзя применить"
              />
            </FieldWithHint>
          </Stack>
        </SectionCard>
      </Grid>

      {historySection ? <Grid size={12}>{historySection}</Grid> : null}

      <Grid size={12}>
        <Paper
          variant="outlined"
          sx={{
            display: "flex",
            justifyContent: { xs: "stretch", sm: "flex-end" },
            position: { xs: "sticky", sm: "static" },
            bottom: { xs: 12, sm: "auto" },
            zIndex: 1,
            p: { xs: 1.5, sm: 2 },
            borderRadius: 2,
            bgcolor: "grey.50",
          }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={onSave}
            sx={{ width: { xs: "100%", sm: "auto" }, minWidth: 180, fontWeight: 700 }}
          >
            Сохранить
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );
}
