import React from "react";

import Script from "next/script";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";

import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";

import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";

import { MySelect, MyTextInput, MyCheckBox, MyDatePickerNew } from "@/ui/Forms";

import { api_laravel_local, api_laravel } from "@/src/api_new";
import dayjs from "dayjs";
import MyAlert from "@/ui/MyAlert";

const historyFieldLabels = {
  name: "Название зоны",
  point_id: "Кафе",
  sum_div: "Сумма для клиента",
  sum_div_driver: "Сумма для курьера",
  free_drive: "Бесплатная доставка",
  is_active: "Активность",
  zone: "Границы зоны",
  date_start: "Дата применения",
};

const historyEventLabels = {
  created: "Создание",
  copied: "Копирование",
  updated: "Изменение",
  archived: "Перенос в архив",
  restored: "Восстановление",
  scheduled_applied: "Применение по расписанию",
};

const formatHistoryValue = (value, field, points) => {
  if (value === null || typeof value === "undefined" || value === "") {
    return "Нет данных";
  }

  if (field === "point_id") {
    return points.find((point) => Number(point.id) === Number(value))?.name ?? `Кафе #${value}`;
  }

  if (field === "free_drive" || field === "is_active") {
    return Number(value) ? "Да" : "Нет";
  }

  if (field === "sum_div" || field === "sum_div_driver") {
    return `${Number(value).toLocaleString("ru-RU")} ₽`;
  }

  if (field === "zone") {
    return "Границы на карте";
  }

  return String(value);
};

const historySummary = (item) => {
  const changes = item?.changes ?? [];

  if (!changes.length) {
    return item?.history_completeness === "partial"
      ? "Подробности сохранены частично"
      : "Изменений полей не найдено";
  }

  return changes
    .slice(0, 3)
    .map((change) => historyFieldLabels[change.field] ?? change.field)
    .join(", ");
};

class ActiveZonesMap extends React.Component {
  map = null;
  containerRef = React.createRef();
  isUnmounted = false;

  componentDidMount() {
    this.initializeMap();
  }

  componentDidUpdate(prevProps) {
    if (this.zonesSignature(prevProps.zones) !== this.zonesSignature(this.props.zones)) {
      if (this.map) {
        this.drawZones();
      } else {
        this.initializeMap();
      }
    }
  }

  componentWillUnmount() {
    this.isUnmounted = true;
    this.map?.destroy();
    this.map = null;
  }

  zonesSignature(zones) {
    return zones.map((zone) => `${zone.id}:${zone.zone}`).join("|");
  }

  parseZone(zone) {
    try {
      return JSON.parse(zone);
    } catch {
      return null;
    }
  }

  initializeMap() {
    if (!this.containerRef.current || typeof window === "undefined" || !window.ymaps) {
      return;
    }

    window.ymaps.ready(() => {
      if (this.isUnmounted || this.map || !this.containerRef.current) {
        return;
      }

      this.map = new window.ymaps.Map(
        this.containerRef.current,
        { center: [53.2, 50.15], zoom: 10, controls: ["zoomControl", "fullscreenControl"] },
        { searchControlProvider: "yandex#search" },
      );
      this.map.behaviors.disable("scrollZoom");
      this.drawZones();
    });
  }

  drawZones() {
    if (!this.map) {
      return;
    }

    this.map.geoObjects.removeAll();

    this.props.zones.forEach((zone) => {
      const coordinates = this.parseZone(zone.zone);

      if (!coordinates) {
        return;
      }

      const polygon = new window.ymaps.Polygon(
        [coordinates],
        {
          hintContent: `${zone.zone_name} · ${zone.point_name}`,
        },
        {
          cursor: "pointer",
          fillColor: "#d5003d",
          fillOpacity: 0.24,
          strokeColor: "#b80032",
          strokeWidth: 3,
        },
      );

      polygon.events.add("mouseenter", () => {
        polygon.options.set({ fillOpacity: 0.4, strokeWidth: 5 });
      });
      polygon.events.add("mouseleave", () => {
        polygon.options.set({ fillOpacity: 0.24, strokeWidth: 3 });
      });
      polygon.events.add("click", () => this.props.onZoneClick(zone.id));

      this.map.geoObjects.add(polygon);
    });

    const bounds = this.map.geoObjects.getBounds();

    if (bounds) {
      this.map.setBounds(bounds, { checkZoomRange: true, zoomMargin: 40 });
    }
  }

  render() {
    return (
      <Box
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
          <Typography fontWeight={700}>Карта активных зон</Typography>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Нажмите на нужную зону, чтобы открыть её редактирование
          </Typography>
        </Box>
        <Box
          ref={this.containerRef}
          sx={{ width: "100%", height: { xs: 360, sm: 480 }, bgcolor: "grey.100" }}
        />
      </Box>
    );
  }
}

class ZoneModules_Modal_History extends React.Component {
  map_2 = null;

  componentDidUpdate(prevProps) {
    if (this.props.historyItem !== prevProps.historyItem) {
      if (this.props.zone_data?.xy_point) {
        this.getZone(this.props.zone_data);
      }
    }
  }

  getZone(zone_data) {
    ymaps.ready(() => {
      if (!this.map_2) {
        this.map_2 = new ymaps.Map(
          "map_zone",
          { center: JSON.parse(zone_data["xy_point"]), zoom: 10 },
          { searchControlProvider: "yandex#search" },
        );
      }

      this.map_2.geoObjects.removeAll();

      if (zone_data.coordinates_old) {
        const beforePolygon = new ymaps.Polygon(
          [JSON.parse(zone_data.coordinates_old)],
          { geometry: { fillRule: "nonZero" } },
          {
            fillOpacity: 0.2,
            fillColor: "#1976d2",
            strokeColor: "#1976d2",
            strokeWidth: 4,
          },
        );

        this.map_2.geoObjects.add(beforePolygon);
      }

      if (zone_data.coordinates) {
        const afterPolygon = new ymaps.Polygon(
          [JSON.parse(zone_data.coordinates)],
          { geometry: { fillRule: "nonZero" } },
          {
            fillOpacity: 0.3,
            fillColor: "#d5003d",
            strokeColor: "#d5003d",
            strokeWidth: 4,
          },
        );

        this.map_2.geoObjects.add(afterPolygon);
      }
    });
  }

  onClose() {
    this.map_2?.destroy();
    this.map_2 = null;
    this.props.onClose();
  }

  render() {
    const { fullScreen, historyItem, points, zone_data } = this.props;
    const changes = historyItem?.changes ?? [];
    const isIncomplete = historyItem?.history_completeness !== "complete";

    return (
      <Dialog
        open={this.props.open ?? false}
        fullWidth={true}
        maxWidth={"md"}
        onClose={this.onClose.bind(this)}
        fullScreen={fullScreen}
      >
        <DialogTitle className="button">
          <Box>
            <Typography fontWeight={700}>{historyItem?.name ?? "История зоны"}</Typography>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {historyItem?.date_time_update ?? ""} · {historyItem?.user_name ?? "Система Шеф"}
            </Typography>
          </Box>
          <IconButton onClick={this.onClose.bind(this)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ mb: 2 }}
          >
            <Chip
              size="small"
              label={historyEventLabels[historyItem?.event_type] ?? "Изменение"}
              variant="outlined"
            />
            {isIncomplete ? (
              <Chip
                size="small"
                label="Часть старых данных недоступна"
                color="warning"
                variant="outlined"
              />
            ) : null}
          </Stack>

          {changes.length ? (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width="34%">Поле</TableCell>
                  <TableCell width="33%">Было</TableCell>
                  <TableCell width="33%">Стало</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {changes.map((change) => (
                  <TableRow key={change.field}>
                    <TableCell>{historyFieldLabels[change.field] ?? change.field}</TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>
                      {formatHistoryValue(change.before, change.field, points)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {formatHistoryValue(change.after, change.field, points)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography color="text.secondary">Подробности изменения не сохранены</Typography>
          )}

          {historyItem?.history_completeness === "partial" ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Остальные значения до и после изменения: нет данных.
            </Typography>
          ) : null}

          {zone_data?.xy_point ? (
            <Box sx={{ mt: 3 }}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ mb: 1 }}
              >
                {zone_data.coordinates_old ? (
                  <Chip
                    size="small"
                    label="Было"
                    sx={{ color: "#1976d2", borderColor: "#1976d2" }}
                    variant="outlined"
                  />
                ) : null}
                {zone_data.coordinates ? (
                  <Chip
                    size="small"
                    label="Стало"
                    sx={{ color: "#d5003d", borderColor: "#d5003d" }}
                    variant="outlined"
                  />
                ) : null}
              </Stack>
              <div
                id="map_zone"
                name="map_zone"
                style={{ width: "100%", height: 300, paddingTop: 10 }}
              />
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={this.onClose.bind(this)}
            variant="contained"
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

class ZoneModules_Modal extends React.Component {
  map = null;
  myGeoObject = null;

  constructor(props) {
    super(props);

    this.state = {
      item: null,
      isDrawing: true,
      confirmDialog: false,
      text: "",
      zones: [],
      date_start: "",
      date_edit: "",
      dateDialog: false,
      dates: [
        { id: 0, name: "Применить сразу" },
        { id: 1, name: "Применить с даты" },
      ],
      openAlert: false,
      err_status: true,
      err_text: "",
    };
  }

  componentDidUpdate(prevProps) {
    // console.log(this.props.item);

    if (!this.props.item) {
      return;
    }

    if (this.props.item !== prevProps.item) {
      const item = JSON.parse(JSON.stringify(this.props.item));
      let zones = JSON.parse(JSON.stringify(this.props.zones));

      if (zones.length) {
        if (this.props.mark === "editZone" || this.props.mark === "copyZone") {
          zones = zones.filter((zone) => zone.id !== this.props.item.zone.id);
        }

        if (this.props.mark === "editZone_future") {
          zones = zones.filter((zone) => zone.id !== this.props.item.zone.zone_id);
        }
      } else {
        zones = [];
      }

      zones = zones.map((zone) => ({
        ...zone,
        is_view: Number(zone.is_active) === 1,
      }));

      const visibleZoneIds = new Set(
        zones.filter((zone) => zone.is_view).map((zone) => Number(zone.id)),
      );

      item.other_zone = item.other_zone.filter((zone) => visibleZoneIds.has(Number(zone.id)));

      if (this.props.mark === "newZone") {
        this.getZones(item.points[0], item.other_zone);
      }

      if (
        this.props.mark === "editZone" ||
        this.props.mark === "editZone_future" ||
        this.props.mark === "copyZone"
      ) {
        this.getZones(item.zone, item.other_zone);
      }

      this.setState({
        item,
        zones,
      });
    }
  }

  getZones(point, all_zones) {
    if (!this.map) {
      ymaps.ready(() => {
        this.map = new ymaps.Map(
          "map",
          {
            center:
              this.props.mark === "newZone"
                ? JSON.parse(point["xy_center_map"])
                : JSON.parse(point["xy_point"]),
            zoom: 11,
          },
          { searchControlProvider: "yandex#search" },
        );

        // точка
        let myGeoObject1 = new ymaps.GeoObject(
          {
            geometry: { type: "Point", coordinates: JSON.parse(point["xy_point"]) },
            properties: {
              iconContent: this.props.mark === "newZone" ? point.name : point.point_name,
            },
          },
          { preset: "islands#blackStretchyIcon" },
        );

        this.map.geoObjects.add(myGeoObject1);

        // редактирование границ изменяемой зоны
        if (
          this.props.mark === "editZone" ||
          this.props.mark === "editZone_future" ||
          this.props.mark === "copyZone"
        ) {
          // Создаем многоугольник, используя класс GeoObject.
          this.myGeoObject = new ymaps.Polygon(
            [JSON.parse(point["zone"])],
            { geometry: { fillRule: "nonZero" } },
            {
              // Описываем опции геообъекта.
              // Цвет заливки.
              fillColor: "#00FF00",
              // Цвет обводки.
              strokeColor: "#0000FF",
              // Общая прозрачность (как для заливки, так и для обводки).
              opacity: 0.5,
              // Ширина обводки.
              strokeWidth: 5,
              // Стиль обводки.
              strokeStyle: "shortdash",
            },
          );

          this.map.geoObjects.add(this.myGeoObject);
        }

        // все зоны
        all_zones.map((item) => {
          let points_zone = [];

          points_zone.push(JSON.parse(item["zone"]));

          let myGeoObject2 = [];

          for (var poly = 0; poly < points_zone.length; poly++) {
            myGeoObject2[poly] = new ymaps.Polygon(
              [points_zone[poly]],
              {
                hintContent: "",
              },
              {
                fillOpacity: 0.4,
                fillColor: "rgb(240, 128, 128)",
                strokeColor: "rgb(187, 0, 37)",
                strokeWidth: 5,
              },
            );

            this.map.geoObjects.add(myGeoObject2[poly]);
          }
        });
      });
    } else {
      const myGeoObjectIndex = this.map.geoObjects.indexOf(this.myGeoObject);

      let myGeoObjectEdit = null;

      if (myGeoObjectIndex !== -1) {
        myGeoObjectEdit = this.map.geoObjects.get(myGeoObjectIndex).geometry.getCoordinates();
      }

      this.map.geoObjects.removeAll();

      // новая точка
      let myGeoObject1 = new ymaps.GeoObject(
        {
          geometry: { type: "Point", coordinates: JSON.parse(point["xy_point"]) },
          properties: {
            iconContent: this.props.mark === "newZone" ? point.name : point.point_name,
          },
        },
        { preset: "islands#blackStretchyIcon" },
      );

      this.map.geoObjects.add(myGeoObject1);

      // все зоны
      all_zones.map((item) => {
        let points_zone = [];

        points_zone.push(JSON.parse(item["zone"]));

        let myGeoObject2 = [];

        for (var poly = 0; poly < points_zone.length; poly++) {
          myGeoObject2[poly] = new ymaps.Polygon(
            [points_zone[poly]],
            {
              hintContent: "",
            },
            {
              fillOpacity: 0.4,
              fillColor: "rgb(240, 128, 128)",
              strokeColor: "rgb(187, 0, 37)",
              strokeWidth: 5,
            },
          );

          this.map.geoObjects.add(myGeoObject2[poly]);
        }
      });

      // редактирование границ изменяемой зоны
      if (myGeoObjectEdit) {
        // Создаем многоугольник, используя класс GeoObject.
        this.myGeoObject = new ymaps.Polygon(
          myGeoObjectEdit,
          { geometry: { fillRule: "nonZero" } },
          {
            // Описываем опции геообъекта.
            // Цвет заливки.
            fillColor: "#00FF00",
            // Цвет обводки.
            strokeColor: "#0000FF",
            // Общая прозрачность (как для заливки, так и для обводки).
            opacity: 0.5,
            // Ширина обводки.
            strokeWidth: 5,
            // Стиль обводки.
            strokeStyle: "shortdash",
          },
        );

        this.map.geoObjects.add(this.myGeoObject);
      }
    }
  }

  startDrawing() {
    this.setState({
      isDrawing: !this.state.isDrawing,
    });

    if (
      this.props.mark === "editZone" ||
      this.props.mark === "editZone_future" ||
      this.props.mark === "copyZone"
    ) {
      this.myGeoObject.editor.startEditing();

      return;
    }

    if (this.props.mark === "newZone" && this.myGeoObject) {
      this.myGeoObject.editor.startEditing();

      return;
    }

    // Создаем многоугольник, используя класс GeoObject.
    this.myGeoObject = new ymaps.GeoObject(
      {
        geometry: {
          type: "Polygon",
          coordinates: [],
          fillRule: "nonZero",
        },
      },
      {
        // Описываем опции геообъекта.
        // Цвет заливки.
        fillColor: "#00FF00",
        // Цвет обводки.
        strokeColor: "#0000FF",
        // Общая прозрачность (как для заливки, так и для обводки).
        opacity: 0.5,
        // Ширина обводки.
        strokeWidth: 5,
        // Стиль обводки.
        strokeStyle: "shortdash",
      },
    );

    this.map.geoObjects.add(this.myGeoObject);

    this.myGeoObject.editor.startDrawing();
  }

  stopDrawing() {
    this.setState({
      isDrawing: !this.state.isDrawing,
    });

    if (
      this.props.mark === "editZone" ||
      this.props.mark === "editZone_future" ||
      this.props.mark === "copyZone"
    ) {
      this.myGeoObject.editor.stopEditing();
    } else if (this.props.mark === "newZone" && this.myGeoObject) {
      this.myGeoObject.editor.stopEditing();
    } else {
      this.myGeoObject.editor.stopDrawing();
    }
  }

  changePoint(data, event) {
    const item = this.state.item;

    let point = item.points.find((point) => parseInt(point.id) === parseInt(event.target.value));

    point.point_name = point.name;

    this.getZones(point, this.state.item.other_zone);

    item.zone[data] = event.target.value;

    this.setState({
      item,
    });
  }

  changeItem(data, event) {
    const item = this.state.item;

    item.zone[data] = event.target.value;

    this.setState({
      item,
    });
  }

  changeItemChecked(data, event) {
    const item = this.state.item;

    item.zone[data] = event.target.checked === true ? 1 : 0;

    this.setState({
      item,
    });
  }

  changeZonesView(index, id, event) {
    let zones = this.state.zones;
    const target = event.target.checked;
    const item = this.state.item;

    zones[index].is_view = target;

    if (target) {
      const res = this.props.item.other_zone.find((zone) => zone.id === id);

      if (res) {
        item.other_zone.push(res);
      }
    } else {
      item.other_zone = item.other_zone.filter((zone) => zone.id !== id);
    }

    if (this.props.mark === "newZone") {
      this.getZones(this.props.item.points[0], item.other_zone);
    }

    if (
      this.props.mark === "editZone" ||
      this.props.mark === "editZone_future" ||
      this.props.mark === "copyZone"
    ) {
      this.getZones(this.props.item.zone, item.other_zone);
    }

    this.setState({
      zones,
      item,
    });
  }

  save_variant() {
    const date_edit = this.state.date_edit;

    if (date_edit === "") {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: "Необходимо выбрать вариант сохранения данных",
      });
    } else {
      if (date_edit === 1) {
        const date_now = dayjs();

        let date_start = this.state.date_start;

        if (!date_start) {
          this.setState({
            openAlert: true,
            err_status: false,
            err_text: "Указание даты обязательно",
          });

          return;
        }

        date_start = dayjs(this.state.date_start);

        if (date_start.isSame(date_now, "day") || date_start.isBefore(date_now, "day")) {
          this.setState({
            openAlert: true,
            err_status: false,
            err_text:
              "Сохранение возможно только при указании будущей даты (позже сегодняшней даты)",
          });

          return;
        }
      }

      this.setState({
        dateDialog: false,
      });

      setTimeout(() => {
        this.save();
      }, 100);
    }
  }

  changeDateRange(data, event) {
    if (event === null) {
      if (this.props.mark === "editZone_future") {
        const item = this.state.item;

        const date_start = item.zone.date_start;

        item.zone[data] = date_start;

        this.setState({
          openAlert: true,
          err_status: false,
          err_text: "Указание даты обязательно",
          item,
        });
      } else {
        this.setState({
          date_edit: "",
        });
      }

      return;
    }

    const date_now = dayjs();
    let date_start = dayjs(event ? event : "");

    if (date_start.isSame(date_now, "day") || date_start.isBefore(date_now, "day")) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text:
          "Изменение даты возможно только при указании будущей даты (позже сегодняшней даты)",
      });

      return;
    }

    if (this.props.mark === "editZone_future") {
      const item = this.state.item;

      item.zone[data] = event ? event : "";

      this.setState({
        item,
      });
    } else {
      this.setState({
        [data]: event ? event : "",
      });
    }
  }

  changeSelect(event) {
    const value = event.target.value;

    this.setState({
      date_edit: value,
    });
  }

  save() {
    if (!this.myGeoObject) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: "Необходимо выделить новую зону на карте!",
      });

      return;
    }

    const item = this.state.item.zone;

    item.new_zone = JSON.stringify(this.myGeoObject.geometry.getCoordinates().flat(1));

    if (item.new_zone === "[]") {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: "Необходимо выделить новую зону на карте!",
      });

      return;
    }

    const date_edit = this.state.date_edit;

    let date_start;

    if (date_edit === 1) {
      date_start = dayjs(this.state.date_start).format("YYYY-MM-DD");
    } else {
      date_start = "";
    }

    this.props.save(item, date_start);

    this.onClose();
  }

  onClose() {
    this.map = null;
    this.myGeoObject = null;

    this.setState({
      item: null,
      isDrawing: true,
      confirmDialog: false,
      text: "",
      zones: [],
      date_start: "",
      date_edit: "",
      dateDialog: false,
      openAlert: false,
      err_status: true,
      err_text: "",
    });

    this.props.onClose();
  }

  render() {
    return (
      <>
        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />
        <Dialog
          sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
          maxWidth="sm"
          open={this.state.confirmDialog}
          onClose={() => this.setState({ confirmDialog: false })}
        >
          <DialogTitle
            align="center"
            sx={{ fontWeight: "bold" }}
          >
            Данные не сохранены!
          </DialogTitle>
          <DialogContent
            align="center"
            sx={{ fontWeight: "bold" }}
          >
            {this.state.text}
          </DialogContent>
          <DialogActions>
            <Button
              autoFocus
              onClick={() => this.setState({ confirmDialog: false })}
            >
              Отмена
            </Button>
            <Button onClick={this.onClose.bind(this)}>Закрыть</Button>
          </DialogActions>
        </Dialog>
        <Dialog
          sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
          maxWidth="sm"
          open={this.state.dateDialog}
          onClose={() => this.setState({ dateDialog: false, date_edit: "" })}
        >
          <DialogTitle className="button">
            Выбрать вариант сохранения данных
            <IconButton
              onClick={() => this.setState({ dateDialog: false, date_edit: "" })}
              style={{ cursor: "pointer" }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ fontWeight: "bold" }}>
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
                  mt: 2,
                }}
              >
                <MySelect
                  label="Вариант сохранения данных"
                  is_none={false}
                  data={this.state.dates}
                  value={this.state.date_edit}
                  func={this.changeSelect.bind(this)}
                />
              </Grid>
              {!this.state.date_edit ? null : (
                <Grid
                  size={{
                    xs: 12,
                    sm: 12,
                  }}
                >
                  <MyDatePickerNew
                    label="Дата начала изменений"
                    value={dayjs(this.state.date_start)}
                    func={this.changeDateRange.bind(this, "date_start")}
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              onClick={this.save_variant.bind(this)}
            >
              Выбрать
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.props.open}
          onClose={() =>
            this.setState({ confirmDialog: true, text: "Закрыть без сохранения изменений?" })
          }
          fullScreen={this.props.fullScreen}
          fullWidth={true}
          maxWidth={"xl"}
        >
          <DialogTitle className="button">
            {this.props.method}
            {this.props.itemName ? `: ${this.props.itemName}` : null}
            <IconButton
              onClick={() =>
                this.setState({ confirmDialog: true, text: "Закрыть без сохранения изменений?" })
              }
              style={{ cursor: "pointer" }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Grid
              container
              spacing={3}
            >
              {this.props.mark === "editZone_future" ? (
                <Grid
                  size={{
                    xs: 12,
                    sm: 12,
                  }}
                >
                  <MyDatePickerNew
                    label="Дата начала изменений"
                    value={dayjs(this.state.item ? this.state.item.zone.date_start : "")}
                    func={this.changeDateRange.bind(this, "date_start")}
                  />
                </Grid>
              ) : null}

              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <MySelect
                  label="Точка"
                  is_none={false}
                  data={this.state.item ? this.state.item.points : []}
                  value={this.state.item ? this.state.item.zone.point_id : ""}
                  func={this.changePoint.bind(this, "point_id")}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <MyTextInput
                  label="Название зоны"
                  value={this.state.item ? this.state.item.zone.zone_name : ""}
                  func={this.changeItem.bind(this, "zone_name")}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <MyTextInput
                  label="Сумма для клиента"
                  value={this.state.item ? this.state.item.zone.sum_div : ""}
                  func={this.changeItem.bind(this, "sum_div")}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <MyTextInput
                  label="Сумма для курьера"
                  value={this.state.item ? this.state.item.zone.sum_div_driver : ""}
                  func={this.changeItem.bind(this, "sum_div_driver")}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <MyCheckBox
                  label="Бесплатная доставка"
                  value={
                    this.state.item
                      ? parseInt(this.state.item.zone.free_drive) == 1
                        ? true
                        : false
                      : false
                  }
                  func={this.changeItemChecked.bind(this, "free_drive")}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <MyCheckBox
                  label="Активность"
                  value={
                    this.state.item
                      ? parseInt(this.state.item.zone.is_active) == 1
                        ? true
                        : false
                      : false
                  }
                  func={this.changeItemChecked.bind(this, "is_active")}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <Button
                  variant="contained"
                  onClick={
                    this.state.isDrawing
                      ? this.startDrawing.bind(this)
                      : this.stopDrawing.bind(this)
                  }
                  style={{ whiteSpace: "nowrap" }}
                >
                  {this.state.isDrawing
                    ? "Включить область редактирования"
                    : "Выключить область редактирования"}
                </Button>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <div
                  id="map"
                  name="map"
                  style={{ width: "100%", height: 700, paddingTop: 10 }}
                >
                  {!this.state.zones.length || this.props.fullScreen ? null : (
                    <List className="list_zones">
                      <div className="list">
                        {this.state.zones.map((item, key) => (
                          <ListItem
                            key={key}
                            style={{ borderBottom: "1px solid #e5e5e5" }}
                          >
                            <MyCheckBox
                              label={item?.zone_name}
                              value={item?.is_view ?? Number(item?.is_active) === 1}
                              func={this.changeZonesView.bind(this, key, item.id)}
                            />
                          </ListItem>
                        ))}
                      </div>
                    </List>
                  )}
                </div>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              onClick={
                this.props.mark === "newZone" ||
                this.props.mark === "editZone_future" ||
                this.props.mark === "copyZone"
                  ? this.save.bind(this)
                  : () => this.setState({ dateDialog: true })
              }
            >
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

class ZoneModules_ extends React.Component {
  map_hist = null;
  myGeoObject_hist = null;

  constructor(props) {
    super(props);

    this.state = {
      module: "zone_modules",
      module_name: "",
      is_load: false,

      cities: [],
      city: "",

      zones: [],
      zones_future: [],

      fullScreen: false,

      modalDialog: false,
      method: "",
      mark: "",
      item: null,
      itemName: "",

      itemNew: {
        point_id: "",
        zone_name: "",
        sum_div: 0,
        sum_div_driver: 0,
        free_drive: 0,
        new_zone: [],
      },

      openAlert: false,
      err_status: true,
      err_text: "",

      zone_id_delete: null,
      text_dialog_delete: "",
      type_delete: "",

      zones_hist: [],

      modalDialogView: false,
      itemView: null,
      date_edit: null,

      modalDialogMap: false,
      zone_data: null,

      confirmDialog: false,

      points: [],

      zoneSortBy: null,
      zoneSortDirection: "asc",
      mapsReady: false,
    };
  }

  async componentDidMount() {
    const data = await this.getData("get_all");

    const zone = {
      city_id: data.cities[0].id,
    };

    const res = await this.getData("get_zones", zone);

    this.setState({
      zones: res.zones,
      zones_future: res.zones_future,
      cities: data.cities,
      city: data.cities[0].id,
      module_name: data.module_info.name,
      zones_hist: res.all_hist,
      points: res.points,
      zoneSortBy: null,
      zoneSortDirection: "asc",
    });

    document.title = data.module_info.name;
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

  async changeCity(event) {
    const data = {
      city_id: event.target.value,
    };

    const res = await this.getData("get_zones", data);

    this.setState({
      zones: res.zones,
      city: event.target.value,
      zones_future: res.zones_future,
      zones_hist: res.all_hist,
      points: res.points,
      zoneSortBy: null,
      zoneSortDirection: "asc",
    });
  }

  async save(item, date_start) {
    const mark = this.state.mark;

    let res;

    if (mark === "newZone") {
      const data = {
        point_id: item.point_id,
        name: item.zone_name,
        sum_div: item.sum_div,
        sum_div_driver: item.sum_div_driver,
        free_drive: item.free_drive,
        new_zone: item.new_zone,
      };

      res = await this.getData("save_new", data);
    }

    if (mark === "copyZone") {
      const data = {
        point_id: item.point_id,
        name: item.zone_name,
        sum_div: item.sum_div,
        sum_div_driver: item.sum_div_driver,
        free_drive: item.free_drive,
        new_zone: item.new_zone,
        zone_id: item.id,
        is_active: item.is_active,
      };

      res = await this.getData("copy_zone", data);
    }

    if (mark === "editZone") {
      const data = {
        point_id: item.point_id,
        name: item.zone_name,
        sum_div: item.sum_div,
        sum_div_driver: item.sum_div_driver,
        free_drive: item.free_drive,
        new_zone: item.new_zone,
        zone_id: item.id,
        is_active: item.is_active,
      };

      if (date_start) {
        data.date_start = date_start;
        res = await this.getData("save_new_future", data);
      } else {
        res = await this.getData("update_zone", data);
      }
    }

    if (mark === "editZone_future") {
      const data = {
        point_id: item.point_id,
        name: item.zone_name,
        sum_div: item.sum_div,
        sum_div_driver: item.sum_div_driver,
        free_drive: item.free_drive,
        new_zone: item.new_zone,
        zone_id: item.id,
        is_active: item.is_active,
        date_start: dayjs(item.date_start).format("YYYY-MM-DD"),
      };

      res = await this.getData("update_zone_future", data);
    }

    if (!res.st) {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    } else {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });

      setTimeout(() => {
        this.update();
      }, 300);
    }
  }

  async update() {
    const city_id = this.state.city;

    const data = {
      city_id,
    };

    const res = await this.getData("get_zones", data);

    this.setState({
      zones: res.zones,
      zones_future: res.zones_future,
      zones_hist: res.all_hist,
      points: res.points,
    });
  }

  async openModal(mark, method, zone_id, id) {
    this.handleResize();

    const city_id = this.state.city;

    if (mark === "newZone") {
      const data = {
        city_id,
      };

      const itemNew = JSON.parse(JSON.stringify(this.state.itemNew));

      const item = await this.getData("get_all_for_new", data);

      item.zone = itemNew;

      item.zone.point_id = item.points[0].id;

      this.setState({
        modalDialog: true,
        method,
        mark,
        item,
      });
    }

    if (mark === "copyZone") {
      const data = {
        city_id,
        zone_id,
      };
      let item = await this.getData("get_one", data);
      item = {
        ...item,
        zone: {
          ...item.zone,
          zone_name: "Новая " + item.zone.zone_name,
          is_active: 1,
        },
      };

      item.zone.point_id = item.points[0].id;

      this.setState({
        modalDialog: true,
        method,
        mark,
        item,
        itemName: item.zone.zone_name,
      });
    }

    if (mark === "editZone") {
      const data = {
        city_id,
        zone_id,
      };

      const item = await this.getData("get_one", data);

      this.setState({
        modalDialog: true,
        method,
        mark,
        item,
        itemName: item.zone.zone_name,
      });
    }

    if (mark === "editZone_future") {
      const data = {
        city_id,
        zone_id,
        id,
      };

      const item = await this.getData("get_one_future", data);

      this.setState({
        modalDialog: true,
        method,
        mark,
        item,
        itemName: item.zone.zone_name,
      });
    }
  }

  openConfigDialog(zone_id_delete, type_delete) {
    const text_dialog_delete =
      type_delete === "zone"
        ? "Вы действительно хотите удалить данную зону?"
        : "Вы действительно хотите удалить данные изменения?";

    this.setState({
      confirmDialog: true,
      zone_id_delete,
      text_dialog_delete,
      type_delete,
    });
  }

  async deleteZone() {
    this.setState({ confirmDialog: false });

    const data = {
      zone_id: this.state.zone_id_delete,
    };

    if (this.state.type_delete === "zone") {
      await this.getData("delete_zone", data);
    } else {
      await this.getData("delete_zone_future", data);
    }

    setTimeout(() => {
      this.update();
    }, 300);
  }

  open_hist_zone(id, zone_id) {
    const points = this.state.points;
    const zones = this.state.zones;

    const history = zones.find((zone) => Number(zone.id) === Number(zone_id))?.all_hist ?? [];
    const itemView = history.find((item) => Number(item.id) === Number(id));

    if (!itemView) {
      return;
    }

    const zoneChange = itemView.changes?.find((change) => change.field === "zone");
    const pointChange = itemView.changes?.find((change) => change.field === "point_id");
    const pointId = pointChange?.after ?? itemView.point_id;
    const zone_data = zoneChange
      ? {
          coordinates: zoneChange.after,
          coordinates_old: zoneChange.before,
          xy_point: points.find((point) => Number(point.id) === Number(pointId))?.xy_point ?? "",
        }
      : null;

    this.setState({
      modalDialogView: true,
      itemView,
      zone_data,
    });
  }

  openHistZone(id) {
    const zones = [...this.state.zones];

    zones.forEach((zone) => {
      if (parseInt(zone.id) === parseInt(id)) {
        zone.is_open = !zone.is_open;
      } else {
        zone.is_open = false;
      }
    });

    this.setState({
      zones,
    });
  }

  handleZoneSort(field) {
    this.setState((state) => ({
      zoneSortBy: field,
      zoneSortDirection:
        state.zoneSortBy === field && state.zoneSortDirection === "asc" ? "desc" : "asc",
    }));
  }

  getActiveZones() {
    const zones = this.state.zones.filter((zone) => Number(zone.is_active) === 1);
    const { zoneSortBy, zoneSortDirection } = this.state;

    if (!zoneSortBy) {
      return zones;
    }

    const numericFields = ["point_id", "sum_div", "sum_div_driver", "free_drive"];
    const direction = zoneSortDirection === "asc" ? 1 : -1;

    return zones
      .map((zone, index) => ({ zone, index }))
      .sort((left, right) => {
        let result;

        if (numericFields.includes(zoneSortBy)) {
          result = Number(left.zone[zoneSortBy]) - Number(right.zone[zoneSortBy]);
        } else {
          result = String(left.zone[zoneSortBy] ?? "").localeCompare(
            String(right.zone[zoneSortBy] ?? ""),
            "ru",
            { sensitivity: "base" },
          );
        }

        return result === 0 ? left.index - right.index : result * direction;
      })
      .map(({ zone }) => zone);
  }

  renderZoneHeader(field, label, sortable, align = "left") {
    return (
      <TableCell align={align}>
        {sortable ? (
          <TableSortLabel
            active={this.state.zoneSortBy === field}
            direction={this.state.zoneSortBy === field ? this.state.zoneSortDirection : "asc"}
            onClick={this.handleZoneSort.bind(this, field)}
          >
            {label}
          </TableSortLabel>
        ) : (
          label
        )}
      </TableCell>
    );
  }

  renderZonesTable(zones, title, sortable = false) {
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                colSpan={11}
                sx={{ fontWeight: 700 }}
              >
                {title}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell width="4%">#</TableCell>
              <TableCell width="4%" />
              {this.renderZoneHeader("point_name", "Кафе", sortable)}
              {this.renderZoneHeader("zone_name", "Зона", sortable)}
              {this.renderZoneHeader("point_id", "Сортировка", sortable, "center")}
              {this.renderZoneHeader("sum_div", "Сумма для клиента", sortable, "center")}
              {this.renderZoneHeader("sum_div_driver", "Сумма для курьера", sortable, "center")}
              {this.renderZoneHeader("free_drive", "Бесплатная доставка", sortable, "center")}
              <TableCell align="center">Активность</TableCell>
              <TableCell align="center">Удалить</TableCell>
              <TableCell align="center">Копировать</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!zones.length ? (
              <TableRow>
                <TableCell
                  colSpan={11}
                  align="center"
                  sx={{ color: "text.secondary", py: 4 }}
                >
                  Зон нет
                </TableCell>
              </TableRow>
            ) : (
              zones.map((item, key) => (
                <React.Fragment key={item.id}>
                  <TableRow hover>
                    <TableCell>{key + 1}</TableCell>
                    <TableCell
                      onClick={item.hist.length ? this.openHistZone.bind(this, item.id) : null}
                      sx={{ cursor: item.hist.length ? "pointer" : "default" }}
                    >
                      {!item.hist.length ? null : (
                        <Tooltip title="История последних изменений">
                          <ExpandMoreIcon
                            sx={{
                              display: "flex",
                              transform: item.is_open ? "rotate(180deg)" : "rotate(0deg)",
                            }}
                          />
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>{item.point_name}</TableCell>
                    <TableCell
                      onClick={this.openModal.bind(
                        this,
                        "editZone",
                        "Редактирование зоны",
                        item.id,
                      )}
                      sx={{ fontWeight: 700, cursor: "pointer" }}
                    >
                      {item.zone_name}
                    </TableCell>
                    <TableCell align="center">{item.point_id}</TableCell>
                    <TableCell align="center">{item.sum_div}</TableCell>
                    <TableCell align="center">{item.sum_div_driver}</TableCell>
                    <TableCell align="center">
                      {Number(item.free_drive) === 0 ? <CloseIcon /> : <CheckIcon />}
                    </TableCell>
                    <TableCell align="center">
                      {Number(item.is_active) === 0 ? <CloseIcon /> : <CheckIcon />}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton onClick={this.openConfigDialog.bind(this, item.id, "zone")}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={this.openModal.bind(this, "copyZone", "Копирование зоны", item.id)}
                      >
                        <ContentCopyIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      sx={{ p: 0 }}
                      colSpan={11}
                    >
                      <Collapse
                        in={item.is_open}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box sx={{ m: 1 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Событие</TableCell>
                                <TableCell>Дата / время</TableCell>
                                <TableCell>Сотрудник</TableCell>
                                <TableCell>Изменения</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {item.hist.map((historyItem, historyIndex) => (
                                <TableRow
                                  hover
                                  key={historyItem.id}
                                  onClick={this.open_hist_zone.bind(
                                    this,
                                    historyItem.id,
                                    historyItem.zone_id,
                                  )}
                                  sx={{ cursor: "pointer" }}
                                >
                                  <TableCell>{historyIndex + 1}</TableCell>
                                  <TableCell>
                                    {historyEventLabels[historyItem.event_type] ?? "Изменение"}
                                  </TableCell>
                                  <TableCell>{historyItem.date_time_update}</TableCell>
                                  <TableCell>{historyItem.user_name ?? "Система Шеф"}</TableCell>
                                  <TableCell>{historySummary(historyItem)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  render() {
    return (
      <>
        <Script
          src="https://api-maps.yandex.ru/2.1/?apikey=665f5b53-8905-4934-9502-4a6a7b06a900&lang=ru_RU"
          onReady={() => this.setState({ mapsReady: true })}
        />
        <Backdrop
          style={{ zIndex: 99 }}
          open={this.state.is_load}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <Dialog
          sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
          maxWidth="sm"
          open={this.state.confirmDialog}
          onClose={() =>
            this.setState({ confirmDialog: false, zone_id_delete: null, text_dialog_delete: "" })
          }
        >
          <DialogTitle>Подтвердите действие</DialogTitle>
          <DialogContent
            align="center"
            sx={{ fontWeight: "bold" }}
          >
            <Typography>{this.state.text_dialog_delete}</Typography>
          </DialogContent>
          <DialogActions>
            <Button
              autoFocus
              onClick={() =>
                this.setState({
                  confirmDialog: false,
                  zone_id_delete: null,
                  text_dialog_delete: "",
                })
              }
            >
              Отмена
            </Button>
            <Button onClick={this.deleteZone.bind(this)}>Удалить</Button>
          </DialogActions>
        </Dialog>
        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />
        <ZoneModules_Modal
          open={this.state.modalDialog}
          onClose={() => this.setState({ modalDialog: false, itemName: "" })}
          method={this.state.method}
          mark={this.state.mark}
          item={this.state.item}
          itemName={this.state.itemName}
          save={this.save.bind(this)}
          fullScreen={this.state.fullScreen}
          zones={this.state.zones}
        />
        <ZoneModules_Modal_History
          open={this.state.modalDialogView}
          onClose={() => this.setState({ modalDialogView: false, itemView: null, zone_data: null })}
          historyItem={this.state.itemView}
          fullScreen={this.state.fullScreen}
          zone_data={this.state.zone_data}
          points={this.state.points}
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
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MySelect
              label="Город"
              is_none={false}
              data={this.state.cities}
              value={this.state.city}
              func={this.changeCity.bind(this)}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <Button
              onClick={this.openModal.bind(this, "newZone", "Новая зона")}
              variant="contained"
            >
              Добавить зону
            </Button>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
            sx={{ mb: 3 }}
          >
            {this.state.mapsReady ? (
              <ActiveZonesMap
                zones={this.getActiveZones()}
                onZoneClick={(zoneId) => this.openModal("editZone", "Редактирование зоны", zoneId)}
              />
            ) : (
              <Box
                sx={{
                  height: { xs: 360, sm: 480 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                <CircularProgress size={32} />
              </Box>
            )}
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
            sx={{
              mb: this.state.zones_future.length ? 2 : 10,
            }}
          >
            {this.renderZonesTable(
              this.getActiveZones(),
              `Активные зоны (${this.state.zones.filter((zone) => Number(zone.is_active) === 1).length})`,
              true,
            )}
          </Grid>

          {!this.state.zones_future.length ? null : (
            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
              sx={{
                mb: 5,
              }}
            >
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        style={{ fontWeight: 700 }}
                      >
                        Будущие изменения
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ width: "4%" }}>#</TableCell>
                      <TableCell style={{ width: "12%" }}>Точка</TableCell>
                      <TableCell style={{ width: "12%" }}>Зона</TableCell>
                      <TableCell style={{ width: "12%" }}>Сортировка</TableCell>
                      <TableCell
                        style={{ width: "12%" }}
                        align="center"
                      >
                        Сумма для клиента
                      </TableCell>
                      <TableCell
                        style={{ width: "12%" }}
                        align="center"
                      >
                        Сумма для курьера
                      </TableCell>
                      <TableCell
                        style={{ width: "12%" }}
                        align="center"
                      >
                        Бесплатная доставка
                      </TableCell>
                      <TableCell
                        style={{ width: "12%" }}
                        align="center"
                      >
                        Активность
                      </TableCell>
                      <TableCell
                        style={{ width: "12%" }}
                        align="center"
                      >
                        Удалить
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {this.state.zones_future.map((item, key) => (
                      <TableRow
                        key={key}
                        hover
                      >
                        <TableCell>{key + 1}</TableCell>
                        <TableCell>{item.point_name}</TableCell>
                        <TableCell
                          onClick={this.openModal.bind(
                            this,
                            "editZone_future",
                            "Редактирование зоны",
                            item.id,
                            item.zone_id,
                          )}
                          style={{ fontWeight: 700, cursor: "pointer" }}
                        >
                          {item.zone_name}
                        </TableCell>
                        <TableCell align="center">{item.point_id}</TableCell>
                        <TableCell align="center">{item.sum_div}</TableCell>
                        <TableCell align="center">{item.sum_div_driver}</TableCell>
                        <TableCell align="center">
                          {parseInt(item.free_drive) === 0 ? <CloseIcon /> : <CheckIcon />}
                        </TableCell>
                        <TableCell align="center">
                          {parseInt(item.is_active) === 0 ? <CloseIcon /> : <CheckIcon />}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton onClick={this.openConfigDialog.bind(this, item.id, "future")}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}

          {!this.state.zones.some((zone) => Number(zone.is_active) === 0) ? null : (
            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
              sx={{ mb: 5 }}
            >
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight={700}>
                    Архивные зоны (
                    {this.state.zones.filter((zone) => Number(zone.is_active) === 0).length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  {this.renderZonesTable(
                    this.state.zones.filter((zone) => Number(zone.is_active) === 0),
                    "Архивные зоны",
                  )}
                </AccordionDetails>
              </Accordion>
            </Grid>
          )}

          {!this.state.zones_hist.length ? null : (
            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
              sx={{
                mb: 5,
              }}
            >
              <Accordion style={{ width: "100%" }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography style={{ fontWeight: "bold" }}>История изменений</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Зона</TableCell>
                        <TableCell>Событие</TableCell>
                        <TableCell>Дата / время</TableCell>
                        <TableCell>Сотрудник</TableCell>
                        <TableCell>Изменения</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {this.state.zones_hist.map((it, k) => (
                        <TableRow
                          hover
                          key={k}
                          style={{ cursor: "pointer" }}
                          onClick={this.open_hist_zone.bind(this, it.id, it.zone_id)}
                        >
                          <TableCell>{k + 1}</TableCell>
                          <TableCell>{it.name}</TableCell>
                          <TableCell>{historyEventLabels[it.event_type] ?? "Изменение"}</TableCell>
                          <TableCell>{it.date_time_update}</TableCell>
                          <TableCell>{it.user_name ?? "Система Шеф"}</TableCell>
                          <TableCell>{historySummary(it)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            </Grid>
          )}
        </Grid>
      </>
    );
  }
}

export default function ZoneModules() {
  return <ZoneModules_ />;
}

export async function getServerSideProps({ req, res, query }) {
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=3600");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT");

  return {
    props: {},
  };
}
