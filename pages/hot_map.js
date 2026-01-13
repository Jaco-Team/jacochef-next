import React from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";

import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";

import HelpIcon from "@mui/icons-material/Help";

import { MySelect, MyDatePickerNew, MyTimePicker, MyCheckBox, MyAutocomplite } from "@/ui/Forms";

import { api_laravel, api_laravel_local } from "@/src/api_new";

import dayjs from "dayjs";
import { Close } from "@mui/icons-material";
import { ModalAddressManagement } from "@/components/hot_map/ModalAddressManagement";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Chip from "@mui/material/Chip";
import AccordionDetails from "@mui/material/AccordionDetails";
import Accordion from "@mui/material/Accordion";
import MyAlert from "@/ui/MyAlert";
import { ModalAddressManagementEdit } from "@/components/hot_map/ModalAddressManagementEdit";
import EditIcon from "@mui/icons-material/Edit";

const formatNumber = (num) => new Intl.NumberFormat("ru-RU").format(num);

const formatCurrency = (num) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(num);

const getHomeIconSVG = () => {
  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FF4136">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  `)
  );
};

const HotMap_Modal = ({ open, onClose, stats }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Статистика заказов
        <IconButton
          onClick={onClose}
          style={{ cursor: "pointer", position: "absolute", top: 0, right: 0, padding: 20 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid
          container
          spacing={2}
        >
          <Grid
            size={{
              xs: 12,
            }}
          >
            <Typography variant="body1">
              <span style={{ fontWeight: "bold" }}>Заказов в зоне: </span>
              {formatNumber(stats.statTrueCount)} ( {stats.statTruePercent}% )
            </Typography>
          </Grid>
          <Grid
            size={{
              xs: 12,
            }}
          >
            <Typography variant="body1">
              <span style={{ fontWeight: "bold" }}>Сумма заказов в зоне: </span>
              {formatCurrency(stats.statTrueAllSumm)}
            </Typography>
          </Grid>
          <Grid
            size={{
              xs: 12,
            }}
          >
            <Typography variant="body1">
              <span style={{ fontWeight: "bold" }}>Средний чек в зоне: </span>
              {formatCurrency(stats.statTrueAvgSumm)}
            </Typography>
          </Grid>
          <Grid
            size={{
              xs: 12,
            }}
          >
            <Typography variant="body1">
              <span style={{ fontWeight: "bold" }}>Всего заказов в городе: </span>
              {formatNumber(stats.statAllCount)}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color="primary"
        >
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default class HotMap extends React.PureComponent {
  map = null;
  heatmap = null;
  myGeoObject = null;
  selectedZone = null;

  constructor(props) {
    super(props);

    this.state = {
      module: "hot_map",
      module_name: "",
      is_load: false,
      is_driver: false,
      address_group_data: [],
      address_group: {},
      groups: [],

      cities: [],
      city_id: "",
      acces: {},

      date_start: dayjs(new Date()),
      date_end: dayjs(new Date()),
      time_start: "00:00",
      time_end: "23:59",
      err_text: "",
      err_status: false,
      openAlert: false,

      statsModalOpen: false,
      addAddressModalOpen: false,
      editAddressModalOpen: false,
      stats: {
        statTruePercent: "",
        statTrueCount: "",
        statTrueAllSumm: "",
        statTrueAvgSumm: "",
        statAllCount: "",
      },

      is_chooseZone: false,

      is_new: 0,
      is_pick_order: 0,

      isDrawing: false,
      drawnZones: [],
    };
  }

  async componentDidMount() {
    let data = await this.getData("get_all");

    this.setState({
      cities: data.cities,
      city_id: data.cities[0].id,
      module_name: data.module_info.name,
      address_group_data: data.address_group,
      acces: data.acces,
    });

    document.title = data.module_info.name;
  }

  update = async () => {
    let data = await this.getData("get_all");

    this.setState({
      cities: data.cities,
      module_name: data.module_info.name,
      address_group_data: data.address_group,
      acces: data.acces,
    });
  };

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

  changeAutocomplite(type, event, data) {
    this.setState({
      [type]: data,
    });
  }

  changeCity = (event) => {
    const data = event.target.value;

    this.clearAllDrawnZones();

    if (this.myGeoObject && this.myGeoObject.editor) {
      this.myGeoObject.editor.stopDrawing && this.myGeoObject.editor.stopDrawing();
    }

    this.myGeoObject = null;
    this.selectedZone = null;

    this.setState({ city_id: data, is_chooseZone: false, isDrawing: false }, () => {
      this.updateData();
    });
  };

  updateData = async () => {
    const keepZones = true;

    if (!keepZones) {
      this.clearAllDrawnZones();
    }

    this.setState({
      statAllCount: "",
      statTrueCount: "",
      statTrueAllSumm: "",
      statTrueAvgSumm: "",
      is_chooseZone: false,
      isDrawing: false,
    });

    let data = {
      city_id: this.state.city_id,
      date_start: dayjs(this.state.date_start).format("YYYY-MM-DD"),
      date_end: dayjs(this.state.date_end).format("YYYY-MM-DD"),
      time_start: this.state.time_start,
      time_end: this.state.time_end,
      address_group_id: this.state.address_group?.id,
      is_new: this.state.is_new,
      is_driver: this.state.is_driver,
      is_pick_order: this.state.is_pick_order,
      is_chooseZone: false,
    };

    let res = await this.getData("get_orders", data);
    this.setState({
      groups: res.groups,
    });
    this.getOrders(res.points, res.all_points, res.drivers, res.groups);
  };

  getOrders = (home, all_points, drivers = {}, groups = []) => {
    const new_data = all_points
      .map((item) => {
        if (!item || !Array.isArray(item) || item.length < 2) return null;
        const lat = parseFloat(item[0]);
        const lon = parseFloat(item[1]);
        if (isNaN(lat) || isNaN(lon)) return null;
        // Опционально: проверка на валидные координаты
        if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
        return [lat, lon, 1];
      })
      .filter(Boolean);

    if (!this.map) {
      ymaps.ready(() => {
        this.map = new ymaps.Map(
          "map",
          {
            center: [home[0].home.latitude, home[0].home.longitude],
            zoom: 11,
          },
          {
            searchControlProvider: "yandex#search",
          },
        );

        if (this.state.is_driver) {
          ymaps.modules.require(["Heatmap"], (Heatmap) => {
            if (!Heatmap) {
              console.error("Модуль Heatmap не доступен");
              return;
            }
            const heatmapData = this.state.is_driver ? drivers : new_data;
            if (!heatmapData || heatmapData.length === 0) {
              console.warn("Нет данных для тепловой карты");
              return;
            }

            this.heatmap = new Heatmap(drivers, {
              gradient: gradients[0],
              radius: radiuses[1],
              opacity: opacities[2],
            });
            this.heatmap.setMap(this.map);
          });
        } else {
          ymaps.modules.require(["Heatmap"], (Heatmap) => {
            if (!Heatmap) {
              console.error("Модуль Heatmap не доступен");
              return;
            }
            const heatmapData = this.state.is_driver ? drivers : new_data;
            if (!heatmapData || heatmapData.length === 0) {
              console.warn("Нет данных для тепловой карты");
              return;
            }
            this.heatmap = new Heatmap(new_data, {
              gradient: gradients[0],
              radius: radiuses[1],
              opacity: opacities[2],
            });
            this.heatmap.setMap(this.map);
          });
        }

        var gradients = [
            {
              0.1: "rgba(128, 255, 0, 0.7)",
              0.2: "rgba(255, 255, 0, 0.8)",
              0.7: "rgba(234, 72, 58, 0.9)",
              1.0: "rgba(162, 36, 25, 1)",
            },
            {
              0.1: "rgba(162, 36, 25, 0.7)",
              0.2: "rgba(234, 72, 58, 0.8)",
              0.7: "rgba(255, 255, 0, 0.9)",
              1.0: "rgba(128, 255, 0, 1)",
            },
          ],
          radiuses = [5, 10, 20, 30],
          opacities = [0.4, 0.6, 0.8, 1];
        if (groups.length) {
          groups.forEach((item) => {
            let myGeoObject2 = new ymaps.GeoObject(
              {
                geometry: {
                  type: "Point",
                  coordinates: [item.cordY, item.cordX],
                },
                properties: {
                  hintContent: item.address || "Нажмите для подробностей",
                  balloonContentHeader: `<strong>${item.title || "Информация"}</strong>`,
                  balloonContentBody: `
            <div style="padding: 5px;">
              <p><strong>Адрес:</strong> ${item.address || "Не указан"}</p>
              <p><strong>Координаты:</strong> ${item.cordY}, ${item.cordX}</p>
              <p><strong>Сумма заказов:</strong> ${item.orders?.sum ?? 0} руб.</p>
              <p><strong>Средний чек:</strong> ${item.orders?.avg_sum ?? 0} руб.</p>
              <p><strong>Количество заказов:</strong> ${item.orders?.count ?? 0}</p>
            </div>
          `,
                  balloonContentFooter: "Информация о точке",

                  data: item,
                },
              },
              {
                preset: "islands#blueDotIcon",
                iconColor: "#1E88E5",
                balloonCloseButton: true,
                balloonPanelMaxMapArea: 0,
                hideIconOnBalloonOpen: false,
                balloonAutoPan: true,
              },
            );

            myGeoObject2.events.add("click", function (e) {
              e.get("target").balloon.open();
            });

            this.map.geoObjects.add(myGeoObject2);
          });
        }

        home.forEach((item) => {
          let myGeoObject1 = new ymaps.GeoObject(
            {
              geometry: {
                type: "Point",
                coordinates: [item.home.latitude, item.home.longitude],
              },
            },
            {
              preset: "islands#blackDotIcon",
              iconColor: "black",
            },
          );

          this.map.geoObjects.add(myGeoObject1);

          let points_zone = item.zone.map((zon) => JSON.parse(zon["zone"]));

          points_zone.forEach((zone, poly) => {
            let myGeoObject2 = new ymaps.Polygon(
              [zone],
              {
                hintContent: "",
              },
              {
                fillColor: "rgba(187, 0, 37, 0)",
                strokeColor: "rgb(187, 0, 37)",
                strokeWidth: 5,
              },
            );

            this.map.geoObjects.add(myGeoObject2);
          });
        });

        this.map.geoObjects.events.add("click", this.changeColorPolygon);
      });
    } else {
      this.map.geoObjects.events.remove("click", this.changeColorPolygon);

      this.map.geoObjects.removeAll();
      if (this.heatmap) {
        this.heatmap.destroy();
      }

      this.map.setCenter([home[0].home.latitude, home[0].home.longitude]);

      var gradients = [
          {
            0.1: "rgba(128, 255, 0, 0.7)",
            0.2: "rgba(255, 255, 0, 0.8)",
            0.7: "rgba(234, 72, 58, 0.9)",
            1.0: "rgba(162, 36, 25, 1)",
          },
          {
            0.1: "rgba(162, 36, 25, 0.7)",
            0.2: "rgba(234, 72, 58, 0.8)",
            0.7: "rgba(255, 255, 0, 0.9)",
            1.0: "rgba(128, 255, 0, 1)",
          },
        ],
        radiuses = [5, 10, 20, 30],
        opacities = [0.4, 0.6, 0.8, 1];

      if (this.state.is_driver) {
        ymaps.modules.require(["Heatmap"], (Heatmap) => {
          this.heatmap = new Heatmap(drivers, {
            gradient: gradients[0],
            radius: radiuses[1],
            opacity: opacities[2],
          });
          this.heatmap.setMap(this.map);
        });
      } else {
        ymaps.modules.require(["Heatmap"], (Heatmap) => {
          this.heatmap = new Heatmap(new_data, {
            gradient: gradients[0],
            radius: radiuses[1],
            opacity: opacities[2],
          });
          this.heatmap.setMap(this.map);
        });
      }

      if (groups.length) {
        groups.forEach((item) => {
          let myGeoObject2 = new ymaps.GeoObject(
            {
              geometry: {
                type: "Point",
                coordinates: [item.cordY, item.cordX],
              },
              properties: {
                hintContent: item.address || "Нажмите для подробностей",
                balloonContentHeader: `<strong>${item.title || "Информация"}</strong>`,
                balloonContentBody: `
            <div style="padding: 5px;">
              <p><strong>Адрес:</strong> ${item.address || "Не указан"}</p>
              <p><strong>Координаты:</strong> ${item.cordY}, ${item.cordX}</p>
              <p><strong>Сумма заказов:</strong> ${item.orders?.sum ?? 0} руб.</p>
              <p><strong>Средний чек:</strong> ${item.orders?.avg_sum ?? 0} руб.</p>
              <p><strong>Количество заказов:</strong> ${item.orders?.count ?? 0}</p>
            </div>
          `,
                balloonContentFooter: "Информация о точке",

                data: item,
              },
            },
            {
              preset: "islands#blueDotIcon",
              iconColor: "#1E88E5",
              balloonCloseButton: true,
              balloonPanelMaxMapArea: 0,
              hideIconOnBalloonOpen: false,
              balloonAutoPan: true,
            },
          );

          myGeoObject2.events.add("click", function (e) {
            e.get("target").balloon.open();
          });

          this.map.geoObjects.add(myGeoObject2);
        });
      }

      home.forEach((item) => {
        let myGeoObject1 = new ymaps.GeoObject(
          {
            geometry: {
              type: "Point",
              coordinates: [item.home.latitude, item.home.longitude],
            },
          },
          {
            preset: "islands#blackDotIcon",
            iconColor: "black",
          },
        );

        this.map.geoObjects.add(myGeoObject1);

        let points_zone = item.zone.map((zon) => JSON.parse(zon["zone"]));

        points_zone.forEach((zone, poly) => {
          let myGeoObject2 = new ymaps.Polygon(
            [zone],
            {
              hintContent: "",
            },
            {
              fillColor: "rgba(187, 0, 37, 0)",
              strokeColor: "rgb(187, 0, 37)",
              strokeWidth: 5,
            },
          );
          this.map.geoObjects.add(myGeoObject2);
        });
      });

      this.map.geoObjects.events.add("click", this.changeColorPolygon);
    }
  };

  getCount = async () => {
    let zoneCoordinates = [];

    if (this.state.is_chooseZone && this.selectedZone) {
      zoneCoordinates = this.selectedZone.geometry.getCoordinates()[0];
    }
    if (!zoneCoordinates.length) {
      return;
    }

    let data = {
      city_id: this.state.city_id,
      date_start: dayjs(this.state.date_start).format("YYYY-MM-DD"),
      date_end: dayjs(this.state.date_end).format("YYYY-MM-DD"),
      time_start: this.state.time_start,
      time_end: this.state.time_end,
      is_pick_order: this.state.is_pick_order,
      is_new: this.state.is_new,
      zone: zoneCoordinates,
    };

    let res = await this.getData("getCount", data);

    res = res.counts;

    this.setState({
      stats: {
        statTrueCount: res.true,
        statTruePercent: res.true_percent,
        statTrueAllSumm: res.price,
        statTrueAvgSumm: res.avg_price,
        statAllCount: res.all_count,
      },

      statsModalOpen: true,
    });
  };

  changeDateRange = (data, event) => {
    this.setState({ [data]: event });
  };

  changeData = (type, event) => {
    let data = "";

    if (type === "is_new" || type === "is_pick_order" || type === "is_driver") {
      data = event.target.checked ? 1 : 0;
    } else {
      data = event.target.value;
    }

    if (type === "is_new" && data === 1) {
      this.setState({ is_pick_order: 0 });
    }

    if (type === "is_pick_order" && data === 1) {
      this.setState({ is_new: 0 });
    }

    this.setState({ [type]: data });
  };

  startDrawing = () => {
    if (this.state.isDrawing) {
      this.stopDrawing();
      return;
    }

    this.myGeoObject = new ymaps.GeoObject(
      {
        geometry: {
          type: "Polygon",
          coordinates: [],
          fillRule: "nonZero",
        },
      },
      {
        fillColor: "#00FF0022",
        strokeColor: "#00FF00",
        strokeWidth: 3,
        strokeStyle: "solid",
        cursor: "crosshair",
        draggable: true,
      },
    );

    this.map.geoObjects.add(this.myGeoObject);

    this.map.balloon.close();

    this.map.balloon.open(
      null,
      `<div style="max-width: 300px; font-size: 14px; padding: 10px;">
      <b>Режим рисования зоны включён</b><br>
      • Кликайте по карте, чтобы добавить точки<br>
      • Завершите рисование двойным кликом<br>
      • Зона будет автоматически проанализирована
    </div>`,
      {
        position: {
          right: 20,
          bottom: 20,
        },
        closeButton: true,
        autoPan: false,
        hideOnMapClick: false,
      },
    );

    this.myGeoObject.editor.startDrawing();

    const finishDrawingHandler = (e) => {
      if (e.get("newState") === "normal") {
        this.myGeoObject.editor.events.remove("statechange", finishDrawingHandler);

        this.map.hint.close();
        this.map.balloon.close();

        const coords = this.myGeoObject?.geometry?.getCoordinates();
        if (coords?.[0]?.length >= 3) {
          this.stopDrawing();
        } else {
          this.map.geoObjects.remove(this.myGeoObject);
          this.myGeoObject = null;
          this.setState({ isDrawing: false, is_chooseZone: false });
        }
      }
    };

    this.myGeoObject.editor.events.add("statechange", finishDrawingHandler);

    this.setState({ isDrawing: true, is_chooseZone: false });
  };

  restoreDrawnZones = () => {
    this.map.geoObjects.removeAll();

    if (this.heatmap) {
      this.heatmap.setMap(this.map);
    }

    this.state.drawnZones.forEach((zoneData) => {
      if (zoneData.geoObject) {
        try {
          this.map.geoObjects.add(zoneData.geoObject);
        } catch (e) {
          console.error("Ошибка восстановления зоны:", e);
          this.recreateZone(zoneData);
        }
      }
    });
  };

  stopDrawing = () => {
    if (this.myGeoObject?.editor) {
      try {
        this.myGeoObject.editor.stopDrawing();
      } catch (e) {
        console.error("Ошибка остановки редактора:", e);
      }
    }

    if (this.myGeoObject) {
      const coords = this.myGeoObject?.geometry?.getCoordinates();

      if (coords?.[0]?.length >= 3) {
        const isAlreadySaved = this.state.drawnZones.some(
          (zone) => zone.geoObject === this.myGeoObject,
        );

        if (!isAlreadySaved) {
          this.makeZoneStatic(this.myGeoObject);

          const newZone = {
            geoObject: this.myGeoObject,
            coordinates: coords[0],
            isEditable: false,
            id: Date.now() + Math.random(),
          };

          this.setState(
            (prevState) => ({
              drawnZones: [...prevState.drawnZones, newZone],
              is_chooseZone: true,
            }),
            () => {
              this.selectedZone = this.myGeoObject;
              this.selectedZone.options.set({ strokeColor: "#FF0000" });

              setTimeout(() => this.getCount(), 300);
            },
          );
        } else {
          this.makeZoneStatic(this.myGeoObject);
          this.selectedZone = this.myGeoObject;
          this.selectedZone.options.set({ strokeColor: "#FF0000" });
          this.setState({ is_chooseZone: true });
        }
      } else {
        this.map.geoObjects.remove(this.myGeoObject);
        this.myGeoObject = null;
      }
    }

    this.map.hint.close();
    this.map.balloon.close();

    this.setState({ isDrawing: false });
  };

  makeZoneStatic = (zone) => {
    if (!zone) return zone;

    if (zone.editor) {
      try {
        zone.editor.stopDrawing();
        zone.editor.stopEditing();

        if (zone.editor.options) {
          zone.editor.options.set("enabled", false);
        }
      } catch (e) {}
    }

    const coords = zone.geometry.getCoordinates();

    zone.options.set({
      fillColor: "#FFFF0022",
      strokeColor: "#FFFF00",
      strokeWidth: 3,
      cursor: "pointer",
      draggable: false,
      hasBalloon: false,
      hasHint: false,
      openBalloonOnClick: false,
      openEmptyBalloon: false,
      openHintOnHover: false,
      editorDrawingCursor: "",
      editorMaxPoints: 0,
      editorMenuManager: null,
    });

    try {
      zone.events.removeAll();
    } catch (e) {
      const eventTypes = [
        "click",
        "dblclick",
        "mousedown",
        "mouseup",
        "mousemove",
        "dragstart",
        "drag",
        "dragend",
      ];
      eventTypes.forEach((type) => {
        try {
          zone.events.remove(type);
        } catch (err) {}
      });
    }

    zone.events.add("click", (e) => {
      e.preventDefault();
      this.selectZone(zone);
    });

    return zone;
  };

  recreateZone = (zoneData) => {
    const zone = new ymaps.GeoObject(
      {
        geometry: {
          type: "Polygon",
          coordinates: [zoneData.coordinates],
          fillRule: "nonZero",
        },
      },
      {
        fillColor: "#FFFF0022",
        strokeColor: zoneData.isEditable ? "#00FF00" : "#FFFF00",
        strokeWidth: 3,
        cursor: zoneData.isEditable ? "crosshair" : "pointer",
        draggable: zoneData.isEditable,
      },
    );

    zone.events.add("click", () => {
      if (zoneData.isEditable) {
        this.selectZoneForEditing(zone);
      } else {
        this.selectZone(zone);
      }
    });

    this.map.geoObjects.add(zone);

    const zoneIndex = this.state.drawnZones.findIndex(
      (z) => z.coordinates === zoneData.coordinates,
    );

    if (zoneIndex !== -1) {
      const newDrawnZones = [...this.state.drawnZones];
      newDrawnZones[zoneIndex] = {
        ...zoneData,
        geoObject: zone,
      };
      this.setState({ drawnZones: newDrawnZones });
    }

    return zone;
  };

  selectZone = (zone) => {
    if (this.selectedZone === zone) {
      zone.options.set({ strokeColor: "#FFFF00" });
      this.selectedZone = null;
      this.setState({ is_chooseZone: false });
      return;
    }

    if (this.selectedZone) {
      this.selectedZone.options.set({ strokeColor: "#FFFF00" });
    }

    zone.options.set({ strokeColor: "#FF0000" });
    this.selectedZone = zone;
    this.setState({ is_chooseZone: true }, () => {
      setTimeout(() => this.getCount(), 300);
    });
  };

  removeDrawing = () => {
    if (this.myGeoObject && this.state.isDrawing) {
      if (this.myGeoObject?.editor) {
        try {
          this.myGeoObject.editor.stopDrawing();
        } catch (e) {}
      }

      this.map.geoObjects.remove(this.myGeoObject);
      this.myGeoObject = null;
    }

    if (this.state.drawnZones.length > 0) {
      this.state.drawnZones.forEach((zone) => {
        if (zone.geoObject) {
          this.map.geoObjects.remove(zone.geoObject);
        }
      });

      this.setState({
        drawnZones: [],
        is_chooseZone: false,
      });

      this.selectedZone = null;
    }

    this.map.hint.close();
    this.map.balloon.close();
    this.setState({ isDrawing: false });
  };

  clearAllDrawnZones = () => {
    this.state.drawnZones.forEach((zone) => {
      if (zone.geoObject) {
        this.map.geoObjects.remove(zone.geoObject);
      }
    });

    if (this.myGeoObject) {
      this.map.geoObjects.remove(this.myGeoObject);
      this.myGeoObject = null;
    }

    this.selectedZone = null;
    if (this.map) {
      this.map.hint.close();
      this.map.balloon.close();
    }
    this.setState({
      isDrawing: false,
      is_chooseZone: false,
      drawnZones: [],
    });
  };

  removeLastDrawnZone = () => {
    if (this.state.drawnZones.length === 0) return;

    const lastZone = this.state.drawnZones[this.state.drawnZones.length - 1];

    if (lastZone.geoObject) {
      this.map.geoObjects.remove(lastZone.geoObject);
    }

    const newDrawnZones = this.state.drawnZones.slice(0, -1);

    this.setState({
      drawnZones: newDrawnZones,
      is_chooseZone: false,
    });

    if (this.selectedZone === lastZone.geoObject) {
      this.selectedZone = null;
    }
  };

  changeColorPolygon = (event) => {
    const clickedPolygon = event.get("target");

    if (this.state.is_chooseZone && this.selectedZone && this.selectedZone !== clickedPolygon) {
      this.selectedZone.options.set({ strokeColor: "rgb(187, 0, 37)" });
      this.selectedZone = null;
    }

    if (!this.state.is_chooseZone || this.selectedZone !== clickedPolygon) {
      clickedPolygon.options.set({ strokeColor: "rgb(255, 255, 0)" });
      this.selectedZone = clickedPolygon;

      this.setState({ is_chooseZone: true });

      setTimeout(() => {
        this.getCount();
      }, 1000);
    } else {
      clickedPolygon.options.set({ strokeColor: "rgb(187, 0, 37)" });
      this.selectedZone = null;
      this.setState({ is_chooseZone: false });
    }
  };

  handleModalClose = () => {
    this.setState({ statsModalOpen: false });

    setTimeout(() => {
      if (this.selectedZone) {
        this.selectedZone.options.set({ strokeColor: "rgb(187, 0, 37)" });
        this.selectedZone = null;
      }
      this.setState({ is_chooseZone: false });
    }, 1000);
  };

  saveAddressModalOpen = async (name, addresses) => {
    let res = await this.getData("save_group_address", {
      name,
      addresses,
      city_id: this.state.city_id,
    });
    if (!res.st) {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    } else {
      this.setState(
        {
          openAlert: true,
          err_status: res.st,
          err_text: res.text,
          addAddressModalOpen: false,
        },
        () => this.update(),
      );
    }
  };

  saveEditAddressModalOpen = async (id, name, addresses) => {
    let res = await this.getData("save_edit_group_address", {
      id,
      name,
      addresses,
      city_id: this.state.city_id,
    });
    if (!res.st) {
      this.setState({
        openAlert: true,
        err_status: res.st,
        err_text: res.text,
      });
    } else {
      this.setState(
        {
          openAlert: true,
          err_status: res.st,
          err_text: res.text,
          editAddressModalOpen: false,
        },
        () => this.update(),
      );
    }
  };

  render() {
    return (
      <>
        <Backdrop
          open={this.state.is_load}
          style={{ zIndex: 99 }}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />
        <Grid
          container
          spacing={3}
          className="container_first_child"
        >
          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <h1>{this.state.module_name}</h1>
          </Grid>
          {this.state.addAddressModalOpen ? (
            <ModalAddressManagement
              open={this.state.addAddressModalOpen}
              onClose={() => this.setState({ addAddressModalOpen: false })}
              save={this.saveAddressModalOpen}
              centerMap={JSON.parse(
                this.state.cities.find((item) => item.id === parseInt(this.state.city_id))
                  ?.xy_center_map,
              ).map(parseFloat)}
            />
          ) : null}
          {this.state.editAddressModalOpen ? (
            <ModalAddressManagementEdit
              open={this.state.editAddressModalOpen}
              addressGroup={this.state.address_group}
              onClose={() => this.setState({ editAddressModalOpen: false })}
              save={this.saveEditAddressModalOpen}
              centerMap={JSON.parse(
                this.state.cities.find((item) => item.id === parseInt(this.state.city_id))
                  ?.xy_center_map,
              ).map(parseFloat)}
            />
          ) : null}

          <HotMap_Modal
            open={this.state.statsModalOpen}
            onClose={this.handleModalClose}
            stats={this.state.stats}
          />

          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <MySelect
              is_none={false}
              data={this.state.cities}
              value={this.state.city_id}
              func={this.changeCity}
              label="Город"
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <Tooltip
              title={
                <span style={{ fontSize: "18px", lineHeight: "1.5" }}>
                  Показываются домашние адреса клиентов, кто хотя бы раз сделал заказ на доставку и
                  в заданный период самовывоз. Домашним считается тот адрес, где больше всего
                  доставок за все время в городе.
                </span>
              }
              placement="right"
              arrow
              sx={{
                "& .MuiTooltip-tooltip": {
                  fontSize: "18px !important",
                  maxWidth: "600px",
                  padding: "10px",
                  whiteSpace: "normal",
                  backgroundColor: "#333",
                  color: "#fff",
                },
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center" }}>
                <MyCheckBox
                  value={this.state.is_pick_order === 1}
                  func={this.changeData.bind(this, "is_pick_order")}
                  label="Домашние адреса"
                />
                <HelpIcon />
              </span>
            </Tooltip>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <div style={{ display: "flex", flexDirection: "row" }}>
              <MyCheckBox
                value={this.state.is_new === 1}
                func={this.changeData.bind(this, "is_new")}
                label="Только новые клиенты"
              />
              <MyCheckBox
                value={this.state.is_driver === 1}
                func={this.changeData.bind(this, "is_driver")}
                label="Показывать курьеров"
              />
            </div>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyDatePickerNew
              label="Дата от"
              value={this.state.date_start}
              func={this.changeDateRange.bind(this, "date_start")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyTimePicker
              label="Время от"
              value={this.state.time_start}
              func={this.changeData.bind(this, "time_start")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyDatePickerNew
              label="Дата до"
              value={this.state.date_end}
              func={this.changeDateRange.bind(this, "date_end")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyTimePicker
              label="Время до"
              value={this.state.time_end}
              func={this.changeData.bind(this, "time_end")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <Button
              variant="contained"
              onClick={this.updateData}
            >
              Обновить данные
            </Button>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <Button
              variant={this.map ? "contained" : "outlined"}
              color={this.state.isDrawing ? "warning" : "primary"}
              onClick={this.state.isDrawing ? this.stopDrawing : this.startDrawing}
              disabled={!this.map}
            >
              {this.state.isDrawing
                ? "Выключить область редактирования"
                : "Включить область редактирования"}
            </Button>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <Button
              variant={this.map && this.myGeoObject ? "contained" : "outlined"}
              onClick={this.removeDrawing}
              disabled={!this.map || !this.myGeoObject}
            >
              Очистить область редактирования
            </Button>
          </Grid>
          {this.state.acces?.groups_access ? (
            <Grid
              size={{
                xs: 12,
                sm: 12,
              }}
            >
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: "bold" }}>Раздел с группами адресов</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid
                    container
                    spacing={3}
                  >
                    <Grid
                      size={{
                        xs: 12,
                        sm: 3,
                      }}
                    >
                      <MyAutocomplite
                        label="Группа адресов"
                        multiple={false}
                        data={this.state.address_group_data.filter(
                          (item) => item.city_id === parseInt(this.state.city_id),
                        )}
                        value={this.state.address_group}
                        func={this.changeAutocomplite.bind(this, "address_group")}
                      />
                    </Grid>
                    <Grid
                      size={{
                        xs: 12,
                        sm: 6,
                      }}
                    >
                      <Button
                        variant="contained"
                        disabled={!this.state.address_group?.id}
                        onClick={() => this.setState({ editAddressModalOpen: true })}
                      >
                        <EditIcon />
                      </Button>
                    </Grid>
                    <Grid
                      size={{
                        xs: 12,
                        sm: 3,
                      }}
                    >
                      <Button
                        variant="contained"
                        onClick={() => this.setState({ addAddressModalOpen: true })}
                      >
                        Создать группу адресов
                      </Button>
                    </Grid>
                    {this.state.groups.length ? (
                      <>
                        <p>
                          Кол-во заказов:{" "}
                          {this.state.groups.reduce(
                            (acc, item) => acc + (item.orders?.count || 0),
                            0,
                          )}{" "}
                          шт.
                        </p>
                        <p>
                          Сумма заказов:{" "}
                          {new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2 }).format(
                            this.state.groups.reduce(
                              (acc, item) => acc + (parseFloat(item.orders?.sum) || 0),
                              0,
                            ),
                          )}{" "}
                          руб.
                        </p>
                        <p>
                          Средний чек:{" "}
                          {new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2 }).format(
                            this.state.groups.reduce(
                              (acc, item) => acc + (parseFloat(item.orders?.avg_sum) || 0),
                              0,
                            ),
                          )}{" "}
                          руб.
                        </p>
                      </>
                    ) : null}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
          ) : null}

          <Grid
            size={{
              xs: 12,
              sm: 12,
            }}
            sx={{
              mb: 10,
            }}
          >
            <div
              id="map"
              name="map"
              style={{ width: "100%", height: 700, paddingTop: 10 }}
            />
          </Grid>
        </Grid>
      </>
    );
  }
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
