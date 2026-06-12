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
import { days, defaultForm, locationCities, locationOptions, roles } from "./constants";
import { FormLabel, FormSection } from "./shared";

export default function CleaningTemplateDialog({ open, item, categories, onClose, onSave }) {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    setForm(
      item
        ? {
            ...item,
            times: [...item.times],
            days: [...item.days],
            locationIds: [...item.locationIds],
          }
        : defaultForm,
    );
  }, [item, open]);

  const isEdit = Boolean(item?.id);
  const selectedCategory = categories.find((category) => category.id === form.categoryId) ?? null;
  const selectedLocations = locationOptions.filter((location) =>
    form.locationIds.includes(location.id),
  );

  const changeField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDay = (value) => {
    setForm((prev) => {
      const nextDays = prev.days.includes(value)
        ? prev.days.filter((day) => day !== value)
        : [...prev.days, value];

      return { ...prev, days: nextDays };
    });
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

  const save = () => {
    onSave({
      ...form,
      name: form.name.trim() || "Новая уборка",
      duration: Number(form.duration) || 15,
      times: form.times.filter(Boolean),
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
                  onChange={(_, value) => value && changeField("categoryId", value.id)}
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
                    onChange={(event) => changeField("role", event.target.value)}
                    IconComponent={ExpandMoreIcon}
                  >
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
            </Grid>
          </FormSection>

          <FormSection
            icon={<ScheduleOutlinedIcon />}
            title="Расписание"
          >
            <FormLabel>Дни недели</FormLabel>
            <Box
              sx={{
                display: "flex",
                flexWrap: "nowrap",
                gap: { xs: 0.75, md: 1 },
                mb: 2.25,
                overflowX: "auto",
                pb: 0.25,
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              {days.map((day) => {
                const selected = form.days.includes(day.value);

                return (
                  <Button
                    size="small"
                    key={day.value}
                    variant={selected ? "contained" : "outlined"}
                    color={selected ? "primary" : "inherit"}
                    onClick={() => toggleDay(day.value)}
                    sx={{
                      minWidth: { xs: 42, md: 46 },
                      minHeight: 40,
                      flexShrink: 0,
                      borderRadius: "8px",
                      fontSize: 16,
                      fontWeight: 500,
                    }}
                  >
                    {day.label}
                  </Button>
                );
              })}
            </Box>

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
                    disabled={form.times.length === 1}
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
          sx={{ minHeight: 44, borderRadius: "8px", fontSize: 16, fontWeight: 700 }}
        >
          Сохранить
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={onClose}
          sx={{ minHeight: 44, minWidth: 112, borderRadius: "8px", fontSize: 16 }}
        >
          Отмена
        </Button>
      </DialogActions>
    </Dialog>
  );
}
