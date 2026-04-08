# Cafe Performance Module Plan

## Scope

Implement a new BI module under `components/bi/cafe_performance` based on:

- local API contract in `components/bi/cafe_performance/README.md`
- visual and UX reference from `https://aroma-stats.lovable.app/`
- existing repo patterns from `components/bi/dds`, `components/ads`, `ui/Forms`, `ui/TabPanel`, `src/hooks/useApi`

This plan assumes the goal is to build a production-ready frontend module shell with all 5 screens:

1. Dashboard
2. Kitchen / Stages
3. Leaders
4. Quality
5. Delivery

## Key Constraints

- Use `useApi(module)` as the API client entrypoint.
- Do not use `useEffect` dependencies tied directly to legacy `api_laravel` references.
- Reuse existing project primitives first:
  - `TabPanel`
  - `MyAutocomplite`
  - `MyDatePicker`
  - `MyAlert`
- Use Zustand for page state.
- Use MUI 7 and keep the module visually aligned with the existing admin app, not a full Lovable clone.
- Prefer focused reusable components inside this module over a monolithic page file.
- Treat backend responses as source of truth.

## Reference Research Notes

The Lovable app is structurally useful, but its shell should be adapted to this repo.

Observed patterns across the reference:

- Shared top area with:
  - page title
  - updated timestamp
  - cafe selector
  - date range selector
- Five main views with distinct content blocks
- Strong card-based layout
- Dense but readable KPI presentation
- Minimal modal usage
- Charts are simple and business-like rather than exploratory

### Dashboard

- 4 summary KPI cards:
  - SLA position
  - SLA order
  - P50 position
  - complaints per 100 orders
- Category cards grid
- SLA by category chart
- Channel summary cards/list

### Kitchen

- Category filter
- Stage segmented control (`ROLL`, `OVEN`, `PACK`)
- Stage summary KPIs
- Best employee cards
- Employee comparison table

### Leaders

- Top employee cards
- Cafe ranking table
- Optional category/stage filters in the content area

### Quality

- Summary KPI cards
- Reasons breakdown chart
- Complaints or remake-by-category chart
- Stage/category anomaly table or heatmap-like block

### Delivery

- Overall KPI cards
- Channel cards
- Trend chart by channel

## Recommended Module Shape

### Top-level files

- `components/bi/cafe_performance/CafePerformance.jsx`
- `components/bi/cafe_performance/useCafePerformanceStore.js`
- `components/bi/cafe_performance/config.js`

### Shared UI

- `components/bi/cafe_performance/components/PageFilters.jsx`
- `components/bi/cafe_performance/components/KpiCard.jsx`
- `components/bi/cafe_performance/components/MetricValue.jsx`
- `components/bi/cafe_performance/components/EmptyState.jsx`
- `components/bi/cafe_performance/components/WarningList.jsx`
- `components/bi/cafe_performance/components/SectionCard.jsx`

### Charts

- `components/bi/cafe_performance/charts/SlaByCategoryChart.jsx`
- `components/bi/cafe_performance/charts/ReasonsBreakdownChart.jsx`
- `components/bi/cafe_performance/charts/DeliveryTrendChart.jsx`

If chart needs stay simple, start with:

- amCharts for `sla_by_category`
- amCharts for `trend`
- MUI/Grid-based fallback for pie/breakdown if the pie chart adds too much overhead initially

### Tabs

- `components/bi/cafe_performance/tabs/DashboardTab.jsx`
- `components/bi/cafe_performance/tabs/KitchenTab.jsx`
- `components/bi/cafe_performance/tabs/LeadersTab.jsx`
- `components/bi/cafe_performance/tabs/QualityTab.jsx`
- `components/bi/cafe_performance/tabs/DeliveryTab.jsx`

## State Design

Use Zustand similarly to `dds`, but split bootstrap state from per-screen payloads.

Store should include:

- `module: "cafe_performance"`
- `moduleName`
- `access`
- `loading`
- `tab`
- `points`
- `stageTypes`
- `orderTypes`
- `categories`
- `defaults`
- `filters`
  - `date_start`
  - `date_end`
  - `point_list`
  - `category_ids`
  - `stage_type`
- `metaByScreen`
- `dashboardData`
- `kitchenData`
- `leadersData`
- `qualityData`
- `deliveryData`
- `loadedTabs`
- `refreshToken`

Actions:

- `setLoading`
- `setBootstrap`
- `setTab`
- `setFilters`
- `setScreenData(screen, payload)`
- `markTabLoaded`
- `resetLoadedTabs`

## Data Flow

### Bootstrap

On mount:

1. call `get_all`
2. populate bootstrap dictionaries and defaults
3. set document title from `module_info.name`
4. load the first active tab immediately using defaults

### Filter payload builder

Centralize a single request builder to avoid drift:

- `date_start`
- `date_end`
- `point_list: [{ id }]`
- `category_ids`
- `stage_type`

Rules:

- always send `date_start`
- always send `date_end`
- always send at least one point id
- send `category_ids: []` for all categories unless backend requires omission
- keep `stage_type` in shared payload for all requests if harmless, since backend accepts it

### Per-screen loading

Recommended pattern:

- bootstrap once
- when tab changes, fetch that tab if not loaded yet
- when top filters change and user clicks `Показать`, reload current tab or reload all loaded tabs

Best pragmatic first version:

- `Показать` reloads all currently visited tabs so tab switching stays instant
- unvisited tabs load on first open

## Screen Mapping To API

### Dashboard Tab

Endpoint:

- `get_dashboard`

Blocks:

- summary KPI cards from `summary`
- category cards from `category_cards`
- horizontal bar or column chart from `sla_by_category`
- channel card/list block from `channel_summary`
- `meta.warnings` rendered under the content if present

Formatting:

- seconds-based metrics should display as `X мин Y сек`
- percentages should display with `%`
- nullable values should render as em dash

### Kitchen Tab

Endpoint:

- `get_kitchen`

Blocks:

- category filter in the tab content
- stage segmented buttons from `stage_types`
- stage summary cards from `stage_summary`
- best employee cards from `best_employee_cards`
- employee table from `employee_table`

Notes:

- `stage_type` is the main local state driver here
- highlight invalid rating rows via `is_valid_for_rating`
- support empty employee lists cleanly

### Leaders Tab

Endpoint:

- `get_leaders`

Blocks:

- top employee cards from `top_employee_cards`
- ranking table from `cafe_ranking`
- optional category and stage filters in the content header if useful

Notes:

- ranking should surface `score`, `p50`, `p90`, `sla`, `sample_size`
- visually mute rows with `is_valid_for_rating === false`

### Quality Tab

Endpoint:

- `get_quality`

Blocks:

- summary cards from `summary`
- reasons breakdown chart/list from `reasons_breakdown`
- complaints by category chart/table from `complaints_by_category`
- anomaly table from `anomalies_by_stage_category`

Notes:

- `remakes_per_100_items` is expected to be `null` for now
- `UNKNOWN` reason should still render with a readable label
- because the API returns complaint data and anomaly data separately, keep the UI explicit instead of trying to merge into one synthetic metric

### Delivery Tab

Endpoint:

- `get_delivery`

Blocks:

- overall summary cards from `overall`
- channel cards from `channel_cards`
- line chart from `trend`

Notes:

- `trend` shape currently exposes `date`, `order_type`, `p50`, `count`
- if the data density is low, render a sparse line chart with legend by `order_type`

## UI Strategy

Use the repo’s existing page shell instead of recreating Lovable’s left sidebar.

Recommended shell:

- top module heading from `moduleName`
- a single filter panel above tabs
- MUI `Tabs` + `TabPanel`
- one main column layout that stacks well on mobile

Filter panel should include:

- `MyAutocomplite` for `point_list`
- period type select using `MySelect`
- date control:
  - first version: `MyDatePicker` for the range fields
  - week/month specialization can be added if the UX becomes awkward
- category multi-select:
  - if `MyAutocomplite` supports the needed multi-select UX cleanly, use it
  - otherwise use a contained custom MUI autocomplete within this module
- stage selector should live inside Kitchen and optionally Leaders, not in the global filter row
- primary `Показать` button

## Formatting + Data Adapters

Add a small local formatter/helper layer:

- `formatSeconds`
- `formatPercent`
- `formatNullableNumber`
- `formatGeneratedAt`
- `normalizeMetaWarnings`
- `buildScreenPayload`

Purpose:

- keep tabs presentational
- avoid repeating `null` checks
- keep API quirks isolated

## Access Handling

Bootstrap returns `access`.

Need to confirm whether this module has tab-level or action-level permissions. Until confirmed:

- keep page visible if `get_all` succeeds
- store `access` in Zustand
- gate edit-like or privileged controls only if they appear later

If access keys mirror `components/ads`, add a small `canAccess` helper after the first backend payload confirms the shape.

## Error / Empty / Loading States

- Backdrop + spinner at page level while bootstrap runs
- lighter local loading states inside tabs for subsequent fetches
- `MyAlert` for request failures
- empty state blocks when arrays are empty
- warning block for `meta.warnings`

Avoid:

- silent failures
- rendering raw `null`
- blocking the whole page for every tab switch after bootstrap

## Implementation Order

1. Create the store, page shell, tabs, and bootstrap `get_all` flow.
2. Build the shared filter panel and request payload helper.
3. Implement Dashboard tab end-to-end.
4. Implement Kitchen tab with stage/category controls and employee table.
5. Implement Leaders tab with ranking table.
6. Implement Quality tab with summary + breakdown + anomalies.
7. Implement Delivery tab with trend chart.
8. Add formatting polish, empty states, warnings, and responsive cleanup.
9. Run `prettier --check` on touched files.

## Testing Checklist

- bootstrap works with API defaults
- switching tabs fetches correct endpoints
- `Показать` refreshes data using current filters
- all nullable metrics render safely
- empty arrays do not break layout
- single cafe and multi-cafe selections both work
- all 3 period types send the expected payload
- Kitchen respects selected `stage_type`
- charts dispose correctly on rerender/unmount
- page remains usable on mobile widths

## Risks / Open Questions

1. Category filter control is not fully defined yet.
   Need confirmation whether `category_ids` should be global across all tabs or only some tabs.

2. Date UX for `week` and `month` is underspecified.
   Backend accepts a single `date`, but UX may need a clearer picker convention for weekly/monthly views.

3. Access shape is unknown.
   `README.md` exposes `access`, but no example keys are shown.

4. Rankings may need derived display logic.
   The Lovable example shows more columns than the current API for `leaders`; this should follow the real API, not the mock visuals.

5. Quality wording may need business confirmation.
   The README says `remakes_per_100_items` is always `null` for now, so the UI should label it clearly as unavailable rather than implying zero.

## Recommended First Deliverable

Build an MVP with:

- shared filter bar
- tabs shell
- Dashboard complete
- Kitchen complete
- placeholder-ready Leaders / Quality / Delivery tabs with real API wiring

Then finish the remaining tabs once the data shapes are validated against real backend responses.

If the backend is already stable, it is also reasonable to implement all 5 tabs in one pass using the structure above.
