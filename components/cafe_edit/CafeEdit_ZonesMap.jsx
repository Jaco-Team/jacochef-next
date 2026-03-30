import { memo, useEffect, useRef, useState } from "react";
import Script from "next/script";

const fillPrimaryActive = "#00FF00";
const fillPrimaryInactive = "#AAAAAA";
const strokePrimaryActive = "#0000FF";
const strokePrimaryInactive = "#000000";
const fillSecondary = "#f08080ff";
const strokeSecondary = "#bb0025ff";

const CafeEdit_ZonesMap = ({ zones, otherZones, clickCallback, readonly = false }) => {
  const mapRef = useRef(null);
  const isYm = useRef(false);
  const polygonsRef = useRef([]); // Реф для хранения полигонов
  const [isMapsScriptReady, setIsMapsScriptReady] = useState(false);

  const handleClickCallback = (e) => {
    const target = e.get("target");
    const zoneIndex = polygonsRef.current.findIndex((polygon) => polygon === target);

    if (zoneIndex !== -1) {
      clickCallback(zoneIndex);
    }
  };

  const buildMainZones = () => {
    zones.forEach((item, index) => {
      const coords = JSON.parse(item.zone);
      const isActive = !!item.is_active;

      const polygon = new ymaps.Polygon(
        [coords],
        {
          geometry: { fillRule: "nonZero" },
          hintContent: `Зона ${index + 1}`,
        },
        {
          fillOpacity: 0.4,
          fillColor: isActive ? fillPrimaryActive : fillPrimaryInactive,
          strokeColor: isActive ? strokePrimaryActive : strokePrimaryInactive,
          strokeWidth: 5,
          // Делаем основные зоны более кликабельными
          interactivityModel: "default#transparent",
          cursor: "pointer",
          zIndex: isActive ? 1000 : 100, // Активные зоны поверх
        },
      );

      if (!readonly) {
        polygon.events.add("click", handleClickCallback);
      }

      mapRef.current.geoObjects.add(polygon);
      polygonsRef.current.push(polygon);
    });
  };

  const buildOtherZones = () => {
    otherZones.forEach((item, index) => {
      const coords = JSON.parse(item.zone);

      const polygon = new ymaps.Polygon(
        [coords],
        {
          hintContent: `Другая зона ${index + 1}`,
          // Отключаем взаимодействие для других зон
          interactivityModel: "default#silent",
        },
        {
          fillOpacity: 0.3, // Более прозрачные
          fillColor: fillSecondary,
          strokeColor: strokeSecondary,
          strokeWidth: 3,
          zIndex: 10, // Ниже основных зон
        },
      );

      mapRef.current.geoObjects.add(polygon);
      polygonsRef.current.push(polygon);
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
        },
      );

      polygonsRef.current = []; // Очищаем реф

      // зоны доставки точки
      zones?.length && buildMainZones();
      // другие зоны доставки
      otherZones?.length && buildOtherZones();

      isYm.current = true;
    });
  };

  const updateZones = () => {
    if (!mapRef.current || !isYm.current) {
      return;
    }

    // Удаляем все полигоны и очищаем реф
    mapRef.current.geoObjects.removeAll();
    polygonsRef.current = [];

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
    if (!window["ymaps"]) {
      return;
    }

    setIsMapsScriptReady(true);
  }, []);

  useEffect(() => {
    if (!isMapsScriptReady) {
      return;
    }

    createZones();

    return () => {
      mapRef.current?.destroy?.();
      mapRef.current = null;
      isYm.current = false;
      polygonsRef.current = [];
    };
  }, [isMapsScriptReady]);

  useEffect(() => {
    updateZones();
  }, [zones, otherZones]);

  return (
    <>
      <Script
        src="https://api-maps.yandex.ru/2.1/?apikey=665f5b53-8905-4934-9502-4a6a7b06a900&lang=ru_RU"
        strategy="afterInteractive"
        onReady={() => setIsMapsScriptReady(true)}
      />
      <div
        id="map"
        style={{ width: "100%", minHeight: "300px", height: "50dvh" }}
      ></div>
    </>
  );
};

export default memo(CafeEdit_ZonesMap);
