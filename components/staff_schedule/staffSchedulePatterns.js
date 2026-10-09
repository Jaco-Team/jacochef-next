const HOLIDAY_STRIPE_PERIOD = 12;
const HOLIDAY_STRIPE_TILE_SIZE = HOLIDAY_STRIPE_PERIOD * Math.SQRT2;

export const staffScheduleHeaderActionSx = {
  appearance: "none",
  border: 0,
  p: 0,
  m: 0,
  width: "100%",
  display: "block",
  backgroundColor: "transparent",
  color: "inherit",
  font: "inherit",
  textAlign: "center",
  whiteSpace: "normal",
  cursor: "pointer",
  "&:hover": { textDecoration: "underline" },
  "&:focus-visible": { outline: "2px solid currentColor", outlineOffset: 2 },
};

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
