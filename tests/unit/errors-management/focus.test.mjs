import test from "node:test";
import assert from "node:assert/strict";
import { focusFirstInput, moveFocusInto } from "../../../components/errors_management/focusModel.mjs";

function element(name, { parent = null, children = [] } = {}) {
  const node = {
    name,
    focused: 0,
    options: null,
    parent,
    children,
    focus(options) {
      this.focused += 1;
      this.options = options;
    },
    contains(other) {
      let current = other;
      while (current) {
        if (current === this) return true;
        current = current.parent;
      }
      return false;
    },
    closest() {
      return this.parent || null;
    },
    querySelector(selector) {
      return selector === "input" ? this.children.find((child) => child.name === "input") || null : null;
    },
  };
  children.forEach((child) => {
    child.parent = node;
  });
  return node;
}

test("focus moves into the form when it is still on the page behind the modal", () => {
  const modal = element("dialog");
  const content = element("content", { parent: modal });
  const pageInput = element("order-id");
  assert.equal(moveFocusInto(content, { activeElement: pageInput }), true);
  assert.equal(content.focused, 1);
  assert.deepEqual(content.options, { preventScroll: true });
});

test("focus is left alone when it is already inside the modal", () => {
  const modal = element("dialog");
  const content = element("content", { parent: modal });
  const closeButton = element("close", { parent: modal });
  assert.equal(moveFocusInto(content, { activeElement: closeButton }), false);
  assert.equal(content.focused, 0);
  assert.equal(moveFocusInto(null, { activeElement: closeButton }), false);
});

test("a new error card focuses the search input of its picker", () => {
  const input = element("input");
  const root = element("autocomplete", { children: [input] });
  assert.equal(focusFirstInput(root), true);
  assert.equal(input.focused, 1);
  assert.equal(focusFirstInput(element("empty")), false);
  assert.equal(focusFirstInput(null), false);
});
