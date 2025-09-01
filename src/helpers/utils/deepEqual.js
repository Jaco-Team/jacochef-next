/**
 * @param {{}} obj1
 * @param {{}} obj2
 * @returns {boolean}
 */
export default function deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;

  if (typeof obj1 !== "object" || obj1 === null || typeof obj2 !== "object" || obj2 === null) {
    return false;
  }

  let keys1 = Object.keys(obj1).filter((key) => key !== "cafe_handle_close");
  let keys2 = Object.keys(obj2).filter((key) => key !== "cafe_handle_close");

  if (keys1.length !== keys2.length) return false;

  for (let key of keys1) {
    if (
      !keys2.includes(key) ||
      !deepEqual(normalizeValue(obj1[key]), normalizeValue(obj2[key]))
    ) {
      return false;
    }
  }

  return true;
}

function normalizeValue(value) {
  if (typeof value === "string") {
    return value.trim().toLowerCase();
  }
  if (typeof value === "number") {
    return value.toString();
  }
  return value;
}
