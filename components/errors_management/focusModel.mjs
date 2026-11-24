const MODAL_ROOT_SELECTOR = '[role="dialog"], [role="presentation"], .MuiDrawer-paper';

/** Moves focus into `container` unless focus is already somewhere inside its modal. */
export function moveFocusInto(container, doc = globalThis.document) {
  if (!container || typeof container.focus !== "function") return false;
  const modalRoot = container.closest?.(MODAL_ROOT_SELECTOR) || container;
  const active = doc?.activeElement || null;
  if (active && modalRoot.contains?.(active)) return false;
  container.focus({ preventScroll: true });
  return true;
}

/** Focuses the first text input inside `root` (the search field of an autocomplete). */
export function focusFirstInput(root) {
  const input = root?.querySelector?.("input");
  if (!input || typeof input.focus !== "function") return false;
  input.focus({ preventScroll: true });
  return true;
}
