import test from "node:test";
import assert from "node:assert/strict";
import {
  allowedCommands,
  availableTabs,
  canRemoveError,
  commandPermission,
  normalizePermissions,
  orderForViewer,
  resolveTab,
} from "../../../components/errors_management/errorsManagementPermissions.mjs";

const full = normalizePermissions({
  tabs: { journal: true, registration: true, statistics: true, settings: true },
  settings_edit: true,
  commands: {
    send_to_cafe: true,
    resolve: true,
    cafe_decision: true,
    cancel: true,
    remove_error: true,
  },
  tel: true,
});

test("missing permissions deny every tab, command and the phone", () => {
  const none = normalizePermissions(undefined);
  assert.deepEqual(availableTabs(none), []);
  assert.equal(none.settings_edit, false);
  assert.equal(none.tel, false);
  assert.ok(Object.values(none.commands).every((value) => value === false));
  assert.equal(resolveTab("journal", availableTabs(none)), null);
});

test("only granted tabs are shown in module order and the current tab falls back", () => {
  const permissions = normalizePermissions({ tabs: { settings: true, statistics: 1, journal: false } });
  assert.deepEqual(
    availableTabs(permissions).map((tab) => tab.id),
    ["statistics", "settings"],
  );
  assert.equal(resolveTab("journal", availableTabs(permissions)), "statistics");
  assert.equal(resolveTab("settings", availableTabs(permissions)), "settings");
});

test("string or object values do not grant a right", () => {
  const permissions = normalizePermissions({ tabs: { journal: "true" }, tel: {}, settings_edit: "0" });
  assert.equal(permissions.tabs.journal, false);
  assert.equal(permissions.tel, false);
  assert.equal(permissions.settings_edit, false);
});

test("resolve maps to the contact-centre or cafe right by status", () => {
  assert.equal(commandPermission("resolve", "registered"), "resolve");
  assert.equal(commandPermission("resolve", "accepted_by_cafe"), "cafe_decision");
  assert.equal(commandPermission("accept", "sent_to_cafe"), "cafe_decision");
  assert.equal(commandPermission("return_to_cc", "sent_to_cafe"), "cafe_decision");
  assert.equal(commandPermission("send_to_cafe", "registered"), "send_to_cafe");
  assert.equal(commandPermission("cancel", "registered"), "cancel");
  assert.equal(commandPermission("submit", "draft"), null);
});

test("commands need both the backend list and the matching right", () => {
  const detail = { status: "registered", available_commands: ["send_to_cafe", "resolve", "cancel"] };
  assert.deepEqual(allowedCommands(detail, full), ["send_to_cafe", "resolve", "cancel"]);

  const contactCentre = normalizePermissions({ commands: { send_to_cafe: true } });
  assert.deepEqual(allowedCommands(detail, contactCentre), ["send_to_cafe"]);

  const cafe = normalizePermissions({ commands: { cafe_decision: true } });
  assert.deepEqual(allowedCommands(detail, cafe), []);
  assert.deepEqual(
    allowedCommands({ status: "accepted_by_cafe", available_commands: ["resolve", "return_to_cc"] }, cafe),
    ["resolve", "return_to_cc"],
  );
  assert.deepEqual(allowedCommands({ status: "registered" }, full), []);
  assert.deepEqual(allowedCommands({ status: "registered", available_commands: ["submit"] }, full), []);
});

test("error removal needs can_remove, the right and an active error", () => {
  assert.equal(canRemoveError({ id: 1, can_remove: true }, full), true);
  assert.equal(canRemoveError({ id: 1, can_remove: false }, full), false);
  assert.equal(canRemoveError({ id: 1 }, full), false);
  assert.equal(
    canRemoveError({ id: 1, can_remove: true, removed_at: "2026-11-18 10:00:00" }, full),
    false,
  );
  assert.equal(canRemoveError({ id: 1, can_remove: true }, normalizePermissions({})), false);
});

test("order details hide only the phone without the tel right", () => {
  const details = { order: { order_id: 7, number: "79990001122", sum_order: 100 }, order_items: [] };
  assert.equal(orderForViewer(details, true), details);
  const hidden = orderForViewer(details, false);
  assert.equal(hidden.order.number, "");
  assert.equal(hidden.order.sum_order, 100);
  assert.equal(details.order.number, "79990001122");
  assert.equal(orderForViewer(null, false), null);
  assert.deepEqual(orderForViewer({ order: null }, false), { order: null });
});
