import { useEffect, useRef } from "react";
import { Box, ButtonBase } from "@mui/material";

import { uiColors, uiControl, uiRadii, uiTypography } from "../tokens";

const getItemValue = (item) => item.value ?? item.id;

const getThumbLeft = (index, itemCount) => {
  const position = index / itemCount;
  const paddingOffset = uiControl.segmentPadding * (1 - position * 2);

  return `calc(${position * 100}% + ${paddingOffset}px)`;
};

export default function JacoPeriodSwitch({
  items = [],
  value,
  onChange,
  disabled = false,
  sx,
  tabSx,
  ...props
}) {
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => Object.is(getItemValue(item), value)),
  );
  const previousIndexRef = useRef(activeIndex);
  const directionRef = useRef(1);
  const hasMountedRef = useRef(false);
  const previousIndex = previousIndexRef.current;

  if (previousIndex !== activeIndex) {
    directionRef.current = activeIndex >= previousIndex ? 1 : -1;
  }

  useEffect(() => {
    hasMountedRef.current = true;
    previousIndexRef.current = activeIndex;
  }, [activeIndex]);

  const selectItem = (event, index) => {
    const item = items[index];

    if (!item || disabled || item.disabled) {
      return;
    }

    onChange?.(event, getItemValue(item));
  };

  const handleKeyDown = (event, index) => {
    const enabledIndexes = items.reduce((indexes, item, itemIndex) => {
      if (!item.disabled) {
        indexes.push(itemIndex);
      }

      return indexes;
    }, []);
    const currentPosition = enabledIndexes.indexOf(index);
    let nextPosition = currentPosition;

    if (["ArrowRight", "ArrowDown"].includes(event.key)) {
      nextPosition = (currentPosition + 1) % enabledIndexes.length;
    } else if (["ArrowLeft", "ArrowUp"].includes(event.key)) {
      nextPosition = (currentPosition - 1 + enabledIndexes.length) % enabledIndexes.length;
    } else if (event.key === "Home") {
      nextPosition = 0;
    } else if (event.key === "End") {
      nextPosition = enabledIndexes.length - 1;
    } else {
      return;
    }

    event.preventDefault();

    const nextIndex = enabledIndexes[nextPosition];
    const tabs = event.currentTarget.parentElement?.querySelectorAll('[role="tab"]');

    tabs?.[nextIndex]?.focus();
    selectItem(event, nextIndex);
  };

  const direction = directionRef.current;
  const itemCount = Math.max(items.length, 1);
  const activeThumbLeft = getThumbLeft(activeIndex, itemCount);
  const activeThumbRight = getThumbLeft(itemCount - activeIndex - 1, itemCount);
  const thumbTransition =
    direction > 0
      ? [
          "right 260ms cubic-bezier(0.2, 0.9, 0.3, 1)",
          "left 380ms cubic-bezier(0.22, 1.12, 0.36, 1) 170ms",
        ].join(", ")
      : [
          "left 260ms cubic-bezier(0.2, 0.9, 0.3, 1)",
          "right 380ms cubic-bezier(0.22, 1.12, 0.36, 1) 170ms",
        ].join(", ");

  return (
    <Box
      role="tablist"
      {...props}
      sx={{
        position: "relative",
        isolation: "isolate",
        display: "grid",
        gridTemplateColumns: `repeat(${itemCount}, minmax(0, 1fr))`,
        minHeight: 48,
        p: `${uiControl.segmentPadding}px`,
        overflow: "hidden",
        borderRadius: uiRadii.md,
        backgroundColor: uiColors.surfaceMuted,
        "@keyframes jacoPeriodLabelSettle": {
          "0%": { opacity: 0.5, transform: `translateX(${direction * 10}px)` },
          "45%": { opacity: 0.72, transform: `translateX(${direction * 4}px)` },
          "78%": { opacity: 1, transform: "translateX(0) scale(1.02)" },
          "100%": { opacity: 1, transform: "translateX(0) scale(1)" },
        },
        "@media (prefers-reduced-motion: reduce)": {
          "& [data-jaco-period-thumb]": {
            transition: "none !important",
          },
          "& [role='tab']": {
            transition: "none !important",
          },
          "& [role='tab'] > span": {
            animation: "none !important",
          },
        },
        ...sx,
      }}
    >
      {items.length > 0 ? (
        <Box
          data-jaco-period-thumb
          data-direction={direction > 0 ? "forward" : "backward"}
          aria-hidden="true"
          sx={{
            position: "absolute",
            zIndex: 0,
            top: `${uiControl.segmentPadding}px`,
            bottom: `${uiControl.segmentPadding}px`,
            left: activeThumbLeft,
            right: activeThumbRight,
            boxSizing: "border-box",
            overflow: "hidden",
            border: "1px solid rgba(255, 255, 255, 0.82)",
            borderRadius: uiRadii.sm,
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 255, 255, 0.68) 100%)",
            boxShadow:
              "0 3px 10px rgba(17, 24, 39, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(17, 24, 39, 0.035)",
            backdropFilter: "blur(8px) saturate(140%)",
            WebkitBackdropFilter: "blur(8px) saturate(140%)",
            pointerEvents: "none",
            transition: thumbTransition,
            willChange: "left, right",
            "&::after": {
              content: '\"\"',
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 55%)",
            },
          }}
        />
      ) : null}

      {items.map((item, index) => {
        const itemValue = getItemValue(item);
        const isActive = index === activeIndex;

        return (
          <ButtonBase
            key={item.id ?? itemValue}
            disableRipple
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            disabled={disabled || item.disabled}
            onClick={(event) => selectItem(event, index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            sx={{
              position: "relative",
              zIndex: 2,
              minWidth: 0,
              minHeight: 32,
              px: 1.5,
              borderRadius: uiRadii.sm,
              color: uiColors.text,
              fontSize: uiTypography.bodyLarge.fontSize,
              lineHeight: uiTypography.bodyLarge.lineHeight,
              fontWeight: uiTypography.bodyLarge.fontWeight,
              transition: "color 180ms ease 120ms, transform 120ms ease",
              "&:active": {
                transform: "scale(0.985)",
              },
              "&.Mui-focusVisible": {
                outline: `2px solid ${uiColors.primary}`,
                outlineOffset: -2,
              },
              "&.Mui-disabled": {
                color: uiColors.textMuted,
              },
              ...tabSx,
              '&[aria-selected="true"]': {
                color: `${uiColors.primary} !important`,
              },
              '&[aria-selected="true"] > span': {
                animation: hasMountedRef.current
                  ? "jacoPeriodLabelSettle 520ms cubic-bezier(0.22, 1, 0.36, 1) both"
                  : "none",
              },
            }}
          >
            <Box
              key={`${itemValue}-${isActive ? "active" : "inactive"}`}
              component="span"
              sx={{ display: "inline-block" }}
            >
              {item.label ?? item.name ?? item.id}
            </Box>
          </ButtonBase>
        );
      })}
    </Box>
  );
}
