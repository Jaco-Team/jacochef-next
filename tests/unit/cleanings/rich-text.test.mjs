import test from "node:test";
import assert from "node:assert/strict";
import {
  getRichTextBaseline,
  htmlToText,
  isRichTextChanged,
  isSameRichText,
  settleRichTextBaseline,
} from "../../../components/cleanings/richText.mjs";

const STORED = "Протереть <b>стол</b>&nbsp;и пол";
const LOADED = "<p>Протереть <strong>стол</strong>&nbsp;и пол</p>";

// Mirrors the categories card: settle on every editor emission, compare the latest value.
function emit(state, value, userEdit) {
  return {
    ...state,
    value,
    baseline: settleRichTextBaseline(state.baseline, {
      key: state.key,
      stored: state.stored,
      value,
      userEdit,
    }),
  };
}

function isChanged(state) {
  return isRichTextChanged(
    state.value,
    state.stored,
    getRichTextBaseline(state.baseline, state.key, state.stored),
  );
}

test("isSameRichText ignores only line breaks between tags and outer whitespace", () => {
  assert.equal(isSameRichText("<p>a</p>\n<p>b</p>\n", " <p>a</p><p>b</p>"), true);
  assert.equal(isSameRichText("<p>a</p>\r\n  <ul>\n<li>b</li>\n</ul>", "<p>a</p><ul><li>b</li></ul>"), true);
  assert.equal(isSameRichText(null, ""), true);
  assert.equal(isSameRichText("<p>a b</p>", "<p>a  b</p>"), false);
  assert.equal(isSameRichText("<p>a</p>", '<p style="color: #e03e2d;">a</p>'), false);
  assert.equal(isSameRichText("<p>a</p>", '<p style="text-align: center;">a</p>'), false);
  assert.equal(isSameRichText("<p>a</p>", '<p style="padding-left: 40px;">a</p>'), false);
  assert.equal(isSameRichText("<p>a</p>", '<p><span style="color: red;">a</span></p>'), false);
});

test("a freshly loaded category is not dirty after the editor re-serializes stored HTML", () => {
  let state = { key: "8", stored: STORED, baseline: null, value: STORED };
  assert.equal(isChanged(state), false);

  state = emit(state, LOADED, false);
  assert.equal(state.baseline.value, LOADED);
  assert.equal(isChanged(state), false);
});

test("formatting edits after the load are dirty, reverting them is not", () => {
  let state = emit({ key: "8", stored: STORED, baseline: null, value: STORED }, LOADED, false);

  for (const formatted of [
    '<p><span style="color: #e03e2d;">Протереть</span> <strong>стол</strong>&nbsp;и пол</p>',
    '<p style="text-align: center;">Протереть <strong>стол</strong>&nbsp;и пол</p>',
    '<p style="padding-left: 40px;">Протереть <strong>стол</strong>&nbsp;и пол</p>',
    "<p>Протереть <strong>стол</strong>&nbsp;и пол!</p>",
  ]) {
    assert.equal(isChanged(emit(state, formatted, true)), true, formatted);
  }

  state = emit(emit(state, '<p style="text-align: center;">x</p>', true), `${LOADED}\n`, true);
  assert.equal(state.baseline.value, LOADED);
  assert.equal(isChanged(state), false);
});

test("canonical stored HTML: the first user edit does not become the baseline", () => {
  const stored = "<p>Протереть стол</p>";
  let state = emit({ key: "8", stored, baseline: null, value: stored }, '<p style="color: red;">Протереть стол</p>', true);
  assert.equal(state.baseline.value, stored);
  assert.equal(isChanged(state), true);

  // A second editor mirroring the edited value must not move the baseline.
  state = emit(state, '<p style="color: red;">Протереть стол</p>', false);
  assert.equal(state.baseline.value, stored);
  assert.equal(isChanged(state), true);
});

test("the baseline applies only to its category and stored value", () => {
  const baseline = settleRichTextBaseline(null, {
    key: "8",
    stored: STORED,
    value: LOADED,
    userEdit: false,
  });

  assert.equal(getRichTextBaseline(baseline, "8", STORED), LOADED);
  assert.equal(getRichTextBaseline(baseline, "9", STORED), STORED);
  assert.equal(getRichTextBaseline(baseline, "8", "<p>Сохранено заново</p>"), "<p>Сохранено заново</p>");
  assert.equal(getRichTextBaseline(null, "new", undefined), "");

  // Without a drafted instruction the card shows the stored value: never changed.
  assert.equal(isRichTextChanged(STORED, STORED, LOADED), false);
  assert.equal(isRichTextChanged(LOADED, STORED), true);
});

test("htmlToText keeps one line per block and decodes entities", () => {
  assert.equal(
    htmlToText("<p>Шаг&nbsp;1 &laquo;мыть&raquo;</p><ul><li>стол</li><li>пол</li></ul><p><br></p>"),
    "Шаг 1 «мыть»\n• стол\n• пол",
  );
  assert.equal(htmlToText(null), "");
});
