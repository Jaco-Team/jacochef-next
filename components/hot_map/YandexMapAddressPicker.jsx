import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  CircularProgress,
  Button,
  Stack,
  Chip,
  Alert,
} from "@mui/material";
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Clear as ClearIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

const YandexMapAddressPicker = ({ onAddressSelect, initialAddress = "", apiKey, centerMap }) => {
  const [searchQuery, setSearchQuery] = useState(initialAddress);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [placemark, setPlacemark] = useState(null);
  const [mapCenter, setMapCenter] = useState([49.417141, 53.509914]);
  const [mapZoom, setMapZoom] = useState(10);

  const mapContainerRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Инициализация Яндекс Карт
  useEffect(() => {
    if (!apiKey) return;

    // Загружаем скрипт Яндекс Карт
    const scriptId = "yandex-maps-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU&coordorder=longlat`;
      script.onload = () => {
        if (window.ymaps) {
          window.ymaps.ready(() => {
            setMapLoaded(true);
          });
        }
      };
      document.head.appendChild(script);
    } else if (window.ymaps) {
      window.ymaps.ready(() => {
        setMapLoaded(true);
      });
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [apiKey]);

  useEffect(() => {
    if (centerMap.length) {
      setMapCenter([centerMap[1], centerMap[0]]);
      setMapLoaded(true);
    }
  }, [centerMap]);

  // Инициализация карты
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current) return;

    const initMap = () => {
      const map = new window.ymaps.Map(mapContainerRef.current, {
        center: mapCenter,
        zoom: mapZoom,
        controls: ["zoomControl", "fullscreenControl"],
      });

      // Добавляем поиск на карту
      const searchControl = new window.ymaps.control.SearchControl({
        options: {
          provider: "yandex#search",
          noPlacemark: true,
          boundedBy: [
            [53.3, 49.1], // Юго-западная граница (приблизительно)
            [53.7, 49.7], // Северо-восточная граница (приблизительно)
          ],
        },
      });

      map.controls.add(searchControl);

      // Обработчик клика по карте
      map.events.add("click", async (e) => {
        const coords = e.get("coords");
        await handleMapClick(coords);
      });

      // Обработчик выбора из поиска
      searchControl.events.add("resultselect", async (e) => {
        const index = e.get("index");
        const results = searchControl.getResultsArray();
        if (results[index]) {
          const geoObject = results[index];
          await selectGeoObject(geoObject);
        }
      });

      setMapInstance(map);
    };

    initMap();
  }, [mapLoaded]);

  // Функция для получения подсказок
  const fetchSuggestions = async (query) => {
    if (!query.trim() || !window.ymaps) return;

    try {
      const response = await fetch(
        `https://suggest-maps.yandex.ru/v1/suggest?apikey=${apiKey}&text=${encodeURIComponent(query)}&lang=ru_RU&results=5`,
      );
      const data = await response.json();

      if (data.results) {
        setSuggestions(
          data.results.map((item) => ({
            value: item.title.text,
            unrestricted_value: item.subtitle?.text || "",
            data: item,
          })),
        );
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  // Обработчик ввода поиска
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 300);
    } else {
      setSuggestions([]);
    }
  };

  // Обработчик выбора подсказки
  const handleSuggestionClick = async (suggestion) => {
    setSearchQuery(suggestion.value);
    setSuggestions([]);
    setIsLoading(true);

    try {
      // Геокодируем адрес
      const geocodeResult = await window.ymaps.geocode(suggestion.value);
      const geoObject = geocodeResult.geoObjects.get(0);

      if (geoObject) {
        await selectGeoObject(geoObject);
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик клика по карте
  const handleMapClick = async (coords) => {
    if (!window.ymaps) return;

    setIsLoading(true);
    try {
      const geocodeResult = await window.ymaps.geocode(coords);
      const geoObject = geocodeResult.geoObjects.get(0);

      if (geoObject) {
        await selectGeoObject(geoObject);
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Выбор геообъекта
  const selectGeoObject = async (geoObject) => {
    const coords = geoObject.geometry.getCoordinates();
    const address = geoObject.getAddressLine();

    // Парсим компоненты адреса
    const addressDetails = geoObject.properties.getAll();
    const components = addressDetails.metaDataProperty?.GeocoderMetaData?.Address?.Components || [];

    const city = components.find((c) => c.kind === "locality")?.name;
    const street = components.find((c) => c.kind === "street")?.name;
    const house = components.find((c) => c.kind === "house")?.name;

    const selected = {
      address,
      coordinates: coords,
      city,
      street,
      house,
    };

    setSelectedAddress(selected);
    setMapCenter(coords);
    setMapZoom(17);

    // Обновляем карту
    if (mapInstance) {
      mapInstance.setCenter(coords, 17);

      // Удаляем старый маркер
      if (placemark) {
        mapInstance.geoObjects.remove(placemark);
      }

      // Добавляем новый маркер
      const newPlacemark = new window.ymaps.Placemark(
        coords,
        {
          balloonContent: address,
        },
        {
          preset: "islands#redIcon",
          draggable: true,
        },
      );

      newPlacemark.events.add("dragend", () => {
        const newCoords = newPlacemark.geometry.getCoordinates();
        handleMapClick(newCoords);
      });

      mapInstance.geoObjects.add(newPlacemark);
      setPlacemark(newPlacemark);
    }

    // Вызываем callback
    onAddressSelect(selected);
    setSearchQuery(address);
  };

  // Очистка выбора
  const handleClear = () => {
    setSearchQuery("");
    setSelectedAddress(null);
    setSuggestions([]);

    if (placemark && mapInstance) {
      mapInstance.geoObjects.remove(placemark);
      setPlacemark(null);
    }

    if (mapInstance) {
      mapInstance.setCenter([55.751574, 37.573856], 10);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Поле поиска */}
      <Box>
        {/* Подсказки */}
        {suggestions.length > 0 && (
          <Paper
            sx={{
              mt: 1,
              maxHeight: 200,
              overflow: "auto",
              position: "absolute",
              zIndex: 1000,
              width: "100%",
            }}
          >
            {suggestions.map((suggestion, index) => (
              <Box
                key={index}
                sx={{
                  p: 2,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "action.hover" },
                  borderBottom: index < suggestions.length - 1 ? "1px solid" : "none",
                  borderColor: "divider",
                }}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <Typography variant="body1">{suggestion.value}</Typography>
                {suggestion.unrestricted_value && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {suggestion.unrestricted_value}
                  </Typography>
                )}
              </Box>
            ))}
          </Paper>
        )}
      </Box>

      {/* Карта */}
      <Paper
        elevation={3}
        sx={{
          height: 400,
          overflow: "hidden",
          position: "relative",
        }}
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

        {/* Инструкция по использованию карты */}
        {mapLoaded && !selectedAddress && (
          <Box
            sx={{
              position: "absolute",
              bottom: 16,
              left: 16,
              bgcolor: "background.paper",
              p: 2,
              borderRadius: 1,
              boxShadow: 3,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Кликните на карте или используйте поиск для выбора адреса
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default YandexMapAddressPicker;
