import React from "react";

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
import TableRow from "@mui/material/TableRow";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";

import CustomColorPicker from "./StatSaleSettingsColorPicker";

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

export {
  StatSale_Tab_Sett_Modal_Input,
  StatSale_Tab_Sett_Modal_Rate_Clients,
  StatSale_Tab_Sett_Modal_Rate,
};
