export function formatNumber(num, mindec = 2, maxdec = 2) {
  // console.log(`Incoming to format: ${num}`);
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: mindec,
    maximumFractionDigits: maxdec,
  }).format(Number(num));
}
