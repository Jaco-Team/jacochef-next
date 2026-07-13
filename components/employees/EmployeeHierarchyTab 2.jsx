import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import FitScreenOutlinedIcon from "@mui/icons-material/FitScreenOutlined";
import PanToolAltOutlinedIcon from "@mui/icons-material/PanToolAltOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SaveIcon from "@mui/icons-material/Save";
import ZoomInOutlinedIcon from "@mui/icons-material/ZoomInOutlined";
import ZoomOutOutlinedIcon from "@mui/icons-material/ZoomOutOutlined";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import EmployeeAppointmentHierarchyTree from "./EmployeeAppointmentHierarchyTree";

const sortItems = (items) =>
  [...items].sort(
    (left, right) =>
      Number(left.sort ?? 0) - Number(right.sort ?? 0) ||
      String(left.name ?? "").localeCompare(String(right.name ?? ""), "ru"),
  );

const normalizeLevelItems = (items) => {
  const levels = [...new Set(items.map((item) => Math.max(0, Number(item.level ?? 0))))].sort(
    (left, right) => left - right,
  );

  return levels.flatMap((sourceLevel, level) =>
    sortItems(items.filter((item) => Number(item.level ?? 0) === sourceLevel)).map(
      (item, sort) => ({ ...item, level, sort }),
    ),
  );
};

const levelItems = (items, level) =>
  sortItems(items.filter((item) => Number(item.level ?? 0) === Number(level)));

const moveHierarchyItem = (items, itemId, targetLevel, targetIndex) => {
  const numericId = Number(itemId);
  const normalizedItems = normalizeLevelItems(items);
  const current = normalizedItems.find((item) => Number(item.id) === numericId);

  if (!current) return normalizedItems;

  const sourceLevel = Number(current.level ?? 0);
  const normalizedTargetLevel = Math.max(0, Number(targetLevel));
  const sourceSiblings = levelItems(normalizedItems, sourceLevel);
  const sourceIndex = sourceSiblings.findIndex((item) => Number(item.id) === numericId);
  let insertionIndex = Number(targetIndex);

  if (sourceLevel === normalizedTargetLevel && sourceIndex >= 0 && sourceIndex < insertionIndex) {
    insertionIndex -= 1;
  }

  const targetSiblings = levelItems(normalizedItems, normalizedTargetLevel).filter(
    (item) => Number(item.id) !== numericId,
  );
  insertionIndex = Math.max(0, Math.min(insertionIndex, targetSiblings.length));
  targetSiblings.splice(insertionIndex, 0, {
    ...current,
    level: normalizedTargetLevel,
  });

  const groups = new Map();

  normalizedItems
    .filter((item) => Number(item.id) !== numericId)
    .forEach((item) => {
      const level = Number(item.level ?? 0);
      if (!groups.has(level)) groups.set(level, []);
      groups.get(level).push(item);
    });
  groups.set(normalizedTargetLevel, targetSiblings);

  const nextItems = [...groups.entries()].flatMap(([level, group]) =>
    group.map((item, sort) => ({ ...item, level, sort })),
  );

  return normalizeLevelItems(nextItems);
};

const CARD_WIDTH = 220;
const CARD_GAP = 16;
const MIN_ZOOM = 0.4;
const MAX_ZOOM = 1.6;

const clampZoom = (value) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));

function HierarchyNode({
  item,
  level,
  index,
  activeId,
  disabled,
  selectedId,
  onSelect,
  subordinateCount,
  entityLabel,
  canvasScale,
}) {
  const draggable = useDraggable({ id: `node|${item.id}`, disabled });
  const droppable = useDroppable({
    id: `slot|${level}|${index}`,
    disabled: disabled || Number(activeId) === Number(item.id),
  });

  return (
    <Box
      ref={draggable.setNodeRef}
      style={{
        transform: draggable.transform
          ? CSS.Translate.toString({
              ...draggable.transform,
              x: draggable.transform.x / canvasScale,
              y: draggable.transform.y / canvasScale,
            })
          : undefined,
        opacity: draggable.isDragging ? 0.25 : 1,
      }}
      sx={{ flex: `0 0 ${CARD_WIDTH}px`, width: CARD_WIDTH }}
    >
      <Paper
        ref={droppable.setNodeRef}
        variant="outlined"
        onClick={() => onSelect?.(item)}
        sx={{
          px: 1.25,
          py: 1,
          minHeight: 68,
          borderColor:
            droppable.isOver || Number(selectedId) === Number(item.id) ? "primary.main" : "divider",
          bgcolor: droppable.isOver
            ? "rgba(213, 0, 50, 0.05)"
            : Number(selectedId) === Number(item.id)
              ? "rgba(25, 118, 210, 0.04)"
              : "background.paper",
          boxShadow: draggable.isDragging || droppable.isOver ? 3 : 0,
          cursor: onSelect ? "pointer" : "default",
          transition: "border-color 120ms ease, background-color 120ms ease",
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
        >
          <Tooltip title={disabled ? "Редактирование недоступно" : "Перетащить"}>
            <span>
              <IconButton
                size="small"
                disabled={disabled}
                {...draggable.attributes}
                {...draggable.listeners}
                onClick={(event) => event.stopPropagation()}
                sx={{ cursor: disabled ? "default" : "grab" }}
              >
                <DragIndicatorIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              noWrap
              sx={{ fontSize: 14, fontWeight: 800 }}
            >
              {item.name}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
              {subordinateCount
                ? `Нижестоящих ${entityLabel}: ${subordinateCount}`
                : `Нижестоящих ${entityLabel} нет`}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}

function HierarchyLevel({
  level,
  items,
  allItems,
  disabled,
  selectedId,
  onSelect,
  entityLabel,
  activeId,
  hasNextLevel,
  canvasScale,
}) {
  const droppable = useDroppable({ id: `level|${level}`, disabled });
  const subordinates = allItems.filter((item) => Number(item.level ?? 0) > level).length;
  const rowWidth = items.length
    ? items.length * CARD_WIDTH + (items.length - 1) * CARD_GAP
    : CARD_WIDTH;
  const branchWidth = Math.max(0, rowWidth - CARD_WIDTH);

  return (
    <Box
      ref={droppable.setNodeRef}
      sx={{
        width: rowWidth,
        mx: "auto",
        p: 0.75,
        border: "1px dashed",
        borderColor: droppable.isOver ? "primary.main" : "transparent",
        borderRadius: 2,
        bgcolor: droppable.isOver ? "rgba(213, 0, 50, 0.04)" : "transparent",
        transition: "border-color 120ms ease, background-color 120ms ease",
      }}
    >
      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        justifyContent="center"
      >
        <Chip
          size="small"
          color="primary"
          variant="outlined"
          label={`Уровень ${level + 1}`}
          sx={{ bgcolor: "background.paper", fontWeight: 800 }}
        />
        <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
          {level === 0 ? "Высший" : "Равные права"}
        </Typography>
      </Stack>

      <Box sx={{ position: "relative", height: 32 }}>
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: "50%",
            height: 13,
            borderLeft: "1px solid",
            borderColor: droppable.isOver ? "primary.main" : "divider",
          }}
        />
        {items.length > 1 ? (
          <Box
            sx={{
              position: "absolute",
              top: 12,
              left: CARD_WIDTH / 2,
              width: branchWidth,
              borderTop: "1px solid",
              borderColor: droppable.isOver ? "primary.main" : "divider",
            }}
          />
        ) : null}
        {items.map((item, index) => {
          const left = CARD_WIDTH / 2 + index * (CARD_WIDTH + CARD_GAP);

          return (
            <React.Fragment key={item.id}>
              <Box
                sx={{
                  position: "absolute",
                  top: 12,
                  left,
                  height: 16,
                  borderLeft: "1px solid",
                  borderColor: droppable.isOver ? "primary.main" : "divider",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: 26,
                  left: left - 4,
                  width: 0,
                  height: 0,
                  borderLeft: "4px solid transparent",
                  borderRight: "4px solid transparent",
                  borderTop: "6px solid",
                  borderTopColor: droppable.isOver ? "primary.main" : "divider",
                }}
              />
            </React.Fragment>
          );
        })}
        {!items.length ? (
          <Box
            sx={{
              position: "absolute",
              top: 26,
              left: "calc(50% - 4px)",
              width: 0,
              height: 0,
              borderLeft: "4px solid transparent",
              borderRight: "4px solid transparent",
              borderTop: "6px solid",
              borderTopColor: droppable.isOver ? "primary.main" : "divider",
            }}
          />
        ) : null}
      </Box>

      {items.length ? (
        <Stack
          direction="row"
          spacing={`${CARD_GAP}px`}
        >
          {items.map((item, index) => (
            <HierarchyNode
              key={item.id}
              item={item}
              level={level}
              index={index}
              activeId={activeId}
              disabled={disabled}
              selectedId={selectedId}
              onSelect={onSelect}
              subordinateCount={subordinates}
              entityLabel={entityLabel}
              canvasScale={canvasScale}
            />
          ))}
        </Stack>
      ) : (
        <Paper
          variant="outlined"
          sx={{
            height: 68,
            borderStyle: "dashed",
            borderColor: droppable.isOver ? "primary.main" : "divider",
            color: droppable.isOver ? "primary.main" : "text.secondary",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          Перетащите карточку сюда
        </Paper>
      )}

      {hasNextLevel ? (
        <Box sx={{ position: "relative", height: 40 }}>
          {items.map((item, index) => {
            const left = CARD_WIDTH / 2 + index * (CARD_WIDTH + CARD_GAP);

            return (
              <Box
                key={item.id}
                sx={{
                  position: "absolute",
                  top: 0,
                  left,
                  height: 15,
                  borderLeft: "1px solid",
                  borderColor: "divider",
                }}
              />
            );
          })}
          {items.length > 1 ? (
            <Box
              sx={{
                position: "absolute",
                top: 14,
                left: CARD_WIDTH / 2,
                width: branchWidth,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            />
          ) : null}
          <Box
            sx={{
              position: "absolute",
              top: items.length ? 14 : 0,
              left: "50%",
              height: items.length ? 22 : 36,
              borderLeft: "2px solid",
              borderColor: "divider",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: "calc(50% - 4px)",
              width: 0,
              height: 0,
              borderLeft: "4px solid transparent",
              borderRight: "4px solid transparent",
              borderTop: "6px solid",
              borderTopColor: "divider",
            }}
          />
        </Box>
      ) : null}
    </Box>
  );
}

function NewLevelDropZone({ level, disabled, active }) {
  const droppable = useDroppable({
    id: `level|${level}`,
    disabled,
  });

  return (
    <Box
      ref={droppable.setNodeRef}
      sx={{
        width: "min(520px, calc(100% - 32px))",
        height: active ? 84 : 54,
        mx: "auto",
        mt: 1.5,
        border: "1px dashed",
        borderColor: droppable.isOver ? "primary.main" : "divider",
        borderRadius: 2,
        bgcolor: droppable.isOver ? "rgba(213, 0, 50, 0.06)" : "background.paper",
        color: droppable.isOver ? "primary.main" : "text.secondary",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 2,
        fontSize: 12,
        fontWeight: 700,
        opacity: active ? 1 : 0.7,
        transition: "height 120ms ease, border-color 120ms ease, background-color 120ms ease",
      }}
    >
      {droppable.isOver
        ? `Создать уровень ${level + 1}`
        : "Перетащите карточку ниже, чтобы создать уровень"}
    </Box>
  );
}

function HierarchyLevels({
  items,
  disabled,
  selectedId,
  onSelect,
  onChange,
  entityLabel = "должностей",
  spacious = false,
}) {
  const [activeId, setActiveId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [panMode, setPanMode] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [canvasHeight, setCanvasHeight] = useState(400);
  const viewportRef = useRef(null);
  const canvasRef = useRef(null);
  const panStartRef = useRef(null);
  const actualLevelCount = items.length
    ? Math.max(...items.map((item) => Number(item.level ?? 0))) + 1
    : 1;
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );
  const activeItem = items.find((item) => Number(item.id) === Number(activeId));
  const maxItemsOnLevel = Math.max(
    1,
    ...Array.from({ length: actualLevelCount }, (_, level) => levelItems(items, level).length),
  );
  const canvasWidth = Math.max(
    300,
    maxItemsOnLevel * CARD_WIDTH + Math.max(0, maxItemsOnLevel - 1) * CARD_GAP + 24,
  );
  const canvasTopPadding = spacious ? 96 : 56;
  const canvasBottomPadding = spacious ? 112 : 56;

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return undefined;

    const updateHeight = () => setCanvasHeight(Math.max(1, canvas.offsetHeight));
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(canvas);

    return () => observer.disconnect();
  }, []);

  const updateZoom = (nextValue) => {
    const nextZoom = clampZoom(nextValue);
    const viewport = viewportRef.current;

    if (!viewport || nextZoom === zoom) return;

    const centerX = (viewport.scrollLeft + viewport.clientWidth / 2) / zoom;
    const centerY = (viewport.scrollTop + viewport.clientHeight / 2) / zoom;

    setZoom(nextZoom);
    requestAnimationFrame(() => {
      viewport.scrollLeft = centerX * nextZoom - viewport.clientWidth / 2;
      viewport.scrollTop = centerY * nextZoom - viewport.clientHeight / 2;
    });
  };

  const fitCanvas = () => {
    const viewport = viewportRef.current;

    if (!viewport) return;

    const widthZoom = (viewport.clientWidth - 32) / canvasWidth;
    const heightZoom =
      (viewport.clientHeight - canvasTopPadding - canvasBottomPadding - 32) / canvasHeight;
    const nextZoom = clampZoom(Math.min(1, widthZoom, heightZoom));

    setZoom(nextZoom);
    requestAnimationFrame(() => {
      viewport.scrollTo({ left: 0, top: 0 });
    });
  };

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) return undefined;

    const handleCanvasWheel = (event) => {
      if (!event.ctrlKey && !event.metaKey) return;

      event.preventDefault();
      updateZoom(zoom + (event.deltaY < 0 ? 0.1 : -0.1));
    };

    viewport.addEventListener("wheel", handleCanvasWheel, { passive: false });

    return () => viewport.removeEventListener("wheel", handleCanvasWheel);
  }, [zoom]);

  const handlePointerDown = (event) => {
    if (!panMode || event.button !== 0) return;

    const viewport = viewportRef.current;
    if (!viewport) return;

    event.preventDefault();
    viewport.setPointerCapture(event.pointerId);
    panStartRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
    };
    setIsPanning(true);
  };

  const handlePointerMove = (event) => {
    const start = panStartRef.current;
    const viewport = viewportRef.current;

    if (!start || !viewport || start.pointerId !== event.pointerId) return;

    viewport.scrollLeft = start.scrollLeft - (event.clientX - start.x);
    viewport.scrollTop = start.scrollTop - (event.clientY - start.y);
  };

  const stopPanning = (event) => {
    const viewport = viewportRef.current;

    if (viewport?.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }

    panStartRef.current = null;
    setIsPanning(false);
  };

  const handleDragEnd = ({ active, over }) => {
    const itemId = Number(String(active.id).split("|")[1]);
    setActiveId(null);

    if (!over) return;

    const [type, rawLevel, rawIndex] = String(over.id).split("|");
    if (type !== "slot" && type !== "level") return;

    const targetLevel = Number(rawLevel);
    const currentItem = items.find((item) => Number(item.id) === itemId);

    if (type === "level" && Number(currentItem?.level ?? 0) === targetLevel) return;

    const targetIndex = type === "slot" ? Number(rawIndex) : levelItems(items, targetLevel).length;

    const nextItems = moveHierarchyItem(items, itemId, targetLevel, targetIndex);

    onChange(nextItems);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={({ active }) => setActiveId(Number(String(active.id).split("|")[1]))}
      onDragCancel={() => setActiveId(null)}
      onDragEnd={handleDragEnd}
    >
      <Box sx={{ position: "relative" }}>
        <Paper
          variant="outlined"
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            zIndex: 5,
            p: 0.5,
            display: "flex",
            alignItems: "center",
            gap: 0.25,
            boxShadow: 2,
          }}
        >
          <Tooltip title={panMode ? "Выключить режим руки" : "Режим руки: двигать холст"}>
            <IconButton
              size="small"
              color={panMode ? "primary" : "default"}
              onClick={() => setPanMode((current) => !current)}
              sx={{ bgcolor: panMode ? "action.selected" : "transparent" }}
            >
              <PanToolAltOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Уменьшить">
            <span>
              <IconButton
                size="small"
                disabled={zoom <= MIN_ZOOM}
                onClick={() => updateZoom(zoom - 0.1)}
              >
                <ZoomOutOutlinedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Вернуть масштаб 100%">
            <Button
              size="small"
              color="inherit"
              onClick={() => updateZoom(1)}
              sx={{ minWidth: 52, px: 0.5, fontSize: 12 }}
            >
              {Math.round(zoom * 100)}%
            </Button>
          </Tooltip>
          <Tooltip title="Увеличить">
            <span>
              <IconButton
                size="small"
                disabled={zoom >= MAX_ZOOM}
                onClick={() => updateZoom(zoom + 0.1)}
              >
                <ZoomInOutlinedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Показать дерево целиком">
            <IconButton
              size="small"
              onClick={fitCanvas}
            >
              <FitScreenOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Paper>

        <Box
          ref={viewportRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopPanning}
          onPointerCancel={stopPanning}
          sx={{
            height: spacious ? { xs: 520, md: 640 } : { xs: 440, md: 560 },
            overflow: "auto",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: "grey.50",
            cursor: panMode ? (isPanning ? "grabbing" : "grab") : "default",
            touchAction: panMode ? "none" : "auto",
            userSelect: panMode ? "none" : "auto",
            ...(panMode
              ? {
                  scrollbarWidth: "none",
                  "&::-webkit-scrollbar": { display: "none" },
                }
              : {}),
          }}
        >
          <Box
            sx={{
              width: canvasWidth * zoom,
              height: canvasHeight * zoom + canvasTopPadding + canvasBottomPadding,
              mx: "auto",
              position: "relative",
            }}
          >
            <Box
              ref={canvasRef}
              sx={{
                position: "absolute",
                top: canvasTopPadding,
                left: 0,
                width: canvasWidth,
                pb: 2,
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
              }}
            >
              {Array.from({ length: actualLevelCount }, (_, level) => (
                <HierarchyLevel
                  key={level}
                  level={level}
                  items={levelItems(items, level)}
                  allItems={items}
                  disabled={disabled || panMode}
                  selectedId={selectedId}
                  onSelect={panMode ? undefined : onSelect}
                  entityLabel={entityLabel}
                  activeId={activeId}
                  hasNextLevel={level < actualLevelCount - 1}
                  canvasScale={zoom}
                />
              ))}
              <NewLevelDropZone
                level={actualLevelCount}
                disabled={disabled || panMode}
                active={activeId !== null}
              />
            </Box>
          </Box>
        </Box>
      </Box>
      <DragOverlay>
        {activeItem ? (
          <Paper
            sx={{ px: 1.5, py: 1, border: "1px solid #d50032", minWidth: 240 }}
            elevation={6}
          >
            <Typography sx={{ fontSize: 14, fontWeight: 800 }}>{activeItem.name}</Typography>
          </Paper>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

const getPayloadItems = (items) =>
  items.map((item) => ({
    id: Number(item.id),
    level: Number(item.level ?? 0),
    sort: Number(item.sort ?? 0),
  }));

const getAppointmentPayloadItems = (items) =>
  items.map((item) => ({
    id: Number(item.id),
    group_key: String(item.group_key || ""),
    parent_group_key: item.parent_group_key ? String(item.parent_group_key) : null,
    group_sort: Number(item.group_sort ?? 0),
    sort: Number(item.sort ?? 0),
  }));

export default function EmployeeHierarchyTab({ request, showAlert }) {
  const [units, setUnits] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [tablesReady, setTablesReady] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [dirty, setDirty] = useState(false);

  const unitOptions = useMemo(() => {
    const options = units.map((unit) => ({ id: Number(unit.id), name: unit.name }));
    const hasUnassigned = appointments.some(
      (appointment) => appointment.unit_id === null || appointment.unit_id === undefined,
    );

    return hasUnassigned ? [...options, { id: 0, name: "Без отдела" }] : options;
  }, [appointments, units]);
  const selectedUnit =
    unitOptions.find((unit) => Number(unit.id) === Number(selectedUnitId)) ?? null;
  const selectedAppointments = appointments.filter((appointment) =>
    selectedUnitId === 0
      ? appointment.unit_id === null || appointment.unit_id === undefined
      : Number(appointment.unit_id) === Number(selectedUnitId),
  );

  const applyHierarchy = (hierarchy) => {
    const nextUnits = Array.isArray(hierarchy?.units) ? hierarchy.units : [];
    const nextAppointments = Array.isArray(hierarchy?.appointments) ? hierarchy.appointments : [];

    setUnits(nextUnits);
    setAppointments(nextAppointments);
    setTablesReady(Boolean(hierarchy?.tables_ready));
    setCanEdit(Boolean(hierarchy?.can_edit));
    setSelectedUnitId((current) => {
      const currentExists = nextUnits.some((unit) => Number(unit.id) === Number(current));
      return currentExists ? current : (nextUnits[0]?.id ?? (nextAppointments.length ? 0 : null));
    });
    setDirty(false);
  };

  const loadHierarchy = async () => {
    const response = await request("get_hierarchy");

    if (!response?.st) {
      showAlert(false, response?.text || "Не удалось загрузить иерархию");
      return;
    }

    applyHierarchy(response.hierarchy);
  };

  useEffect(() => {
    loadHierarchy();
  }, []);

  const handleUnitLevelsChange = (nextUnits) => {
    setUnits(nextUnits);
    setDirty(true);
  };

  const handleAppointmentLevelsChange = (nextAppointments) => {
    const nextMap = new Map(nextAppointments.map((item) => [Number(item.id), item]));
    setAppointments((current) => current.map((item) => nextMap.get(Number(item.id)) ?? item));
    setDirty(true);
  };

  const saveHierarchy = async () => {
    const response = await request("save_hierarchy", {
      units: getPayloadItems(units),
      appointments: getAppointmentPayloadItems(appointments),
    });

    if (!response?.st) {
      showAlert(false, response?.text || "Не удалось сохранить иерархию");
      return;
    }

    showAlert(true, response.text || "Иерархия сохранена");
    applyHierarchy(response.hierarchy);
  };

  return (
    <Stack spacing={2}>
      <Paper
        variant="outlined"
        sx={{ p: 2 }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="space-between"
        >
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 900 }}>Иерархия найма</Typography>
            <Typography sx={{ mt: 0.25, fontSize: 13, color: "text.secondary" }}>
              Сначала настройте подчинённость отделов, затем должностей внутри каждого отдела.
              Справочники и сотрудники при этом не изменяются.
            </Typography>
          </Box>
          <Stack
            direction="row"
            spacing={1}
          >
            <Button
              variant="outlined"
              startIcon={<RestartAltIcon />}
              disabled={!dirty}
              onClick={loadHierarchy}
            >
              Сбросить
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={!tablesReady || !canEdit || !dirty}
              onClick={saveHierarchy}
            >
              Сохранить
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {!tablesReady ? (
        <Alert severity="warning">
          Структура таблиц иерархии ещё не обновлена. До выполнения SQL редактор работает только как
          просмотр.
        </Alert>
      ) : null}

      {tablesReady && !canEdit ? (
        <Alert severity="info">
          Иерархия доступна только для просмотра. Для изменения требуется право редактировать
          должности.
        </Alert>
      ) : null}

      <Alert severity="info">
        Перетащите должность в существующий блок, чтобы дать ей равные права. Перетащите её в
        область «Новая дочерняя ветка» под руководителем, чтобы создать отдельную ветку подчинения.
        Для навигации включите режим руки; масштаб также меняется через Ctrl/⌘ + колесо.
      </Alert>

      <Grid
        container
        spacing={2}
        alignItems="flex-start"
      >
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper
            variant="outlined"
            sx={{ p: 2, minHeight: 360 }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1.5 }}
            >
              <BusinessOutlinedIcon color="primary" />
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 900 }}>Уровни отделов</Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  Равноправные подразделения размещаются на одном уровне
                </Typography>
              </Box>
              <Chip
                size="small"
                label={units.length}
              />
            </Stack>
            <HierarchyLevels
              items={units}
              disabled={!tablesReady || !canEdit}
              selectedId={selectedUnitId}
              onSelect={(unit) => setSelectedUnitId(Number(unit.id))}
              onChange={handleUnitLevelsChange}
              entityLabel="отделов"
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper
            variant="outlined"
            sx={{ p: 2, minHeight: 360 }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", sm: "center" }}
              sx={{ mb: 1.5 }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ flex: 1 }}
              >
                <AccountTreeOutlinedIcon color="primary" />
                <Box>
                  <Typography sx={{ fontWeight: 900 }}>Дерево должностей отдела</Typography>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    Равные должности объединяются в группы, дочерние группы образуют ветки
                  </Typography>
                </Box>
              </Stack>
              <Autocomplete
                size="small"
                disableClearable
                options={unitOptions}
                value={selectedUnit}
                getOptionLabel={(option) => option?.name ?? ""}
                isOptionEqualToValue={(option, value) => Number(option.id) === Number(value.id)}
                onChange={(_, value) => setSelectedUnitId(Number(value.id))}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Отдел"
                  />
                )}
                sx={{ minWidth: { xs: "100%", sm: 260 } }}
              />
            </Stack>

            {selectedUnit ? (
              selectedAppointments.length ? (
                <EmployeeAppointmentHierarchyTree
                  items={selectedAppointments}
                  disabled={!tablesReady || !canEdit}
                  onChange={handleAppointmentLevelsChange}
                  onInvalid={(text) => showAlert(false, text)}
                />
              ) : (
                <Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
                  В отделе нет должностей
                </Box>
              )
            ) : (
              <Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>Выберите отдел</Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}
