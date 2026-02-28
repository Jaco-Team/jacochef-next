import { useMemo, useState, useEffect } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import TextField from "@mui/material/TextField";
import * as React from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CircularProgress from "@mui/material/CircularProgress";
import { api_laravel, api_laravel_local } from "@/src/api_new";

export const StarIcon = ({ isActive = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: "pointer" }}
    >
      <path
        d="M8.48652 0.857787L10.3037 4.52636C10.345 4.61947 10.41 4.70013 10.4922 4.76029C10.5744 4.82044 10.671 4.858 10.7722 4.86922L14.7837 5.4635C14.8998 5.47843 15.0093 5.5261 15.0994 5.60094C15.1895 5.67578 15.2564 5.7747 15.2923 5.88614C15.3283 5.99759 15.3318 6.11697 15.3024 6.23034C15.2731 6.3437 15.212 6.44637 15.1265 6.52636L12.2351 9.39493C12.1613 9.46388 12.1059 9.55018 12.074 9.64599C12.042 9.7418 12.0346 9.84407 12.0522 9.9435L12.7494 13.9778C12.7696 14.0937 12.7568 14.213 12.7126 14.322C12.6683 14.431 12.5943 14.5254 12.4991 14.5945C12.4038 14.6636 12.2911 14.7045 12.1737 14.7127C12.0563 14.7208 11.939 14.6959 11.8351 14.6406L8.22366 12.7321C8.13118 12.6867 8.02954 12.6631 7.92652 12.6631C7.8235 12.6631 7.72185 12.6867 7.62937 12.7321L4.01795 14.6406C3.91405 14.6959 3.79673 14.7208 3.67935 14.7127C3.56196 14.7045 3.44923 14.6636 3.35396 14.5945C3.2587 14.5254 3.18473 14.431 3.14048 14.322C3.09623 14.213 3.08347 14.0937 3.10366 13.9778L3.8008 9.89779C3.81847 9.79835 3.811 9.69608 3.77906 9.60027C3.74713 9.50446 3.69174 9.41816 3.61795 9.34922L0.692231 6.52636C0.605674 6.44418 0.544802 6.33867 0.51699 6.2226C0.489177 6.10654 0.495618 5.9849 0.53553 5.87241C0.575443 5.75993 0.647116 5.66144 0.741866 5.58886C0.836617 5.51628 0.950379 5.47274 1.06937 5.4635L5.0808 4.86922C5.18206 4.858 5.2786 4.82044 5.36082 4.76029C5.44303 4.70013 5.50805 4.61947 5.54937 4.52636L7.36652 0.857787C7.416 0.75094 7.49502 0.660479 7.59425 0.597083C7.69347 0.533686 7.80877 0.5 7.92652 0.5C8.04427 0.5 8.15956 0.533686 8.25879 0.597083C8.35801 0.660479 8.43703 0.75094 8.48652 0.857787Z"
        fill={isHovered || isActive ? "#DD1A32" : "white"}
        stroke={isHovered || isActive ? "#DD1A32" : "#C9C9C9"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const SearchAutocomplete = ({
  catMenu,
  closeMenu,
  navs,
  conts,
  loadFavorites,
  favoritesParam,
  getModules,
}) => {
  const [expandedParents, setExpandedParents] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  useEffect(() => {
    setFavorites(favoritesParam || []);
  }, [favoritesParam]);

  // Добавление в избранное
  const addFavorite = async (child) => {
    setLoading(true);
    try {
      const description =
        child.conts_id
          ?.split(",")
          .map((a) => {
            return conts.find((i) => i.id == a)?.name;
          })
          .join(",") || "";

      const response = await api_laravel("home", "add_favorite", {
        module_id: child.id,
        module_name: child.name,
        module_key: child.key_query,
        module_description: description,
        module_navs: child.navs_id,
      });

      if (response?.data?.st) {
        setTimeout(() => getModules(), 500);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Ошибка при добавлении в избранное:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Удаление из избранного
  const removeFavorite = async (childId) => {
    setLoading(true);
    try {
      const response = await api_laravel("home", "remove_favorite", {
        module_id: childId,
      });

      if (response?.data?.st) {
        setTimeout(() => getModules(), 500);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Ошибка при удалении из избранного:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  // Обработчик клика по звездочке
  const toggleFavorite = async (child, event) => {
    event.stopPropagation();

    const isAlreadyFavorite = favorites.some(
      (fav) => Number(fav?.id) === Number(child.id) || Number(fav?.module_id) === Number(child.id),
    );

    if (isAlreadyFavorite) {
      await removeFavorite(child.id);
    } else {
      await addFavorite(child);
    }
  };

  // Функция для проверки, находится ли элемент в избранном
  const isFavorite = (childId) => {
    return favorites.some(
      (fav) => Number(fav?.id) === Number(childId) || Number(fav?.module_id) === Number(childId),
    );
  };

  const parseNavsId = (navsIdString) => {
    if (!navsIdString || navsIdString === "") return [];
    return navsIdString.split(",").map((id) => ({
      id: id.trim(),
      name: navs.find((i) => i.id == id)?.name,
      key_query: null,
    }));
  };

  const preparedData = useMemo(() => {
    return catMenu.map((item) => ({
      ...item.parent,
      id: item.parent.id,
      isParent: true,
      children: item.chaild.map((child) => ({
        ...child,
        navs_id: parseNavsId(child.navs_id),
      })),
    }));
  }, [catMenu]);

  const handleParentClick = (parentId, event) => {
    event.stopPropagation();
    setExpandedParents((prev) => ({
      ...prev,
      [parentId]: !prev[parentId],
    }));
  };

  const filterOptions = (options, { inputValue }) => {
    const searchTerm = inputValue.toLowerCase().trim();
    if (!searchTerm) return options;

    return options.filter((parent) => {
      if (parent.name.toLowerCase().includes(searchTerm)) {
        return true;
      }
      return parent.children.some(
        (child) =>
          child.name.toLowerCase().includes(searchTerm) ||
          (child.navs_id &&
            Array.isArray(child.navs_id) &&
            child.navs_id.some((nav) => nav.name.toLowerCase().includes(searchTerm))),
      );
    });
  };

  return (
    <Autocomplete
      size="small"
      freeSolo
      options={preparedData}
      filterOptions={filterOptions}
      loading={favoritesLoading}
      onChange={(event, newValue) => {
        if (newValue && newValue.key_query) {
          window.location = "/" + newValue.key_query;
          return;
        }
      }}
      style={{ width: "100%" }}
      renderOption={(props, parent, { inputValue }) => {
        const searchTerm = inputValue.toLowerCase();
        const isExpanded = expandedParents[parent.id];

        const filteredChildren = searchTerm
          ? parent.children.filter(
              (child) =>
                child.name.toLowerCase().includes(searchTerm) ||
                (child.navs_id &&
                  Array.isArray(child.navs_id) &&
                  child.navs_id.some((nav) => nav.name.toLowerCase().includes(searchTerm))),
            )
          : parent.children;

        const uniqueKey = `parent_${parent.id}`;

        return (
          <Box
            component="li"
            {...props}
            key={uniqueKey}
            onClick={(e) => e.stopPropagation()}
            sx={{
              padding: 0,
              fontSize: "14px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              width: "100%",
              borderTop: "1px solid #E5E5E5",
              "&:hover": {
                backgroundColor: "transparent",
              },
            }}
          >
            <Box
              onClick={(e) => handleParentClick(parent.id, e)}
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                minHeight: "28px",
                backgroundColor: "transparent",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "transparent",
                },
              }}
            >
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: 400,
                  color: "#3C3B3B",
                  flex: 1,
                }}
              >
                {parent.name}
              </span>
              <Box
                sx={{
                  width: "32px",
                  height: "100%",
                  minHeight: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 1,
                  flexShrink: 0,
                }}
              >
                {isExpanded ? (
                  <ExpandMoreIcon style={{ color: "#A6A6A6", rotate: "180deg" }} />
                ) : (
                  <ExpandMoreIcon style={{ color: "#A6A6A6" }} />
                )}
              </Box>
            </Box>

            <Collapse
              in={isExpanded || searchTerm !== ""}
              timeout="auto"
              unmountOnExit
              sx={{ width: "100%" }}
            >
              <Box sx={{ width: "100%" }}>
                {filteredChildren.map((child, index) => {
                  const childKey = `child_${child.id}_${index}`;
                  const isChildMatch = searchTerm && child.name.toLowerCase().includes(searchTerm);
                  const hasMatchingNavs =
                    child.navs_id &&
                    Array.isArray(child.navs_id) &&
                    child.navs_id.some((nav) => nav.name.toLowerCase().includes(searchTerm));
                  const isFavoriteItem = isFavorite(child.id);

                  if (searchTerm && !isChildMatch && !hasMatchingNavs) {
                    return null;
                  }

                  return (
                    <Box
                      key={childKey}
                      sx={{
                        padding: "12px",
                        width: "100%",
                        backgroundColor: "#FFFFFF",
                        cursor: "pointer",
                        maxWidth: "520px",
                        borderRadius: "8px",
                        marginBottom: "8px",
                        opacity: loading ? 0.7 : 1,
                        position: "relative",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (child.key_query) {
                          window.location = "/" + child.key_query;
                          closeMenu();
                        }
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: child.navs_id?.length ? "4px" : 0,
                          justifyContent: "space-between",
                        }}
                      >
                        <span style={{ fontWeight: 400, color: "#5E5E5E" }}>{child.name}</span>
                        <span
                          style={{
                            marginRight: "15px",
                            fontSize: "14px",
                            cursor: loading ? "wait" : "pointer",
                            paddingTop: "6px",
                          }}
                          onClick={(e) => !loading && toggleFavorite(child, e)}
                        >
                          {loading ? (
                            <CircularProgress size={16} />
                          ) : (
                            <StarIcon isActive={isFavoriteItem} />
                          )}
                        </span>
                      </div>

                      {child.navs_id &&
                        Array.isArray(child.navs_id) &&
                        child.navs_id.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              alignItems: "start",
                              gap: "8px",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#666",
                                marginRight: "4px",
                                display: "flex",
                                alignItems: "center",
                                paddingTop: "8px",
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                              >
                                <g clipPath="url(#clip0_74_3936)">
                                  <path
                                    d="M12 13.1428L15.4286 9.71422L12 6.28564"
                                    stroke="#C9C9C9"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M0.571533 2.85718V5.14289C0.571533 6.35531 1.05316 7.51807 1.91047 8.37538C2.76778 9.23269 3.93054 9.71432 5.14296 9.71432H15.4287"
                                    stroke="#C9C9C9"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </g>
                                <defs>
                                  <clipPath id="clip0_74_3936">
                                    <rect
                                      width="16"
                                      height="16"
                                      fill="white"
                                    />
                                  </clipPath>
                                </defs>
                              </svg>
                            </div>
                            {child.navs_id.map((nav, navIndex) => (
                              <span
                                key={`${childKey}_nav_${navIndex}`}
                                className="text-14px"
                                style={{
                                  padding: "4px",
                                  backgroundColor: "#E3F2FD",
                                  color: "#1977D2",
                                  borderRadius: "8px",
                                  height: "20px",
                                  fontWeight: 400,
                                  border: "1px solid #BCDEFB",
                                  cursor: "pointer",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                {nav.name}
                              </span>
                            ))}
                          </div>
                        )}
                    </Box>
                  );
                })}

                {filteredChildren.length === 0 && searchTerm && (
                  <Box
                    sx={{
                      padding: "16px",
                      textAlign: "center",
                      color: "#999",
                      fontStyle: "italic",
                    }}
                  >
                    Нет совпадений
                  </Box>
                )}
              </Box>
            </Collapse>
          </Box>
        );
      }}
      ListboxProps={{
        sx: {
          maxHeight: "700px",
          overflowY: "scroll",
          scrollbarWidth: "none",
        },
      }}
      slotProps={{
        paper: {
          sx: {
            backgroundColor: "#F3F3F3",
            border: "1px solid #E5E5E5",
            borderRadius: "12px",
            padding: "16px",
            marginTop: "4px",
          },
        },
        popupIndicator: {
          sx: {
            color: "#A6A6A6",
            "&:hover": {
              backgroundColor: "transparent",
              color: "#3C3B3B",
            },
          },
        },
        clearIndicator: {
          sx: {
            color: "#A6A6A6",
            "&:hover": {
              backgroundColor: "transparent",
              color: "#3C3B3B",
            },
          },
        },
      }}
      getOptionKey={(option) => `parent_${option.id}`}
      isOptionEqualToValue={(option, value) => option.id === value?.id}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Поиск"
          variant="outlined"
          autoComplete="off"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {favoritesLoading ? (
                  <CircularProgress
                    color="inherit"
                    size={20}
                  />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          inputProps={{
            ...params.inputProps,
            autoComplete: "off",
            autoCorrect: "off",
            autoCapitalize: "off",
            spellCheck: "false",
            form: "autocomplete-form",
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              color: "#666666",
              height: "52px",
              backgroundColor: "#F3F3F3",
              "&:hover": {
                backgroundColor: "#F3F3F3",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "none",
                },
              },
              "&.Mui-focused": {
                color: "#666666",
                backgroundColor: "#F3F3F3",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#E5E5E5",
                  borderWidth: "2px",
                },
              },
              "&.Mui-disabled": {
                backgroundColor: "#F5F5F5",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(0, 0, 0, 0.12)",
                },
              },
            },
            "& .MuiInputLabel-root": {
              color: "#A6A6A6",
              fontSize: "24px",
              backgroundColor: "#F3F3F3",
              paddingInline: "12px",
              paddingTop: "5px",
              borderRadius: "12px",
              "&.Mui-focused": {
                color: "#A6A6A6",
              },
              "&.Mui-disabled": {
                color: "rgba(0, 0, 0, 0.38)",
              },
            },
            "& .MuiOutlinedInput-notchedOutline": {
              display: "none",
            },
          }}
        />
      )}
      autoComplete={false}
      autoHighlight={false}
      clearOnBlur={false}
    />
  );
};
