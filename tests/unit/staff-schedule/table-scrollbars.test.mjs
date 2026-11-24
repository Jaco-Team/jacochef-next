import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../../../components/staff_schedule/sections/StaffScheduleTableSection.jsx", import.meta.url),
  "utf8",
);

test("scrollbar spacers have real height: sx height 1 means 100% and leaves nothing to scroll", () => {
  assert.equal((source.match(/<Box sx=\{\{ width: tableWidth, height: "1px" \}\} \/>/g) ?? []).length, 2);
  assert.doesNotMatch(source, /width: tableWidth, height: 1 \}/);
});

test("custom scrollbar styling is not disabled by scrollbar-color in Chromium", () => {
  const styles = source.slice(source.indexOf("const VISIBLE_SCROLLBAR_SX"), source.indexOf("export default function"));
  assert.match(styles, /"@supports not selector\(::-webkit-scrollbar\)": \{\s+scrollbarWidth: "auto",\s+scrollbarColor:/);
  assert.equal((styles.match(/scrollbarColor/g) ?? []).length, 1);
});

test("bottom scrollbar can stick: surface does not create a scroll container", () => {
  assert.match(source, /borderRadius: uiRadii\.lg,\s+\/\/[^\n]*\n\s+overflow: "clip",/);
  assert.match(source, /position: "sticky",\s+bottom: 0,/);
});

test("scroll listeners attach when the table appears and the last position is not dropped", () => {
  assert.match(source, /\}, \[\s+isTableRendered,\s+refreshStickyTop,/);
  assert.doesNotMatch(source, /isSyncingScrollRef/);
  assert.match(source, /const scrollLeft = pending\.source\.scrollLeft;/);
});

test("pinned header shows the same scrollbar right under it", () => {
  assert.match(source, /ref=\{stickyHeaderContainerRef\}[\s\S]{0,120}sx=\{VISIBLE_SCROLLBAR_SX\}/);
});
