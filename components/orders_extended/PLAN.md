# orders_extended — FE implementation plan

## Current status

- The Bitrix task scope is to create a separate module `Заказы` under `Статистика пользователей`, using the current `ПОИСК ЗАКАЗОВ РАСШИРЕННЫЙ` flow from `site_clients` as the migration source.
- The local runtime at `http://localhost:3000/site_clients` confirms the report reference exposes:
  - true/false date fields;
  - order count min/max;
  - order sum min/max;
  - user segment selector;
  - item selector;
  - point selector;
  - phone input;
  - promo input;
  - no-promo checkbox;
  - subscription/error checkboxes;
  - preset buttons;
  - get-orders action;
  - export action.
- The current `orders_extended` FE module already owns its store, lifecycle, and module-specific orchestration; remaining work is limited to the still-open phases and verified blockers below.
- The confirmed `orders_extended` runtime/API scope now also covers:
  - bootstrap dictionaries `categories`, `sources`, `order_types`, `payment_types`;
  - client segment `lost`;
  - filters `avg_check_min`, `avg_check_max`, `category_ids`, `source_ids`, `order_type_ids`, `payment_type_ids`, `with_promo`;
  - report columns `source`, `type_user`, `address`, `type_order`, `status`, `order_price`, `avg_check`, `promo_name`, `type_pay`, `driver`.
- Result-table sorting is server-side through `sort_by`/`sort_dir`, with deterministic pagination.
- The result table renders a totals footer for filtered row count, order-price sum, and average check average.
- Money values use the shared `formatRUR` helper with two decimal places; counts use shared `formatNumber`.
- This document is FE planning only. It does not authorize backend changes, `site_clients` changes, shared helper rewrites, or speculative data contracts.

## Locked scope and rules

- Build a standalone `orders_extended` page/module. Do not modify `site_clients` behavior as part of this task.
- Use the known API contract from `components/orders_extended/API.md` only:
  - `useApi("orders_extended")`
  - `get_all` with `st: true` and confirmed dictionaries;
  - `get_orders_more` with the expanded filter contract;
  - `get_orders_more_files`
  - `get_order_orders`
  - `save_feedbacks`
- Access must remain raw from bootstrap and must be consumed through `handleUserAccess` without renaming or fallback aliases.
- No module-prefix fallback. No `site_clients` API calls from the new module.
- No guessed fields, no guessed filters, no guessed table columns, no guessed semantics for deferred task wording.
- Tabs are not required inside the new module unless a later confirmed task/API explicitly introduces multiple independent views.
- Reuse existing repo patterns from `ads`, `vendors`, and `site_clients`:
  - dedicated Zustand state/store per module;
  - page/container orchestration;
  - shared `useApi`, `useMyAlert`, `handleUserAccess`, `MyAlert`;
  - shared `@/ui/Forms` controls, hooks, and modals when their contracts still match;
  - MUI v7 `Grid` `size` prop.
- Stable lifecycle rule:
  - async API functions or unstable `api_laravel` handlers must not be placed directly in `useEffect` dependency arrays when they drive bootstrap/report loading;
  - bootstrap and refresh must use a stable lifecycle approach with cancellation/unmount safety and clear ownership of who triggers initial load vs manual reload.

## Verified migration source vs new module target

### What must be migrated from the current tab

- The new module should reproduce the extended-order-search flow as a dedicated page, not as another `site_clients` tab.
- The local runtime confirms the current surface already available to migrate:
  - date period fields tied to the current `get_orders_more` contract;
  - count range;
  - sum range;
  - client segment selector;
  - point selector;
  - item selector;
  - phone and promo filters;
  - no-promo checkbox;
  - error/subscription-related checkboxes present in the current FE;
  - result table;
  - pagination;
  - export;
  - order-details modal path;
  - feedback modal path when access allows it.

### What the Bitrix task additionally requests

- The task/Google Doc references a future expanded filter surface:
  - cafe selector analogous to CRM, implemented via the current `point` contract and CRM-style grouped UI;
  - date from/to;
  - orders in period min/max;
  - average check min/max;
  - order sum min/max;
  - clients: all/new/current/lost;
  - categories in order;
  - items in order;
  - promo code;
  - no-promo checkbox;
  - with-promo checkbox;
  - order-error checkbox;
  - order source: site/cafe/call center;
  - order type: delivery/pickup/dine-in/takeaway;
  - payment type: cashless/cash.

### Migration rule

- The Bitrix/Google Doc list defines target business scope.
- The current local `site_clients` tab defines the verified FE behavior/reference that can be migrated now.
- The new module plan must therefore split work into:
  - confirmed current fields/flows that can be implemented against the current API now;
  - remaining task fields and flows that still depend on the blockers documented below.

## API contract gates

### Confirmed now

- `get_all` bootstrap currently provides:
  - module info;
  - raw access payload;
  - points;
  - `all_items`;
  - `items`.
- `get_orders_more` currently accepts the established payload shape with:
  - `date_start_true`
  - `date_end_true`
  - `date_start_false`
  - `date_end_false`
  - `is_show_claim`
  - `is_show_claim_last`
  - `is_show_marketing`
  - `count_orders_min`
  - `count_orders_max`
  - `min_summ`
  - `max_summ`
  - `promo`
  - `no_promo`
  - `param`
  - `point`
  - `item`
  - `number`
  - `page`
  - `perPage`
- Confirmed `param.id` values: `all`, `new`, `current`, `lost`.
- `get_orders_more_files` uses the same filter contract without paging.
- `get_order_orders` supports order details modal flow.
- `save_feedbacks` supports the current feedback flow.

### Confirmed backend additions

- `avg_check_min`, `avg_check_max`
- `category_ids`, `source_ids`, `order_type_ids`, `payment_type_ids`
- `with_promo`
- `param.id=lost` with the documented 90-day semantics
- `avg_check` and `promo_name` result fields
- bootstrap `categories`, `sources`, `order_types`, `payment_types`

Status: implemented in FE

## Planned module structure and responsibilities

### Page/container responsibilities

- Own bootstrap lifecycle for `orders_extended`.
- Own document title updates.
- Own top-level loading state and refresh ownership.
- Own alert flow through `useMyAlert` and `MyAlert`.
- Own access derivation through `handleUserAccess(rawAccess)`.
- Own wiring for:
  - search submit;
  - export submit;
  - pagination reload;
  - order details open/close;
  - feedback modal open/save when allowed.
- Own authenticated runtime verification targets for the new module.

### Zustand store responsibilities

- Dedicated `orders_extended` store, separate from `site_clients`.
- Store only module-owned FE state, for example:
  - bootstrap payload slices needed by the module;
  - raw access;
  - page title/module name;
  - loading flags;
  - filter state;
  - table rows;
  - total count;
  - page/perPage;
  - export URL cache if retained;
  - active order details context;
  - feedback modal context;
  - refresh token or equivalent stable reload trigger.
- Avoid putting unstable API handlers in the store.
- Avoid coupling the new store to `site_clients` persistence keys or tab state.

### Presentational component responsibilities

- Render filter form using shared `@/ui/Forms` controls.
- Render result table and pagination.
- Render responsive layout using current repo/MUI patterns.
- Emit controlled callbacks upward instead of owning module bootstrap/API lifecycle.
- Reuse existing shared order/feedback modal components only if their request/response contracts remain compatible without prefix fallback or `site_clients` store coupling.

## Stable lifecycle approach

- Bootstrap ownership belongs to the `orders_extended` page/container.
- Do not place unstable async API handlers directly in `useEffect` dependencies for bootstrap or report-loading loops.
- Use a stable mount/refresh trigger pattern:
  - initial load on mount through a stable effect;
  - explicit refresh token/state for forced reloads;
  - guarded async flow that ignores late responses after unmount or superseding requests.
- Every async request path must be safe for:
  - component unmount;
  - route change during request;
  - overlapping manual reloads;
  - stale response arrival order.
- Loading flags must clear safely even when requests fail or become obsolete.
- Search, export, details, and feedback flows should have clear request ownership and not depend on incidental rerenders.

## Phased FE plan

### Phase 1 — replace the scaffold with module-owned bootstrap

- Read the current scaffold and remove reliance on directly mounting the existing page ownership.
- Create `orders_extended` page/container ownership around `useApi("orders_extended")`.
- Add a dedicated Zustand store for module state.
- Implement `get_all` bootstrap through the new module prefix only.
- Persist only what the new module truly owns; do not reuse `site_clients` storage keys by default.
- Set document title from `module_info`.
- Store raw access exactly as returned.

#### Phase 1 acceptance

- Opening `/orders_extended` loads bootstrap from `orders_extended/get_all`.
- The page title and loading state come from the new module container.
- No `site_clients` API path is involved.

Status: complete

### Phase 2 — migrate the confirmed current filter/report flow

- Move the current extended-search form into `orders_extended` ownership.
- Keep only currently confirmed request fields wired to `get_orders_more`.
- Implement form state in the dedicated module store or a module-owned local slice with stable ownership.
- Preserve current working behavior for:
  - true/false date fields;
  - count min/max;
  - sum min/max;
  - client type values `all/new/current`;
  - point selector rendered as the CRM-style grouped cafe selector on the existing `point` request field;
  - item selector;
  - phone input;
  - promo input;
  - no-promo checkbox;
  - currently available error/subscription checkboxes.
- Keep current validation behavior only where already proven by the current flow or API errors.
- Do not introduce deferred task fields yet.

#### Phase 2 acceptance

- A valid report request calls `orders_extended/get_orders_more` with only confirmed fields.
- Invalid states show current-style alerts rather than silent failure.
- The new module reproduces the current search flow without depending on `site_clients` runtime ownership.

Status: complete

### Phase 3 — table, pagination, export, and request ownership

- Render report rows from `get_orders_more`.
- Own `page`, `perPage`, and `total` inside the module state.
- Make paging reload deterministic and safe under overlapping requests.
- Wire export through `get_orders_more_files` using the same confirmed filter contract.
- Keep export available only when raw access allows it.
- If the API returns a report URL from `get_orders_more`, treat it as the current contract rather than inventing a second FE-only export flow.

#### Phase 3 acceptance

- Search results update rows and total correctly.
- Pagination changes reload the report with stable ownership.
- Export uses the `orders_extended` prefix only and is hidden/disabled by access when appropriate.

Status: complete

### Phase 4 — order details and feedback reuse

- Reuse existing shared order details modal path only if `get_order_orders` wiring remains contract-compatible.
- Reuse feedback modal flow only if `save_feedbacks` remains contract-compatible and access allows it.
- If the existing shared modal depends on `site_clients` store or prefix-specific assumptions, decouple it cleanly or block that slice until safe reuse is possible.
- Do not patch modal incompatibility with module fallback logic.

#### Phase 4 acceptance

- Opening an order row fetches details through `orders_extended/get_order_orders`.
- Feedback save uses `orders_extended/save_feedbacks` only when `send_feedback` access is present.
- No reused modal secretly depends on `site_clients` lifecycle ownership.

Status: complete

### Phase 5 — confirmed task-expansion filters/table

- Store and render the confirmed bootstrap dictionaries from `get_all`.
- Extend `get_orders_more` and `get_orders_more_files` with only the confirmed new fields.
- Add the confirmed average-check, category, source, order-type, payment-type, `lost`, and `with_promo` UI controls.
- Replace the current table columns with the confirmed DOCX/API response fields only.

#### Phase 5 acceptance

- Every added field is backed by confirmed backend semantics.
- No speculative client mapping, option list, or column logic enters FE.
- Export reuses the same expanded filter payload without paging fields.

Status: complete

## Current-to-new migration mapping

### Migrate now

- `date_start_true` / `date_end_true` -> main date period fields
- `date_start_false` / `date_end_false` -> secondary/false-date fields as currently supported
- `count_orders_min` / `count_orders_max` -> orders-in-period min/max
- `min_summ` / `max_summ` -> order-sum min/max
- `param` with `all/new/current` -> current confirmed client segment selector
- `param` with `lost` -> confirmed departed-client selector
- `point` -> current point/cafe selector using bootstrap-provided options and the CRM-style grouped `CityCafeAutocomplete2` UI
- `item` -> items-in-order selector using bootstrap-provided options
- `number` -> phone input
- `promo` -> promo code input
- `no_promo` -> no-promo checkbox
- `with_promo` -> confirmed promo-presence checkbox
- `avg_check_min` / `avg_check_max` -> confirmed average-check range
- `category_ids` -> confirmed categories-in-order selector
- `source_ids` -> confirmed order-source selector
- `order_type_ids` -> confirmed order-type selector
- `payment_type_ids` -> confirmed payment-type selector
- `is_show_claim`
- `is_show_claim_last`
- `is_show_marketing`
- current preset behavior only if the scaffold proves it is still part of the migrated UX and supported by module-owned state

### Still deferred

## Access behavior

- Use raw bootstrap access with `handleUserAccess`.
- The module page itself must respect the `orders_extended` access gate.
- Export button/action must respect `export_items`.
- Feedback action must respect `send_feedback`.
- No synthetic aliases, no remapped access keys, no FE fallback capability checks.

## Responsive and UI reuse

- Reuse shared form controls from `@/ui/Forms`.
- Reuse current repo modal patterns and `MyAlert`.
- Use MUI v7 `Grid` with `size`.
- Prefer the established module-page structure seen in `vendors` and `ads`: page title, loading overlay, alert, main content block.
- Preserve the current report workflow visually enough for operator continuity, but keep the new module isolated from `site_clients`.
- Do not redesign `site_clients`. Do not introduce extra tabs into `orders_extended` unless later required.

## Verification plan

- Verification must be done in authenticated Chrome DevTools, not Playwright.
- Verify bootstrap in the new module:
  - `orders_extended/get_all` is called;
  - module title is correct;
  - raw access shape is passed through unchanged;
  - points/items bootstrap data arrives as expected.
- Verify one happy-path search:
  - confirmed filters entered;
  - `orders_extended/get_orders_more` payload contains only confirmed fields, including the newly confirmed expansion fields;
  - rows and total render correctly.
- Verify one validation/error case from current contract:
  - missing/invalid required input or API `st=false`;
  - alert is surfaced;
  - stale results do not overwrite newer state.
- Verify pagination:
  - page/perPage request updates;
  - rows and total remain consistent.
- Verify export when access allows it:
  - `get_orders_more_files` or current returned URL flow works under the new prefix only.
- Verify details/feedback only if that slice is included in the implemented phase:
  - `get_order_orders`;
  - `save_feedbacks`;
  - access gating.

## Acceptance criteria

- A standalone `orders_extended` page exists with its own lifecycle and state ownership.
- The page bootstraps through `useApi("orders_extended")` and `get_all` only.
- The confirmed current extended-order-search flow is available without depending on `site_clients` page ownership.
- Search, pagination, export, details, and feedback use only the known `orders_extended` contract.
- The confirmed expanded filter/table scope is implemented without touching unconfirmed details/feedback slices.
- Raw access is handled through `handleUserAccess` without renaming.
- No `site_clients` API or shared current behavior is changed.
- No module-prefix fallback exists.
- No guessed fields or semantics are implemented.
- No tabs are introduced unless a later confirmed requirement needs them.
- Authenticated Chrome DevTools verification covers bootstrap plus the implemented interaction slice.

## Blockers

- No confirmed FE blockers remain inside the implemented scope. Any further work depends on new task/API scope beyond the current module contract.

## Definition of done

- The rewritten FE module plan is implemented phase-by-phase without changing `site_clients`.
- `orders_extended` owns bootstrap, state, access, and report orchestration.
- The currently confirmed search flow works through the new module prefix.
- Async bootstrap/report flows use stable lifecycle ownership with cancellation/unmount safety.
- Export/details/feedback work only through confirmed `orders_extended` methods and access gates.
- Remaining blocked items stay documented in the blocker section below instead of being guessed in FE.
