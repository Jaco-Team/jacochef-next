import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import CityCafeAutocomplete from "@/ui/CityCafeAutocomplete";
import {
  additionTypeOptions,
  defaultForm,
  locationCities,
  locationOptions,
  roles,
  scheduleTypeOptions,
} from "./constants";
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
  onClose,
  onSave,
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
            deleteTimes: [...(item.deleteTimes || [])],
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
  const selectedLocations = locationOptions.filter((location) =>
    form.locationIds.includes(location.id),
  );

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
    setForm((prev) => ({ ...prev, deleteTimes: [...prev.deleteTimes, "10:00"] }));
  };

  const removeDeleteTime = (index) => {
    setForm((prev) => ({
      ...prev,
      deleteTimes: prev.deleteTimes.filter((_, timeIndex) => timeIndex !== index),
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
    onSave({
      ...form,
      name: form.name.trim() || "Новая уборка",
      duration: form.duration === "" ? "" : Number(form.duration),
      activationCount: form.activationCount === "" ? "" : parseInt(form.activationCount, 10),
      days: getDaysFromScheduleType(form.scheduleType),
      triggerCleaningId: form.scheduleType === "after_cleaning" ? form.triggerCleaningId : null,
      times: shouldShowAddTime ? form.times.filter(Boolean) : [],
      deleteTimes: form.deleteTimes.filter(Boolean),
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
      PaperProps={{
        sx: {
          width: { xs: "calc(100% - 24px)", md: 760 },
          borderRadius: "12px",
          maxHeight: "92vh",
          overflow: "hidden",
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
                <TextField
                  size="small"
                  fullWidth
                  value={form.name}
                  onChange={(event) => changeField("name", event.target.value)}
                />
              </Grid>
              <Grid size={12}>
                <FormLabel>Категория</FormLabel>
                <Autocomplete
                  size="small"
                  options={categories}
                  value={selectedCategory}
                  onChange={(_, value) => changeField("categoryId", value?.id ?? null)}
                  getOptionLabel={(option) => option?.name || ""}
                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                  noOptionsText="Категория не найдена"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Начните вводить категорию"
                    />
                  )}
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
                <FormControl fullWidth>
                  <Select
                    size="small"
                    value={form.role}
                    displayEmpty
                    onChange={(event) => changeField("role", event.target.value)}
                    IconComponent={ExpandMoreIcon}
                  >
                    <MenuItem value="">
                      <Typography sx={{ color: "text.secondary" }}>Выберите роль</Typography>
                    </MenuItem>
                    {roles.map((role) => (
                      <MenuItem
                        key={role}
                        value={role}
                      >
                        {role}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormLabel>Длительность (мин)</FormLabel>
                <TextField
                  size="small"
                  fullWidth
                  type="number"
                  value={form.duration}
                  onChange={(event) => changeField("duration", event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormLabel>Количество активаций</FormLabel>
                <TextField
                  size="small"
                  fullWidth
                  type="number"
                  value={form.activationCount}
                  onChange={(event) => changeActivationCount(event.target.value)}
                  inputProps={{ min: 0, step: 1 }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormLabel>Тип добавления</FormLabel>
                <FormControl fullWidth>
                  <Select
                    size="small"
                    value={form.additionType}
                    displayEmpty
                    onChange={(event) => changeField("additionType", event.target.value)}
                    IconComponent={ExpandMoreIcon}
                  >
                    <MenuItem value="">
                      <Typography sx={{ color: "text.secondary" }}>Выберите тип</Typography>
                    </MenuItem>
                    {additionTypeOptions.map((option) => (
                      <MenuItem
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
                <FormControl fullWidth>
                  <Select
                    size="small"
                    value={form.scheduleType}
                    displayEmpty
                    onChange={(event) => changeScheduleType(event.target.value)}
                    IconComponent={ExpandMoreIcon}
                  >
                    <MenuItem value="">
                      <Typography sx={{ color: "text.secondary" }}>
                        Выберите день или режим
                      </Typography>
                    </MenuItem>
                    {scheduleTypeOptions.map((option) => (
                      <MenuItem
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {form.scheduleType === "after_cleaning" ? (
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormLabel>После выполнения уборки</FormLabel>
                  <Autocomplete
                    size="small"
                    options={templates}
                    value={selectedTriggerCleaning}
                    onChange={(_, value) => changeField("triggerCleaningId", value?.id ?? null)}
                    getOptionLabel={(option) => option?.name || ""}
                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                    noOptionsText="Уборка не найдена"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Выберите уборку"
                      />
                    )}
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
                      <TextField
                        size="small"
                        type="time"
                        value={time}
                        onChange={(event) => changeTime(index, event.target.value)}
                        sx={{ width: 132 }}
                        InputProps={{
                          sx: { fontSize: 16 },
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => removeTime(index)}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}

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
                </Box>
              </>
            ) : null}

            <Box sx={{ mt: 2.25 }}>
              <FormLabel>Время автоматического удаления</FormLabel>
              <Box sx={{ display: "grid", gap: 1.5, justifyItems: "start" }}>
                {form.deleteTimes.map((time, index) => (
                  <Box
                    key={`delete_time_${index}`}
                    sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                  >
                    <TextField
                      size="small"
                      type="time"
                      value={time}
                      onChange={(event) => changeDeleteTime(index, event.target.value)}
                      sx={{ width: 132 }}
                      InputProps={{
                        sx: { fontSize: 16 },
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => removeDeleteTime(index)}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}

                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addDeleteTime}
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
              </Box>
            </Box>
          </FormSection>

          <FormSection
            icon={<PlaceOutlinedIcon />}
            title="Локации"
          >
            <CityCafeAutocomplete
              cities={locationCities}
              value={selectedLocations}
              onChange={(value) =>
                changeField(
                  "locationIds",
                  value.map((location) => location.id),
                )
              }
              label="Локации"
              placeholder="Выберите локации"
              stickyGroupLabels={false}
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
