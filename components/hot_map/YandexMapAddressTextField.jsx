import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
  Autocomplete,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

const YandexMapAddressTextField = ({
  onAddressSelect,
  initialAddress = "",
  apiKey,
  apiKeySuggest,
  centerMap,
  label = "Введите адрес",
  placeholder = "Начните вводить адрес...",
}) => {
  const [searchQuery, setSearchQuery] = useState(initialAddress);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [placemark, setPlacemark] = useState(null);
  const [mapCenter, setMapCenter] = useState([49.417141, 53.509914]); // Москва по умолчанию
  const [mapZoom, setMapZoom] = useState(12);

  const mapContainerRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Инициализация Яндекс Карт
  useEffect(() => {
    if (!apiKey) {
      console.error("API key is required for YandexMapAddressTextField");
      return;
    }

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
      script.onerror = () => {
        console.error("Failed to load Yandex Maps script");
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
        // Отключаем возможность клика по карте для выбора точки
        suppressMapOpenBlock: true,
      });

      // Убираем стандартный поиск с карты
      // Не добавляем SearchControl

      // ОТКЛЮЧАЕМ обработчик клика по карте
      // map.events.add('click', async (e) => {
      //   const coords = e.get('coords');
      //   await handleMapClick(coords);
      // });

      setMapInstance(map);
    };

    initMap();
  }, [mapLoaded]);

  // Функция для получения подсказок через Яндекс Suggest
  const fetchSuggestions = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://suggest-maps.yandex.ru/v1/suggest?apikey=${apiKeySuggest}&text=${encodeURIComponent(query)}&lang=ru_RU&results=8`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.results) {
        const formattedSuggestions = data.results.map((item) => ({
          id: item.id || Math.random().toString(36).substr(2, 9),
          title: item.title.text,
          subtitle: item.subtitle?.text || "",
          fullText: `${item.title.text}${item.subtitle?.text ? ", " + item.subtitle.text : ""}`,
          data: item,
        }));
        setSuggestions(formattedSuggestions);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    }
  };

  // Обработчик ввода поиска
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 300);
    } else {
      setSuggestions([]);
    }
  };

  // Обработчик выбора подсказки
  const handleSuggestionSelect = async (suggestion) => {
    if (!suggestion) return;

    setSearchQuery(suggestion.fullText);
    setSuggestions([]);
    setIsLoading(true);

    try {
      // Геокодируем адрес
      const geocodeResult = await window.ymaps.geocode(suggestion.fullText);
      const geoObject = geocodeResult.geoObjects.get(0);

      if (geoObject) {
        await selectGeoObject(geoObject);
      } else {
        throw new Error("Адрес не найден");
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
      alert("Не удалось найти указанный адрес. Пожалуйста, уточните запрос.");
    } finally {
      setIsLoading(false);
    }
  };

  // Выбор геообъекта и обновление карты
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
      fullAddress: address,
      lat: coords[0],
      lng: coords[1],
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
          hintContent: "Выбранный адрес",
        },
        {
          preset: "islands#redIcon",
          draggable: false, // Отключаем возможность перетаскивания
          iconColor: "#3f51b5",
        },
      );

      mapInstance.geoObjects.add(newPlacemark);
      setPlacemark(newPlacemark);

      // Открываем балун с адресом
      newPlacemark.balloon.open();
    }

    // Вызываем callback
    onAddressSelect(selected);
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
      mapInstance.setCenter([55.751574, 37.573856], 12);
    }

    onAddressSelect(null);
  };

  // Обработчик ручного ввода и поиска (при нажатии Enter)
  const handleManualSearch = async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      alert("Введите адрес для поиска (минимум 2 символа)");
      return;
    }

    setIsLoading(true);
    try {
      // Используем первую подсказку или ищем напрямую
      if (suggestions.length > 0) {
        await handleSuggestionSelect(suggestions[0]);
      } else {
        // Прямой геокодинг
        const geocodeResult = await window.ymaps.geocode(searchQuery);
        const geoObject = geocodeResult.geoObjects.get(0);

        if (geoObject) {
          await selectGeoObject(geoObject);
        } else {
          throw new Error("Адрес не найден");
        }
      }
    } catch (error) {
      console.error("Error searching address:", error);
      alert("Не удалось найти указанный адрес. Пожалуйста, уточните запрос.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Поле поиска с автодополнением */}
      <Box sx={{ position: "relative" }}>
        <TextField
          fullWidth
          label={label}
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleManualSearch();
            }
          }}
          disabled={isLoading || !mapLoaded}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {isLoading ? (
                  <CircularProgress size={20} />
                ) : searchQuery ? (
                  <IconButton
                    size="small"
                    onClick={handleClear}
                    edge="end"
                  >
                    <ClearIcon />
                  </IconButton>
                ) : null}
              </InputAdornment>
            ),
          }}
          variant="outlined"
          helperText="Введите полный адрес или начните вводить для получения подсказок"
        />

        {/* Подсказки */}
        {suggestions.length > 0 && (
          <Paper
            elevation={3}
            sx={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 1300,
              mt: 0.5,
              maxHeight: 300,
              overflow: "auto",
              border: 1,
              borderColor: "divider",
            }}
          >
            {suggestions.map((suggestion) => (
              <Box
                key={suggestion.id}
                sx={{
                  p: 2,
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "action.hover",
                    backgroundColor: "primary.light",
                    color: "primary.contrastText",
                  },
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  transition: "background-color 0.2s",
                }}
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                <Typography
                  variant="body1"
                  fontWeight="medium"
                >
                  {suggestion.title}
                </Typography>
                {suggestion.subtitle && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {suggestion.subtitle}
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
          border: 1,
          borderColor: "divider",
        }}
      >
        <div
          ref={mapContainerRef}
          style={{
            width: "100%",
            height: "100%",
            cursor: "default", // Меняем курсор на стандартный
          }}
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
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "background.paper",
              gap: 2,
            }}
          >
            <CircularProgress />
            <Typography color="text.secondary">Загрузка карты...</Typography>
          </Box>
        )}

        {/* Сообщение о выбранном адресе */}
        {mapLoaded && selectedAddress && (
          <Box
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              bgcolor: "background.paper",
              p: 2,
              borderRadius: 1,
              boxShadow: 3,
              maxWidth: "80%",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <CheckCircleIcon
              color="success"
              fontSize="small"
            />
            <Typography
              variant="body2"
              fontWeight="medium"
            >
              {selectedAddress.address}
            </Typography>
          </Box>
        )}

        {/* Инструкция по использованию карты */}
        {mapLoaded && !selectedAddress && (
          <Box
            sx={{
              position: "absolute",
              bottom: 16,
              left: "50%",
              transform: "translateX(-50%)",
              bgcolor: "background.paper",
              p: 2,
              borderRadius: 1,
              boxShadow: 3,
              textAlign: "center",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Введите адрес в поле поиска выше для отображения на карте
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default YandexMapAddressTextField;
