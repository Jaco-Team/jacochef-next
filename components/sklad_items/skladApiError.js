export function getSkladApiError(error, fallback) {
  const response = error?.response?.data;
  const message = response?.data?.text || response?.text || response?.message;
  return typeof message === "string" && message.trim() ? message : error?.message || fallback;
}
