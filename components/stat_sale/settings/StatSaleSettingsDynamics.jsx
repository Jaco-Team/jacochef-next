import React, { useEffect } from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import CityCafeAutocomplete2 from "@/ui/CityCafeAutocomplete2";

function ArrowForwardIcon() {
  return null;
}

const StatSale_Tab_Sett_Dynamics = ({
  dynamics,
  saveDynamics,
  openAlert,
  points,
  getDataSetOne,
}) => {
  const [editingValue, setEditingValue] = React.useState(null);
  const [editData, setEditData] = React.useState({});
  const [filterType, setFilterType] = React.useState([]);

  // Новые стейты для навигации
  const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());
  const [currentSource, setCurrentSource] = React.useState("1");

  // Отладка - выводим что приходит
  React.useEffect(() => {}, [dynamics, currentYear, currentSource]);

  const months = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];

  const types = [
    { value: "rolly", label: "Роллы (план)" },
    { value: "pizza", label: "Пицца (план)" },
    { value: "order", label: "Заказы (план)" },
    { value: "active", label: "Активные аккаунты (план)" },
    { value: "register", label: "Аккаунты (план)" },
  ];

  // Получаем доступные годы из данных
  const availableYears = React.useMemo(() => {
    const years = Object.keys(dynamics || {})
      .map(Number)
      .sort((a, b) => a - b);
    return years;
  }, [dynamics]);

  // Получаем доступные источники для текущего года
  const availableSources = React.useMemo(() => {
    const yearData = dynamics?.[currentYear];
    const sources = yearData ? Object.keys(yearData).sort() : [];
    return sources;
  }, [dynamics, currentYear]);

  // Парсим вложенную структуру в плоский массив для таблицы
  const flatDynamics = React.useMemo(() => {
    const result = [];
    const yearData = dynamics?.[currentYear]?.[currentSource];

    if (!yearData) {
      return result;
    }

    Object.entries(yearData).forEach(([monthStr, typesData]) => {
      const month = parseInt(monthStr, 10);

      Object.entries(typesData).forEach(([type, value]) => {
        result.push({
          id: `${currentYear}_${currentSource}_${month}_${type}`,
          type,
          mounth: month,
          value: value || 0,
          year: currentYear,
          source: currentSource,
        });
      });
    });

    return result;
  }, [dynamics, currentYear, currentSource]);

  const groupedData = React.useMemo(() => {
    const grouped = {};

    flatDynamics.forEach((item) => {
      if (!grouped[item.type]) {
        grouped[item.type] = {};
      }
      grouped[item.type][item.mounth] = {
        id: item.id,
        value: item.value,
      };
    });

    return grouped;
  }, [flatDynamics]);

  // Фильтруем типы для отображения
  const filteredData = React.useMemo(() => {
    return types;
  }, []);

  // Обработчики навигации по годам
  const handlePrevYear = () => {
    const prevYear = currentYear - 1;
    if (availableYears.includes(prevYear)) {
      setCurrentYear(prevYear);
      setEditData({});
      setEditingValue(null);
    }
  };

  const handleNextYear = () => {
    const nextYear = currentYear + 1;
    if (availableYears.includes(nextYear)) {
      setCurrentYear(nextYear);
      setEditData({});
      setEditingValue(null);
    }
  };

  const handleSourceChange = (source) => {
    setCurrentSource(source);
    setEditData({});
    setEditingValue(null);
  };

  const handleEdit = (type, month, currentValue, id) => {
    if (editingValue) {
      const { type: oldType, month: oldMonth } = editingValue;
      const oldValue = editData[oldType]?.[oldMonth];
      if (oldValue !== undefined) {
        setEditData((prev) => ({
          ...prev,
          [oldType]: { ...prev[oldType], [oldMonth]: oldValue },
        }));
      }
    }
    setEditingValue({ type, month, id });
    const existingValue = editData[type]?.[month];
    if (existingValue === undefined) {
      setEditData((prev) => ({
        ...prev,
        [type]: { ...prev[type], [month]: currentValue },
      }));
    }
  };

  const handleValueChange = (type, month, value) => {
    setEditData((prev) => ({
      ...prev,
      [type]: { ...prev[type], [month]: parseInt(value) || 0 },
    }));
  };

  const handleSave = async () => {
    try {
      if (editingValue) {
        const { type, month } = editingValue;
        const value = editData[type]?.[month];
        if (value !== undefined) {
          setEditData((prev) => ({
            ...prev,
            [type]: { ...prev[type], [month]: value },
          }));
        }
      }

      const saveData = [];
      const savedItems = new Set();

      Object.keys(editData).forEach((type) => {
        Object.keys(editData[type]).forEach((month) => {
          const monthNum = parseInt(month);
          const originalItem = flatDynamics.find(
            (item) => item.type === type && item.mounth === monthNum,
          );

          const newValue = editData[type][month];
          const originalValue = originalItem?.value || 0;

          if (newValue !== originalValue) {
            const key = `${type}_${month}`;
            if (!savedItems.has(key)) {
              savedItems.add(key);
              saveData.push({
                id: originalItem?.id || null,
                type: type,
                mounth: monthNum,
                value: newValue,
                year: currentYear,
                source: currentSource,
              });
            }
          }
        });
      });

      if (saveData.length === 0) {
        openAlert(true, "Нет изменений для сохранения");
        return;
      }

      await saveDynamics(saveData, filterType);
      setEditingValue(null);
      setEditData({});
      openAlert(true, "Данные успешно сохранены");
    } catch (error) {
      openAlert(false, "Ошибка при сохранении: " + error.message);
    }
  };

  const handleCancel = () => {
    setEditingValue(null);
    setEditData({});
  };

  const getDisplayValue = (type, monthNum) => {
    if (editData[type]?.[monthNum] !== undefined) {
      return editData[type][monthNum];
    }
    const value = groupedData[type]?.[monthNum]?.value || 0;
    return value;
  };

  useEffect(() => {
    getDataSetOne(filterType);
  }, [filterType]);

  return (
    <Grid
      container
      spacing={3}
      sx={{ mt: 2 }}
    >
      <Grid size={{ xs: 12 }}>
        <Paper sx={{ p: 2 }}>
          <Grid
            container
            spacing={2}
            sx={{ mb: 2, alignItems: "center" }}
          >
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton
                  onClick={handlePrevYear}
                  disabled={!availableYears.includes(currentYear - 1)}
                  size="small"
                >
                  <ArrowBackIcon />
                </IconButton>
                <Typography
                  variant="h6"
                  sx={{ minWidth: 80, textAlign: "center" }}
                >
                  {currentYear}
                </Typography>
                <IconButton
                  onClick={handleNextYear}
                  disabled={!availableYears.includes(currentYear + 1)}
                  size="small"
                >
                  <ArrowBackIcon style={{ rotate: "180deg" }} />
                </IconButton>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl
                fullWidth
                size="small"
              >
                <InputLabel>Источник</InputLabel>
                <Select
                  value={currentSource}
                  label="Источник"
                  onChange={(e) => handleSourceChange(e.target.value)}
                >
                  {availableSources.map((src) => (
                    <MenuItem
                      key={src}
                      value={src}
                    >
                      {src == 1 ? "Кафе" : src == 2 ? "КЦ" : "Сайт"}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <CityCafeAutocomplete2
                label="Кафе"
                points={points}
                value={filterType}
                onChange={(v) => setFilterType(v)}
                withAll
                withAllSelected
              />
            </Grid>
          </Grid>

          <TableContainer sx={{ maxHeight: "70vh" }}>
            <Table
              stickyHeader
              size="small"
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Тип</TableCell>
                  {months.map((month, index) => (
                    <TableCell
                      key={index}
                      align="right"
                      sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                    >
                      {month}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.map((type) => (
                  <TableRow key={type.value}>
                    <TableCell sx={{ fontWeight: "bold" }}>{type.label}</TableCell>
                    {months.map((month, monthIndex) => {
                      const monthNum = monthIndex + 1;
                      const currentValue = getDisplayValue(type.value, monthNum);
                      const isEditing =
                        editingValue?.type === type.value && editingValue?.month === monthNum;
                      const editValue =
                        editData[type.value]?.[monthNum] !== undefined
                          ? editData[type.value][monthNum]
                          : currentValue;

                      const originalValue = groupedData[type.value]?.[monthNum]?.value || 0;
                      const hasChanges =
                        editData[type.value]?.[monthNum] !== undefined &&
                        editData[type.value][monthNum] !== originalValue;

                      return (
                        <TableCell
                          key={monthIndex}
                          align="right"
                        >
                          {isEditing ? (
                            <TextField
                              type="number"
                              size="small"
                              value={editValue}
                              onChange={(e) =>
                                handleValueChange(type.value, monthNum, e.target.value)
                              }
                              autoFocus
                              onBlur={() => setEditingValue(null)}
                              onKeyPress={(e) => {
                                if (e.key === "Enter") setEditingValue(null);
                              }}
                              InputProps={{ inputProps: { min: 0, step: 1000 } }}
                              sx={{ width: "100px" }}
                            />
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{
                                cursor: "pointer",
                                color: hasChanges ? "#1976d2" : "inherit",
                                fontWeight: hasChanges ? "bold" : "normal",
                                "&:hover": {
                                  color: "#1976d2",
                                  textDecoration: "underline",
                                },
                              }}
                              onClick={() =>
                                handleEdit(
                                  type.value,
                                  monthNum,
                                  currentValue,
                                  groupedData[type.value]?.[monthNum]?.id,
                                )
                              }
                            >
                              {currentValue.toLocaleString()}
                              {hasChanges && " *"}
                            </Typography>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {Object.keys(editData).length > 0 && (
            <Grid
              container
              spacing={2}
              sx={{ mt: 2, justifyContent: "flex-end" }}
            >
              <Grid item>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                >
                  Отменить все
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                >
                  Сохранить изменения
                </Button>
              </Grid>
            </Grid>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

const StatSale_Tab_Sett_Dynamics_Pay = ({
  dynamics,
  saveDynamics,
  openAlert,
  points,
  getDataSetOne,
}) => {
  const [editingValue, setEditingValue] = React.useState(null);
  const [editData, setEditData] = React.useState({});
  const [filterType, setFilterType] = React.useState([]);

  // Новые стейты для навигации
  const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());

  const months = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];

  const types = [
    { value: "rolly", label: "Роллы (план)" },
    { value: "pizza", label: "Пицца (план)" },
    { value: "order", label: "Заказы (план)" },
    { value: "active", label: "Активные аккаунты (план)" },
    { value: "register", label: "Аккаунты (план)" },
  ];

  // Получаем доступные годы из данных
  const availableYears = React.useMemo(() => {
    const years = Object.keys(dynamics || {})
      .map(Number)
      .sort((a, b) => a - b);
    return years;
  }, [dynamics]);

  // Парсим вложенную структуру в плоский массив для таблицы
  const flatDynamics = React.useMemo(() => {
    const result = [];
    const yearData = dynamics?.[currentYear];

    if (!yearData) {
      return result;
    }

    Object.entries(yearData).forEach(([monthStr, typesData]) => {
      const month = parseInt(monthStr, 10);

      Object.entries(typesData).forEach(([type, value]) => {
        result.push({
          id: `${currentYear}_${month}_${type}`,
          type,
          month: month,
          value: value || 0,
          year: currentYear,
        });
      });
    });

    return result;
  }, [dynamics, currentYear]);

  const groupedData = React.useMemo(() => {
    const grouped = {};

    flatDynamics.forEach((item) => {
      if (!grouped[item.type]) {
        grouped[item.type] = {};
      }
      grouped[item.type][item.month] = {
        id: item.id,
        value: item.value,
      };
    });

    return grouped;
  }, [flatDynamics]);

  // Обработчики навигации по годам
  const handlePrevYear = () => {
    const prevYear = currentYear - 1;
    if (availableYears.includes(prevYear)) {
      setCurrentYear(prevYear);
      setEditData({});
      setEditingValue(null);
    }
  };

  const handleNextYear = () => {
    const nextYear = currentYear + 1;
    if (availableYears.includes(nextYear)) {
      setCurrentYear(nextYear);
      setEditData({});
      setEditingValue(null);
    }
  };

  const handleEdit = (type, month, currentValue, id) => {
    if (editingValue) {
      const { type: oldType, month: oldMonth } = editingValue;
      const oldValue = editData[oldType]?.[oldMonth];
      if (oldValue !== undefined) {
        setEditData((prev) => ({
          ...prev,
          [oldType]: { ...prev[oldType], [oldMonth]: oldValue },
        }));
      }
    }
    setEditingValue({ type, month, id });
    const existingValue = editData[type]?.[month];
    if (existingValue === undefined) {
      setEditData((prev) => ({
        ...prev,
        [type]: { ...prev[type], [month]: currentValue },
      }));
    }
  };

  const handleValueChange = (type, month, value) => {
    setEditData((prev) => ({
      ...prev,
      [type]: { ...prev[type], [month]: parseInt(value) || 0 },
    }));
  };

  const handleSave = async () => {
    try {
      if (editingValue) {
        const { type, month } = editingValue;
        const value = editData[type]?.[month];
        if (value !== undefined) {
          setEditData((prev) => ({
            ...prev,
            [type]: { ...prev[type], [month]: value },
          }));
        }
      }

      const saveData = [];
      const savedItems = new Set();

      Object.keys(editData).forEach((type) => {
        Object.keys(editData[type]).forEach((month) => {
          const monthNum = parseInt(month);
          const originalItem = flatDynamics.find(
            (item) => item.type === type && item.month === monthNum,
          );

          const newValue = editData[type][month];
          const originalValue = originalItem?.value || 0;

          if (newValue !== originalValue) {
            const key = `${type}_${month}`;
            if (!savedItems.has(key)) {
              savedItems.add(key);
              saveData.push({
                id: originalItem?.id || null,
                type: type,
                month: monthNum,
                value: newValue,
                year: currentYear,
              });
            }
          }
        });
      });

      if (saveData.length === 0) {
        openAlert(true, "Нет изменений для сохранения");
        return;
      }

      await saveDynamics(saveData, filterType);
      setEditingValue(null);
      setEditData({});
      openAlert(true, "Данные успешно сохранены");
    } catch (error) {
      openAlert(false, "Ошибка при сохранении: " + error.message);
    }
  };

  const handleCancel = () => {
    setEditingValue(null);
    setEditData({});
  };

  const getDisplayValue = (type, monthNum) => {
    if (editData[type]?.[monthNum] !== undefined) {
      return editData[type][monthNum];
    }
    const value = groupedData[type]?.[monthNum]?.value || 0;
    return value;
  };

  React.useEffect(() => {
    getDataSetOne(filterType);
  }, [filterType]);

  return (
    <Grid
      container
      spacing={3}
      sx={{ mt: 2 }}
    >
      <Grid size={{ xs: 12 }}>
        <Paper sx={{ p: 2 }}>
          <Grid
            container
            spacing={2}
            sx={{ mb: 2, alignItems: "center" }}
          >
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton
                  onClick={handlePrevYear}
                  disabled={!availableYears.includes(currentYear - 1)}
                  size="small"
                >
                  <ArrowBackIcon />
                </IconButton>
                <Typography
                  variant="h6"
                  sx={{ minWidth: 80, textAlign: "center" }}
                >
                  {currentYear}
                </Typography>
                <IconButton
                  onClick={handleNextYear}
                  disabled={!availableYears.includes(currentYear + 1)}
                  size="small"
                >
                  <ArrowBackIcon style={{ rotate: "180deg" }} />
                </IconButton>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CityCafeAutocomplete2
                label="Кафе"
                points={points}
                value={filterType}
                onChange={(v) => setFilterType(v)}
                withAll
                withAllSelected
              />
            </Grid>
          </Grid>

          <TableContainer sx={{ maxHeight: "70vh" }}>
            <Table
              stickyHeader
              size="small"
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Тип</TableCell>
                  {months.map((month, index) => (
                    <TableCell
                      key={index}
                      align="right"
                      sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                    >
                      {month}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {types.map((type) => (
                  <TableRow key={type.value}>
                    <TableCell sx={{ fontWeight: "bold" }}>{type.label}</TableCell>
                    {months.map((month, monthIndex) => {
                      const monthNum = monthIndex + 1;
                      const currentValue = getDisplayValue(type.value, monthNum);
                      const isEditing =
                        editingValue?.type === type.value && editingValue?.month === monthNum;
                      const editValue =
                        editData[type.value]?.[monthNum] !== undefined
                          ? editData[type.value][monthNum]
                          : currentValue;

                      const originalValue = groupedData[type.value]?.[monthNum]?.value || 0;
                      const hasChanges =
                        editData[type.value]?.[monthNum] !== undefined &&
                        editData[type.value][monthNum] !== originalValue;

                      return (
                        <TableCell
                          key={monthIndex}
                          align="right"
                        >
                          {isEditing ? (
                            <TextField
                              type="number"
                              size="small"
                              value={editValue}
                              onChange={(e) =>
                                handleValueChange(type.value, monthNum, e.target.value)
                              }
                              autoFocus
                              onBlur={() => setEditingValue(null)}
                              onKeyPress={(e) => {
                                if (e.key === "Enter") setEditingValue(null);
                              }}
                              InputProps={{ inputProps: { min: 0, step: 1000 } }}
                              sx={{ width: "100px" }}
                            />
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{
                                cursor: "pointer",
                                color: hasChanges ? "#1976d2" : "inherit",
                                fontWeight: hasChanges ? "bold" : "normal",
                                "&:hover": {
                                  color: "#1976d2",
                                  textDecoration: "underline",
                                },
                              }}
                              onClick={() =>
                                handleEdit(
                                  type.value,
                                  monthNum,
                                  currentValue,
                                  groupedData[type.value]?.[monthNum]?.id,
                                )
                              }
                            >
                              {currentValue.toLocaleString()}
                              {hasChanges && " *"}
                            </Typography>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {Object.keys(editData).length > 0 && (
            <Grid
              container
              spacing={2}
              sx={{ mt: 2, justifyContent: "flex-end" }}
            >
              <Grid item>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                >
                  Отменить все
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                >
                  Сохранить изменения
                </Button>
              </Grid>
            </Grid>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export { ArrowForwardIcon, StatSale_Tab_Sett_Dynamics, StatSale_Tab_Sett_Dynamics_Pay };
