import React, { useState, useRef, useEffect } from "react";
import { Box, Popover, Grid, Tooltip, TextField, InputAdornment } from "@mui/material";

// Цвета из Google Docs (Material Design)
const GOOGLE_COLORS = {
  // Красные оттенки
  red: [
    "#ffebee",
    "#ffcdd2",
    "#ef9a9a",
    "#e57373",
    "#ef5350",
    "#f44336",
    "#e53935",
    "#d32f2f",
    "#c62828",
    "#b71c1c",
  ],
  // Розовые оттенки
  pink: [
    "#fce4ec",
    "#f8bbd0",
    "#f48fb1",
    "#f06292",
    "#ec407a",
    "#e91e63",
    "#d81b60",
    "#c2185b",
    "#ad1457",
    "#880e4f",
  ],
  // Фиолетовые оттенки
  purple: [
    "#f3e5f5",
    "#e1bee7",
    "#ce93d8",
    "#ba68c8",
    "#ab47bc",
    "#9c27b0",
    "#8e24aa",
    "#7b1fa2",
    "#6a1b9a",
    "#4a148c",
  ],
  // Синие оттенки
  blue: [
    "#e3f2fd",
    "#bbdef5",
    "#90caf9",
    "#64b5f6",
    "#42a5f5",
    "#2196f3",
    "#1e88e5",
    "#1976d2",
    "#1565c0",
    "#0d47a1",
  ],
  // Голубые оттенки
  cyan: [
    "#e0f7fa",
    "#b2ebf2",
    "#80deea",
    "#4dd0e1",
    "#26c6da",
    "#00bcd4",
    "#00acc1",
    "#0097a7",
    "#00838f",
    "#006064",
  ],
  // Зеленые оттенки
  green: [
    "#e8f5e9",
    "#c8e6c9",
    "#a5d6a7",
    "#81c784",
    "#66bb6a",
    "#4caf50",
    "#43a047",
    "#388e3c",
    "#2e7d32",
    "#1b5e20",
  ],
  // Желтые оттенки
  yellow: [
    "#fffde7",
    "#fff9c4",
    "#fff59d",
    "#fff176",
    "#ffee58",
    "#ffeb3b",
    "#fdd835",
    "#fbc02d",
    "#f9a825",
    "#f57f17",
  ],
  // Оранжевые оттенки
  orange: [
    "#fff3e0",
    "#ffe0b2",
    "#ffcc80",
    "#ffb74d",
    "#ffa726",
    "#ff9800",
    "#fb8c00",
    "#f57c00",
    "#ef6c00",
    "#e65100",
  ],
  // Серые оттенки
  grey: [
    "#fafafa",
    "#f5f5f5",
    "#eeeeee",
    "#e0e0e0",
    "#bdbdbd",
    "#9e9e9e",
    "#757575",
    "#616161",
    "#424242",
    "#212121",
  ],
  // Коричневые оттенки
  brown: [
    "#efebe9",
    "#d7ccc8",
    "#bcaaa4",
    "#a1887f",
    "#8d6e63",
    "#795548",
    "#6d4c41",
    "#5d4037",
    "#4e342e",
    "#3e2723",
  ],
};

// Цвета для градиентов от -100% до +100%
const GRADIENT_COLORS = {
  negative: ["#d32f2f", "#e57373", "#ffcdd2", "#ffebee"], // Красные для отрицательных
  zero: "#e0e0e0", // Серый для нуля
  positive: ["#c8e6c9", "#81c784", "#4caf50", "#2e7d32"], // Зеленые для положительных
};

const ColorPickerWithPalette = ({ color, onChange, showGradientPalette = false, value = 0 }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [customColor, setCustomColor] = useState(color);
  const colorInputRef = useRef(null);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleColorSelect = (selectedColor) => {
    onChange(selectedColor);
    setCustomColor(selectedColor);
    handleClose();
  };

  const handleCustomColorChange = (e) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    onChange(newColor);
  };

  const open = Boolean(anchorEl);

  // Получение цвета для градиента на основе значения (-100% до +100%)
  const getGradientColor = (value) => {
    const normalizedValue = Math.max(-100, Math.min(100, value));

    if (normalizedValue === 0) {
      return GRADIENT_COLORS.zero;
    }

    if (normalizedValue < 0) {
      const negativeColors = GRADIENT_COLORS.negative;
      const ratio = Math.abs(normalizedValue) / 100;
      const index = Math.floor(ratio * (negativeColors.length - 1));
      return negativeColors[index];
    } else {
      const positiveColors = GRADIENT_COLORS.positive;
      const ratio = normalizedValue / 100;
      const index = Math.floor(ratio * (positiveColors.length - 1));
      return positiveColors[index];
    }
  };

  const displayColor = showGradientPalette && value !== undefined ? getGradientColor(value) : color;

  return (
    <>
      <Box
        sx={{
          width: "40px",
          height: "40px",
          backgroundColor: color,
          border: "1px solid #d1d5db",
          borderRadius: 1,
          cursor: "pointer",
          position: "relative",
          transition: "all 0.2s",
          "&:hover": {
            transform: "scale(1.05)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          },
        }}
        onClick={handleOpen}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            p: 2,
            maxWidth: "500px",
            maxHeight: "500px",
            overflow: "auto",
          },
        }}
      >
        <Box sx={{ mb: 2 }}>
          <TextField
            size="small"
            label="Пользовательский цвет"
            value={customColor}
            onChange={handleCustomColorChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      backgroundColor: customColor,
                      border: "1px solid #d1d5db",
                      borderRadius: 0.5,
                    }}
                  />
                </InputAdornment>
              ),
            }}
            sx={{ width: "100%", mb: 2 }}
          />

          <input
            ref={colorInputRef}
            type="color"
            value={customColor}
            onChange={handleCustomColorChange}
            style={{
              position: "absolute",
              opacity: 0,
              pointerEvents: "none",
            }}
          />
        </Box>

        {Object.entries(GOOGLE_COLORS).map(([category, colors]) => (
          <Box
            key={category}
            sx={{ mb: 2 }}
          >
            <Box
              sx={{
                fontSize: "12px",
                fontWeight: 500,
                textTransform: "capitalize",
                mb: 1,
                color: "text.secondary",
              }}
            >
              {category === "red"
                ? "Красные"
                : category === "pink"
                  ? "Розовые"
                  : category === "purple"
                    ? "Фиолетовые"
                    : category === "blue"
                      ? "Синие"
                      : category === "cyan"
                        ? "Голубые"
                        : category === "green"
                          ? "Зеленые"
                          : category === "yellow"
                            ? "Желтые"
                            : category === "orange"
                              ? "Оранжевые"
                              : category === "grey"
                                ? "Серые"
                                : category === "brown"
                                  ? "Коричневые"
                                  : category}
            </Box>
            <Grid
              container
              spacing={0.5}
            >
              {colors.map((colorItem) => (
                <Grid
                  item
                  key={colorItem}
                >
                  <Tooltip
                    title={colorItem}
                    arrow
                  >
                    <Box
                      sx={{
                        width: "32px",
                        height: "32px",
                        backgroundColor: colorItem,
                        border: "1px solid #d1d5db",
                        borderRadius: 1,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        "&:hover": {
                          transform: "scale(1.1)",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          zIndex: 1,
                        },
                      }}
                      onClick={() => handleColorSelect(colorItem)}
                    />
                  </Tooltip>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}

        {showGradientPalette && (
          <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #e0e0e0" }}>
            <Box sx={{ fontSize: "12px", fontWeight: 500, mb: 1, color: "text.secondary" }}>
              Цвета градиента (от -100% до +100%)
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  flex: 1,
                  height: "40px",
                  borderRadius: 1,
                  overflow: "hidden",
                }}
              >
                {GRADIENT_COLORS.negative.map((color, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      flex: 1,
                      backgroundColor: color,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": { opacity: 0.8 },
                    }}
                    onClick={() => handleColorSelect(color)}
                  />
                ))}
                <Box
                  sx={{
                    width: "40px",
                    backgroundColor: GRADIENT_COLORS.zero,
                    cursor: "pointer",
                    "&:hover": { opacity: 0.8 },
                  }}
                  onClick={() => handleColorSelect(GRADIENT_COLORS.zero)}
                />
                {GRADIENT_COLORS.positive.map((color, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      flex: 1,
                      backgroundColor: color,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": { opacity: 0.8 },
                    }}
                    onClick={() => handleColorSelect(color)}
                  />
                ))}
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "10px",
                color: "text.secondary",
              }}
            >
              <span>-100%</span>
              <span>0%</span>
              <span>+100%</span>
            </Box>
          </Box>
        )}
      </Popover>
    </>
  );
};

export default ColorPickerWithPalette;
