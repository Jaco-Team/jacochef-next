import React from "react";
import Typography from "@mui/material/Typography";

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
  return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
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

export default CustomColorPicker;
