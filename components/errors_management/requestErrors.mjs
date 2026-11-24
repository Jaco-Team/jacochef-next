export class ErrorsManagementRequestError extends Error {
  constructor(text, fieldErrors = null) {
    super(text);
    this.name = "ErrorsManagementRequestError";
    this.isDomainError = true;
    this.fieldErrors = normalizeFieldErrors(fieldErrors);
  }
}

export function normalizeFieldErrors(errors) {
  if (!errors || typeof errors !== "object" || Array.isArray(errors)) return {};
  return Object.fromEntries(
    Object.entries(errors)
      .map(([field, messages]) => [
        field,
        Array.isArray(messages) ? messages.find((message) => typeof message === "string") : messages,
      ])
      .filter(([, message]) => typeof message === "string" && message.trim() !== ""),
  );
}

export function domainError(response, fallback = "Не удалось выполнить запрос.") {
  return new ErrorsManagementRequestError(
    typeof response?.text === "string" && response.text.trim() ? response.text : fallback,
    response?.errors,
  );
}

export function requestErrorText(error, fallback) {
  return error?.isDomainError && error.message ? error.message : fallback;
}

export function requestFieldErrors(error) {
  return error?.isDomainError ? error.fieldErrors || {} : {};
}

export function fieldErrorsWithPrefix(fieldErrors, prefix) {
  return Object.entries(fieldErrors || {})
    .filter(([field]) => field.startsWith(prefix))
    .map(([field, message]) => ({ field: field.slice(prefix.length), message }));
}
