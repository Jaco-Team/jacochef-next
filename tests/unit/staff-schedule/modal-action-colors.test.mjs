import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { parse } = require("@babel/parser");
const moduleRoot = new URL("../../../components/staff_schedule/", import.meta.url);
const source = (name) => readFileSync(new URL(name, moduleRoot), "utf8");
const ast = (text) => parse(text, { sourceType: "module", plugins: ["jsx"] });
function nodes(root, predicate) {
  const found = [];
  const visit = (node) => {
    if (!node || typeof node !== "object") return;
    if (predicate(node)) found.push(node);
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === "object") visit(value);
    }
  };
  visit(root);
  return found;
}
const prop = (node, key) => node.openingElement.attributes.find((item) => item.name?.name === key);
const text = (node) =>
  node.children
    .filter((item) => item.type === "JSXText")
    .map((item) => item.value.trim())
    .join("");
const property = (node, name) => node.properties.find((item) => item.key?.name === name)?.value;

test("staff schedule modal saves and cancellations use shared semantic tones without disabled overrides", () => {
  const files = readdirSync(new URL("modals/", moduleRoot)).filter((name) => name.endsWith(".jsx"));
  let count = 0;
  for (const file of files) {
    const buttons = nodes(
      ast(source(`modals/${file}`)),
      (node) => node.type === "JSXElement" && node.openingElement.name?.name === "JacoButton",
    );
    for (const button of buttons) {
      const label = text(button);
      const expected = /^(Отмена|Отменить)$/.test(label)
        ? "danger"
        : /^(Сохранить|Добавить|Обжаловать|Скачать)$/.test(label)
          ? "success"
          : null;
      if (!expected) continue;
      count++;
      assert.equal(prop(button, "tone")?.value?.value, expected, `${file}: ${label}`);
      const style = prop(button, "sx")?.value?.expression;
      assert.equal(
        nodes(
          style,
          (node) =>
            node.type === "ObjectProperty" &&
            ["color", "backgroundColor", "&.Mui-disabled"].includes(
              node.key?.value || node.key?.name,
            ),
        ).length,
        0,
        `${file}: ${label} must inherit JacoButton colors and gray disabled state`,
      );
    }
  }
  assert.equal(count, 15);
  assert.match(
    source("modals/StaffScheduleDayModal.jsx"),
    /tone=\{canSave \? "danger" : "secondary"\}/,
  );
  assert.match(source("modals/StaffScheduleDayModal.jsx"), /\{canSave \? "Отменить" : "Закрыть"\}/);
  const inline = nodes(
    ast(source("modals/StaffScheduleFastActionsDialog.jsx")),
    (node) => node.type === "FunctionDeclaration" && node.id?.name === "InlineActions",
  )[0];
  const buttons = nodes(
    inline,
    (node) => node.type === "JSXElement" && node.openingElement.name?.name === "JacoButton",
  );
  assert.deepEqual(
    buttons.map((node) => prop(node, "tone")?.value?.value),
    ["danger", "success"],
  );
  assert.match(
    source("modals/StaffScheduleFastActionsDialog.jsx"),
    /disabled=\{doneDisabled \|\| busy\}/,
  );
  assert.match(
    source("modals/StaffScheduleSummaryActionDialog.jsx"),
    /disabled=\{value === "" \|\| !hasChanges\}/,
  );
});

test("every staff schedule confirmation sets cancellation and constructive/destructive confirmation tones explicitly", () => {
  const files = [
    "useStaffSchedulePage.js",
    "useStaffScheduleFastActions.js",
    ...readdirSync(new URL("modals/", moduleRoot))
      .filter((name) => name.endsWith(".jsx"))
      .map((name) => `modals/${name}`),
  ];
  let count = 0;
  for (const file of files) {
    const calls = nodes(
      ast(source(file)),
      (node) =>
        node.type === "CallExpression" && ["confirm", "withConfirm"].includes(node.callee?.name),
    );
    for (const call of calls) {
      const options = call.arguments[call.callee.name === "confirm" ? 0 : 1];
      assert.equal(options?.type, "ObjectExpression", file);
      assert.equal(property(options, "cancelTone")?.value, "danger", file);
      const label = property(options, "confirmLabel");
      const tone = property(options, "confirmTone");
      if (label?.type === "StringLiteral") {
        assert.equal(
          tone?.value,
          /сохранить|Обжаловать|Сменить/i.test(label.value) ? "success" : "danger",
          `${file}: ${label.value}`,
        );
      } else {
        assert.equal(tone?.type, "ConditionalExpression", file);
        assert.deepEqual([tone.consequent.value, tone.alternate.value].sort(), [
          "danger",
          "success",
        ]);
      }
      count++;
    }
  }
  assert.equal(count, 16);
});

test("JacoConfirm cancellation is opt-in and global defaults remain secondary", () => {
  const tree = ast(
    readFileSync(
      new URL("../../../design-system/shared/ui/JacoConfirm.jsx", import.meta.url),
      "utf8",
    ),
  );
  const defaults = nodes(
    tree,
    (node) => node.type === "VariableDeclarator" && node.id?.name === "DEFAULT_OPTIONS",
  )[0].init;
  assert.equal(property(defaults, "cancelTone").value, "secondary");
  assert.equal(property(defaults, "confirmTone").value, "secondary");
  const cancel = nodes(
    tree,
    (node) => node.type === "JSXElement" && node.openingElement.name?.name === "JacoButton",
  )[0];
  assert.equal(prop(cancel, "tone").value.expression.object.name, "state");
  assert.equal(prop(cancel, "tone").value.expression.property.name, "cancelTone");
});
