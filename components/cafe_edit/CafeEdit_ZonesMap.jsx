import { memo, useEffect, useRef } from "react";

const fillPrimaryActive = "#00FF00";
const fillPrimaryInactive = "#AAAAAA";
const strokePrimaryActive = "#0000FF";
const strokePrimaryInactive = "#000000";
const fillSecondary = "#f08080ff";
const strokeSecondary = "#bb0025ff";

const CafeEdit_ZonesMap = ({ zones, otherZones, clickCallback }) => {
  const mapRef = useRef(null);

  const handleClickCallback = (e) => {
    const zoneIndex = mapRef.current?.geoObjects.indexOf(e.get("target"));
    if (zoneIndex !== -1) {
      clickCallback(zoneIndex);
    }
  };

  const buildMainZones = () => {
    zones.forEach((item) => {
      const coords = JSON.parse(item.zone);
      const isActive = !!item.is_active;

      const polygon = new ymaps.Polygon(
        [coords],
        { geometry: { fillRule: "nonZero" } },
        {
          fillOpacity: 0.4,
          fillColor: isActive ? fillPrimaryActive : fillPrimaryInactive,
          strokeColor: isActive ? strokePrimaryActive : strokePrimaryInactive,
          strokeWidth: 5,
        }
      );

      mapRef.current.geoObjects.add(polygon);
    });
  };

  const buildOtherZones = () => {
    otherZones.forEach((item) => {
      const coords = JSON.parse(item.zone);

      const polygon = new ymaps.Polygon(
        [coords],
        { hintContent: "" },
        {
          fillOpacity: 0.4,
          fillColor: fillSecondary,
          strokeColor: strokeSecondary,
          strokeWidth: 5,
        }
      );

      mapRef.current.geoObjects.add(polygon);
    });
  };

  const renderZones = (ymaps) => {
    if (!zones?.length) return;
    const mainZone = zones[0];
    if (!mapRef.current) {
      ymaps.ready(() => {
        const mapElement = document.getElementById("map");
        if (!mapElement) {
          return;
        }

        mapRef.current = new ymaps.Map(
          "map",
          { center: JSON.parse(mainZone["xy_point"]), zoom: 11 },
          { searchControlProvider: "yandex#search" }
        );

        // зоны доставки точки
        buildMainZones();
        // другие зоны доставки
        buildOtherZones();

        mapRef.current.geoObjects.events.add("click", handleClickCallback);
      });
    } else {
      mapRef.current.geoObjects.removeAll();
      mapRef.current.setCenter(JSON.parse(zones[0]["xy_point"]));

      // зоны доставки точки
      buildMainZones();
      // другие зоны
      buildOtherZones();
    }
  };

  useEffect(() => {
    const ymaps = window["ymaps"];
    if (!ymaps) {
      return;
    }
    renderZones(ymaps);
    return () => {
      mapRef.current?.destroy?.();
      mapRef.current = null;
    };
  }, []);


  return (
    <>
      <div
        id="map"
        style={{ width: "100%", minHeight: "300px", height: "50dvh" }}
      ></div>
    </>
  );
};

export default memo(CafeEdit_ZonesMap);


// its already added in _document.js
// import Script from "next/script";
// const YMAPS_API_KEY = "665f5b53-8905-4934-9502-4a6a7b06a900";
// <Script src={`https://api-maps.yandex.ru/2.1/?apikey=${YMAPS_API_KEY}&lang=ru_RU`} />
