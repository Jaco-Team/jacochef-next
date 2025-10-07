"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { api_laravel } from "@/src/api_new";
import { Grid } from "@mui/material";

const defaultCallBack = async () => console.log("Please pass a valid callback to DriversMap");

const DriversMap = ({ pointId = 0, onShowOrder = defaultCallBack }) => {
  const mapRef = useRef(null);
  const objectManagerRef = useRef(null);
  const module = "concenter";
  // const [moduleName, setModuleName] = useState('');
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [home, setHome] = useState([]);

  const getStatusText = (status = 0) => {
    status = status > 6 ? 0 : status;
    const statuses = {
      0: "не оформлен",
      1: "в очереди",
      2: "готовится",
      3: "готов на кухне",
      4: "собран",
      5: "в пути",
      6: "у клиента",
    };
    return statuses[status];
  };

  const renderPlacemarks = (ymaps) => {
    // important: rebind ymaps, it should be initialized fully
    // const ymaps = window["ymaps"];
    if (!ymaps) {
      console.error("no ymaps");
      return;
    }

    //дом
    const myGeoObject = new ymaps.GeoObject(
      {
        geometry: {
          type: "Point",
          coordinates: [home.latitude, home.longitude],
        },
      },
      {
        preset: "islands#blackDotIcon",
        iconColor: "black",
      }
    );

    if (!mapRef.current) {
      mapRef.current = new ymaps.Map(
        "map",
        {
          center: [home.latitude, home.longitude],
          zoom: 11,
        },
        {
          searchControlProvider: "yandex#search",
        }
      );
      // console.log("Map created");
    } else {
      // console.log("MAP already exists");
      // дом в центр
      mapRef.current.setCenter([home.latitude, home.longitude]);
    }

    if (!objectManagerRef.current) {
      objectManagerRef.current = new ymaps.ObjectManager();
      // console.log("ObjectManager created");
      objectManagerRef.current.events.add("click", async function (e) {
        const objectId = e.get("objectId");
        const object = objectManagerRef.current.objects.getById(objectId); // get the full feature object

        // Skip drivers
        if (object?.properties?.isDriver) {
          return;
        }

        if (objectId && typeof onShowOrder === "function") {
          await onShowOrder(objectId);
        }
      });
      mapRef.current.geoObjects.add(objectManagerRef.current);
    }

    objectManagerRef.current.removeAll();
    // console.log("Cleared all objects");
    const pointsData = buildObjectManagerItems(home, orders, drivers);
    objectManagerRef.current.add(pointsData);

    mapRef.current.geoObjects.add(myGeoObject);
  };

  const buildObjectManagerItems = () => {
    const result = {
      type: "FeatureCollection",
      features: [],
    };

    //дом
    result.features.push({
      type: "Feature",
      id: 0,
      options: {
        preset: "islands#blackDotIcon",
        iconColor: "#369",
      },
      geometry: {
        type: "Point",
        coordinates: [home.latitude, home.longitude],
      },
    });

    orders.forEach(function (order) {
      result.features.push({
        type: "Feature",
        id: order.id,
        options: {
          preset:
            parseInt(order.status_order) == 6
              ? "islands#blueCircleDotIconWithCaption"
              : "islands#circleDotIcon",
          iconColor: order.point_color || order.color,
        },
        properties: {
          //iconCaption: parseInt(item.status_order) == 6 ? item.close_time_ : parseInt(item.is_pred) == 1 ? item.need_time : parseInt(item.is_my) == 1 ? item.time_start_mini : '',
          iconCaption: order.point_text || "",

          // 👇 Custom HTML hint
          hintContent: `
            <b>ID: ${order.id}</b><br />
            <b>${getStatusText(+order.status_order)}</b><br />
            Сумма: ${order.sum_order} руб.<br />
            Курьер: ${order.driver_name || "—"}<br />
            ${order.addr || ""}
          `,
        },
        geometry: {
          type: "Point",
          coordinates: [order.xy.latitude, order.xy.longitude],
        },
      });
    });

    drivers.forEach(function (driver) {
      driver.positions.forEach(function (pos, key) {
        const [lat, lon] = JSON.parse(pos["xy"], true);

        result.features.push({
          type: "Feature",
          id: pos.id,
          options: {
            preset: "islands#stretchyIcon",
            iconColor: driver.color,
          },
          properties: {
            isDriver: true,
            iconContent: key,
            hintContent: `
              ${driver.driver_name}
            `,
          },
          geometry: {
            type: "Point",
            coordinates: [lat, lon],
          },
        });
      });
    });

    return result;
  };

  const getData = (method, data = {}) => {
    setLoading(true);
    try {
      const res = api_laravel(module, method, data)
        .then((result) => result?.data)
        .finally(() => {
          setLoading(false);
        });
      return res;
    } catch (err) {
      console.error(`API error ${module}/${method}: `, err);
    }
  };

  const updateData = async (point_id) => {
    const data = {
      point_id,
    };

    const res = await getData("get_map_orders", data);
    setDrivers(res.drivers);
    setOrders(res.orders);
    setHome(res.home);
  };

  useEffect(() => {
    const updateByPoint = async () => {
      await updateData(pointId);
    };
    updateByPoint();
  }, [pointId]);

  useEffect(() => {
    const ymaps = window["ymaps"];
    if (!ymaps) {
      console.error("no ymaps");
      return;
    }
    ymaps.ready(function () {
      renderPlacemarks(ymaps);
    });
    return () => {
      mapRef.current?.destroy?.();
      mapRef.current = null;
      objectManagerRef.current = null;
    };
  }, [home, orders, drivers]);

  return (
    <div style={{ position: "relative" }}>
      {!mapRef.current && (
        <Script src="https://api-maps.yandex.ru/2.1/?apikey=665f5b53-8905-4934-9502-4a6a7b06a900&lang=ru_RU" />
      )}
      <Grid
        container
        spacing={3}
      >
        <Backdrop
          open={loading}
          style={{ zIndex: 99, position: "absolute", inset: 0 }}
        >
          <CircularProgress color="inherit" />
        </Backdrop>

        <Grid
          item
          xs={12}
        >
          {drivers.map((item, key) => (
            <div
              key={key}
              style={{ display: "flex", flexDirection: "row", gap: "1em", alignItems: "center" }}
            >
              <div
                style={{ width: 50, height: 20, borderRadius: 3, backgroundColor: item.color }}
              ></div>
              <div>{item.driver_name}</div>
            </div>
          ))}
        </Grid>

        <Grid
          item
          xs={12}
          sm={12}
        >
          <div
            id="map"
            name="map"
            style={{ width: "100%", height: 700, maxHeight: "700px", paddingTop: 10 }}
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default DriversMap;
