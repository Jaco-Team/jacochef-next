import test from "node:test";
import assert from "node:assert/strict";
import {
  buildCustomHourSlots,
  buildHourSlotId,
  getHiddenRecentHourSlotsKey,
  isCustomHourRange,
  readHiddenRecentHourSlots,
  writeHiddenRecentHourSlots,
} from "../../../components/staff_schedule/staffScheduleHourPresets.js";

test("custom hour slots normalize and deduplicate ranges across current and recent days", () => {
  const slots = buildCustomHourSlots(
    [{ type: 3, time_start: "11:00:00", time_end: "17:00:00" }],
    [
      { time_start: "11:00", time_end: "17:00" },
      { time_start: "12:00:00", time_end: "19:00:00" },
      { time_start: "10:00:00", time_end: "22:00:00" },
    ],
  );

  assert.deepEqual(
    slots.map((slot) => [slot.id, slot.isRecentOnly]),
    [
      ["custom-11:00-17:00", false],
      ["custom-12:00-19:00", true],
    ],
  );
  assert.equal(
    buildHourSlotId({ type: 0, time_start: "11:00:00", time_end: "17:00" }),
    "11:00-17:00",
  );
  assert.equal(isCustomHourRange({ time_start: "10:00:00", time_end: "22:00:00" }), false);
});

test("hidden recent intervals are stored per employee and position without affecting current month", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  const key = getHiddenRecentHourSlotsKey(11, 22);
  const anotherPositionKey = getHiddenRecentHourSlotsKey(11, 23);
  const slotId = "custom-12:00-19:00";

  assert.equal(writeHiddenRecentHourSlots(storage, key, [slotId]), true);
  assert.deepEqual(readHiddenRecentHourSlots(storage, key), [slotId]);
  assert.deepEqual(readHiddenRecentHourSlots(storage, anotherPositionKey), []);
  assert.equal(
    buildCustomHourSlots(
      [{ type: 3, time_start: "12:00", time_end: "19:00" }],
      [{ time_start: "12:00", time_end: "19:00" }],
    )[0].isRecentOnly,
    false,
  );

  values.set(key, "invalid json");
  assert.deepEqual(readHiddenRecentHourSlots(storage, key), []);
  assert.equal(writeHiddenRecentHourSlots(null, key, [slotId]), false);
});
