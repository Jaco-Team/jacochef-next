import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import React, { useState, useEffect, useRef } from "react";
import Grid from "@mui/material/Grid";
import { MyAutocomplite, MyTextInput } from "@/ui/Forms";
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
  Box,
  IconButton,
  Typography,
  Avatar,
  Card,
  CardMedia,
} from "@mui/material";
import { CloudUpload, Delete, AddPhotoAlternate } from "@mui/icons-material";

export const ModalProblems = ({
  open,
  onClose,
  save,
  positions,
  title = "Проблема с позициями",
}) => {
  const [comment, setComment] = useState("");
  const [value, setValue] = useState("no");
  const [solution, setSolution] = useState({});
  const desktopDropzoneContainerRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const solutions = [
    { id: 1, name: "Ошибка не выявлена" },
    { id: 2, name: "Извинение" },
    { id: 3, name: "Выдать не достающую позицию" },
  ];

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      const imageUrl = URL.createObjectURL(file);
      setPreviewUrl(imageUrl);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl("");
    if (document.getElementById("image-input")) {
      document.getElementById("image-input").value = "";
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const handleSave = () => {
    save(solution);
  };

  return (
    <Dialog
      sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
      maxWidth="xs"
      open={open}
      onClose={handleClose}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ fontWeight: "bold" }}>
        <div>
          <b>Выбранные позиции:</b>
          <ul>
            {positions.map((item) => (
              <li>{item.name}</li>
            ))}
          </ul>
        </div>
        <FormControl component="fieldset">
          <FormLabel component="legend">Тип проблемы</FormLabel>
          <RadioGroup
            aria-label="options"
            name="options-group"
            value={value}
            onChange={handleChange}
          >
            <FormControlLabel
              value="no"
              control={<Radio />}
              label="Нет проблем"
            />
            <FormControlLabel
              value="not-bring"
              control={<Radio />}
              label="Не привезли"
            />
            <FormControlLabel
              value="bring"
              control={<Radio />}
              label="Привезли не то"
            />
            <FormControlLabel
              value="non-marketable"
              control={<Radio />}
              label="Не товарный внешний вид"
            />
          </RadioGroup>
        </FormControl>
        <MyAutocomplite
          value={solution}
          data={solutions}
          func={(event, data) => setSolution(data)}
          multiple={false}
        />
        {value !== "no" ? (
          <>
            <Grid style={{ marginTop: "10px" }}>
              <MyTextInput
                value={comment}
                multiline={true}
                func={(e) => setComment(e.target.value)}
                label="Комментарий (опционально)"
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
                      "&:hover": { backgroundColor: "grey.100" },
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ) : (
                <Avatar
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
                  id="image-input"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageUpload}
                />
              </Button>

              {selectedImage && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                >
                  Файл: {selectedImage.name}
                  <br />
                  Размер: {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                  <br />
                  Тип: {selectedImage.type}
                </Typography>
              )}
            </Box>
          </>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button
          autoFocus
          onClick={handleClose}
        >
          Отмена
        </Button>
        <Button onClick={handleSave}>Сохранить</Button>
      </DialogActions>
    </Dialog>
  );
};
