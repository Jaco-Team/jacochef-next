import { uiColors } from "../../design-system/shared/tokens/index.js";

const HOLIDAY_STRIPE_PERIOD = 12;
const HOLIDAY_STRIPE_TILE_SIZE = HOLIDAY_STRIPE_PERIOD * Math.SQRT2;

const TEAM_BONUS_TONES = {
  // Решения ещё нет: кнопка заметна, но не говорит ни о выдаче, ни об отказе.
  0: { border: "#A6A6A6", background: uiColors.surfaceMuted, color: uiColors.textStrong, hover: "#6B7280" },
  1: { border: uiColors.success, background: "#ECFDF3", color: uiColors.successHover, hover: uiColors.success },
  2: { border: uiColors.primary, background: uiColors.primarySoft, color: uiColors.primary, hover: uiColors.primary },
};

const TEAM_BONUS_STATUS_TEXT = {
  0: "решение не принято",
  1: "выдан",
  2: "отказано",
};

export function getTeamBonusStatusText(periodBonusState) {
  return `Командный бонус: ${TEAM_BONUS_STATUS_TEXT[Number(periodBonusState)] ?? TEAM_BONUS_STATUS_TEXT[0]}`;
}

// Кнопка в шапке колонки: выглядит кнопкой, цвет показывает решение за период.
export function getTeamBonusHeaderActionSx(periodBonusState) {
  const tone = TEAM_BONUS_TONES[Number(periodBonusState)] ?? TEAM_BONUS_TONES[0];

  return {
    appearance: "none",
    boxSizing: "border-box",
    m: 0,
    px: 0,
    py: 0.5,
    width: "100%",
    display: "block",
    border: `1px solid ${tone.border}`,
    borderRadius: "8px",
    backgroundColor: tone.background,
    color: tone.color,
    font: "inherit",
    fontWeight: 700,
    textAlign: "center",
    whiteSpace: "normal",
    cursor: "pointer",
    transition: "background-color 0.15s ease, color 0.15s ease",
    "&:hover": { backgroundColor: tone.hover, borderColor: tone.hover, color: "#FFFFFF" },
    "&:focus-visible": { outline: `2px solid ${tone.border}`, outlineOffset: 2 },
  };
}

export const staffScheduleFinancialValueStyle = {
  textDecorationLine: "underline",
  textDecorationStyle: "dotted",
  textUnderlineOffset: "3px",
};

export const staffScheduleFinancialFocusSx = {
  "&:focus-visible": { outline: "2px solid currentColor", outlineOffset: -2 },
};

export function getHolidayStripeSx(baseBackground, dayIndex, dayColumnWidth) {
  return {
    backgroundColor: baseBackground,
    backgroundImage: `repeating-linear-gradient(-45deg, ${baseBackground} 0, ${baseBackground} 8px, rgba(255, 0, 0, 0.3) 8px, rgba(255, 0, 0, 0.3) 12px)`,
    backgroundSize: `${HOLIDAY_STRIPE_TILE_SIZE}px ${HOLIDAY_STRIPE_TILE_SIZE}px`,
    backgroundPosition: `${-(dayIndex * dayColumnWidth)}px 0`,
    backgroundRepeat: "repeat",
  };
}
