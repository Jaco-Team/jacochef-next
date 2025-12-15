import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
  Button,
  Stack,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  LocationOn as LocationIcon,
  Clear as ClearIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

const YandexMapAddressPicker = ({
  onAddressSelect,
  onMultipleAddressesSelect,
  initialAddress = "",
  apiKey,
  centerMap,
  allowMultiple = true,
  maxMarkers = 10,
}) => {
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedAddresses, setSelectedAddresses] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const mapContainerRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Цвета для меток
  const markerColors = [
    "islands#redIcon",
    "islands#blueIcon",
    "islands#darkOrangeIcon",
    "islands#nightIcon",
    "islands#darkBlueIcon",
    "islands#pinkIcon",
    "islands#grayIcon",
    "islands#brownIcon",
    "islands#darkGreenIcon",
    "islands#violetIcon",
  ];

  // === Загрузка API ===
  useEffect(() => {
    if (!apiKey || isInitializedRef.current) return;

    const scriptId = "yandex-maps-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU&coordorder=longlat`;
      script.onload = () => {
        if (window.ymaps) {
          window.ymaps.ready(() => {
            setMapLoaded(true);
            isInitializedRef.current = true;
          });
        }
      };
      document.head.appendChild(script);
    } else if (window.ymaps) {
      window.ymaps.ready(() => {
        setMapLoaded(true);
        isInitializedRef.current = true;
      });
    }
  }, [apiKey]);

  // === Инициализация карты ===
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current) return;

    const center = centerMap?.length ? [centerMap[1], centerMap[0]] : [53.5165, 49.3895];
    const zoom = centerMap?.length ? 15 : 10;

    const map = new window.ymaps.Map(mapContainerRef.current, {
      center,
      zoom,
      controls: ["zoomControl", "fullscreenControl", "typeSelector", "routeButtonControl"],
    });

    // Клик по карте
    map.events.add("click", async (e) => {
      const coords = e.get("coords");
      await handleMapClick(coords);
    });

    setMapInstance(map);
    return () => {
      map.destroy();
    };
  }, [mapLoaded]);

  // === Синхронизация меток с selectedAddresses ===
  useEffect(() => {
    if (!mapInstance) return;

    // Удаляем все старые метки
    mapInstance.geoObjects.removeAll();

    // Создаем новые метки
    const newPlacemarks = selectedAddresses.map((addr, index) => {
      const color = markerColors[index % markerColors.length];
      const placemark = new window.ymaps.Placemark(
        addr.coordinates,
        {
          balloonContentHeader: `Точка ${index + 1}`,
          balloonContentBody: addr.address || "Адрес не определен",
          balloonContentFooter: `
            <div style="display: flex; gap: 10px; margin-top: 10px;">
              <button class="ymaps-balloon-button edit-btn" data-index="${index}">
                <i style="margin-right: 5px;">✏️</i>Изменить
              </button>
              <button class="ymaps-balloon-button delete-btn" data-index="${index}" style="color: #f44336;">
                <i style="margin-right: 5px;">🗑️</i>Удалить
              </button>
            </div>
          `,
          iconCaption: `Точка ${index + 1}`,
        },
        {
          preset: color,
          draggable: true,
          hasBalloon: true,
        },
      );

      placemark.events.add("dragend", (e) => {
        const newCoords = placemark.geometry.getCoordinates();
        updateAddressCoordinates(index, newCoords);
      });

      return placemark;
    });

    newPlacemarks.forEach((p) => mapInstance.geoObjects.add(p));
  }, [selectedAddresses, mapInstance]);

  // === Клик по карте ===
  const handleMapClick = async (coords) => {
    if (!window.ymaps) return;
    setIsLoading(true);
    try {
      const geocodeResult = await window.ymaps.geocode(coords);
      const geoObject = geocodeResult.geoObjects.get(0);
      if (!geoObject) return;

      let address = "Адрес не определен";
      try {
        address = geoObject.getAddressLine();
      } catch (e) {}

      const addressDetails = geoObject.properties.getAll();
      const components =
        addressDetails.metaDataProperty?.GeocoderMetaData?.Address?.Components || [];
      const city = components.find((c) => c.kind === "locality")?.name;
      const street = components.find((c) => c.kind === "street")?.name;
      const house = components.find((c) => c.kind === "house")?.name;

      const addressData = {
        address,
        coordinates: coords,
        city: city || "",
        street: street || "",
        house: house || "",
        timestamp: new Date().toISOString(),
      };

      if (allowMultiple) {
        setSelectedAddresses((prev) => {
          if (prev.length >= maxMarkers) {
            return prev;
          }
          const updated = [...prev, addressData];
          onMultipleAddressesSelect?.(updated);
          return updated;
        });
      } else {
        const single = [addressData];
        setSelectedAddress(addressData);
        setSelectedAddresses(single);
        onAddressSelect?.(addressData);
      }

      if (mapInstance) {
        mapInstance.setCenter(coords, 17);
      }
    } catch (error) {
      console.error("Ошибка геокодирования:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // === Обновление координат метки (при перетаскивании) ===
  const updateAddressCoordinates = useCallback(
    async (index, newCoords) => {
      setIsLoading(true);
      try {
        const geocodeResult = await window.ymaps.geocode(newCoords);
        const geoObject = geocodeResult.geoObjects.get(0);
        let address = "Адрес не определен";
        if (geoObject) {
          try {
            address = geoObject.getAddressLine();
          } catch (e) {}
        }

        setSelectedAddresses((prev) => {
          const updated = [...prev];
          updated[index] = { ...updated[index], coordinates: newCoords, address };
          if (allowMultiple) {
            onMultipleAddressesSelect?.(updated);
          } else {
            onAddressSelect?.(updated[0]);
          }
          return updated;
        });
      } catch (error) {
        console.error("Ошибка обновления координат:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [allowMultiple, onMultipleAddressesSelect, onAddressSelect],
  );

  // === Удаление метки ===
  const deletePlacemark = (index) => {
    const updated = selectedAddresses.filter((_, i) => i !== index);
    setSelectedAddresses(updated);

    if (allowMultiple) {
      onMultipleAddressesSelect?.(updated);
    } else {
      if (updated.length === 0) {
        setSelectedAddress(null);
        onAddressSelect?.(null);
      } else {
        onAddressSelect?.(updated[0]);
        setSelectedAddress(updated[0]);
      }
    }
  };

  // === Очистка всех точек ===
  const handleClearAll = () => {
    setSelectedAddresses([]);
    setSelectedAddress(null);
    if (allowMultiple) {
      onMultipleAddressesSelect?.([]);
    } else {
      onAddressSelect?.(null);
    }
  };

  // === Обновление центра карты при изменении centerMap ===
  useEffect(() => {
    if (centerMap?.length && mapInstance) {
      const newCenter = [centerMap[1], centerMap[0]];
      mapInstance.setCenter(newCenter, 15);
    }
  }, [centerMap, mapInstance]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Панель управления */}
      {allowMultiple && (
        <Stack
          direction="row"
          justifyContent="flex-end"
        >
          <Tooltip title={`Можно добавить до ${maxMarkers} точек`}>
            <Chip
              label={`Точек: ${selectedAddresses.length}/${maxMarkers}`}
              color={selectedAddresses.length >= maxMarkers ? "error" : "primary"}
              variant="outlined"
            />
          </Tooltip>
        </Stack>
      )}

      {/* Карта */}
      <Paper
        elevation={3}
        sx={{ height: 400, overflow: "hidden", position: "relative" }}
      >
        <div
          ref={mapContainerRef}
          style={{ width: "100%", height: "100%" }}
        />
        {!mapLoaded && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "background.paper",
            }}
          >
            <CircularProgress />
          </Box>
        )}
        {mapLoaded && selectedAddresses.length === 0 && (
          <Box
            sx={{
              position: "absolute",
              bottom: 16,
              left: 16,
              bgcolor: "background.paper",
              p: 2,
              borderRadius: 1,
              boxShadow: 3,
              maxWidth: 300,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
            >
              {allowMultiple
                ? "Кликните на карте для добавления точек. Можно перетаскивать метки."
                : "Кликните на карте для выбора адреса"}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Список выбранных точек */}
      {allowMultiple && selectedAddresses.length > 0 && (
        <Paper
          elevation={2}
          sx={{ p: 2 }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Выбранные точки ({selectedAddresses.length})</Typography>
            <Button
              startIcon={<ClearIcon />}
              size="small"
              onClick={handleClearAll}
              color="error"
              variant="outlined"
            >
              Очистить все
            </Button>
          </Stack>
          <List dense>
            {selectedAddresses.map((address, index) => (
              <React.Fragment key={index}>
                <ListItem
                  secondaryAction={
                    <Tooltip title="Удалить">
                      <IconButton
                        edge="end"
                        onClick={() => deletePlacemark(index)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  }
                >
                  <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
                    <Chip
                      label={index + 1}
                      size="small"
                      sx={{
                        bgcolor: markerColors[index % markerColors.length].includes("red")
                          ? "#f44336"
                          : markerColors[index % markerColors.length].includes("blue")
                            ? "#2196f3"
                            : markerColors[index % markerColors.length].includes("orange")
                              ? "#ff9800"
                              : "#757575",
                        color: "white",
                      }}
                    />
                  </Box>
                  <ListItemText
                    primary={address.address || "Адрес не определен"}
                    secondary={
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Координаты: {address.coordinates[0].toFixed(6)},{" "}
                        {address.coordinates[1].toFixed(6)}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < selectedAddresses.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {!allowMultiple && selectedAddress && (
        <Alert
          severity="success"
          icon={<CheckCircleIcon />}
          action={
            <IconButton
              size="small"
              onClick={handleClearAll}
            >
              <ClearIcon />
            </IconButton>
          }
        >
          <Typography variant="body2">
            <strong>Выбранный адрес:</strong> {selectedAddress.address}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Координаты: {selectedAddress.coordinates[0].toFixed(6)},{" "}
            {selectedAddress.coordinates[1].toFixed(6)}
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default YandexMapAddressPicker;
