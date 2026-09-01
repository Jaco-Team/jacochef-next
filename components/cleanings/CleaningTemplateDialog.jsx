import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import {
  MyAutoCompleteWithAll,
  MyAutocomplite,
  MyCheckBox,
  MySelect,
  MyTextInput,
} from "@/ui/Forms";
import { days, defaultForm } from "./constants";
import { getDaysFromScheduleType, getScheduleTypeFromDays } from "./helpers";
import { FormLabel, FormSection } from "./shared";

const actionButtonSx = {
  minHeight: 44,
  borderRadius: "8px",
  fontSize: 16,
  fontWeight: 700,
  lineHeight: "20px",
  alignItems: "center",
  justifyContent: "center",
};

export default function CleaningTemplateDialog({
  open,
  item,
  categories,
  templates = [],
  locations = [],
  roles = [],
  scheduleTypeOptions = [],
  additionTypeOptions = [],
  onClose,
  onSave,
  canEdit,
}) {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    setForm(
      item
        ? {
            ...defaultForm,
            ...item,
            scheduleType: getScheduleTypeFromDays(item),
            activationCount: item.activationCount ?? "",
            additionType: item.additionType ?? "",
            triggerCleaningId: item.triggerCleaningId ?? null,
            deleteTimes: item.is_not_del ? [] : [...(item.deleteTimes || [])],
            times: [...(item.times || [])],
            days: [...(item.days || [])],
            locationIds: [...(item.locationIds || [])],
          }
        : { ...defaultForm },
    );
  }, [item, open]);

  const isEdit = Boolean(item?.id);
  const selectedCategory = categories.find((category) => category.id === form.categoryId) ?? null;
  const selectedTriggerCleaning =
    templates.find((template) => template.id === form.triggerCleaningId) ?? null;
  const selectedLocations = locations.filter((location) => form.locationIds.includes(location.id));
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
    { id: "", name: "Выберите роль" },
    ...resolvedRoleValues.map((role) => ({ id: role.id, name: role.name })),
  ];
  const additionTypeSelectOptions = [
    { id: "", name: "Выберите тип" },
    ...additionTypeOptions.map((option) => ({ id: option.value, name: option.label })),
  ];
  const resolvedScheduleTypeOptions = (() => {
    const hasWeekly = scheduleTypeOptions.some((option) => option?.value === "weekly");

    if (!hasWeekly) {
      return scheduleTypeOptions;
    }

    return [
      ...days,
      ...scheduleTypeOptions.filter((option) => option?.value && option.value !== "weekly"),
    ];
  })();
  const scheduleTypeSelectOptions = [
    { id: "", name: "Выберите день или режим" },
    ...resolvedScheduleTypeOptions.map((option) => ({ id: option.value, name: option.label })),
  ];

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

  const changeDeleteTime = (index, value) => {
    setForm((prev) => ({
      ...prev,
      deleteTimes: prev.deleteTimes.map((time, timeIndex) => (timeIndex === index ? value : time)),
    }));
  };

  const addDeleteTime = () => {
    setForm((prev) =>
      prev.is_not_del ? prev : { ...prev, deleteTimes: [...prev.deleteTimes, "10:00"] },
    );
  };

  const removeDeleteTime = (index) => {
    setForm((prev) => ({
      ...prev,
      deleteTimes: prev.deleteTimes.filter((_, timeIndex) => timeIndex !== index),
    }));
  };

  const changeDoNotDeleteAtShiftEnd = (checked) => {
    setForm((prev) => ({
      ...prev,
      is_not_del: checked,
      deleteTimes: checked ? [] : prev.deleteTimes,
    }));
  };

  const changeScheduleType = (value) => {
    setForm((prev) => {
      const shouldHideAddTime = value === "manual" || value === "after_cleaning";

      return {
        ...prev,
        scheduleType: value,
        days: getDaysFromScheduleType(value),
        times: value === "every_day_shift_end" ? ["19:00"] : shouldHideAddTime ? [] : prev.times,
        triggerCleaningId: value === "after_cleaning" ? prev.triggerCleaningId : null,
      };
    });
  };

  const shouldShowAddTime =
    form.scheduleType !== "manual" && form.scheduleType !== "after_cleaning";

  const save = () => {
    if (!canEdit) {
      return;
    }

    onSave({
      ...form,
      name: form.name.trim() || "Новая уборка",
      duration: form.duration === "" ? "" : Number(form.duration),
      activationCount: form.activationCount === "" ? "" : parseInt(form.activationCount, 10),
      days: getDaysFromScheduleType(form.scheduleType),
      triggerCleaningId: form.scheduleType === "after_cleaning" ? form.triggerCleaningId : null,
      times: shouldShowAddTime ? form.times.filter(Boolean) : [],
      deleteTimes: form.is_not_del ? [] : form.deleteTimes.filter(Boolean),
    });
  };

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
                <FormLabel>Название</FormLabel>
                <MyTextInput
                  value={form.name}
                  disabled={!canEdit}
                  func={(event) => changeField("name", event.target.value)}
                />
              </Grid>
              <Grid size={12}>
                <FormLabel>Категория</FormLabel>
                <MyAutocomplite
                  multiple={false}
                  data={categories}
                  value={selectedCategory}
                  disabled={!canEdit}
                  func={(_, value) => changeField("categoryId", value?.id ?? null)}
                  placeholder="Начните вводить категорию"
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
                <FormLabel>Роль</FormLabel>
                <MySelect
                  data={roleOptions}
                  value={form.roleId ?? ""}
                  disabled={!canEdit}
                  func={(event) => {
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
                  is_none={false}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormLabel>Длительность (мин)</FormLabel>
                <MyTextInput
                  type="number"
                  value={form.duration}
                  disabled={!canEdit}
                  func={(event) => changeField("duration", event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormLabel>Количество активаций</FormLabel>
                <MyTextInput
                  type="number"
                  value={form.activationCount}
                  disabled={!canEdit}
                  func={(event) => changeActivationCount(event.target.value)}
                  inputProps={{ min: 0, step: 1 }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormLabel>Тип добавления</FormLabel>
                <MySelect
                  data={additionTypeSelectOptions}
                  value={form.additionType}
                  disabled={!canEdit}
                  func={(event) => changeField("additionType", event.target.value)}
                  is_none={false}
                />
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
                <MySelect
                  data={scheduleTypeSelectOptions}
                  value={form.scheduleType}
                  disabled={!canEdit}
                  func={(event) => changeScheduleType(event.target.value)}
                  is_none={false}
                />
              </Grid>
              {form.scheduleType === "after_cleaning" ? (
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormLabel>После выполнения уборки</FormLabel>
                  <MyAutocomplite
                    multiple={false}
                    data={templates}
                    value={selectedTriggerCleaning}
                    disabled={!canEdit}
                    func={(_, value) => changeField("triggerCleaningId", value?.id ?? null)}
                    placeholder="Выберите уборку"
                  />
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
                      <MyTextInput
                        type="time"
                        value={time}
                        disabled={!canEdit}
                        func={(event) => changeTime(index, event.target.value)}
                        sx={{ width: 132 }}
                      />
                      {canEdit ? (
                        <IconButton
                          size="small"
                          onClick={() => removeTime(index)}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
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
              </>
            ) : null}

            <Box sx={{ mt: 2.25 }}>
              <FormLabel>Время автоматического удаления</FormLabel>
              <Typography sx={{ color: "text.secondary", fontSize: 13, mb: 1.25 }}>
                Удаляет неназначенную задачу в указанное время. При включённой настройке «Не удалять
                в конце смены» автоматическое удаление отключается.
              </Typography>
              <Box sx={{ display: "grid", gap: 1.5, justifyItems: "start" }}>
                {form.deleteTimes.map((time, index) => (
                  <Box
                    key={`delete_time_${index}`}
                    sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                  >
                    <MyTextInput
                      type="time"
                      value={time}
                      disabled={!canEdit || form.is_not_del}
                      func={(event) => changeDeleteTime(index, event.target.value)}
                      sx={{ width: 132 }}
                    />
                    {canEdit && !form.is_not_del ? (
                      <IconButton
                        size="small"
                        onClick={() => removeDeleteTime(index)}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    ) : null}
                  </Box>
                ))}

                {canEdit ? (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={addDeleteTime}
                    disabled={form.is_not_del}
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

              <Box sx={{ mt: 2 }}>
                <MyCheckBox
                  label="Не удалять в конце смены"
                  value={form.is_not_del}
                  disabled={!canEdit}
                  func={(event) => changeDoNotDeleteAtShiftEnd(event.target.checked)}
                />
              </Box>
            </Box>
          </FormSection>

          <FormSection
            icon={<PlaceOutlinedIcon />}
            title="Локации"
          >
            <MyAutoCompleteWithAll
              label="Локации"
              placeholder="Выберите локации"
              options={locations}
              value={selectedLocations}
              disabled={!canEdit}
              onChange={(value) =>
                changeField(
                  "locationIds",
                  value.map((location) => location.id),
                )
              }
              withAll
              withAllLabel="Все"
            />
          </FormSection>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2, md: 3 },
          py: 1.5,
          borderTop: "1px solid",
          borderColor: "divider",
          gap: 1.5,
        }}
      >
        <Button
          size="small"
          variant="contained"
          fullWidth
          onClick={save}
          disabled={!canEdit}
          sx={actionButtonSx}
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
