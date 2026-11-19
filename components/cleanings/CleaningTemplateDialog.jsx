import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  RadioGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AllInclusiveOutlinedIcon from "@mui/icons-material/AllInclusiveOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import LooksOneOutlinedIcon from "@mui/icons-material/LooksOneOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import {
  JacoAutocomplete,
  JacoCheckboxField,
  JacoCityCafe,
  JacoRadioCard,
  JacoSelect,
  JacoTextInput,
  JacoTimePicker,
} from "@/design-system/shared/ui";
import { LEGACY_ONLY_OPTION_VALUE, NIGHTLY_CLEANUP_TIME, days, defaultForm } from "./constants";
import {
  getDaysFromScheduleType,
  getLocationSelectionSummary,
  getScheduleTypeFromDays,
  isFiveMinuteTime,
  isSameId,
  isValidTime,
} from "./helpers";
import { FormHint, FormLabel, FormSection } from "./shared";

const actionButtonSx = {
  minHeight: 44,
  borderRadius: "8px",
  fontSize: 16,
  fontWeight: 700,
  lineHeight: "20px",
  alignItems: "center",
  justifyContent: "center",
};

const timeFieldSx = { width: 150 };

const additionTypeIcons = {
  single_active: <LooksOneOutlinedIcon />,
  unlimited: <AllInclusiveOutlinedIcon />,
};

function isOptionOffered(option, initialValue) {
  return Boolean(option?.value) && (option.selectable || option.value === initialValue);
}

function getFormValues(item) {
  if (!item) {
    return { ...defaultForm };
  }

  return {
    ...defaultForm,
    ...item,
    scheduleType: getScheduleTypeFromDays(item),
    activationCount: item.activationCount ?? "",
    additionType: item.additionType ?? "",
    triggerCleaningId: item.triggerCleaningId ?? null,
    deleteTimes: [...(item.deleteTimes || [])],
    times: [...(item.times || [])],
    days: [...(item.days || [])],
    locationIds: [...(item.locationIds || [])],
  };
}

function hasStartTimes(scheduleType) {
  return scheduleType !== "manual" && scheduleType !== "after_cleaning";
}

// Mirrors the BE save checks so the obvious cases are caught before the request.
function getFormErrors(form) {
  const errors = {};

  if (!form.scheduleType) {
    errors.scheduleType = "Выберите день недели или режим";
  }

  if (!form.additionType) {
    errors.additionType = "Выберите тип добавления";
  }

  if (form.scheduleType === "after_cleaning") {
    if (!form.triggerCleaningId) {
      errors.triggerCleaningId = "Выберите уборку, после которой появится задача";
    } else if (isSameId(form.triggerCleaningId, form.id)) {
      errors.triggerCleaningId = "Уборка не может появляться после самой себя";
    }
  }

  if (hasStartTimes(form.scheduleType)) {
    const invalidTimeIndexes = form.times
      .map((time, index) => (time && !isFiveMinuteTime(time) ? index : null))
      .filter((index) => index !== null);

    if (invalidTimeIndexes.length) {
      errors.times = invalidTimeIndexes;
    }
  }

  const deleteTime = form.deleteTimes[0] || "";
  if (deleteTime && !isValidTime(deleteTime)) {
    errors.deleteTime = "Время удаления — в формате ЧЧ:ММ";
  }

  return errors;
}

export default function CleaningTemplateDialog({
  open,
  item,
  categories,
  templates = [],
  locations = [],
  cities = [],
  roles = [],
  scheduleTypeOptions = [],
  additionTypeOptions = [],
  onClose,
  onSave,
  canEdit,
}) {
  const [form, setForm] = useState(defaultForm);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    setForm(getFormValues(item));
    setSubmitAttempted(false);
  }, [item, open]);

  const isEdit = Boolean(item?.id);
  const initialAdditionType = item?.additionType ?? "";
  const selectedCategory = categories.find((category) => category.id === form.categoryId) ?? null;
  const triggerOptions = templates.filter((template) => !isSameId(template.id, form.id));
  const selectedTriggerCleaning =
    triggerOptions.find((template) => template.id === form.triggerCleaningId) ?? null;
  const resolvedRoles = roles
    .map((role) =>
      role && typeof role === "object"
        ? { id: role.id ?? null, name: role.name ? String(role.name) : "" }
        : { id: null, name: role == null ? "" : String(role) },
    )
    .filter((role) => role.name);
  const hasCurrentRole = resolvedRoles.some((role) => role.id === form.roleId);
  const resolvedRoleValues =
    form.role && form.roleId != null && !hasCurrentRole
      ? [...resolvedRoles, { id: form.roleId, name: form.role }]
      : resolvedRoles;
  const roleOptions = [
    { id: "", name: "Выберите должность" },
    ...resolvedRoleValues.map((role) => ({ id: role.id, name: role.name })),
  ];

  const additionTypeChoices = additionTypeOptions.filter((option) =>
    isOptionOffered(option, initialAdditionType),
  );
  const weeklyOption = scheduleTypeOptions.find((option) => option?.value === "weekly");
  // A legacy-only mode («Другое») stays offered only while it is the current value.
  const offeredScheduleOptions = scheduleTypeOptions.filter((option) =>
    isOptionOffered(option, form.scheduleType),
  );
  const scheduleChoices = weeklyOption
    ? [
        ...days.map((day) => ({ ...day, description: weeklyOption.description })),
        ...offeredScheduleOptions.filter((option) => option.value !== "weekly"),
      ]
    : offeredScheduleOptions;
  const scheduleSelectOptions = [
    { id: "", name: "Выберите день или режим" },
    ...scheduleChoices.map((option) => ({ id: option.value, name: option.label })),
  ];
  const selectedScheduleOption =
    scheduleChoices.find((option) => option.value === form.scheduleType) ?? null;

  const cafePoints = useMemo(
    () =>
      locations.map((location) => ({
        id: location.id,
        name: location.name,
        base: location.base,
        city_id: location.cityId,
      })),
    [locations],
  );
  const selectedCafePoints = useMemo(() => {
    const selectedIds = new Set(form.locationIds.map((locationId) => String(locationId)));
    return cafePoints.filter((point) => selectedIds.has(String(point.id)));
  }, [cafePoints, form.locationIds]);
  const locationSummary = getLocationSelectionSummary(form.locationIds, locations, cities);

  const shouldShowAddTime = hasStartTimes(form.scheduleType);
  const deleteTime = form.deleteTimes[0] || "";
  const deleteBehaviorKind = form.is_not_del ? "mandatory" : deleteTime ? "time" : "nightly";
  const errors = getFormErrors(form);
  const hasErrors = Object.keys(errors).length > 0;
  const shownErrors = submitAttempted
    ? errors
    : { times: errors.times, deleteTime: errors.deleteTime };
  const invalidTimeIndexes = new Set(shownErrors.times || []);

  const changeField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const changeActivationCount = (value) => {
    changeField("activationCount", value.replace(/\D/g, ""));
  };

  const changeTime = (index, value) => {
    setForm((prev) => ({
      ...prev,
      times: prev.times.map((time, timeIndex) => (timeIndex === index ? value : time)),
    }));
  };

  const addTime = () => {
    setForm((prev) => ({ ...prev, times: [...prev.times, "10:00"] }));
  };

  const removeTime = (index) => {
    setForm((prev) => ({
      ...prev,
      times: prev.times.filter((_, timeIndex) => timeIndex !== index),
    }));
  };

  // BE keeps a single delete time; an untouched legacy list is sent back as is.
  const changeDeleteTime = (value) => {
    changeField("deleteTimes", value ? [value] : []);
  };

  // Keeps `triggerCleaningId` for every mode: BE resets the stored trigger when it is not sent.
  const changeScheduleType = (value) => {
    setForm((prev) => ({
      ...prev,
      scheduleType: value,
      days: getDaysFromScheduleType(value),
      times:
        value === "every_day_shift_end" ? ["19:00"] : hasStartTimes(value) ? prev.times : [],
    }));
  };

  const save = () => {
    if (!canEdit) {
      return;
    }

    setSubmitAttempted(true);
    if (hasErrors) {
      return;
    }

    onSave({
      ...form,
      name: form.name.trim() || "Новая уборка",
      duration: form.duration === "" ? "" : Number(form.duration),
      activationCount: form.activationCount === "" ? "" : parseInt(form.activationCount, 10),
      days: getDaysFromScheduleType(form.scheduleType),
      times: shouldShowAddTime ? form.times.filter(Boolean) : [],
      deleteTimes: form.deleteTimes.filter(Boolean),
    });
  };

  const scheduleHint = shownErrors.scheduleType ? (
    <FormHint tone="error">{shownErrors.scheduleType}</FormHint>
  ) : selectedScheduleOption?.description ? (
    <FormHint>{selectedScheduleOption.description}</FormHint>
  ) : null;

  const deleteCases = [
    {
      kind: "mandatory",
      text: "Включено «Не удалять автоматически» — задача остаётся, пока её не выполнят или не удалят вручную; время удаления не действует.",
    },
    {
      kind: "time",
      text: "Выключено и задано время — в это время все невзятые задачи этой уборки удаляются системой; задачи, взятые сотрудником, не трогаются.",
    },
    {
      kind: "nightly",
      text: `Выключено и время не задано — невзятые задачи удаляются ночной очисткой в ${NIGHTLY_CLEANUP_TIME} (уборки с пометкой «(Г)» возвращаются в список).`,
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
      slotProps={{
        paper: {
          sx: {
            width: { xs: "calc(100% - 24px)", md: 760 },
            borderRadius: "12px",
            maxHeight: "92vh",
            overflow: "hidden",
          },
        },
      }}
    >
      <DialogTitle
        sx={{ px: { xs: 2, md: 3 }, py: 1.75, borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Box>
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              Уборка
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, mt: 0.25, fontSize: { xs: 24, md: 28 } }}
            >
              {isEdit ? form.name : "Новая уборка"}
            </Typography>
          </Box>

          <IconButton
            size="small"
            onClick={onClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 2, md: 3 }, py: 2 }}>
        <Box sx={{ display: "grid", gap: 3 }}>
          <FormSection
            icon={<DescriptionOutlinedIcon />}
            title="Основное"
          >
            <Grid
              container
              spacing={2}
            >
              <Grid size={12}>
                <FormLabel>Объект уборки</FormLabel>
                <JacoTextInput
                  value={form.name}
                  disabled={!canEdit}
                  onChange={(event) => changeField("name", event.target.value)}
                />
              </Grid>
              <Grid size={12}>
                <FormLabel>Вид уборки</FormLabel>
                <JacoAutocomplete
                  options={categories}
                  value={selectedCategory}
                  disabled={!canEdit}
                  onChange={(_, value) => changeField("categoryId", value?.id ?? null)}
                  placeholder="Начните вводить вид уборки"
                />
              </Grid>
            </Grid>
          </FormSection>

          <FormSection
            icon={<PeopleAltOutlinedIcon />}
            title="Исполнитель"
          >
            <Grid
              container
              spacing={2}
            >
              <Grid size={{ xs: 12, md: 6 }}>
                <FormLabel>Должность</FormLabel>
                <JacoSelect
                  options={roleOptions}
                  value={form.roleId ?? ""}
                  disabled={!canEdit}
                  onChange={(event) => {
                    const value = event.target.value;
                    const selectedRole = resolvedRoleValues.find(
                      (role) => String(role.id) === String(value),
                    );

                    setForm((prev) => ({
                      ...prev,
                      roleId: value === "" ? null : Number(value),
                      role: selectedRole?.name || "",
                    }));
                  }}
                  allowNone={false}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormLabel>Длительность (мин)</FormLabel>
                <JacoTextInput
                  type="number"
                  value={form.duration}
                  disabled={!canEdit}
                  onChange={(event) => changeField("duration", event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormLabel>Количество активаций</FormLabel>
                <JacoTextInput
                  type="number"
                  value={form.activationCount}
                  disabled={!canEdit}
                  min={0}
                  step={1}
                  onChange={(event) => changeActivationCount(event.target.value)}
                />
              </Grid>
              <Grid size={12}>
                <FormLabel>Тип добавления</FormLabel>
                <RadioGroup
                  name="cleaning-addition-type"
                  value={form.additionType}
                  onChange={(event) => changeField("additionType", event.target.value)}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                    gap: 1.5,
                  }}
                >
                  {additionTypeChoices.map((option) => (
                    <JacoRadioCard
                      key={option.value}
                      value={option.value}
                      label={option.label}
                      description={option.description}
                      icon={additionTypeIcons[option.value] ?? <HelpOutlineOutlinedIcon />}
                      checked={form.additionType === option.value}
                      disabled={
                        !canEdit || (!option.selectable && form.additionType !== option.value)
                      }
                    />
                  ))}
                </RadioGroup>
                {form.additionType === LEGACY_ONLY_OPTION_VALUE ? (
                  <FormHint tone="warning">
                    Выберите тип добавления — «Другое» больше не используется
                  </FormHint>
                ) : null}
                {shownErrors.additionType ? (
                  <FormHint tone="error">{shownErrors.additionType}</FormHint>
                ) : null}
              </Grid>
            </Grid>
          </FormSection>

          <FormSection
            icon={<ScheduleOutlinedIcon />}
            title="Расписание"
          >
            <Grid
              container
              spacing={2}
              sx={{ mb: 2.25 }}
            >
              <Grid size={{ xs: 12, md: 6 }}>
                <FormLabel>День недели</FormLabel>
                <JacoSelect
                  options={scheduleSelectOptions}
                  value={form.scheduleType}
                  disabled={!canEdit}
                  onChange={(event) => changeScheduleType(event.target.value)}
                  allowNone={false}
                />
                {scheduleHint}
              </Grid>
              {form.scheduleType === "after_cleaning" ? (
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormLabel>После выполнения уборки</FormLabel>
                  <JacoAutocomplete
                    options={triggerOptions}
                    value={selectedTriggerCleaning}
                    disabled={!canEdit}
                    onChange={(_, value) => changeField("triggerCleaningId", value?.id ?? null)}
                    placeholder="Выберите уборку"
                  />
                  {shownErrors.triggerCleaningId ? (
                    <FormHint tone="error">{shownErrors.triggerCleaningId}</FormHint>
                  ) : null}
                </Grid>
              ) : null}
            </Grid>

            {shouldShowAddTime ? (
              <>
                <FormLabel>Время появления задачи</FormLabel>
                <Box sx={{ display: "grid", gap: 1.5, justifyItems: "start" }}>
                  {form.times.map((time, index) => (
                    <Box
                      key={`time_${index}`}
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <JacoTimePicker
                        picker
                        minutesStep={5}
                        value={time}
                        disabled={!canEdit}
                        onChange={(value) => changeTime(index, value)}
                        sx={timeFieldSx}
                      />
                      {canEdit ? (
                        <Tooltip title="Убрать время">
                          <IconButton
                            size="small"
                            onClick={() => removeTime(index)}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                    </Box>
                  ))}

                  {canEdit ? (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={addTime}
                      sx={{
                        borderStyle: "dashed",
                        px: 2,
                        py: 0.75,
                        borderRadius: "8px",
                        color: "text.secondary",
                      }}
                    >
                      Добавить время
                    </Button>
                  ) : null}
                </Box>
                <FormHint tone={invalidTimeIndexes.size ? "error" : "muted"}>
                  {invalidTimeIndexes.size
                    ? `Время ${[...invalidTimeIndexes].map((index) => form.times[index]).join(", ")} — укажите в формате ЧЧ:ММ с шагом 5 минут`
                    : "Время в формате ЧЧ:ММ с шагом 5 минут"}
                </FormHint>
              </>
            ) : null}

            <Box sx={{ mt: 2.25 }}>
              <FormLabel>Автоматическое удаление</FormLabel>
              <JacoCheckboxField
                label="Не удалять автоматически (обязательна к выполнению)"
                checked={form.is_not_del}
                disabled={!canEdit}
                onChange={(event) => changeField("is_not_del", event.target.checked)}
              />

              <Box sx={{ mt: 1.5 }}>
                <FormLabel>Время удаления</FormLabel>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <JacoTimePicker
                    picker
                    minutesStep={1}
                    value={deleteTime}
                    disabled={!canEdit || form.is_not_del}
                    onChange={changeDeleteTime}
                    sx={timeFieldSx}
                  />
                  {canEdit && !form.is_not_del && deleteTime ? (
                    <Tooltip title="Убрать время удаления">
                      <IconButton
                        size="small"
                        onClick={() => changeDeleteTime("")}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : null}
                </Box>
                {shownErrors.deleteTime ? (
                  <FormHint tone="error">{shownErrors.deleteTime}</FormHint>
                ) : null}
                {form.is_not_del && deleteTime ? (
                  <FormHint tone="warning">
                    Время удаления {deleteTime} сохранено, но не действует, пока включено «Не
                    удалять автоматически».
                  </FormHint>
                ) : null}
              </Box>

              <Box
                component="ul"
                sx={{ m: 0, mt: 1.5, pl: 2.25, display: "grid", gap: 0.5 }}
              >
                {deleteCases.map((deleteCase) => {
                  const isActive = deleteCase.kind === deleteBehaviorKind;

                  return (
                    <Typography
                      key={deleteCase.kind}
                      component="li"
                      sx={{
                        fontSize: 13,
                        lineHeight: 1.45,
                        color: isActive ? "text.primary" : "text.secondary",
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {deleteCase.text}
                    </Typography>
                  );
                })}
              </Box>
            </Box>
          </FormSection>

          <FormSection
            icon={<PlaceOutlinedIcon />}
            title="Кафе"
          >
            <JacoCityCafe
              points={cafePoints}
              value={selectedCafePoints}
              onChange={(points) =>
                changeField(
                  "locationIds",
                  points.map((point) => point.id),
                )
              }
              label="Кафе"
              placeholder="Выберите кафе"
              disabled={!canEdit}
              withAll={cafePoints.length > 0}
              withOrganizationMode={false}
            />
            <FormHint>{locationSummary || "Кафе не выбраны"}</FormHint>
          </FormSection>
        </Box>
      </DialogContent>

      <DialogActions
        disableSpacing
        sx={{
          px: { xs: 2, md: 3 },
          py: 1.5,
          borderTop: "1px solid",
          borderColor: "divider",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        {submitAttempted && hasErrors ? (
          <Typography sx={{ width: "100%", color: "error.main", fontSize: 13 }}>
            Проверьте отмеченные поля
          </Typography>
        ) : null}
        <Button
          size="small"
          variant="contained"
          onClick={save}
          disabled={!canEdit}
          sx={{ ...actionButtonSx, flex: 1 }}
        >
          Сохранить
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={onClose}
          sx={{ ...actionButtonSx, minWidth: 112, fontWeight: 500 }}
        >
          Отмена
        </Button>
      </DialogActions>
    </Dialog>
  );
}
