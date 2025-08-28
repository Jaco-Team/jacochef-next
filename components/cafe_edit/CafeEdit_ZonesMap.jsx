import { memo, useEffect, useRef } from "react";

const fillPrimaryActive = "#00FF00";
const fillPrimaryInactive = "#AAAAAA";
const strokePrimaryActive = "#0000FF";
const strokePrimaryInactive = "#000000";
const fillSecondary = "#f08080ff";
const strokeSecondary = "#bb0025ff";

const CafeEdit_ZonesMap = ({ zones, otherZones, clickCallback, readonly = false }) => {
  const mapRef = useRef(null);
  const isYm = useRef(false);


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

  const createZones = () => {
    const ymaps = window["ymaps"];
    if (!ymaps || isYm.current) return;

    ymaps.ready(() => {
      if (isYm.current) return;
      const center = zones?.[0]?.xy_point || otherZones?.[0]?.xy_point || "[53.492595, 49.421882]";

      const mapElement = document.getElementById("map");
      if (!mapElement) {
        return;
      }

      mapRef.current = new ymaps.Map(
        "map",
        {
          center: JSON.parse(center),
          zoom: 11,
        },
        {
          searchControlProvider: "yandex#search",
        }
      );

      // зоны доставки точки
      zones?.length && buildMainZones();
      // другие зоны доставки
      otherZones?.length && buildOtherZones();

      if (!readonly) {
        mapRef.current.geoObjects.events.add("click", handleClickCallback);
      }

      isYm.current = true;
    });
  };

  const updateZones = () => {
    if (!mapRef.current || !isYm.current) {
      return;
    }
    mapRef.current.geoObjects.removeAll();
    const center = String(zones?.[0]?.xy_point || otherZones?.[0]?.xy_point);
    if (center) {
      mapRef.current.setCenter(JSON.parse(center));
    }
    // зоны доставки точки
    zones?.length && buildMainZones();
    // другие зоны доставки
    otherZones?.length && buildOtherZones();
  };

  useEffect(() => {
    createZones();
    return () => {
      mapRef.current?.destroy?.();
      mapRef.current = null;
      isYm.current = false;
    };
  }, []);

  useEffect(() => {
    updateZones();
  }, [zones, otherZones]);

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
