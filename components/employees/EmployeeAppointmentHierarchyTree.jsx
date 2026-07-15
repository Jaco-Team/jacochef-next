import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FitScreenOutlinedIcon from "@mui/icons-material/FitScreenOutlined";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import PanToolAltOutlinedIcon from "@mui/icons-material/PanToolAltOutlined";
import SearchIcon from "@mui/icons-material/Search";
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

const POSITION_WIDTH = 230;
const POSITION_GAP = 8;
const BRANCH_GAP = 36;
const DEPARTMENT_WIDTH = 260;
const DEPARTMENT_GAP = 56;
const MIN_ZOOM = 0.15;
const MAX_ZOOM = 1.6;
const CONNECTOR_COLOR = "rgba(71, 85, 105, 0.72)";

const clampZoom = (value) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));

const unitKeyOf = (unitId) =>
  unitId === null || unitId === undefined ? "without_unit" : String(unitId);

const createGroupKey = () =>
  `group_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

const sortMembers = (members) =>
  [...members].sort(
    (left, right) =>
      Number(left.sort ?? 0) - Number(right.sort ?? 0) ||
      String(left.name ?? "").localeCompare(String(right.name ?? ""), "ru"),
  );

const itemGroupKey = (item) => String(item.group_key || `legacy_level_${Number(item.level ?? 0)}`);

const itemParentGroupKey = (item) => {
  if (Object.prototype.hasOwnProperty.call(item, "parent_group_key")) {
    return item.parent_group_key ? String(item.parent_group_key) : null;
  }

  const level = Number(item.level ?? 0);
  return level > 0 ? `legacy_level_${level - 1}` : null;
};

const buildModel = (items, isCollapsed = () => false) => {
  const groups = new Map();

  items.forEach((item) => {
    const key = itemGroupKey(item);

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        parentKey: itemParentGroupKey(item),
        sort: Number(item.group_sort ?? 0),
        members: [],
      });
    }

    groups.get(key).members.push(item);
  });

  groups.forEach((group) => {
    group.members = sortMembers(group.members);
    if (group.parentKey && !groups.has(group.parentKey)) group.parentKey = null;
  });

  const children = new Map();

  groups.forEach((group) => {
    const parentKey = group.parentKey || "root";
    if (!children.has(parentKey)) children.set(parentKey, []);
    children.get(parentKey).push(group);
  });

  children.forEach((groupItems) => {
    groupItems.sort(
      (left, right) =>
        left.sort - right.sort ||
        String(left.members[0]?.name ?? "").localeCompare(
          String(right.members[0]?.name ?? ""),
          "ru",
        ),
    );
  });

  const layouts = new Map();
  const measure = (group, path = new Set()) => {
    const groupWidth = Math.max(
      220,
      group.members.length * POSITION_WIDTH +
        Math.max(0, group.members.length - 1) * POSITION_GAP +
        16,
    );

    if (path.has(group.key)) {
      const cycleLayout = { width: groupWidth, groupWidth, childrenWidth: 0 };
      layouts.set(group.key, cycleLayout);
      return cycleLayout.width;
    }

    const nextPath = new Set(path);
    nextPath.add(group.key);
    const childGroups = isCollapsed(group.key) ? [] : children.get(group.key) || [];
    const childWidths = childGroups.map((child) => measure(child, nextPath));
    const childrenWidth = childWidths.length
      ? childWidths.reduce((sum, width) => sum + width, 0) +
        Math.max(0, childWidths.length - 1) * BRANCH_GAP
      : 0;
    const layout = {
      width: Math.max(groupWidth, childrenWidth),
      groupWidth,
      childrenWidth,
      childWidths,
    };

    layouts.set(group.key, layout);
    return layout.width;
  };

  const roots = children.get("root") || [];
  const rootWidths = roots.map((root) => measure(root));
  const contentWidth = Math.max(
    DEPARTMENT_WIDTH,
    rootWidths.reduce((sum, width) => sum + width, 0) +
      Math.max(0, rootWidths.length - 1) * BRANCH_GAP,
  );

  return { groups, children, layouts, roots, rootWidths, contentWidth };
};

const descendantGroupKeys = (model, groupKey) => {
  const descendants = new Set();
  const queue = [...(model.children.get(groupKey) || [])];

  while (queue.length) {
    const group = queue.shift();
    if (descendants.has(group.key)) continue;

    descendants.add(group.key);
    queue.push(...(model.children.get(group.key) || []));
  }

  return descendants;
};

const normalizeOrdering = (items) => {
  const model = buildModel(items);
  const groupSorts = new Map();

  model.children.forEach((groups) => {
    groups.forEach((group, index) => groupSorts.set(group.key, index));
  });

  const memberSorts = new Map();
  model.groups.forEach((group) => {
    group.members.forEach((member, index) => memberSorts.set(Number(member.id), index));
  });

  return items.map((item) => ({
    ...item,
    group_sort: groupSorts.get(itemGroupKey(item)) ?? 0,
    sort: memberSorts.get(Number(item.id)) ?? 0,
  }));
};

const moveItem = (items, itemId, targetType, targetKey) => {
  const model = buildModel(items);
  const numericId = Number(itemId);
  const sourceItem = items.find((item) => Number(item.id) === numericId);

  if (!sourceItem) return { items };

  const sourceKey = itemGroupKey(sourceItem);
  const sourceGroup = model.groups.get(sourceKey);
  const sourceIsWholeGroup = sourceGroup.members.length === 1;
  const descendants = descendantGroupKeys(model, sourceKey);

  if (targetType === "equal") {
    const targetGroup = model.groups.get(targetKey);

    if (!targetGroup || targetKey === sourceKey) return { items };
    if (sourceIsWholeGroup && descendants.has(targetKey)) {
      return { items, error: "Нельзя объединить группу с одной из её дочерних веток" };
    }

    const targetSort = targetGroup.members.length;
    const nextItems = items.map((item) => {
      if (Number(item.id) === numericId) {
        return {
          ...item,
          group_key: targetKey,
          parent_group_key: targetGroup.parentKey,
          group_sort: targetGroup.sort,
          sort: targetSort,
        };
      }

      if (sourceIsWholeGroup && itemParentGroupKey(item) === sourceKey) {
        return { ...item, parent_group_key: targetKey };
      }

      return item;
    });

    return { items: normalizeOrdering(nextItems) };
  }

  const parentKey = targetType === "root" ? null : targetKey;

  if (sourceIsWholeGroup) {
    if (parentKey === sourceKey || (parentKey && descendants.has(parentKey))) {
      return { items, error: "Нельзя переместить ветку внутрь самой себя" };
    }

    const siblings = model.children.get(parentKey || "root") || [];
    const nextItems = items.map((item) =>
      itemGroupKey(item) === sourceKey
        ? {
            ...item,
            parent_group_key: parentKey,
            group_sort: siblings.length,
          }
        : item,
    );

    return { items: normalizeOrdering(nextItems) };
  }

  const newGroupKey = createGroupKey();
  const siblings = model.children.get(parentKey || "root") || [];
  const nextItems = items.map((item) =>
    Number(item.id) === numericId
      ? {
          ...item,
          group_key: newGroupKey,
          parent_group_key: parentKey,
          group_sort: siblings.length,
          sort: 0,
        }
      : item,
  );

  return { items: normalizeOrdering(nextItems) };
};

function PositionCard({
  item,
  disabled,
  activeId,
  scale,
  subordinateCount,
  onPositionClick,
  highlighted,
  registerPositionRef,
}) {
  const draggable = useDraggable({ id: `position|${item.id}`, disabled });
  const setNodeRef = (node) => {
    draggable.setNodeRef(node);
    registerPositionRef?.(Number(item.id), node);
  };

  return (
    <Paper
      ref={setNodeRef}
      variant="outlined"
      style={{
        transform: draggable.transform
          ? CSS.Translate.toString({
              ...draggable.transform,
              x: draggable.transform.x / scale,
              y: draggable.transform.y / scale,
            })
          : undefined,
        opacity: draggable.isDragging ? 0.25 : 1,
      }}
      sx={{
        width: POSITION_WIDTH,
        minHeight: 72,
        px: 1,
        py: 0.75,
        boxSizing: "border-box",
        bgcolor: "background.paper",
        boxShadow: draggable.isDragging ? 3 : 0,
        borderColor: highlighted ? "info.main" : "divider",
        outline: highlighted ? "3px solid rgba(2, 136, 209, 0.18)" : "none",
        outlineOffset: 2,
        cursor: onPositionClick ? "pointer" : "default",
        transition: "border-color 160ms ease, outline-color 160ms ease",
      }}
      onClick={() => {
        if (draggable.isDragging) return;
        onPositionClick?.(item);
      }}
    >
      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
      >
        <Tooltip title={disabled ? "Перемещение недоступно" : "Перетащить должность"}>
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
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 15,
              fontWeight: 800,
              lineHeight: 1.25,
              overflowWrap: "anywhere",
            }}
          >
            {item.name}
          </Typography>
          <Typography sx={{ mt: 0.25, fontSize: 12, color: "text.secondary", lineHeight: 1.3 }}>
            {subordinateCount
              ? `Нижестоящих должностей: ${subordinateCount}`
              : "Нижестоящих должностей нет"}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

function GroupCard({
  group,
  model,
  unitKey,
  disabled,
  activeId,
  scale,
  onPositionClick,
  highlightedId,
  registerPositionRef,
}) {
  const droppable = useDroppable({ id: `equal|${unitKey}|${group.key}`, disabled });
  const layout = model.layouts.get(group.key);
  const descendants = descendantGroupKeys(model, group.key);
  const subordinateCount = [...descendants].reduce(
    (count, key) => count + (model.groups.get(key)?.members.length || 0),
    0,
  );

  return (
    <Paper
      ref={droppable.setNodeRef}
      variant="outlined"
      sx={{
        width: layout.groupWidth,
        p: 1,
        boxSizing: "border-box",
        borderColor: droppable.isOver ? "primary.main" : "divider",
        bgcolor: droppable.isOver ? "rgba(213, 0, 50, 0.05)" : "grey.50",
        boxShadow: droppable.isOver ? 3 : 0,
        transition: "border-color 120ms ease, background-color 120ms ease",
      }}
    >
      {group.members.length > 1 ? (
        <Chip
          size="small"
          color="primary"
          variant="outlined"
          label="Один уровень"
          sx={{ mb: 0.75, height: 22, fontSize: 12, bgcolor: "background.paper" }}
        />
      ) : null}
      <Stack
        direction="row"
        spacing={`${POSITION_GAP}px`}
      >
        {group.members.map((item) => (
          <PositionCard
            key={item.id}
            item={item}
            disabled={disabled}
            activeId={activeId}
            scale={scale}
            subordinateCount={subordinateCount}
            onPositionClick={onPositionClick}
            highlighted={Number(item.id) === Number(highlightedId)}
            registerPositionRef={registerPositionRef}
          />
        ))}
      </Stack>
      {droppable.isOver ? (
        <Typography
          sx={{
            mt: 0.5,
            textAlign: "center",
            fontSize: 12,
            color: "primary.main",
            fontWeight: 700,
          }}
        >
          Добавить на один уровень
        </Typography>
      ) : null}
    </Paper>
  );
}

function ChildDropZone({ groupKey, unitKey, disabled, active, hasChildren }) {
  const droppable = useDroppable({ id: `child|${unitKey}|${groupKey}`, disabled });

  return (
    <Box
      ref={droppable.setNodeRef}
      sx={{
        width: 180,
        height: active ? 42 : hasChildren ? 16 : 28,
        mx: "auto",
        my: 0.5,
        border: "1px dashed",
        borderColor: droppable.isOver ? "primary.main" : active ? "divider" : "transparent",
        borderRadius: 1.5,
        bgcolor: droppable.isOver ? "rgba(213, 0, 50, 0.06)" : "transparent",
        color: droppable.isOver ? "primary.main" : "text.secondary",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 700,
        transition: "height 120ms ease, border-color 120ms ease, background-color 120ms ease",
      }}
    >
      {active ? (droppable.isOver ? "Создать ветку здесь" : "Новая дочерняя ветка") : null}
    </Box>
  );
}

function BranchNode({
  group,
  model,
  unitKey,
  disabled,
  activeId,
  scale,
  onPositionClick,
  collapsedGroups,
  onToggleGroup,
  highlightedId,
  registerPositionRef,
}) {
  const layout = model.layouts.get(group.key);
  const allChildGroups = model.children.get(group.key) || [];
  const collapsed = collapsedGroups.has(`${unitKey}|${group.key}`);
  const childGroups = collapsed ? [] : allChildGroups;
  const childLayouts = childGroups.map((child) => model.layouts.get(child.key));
  const childrenWidth = layout.childrenWidth;
  const hiddenPositionCount = [...descendantGroupKeys(model, group.key)].reduce(
    (count, key) => count + (model.groups.get(key)?.members.length || 0),
    0,
  );
  let offset = 0;
  const centers = childLayouts.map((childLayout) => {
    const center = offset + childLayout.width / 2;
    offset += childLayout.width + BRANCH_GAP;
    return center;
  });
  const firstCenter = centers[0] || childrenWidth / 2;
  const lastCenter = centers[centers.length - 1] || childrenWidth / 2;

  return (
    <Box sx={{ width: layout.width, flex: `0 0 ${layout.width}px` }}>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <GroupCard
          group={group}
          model={model}
          unitKey={unitKey}
          disabled={disabled}
          activeId={activeId}
          scale={scale}
          onPositionClick={onPositionClick}
          highlightedId={highlightedId}
          registerPositionRef={registerPositionRef}
        />
      </Box>
      {allChildGroups.length ? (
        <Box sx={{ mt: 0.5, textAlign: "center" }}>
          <Button
            size="small"
            color="inherit"
            startIcon={collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            onClick={() => onToggleGroup(`${unitKey}|${group.key}`)}
            sx={{ minHeight: 28, px: 1, fontSize: 11, color: "text.secondary" }}
          >
            {collapsed ? `Показать ветку · ${hiddenPositionCount}` : "Свернуть ветку"}
          </Button>
        </Box>
      ) : null}
      <ChildDropZone
        groupKey={group.key}
        unitKey={unitKey}
        disabled={disabled}
        active={activeId !== null}
        hasChildren={Boolean(allChildGroups.length)}
      />

      {childGroups.length ? (
        <>
          <Box
            sx={{
              position: "relative",
              width: childrenWidth,
              height: 38,
              mx: "auto",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: "50%",
                height: 16,
                borderLeft: "2px solid",
                borderColor: CONNECTOR_COLOR,
              }}
            />
            {childGroups.length > 1 ? (
              <Box
                sx={{
                  position: "absolute",
                  top: 15,
                  left: firstCenter,
                  width: lastCenter - firstCenter,
                  borderTop: "2px solid",
                  borderColor: CONNECTOR_COLOR,
                }}
              />
            ) : null}
            {centers.map((center, index) => (
              <React.Fragment key={childGroups[index].key}>
                <Box
                  sx={{
                    position: "absolute",
                    top: 15,
                    left: center,
                    height: 18,
                    borderLeft: "2px solid",
                    borderColor: CONNECTOR_COLOR,
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: 31,
                    left: center - 4,
                    width: 0,
                    height: 0,
                    borderLeft: "4px solid transparent",
                    borderRight: "4px solid transparent",
                    borderTop: "6px solid",
                    borderTopColor: CONNECTOR_COLOR,
                  }}
                />
              </React.Fragment>
            ))}
          </Box>
          <Stack
            direction="row"
            spacing={`${BRANCH_GAP}px`}
            sx={{ width: childrenWidth, mx: "auto", alignItems: "flex-start" }}
          >
            {childGroups.map((child) => (
              <BranchNode
                key={child.key}
                group={child}
                model={model}
                unitKey={unitKey}
                disabled={disabled}
                activeId={activeId}
                scale={scale}
                onPositionClick={onPositionClick}
                collapsedGroups={collapsedGroups}
                onToggleGroup={onToggleGroup}
                highlightedId={highlightedId}
                registerPositionRef={registerPositionRef}
              />
            ))}
          </Stack>
        </>
      ) : null}
    </Box>
  );
}

function DepartmentRootDropZone({ unitKey, disabled, active, hasRoots }) {
  const droppable = useDroppable({ id: `root|${unitKey}|root`, disabled });

  return (
    <Box
      ref={droppable.setNodeRef}
      sx={{
        width: 210,
        height: active ? 46 : hasRoots ? 16 : 38,
        mx: "auto",
        my: 0.75,
        border: "1px dashed",
        borderColor: droppable.isOver ? "primary.main" : active ? "divider" : "transparent",
        borderRadius: 1.5,
        bgcolor: droppable.isOver ? "rgba(213, 0, 50, 0.06)" : "transparent",
        color: droppable.isOver ? "primary.main" : "text.secondary",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 700,
        transition: "height 120ms ease, border-color 120ms ease, background-color 120ms ease",
      }}
    >
      {active ? (droppable.isOver ? "Создать ветку отдела" : "Новая верхняя ветка") : null}
    </Box>
  );
}

function DepartmentBranch({
  department,
  disabled,
  activeId,
  scale,
  onPositionClick,
  collapsedGroups,
  onToggleGroup,
  highlightedId,
  registerPositionRef,
}) {
  const { model, unitKey, width } = department;
  const rootsWidth = model.contentWidth;
  let offset = 0;
  const centers = model.rootWidths.map((rootWidth) => {
    const center = offset + rootWidth / 2;
    offset += rootWidth + BRANCH_GAP;
    return center;
  });
  const firstCenter = centers[0] || rootsWidth / 2;
  const lastCenter = centers[centers.length - 1] || rootsWidth / 2;

  return (
    <Box sx={{ width, flex: `0 0 ${width}px` }}>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Paper
          variant="outlined"
          sx={{
            width: DEPARTMENT_WIDTH,
            minHeight: 64,
            px: 2,
            py: 1.25,
            boxSizing: "border-box",
            bgcolor: "background.paper",
            borderColor: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 16, fontWeight: 900, lineHeight: 1.25 }}>
              {department.name}
            </Typography>
            <Typography sx={{ mt: 0.25, fontSize: 12, color: "text.secondary" }}>
              {department.items.length} должностей
            </Typography>
          </Box>
        </Paper>
      </Box>

      <DepartmentRootDropZone
        unitKey={unitKey}
        disabled={disabled}
        active={activeId !== null}
        hasRoots={Boolean(model.roots.length)}
      />

      {model.roots.length ? (
        <>
          <Box
            sx={{
              position: "relative",
              width: rootsWidth,
              height: 40,
              mx: "auto",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: "50%",
                height: 17,
                borderLeft: "2px solid",
                borderColor: CONNECTOR_COLOR,
              }}
            />
            {model.roots.length > 1 ? (
              <Box
                sx={{
                  position: "absolute",
                  top: 16,
                  left: firstCenter,
                  width: lastCenter - firstCenter,
                  borderTop: "2px solid",
                  borderColor: CONNECTOR_COLOR,
                }}
              />
            ) : null}
            {centers.map((center, index) => (
              <React.Fragment key={model.roots[index].key}>
                <Box
                  sx={{
                    position: "absolute",
                    top: 16,
                    left: center,
                    height: 18,
                    borderLeft: "2px solid",
                    borderColor: CONNECTOR_COLOR,
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: 32,
                    left: center - 4,
                    width: 0,
                    height: 0,
                    borderLeft: "4px solid transparent",
                    borderRight: "4px solid transparent",
                    borderTop: "6px solid",
                    borderTopColor: CONNECTOR_COLOR,
                  }}
                />
              </React.Fragment>
            ))}
          </Box>
          <Stack
            direction="row"
            spacing={`${BRANCH_GAP}px`}
            alignItems="flex-start"
            sx={{ width: rootsWidth, mx: "auto" }}
          >
            {model.roots.map((root) => (
              <BranchNode
                key={root.key}
                group={root}
                model={model}
                unitKey={unitKey}
                disabled={disabled}
                activeId={activeId}
                scale={scale}
                onPositionClick={onPositionClick}
                collapsedGroups={collapsedGroups}
                onToggleGroup={onToggleGroup}
                highlightedId={highlightedId}
                registerPositionRef={registerPositionRef}
              />
            ))}
          </Stack>
        </>
      ) : null}
    </Box>
  );
}

export default function EmployeeAppointmentHierarchyTree({
  units,
  items,
  disabled,
  onChange,
  onInvalid,
  onPositionClick,
}) {
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());
  const departments = useMemo(() => {
    const options = units.map((unit) => ({
      id: Number(unit.id),
      name: unit.name,
      sort: Number(unit.sort ?? 0),
    }));
    const hasUnassigned = items.some((item) => item.unit_id === null || item.unit_id === undefined);

    if (hasUnassigned) {
      options.push({ id: null, name: "Без отдела", sort: Number.MAX_SAFE_INTEGER });
    }

    return options
      .sort(
        (left, right) =>
          left.sort - right.sort || String(left.name).localeCompare(String(right.name), "ru"),
      )
      .map((unit) => {
        const unitKey = unitKeyOf(unit.id);
        const departmentItems = items.filter((item) => unitKeyOf(item.unit_id) === unitKey);
        const model = buildModel(departmentItems, (groupKey) =>
          collapsedGroups.has(`${unitKey}|${groupKey}`),
        );

        return {
          ...unit,
          unitKey,
          items: departmentItems,
          model,
          width: Math.max(DEPARTMENT_WIDTH, model.contentWidth),
        };
      });
  }, [collapsedGroups, items, units]);
  const [activeId, setActiveId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [panMode, setPanMode] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [canvasHeight, setCanvasHeight] = useState(500);
  const [search, setSearch] = useState("");
  const [searchIndex, setSearchIndex] = useState(0);
  const viewportRef = useRef(null);
  const canvasRef = useRef(null);
  const panStartRef = useRef(null);
  const positionRefsRef = useRef(new Map());
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const activeItem = items.find((item) => Number(item.id) === Number(activeId));
  const normalizedSearch = search.trim().toLocaleLowerCase("ru");
  const departmentNames = useMemo(
    () => new Map(departments.map((department) => [department.unitKey, department.name])),
    [departments],
  );
  const searchMatches = useMemo(() => {
    if (!normalizedSearch) return [];

    return items.filter((item) =>
      `${item.name || ""} ${departmentNames.get(unitKeyOf(item.unit_id)) || ""}`
        .toLocaleLowerCase("ru")
        .includes(normalizedSearch),
    );
  }, [departmentNames, items, normalizedSearch]);
  const activeSearchItem = searchMatches[searchIndex] || null;
  const departmentWidths = departments.map((department) => department.width);
  const departmentsWidth =
    departmentWidths.reduce((sum, width) => sum + width, 0) +
    Math.max(0, departmentWidths.length - 1) * DEPARTMENT_GAP;
  const canvasWidth = Math.max(760, departmentsWidth + 64);
  let departmentOffset = 0;
  const departmentCenters = departmentWidths.map((width) => {
    const center = departmentOffset + width / 2;
    departmentOffset += width + DEPARTMENT_GAP;
    return center;
  });
  const firstDepartmentCenter = departmentCenters[0] || departmentsWidth / 2;
  const lastDepartmentCenter =
    departmentCenters[departmentCenters.length - 1] || departmentsWidth / 2;
  const canvasTopPadding = 112;
  const canvasBottomPadding = 128;

  const registerPositionRef = (itemId, node) => {
    if (node) {
      positionRefsRef.current.set(Number(itemId), node);
    } else {
      positionRefsRef.current.delete(Number(itemId));
    }
  };

  const toggleGroup = (groupKey) => {
    setCollapsedGroups((current) => {
      const next = new Set(current);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  };

  useEffect(() => {
    setSearchIndex(0);
  }, [normalizedSearch]);

  useEffect(() => {
    if (!searchMatches.length) {
      setSearchIndex(0);
      return;
    }

    setSearchIndex((current) => Math.min(current, searchMatches.length - 1));
  }, [searchMatches.length]);

  useEffect(() => {
    if (!activeSearchItem) return undefined;

    const unitKey = unitKeyOf(activeSearchItem.unit_id);
    const department = departments.find((item) => item.unitKey === unitKey);
    let parentKey = department?.model.groups.get(itemGroupKey(activeSearchItem))?.parentKey;
    const groupsToReveal = [];
    const visited = new Set();

    while (parentKey && !visited.has(parentKey)) {
      visited.add(parentKey);
      groupsToReveal.push(`${unitKey}|${parentKey}`);
      parentKey = department?.model.groups.get(parentKey)?.parentKey;
    }

    if (groupsToReveal.length) {
      setCollapsedGroups((current) => {
        const next = new Set(current);
        let changed = false;

        groupsToReveal.forEach((key) => {
          if (next.delete(key)) changed = true;
        });

        return changed ? next : current;
      });
    }

    if (zoom < 0.7) setZoom(0.7);

    let innerFrame;
    const outerFrame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => {
        const viewport = viewportRef.current;
        const node = positionRefsRef.current.get(Number(activeSearchItem.id));
        if (!viewport || !node) return;

        const viewportRect = viewport.getBoundingClientRect();
        const nodeRect = node.getBoundingClientRect();

        viewport.scrollBy({
          left: nodeRect.left + nodeRect.width / 2 - (viewportRect.left + viewportRect.width / 2),
          top: nodeRect.top + nodeRect.height / 2 - (viewportRect.top + viewportRect.height / 2),
          behavior: "smooth",
        });
      });
    });

    return () => {
      cancelAnimationFrame(outerFrame);
      if (innerFrame) cancelAnimationFrame(innerFrame);
    };
  }, [activeSearchItem?.id]);

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
    requestAnimationFrame(() => viewport.scrollTo({ left: 0, top: 0 }));
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const handleWheel = (event) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      updateZoom(zoom + (event.deltaY < 0 ? 0.1 : -0.1));
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", handleWheel);
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

    const [targetType, targetUnitKey, targetKey] = String(over.id).split("|");
    if (!["equal", "child", "root"].includes(targetType)) return;

    const sourceItem = items.find((item) => Number(item.id) === itemId);
    const sourceUnitKey = unitKeyOf(sourceItem?.unit_id);

    if (sourceUnitKey !== targetUnitKey) {
      onInvalid?.("Должность нельзя переносить в другой отдел");
      return;
    }

    const departmentItems = items.filter((item) => unitKeyOf(item.unit_id) === sourceUnitKey);
    const result = moveItem(departmentItems, itemId, targetType, targetKey);
    if (result.error) {
      onInvalid?.(result.error);
      return;
    }

    const nextMap = new Map(result.items.map((item) => [Number(item.id), item]));
    const nextItems = items.map((item) => nextMap.get(Number(item.id)) || item);
    const changed = nextItems.some((item, index) => {
      const previousItem = items[index];
      return (
        itemGroupKey(item) !== itemGroupKey(previousItem) ||
        itemParentGroupKey(item) !== itemParentGroupKey(previousItem) ||
        Number(item.group_sort ?? 0) !== Number(previousItem.group_sort ?? 0) ||
        Number(item.sort ?? 0) !== Number(previousItem.sort ?? 0)
      );
    });

    if (changed) onChange(nextItems);
  };

  const interactionDisabled = disabled || panMode;

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
          <Tooltip title="Раскрыть все ветки">
            <span>
              <IconButton
                size="small"
                disabled={!collapsedGroups.size}
                onClick={() => setCollapsedGroups(new Set())}
              >
                <ExpandMoreIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            position: "absolute",
            top: { xs: 56, sm: 8 },
            right: 8,
            zIndex: 5,
            p: 0.5,
            display: "flex",
            alignItems: "center",
            gap: 0.25,
            boxShadow: 2,
          }}
        >
          <TextField
            size="small"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Найти должность или отдел"
            aria-label="Поиск по иерархии"
            sx={{ width: { xs: 170, sm: 280 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    aria-label="Очистить поиск"
                    onClick={() => setSearch("")}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
          {normalizedSearch ? (
            <>
              <Typography
                sx={{
                  minWidth: 42,
                  textAlign: "center",
                  fontSize: 12,
                  color: searchMatches.length ? "text.secondary" : "error.main",
                }}
              >
                {searchMatches.length ? `${searchIndex + 1}/${searchMatches.length}` : "0"}
              </Typography>
              <IconButton
                size="small"
                aria-label="Предыдущий результат"
                disabled={searchMatches.length < 2}
                onClick={() =>
                  setSearchIndex((current) =>
                    current === 0 ? searchMatches.length - 1 : current - 1,
                  )
                }
              >
                <NavigateBeforeIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                aria-label="Следующий результат"
                disabled={searchMatches.length < 2}
                onClick={() => setSearchIndex((current) => (current + 1) % searchMatches.length)}
              >
                <NavigateNextIcon fontSize="small" />
              </IconButton>
            </>
          ) : null}
        </Paper>

        <Box
          ref={viewportRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopPanning}
          onPointerCancel={stopPanning}
          sx={{
            height: { xs: 540, md: 680 },
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
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Paper
                  variant="outlined"
                  sx={{
                    width: 280,
                    minHeight: 72,
                    px: 2,
                    py: 1.25,
                    boxSizing: "border-box",
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    boxShadow: 2,
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: 17, fontWeight: 900 }}>Высший уровень</Typography>
                    <Typography sx={{ mt: 0.25, fontSize: 12, opacity: 0.9 }}>
                      Виртуальный корневой узел
                    </Typography>
                  </Box>
                </Paper>
              </Box>

              <Box
                sx={{
                  position: "relative",
                  width: departmentsWidth,
                  height: 48,
                  mx: "auto",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    height: 20,
                    borderLeft: "2px solid",
                    borderColor: CONNECTOR_COLOR,
                  }}
                />
                {departments.length > 1 ? (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 19,
                      left: firstDepartmentCenter,
                      width: lastDepartmentCenter - firstDepartmentCenter,
                      borderTop: "2px solid",
                      borderColor: CONNECTOR_COLOR,
                    }}
                  />
                ) : null}
                {departmentCenters.map((center, index) => (
                  <React.Fragment key={departments[index].unitKey}>
                    <Box
                      sx={{
                        position: "absolute",
                        top: 19,
                        left: center,
                        height: 23,
                        borderLeft: "2px solid",
                        borderColor: CONNECTOR_COLOR,
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        top: 40,
                        left: center - 4,
                        width: 0,
                        height: 0,
                        borderLeft: "4px solid transparent",
                        borderRight: "4px solid transparent",
                        borderTop: "6px solid",
                        borderTopColor: CONNECTOR_COLOR,
                      }}
                    />
                  </React.Fragment>
                ))}
              </Box>

              <Stack
                direction="row"
                spacing={`${DEPARTMENT_GAP}px`}
                alignItems="flex-start"
                sx={{ width: departmentsWidth, mx: "auto" }}
              >
                {departments.map((department) => (
                  <DepartmentBranch
                    key={department.unitKey}
                    department={department}
                    disabled={interactionDisabled}
                    activeId={activeId}
                    scale={zoom}
                    onPositionClick={onPositionClick}
                    collapsedGroups={collapsedGroups}
                    onToggleGroup={toggleGroup}
                    highlightedId={activeSearchItem?.id}
                    registerPositionRef={registerPositionRef}
                  />
                ))}
              </Stack>
            </Box>
          </Box>
        </Box>
      </Box>

      <DragOverlay>
        {activeItem ? (
          <Paper
            sx={{ px: 1.5, py: 1, border: "1px solid #d50032", minWidth: 220 }}
            elevation={6}
          >
            <Typography sx={{ fontSize: 15, fontWeight: 800 }}>{activeItem.name}</Typography>
          </Paper>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
