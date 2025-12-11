import React from "react";

import Script from "next/script";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";

import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import Paper from "@mui/material/Paper";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import QueryStatsIcon from "@mui/icons-material/QueryStats";

import { MyTextInput, MyAutocomplite, MyDatePickerNewViews } from "@/ui/Forms";

import { api_laravel_local, api_laravel } from "@/src/api_new";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { formatDateMin } from "@/src/helpers/ui/formatDate";
import MyAlert from "@/ui/MyAlert";
dayjs.locale("ru");

var am5locales_ru_RU = {
  Jan: "Янв",
  January: "Янв",
  Feb: "Фев",
  February: "Фев",
  Mar: "Мар",
  March: "Мар",
  Apr: "Апр",
  April: "Апр",
  May: "Май",
  Jun: "Июн",
  June: "Июн",
  Jul: "Июл",
  July: "Июл",
  Aug: "Авг",
  August: "Авг",
  Sep: "Сен",
  September: "Сен",
  Oct: "Окт",
  October: "Окт",
  Nov: "Ноя",
  November: "Ноя",
  Dec: "Дек",
  December: "Дек",
};

// ---------- Вспомогательные функции для переключения Табов ----------

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

// ---------- Вспомогательные функции для конвертации цветов ----------

function rgbToHex(r, g, b) {
  const toHex = (v) => {
    const h = v.toString(16);
    return h.length === 1 ? "0" + h : h;
  };
  return "#" + toHex(r) + toHex(g) + toHex(b);
}

function hexToRgb(hex) {
  let cleanHex = hex.replace(/^#/, "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  let r,
    g,
    b,
    a = 255;

  if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  } else if (cleanHex.length === 8) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
    a = parseInt(cleanHex.substring(6, 8), 16);
  } else {
    return null;
  }

  return { r, g, b, a };
}

function hsvaToRgba({ h, s, v, a }) {
  const f = (n, k = (n + h * 6) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  const r = Math.round(f(5) * 255);
  const g = Math.round(f(3) * 255);
  const b = Math.round(f(1) * 255);
  return { r, g, b, a };
}

function rgbaToHsva({ r, g, b, a }) {
  const rP = r / 255,
    gP = g / 255,
    bP = b / 255;
  const max = Math.max(rP, gP, bP),
    min = Math.min(rP, gP, bP);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case rP:
        h = (gP - bP) / d + (gP < bP ? 6 : 0);
        break;
      case gP:
        h = (bP - rP) / d + 2;
        break;
      case bP:
        h = (rP - gP) / d + 4;
        break;
      default:
        break;
    }
    h /= 6;
  }

  return { h, s, v, a };
}

function hsvaToCssRgba(hsva) {
  const { r, g, b, a } = hsvaToRgba(hsva);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function hexToHsva(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return { h: 0, s: 0, v: 0, a: 1 };
  }
  return rgbaToHsva({ ...rgb, a: 1 });
}

function hsvaToHex(hsva) {
  const { r, g, b } = hsvaToRgba(hsva);
  const hex = rgbToHex(r, g, b);

  if (Math.abs(hsva.a - 1) < 0.001) {
    return hex;
  }
  const alpha = Math.round(hsva.a * 255);
  const alphaHex = alpha.toString(16).padStart(2, "0").toUpperCase();
  return hex + alphaHex;
}

// ---------- Кастомный колорпикер для выбора цвета в модалке Коэффициенты ----------

export class CustomColorPicker extends React.Component {
  constructor(props) {
    super(props);

    let initialHsva = { h: 0, s: 1, v: 1, a: 1 };

    if (props.initialColor) {
      if (typeof props.initialColor === "string") {
        initialHsva = hexToHsva(props.initialColor);
      } else if (typeof props.initialColor === "object" && props.initialColor.h !== undefined) {
        initialHsva = props.initialColor;
      }
    }

    this.state = {
      hsva: initialHsva,
      hexInput: hsvaToHex(initialHsva),
      draggingAlpha: false,
      draggingWheel: false,
      activePreset: "default",
    };

    this.wheelRef = React.createRef();

    this.alphaSliderRef = React.createRef();

    // Параметры колеса
    this.wheelSize = 200; // Диаметр canvas

    // Параметры слайдера прозрачности
    this.alphaWidth = 200;
    this.alphaHeight = 20;

    // Цветовые пресеты как в Google Документах
    this.colorPresets = {
      default: [
        [
          "#000000",
          "#434343",
          "#666666",
          "#999999",
          "#B7B7B7",
          "#CCCCCC",
          "#D9D9D9",
          "#EFEFEF",
          "#F3F3F3",
          "#FFFFFF",
        ],
        [
          "#980000",
          "#FF0000",
          "#FF9900",
          "#FFCC00",
          "#FFFF00",
          "#00FF00",
          "#00FFFF",
          "#4A86E8",
          "#0000FF",
          "#9900FF",
        ],
        [
          "#E6B8AF",
          "#F4CCCC",
          "#FCE5CD",
          "#FFF2CC",
          "#D9EAD3",
          "#D0E0E3",
          "#C9DAF8",
          "#CFE2F3",
          "#D9D2E9",
          "#EAD1DC",
        ],
        [
          "#DD7E6B",
          "#EA9999",
          "#F9CB9C",
          "#FFE599",
          "#B6D7A8",
          "#A2C4C9",
          "#A4C2F4",
          "#9FC5E8",
          "#B4A7D6",
          "#D5A6BD",
        ],
        [
          "#CC4125",
          "#E06666",
          "#F6B26B",
          "#FFD966",
          "#93C47D",
          "#76A5AF",
          "#6D9EEB",
          "#6FA8DC",
          "#8E7CC3",
          "#C27BA0",
        ],
        [
          "#A61C00",
          "#CC0000",
          "#E69138",
          "#F1C232",
          "#6AA84F",
          "#45818E",
          "#3C78D8",
          "#3D85C6",
          "#674EA7",
          "#A64D79",
        ],
        [
          "#85200C",
          "#990000",
          "#B45F06",
          "#BF9000",
          "#38761D",
          "#134F5C",
          "#1155CC",
          "#0B5394",
          "#351C75",
          "#741B47",
        ],
        [
          "#5B0F00",
          "#660000",
          "#783F04",
          "#7F6000",
          "#274E13",
          "#0C343D",
          "#1C4587",
          "#073763",
          "#20124D",
          "#4C1130",
        ],
      ],
      material: [
        // Material Design colors
        [
          "#FFEBEE",
          "#FFCDD2",
          "#EF9A9A",
          "#E57373",
          "#EF5350",
          "#F44336",
          "#E53935",
          "#D32F2F",
          "#C62828",
          "#B71C1C",
        ],
        [
          "#F3E5F5",
          "#E1BEE7",
          "#CE93D8",
          "#BA68C8",
          "#AB47BC",
          "#9C27B0",
          "#8E24AA",
          "#7B1FA2",
          "#6A1B9A",
          "#4A148C",
        ],
        [
          "#E8EAF6",
          "#C5CAE9",
          "#9FA8DA",
          "#7986CB",
          "#5C6BC0",
          "#3F51B5",
          "#3949AB",
          "#303F9F",
          "#283593",
          "#1A237E",
        ],
        [
          "#E1F5FE",
          "#B3E5FC",
          "#81D4FA",
          "#4FC3F7",
          "#29B6F6",
          "#03A9F4",
          "#039BE5",
          "#0288D1",
          "#0277BD",
          "#01579B",
        ],
      ],
      pastel: [
        // Пастельные тона
        [
          "#FFB5B5",
          "#FFD8B5",
          "#FFF7B5",
          "#DBFFB5",
          "#B5FFC9",
          "#B5FFFC",
          "#B5DEFF",
          "#C2B5FF",
          "#EBB5FF",
          "#FFB5F0",
        ],
        [
          "#FF9E9E",
          "#FFC79E",
          "#FFF49E",
          "#D4FF9E",
          "#9EFFB8",
          "#9EFFF4",
          "#9ED4FF",
          "#B19EFF",
          "#E29EFF",
          "#FF9EEA",
        ],
        [
          "#FF8787",
          "#FFB687",
          "#FFF187",
          "#CCFF87",
          "#87FFA7",
          "#87FFEB",
          "#87CCFF",
          "#9F87FF",
          "#D987FF",
          "#FF87E3",
        ],
        [
          "#FF7070",
          "#FFA570",
          "#FFEE70",
          "#C5FF70",
          "#70FF96",
          "#70FFE2",
          "#70C5FF",
          "#8E70FF",
          "#D170FF",
          "#FF70DC",
        ],
      ],
    };

    // Стандартные цвета (как были раньше)
    this.colorSwatches = [
      "#FF0000",
      "#FF9900",
      "#FFFF00",
      "#00FF00",
      "#00FFFF",
      "#0000FF",
      "#9900FF",
      "#FF00FF",
      "#FF66CC",
      "#FF0066",
      "#663300",
      "#666666",
      "#999999",
      "#CC0000",
      "#00CCFF",
      "#CCFF00",
    ];
  }

  componentDidMount() {
    this.drawColorWheel();

    window.addEventListener("touchmove", this.handleAlphaMove, { passive: false });
    window.addEventListener("touchend", this.handleAlphaUp);
    window.addEventListener("touchmove", this.handleWheelMove, { passive: false });
    window.addEventListener("touchend", this.handleWheelUp);
    window.addEventListener("mousemove", this.handleAlphaMove);
    window.addEventListener("mouseup", this.handleAlphaUp);
    window.addEventListener("mousemove", this.handleWheelMove);
    window.addEventListener("mouseup", this.handleWheelUp);
  }

  componentWillUnmount() {
    window.removeEventListener("mousemove", this.handleAlphaMove);
    window.removeEventListener("mouseup", this.handleAlphaUp);
    window.removeEventListener("mousemove", this.handleWheelMove);
    window.removeEventListener("mouseup", this.handleWheelUp);
  }

  drawColorWheel() {
    const canvas = this.wheelRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = this.wheelSize;
    const radius = size / 2;

    ctx.clearRect(0, 0, size, size);

    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - radius;
        const dy = y - radius;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > radius) {
          // за пределами круга — прозрачный
          const idx = (y * size + x) * 4;
          data[idx + 3] = 0;
          continue;
        }
        let angle = Math.atan2(dy, dx);
        angle = angle < 0 ? angle + 2 * Math.PI : angle;
        const h = angle / (2 * Math.PI);
        const s = dist / radius;
        const v = 1;

        const { r, g, b } = hsvaToRgba({ h, s, v, a: 1 });
        const idx = (y * size + x) * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  handleWheelClick = (e) => {
    if (document.activeElement) {
      document.activeElement.blur();
    }

    this.setState({ draggingWheel: true });
    this.updateWheel(e);
  };

  updateWheel = (e) => {
    if (e.cancelable) {
      e.preventDefault();
    }

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const rect = this.wheelRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const radius = this.wheelSize / 2;
    const dx = x - radius;
    const dy = y - radius;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > radius) return;

    let angle = Math.atan2(dy, dx);
    angle = angle < 0 ? angle + 2 * Math.PI : angle;
    const h = angle / (2 * Math.PI);
    const s = dist / radius;
    const { v, a } = this.state.hsva;
    const newHsva = { h, s, v, a };

    const finalHex = hsvaToHex(newHsva);

    this.setState({ hsva: newHsva, hexInput: finalHex });
    this.props.hsvaConvertHex(newHsva);
  };

  // Обработчик движения мыши:
  handleWheelMove = (e) => {
    if (!this.state.draggingWheel) return;
    this.updateWheel(e);
  };

  // Обработчик отпускания кнопки мыши:
  handleWheelUp = () => {
    if (this.state.draggingWheel) {
      this.setState({ draggingWheel: false });
    }
  };

  handlePresetClick = (hex) => {
    const newHsva = hexToHsva(hex);
    newHsva.a = this.state.hsva.a;

    const finalHex = hsvaToHex(newHsva);

    this.setState({ hsva: newHsva, hexInput: finalHex });

    this.props.hsvaConvertHex(newHsva);
  };

  handlePresetGroupChange = (presetName) => {
    this.setState({ activePreset: presetName });
  };

  renderColorPresets() {
    const { activePreset } = this.state;
    const currentPreset = this.colorPresets[activePreset];

    return (
      <div style={{ marginTop: 20 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 15, justifyContent: "center" }}>
          <button
            onClick={() => this.handlePresetGroupChange("default")}
            style={{
              padding: "5px 10px",
              border: "1px solid #ccc",
              borderRadius: 4,
              background: activePreset === "default" ? "#e3f2fd" : "#fff",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            Стандартные
          </button>
          <button
            onClick={() => this.handlePresetGroupChange("material")}
            style={{
              padding: "5px 10px",
              border: "1px solid #ccc",
              borderRadius: 4,
              background: activePreset === "material" ? "#e3f2fd" : "#fff",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            Material
          </button>
          <button
            onClick={() => this.handlePresetGroupChange("pastel")}
            style={{
              padding: "5px 10px",
              border: "1px solid #ccc",
              borderRadius: 4,
              background: activePreset === "pastel" ? "#e3f2fd" : "#fff",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            Пастельные
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {currentPreset.map((row, rowIndex) => (
            <div
              key={rowIndex}
              style={{ display: "flex", gap: 8, justifyContent: "center" }}
            >
              {row.map((color, colorIndex) => (
                <div
                  key={colorIndex}
                  onClick={() => this.handlePresetClick(color)}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    cursor: "pointer",
                    backgroundColor: color,
                    border:
                      hsvaToHex(this.state.hsva).toLowerCase() === color.toLowerCase()
                        ? "3px solid #1976d2"
                        : "1px solid #ddd",
                    boxShadow:
                      hsvaToHex(this.state.hsva).toLowerCase() === color.toLowerCase()
                        ? "0 0 0 1px #fff inset"
                        : "none",
                    transition: "all 0.2s ease",
                  }}
                  title={color}
                ></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  handleSwatchClick = (hex) => {
    const newHsva = hexToHsva(hex);
    newHsva.a = this.state.hsva.a;

    const finalHex = hsvaToHex(newHsva);

    this.setState({ hsva: newHsva, hexInput: finalHex });

    this.props.hsvaConvertHex(newHsva);
  };

  handleAlphaDown = (e) => {
    if (document.activeElement) {
      document.activeElement.blur();
    }

    this.setState({ draggingAlpha: true });
    this.updateAlpha(e);
  };

  handleAlphaMove = (e) => {
    if (!this.state.draggingAlpha) return;
    this.updateAlpha(e);
  };

  handleAlphaUp = () => {
    if (this.state.draggingAlpha) {
      this.setState({ draggingAlpha: false });
    }
  };

  updateAlpha(e) {
    if (e.cancelable) e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    if (!this.alphaSliderRef.current) return;
    const rect = this.alphaSliderRef.current.getBoundingClientRect();
    let x = clientX - rect.left;
    if (x < 0) x = 0;
    if (x > rect.width) x = rect.width;
    const alpha = x / rect.width;

    const { h, s, v } = this.state.hsva;

    const finalHex = hsvaToHex({ h, s, v, a: alpha });

    this.setState({ hsva: { h, s, v, a: alpha }, hexInput: finalHex });
    this.props.hsvaConvertHex({ h, s, v, a: alpha });
  }

  renderAlphaSlider() {
    const { h, s, v, a } = this.state.hsva;

    const { r, g, b } = hsvaToRgba({ h, s, v, a: 1 });
    const baseColor = `${r}, ${g}, ${b}`;

    const sliderWidth = this.alphaWidth;
    const sliderHeight = this.alphaHeight;
    const handleSize = 20;

    const handlePos = a * (sliderWidth - handleSize);

    return (
      <div
        ref={this.alphaSliderRef}
        style={{
          position: "relative",
          width: sliderWidth,
          height: sliderHeight,
          borderRadius: 10,
          margin: "0 auto",
          cursor: "pointer",
        }}
        onMouseDown={this.handleAlphaDown}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              repeating-linear-gradient(
                45deg,
                #ccc 0,
                #ccc 8px,
                #fff 8px,
                #fff 16px
              )
            `,
            borderRadius: 10,
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(
              to right,
              rgba(${baseColor}, 0) 0%,
              rgba(${baseColor}, 1) 100%
            )`,
            borderRadius: 10,
          }}
        />

        <div
          style={{
            position: "absolute",
            top: (sliderHeight - handleSize) / 2,
            left: handlePos,
            width: handleSize,
            height: handleSize,
            borderRadius: "50%",
            background: "#fff",
            border: "1px solid #ccc",
            boxShadow: "0 0 3px rgba(0,0,0,0.3)",
          }}
        />
      </div>
    );
  }

  handleHexInputChange = (e) => {
    const inputValue = e.target.value;

    this.setState({ hexInput: inputValue });
  };

  handleHexInputBlur = () => {
    let { hexInput, hsva } = this.state;

    hexInput = hexInput.trim();

    if (!hexInput) {
      this.setState({ hexInput: hsvaToHex(hsva) });
      return;
    }

    if (!hexInput.startsWith("#")) {
      hexInput = "#" + hexInput;
    }

    const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

    if (!hexRegex.test(hexInput)) {
      this.setState({ hexInput: hsvaToHex(hsva) });
      return;
    }

    const newHsva = hexToHsva(hexInput);

    const finalHex = hsvaToHex(newHsva);

    this.setState({ hsva: newHsva, hexInput: finalHex });

    if (this.props.hsvaConvertHex) {
      this.props.hsvaConvertHex(newHsva);
    }
  };

  render() {
    const { hsva, hexInput } = this.state;
    const currentColorRgba = hsvaToCssRgba(hsva);

    const radius = this.wheelSize / 2;
    const markerSize = 12;
    const effectiveRadius = radius - markerSize;
    const markerX = radius + hsva.s * effectiveRadius * Math.cos(hsva.h * 2 * Math.PI);
    const markerY = radius + hsva.s * effectiveRadius * Math.sin(hsva.h * 2 * Math.PI);

    return (
      <div style={{ maxWidth: 300 }}>
        <div style={{ marginBottom: 20 }}>
          <h3>Выбрать цвет ячейки</h3>
        </div>
        <div
          style={{
            position: "relative",
            width: this.wheelSize,
            height: this.wheelSize,
            margin: "0 auto",
          }}
        >
          <canvas
            ref={this.wheelRef}
            width={this.wheelSize}
            height={this.wheelSize}
            onMouseDown={this.handleWheelClick}
            onTouchStart={this.handleWheelClick}
            style={{
              cursor: "pointer",
              borderRadius: "50%",
              display: "block",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: markerX,
              top: markerY,
              width: markerSize,
              height: markerSize,
              borderRadius: "50%",
              border: "2px solid #fff",
              backgroundColor: currentColorRgba,
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          />
        </div>
        <div style={{ marginTop: 20 }}>
          <TextField
            label="Указать цвет в формате hex"
            variant="outlined"
            fullWidth
            value={hexInput}
            onChange={this.handleHexInputChange}
            onBlur={this.handleHexInputBlur}
            sx={{
              marginTop: 2,
              "& .MuiInputBase-root": {
                fontWeight: "bold",
                fontSize: "1.2rem",
                minHeight: "40px",
                borderRadius: "4px",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#c03",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#c03",
              },
              "& .MuiOutlinedInput-notchedOutline legend": {
                maxWidth: "170px",
              },
              "&:hover .MuiInputLabel-root": {
                color: "#c03",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#c03",
              },
            }}
            slotProps={{
              htmlInput: { maxLength: 9, style: { padding: "10px 16px" } },
            }}
          />
        </div>
        <div
          ref={this.alphaSliderRef}
          style={{
            position: "relative",
            width: this.alphaWidth,
            height: this.alphaHeight,
            borderRadius: 10,
            margin: "30px auto",
            cursor: "pointer",
            touchAction: "none",
          }}
          onMouseDown={this.handleAlphaDown}
          onTouchStart={this.handleAlphaDown}
        >
          {this.renderAlphaSlider()}
        </div>
        {this.renderColorPresets()}
      </div>
    );
  }
}

// ---------- Модалка для Графиков ----------
class StatSale_Modal_Graph extends React.Component {
  render() {
    const { open, onClose, id, fullScreen, name } = this.props;

    return (
      <Dialog
        open={open}
        onClose={onClose.bind(this)}
        fullScreen={fullScreen}
        fullWidth
        maxWidth="calc(95% - 32px)"
        slotProps={{
          paper: { style: { height: "90vh" } },
        }}
      >
        <DialogTitle className="button">
          <Typography style={{ fontWeight: "bold" }}>{name}</Typography>
          <IconButton onClick={onClose.bind(this)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid
            container
            direction="column"
            spacing={2}
          >
            <Grid
              size={{
                xs: 12,
              }}
            >
              <Box sx={{ width: "100%" }}>
                <div
                  id={id}
                  style={{ width: "100%", height: "700px" }}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={onClose.bind(this)}
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

// ---------- Инпут для модалки Коэффициенты (Продажи) ----------
class StatSale_Tab_Sett_Modal_Input extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: this.props.data,
    };
  }

  changeItem(event) {
    let value = event.target.value;

    if (value === "") {
      value = "0";
    } else {
      value = value.replace(/^0+(?=\d)/, "");
    }

    if (this.props.item_type === "rating") {
      this.setState({ item: value });
      return;
    }

    let numericValue = Number(value);

    if (["percent", "clients", "active"].includes(this.props.item_type)) {
      numericValue = Math.min(Math.max(numericValue, 0), 100);
    } else {
      numericValue = Math.max(numericValue, 0);
    }

    this.setState({ item: numericValue.toString() });
  }

  render() {
    const { type, handleChange, id, index, item_type } = this.props;
    const { item } = this.state;

    return (
      <TextField
        type={type}
        value={this.state.item}
        onChange={this.changeItem.bind(this)}
        onBlur={handleChange.bind(this, index, item_type, item)}
        variant="standard"
        fullWidth
        sx={{
          margin: 0,
          padding: 0,
          "& input": {
            fontWeight: id === 1 ? "bold" : "normal",
          },
        }}
        slotProps={{
          input: {
            disableUnderline: true,
            inputProps: { min: 0, step: 1 },
            endAdornment: [1, 2, 4].includes(id) ? (
              <InputAdornment position="end">%</InputAdornment>
            ) : null,
          },
        }}
      />
    );
  }
}

// ---------- Модалка Коэффициенты (Клиенты) ----------
class StatSale_Tab_Sett_Modal_Rate_Clients extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      color: "#2ECC71",
      value: 0,
    };
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.type_modal === "edit" &&
      (this.props.value !== prevProps.value || this.props.color_edit !== prevProps.color_edit)
    ) {
      this.setState({
        value: this.props.value,
        color: this.props.color_edit,
      });
    }
  }

  changeItem = (event) => {
    let value = event.target.value;

    if (value === "") {
      value = "0";
    } else {
      value = value.replace(/^0+(?=\d)/, "");
    }

    let numericValue = Math.max(Number(value), 0);
    value = numericValue.toString();

    this.setState({ value });
  };

  hsvaConvertHex({ h, s, v, a = 1 }) {
    const f = (n, k = (n + h * 6) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    const r = Math.round(f(5) * 255);
    const g = Math.round(f(3) * 255);
    const b = Math.round(f(1) * 255);

    const toHex = (num) => {
      const hex = num.toString(16).toUpperCase();
      return hex.length === 1 ? "0" + hex : hex;
    };

    const alphaHex = toHex(Math.round(a * 255));

    this.setState({ color: `#${toHex(r)}${toHex(g)}${toHex(b)}${alphaHex}` });
  }

  save() {
    const { value, color } = this.state;

    if (!value) {
      this.props.openAlert(false, "Значение должно быть больше 0");

      return;
    }

    const result = {
      value,
      color,
    };

    this.props.save(result);

    this.onClose();
  }

  delete() {
    this.props.delete();

    this.onClose();
  }

  onClose() {
    this.setState({
      color: "#2ECC71",
      value: 0,
    });

    this.props.onClose();
  }

  render() {
    const { open, fullScreen, type_modal, name_row } = this.props;
    const { value, color } = this.state;

    return (
      <Dialog
        open={open}
        onClose={this.onClose.bind(this)}
        fullWidth={true}
        maxWidth={"md"}
        fullScreen={fullScreen}
      >
        <DialogTitle className="button">
          <Typography style={{ fontWeight: "bold" }}>
            {type_modal === "edit"
              ? `Редактировать данные в таблице Коэффициенты (Клиенты) в строке ${name_row}`
              : `Добавить данные в таблицу Коэффициенты (Клиенты) в строку ${name_row}`}
          </Typography>
          <IconButton
            onClick={this.onClose.bind(this)}
            style={{ cursor: "pointer" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid
            container
            spacing={10}
          >
            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
              sx={{
                mt: 3,
              }}
            >
              <TextField
                type="number"
                value={value}
                variant="outlined"
                onChange={(e) => this.changeItem(e)}
                onBlur={(e) => this.changeItem(e)}
                fullWidth
                sx={{
                  margin: 0,
                  padding: 0,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "transparent",
                    },
                  },
                  "& .MuiOutlinedInput-input": {
                    fontWeight: "bold",
                    backgroundColor: color,
                    borderRadius: "8px",
                    backgroundClip: "padding-box",
                  },
                }}
                slotProps={{
                  input: {
                    inputProps: { min: 0, step: 1 },
                  },
                }}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
              sx={{
                mt: 3,
              }}
            >
              <CustomColorPicker
                hsvaConvertHex={this.hsvaConvertHex.bind(this)}
                initialColor={color}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: type_modal === "edit" ? "space-between" : "flex-end",
          }}
        >
          {type_modal === "edit" && (
            <Button
              variant="contained"
              onClick={this.delete.bind(this)}
            >
              Удалить
            </Button>
          )}

          <Button
            variant="contained"
            color="success"
            onClick={this.save.bind(this)}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

// ---------- Модалка Коэффициенты (Продажи) ----------
class StatSale_Tab_Sett_Modal_Rate extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      color: "#2ECC71",
      rows: this.initializeRows(),
    };
  }

  initializeRows() {
    return [
      { id: 1, type: "percent", value: 0 },
      {
        id: 2,
        name: "1.КЛИЕНТЫ",
        fontWeight_name: "bold",
        color_name: "#fff",
        backgroundColor_name: "#B22222",
        type: "clients",
        value: 0,
      },
      {},
      {
        id: 4,
        name: "2.АКТИВНОСТЬ",
        fontWeight_name: "bold",
        color_name: "#fff",
        backgroundColor_name: "#FF8C00",
        value: 0,
        type: "active",
      },
      {},
      {
        id: 6,
        name: "3.ЧАСТОТА ЗАКАЗОВ",
        fontWeight_name: "bold",
        color_name: "#fff",
        backgroundColor_name: "#3CB371",
        value: 0,
        type: "rate",
      },
      {},
      {
        id: 8,
        name: "4.ЦЕЛИ ПО БЛЮДАМ",
        fontWeight_name: "bold",
        color_name: "#fff",
        backgroundColor_name: "#8B008B",
      },
      { id: 9, name: "Роллы", value: 0, type: "rolls_count" },
      { id: 10, name: "Пицца", value: 0, type: "pizza_count" },
      {},
      { id: 12, name: "Роллы Х4 (город)", type: "rolls_count_city", value: 0 },
      { id: 13, name: "Пицца Х4 (город)", type: "pizza_count_city", value: 0 },
      {},
      { id: 15, name: "Роллы Х8 (вся сеть)", type: "rolls_count_all", value: 0 },
      { id: 16, name: "Пицца Х8 (вся сеть)", type: "pizza_count_all", value: 0 },
      {},
      {
        id: 18,
        name: "4.СРЕДНИЙ ЧЕК",
        fontWeight_name: "bold",
        color_name: "#fff",
        backgroundColor_name: "#4169E1",
        value: 0,
        type: "avg",
      },
      { id: 19, name: "рейтинг", value: "", type: "rating" },
    ];
  }

  componentDidUpdate(prevProps) {
    if (this.props.rows && this.props.rows !== prevProps.rows && this.props.type_modal === "edit") {
      this.setState({
        rows: this.props.rows,
        color: this.props.color_edit,
      });
    }
  }

  handleChange(index, type, value) {
    this.setState((prevState) => {
      const rows = prevState.rows.map((row) => ({ ...row }));
      rows[index].value = value;
      ["rolls_count", "pizza_count"].forEach((baseType) => {
        if (type === baseType) {
          rows.forEach((row) => {
            if (row.type === `${type}_city`) row.value = value * 4;
            if (row.type === `${type}_all`) row.value = value * 8;
          });
        }
      });
      return { rows };
    });
  }

  hsvaConvertHex({ h, s, v, a = 1 }) {
    const f = (n, k = (n + h * 6) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    const r = Math.round(f(5) * 255);
    const g = Math.round(f(3) * 255);
    const b = Math.round(f(1) * 255);

    const toHex = (num) => {
      const hex = num.toString(16).toUpperCase();
      return hex.length === 1 ? "0" + hex : hex;
    };

    const alphaHex = toHex(Math.round(a * 255));

    this.setState({ color: `#${toHex(r)}${toHex(g)}${toHex(b)}${alphaHex}` });
  }

  check() {
    if (
      this.state.rows.some(
        (row) => row.type && row.type !== "rating" && (!row.value || parseFloat(row.value) <= 0),
      )
    ) {
      this.props.openAlert(false, "Все значения должны быть заполнены и больше 0");
      return;
    }

    this.save();
  }

  save() {
    const { rows, color } = this.state;

    const result = rows.reduce(
      (acc, row) => {
        if (row.type) acc[row.type] = row.value || 0;
        return acc;
      },
      { percent_color: color },
    );

    this.props.save(result);

    this.onClose();
  }

  delete() {
    this.props.delete();

    this.onClose();
  }

  onClose() {
    this.setState({
      color: "#2ECC71",
      rows: this.initializeRows(),
    });

    this.props.onClose();
  }

  render() {
    const { open, fullScreen, type_modal } = this.props;
    const { rows, color } = this.state;

    const cellStyle_name = {
      border: "1px solid #ccc",
      minHeight: "15px",
      width: "30%",
    };

    const cellStyle = {
      border: "1px solid #ccc",
      minHeight: "15px",
      width: "14%",
    };

    const editableIds = [1, 2, 4, 6, 9, 10, 18, 19];
    const textFieldIds = [12, 13, 15, 16];

    return (
      <Dialog
        open={open}
        onClose={this.onClose.bind(this)}
        fullWidth={true}
        maxWidth={"lg"}
        fullScreen={fullScreen}
      >
        <DialogTitle className="button">
          <Typography style={{ fontWeight: "bold" }}>
            {type_modal === "edit"
              ? "Редактировать данные в таблице Коэффициенты"
              : "Добавить данные в таблицу Коэффициенты"}
          </Typography>
          <IconButton
            onClick={this.onClose.bind(this)}
            style={{ cursor: "pointer" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid
            container
            spacing={10}
          >
            <Grid
              size={{
                xs: 12,
                sm: 8,
              }}
              sx={{
                mt: 3,
              }}
            >
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableBody>
                    {rows.map((item, key) => (
                      <TableRow
                        hover
                        key={key}
                      >
                        <TableCell
                          style={{
                            ...cellStyle_name,
                            backgroundColor: item.backgroundColor_name,
                            fontWeight: item.fontWeight_name,
                            color: item.color_name,
                          }}
                        >
                          {item?.name ?? "\u00A0"}
                        </TableCell>
                        <TableCell
                          style={{
                            ...cellStyle,
                            backgroundColor: parseInt(item.id) === 1 ? color : "#fff",
                            textAlign: "center",
                          }}
                        >
                          {editableIds.includes(parseInt(item.id)) ? (
                            <StatSale_Tab_Sett_Modal_Input
                              type={parseInt(item.id) === 19 ? "text" : "number"}
                              handleChange={this.handleChange.bind(this)}
                              index={key}
                              item_type={item.type}
                              data={item.value}
                              id={item.id}
                              rows={rows}
                            />
                          ) : textFieldIds.includes(parseInt(item.id)) ? (
                            <TextField
                              value={item.value}
                              variant="standard"
                              fullWidth
                              sx={{ margin: 0, padding: 0 }}
                              slotProps={{
                                input: { disableUnderline: true },
                              }}
                            />
                          ) : (
                            " "
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4,
              }}
              sx={{
                mt: 3,
              }}
            >
              <CustomColorPicker
                hsvaConvertHex={this.hsvaConvertHex.bind(this)}
                initialColor={color}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: type_modal === "edit" ? "space-between" : "flex-end",
          }}
        >
          {type_modal === "edit" && (
            <Button
              variant="contained"
              onClick={this.delete.bind(this)}
            >
              Удалить
            </Button>
          )}

          <Button
            variant="contained"
            color="success"
            onClick={this.check.bind(this)}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

// ---------- Таб Настройки ----------
class StatSale_Tab_Sett extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      active_tab: 0,
      rows: this.initializeRows(),
      rows_clietns: this.initializeRows_clients(),
      rows_edit: [],
      item_id_edit: null,
      type_modal: null,
      color_edit: null,
      modalDialogRate: false,
      modalDialogRate_clients: false,
      points: [],
      value_edit: 0,
      name_row: "",
      item_type: "",
    };
  }

  initializeRows() {
    return [
      { id: 1, type: "percent", data: [] },
      {
        id: 2,
        name: "1.КЛИЕНТЫ",
        fontWeight_name: "bold",
        color_name: "#fff",
        backgroundColor_name: "#B22222",
        type: "clients",
        data: [],
      },
      { id: 3, data: [] },
      {
        id: 4,
        name: "2.АКТИВНОСТЬ",
        fontWeight_name: "bold",
        color_name: "#fff",
        backgroundColor_name: "#FF8C00",
        type: "active",
        data: [],
      },
      { id: 5, data: [] },
      {
        id: 6,
        name: "3.ЧАСТОТА ЗАКАЗОВ",
        fontWeight_name: "bold",
        color_name: "#fff",
        backgroundColor_name: "#3CB371",
        type: "rate",
        data: [],
      },
      { id: 7, data: [] },
      {
        id: 8,
        name: "4.ЦЕЛИ ПО БЛЮДАМ",
        fontWeight_name: "bold",
        color_name: "#fff",
        backgroundColor_name: "#8B008B",
        data: [],
      },
      { id: 9, name: "Роллы", type: "rolls_count", data: [] },
      { id: 10, name: "Пицца", type: "pizza_count", data: [] },
      { id: 11, data: [] },
      { id: 12, name: "Роллы Х4 (город)", type: "rolls_count_city", data: [] },
      { id: 13, name: "Пицца Х4 (город)", type: "pizza_count_city", data: [] },
      { id: 14, data: [] },
      { id: 15, name: "Роллы Х8 (вся сеть)", type: "rolls_count_all", data: [] },
      { id: 16, name: "Пицца Х8 (вся сеть)", type: "pizza_count_all", data: [] },
      { id: 17, data: [] },
      {
        id: 18,
        name: "4.СРЕДНИЙ ЧЕК",
        fontWeight_name: "bold",
        color_name: "#fff",
        backgroundColor_name: "#4169E1",
        type: "avg",
        data: [],
      },
      { id: 19, name: "рейтинг", type: "rating", data: [] },
    ];
  }

  initializeRows_clients() {
    return [
      {
        id: 1,
        name: "1.КЛИЕНТЫ",
        fontWeight_name: "bold",
        color_name: "#fff",
        backgroundColor_name: "#B22222",
        type: "clients",
        data: [],
      },
      { id: 2, data: [] },
      {
        id: 3,
        name: "2.АКТИВНОСТЬ",
        fontWeight_name: "bold",
        color_name: "#fff",
        backgroundColor_name: "#FF8C00",
        type: "active",
        data: [],
      },
      { id: 4, data: [] },
      {
        id: 5,
        name: "3.ЗАКАЗЫ",
        fontWeight_name: "bold",
        color_name: "#fff",
        backgroundColor_name: "#3CB371",
        type: "orders",
        data: [],
      },
      { id: 6, data: [] },
      {
        id: 7,
        name: "4.СРЕДНИЙ ЧЕК",
        fontWeight_name: "bold",
        color_name: "#fff",
        backgroundColor_name: "#4169E1",
        type: "avg",
        data: [],
      },
    ];
  }

  componentDidUpdate(prevProps) {
    if (this.props.rows !== prevProps.rows) {
      this.get_data_rows();
    }

    if (this.props.rows_clietns !== prevProps.rows_clietns) {
      this.get_data_rows_clietns();
    }

    if (this.props.points !== prevProps.points) {
      this.setState({ points: this.props.points });
    }
  }

  changeTab = (_, val) => {
    this.setState({
      active_tab: val,
    });
  };

  openModalRate = (type_modal, id) => {
    let rows_edit = [];

    if (type_modal === "edit") {
      rows_edit = this.state.rows.reduce((acc, row) => {
        if (!row || !Array.isArray(row.data) || row.data.length === 0) {
          acc.push(row);
          return acc;
        }

        const found = row.data.find((item) => parseInt(item.id) === parseInt(id));

        if (found) {
          if (row.type === "percent") {
            this.setState({ color_edit: found.backgroundColor });
          }

          acc.push({
            ...row,
            value: found.value ?? 0,
          });
        } else {
          acc.push(row);
        }

        return acc;
      }, []);
    }

    this.setState({
      item_id_edit: id,
      rows_edit,
      type_modal,
      modalDialogRate: true,
    });
  };

  openModalRate_clients = (type_modal, name_row, item_type, id, value_edit, color_edit) => {
    this.setState({
      value_edit,
      color_edit,
      item_id_edit: id,
      type_modal,
      item_type,
      name_row: name_row
        .replace(/^\d+\./, "")
        .toLowerCase()
        .replace(/^./, (char) => char.toUpperCase()),
      modalDialogRate_clients: true,
    });
  };

  save_sett_rate_clients = async (data) => {
    if (this.state.type_modal === "edit") {
      data.id = this.state.item_id_edit;
    }

    data.type = this.state.type_modal;
    data.item_type = this.state.item_type;

    if (data.item_type === "orders") {
      const numericValue = Number(data.value);
      if (numericValue > 0 && numericValue < 1) {
        data.value = Math.round(numericValue * 100);
      }
    }

    const res = await this.props.getData("save_sett_rate_clients", data);

    this.props.openAlert(res.st, res.text);

    if (res.st) {
      setTimeout(() => this.props.getDataSet(), 100);
    }
  };

  save_sett_rate = async (data) => {
    if (this.state.type_modal === "edit") {
      data.id = this.state.item_id_edit;
    }

    data.type = this.state.type_modal;

    const res = await this.props.getData("save_sett_rate", data);

    this.props.openAlert(res.st, res.text);

    if (res.st) {
      setTimeout(() => this.props.getDataSet(), 100);
    }
  };

  get_data_rows() {
    if (!Array.isArray(this.props.rows) || this.props.rows.length === 0) return;

    const updatedRows = this.state.rows.map((row) => {
      const typeKey = row.type?.trim().toLowerCase();

      return {
        ...row,
        data: this.props.rows.map((item) => {
          let value = item[typeKey] || "";
          let value_percent = "";

          if (typeKey === "percent") {
            if (item.max_percent !== undefined && item.min_percent !== undefined) {
              value_percent = `${item.max_percent} - ${item.min_percent}`;
            } else {
              value_percent = `${item.percent} - 0`;
            }
          }

          return {
            id: item.id,
            value,
            value_percent,
            backgroundColor: typeKey === "percent" ? item.percent_color : undefined,
            fontWeight: typeKey === "percent" ? "900" : undefined,
          };
        }),
      };
    });

    this.setState({ rows: updatedRows });
  }

  get_data_rows_clietns() {
    if (!Array.isArray(this.props.rows_clietns) || this.props.rows_clietns.length === 0) return;

    const updatedRows = this.state.rows_clietns.map((row) => {
      const typeKey = row.type?.trim().toLowerCase();

      return {
        ...row,
        data: this.props.rows_clietns
          .filter((item) => item.type?.trim().toLowerCase() === typeKey)
          .map((item) => {
            if (typeKey === "orders") {
              return {
                id: item.id,
                value: item.value,
                value_range: `${item.max_value} - ${item.min_value}`,
                backgroundColor: item.value_color,
              };
            } else {
              return {
                id: item.id,
                value: item.value,
                value_range: `${item.max_value} - ${item.min_value}`,
                backgroundColor: item.value_color,
              };
            }
          }),
      };
    });

    this.setState({ rows_clietns: updatedRows });
  }

  changeItem = (index, event) => {
    let value = event.target.value;

    if (value === "") {
      value = "0";
    } else {
      value = value.replace(/^0+(?=\d)/, "");
    }

    let numericValue = Math.max(Number(value), 0);

    let points = [...this.state.points];
    points[index].count = numericValue.toString();

    this.setState({ points });
  };

  save_sett_points = async () => {
    const points = this.state.points.map((point) => ({
      ...point,
      count: Math.max(Number(point.count), 0),
    }));

    const data = {
      points,
    };

    const res = await this.props.getData("save_sett_points", data);

    this.props.openAlert(res.st, res.text);

    if (res.st) {
      setTimeout(() => this.props.getDataSet(), 100);
    }
  };

  delete_sett_rate = async () => {
    const data = {
      id: this.state.item_id_edit,
    };

    const res = await this.props.getData("delete_sett_rate", data);

    this.props.openAlert(res.st, res.text);

    if (res.st) {
      setTimeout(() => this.props.getDataSet(), 100);
    }
  };

  delete_sett_rate_clients = async () => {
    const data = {
      id: this.state.item_id_edit,
    };

    const res = await this.props.getData("delete_sett_rate_clients", data);

    this.props.openAlert(res.st, res.text);

    if (res.st) {
      setTimeout(() => this.props.getDataSet(), 100);
    }
  };

  render() {
    const { activeTab, fullScreen, openAlert } = this.props;
    const { active_tab, rows, points, rows_clietns } = this.state;

    const cellStyles = {
      name: {
        border: "1px solid #ccc",
        minHeight: "15px",
        width: "400px",
        position: "sticky",
        left: 0,
        zIndex: 20,
      },
      default: {
        border: "1px solid #ccc",
        minHeight: "15px",
        width: "150px",
      },
    };

    const maxDataLength = Math.max(...rows.map((r) => r.data?.length || 0));
    const tableWidth = Math.max(500, maxDataLength * 150 + 500);

    const maxDataLength_cliens = Math.max(...rows_clietns.map((r) => r.data?.length || 0));
    const tableWidth_clietns = Math.max(500, maxDataLength_cliens * 150 + 500);

    return (
      <>
        <StatSale_Tab_Sett_Modal_Rate
          open={this.state.modalDialogRate}
          onClose={() => this.setState({ modalDialogRate: false })}
          fullScreen={fullScreen}
          save={this.save_sett_rate.bind(this)}
          rows={this.state.rows_edit}
          type_modal={this.state.type_modal}
          color_edit={this.state.color_edit}
          openAlert={openAlert}
          delete={this.delete_sett_rate.bind(this)}
        />
        <StatSale_Tab_Sett_Modal_Rate_Clients
          open={this.state.modalDialogRate_clients}
          onClose={() =>
            this.setState({
              modalDialogRate_clients: false,
              value_edit: 0,
              type_modal: null,
              color_edit: null,
              name_row: "",
            })
          }
          fullScreen={fullScreen}
          save={this.save_sett_rate_clients.bind(this)}
          value={this.state.value_edit}
          type_modal={this.state.type_modal}
          color_edit={this.state.color_edit}
          openAlert={openAlert}
          name_row={this.state.name_row}
          delete={this.delete_sett_rate_clients.bind(this)}
        />
        <Grid
          style={{ paddingTop: 0 }}
          size={{
            xs: 12,
            sm: 12,
          }}
        >
          <TabPanel
            value={activeTab}
            index={2}
            id="clients"
          >
            <Grid
              container
              spacing={3}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <Paper>
                  <Tabs
                    value={active_tab}
                    onChange={this.changeTab}
                    centered
                    variant="fullWidth"
                  >
                    {this.props.acces.sale_view && this.props.acces.sale_edit ? (
                      <Tab
                        label="Коэффициенты (Продажи)"
                        {...a11yProps(0)}
                      />
                    ) : null}
                    {this.props.acces.client_view && this.props.acces.client_view ? (
                      <Tab
                        label="Коэффициенты (Клиенты)"
                        {...a11yProps(1)}
                      />
                    ) : null}
                    {this.props.acces.client_view && this.props.acces.client_view ? (
                      <Tab
                        label="Жители (Клиенты)"
                        {...a11yProps(2)}
                      />
                    ) : null}
                  </Tabs>
                </Paper>
              </Grid>

              {/* Коэффициенты (Продажи) */}
              <Grid
                style={{ paddingTop: 0 }}
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <TabPanel
                  value={active_tab}
                  index={0}
                  id="clients"
                >
                  <Grid
                    container
                    spacing={3}
                  >
                    <Grid
                      size={{
                        xs: 12,
                        sm: 12,
                      }}
                      sx={{
                        mt: 3,
                        mb: 5,
                      }}
                    >
                      <TableContainer
                        style={{
                          overflowX: "auto",
                          maxWidth: "100%",
                          paddingBottom: 20,
                          width: tableWidth,
                        }}
                      >
                        <Table size="small">
                          <TableBody>
                            {rows.map((item, key) => (
                              <TableRow key={key}>
                                <TableCell
                                  style={{
                                    ...cellStyles.name,
                                    backgroundColor: item.backgroundColor_name || "#fff",
                                    fontWeight: item.fontWeight_name,
                                    color: item.color_name,
                                  }}
                                >
                                  {item?.name ?? "\u00A0"}
                                </TableCell>
                                {item?.data.map((it, k) => {
                                  const cellContent = (
                                    <>
                                      {item.id === 1
                                        ? it?.value_percent
                                        : it?.value
                                          ? it?.value
                                          : "\u00A0"}
                                      {[1, 2, 4].includes(item?.id) ? "%" : ""}
                                    </>
                                  );

                                  const cell = (
                                    <TableCell
                                      key={k}
                                      style={{
                                        ...cellStyles.default,
                                        backgroundColor: it?.backgroundColor || "#fff",
                                        textAlign: "center",
                                        fontWeight: it?.fontWeight || "normal",
                                        cursor: item.id === 1 ? "pointer" : "default",
                                      }}
                                      onClick={
                                        item.id === 1
                                          ? () => this.openModalRate("edit", it.id)
                                          : null
                                      }
                                    >
                                      {cellContent}
                                    </TableCell>
                                  );

                                  return item.id === 1 ? (
                                    <Tooltip
                                      key={k}
                                      title={
                                        <Typography color="inherit">
                                          Редактировать данные в столбце
                                        </Typography>
                                      }
                                    >
                                      {cell}
                                    </Tooltip>
                                  ) : (
                                    cell
                                  );
                                })}

                                {key === 0 && (
                                  <TableCell
                                    rowSpan={19}
                                    onClick={() => this.openModalRate("new", null)}
                                    style={{ border: "none" }}
                                  >
                                    <Button variant="contained">+</Button>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                </TabPanel>
              </Grid>
              {/* Коэффициенты (Продажи) */}

              {/* Коэффициенты (Клиенты) */}
              <Grid
                style={{ paddingTop: 0 }}
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <TabPanel
                  value={active_tab}
                  index={1}
                  id="clients"
                >
                  <Grid
                    container
                    spacing={3}
                  >
                    <Grid
                      size={{
                        xs: 12,
                        sm: 12,
                      }}
                      sx={{
                        mt: 3,
                        mb: 5,
                      }}
                    >
                      <TableContainer
                        style={{
                          overflowX: "auto",
                          maxWidth: "100%",
                          paddingBottom: 20,
                          width: tableWidth_clietns,
                        }}
                      >
                        <Table size="small">
                          <TableBody>
                            {rows_clietns.map((item, key) => (
                              <TableRow key={key}>
                                <TableCell
                                  style={{
                                    ...cellStyles.name,
                                    backgroundColor: item.backgroundColor_name || "#fff",
                                    fontWeight: item.fontWeight_name,
                                    color: item.color_name,
                                    border: item?.name ? "1px solid #ccc" : "none",
                                  }}
                                >
                                  {item?.name ?? "\u00A0"}
                                </TableCell>
                                {item?.data.map((it, k) => (
                                  <Tooltip
                                    key={k}
                                    title={
                                      <Typography color="inherit">
                                        Редактировать данные в ячейке
                                      </Typography>
                                    }
                                  >
                                    <TableCell
                                      style={{
                                        ...cellStyles.default,
                                        backgroundColor: it?.backgroundColor || "#fff",
                                        textAlign: "center",
                                        fontWeight: "900",
                                        cursor: "pointer",
                                        border: "1px solid #ccc",
                                      }}
                                      onClick={() =>
                                        this.openModalRate_clients(
                                          "edit",
                                          item.name,
                                          item.type,
                                          it.id,
                                          it.value,
                                          it.backgroundColor,
                                        )
                                      }
                                    >
                                      {it?.value_range ?? 0}
                                    </TableCell>
                                  </Tooltip>
                                ))}

                                {item?.name && (
                                  <TableCell
                                    onClick={() =>
                                      this.openModalRate_clients(
                                        "new",
                                        item.name,
                                        item.type,
                                        null,
                                        0,
                                        null,
                                      )
                                    }
                                    style={{ border: "none" }}
                                  >
                                    <Button variant="contained">+</Button>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                </TabPanel>
              </Grid>
              {/* Коэффициенты (Клиенты) */}

              {/* Жители (Клиенты) */}
              <Grid
                style={{ paddingTop: 0 }}
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <TabPanel
                  value={active_tab}
                  index={2}
                  id="clients"
                >
                  <Grid
                    container
                    spacing={3}
                  >
                    <Grid
                      size={{
                        xs: 12,
                        sm: 12,
                      }}
                      sx={{
                        mt: 3,
                      }}
                    >
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>#</TableCell>
                              <TableCell>Точка</TableCell>
                              <TableCell>Количество жителей</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {points.map((item, key) => (
                              <TableRow key={key}>
                                <TableCell>{key + 1}</TableCell>
                                <TableCell>{item.addr}</TableCell>
                                <TableCell>
                                  <MyTextInput
                                    type="number"
                                    value={item.count}
                                    func={(e) => this.changeItem(key, e)}
                                    onBlur={(e) => this.changeItem(key, e)}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>

                    <Grid
                      size={{
                        xs: 12,
                        sm: 12,
                      }}
                      sx={{
                        mb: 5,
                        display: "grid",
                      }}
                    >
                      <Button
                        variant="contained"
                        color="success"
                        style={{ whiteSpace: "nowrap", justifySelf: "flex-end" }}
                        onClick={this.save_sett_points}
                      >
                        Сохранить
                      </Button>
                    </Grid>
                  </Grid>
                </TabPanel>
              </Grid>
              {/* Жители (Клиенты) */}
            </Grid>
          </TabPanel>
        </Grid>
      </>
    );
  }
}

// ---------- Вспомогательные функции для расчета значений в ячейках таблицы таба Клиенты ----------
const formatNumber = (num) => new Intl.NumberFormat("ru-RU").format(num);

const calcPercent = (num, total) => {
  if (total === 0) return 0;
  return Math.round((num / total) * 100);
};

const calcAvg = (num, total) => {
  if (total === 0) return 0;
  return Math.round((num / total) * 100) / 100;
};

const calcAverageCheck = (summ, orders) => {
  if (orders === 0) return 0;
  return Math.round(summ / orders);
};

// ---------- Таб Клиенты ----------
class StatSale_Tab_Clients extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      point: [],

      date_start: formatDateMin(new Date()),
      date_end: formatDateMin(new Date()),

      data_clients_list: [],
    };
  }

  changePoints(data, event, value) {
    this.setState({
      [data]: value,
    });
  }

  changeDateRange(type, data) {
    this.setState({
      [type]: formatDateMin(data),
    });
  }

  get_data_clients = async () => {
    const { point, date_start, date_end } = this.state;

    if (!point.length) {
      this.props.openAlert(false, "Необходимо выбрать точку");
      return;
    }

    const data = {
      date_start,
      date_end,
      point,
    };

    const res = await this.props.getData("get_data_clients", data);

    if (res.st) {
      const rates = this.props.rates;

      const processedData = res.data_list.map((table) =>
        table.map((item) => {
          const people = parseInt(item.people, 10);
          const active = parseInt(item.active, 10);
          const registred = parseInt(item.registred, 10);
          const orders = parseInt(item.orders, 10);
          const summ = parseInt(item.summ, 10);

          const percentClientsRaw = calcPercent(active, people);
          const percentActiveAccountsRaw = calcPercent(registred, active);
          const ordersAvgRaw = calcAvg(orders, registred);
          const averageCheckRaw = calcAverageCheck(summ, orders);

          const matchingClients = rates.find(
            (rate) =>
              rate.type === "clients" &&
              percentClientsRaw <= rate.max_value &&
              percentClientsRaw >= rate.min_value,
          );

          const matchingActive = rates.find(
            (rate) =>
              rate.type === "active" &&
              percentActiveAccountsRaw <= rate.max_value &&
              percentActiveAccountsRaw >= rate.min_value,
          );

          const matchingOrders = rates.find(
            (rate) =>
              rate.type === "orders" &&
              ordersAvgRaw <= rate.max_value &&
              ordersAvgRaw >= rate.min_value,
          );

          const matchingAvg = rates.find(
            (rate) =>
              rate.type === "avg" &&
              averageCheckRaw <= rate.max_value &&
              averageCheckRaw >= rate.min_value,
          );

          return {
            ...item,
            peopleFormatted: formatNumber(people),
            activeFormatted: formatNumber(active),
            registredFormatted: formatNumber(registred),
            ordersFormatted: formatNumber(orders),
            summFormatted: formatNumber(summ),
            percentClients: formatNumber(percentClientsRaw),
            percentActiveAccounts: formatNumber(percentActiveAccountsRaw),
            ordersAvg: formatNumber(ordersAvgRaw),
            averageCheck: formatNumber(averageCheckRaw),
            clientsColor: matchingClients ? matchingClients.value_color : null,
            activeColor: matchingActive ? matchingActive.value_color : null,
            ordersColor: matchingOrders ? matchingOrders.value_color : null,
            avgColor: matchingAvg ? matchingAvg.value_color : null,
          };
        }),
      );

      this.setState({
        data_clients_list: processedData,
      });
    } else {
      this.props.openAlert(res.st, res.text);
    }
  };

  render() {
    const { activeTab, points, openGraphModal } = this.props;
    const { data_clients_list } = this.state;

    const borderStyle = { border: "1px solid #b7b7b7" };

    const commonCellStyles = {
      width: "100px",
      fontSize: "14px",
      fontWeight: "normal",
      lineHeight: "14px",
    };

    const cellStylesAbsolute = {
      position: "absolute",
      left: "24px",
      backgroundColor: "#fff",
      zIndex: 10,
      width: "200px",
      borderTop: "none",
      textAlign: "left !important",
      fontWeight: "bold",
      height: "50px",
    };

    const cellStylesAbsoluteName = {
      position: "absolute",
      left: "24px",
      backgroundColor: "#fff",
      zIndex: 20,
      width: "200px",
      borderTop: "none",
      fontWeight: "bold",
      height: "50px",
      display: "flex",
      alignItems: "center",
      paddingTop: "10px",
    };

    const cellStylesDop = {
      borderTop: "none !important",
      borderBottom: "none !important",
      paddingLeft: "270px !important",
      minWidth: "10px !important",
    };

    const rowStyles = {
      minWidth: "330px",
      color: "#fff !important",
    };

    const cellDataStyles = {
      fontWeight: "bold",
      fontSize: "26px !important",
    };

    const emptyCellStyle = {
      border: "none !important",
    };

    const emptyCellStyleBorder = {
      borderLeft: "1px solid #b7b7b7",
      borderRight: "1px solid #b7b7b7",
    };

    const emptyCellContent = "\u00A0";

    const customCell = (
      <>
        <TableCell sx={cellStylesAbsolute}>{emptyCellContent}</TableCell>
        <TableCell sx={cellStylesDop}>{emptyCellContent}</TableCell>
      </>
    );

    const customRow = (
      <>
        <TableCell
          colSpan={3}
          sx={emptyCellStyleBorder}
        >
          {emptyCellContent}
        </TableCell>
        <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
        <TableCell
          colSpan={3}
          sx={emptyCellStyleBorder}
        >
          {emptyCellContent}
        </TableCell>
        <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
        <TableCell
          colSpan={3}
          sx={emptyCellStyleBorder}
        >
          {emptyCellContent}
        </TableCell>
        <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
        <TableCell
          colSpan={3}
          sx={emptyCellStyleBorder}
        >
          {emptyCellContent}
        </TableCell>
        <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
      </>
    );

    return (
      <Grid
        style={{ paddingTop: 0 }}
        size={{
          xs: 12,
          sm: 12,
        }}
      >
        <TabPanel
          value={activeTab}
          index={1}
          id="clients"
        >
          <Grid
            container
            spacing={3}
          >
            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <MyDatePickerNewViews
                label="Дата от"
                views={["month", "year"]}
                value={this.state.date_start}
                func={this.changeDateRange.bind(this, "date_start")}
              />
            </Grid>

            <Grid
              style={{ paddingLeft: 12 }}
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <MyDatePickerNewViews
                label="Дата до"
                views={["month", "year"]}
                value={this.state.date_end}
                func={this.changeDateRange.bind(this, "date_end")}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 10,
              }}
            >
              <MyAutocomplite
                label="Точка"
                multiple={true}
                data={points}
                value={this.state.point}
                func={this.changePoints.bind(this, "point")}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 2,
              }}
            >
              <Button
                variant="contained"
                onClick={this.get_data_clients}
              >
                Показать
              </Button>
            </Grid>

            {!data_clients_list.length ? null : (
              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
                sx={{
                  mt: 3,
                  mb: 5,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <TableContainer
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    overflowX: "auto",
                    overflowY: "hidden",
                    paddingBottom: 5,
                  }}
                  className="montserrat-family"
                >
                  {data_clients_list.map((table, index) => (
                    <Table
                      key={index}
                      size="small"
                      sx={{
                        marginRight: 5,
                        "& .MuiTableCell-root": { ...borderStyle, textAlign: "center" },
                        maxWidth: "70%",
                      }}
                    >
                      <TableHead>
                        <TableRow>
                          {index === 0 && (
                            <>
                              <TableCell sx={cellStylesAbsolute}>Месяц / Год</TableCell>
                              <TableCell sx={cellStylesDop}>{emptyCellContent}</TableCell>
                            </>
                          )}

                          <TableCell
                            sx={{ backgroundColor: "#d3d3d3" }}
                            colSpan={15}
                          >
                            {dayjs(table[0].month + "-01")
                              .format("MMMM YYYY")
                              .replace(/^./, (match) => match.toUpperCase())}
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          {index === 0 && customCell}

                          <TableCell
                            colSpan={3}
                            sx={{ ...rowStyles, cursor: "pointer", backgroundColor: "#B22222" }}
                            onClick={() => openGraphModal("stat_clients", data_clients_list)}
                          >
                            <Tooltip title="Открыть график по Клиентам">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 2,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ whiteSpace: "nowrap", fontWeight: 500, color: "#fff" }}
                                >
                                  1.КЛИЕНТЫ
                                </Typography>
                                <QueryStatsIcon fontSize="small" />
                              </Box>
                            </Tooltip>
                          </TableCell>
                          <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
                          <TableCell
                            colSpan={3}
                            sx={{ ...rowStyles, cursor: "pointer", backgroundColor: "#FF8C00" }}
                            onClick={() => openGraphModal("stat_active", data_clients_list)}
                          >
                            <Tooltip title="Открыть график по Активности">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 2,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ whiteSpace: "nowrap", fontWeight: 500, color: "#fff" }}
                                >
                                  2.АКТИВНОСТЬ
                                </Typography>
                                <QueryStatsIcon fontSize="small" />
                              </Box>
                            </Tooltip>
                          </TableCell>
                          <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
                          <TableCell
                            colSpan={3}
                            sx={{ ...rowStyles, cursor: "pointer", backgroundColor: "#3CB371" }}
                            onClick={() => openGraphModal("stat_orders", data_clients_list)}
                          >
                            <Tooltip title="Открыть график по Заказам">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 2,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ whiteSpace: "nowrap", fontWeight: 500, color: "#fff" }}
                                >
                                  3.ЗАКАЗЫ
                                </Typography>
                                <QueryStatsIcon fontSize="small" />
                              </Box>
                            </Tooltip>
                          </TableCell>
                          <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
                          <TableCell
                            colSpan={3}
                            sx={{ ...rowStyles, cursor: "pointer", backgroundColor: "#4169E1" }}
                            onClick={() => openGraphModal("stat_avg", data_clients_list)}
                          >
                            <Tooltip title="Открыть график по Среднему чеку">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 2,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ whiteSpace: "nowrap", fontWeight: 500, color: "#fff" }}
                                >
                                  4.СРЕДНИЙ ЧЕК
                                </Typography>
                                <QueryStatsIcon fontSize="small" />
                              </Box>
                            </Tooltip>
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          {index === 0 && customCell}

                          <TableCell sx={commonCellStyles}>Ж/А</TableCell>
                          <TableCell sx={commonCellStyles}>Кол-во</TableCell>
                          <TableCell sx={commonCellStyles}>% клиентов</TableCell>
                          <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
                          <TableCell sx={commonCellStyles}>А/А</TableCell>
                          <TableCell sx={commonCellStyles}>Кол-во</TableCell>
                          <TableCell sx={commonCellStyles}>% активных аккаунтов</TableCell>
                          <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
                          <TableCell sx={commonCellStyles}>З/А</TableCell>
                          <TableCell sx={commonCellStyles}>Кол-во</TableCell>
                          <TableCell sx={commonCellStyles}>Заказов в среднем</TableCell>
                          <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
                          <TableCell sx={commonCellStyles}>В/З</TableCell>
                          <TableCell sx={commonCellStyles}>Кол-во</TableCell>
                          <TableCell sx={commonCellStyles}>Средний чек, руб</TableCell>
                        </TableRow>

                        <TableRow>
                          {index === 0 && customCell}
                          {customRow}
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {table.map((item, key) => (
                          <React.Fragment key={key}>
                            <TableRow>
                              {index === 0 && (
                                <>
                                  <TableCell
                                    sx={{
                                      ...cellStylesAbsoluteName,
                                      borderBottom: "none !important",
                                    }}
                                  >
                                    {item.name}
                                  </TableCell>
                                  <TableCell
                                    rowSpan={2}
                                    sx={cellStylesDop}
                                  >
                                    {emptyCellContent}
                                  </TableCell>
                                </>
                              )}

                              <TableCell>жителей</TableCell>
                              <TableCell>{item.peopleFormatted}</TableCell>
                              <TableCell
                                rowSpan={2}
                                sx={{
                                  ...cellDataStyles,
                                  backgroundColor: item.clientsColor ? item.clientsColor : null,
                                }}
                              >
                                {item.percentClients}
                              </TableCell>
                              <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
                              <TableCell>аккаунтов</TableCell>
                              <TableCell>{item.activeFormatted}</TableCell>
                              <TableCell
                                rowSpan={2}
                                sx={{
                                  ...cellDataStyles,
                                  backgroundColor: item.activeColor ? item.activeColor : null,
                                }}
                              >
                                {item.percentActiveAccounts}
                              </TableCell>
                              <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
                              <TableCell>заказов</TableCell>
                              <TableCell>{item.ordersFormatted}</TableCell>
                              <TableCell
                                rowSpan={2}
                                sx={{
                                  ...cellDataStyles,
                                  backgroundColor: item.ordersColor ? item.ordersColor : null,
                                }}
                              >
                                {item.ordersAvg}
                              </TableCell>
                              <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
                              <TableCell>выручка</TableCell>
                              <TableCell>{item.summFormatted}</TableCell>
                              <TableCell
                                rowSpan={2}
                                sx={{
                                  ...cellDataStyles,
                                  backgroundColor: item.avgColor ? item.avgColor : null,
                                }}
                              >
                                {item.averageCheck}
                              </TableCell>
                              <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
                            </TableRow>

                            <TableRow>
                              {index === 0 && (
                                <TableCell
                                  sx={{
                                    ...cellStylesAbsolute,
                                    borderTop: "none !important",
                                    borderBottom:
                                      key === table.length - 1
                                        ? "1px solid #ccc"
                                        : "none !important",
                                    height: key === table.length - 1 ? "none !important" : "50px",
                                  }}
                                >
                                  {emptyCellContent}
                                </TableCell>
                              )}

                              <TableCell>аккаунтов</TableCell>
                              <TableCell>{item.activeFormatted}</TableCell>
                              <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
                              <TableCell>актив. акк.</TableCell>
                              <TableCell>{item.registredFormatted}</TableCell>
                              <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
                              <TableCell>актив. акк.</TableCell>
                              <TableCell>{item.registredFormatted}</TableCell>
                              <TableCell sx={emptyCellStyle}>{emptyCellContent}</TableCell>
                              <TableCell>заказов</TableCell>
                              <TableCell>{item.ordersFormatted}</TableCell>
                            </TableRow>

                            <TableRow>
                              {index === 0 && key === 0 && customCell}
                              {index === 0 &&
                                !item.point_id &&
                                table[key + 1] &&
                                table[key + 1].point_id &&
                                customCell}
                              {key === 0 && customRow}
                              {!item.point_id &&
                                table[key + 1] &&
                                table[key + 1].point_id &&
                                customRow}
                            </TableRow>
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  ))}
                </TableContainer>
              </Grid>
            )}
          </Grid>
        </TabPanel>
      </Grid>
    );
  }
}

// ---------- Таблица в Таб Продажи ----------
const DataTable = ({ tableData, openGraphModal }) => {
  const toRawMonth = (formatted) => {
    const [month, year] = formatted.split("-");
    return `${year}-${month}`;
  };

  const getPreviousPeriodHeader = (formatted) => {
    const parts = formatted.split("-");
    if (parts.length < 2) return formatted;
    const year = parts[1];
    const currentLastTwo = year.slice(-2);
    const previousLastTwo = (parseInt(year, 10) - 1).toString().slice(-2);
    return `${currentLastTwo}/${previousLastTwo}`;
  };

  const renderMonthHeader = (formattedMonth) => {
    const parts = formattedMonth.split("-");
    const isoDate = `${parts[1]}-${parts[0]}-01`;
    return (
      <TableCell
        key={formattedMonth}
        colSpan={4}
        sx={{
          backgroundColor: "#dcdcdc",
          minWidth: 4 * 80,
          top: 0,
          zIndex: 1000,
          borderTop: thickBorder,
          borderRight: thickBorder,
          borderBottom: thickBorder,
        }}
      >
        {dayjs(isoDate)
          .format("MMMM YYYY")
          .replace(/^./, (match) => match.toUpperCase())}
      </TableCell>
    );
  };

  const { columns, rows } = tableData;
  const totalColSpan = 2 + columns.months.length * 4;

  const thinBorder = "1px solid #ccc";
  const thickBorder = "2px solid #000 !important";

  const paramColWidth = 150;
  const typeColWidth = 100;

  const cellStylesHeader = {
    position: "sticky",
    top: 40,
    zIndex: 1000,
    minWidth: "120px",
    borderRight: thickBorder,
    borderBottom: thickBorder,
  };

  const [month, year] = columns.months[0].split("-");
  const firstMonthKey = `${year}-${month}`;

  return (
    <TableContainer
      component={Paper}
      sx={{
        overflowX: "auto",
        overflow: "auto !important",
        overflowY: "auto",
        "&::-webkit-scrollbar": {
          WebkitAppearance: "none",
          width: "8px",
          height: "8px",
        },
        "&::-webkit-scrollbar-thumb": {
          borderRadius: "8px",
          backgroundColor: "rgba(0, 0, 0, .3)",
        },
        minHeight: "400px",
        maxHeight: "calc(100vh - 200px)",
        p: 0,
        m: 0,
        pb: 5,
      }}
      className="montserrat-family"
    >
      <Table
        stickyHeader
        size="small"
        sx={{
          borderCollapse: "separate",
          borderSpacing: 0,
          "& .MuiTableCell-root": { textAlign: "center", whiteSpace: "nowrap", border: thinBorder },
        }}
      >
        <TableHead>
          <TableRow sx={{ backgroundColor: "white", height: 40 }}>
            <TableCell
              colSpan={2}
              rowSpan={2}
              sx={{
                position: "sticky",
                left: 0,
                top: 0,
                backgroundColor: "white",
                zIndex: 1100,
                minWidth: paramColWidth + typeColWidth,
                borderRight: thickBorder,
                textAlign: "left !important",
              }}
            >
              Месяц / год
            </TableCell>

            {columns.months.map((formattedMonth) => renderMonthHeader(formattedMonth))}
          </TableRow>

          <TableRow sx={{ backgroundColor: "white", height: 40 }}>
            {columns.months.map((formattedMonth) => (
              <React.Fragment key={formattedMonth}>
                <TableCell sx={cellStylesHeader}>кол-во</TableCell>
                <TableCell sx={cellStylesHeader}>факт/п</TableCell>
                <TableCell
                  sx={{ ...cellStylesHeader, cursor: "pointer" }}
                  onClick={() => openGraphModal("stat_effect", rows)}
                >
                  <Tooltip title="Открыть график Эффективности">
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: "nowrap", fontWeight: 500 }}
                      >
                        эффект-ть
                      </Typography>
                      <QueryStatsIcon fontSize="small" />
                    </Box>
                  </Tooltip>
                </TableCell>
                <TableCell sx={cellStylesHeader}>
                  {getPreviousPeriodHeader(formattedMonth)}
                </TableCell>
              </React.Fragment>
            ))}
          </TableRow>

          <TableRow>
            <TableCell
              colSpan={totalColSpan}
              sx={{ border: "none", p: 0, m: 0 }}
            >
              {"\u00A0"}
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row, rowIndex) => (
            <React.Fragment key={row.parameter}>
              <TableRow>
                <TableCell
                  rowSpan={2}
                  sx={{
                    position: "sticky",
                    left: 0,
                    backgroundColor: "white",
                    zIndex: 1100,
                    minWidth: paramColWidth,
                    borderRight: "none !important",
                    fontWeight: "bold",
                    textAlign: "left !important",
                  }}
                >
                  {row.parameter}
                </TableCell>

                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    position: "sticky",
                    left: paramColWidth + 33.5,
                    backgroundColor: "white",
                    zIndex: 1100,
                    minWidth: typeColWidth,
                    borderLeft: "none !important",
                    borderRight: thickBorder,
                  }}
                >
                  Роллы
                </TableCell>

                {columns.months.map((formattedMonth) => {
                  const rawMonth = toRawMonth(formattedMonth);
                  const cellData = row.data[rawMonth] || {};

                  return (
                    <React.Fragment key={`${formattedMonth}-rolls`}>
                      <TableCell
                        sx={{
                          minWidth: "80px",
                          backgroundColor: cellData?.point_id
                            ? (cellData.color_rolls ?? null)
                            : null,
                          fontWeight: cellData?.point_id ? "bold" : "normal",
                        }}
                      >
                        {formatNumber(cellData.rolls_current ?? 0)}
                      </TableCell>
                      <TableCell
                        sx={{
                          minWidth: "80px",
                          backgroundColor: cellData.color_rolls ?? null,
                          fontWeight: "bold",
                        }}
                      >
                        {cellData.percent_fact_rolls ?? 0}%
                      </TableCell>
                      <TableCell
                        rowSpan={2}
                        sx={{
                          minWidth: "80px",
                          backgroundColor: cellData.color_fact ?? null,
                          fontWeight: "bold",
                          fontSize: "32px !important",
                        }}
                      >
                        {cellData.percent_fact ?? 0}%
                      </TableCell>
                      <TableCell
                        sx={{
                          minWidth: "80px",
                          color: Number(cellData.percent_compare_rolls) > 0 ? "green" : "red",
                          borderRight: thickBorder,
                        }}
                      >
                        {cellData.percent_compare_rolls ?? 0}%
                      </TableCell>
                    </React.Fragment>
                  );
                })}
              </TableRow>

              <TableRow>
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    position: "sticky",
                    left: paramColWidth + 33.5,
                    backgroundColor: "white",
                    zIndex: 1100,
                    minWidth: typeColWidth,
                    borderLeft: "none !important",
                    borderRight: thickBorder,
                  }}
                >
                  Пицца
                </TableCell>

                {columns.months.map((formattedMonth) => {
                  const rawMonth = toRawMonth(formattedMonth);
                  const cellData = row.data[rawMonth] || {};
                  return (
                    <React.Fragment key={`${formattedMonth}-pizza`}>
                      <TableCell
                        sx={{
                          minWidth: "80px",
                          backgroundColor: cellData?.point_id
                            ? (cellData.color_pizza ?? null)
                            : null,
                          fontWeight: cellData?.point_id ? "bold" : "normal",
                        }}
                      >
                        {formatNumber(cellData.pizza_current ?? 0)}
                      </TableCell>
                      <TableCell
                        sx={{
                          minWidth: "80px",
                          backgroundColor: cellData.color_pizza ?? null,
                          fontWeight: "bold",
                        }}
                      >
                        {cellData.percent_fact_pizza ?? 0}%
                      </TableCell>
                      <TableCell
                        sx={{
                          minWidth: "80px",
                          color: Number(cellData.percent_compare_pizza) > 0 ? "green" : "red",
                          borderRight: thickBorder,
                        }}
                      >
                        {cellData.percent_compare_pizza ?? 0}%
                      </TableCell>
                    </React.Fragment>
                  );
                })}
              </TableRow>

              {rowIndex === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={totalColSpan}
                    sx={{ border: "none", p: 0, m: 0 }}
                  >
                    {"\u00A0"}
                  </TableCell>
                </TableRow>
              )}

              {rowIndex < rows.length - 1 &&
                !rows[rowIndex].data[firstMonthKey]?.point_id &&
                rows[rowIndex + 1].data[firstMonthKey]?.point_id && (
                  <TableRow>
                    <TableCell
                      colSpan={totalColSpan}
                      sx={{ border: "none", p: 0, m: 0 }}
                    >
                      {"\u00A0"}
                    </TableCell>
                  </TableRow>
                )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// ---------- Таб Продажи ----------
class StatSale_Tab_Sale extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      point: [],

      date_start: formatDateMin(new Date()),
      date_end: formatDateMin(new Date()),

      data_sale_list: [],
    };
  }

  changePoints(data, event, value) {
    this.setState({
      [data]: value,
    });
  }

  changeDateRange(type, data) {
    this.setState({
      [type]: formatDateMin(data),
    });
  }

  get_data_sale = async () => {
    const { point, date_start, date_end } = this.state;

    if (!point.length) {
      this.props.openAlert(false, "Необходимо выбрать точку");

      return;
    }

    const data = {
      date_start,
      date_end,
      point,
    };

    const res = await this.props.getData("get_data_sale", data);

    if (res.st) {
      this.setState({
        data_sale_list: res.data_sale_list,
      });
    } else {
      this.props.openAlert(res.st, res.text);
    }
  };

  render() {
    const { activeTab, points, openGraphModal } = this.props;
    const { data_sale_list } = this.state;

    return (
      <Grid
        style={{ paddingTop: 0 }}
        size={{
          xs: 12,
          sm: 12,
        }}
      >
        <TabPanel
          value={activeTab}
          index={0}
          id="clients"
        >
          <Grid
            container
            spacing={3}
          >
            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <MyDatePickerNewViews
                label="Дата от"
                views={["month", "year"]}
                value={this.state.date_start}
                func={this.changeDateRange.bind(this, "date_start")}
              />
            </Grid>

            <Grid
              style={{ paddingLeft: 12 }}
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <MyDatePickerNewViews
                label="Дата до"
                views={["month", "year"]}
                value={this.state.date_end}
                func={this.changeDateRange.bind(this, "date_end")}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 10,
              }}
            >
              <MyAutocomplite
                label="Точка"
                multiple={true}
                data={points}
                value={this.state.point}
                func={this.changePoints.bind(this, "point")}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 2,
              }}
            >
              <Button
                variant="contained"
                onClick={this.get_data_sale}
              >
                Показать
              </Button>
            </Grid>

            {data_sale_list && data_sale_list.columns && data_sale_list.columns.months.length ? (
              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
                sx={{
                  mt: 3,
                  mb: 5,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <DataTable
                  tableData={data_sale_list}
                  openGraphModal={openGraphModal}
                />
              </Grid>
            ) : null}
          </Grid>
        </TabPanel>
      </Grid>
    );
  }
}

// ---------- Стартовая / Основной компонент ----------
class StatSale_ extends React.Component {
  chartStat = null;

  constructor(props) {
    super(props);

    this.state = {
      module: "stat_sale",
      module_name: "",
      acces: {},
      is_load: false,

      fullScreen: false,
      activeTab: 0,

      data_sett_rate: [],
      data_sett_points: [],
      data_sett_rate_clients: [],

      points: [],
      cities: [],

      modalDialog: false,
      id: null,
      name: null,
    };
  }

  async componentDidMount() {
    const data = await this.getData("get_all");

    this.setState({
      data_sett_rate: data.data_sett_rate,
      data_sett_points: data.data_sett_points,
      data_sett_rate_clients: data.data_sett_rate_clients,
      module_name: data.module_info.name,
      points: data.points,
      cities: data.cities,
      acces: data.acces ?? {},
    });

    document.title = data.module_info.name;

    this.handleResize();
  }

  getData = (method, data = {}) => {
    this.setState({
      is_load: true,
    });

    let res = api_laravel(this.state.module, method, data)
      .then((result) => result.data)
      .finally(() => {
        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 500);
      });

    return res;
  };

  handleResize() {
    if (window.innerWidth < 601) {
      this.setState({
        fullScreen: true,
      });
    } else {
      this.setState({
        fullScreen: false,
      });
    }
  }

  changeTab = (event, val) => {
    if (parseInt(val) === 2) this.getDataSet();

    this.setState({ activeTab: val });
  };

  getDataSet = async () => {
    const res = await this.getData("get_data_sett");

    this.setState({
      data_sett_rate: res.data_sett_rate,
      data_sett_points: res.data_sett_points,
      data_sett_rate_clients: res.data_sett_rate_clients,
    });
  };

  openAlert = (status, text) => {
    this.setState({
      openAlert: true,
      err_status: status,
      err_text: text,
    });
  };

  get_graph_data_sale = (rawData) => {
    return rawData.map((item) => {
      let seriesData = [];

      Object.keys(item.data).forEach((key) => {
        const datum = item.data[key];

        if (datum?.month) {
          seriesData.push({
            date: dayjs(datum.month, "YYYY-MM").valueOf(),
            value: datum.percent_fact,
          });
        }
      });

      seriesData.sort((a, b) => a.date - b.date);

      return {
        parameter: item.parameter,
        data: seriesData,
      };
    });
  };

  get_graph_data_clients = (data, key) => {
    const flatData = data.flat();
    const grouped = {};

    flatData.forEach((item) => {
      const seriesName = item.name;

      if (!grouped[seriesName]) {
        grouped[seriesName] = [];
      }

      const timestamp = dayjs(item.month, "YYYY-MM").valueOf();

      let value = item[key];

      if (typeof value === "string") {
        value = parseFloat(value.replace(/\s/g, "").replace(",", "."));
      }

      grouped[seriesName].push({ date: timestamp, value });
    });

    return Object.keys(grouped).map((name) => {
      const seriesData = grouped[name].sort((a, b) => a.date - b.date);
      return { parameter: name, data: seriesData };
    });
  };

  openGraphModal = (id, data) => {
    this.handleResize();

    let myData;
    let graphTitle = "";

    if (id === "stat_effect") {
      myData = this.get_graph_data_sale(data);
      graphTitle = "Эффективность за период";
    } else if (id === "stat_clients") {
      myData = this.get_graph_data_clients(data, "percentClients");
      graphTitle = "Клиенты за период";
    } else if (id === "stat_active") {
      myData = this.get_graph_data_clients(data, "percentActiveAccounts");
      graphTitle = "Активность за период";
    } else if (id === "stat_orders") {
      myData = this.get_graph_data_clients(data, "ordersAvg");
      graphTitle = "Заказы за период";
    } else if (id === "stat_avg") {
      myData = this.get_graph_data_clients(data, "averageCheck");
      graphTitle = "Средний чек за период";
    }

    const allDates = myData.flatMap((series) => series.data.map((point) => point.date));
    const minTimestamp = Math.min(...allDates);
    const maxTimestamp = Math.max(...allDates);

    const formatDate = (ts) => {
      const formatted = dayjs(ts).locale("ru").format("MMMM YYYY");
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    };

    const startDateStr = formatDate(minTimestamp);
    const endDateStr = formatDate(maxTimestamp);

    this.setState({
      name: `${graphTitle} ${startDateStr} - ${endDateStr} года`,
    });

    this.setState({
      modalDialog: true,
      id,
    });

    setTimeout(() => {
      this.renderGraph(myData, id);
    }, 300);
  };

  renderGraph = (data, id) => {
    if (this.chartStat) {
      this.chartStat.dispose();
    }

    var root = am5.Root.new(id);
    this.chartStat = root;

    root.locale = am5locales_ru_RU;
    root.setThemes([am5themes_Animated.new(root)]);

    var chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panY: false,
        wheelY: "zoomX",
        layout: root.verticalLayout,
      }),
    );

    // Создаем ось Y
    var yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        extraTooltipPrecision: 1,
        renderer: am5xy.AxisRendererY.new(root, {}),
      }),
    );

    // Создаем ось X
    var xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: "month", count: 1 },
        startLocation: 0.5,
        endLocation: 0.5,
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 30,
        }),
      }),
    );

    xAxis.get("dateFormats")["day"] = "MM/dd";
    xAxis.get("periodChangeDateFormats")["day"] = "MM/dd";
    xAxis.get("dateFormats")["month"] = "MMMM";

    function createSeries(name, field, data) {
      var series = chart.series.push(
        am5xy.SmoothedXLineSeries.new(root, {
          name: name,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: field,
          valueXField: "date",
          tooltip: am5.Tooltip.new(root, {}),
          maskBullets: false,
        }),
      );

      series.bullets.push(function () {
        return am5.Bullet.new(root, {
          sprite: am5.Circle.new(root, {
            radius: 2,
            fill: series.get("fill"),
          }),
        });
      });

      series.strokes.template.set("strokeWidth", 3);
      series.get("tooltip").label.set("text", "[bold]{name}[/]\n{valueX.formatDate()}: {valueY}");
      series.data.setAll(data);
    }

    data.forEach((item) => {
      createSeries(item.parameter, "value", item.data);
    });

    chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        behavior: "zoomXY",
        xAxis: xAxis,
      }),
    );

    xAxis.set(
      "tooltip",
      am5.Tooltip.new(root, {
        themeTags: ["axis"],
      }),
    );

    yAxis.set(
      "tooltip",
      am5.Tooltip.new(root, {
        themeTags: ["axis"],
      }),
    );
  };

  render() {
    return (
      <>
        <Backdrop
          style={{ zIndex: 9999 }}
          open={this.state.is_load}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <Script src="https://cdn.amcharts.com/lib/5/index.js"></Script>
        <Script src="https://cdn.amcharts.com/lib/5/xy.js"></Script>
        <Script src="//cdn.amcharts.com/lib/5/themes/Animated.js"></Script>
        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />
        <StatSale_Modal_Graph
          onClose={() => this.setState({ modalDialog: false })}
          fullScreen={this.state.fullScreen}
          open={this.state.modalDialog}
          id={this.state.id}
          name={this.state.name}
        />
        <Grid
          container
          spacing={3}
          className="container_first_child"
          sx={{
            mb: 3,
          }}
        >
          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <h1>{this.state.module_name}</h1>
          </Grid>

          <Grid
            style={{ paddingBottom: 24 }}
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <Paper>
              <Tabs
                value={this.state.activeTab}
                onChange={this.changeTab}
                variant={this.state.fullScreen ? "scrollable" : "fullWidth"}
                scrollButtons={false}
              >
                <Tab
                  label="Продажи"
                  {...a11yProps(0)}
                  sx={{ minWidth: "fit-content", flex: 1 }}
                />
                <Tab
                  label="Клиенты"
                  {...a11yProps(1)}
                  sx={{ minWidth: "fit-content", flex: 1 }}
                />
                {this.state.acces.client_edit || this.state.acces.sale_edit ? (
                  <Tab
                    label="Настройки"
                    {...a11yProps(2)}
                    sx={{ minWidth: "fit-content", flex: 1 }}
                  />
                ) : null}
              </Tabs>
            </Paper>
          </Grid>

          {/* Продажи */}
          {this.state.activeTab === 0 && (
            <StatSale_Tab_Sale
              activeTab={this.state.activeTab}
              fullScreen={this.state.fullScreen}
              points={this.state.points}
              openAlert={this.openAlert}
              getData={this.getData}
              openGraphModal={this.openGraphModal}
            />
          )}
          {/* Продажи */}

          {/* Клиенты */}
          {this.state.activeTab === 1 && (
            <StatSale_Tab_Clients
              activeTab={this.state.activeTab}
              fullScreen={this.state.fullScreen}
              points={this.state.points}
              openAlert={this.openAlert}
              getData={this.getData}
              rates={this.state.data_sett_rate_clients}
              openGraphModal={this.openGraphModal}
            />
          )}
          {/* Клиенты */}

          {/* Настройки */}
          {this.state.activeTab === 2 && (
            <StatSale_Tab_Sett
              activeTab={this.state.activeTab}
              fullScreen={this.state.fullScreen}
              acces={this.state.acces}
              rows={this.state.data_sett_rate}
              rows_clietns={this.state.data_sett_rate_clients}
              getDataSet={this.getDataSet}
              getData={this.getData}
              points={this.state.data_sett_points}
              openAlert={this.openAlert}
            />
          )}
          {/* Настройки */}
        </Grid>
      </>
    );
  }
}

export default function StatSale() {
  return <StatSale_ />;
}
