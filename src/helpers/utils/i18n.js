export function formatNumber(num, mindec = 2, maxdec = null) {
  // console.log(`Incoming to format: ${num}`);
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: mindec,
    maximumFractionDigits: maxdec || mindec,
  }).format(Number(num));
}
