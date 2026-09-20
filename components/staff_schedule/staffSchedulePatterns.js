const HOLIDAY_STRIPE_PERIOD = 12;
const HOLIDAY_STRIPE_TILE_SIZE = HOLIDAY_STRIPE_PERIOD * Math.SQRT2;

export function getHolidayStripeSx(baseBackground, dayIndex, dayColumnWidth) {
  return {
    backgroundColor: baseBackground,
    backgroundImage: `repeating-linear-gradient(-45deg, ${baseBackground} 0, ${baseBackground} 8px, rgba(255, 0, 0, 0.3) 8px, rgba(255, 0, 0, 0.3) 12px)`,
    backgroundSize: `${HOLIDAY_STRIPE_TILE_SIZE}px ${HOLIDAY_STRIPE_TILE_SIZE}px`,
    backgroundPosition: `${-(dayIndex * dayColumnWidth)}px 0`,
    backgroundRepeat: "repeat",
  };
}
