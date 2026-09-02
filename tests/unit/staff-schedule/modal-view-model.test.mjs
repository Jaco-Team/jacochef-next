import test from "node:test";
import assert from "node:assert/strict";
import { buildDayModalViewModel } from "../../../components/staff_schedule/staffScheduleModalViewModel.js";

test("buildDayModalViewModel reads assignment fields from the day payload", () => {
  const model = buildDayModalViewModel({
    h_info: {
      date: "2026-09-11",
      new_app: 12,
      mentor_id: 34,
      user_temp: "36,6",
      type_healf: 2,
      user: {
        user_name: "Орифов Д. О.",
        app_name: "Повар",
      },
    },
    other_app: [{ id: 12, name: "Повар" }],
  });

  assert.equal(model.newApp, 12);
  assert.equal(model.mentorId, 34);
  assert.equal(model.userTemp, "36,6");
  assert.equal(model.typeHealf, 2);
});
