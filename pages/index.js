import * as React from "react";
import Container from "@mui/material/Container";
import { api_laravel, api_laravel_local } from "@/src/api_new";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import Collapse from "@mui/material/Collapse";
import { SearchAutocomplete, StarIcon } from "@/ui/Forms/SearchAutocomplete";
import { Grid, Paper, Typography, Box, Chip, IconButton } from "@mui/material";
import Button from "@mui/material/Button";
import { ModalAddLog } from "@/components/general/ModalAddLog";
import AddIcon from "@mui/icons-material/Add";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ModalAccept } from "@/components/general/ModalAccept";
import EditIcon from "@mui/icons-material/Edit";
import { ModalEditLog } from "@/components/general/ModaEditLog";
import CloseIcon from "@mui/icons-material/Close";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import MyAlert from "@/ui/MyAlert";

const SortableItem = ({ module, onFavoriteClick, loading }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: module.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.88 : 1,
    cursor: isDragging ? "grabbing" : "default",
    height: "100%",
    display: "flex",
    position: "relative",
    zIndex: isDragging ? 9999 : "auto",
  };

  const [modules, setModules] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);

  const save = () => {
    onFavoriteClick(modules);
  };

  const tags = module.navs_id || [];
  const hasTags = tags.length > 0;
  const visibleTags = isTagsExpanded ? tags : [];

  return (
    <Grid
      item
      xs={12}
      sm={6}
      md={6}
      lg={4}
      xl={3}
      ref={setNodeRef}
      style={style}
      {...attributes}
      sx={{
        display: "flex",
        alignItems: "stretch",
        height: "100%",
      }}
    >
      {openModal ? (
        <ModalAccept
          open={openModal}
          onClose={() => setOpenModal(false)}
          title={"Удалить избранное"}
          save={save}
          loading={loading}
        />
      ) : null}

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          padding: "10px 14px",
          height: "100%",
          width: "100%",
          backgroundColor: "#fff",
          border: isDragging ? "2px solid #1977D2" : "1px solid #e5e5e5",
          boxShadow: isDragging ? "0 20px 40px rgba(0,0,0,0.22)" : "none",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          },
          position: "relative",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          opacity: loading ? 0.7 : 1,
        }}
      >
        <Box
          {...listeners}
          sx={{
            position: "absolute",
            top: "10px",
            left: "4px",
            cursor: loading ? "wait" : "grab",
            touchAction: "none",
            color: "#A6A6A6",
            "&:hover": { color: "#1977D2" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "24px",
            height: "24px",
            borderRadius: "4px",
            zIndex: 1,
          }}
        >
          {loading ? <CircularProgress size={16} /> : <DragIndicatorIcon fontSize="small" />}
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: { xs: 1.2, md: 0.5 },
            pl: 3,
            flexShrink: 0,
            pr: 0.5,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: "16px",
              fontWeight: 500,
              color: "#333",
              pr: 2,
              cursor: loading ? "wait" : "pointer",
              "&:hover": { color: "#1977D2" },
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (!loading && module.key_query) {
                window.location = "/" + module.key_query;
              }
            }}
          >
            {module.name}
          </Typography>
          <Box sx={{ width: 30, display: "flex", justifyContent: "center", flexShrink: 0 }}>
            <IconButton
              size="small"
              sx={{ p: 0.5 }}
              onClick={(e) => {
                e.stopPropagation();
                if (!loading) {
                  setModules(module);
                  setOpenModal(true);
                }
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={16} /> : <StarIcon isActive={true} />}
            </IconButton>
          </Box>
        </Box>

        <Box
          sx={{
            mb: 1,
            pl: 3,
            pr: 0.5,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "#666",
              fontSize: "13px",
              lineHeight: 1.3,
              maxWidth: "358px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              minHeight: "32px",
              flex: 1,
            }}
          >
            {module.description || ""}
          </Typography>

          {hasTags && (
            <Box sx={{ width: 30, display: "flex", justifyContent: "center", flexShrink: 0 }}>
              <IconButton
                size="small"
                disabled={loading}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!loading) {
                    setIsTagsExpanded((prev) => !prev);
                  }
                }}
                sx={{
                  color: "#1977D2",
                  border: "1px solid #BCDEFB",
                  bgcolor: "#E3F2FD",
                  width: 22,
                  height: 22,
                  mt: { xs: 0.6, md: 0.1 },
                  "&:hover": { bgcolor: "#BBDEFB" },
                }}
              >
                {isTagsExpanded ? (
                  <KeyboardArrowUpRoundedIcon fontSize="small" />
                ) : (
                  <KeyboardArrowDownRoundedIcon fontSize="small" />
                )}
              </IconButton>
            </Box>
          )}
        </Box>

        {isTagsExpanded && hasTags && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 0.75,
              ml: 3,
              mt: 0.75,
              pt: 0.75,
              borderTop: "1px solid #F3F3F3",
              maxWidth: "358px",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            {visibleTags.map((tag, index) => (
              <Chip
                key={index}
                label={tag.name}
                size="small"
                sx={{
                  backgroundColor: "#E3F2FD",
                  color: "#1977D2",
                  border: "1px solid #BCDEFB",
                  borderRadius: "8px",
                  fontSize: "0.65rem",
                  fontWeight: 400,
                  height: "20px",
                  "&:hover": { backgroundColor: "#BBDEFB" },
                }}
              />
            ))}
          </Box>
        )}
      </Paper>
    </Grid>
  );
};

export default function Index() {
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [catMenu, setCatMenu] = useState([]);
  const [fullMenu, setFullMenu] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openNews, setOpenNews] = useState(false);
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [navs, setNavs] = useState([]);
  const [changelog, setChangelog] = useState([]);
  const [openAlert, setOpenAlert] = useState(false);
  const [errStatus, setErrStatus] = useState(false);
  const [errText, setErrText] = useState("");
  const [my, setMy] = useState({});
  const [conts, setConts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(5);
  const [loadingMore, setLoadingMore] = useState(false);
  const newsContainerRef = React.useRef(null);

  const [isClient, setIsClient] = useState(false);
  const [modules, setModules] = useState([]);
  const [module, setModule] = useState({});
  const [moduleOrder, setModuleOrder] = useState([]);
  const [acces, setAcces] = useState({});
  const [windowWidth, setWindowWidth] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const scrollContainerRef = useRef(null);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setTouchStart(touch.clientY);
    setTouchEnd(touch.clientY);
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    setTouchEnd(touch.clientY);

    const container = scrollContainerRef.current;
    if (container && container.scrollTop <= 0) {
      const currentY = touch.clientY;
      const diff = currentY - touchStart;

      if (diff > 0) {
        e.preventDefault();
        const maxOffset = Math.round(window.innerHeight * 0.9);
        setSwipeOffset(Math.min(diff, maxOffset));
      }
    }
  };

  const handleTouchEnd = () => {
    const diff = touchEnd - touchStart;

    if (diff > 100) {
      setOpenNews(false);
      setDisplayCount(7);
      setSwipeOffset(0);
    } else {
      setSwipeOffset(0);
    }

    setIsSwiping(false);
    setTouchStart(0);
    setTouchEnd(0);
  };

  const loadFavorites = useCallback(async () => {
    if (!my?.id) return;

    setFavoritesLoading(true);
    try {
      const response = await getData("get_favorites");
      if (response?.st && response.favorites) {
        const formattedFavorites = response.favorites.map((fav) => ({
          id: fav.module_id,
          name: fav.module_name,
          key_query: fav.module_key,
          description: fav.module_description,
          navs_id: fav.module_navs || [],
          isFavorite: true,
          sort: fav.sort,
          favorite_id: fav.id,
        }));

        const sorted = formattedFavorites.sort((a, b) => a.sort - b.sort);
        setModules(sorted);
        setModuleOrder(sorted.map((m) => m.id));
      }
    } catch (error) {
      console.error("Ошибка при загрузке избранного:", error);
      showAlert(false, "Ошибка при загрузке избранного");
    } finally {
      setFavoritesLoading(false);
    }
  }, [my?.id]);

  const removeFavorite = async (moduleId) => {
    setFavoritesLoading(true);
    try {
      const response = await getData("remove_favorite", {
        module_id: moduleId,
      });

      if (response?.st) {
        await loadFavorites();
        showAlert(true, "Модуль удален из избранного");
        return true;
      } else {
        showAlert(false, response?.text || "Ошибка при удалении");
        return false;
      }
    } catch (error) {
      console.error("Ошибка при удалении из избранного:", error);
      showAlert(false, "Ошибка при удалении из избранного");
      return false;
    } finally {
      setFavoritesLoading(false);
    }
  };

  const updateFavoritesOrder = async (orderedModules) => {
    try {
      const orderData = orderedModules.map((m) => m.id);
      await getData("update_order", {
        order: orderData,
      });
    } catch (error) {
      console.error("Ошибка при обновлении порядка:", error);
    }
  };

  const handleNewsScroll = (e) => {
    const container = e.target;
    const scrollThreshold = 100;

    if (
      container.scrollHeight - container.scrollTop - container.clientHeight < scrollThreshold &&
      !loadingMore &&
      displayCount < changelog.length
    ) {
      setLoadingMore(true);

      setTimeout(() => {
        setDisplayCount((prev) => Math.min(prev + 5, changelog.length));
        setLoadingMore(false);
      }, 500);
    }
  };

  useEffect(() => {
    setDisplayCount(8);
  }, [changelog]);

  const getDeviceType = () => {
    if (!isClient) return "desktop";
    if (windowWidth < 600) return "mobile";
    if (windowWidth < 960) return "tablet";
    if (windowWidth < 1280) return "smallDesktop";
    return "desktop";
  };

  const deviceType = getDeviceType();
  const isMobile = deviceType === "mobile";
  const isTablet = deviceType === "tablet";
  const isSmallDesktop = deviceType === "smallDesktop";
  const isDesktop = deviceType === "desktop";

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 120,
        tolerance: 8,
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const getData = async (method, data = {}) => {
    setLoading(true);
    try {
      const result = await api_laravel("header", method, data);
      if (result?.data?.text) {
        setErrStatus(result.data?.st);
        setErrText(result.data?.text);
        setOpenAlert(true);
      }

      return result.data;
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (status, text) => {
    setErrStatus(status);
    setErrText(text);
    setOpenAlert(true);
  };

  async function loadMenu() {
    const response = await getData("get_all_main");
    if (response?.st === true) {
      setCatMenu(response?.left_menu);
      setAcces(response?.acces);
      setMy(response?.my);
      setNavs(response?.navs);
      setConts(response?.conts);
      setChangelog(response?.changelog);
      setFullMenu(
        response?.full_menu.filter(
          (item, index, self) => index === self.findIndex((t) => t.name === item.name),
        ),
      );
    }
  }

  useEffect(() => {
    setIsClient(true);
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (my?.id) {
      loadFavorites();
    }
  }, [my?.id, loadFavorites]);

  useEffect(() => {
    loadMenu();
  }, []);

  const saveModules = async (data) => {
    const response = await getData("save_log", data);
    if (response.st) {
      setOpenModal(false);
    }
    loadMenu();
  };

  const editModules = async (data) => {
    const response = await getData("edit_log", data);
    if (response.st) {
      setOpenModalEdit(false);
    }
    loadMenu();
  };

  const deleteModules = async (data) => {
    const response = await getData("delete_log", data);
    if (response.st) {
      setOpenModalEdit(false);
    }
    loadMenu();
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setModules((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        setModuleOrder(newItems.map((item) => item.id));

        updateFavoritesOrder(newItems);

        return newItems;
      });
    }
  };

  const getModules = useCallback(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleFavoriteClick = async (clickedModule) => {
    await removeFavorite(clickedModule.id);
  };

  if (!isClient) {
    return (
      <Grid
        container
        spacing={2}
        className="container_first_child"
      >
        <Grid size={{ xs: 12, xl: 9, lg: 8, md: 7, sm: 12 }}>
          <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "582px", borderRadius: "12px" }}>
            <Typography
              variant="h6"
              sx={{ mb: 3 }}
            >
              Избранное
            </Typography>
            <Box sx={{ textAlign: "center", py: 8, color: "#999" }}>Загрузка...</Box>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, xl: 3, lg: 4, md: 5, sm: 12 }}>
          <div
            style={{
              width: "95%",
              backgroundColor: "#F3F3F3",
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            <h3 style={{ color: "#3C3B3B", fontWeight: "400" }}>Обновления</h3>
          </div>
        </Grid>
      </Grid>
    );
  }

  return (
    <>
      <Grid
        container
        spacing={2}
        className="container_first_child"
        suppressHydrationWarning
      >
        {openModal ? (
          <ModalAddLog
            open={openModal}
            save={saveModules}
            onClose={() => setOpenModal(false)}
            modules={[{ id: -100, name: "Общее" }, ...fullMenu]}
          />
        ) : null}
        <MyAlert
          isOpen={openAlert}
          onClose={() => setOpenAlert(false)}
          status={errStatus}
          text={errText}
        />
        <Backdrop
          open={loading || favoritesLoading}
          style={{ zIndex: 99, position: "absolute", inset: 0 }}
        >
          <CircularProgress color="inherit" />
        </Backdrop>

        {openModalEdit ? (
          <ModalEditLog
            open={openModalEdit}
            save={editModules}
            module={module}
            onClose={() => setOpenModalEdit(false)}
            modules={[{ id: -100, name: "Общее" }, ...fullMenu]}
            deletes={deleteModules}
          />
        ) : null}

        {isTablet || isMobile ? (
          <Grid
            size={{ xs: 12, sm: 12 }}
            suppressHydrationWarning
          >
            <SearchAutocomplete
              catMenu={catMenu}
              closeMenu={() => setIsOpenMenu(false)}
              getModules={getModules}
              loadFavorites={loadFavorites}
              navs={navs}
              favoritesParam={modules}
              conts={conts}
              userId={my?.id}
            />
          </Grid>
        ) : null}

        {isMobile ? (
          <Button
            onClick={() => setOpenNews(true)}
            sx={{
              color: "#5E5E5E",
              backgroundColor: "#E5E5E5",
              textTransform: "capitalize",
              padding: "12px 16px",
              borderRadius: "12px",
              width: "125px",
            }}
            suppressHydrationWarning
          >
            Обновление
          </Button>
        ) : null}

        {isMobile && openNews && !openModal && !openModalEdit ? (
          <div
            style={{
              position: "fixed",
              zIndex: 1200,
              width: "100%",
              left: 0,
              bottom: 0,
              height: "90vh",
              borderRadius: "40px 40px 0 0",
              border: "1px solid #E5E5E5",
              backgroundColor: "#F3F3F3",
              display: "flex",
              flexDirection: "column",
              transform: `translateY(${swipeOffset}px)`,
              transition: isSwiping ? "none" : "transform 0.3s ease-out",
              touchAction: "none",
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            suppressHydrationWarning
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "12px 0",
                cursor: "grab",
                position: "absolute",
                left: "46%",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "4px",
                  backgroundColor: "#C9C9C9",
                  borderRadius: "2px",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#fff",
                padding: "22px",
                borderRadius: "40px 40px 0 0",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <div></div>
              <h3 style={{ color: "#3C3B3B", fontWeight: "400", paddingLeft: "44px" }}>
                Обновления
              </h3>
              <IconButton
                onClick={() => {
                  setOpenNews(false);
                  setDisplayCount(7);
                  setSwipeOffset(0);
                }}
              >
                <CloseIcon />
              </IconButton>
            </div>

            <Button
              variant="contained"
              onClick={() => {
                setOpenNews(false);
                setOpenModal(true);
              }}
              sx={{ m: 2 }}
              style={{ display: acces?.create_news_access ? "flex" : "none", flexShrink: 0 }}
            >
              Добавить обновление
            </Button>

            <div
              ref={scrollContainerRef}
              style={{
                overflowY: "auto",
                flex: 1,
                scrollbarWidth: "none",
                paddingBottom: "16px",
              }}
              onScroll={(e) => {
                const container = e.target;
                const scrollThreshold = 100;

                if (
                  container.scrollHeight - container.scrollTop - container.clientHeight <
                    scrollThreshold &&
                  !loadingMore &&
                  displayCount < changelog.length
                ) {
                  setLoadingMore(true);

                  setTimeout(() => {
                    setDisplayCount((prev) => Math.min(prev + 5, changelog.length));
                    setLoadingMore(false);
                  }, 500);
                }
              }}
            >
              {changelog.slice(0, displayCount).map((it, i) => (
                <div
                  style={{
                    backgroundColor: "#fff",
                    padding: "12px",
                    marginLeft: "16px",
                    marginRight: "16px",
                    borderRadius: "8px",
                    marginTop: "8px",
                  }}
                  key={i}
                  suppressHydrationWarning
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ color: "#5E5E5E" }}>{it.module_name}</span>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={{ color: it.time.color }}>{it.time.time}</span>
                      <IconButton
                        onClick={() => {
                          setOpenNews(false);
                          setModule(it);
                          setOpenModalEdit(true);
                        }}
                        style={{ display: acces?.edit_news_access ? "flex" : "none" }}
                      >
                        <EditIcon style={{ width: "14px", height: "14px" }} />
                      </IconButton>
                    </div>
                  </div>
                  <div style={{ color: "#5E5E5E", marginTop: "12px" }}>{it.description}</div>
                </div>
              ))}

              {loadingMore && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}

              {!loadingMore && displayCount < changelog.length && (
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setDisplayCount((prev) => Math.min(prev + 5, changelog.length))}
                  sx={{
                    mx: 2,
                    my: 2,
                    width: "calc(100% - 32px)",
                    color: "#1977D2",
                    borderColor: "#1977D2",
                    textTransform: "none",
                    "&:hover": {
                      borderColor: "#1565C0",
                      backgroundColor: "rgba(25, 118, 210, 0.04)",
                    },
                  }}
                >
                  Загрузить еще
                </Button>
              )}

              {displayCount >= changelog.length && changelog.length > 0 && (
                <Typography
                  variant="body2"
                  sx={{
                    textAlign: "center",
                    color: "#999",
                    py: 2,
                    fontStyle: "italic",
                  }}
                >
                  Все обновления загружены
                </Typography>
              )}

              {changelog.length === 0 && (
                <Typography
                  variant="body2"
                  sx={{
                    textAlign: "center",
                    color: "#999",
                    py: 4,
                    fontStyle: "italic",
                  }}
                >
                  Нет обновлений
                </Typography>
              )}
            </div>
          </div>
        ) : null}

        <Grid
          size={{ xs: 12, xl: 9, lg: 8, md: 7, sm: 12 }}
          suppressHydrationWarning
        >
          <div
            style={{ marginBottom: "20px", display: isDesktop || isSmallDesktop ? "flex" : "none" }}
          >
            <SearchAutocomplete
              catMenu={catMenu}
              closeMenu={() => setIsOpenMenu(false)}
              getModules={getModules}
              loadFavorites={loadFavorites}
              navs={navs}
              favoritesParam={modules}
              conts={conts}
              userId={my?.id}
            />
          </div>

          <Box
            sx={{
              p: 3,
              pb: 5,
              backgroundColor: "#f5f5f5",
              minHeight: "582px",
              padding: "16px",
              marginBottom: "20px",
              borderRadius: "12px",
            }}
            suppressHydrationWarning
          >
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                color: "#333",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              Избранное
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <g clipPath="url(#clip0_99_8836)">
                  <path
                    d="M8.56 1.24573L10.3771 4.9143C10.4185 5.00741 10.4835 5.08807 10.5657 5.14822C10.6479 5.20838 10.7445 5.24594 10.8457 5.25716L14.8571 5.85144C14.9733 5.86637 15.0828 5.91404 15.1729 5.98888C15.2629 6.06371 15.3299 6.16263 15.3658 6.27408C15.4018 6.38553 15.4053 6.50491 15.3759 6.61828C15.3465 6.73164 15.2855 6.83431 15.2 6.9143L12.3086 9.78287C12.2348 9.85182 12.1794 9.93812 12.1475 10.0339C12.1155 10.1297 12.108 10.232 12.1257 10.3314L12.8229 14.3657C12.843 14.4816 12.8303 14.6009 12.786 14.7099C12.7418 14.819 12.6678 14.9134 12.5726 14.9825C12.4773 15.0515 12.3646 15.0925 12.2472 15.1006C12.1298 15.1088 12.0125 15.0838 11.9086 15.0286L8.29715 13.12C8.20467 13.0746 8.10302 13.051 8 13.051C7.89699 13.051 7.79534 13.0746 7.70286 13.12L4.09143 15.0286C3.98753 15.0838 3.87022 15.1088 3.75283 15.1006C3.63545 15.0925 3.52271 15.0515 3.42745 14.9825C3.33218 14.9134 3.25822 14.819 3.21397 14.7099C3.16972 14.6009 3.15696 14.5816 3.17715 14.3657L3.87429 10.2857C3.89196 10.1863 3.88448 10.084 3.85255 9.98821C3.82061 9.8924 3.76523 9.8061 3.69143 9.73716L0.765717 6.9143C0.67916 6.83212 0.618289 6.72661 0.590476 6.61054C0.562664 6.49448 0.569104 6.37284 0.609017 6.26035C0.648929 6.14787 0.720602 6.04938 0.815352 5.9768C0.910103 5.90422 1.02387 5.86068 1.14286 5.85144L5.15429 5.25716C5.25554 5.24594 5.35209 5.20838 5.43431 5.14822C5.51652 5.08807 5.58153 5.00741 5.62286 4.9143L7.44 1.24573C7.48949 1.13888 7.56851 1.04842 7.66773 0.985022C7.76696 0.921626 7.88225 0.887939 8 0.887939C8.11775 0.887939 8.23305 0.921626 8.33227 0.985022C8.4315 1.04842 8.51052 1.13888 8.56 1.24573V1.24573Z"
                    stroke="#DD1A32"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_99_8836">
                    <rect
                      width="16"
                      height="16"
                      fill="white"
                    />
                  </clipPath>
                </defs>
              </svg>
            </Typography>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={moduleOrder}
                strategy={verticalListSortingStrategy}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "repeat(1, 1fr)",
                      sm: "repeat(2, 1fr)",
                      md: "repeat(2, 1fr)",
                      lg: "repeat(2, 1fr)",
                      xl: "repeat(3, 1fr)",
                    },
                    // Equal height only inside each grid row; different rows keep independent heights
                    gridAutoRows: "auto",
                    gap: 2,
                    rowGap: "40px",
                  }}
                >
                  {modules.map((module) => (
                    <SortableItem
                      key={module.id}
                      module={module}
                      isClient={isClient}
                      onFavoriteClick={handleFavoriteClick}
                      loading={favoritesLoading}
                    />
                  ))}
                </Box>
              </SortableContext>
            </DndContext>

            {modules.length === 0 && !favoritesLoading && (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  color: "#999",
                  fontStyle: "italic",
                }}
              >
                Нет избранных элементов. Добавьте их через поиск.
              </Box>
            )}

            {favoritesLoading && modules.length === 0 && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
              </Box>
            )}
          </Box>
        </Grid>

        <Grid
          size={{ xs: 12, xl: 3, lg: 4, md: 5, sm: 12 }}
          suppressHydrationWarning
        >
          <div
            ref={newsContainerRef}
            style={{
              width: "95%",
              backgroundColor: "#F3F3F3",
              borderRadius: "12px",
              paddingTop: "10px",
              maxHeight: "620px",
              overflowY: "auto",
              scrollbarWidth: "none",
              paddingLeft: "16px",
              paddingRight: "16px",
              paddingBottom: "16px",
              display: isMobile ? "none" : "block",
            }}
            onScroll={handleNewsScroll}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#F3F3F3",
                zIndex: 1,
                paddingBottom: "8px",
              }}
            >
              <h3 style={{ color: "#3C3B3B", fontWeight: "400" }}>Обновления</h3>
              <Button
                variant="contained"
                style={{
                  padding: "4px 8px",
                  width: "20px",
                  display: acces?.create_news_access ? "flex" : "none",
                }}
                onClick={() => setOpenModal(true)}
              >
                <AddIcon style={{ width: "20px", height: "20px" }} />
              </Button>
            </div>

            {changelog.slice(0, displayCount).map((it, i) => (
              <div
                style={{
                  backgroundColor: "#fff",
                  padding: "12px",
                  borderRadius: "8px",
                  marginTop: "8px",
                }}
                key={i}
                suppressHydrationWarning
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ color: "#5E5E5E" }}>{it.module_name}</span>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ color: it.time.color }}>{it.time.time}</span>
                    <IconButton
                      onClick={() => {
                        setModule(it);
                        setOpenModalEdit(true);
                      }}
                      style={{ display: acces?.edit_news_access ? "flex" : "none" }}
                    >
                      <EditIcon style={{ width: "14px", height: "14px" }} />
                    </IconButton>
                  </div>
                </div>
                <div style={{ color: "#5E5E5E", marginTop: "12px" }}>{it.description}</div>
              </div>
            ))}

            {loadingMore && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
          </div>
        </Grid>
      </Grid>
    </>
  );
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
