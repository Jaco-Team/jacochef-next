import test from "node:test";
import assert from "node:assert/strict";
import {
  domainError,
  fieldErrorsWithPrefix,
  normalizeFieldErrors,
  requestErrorText,
  requestFieldErrors,
} from "../../../components/errors_management/requestErrors.mjs";

test("domain errors keep the backend text and the first message per field", () => {
  const error = domainError({
    st: false,
    text: "Выберите этап, настроенный для этой ошибки",
    errors: { "errors.1.stage_id": ["Выберите этап, настроенный для этой ошибки"], comment: "Слишком длинный" },
  });
  assert.equal(requestErrorText(error, "fallback"), "Выберите этап, настроенный для этой ошибки");
  assert.deepEqual(requestFieldErrors(error), {
    "errors.1.stage_id": "Выберите этап, настроенный для этой ошибки",
    comment: "Слишком длинный",
  });
});

test("network failures fall back to the caller message", () => {
  const networkError = new Error("Network Error");
  assert.equal(requestErrorText(networkError, "Не удалось загрузить журнал."), "Не удалось загрузить журнал.");
  assert.deepEqual(requestFieldErrors(networkError), {});
  assert.equal(requestErrorText(domainError({ st: false }), "x"), "Не удалось выполнить запрос.");
});

test("malformed field maps are ignored", () => {
  assert.deepEqual(normalizeFieldErrors(null), {});
  assert.deepEqual(normalizeFieldErrors(["text"]), {});
  assert.deepEqual(normalizeFieldErrors({ a: [], b: [""], c: [1], d: ["ok"] }), { d: "ok" });
});

test("field errors are grouped by form row prefix", () => {
  const fields = {
    "errors.0.stage_id": "Этап",
    "errors.1.ingredient_id": "Продукт",
    "errors.10.error_id": "Ошибка",
    common_comment: "Комментарий",
  };
  assert.deepEqual(fieldErrorsWithPrefix(fields, "errors.1."), [
    { field: "ingredient_id", message: "Продукт" },
  ]);
  assert.deepEqual(fieldErrorsWithPrefix(fields, "errors.2."), []);
});
