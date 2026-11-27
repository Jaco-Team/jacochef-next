import { expect, test } from "vitest";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";

// Execute the shared permission policy, rather than duplicating its implementation.
test.each([
  [null, [false, false, false]],
  [{ settings_driver_view: 1 }, [true, false, false]],
  [{ settings_driver_edit: "1" }, [true, true, false]],
  [{ settings_driver_access: 1 }, [true, true, true]],
  [{ settings_driver_view: 0, settings_driver_edit: 0 }, [false, false, false]],
])("shared permission policy respects supplied capabilities: %j", (access, expected) => {
  const { userCan } = handleUserAccess(access);
  expect(["view", "edit", "access"].map((action) => userCan(action, "settings_driver"))).toEqual(
    expected,
  );
  expect(userCan("edit", "kkt_info")).toBe(false);
});
