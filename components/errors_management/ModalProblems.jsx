"use client";

import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
} from "@mui/material";
import { AddPhotoAlternate, CloudUpload, Delete } from "@mui/icons-material";
import { MyAutocomplite, MyTextInput } from "@/ui/Forms";

export const ModalProblems = ({
  open,
  onClose,
  save,
  positions,
  problem_arr = [],
  current_name,
  title = "Проблема с позициями",
}) => {
  const [comment, setComment] = useState("");
  const [value, setValue] = useState("no");
  const [solution, setSolution] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const solutions = [
    { id: 1, name: "Ошибка не выявлена" },
    { id: 2, name: "Извинение" },
    { id: 3, name: "Выдать не достающую позицию" },
  ];

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl("");

    const input = document.getElementById("errors-management-image-input");

    if (input) {
      input.value = "";
    }
  };

  useEffect(() => {
    const positionNames = new Set(positions.map((position) => position.id));

    const matchingItem = problem_arr.find(
      (item) => positionNames.has(item.id) && (item.id === current_name || item.id === ""),
    );

    if (matchingItem) {
      setValue(matchingItem.problem_name);
      setComment(matchingItem.problem_comment);
      setSolution(matchingItem.problem_solution);
      setPreviewUrl(matchingItem.previewUrl);
    } else {
      setValue("Нет проблем");
      setComment("");
      setSolution({});
      setPreviewUrl("");
    }
  }, [problem_arr, positions, current_name]);

  const handleSave = () => {
    setValue("Нет проблем");
    setComment("");
    setPreviewUrl("");
    setSelectedImage(null);

    save({ value, comment, solution, previewUrl, selectedImage });
  };

  return (
    <Dialog
      sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
      maxWidth="xs"
      open={open}
      onClose={onClose}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ fontWeight: "bold" }}>
        <div>
          <b>Выбранные позиции:</b>
          <ul>
            {positions.map((item, index) => (
              <li key={`${item.id || item.name}-${index}`}>{item.name}</li>
            ))}
          </ul>
        </div>

        <FormControl component="fieldset">
          <FormLabel component="legend">Тип проблемы</FormLabel>
          <RadioGroup
            aria-label="options"
            name="options-group"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          >
            <FormControlLabel
              value="Нет проблем"
              control={<Radio />}
              label="Нет проблем"
            />
            <FormControlLabel
              value="Не привезли"
              control={<Radio />}
              label="Не привезли"
            />
            <FormControlLabel
              value="Привезли не то"
              control={<Radio />}
              label="Привезли не то"
            />
            <FormControlLabel
              value="Не товарный внешний вид"
              control={<Radio />}
              label="Не товарный внешний вид"
            />
          </RadioGroup>
        </FormControl>

        <MyAutocomplite
          value={solution}
          data={solutions}
          label="Решение ошибки"
          func={(event, data) => setSolution(data)}
          multiple={false}
        />

        {value !== "no" ? (
          <>
            <Grid sx={{ mt: 1.25 }}>
              <MyTextInput
                value={comment}
                multiline={true}
                rows={4}
                func={(event) => setComment(event.target.value)}
                label="Комментарий"
              />
            </Grid>

            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "center", p: 2 }}
            >
              {previewUrl ? (
                <Box sx={{ position: "relative" }}>
                  <Card sx={{ maxWidth: 400 }}>
                    <CardMedia
                      component="img"
                      image={previewUrl}
                      alt="Preview"
                      sx={{ height: 100, objectFit: "cover" }}
                    />
                  </Card>
                  <IconButton
                    onClick={handleRemoveImage}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      backgroundColor: "white",
                      border: "2px solid red",
                      "&:hover": { backgroundColor: "grey.100" },
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ) : (
                <Avatar
                  component="label"
                  sx={{
                    width: 200,
                    height: 200,
                    bgcolor: "grey.100",
                    border: "2px dashed",
                    borderColor: "grey.300",
                  }}
                  variant="rounded"
                >
                  <AddPhotoAlternate sx={{ fontSize: 48, color: "grey.400" }} />
                  <input
                    id="errors-management-image-input"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageUpload}
                  />
                </Avatar>
              )}

              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUpload />}
                size="large"
              >
                Выбрать картинку
                <input
                  id="errors-management-image-input"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageUpload}
                />
              </Button>
            </Box>
          </>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button
          autoFocus
          onClick={onClose}
        >
          Отмена
        </Button>
        <Button onClick={handleSave}>Сохранить</Button>
      </DialogActions>
    </Dialog>
  );
};
