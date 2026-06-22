# Staff Schedule API Suggestions

This is only about the first FE iteration: render the desktop UI on live data.

No CRUD requirements here.

## Do Not Change

Keep `get_all` conservative.

Current old-module shape is fine:

- `module_info`
- `point_list`
- `months`
- `access`

That matches how old modules bootstrap and is enough for the first screen.

Keep these methods as the initial read-only set:

- `get_all`
- `get_graph`
- `get_user_day`
- `get_user_month`

## Enough To Render The First Screen

For the main page, FE can render if these are stable:

### `get_all`

Need:

- `module_info.name`
- `point_list[]`
- `months[]`
- `access`

Assumptions FE will rely on:

- `point_list` is an array of `{ id, name }`
- `months` is an array of `{ id, name, is_active }`
- at least one point exists, or empty state is returned cleanly

### `get_graph`

Need:

- `date.one`
- `date.two`
- `one`
- `two`
- `part`
- `access`

Also needed if the screen must match current table/footer behavior:

- `show_zp_one`
- `show_zp_two`
- `kind`
- `err.one.orders`
- `err.one.cam`
- `err.two.orders`
- `err.two.cam`

FE will also rely on the existing nested period payload used by legacy render:

- `date.one.days`
- `date.one.bonus`
- `date.one.other_summ`
- `date.one.order_stat`
- `date.two.days`
- `date.two.bonus`
- `date.two.other_summ`
- `date.two.order_stat`

And row payloads in `one[]` / `two[]` need to keep the legacy structure:

- header rows: `row === "header"` with `data`
- employee rows: `data.user_name`, `data.app_name`, `data.dates`, summary fields, colors, ids

## Not Enough / Need Clarification

The existing FE API note is too shallow in one place only:

### `get_all` must stop erroring on bootstrap

Current backend failure on localhost:

- `Cannot use object of type stdClass as array`

Until that is fixed, FE has to bootstrap from isolated legacy fallback instead of the new module.

### `get_graph` needs exact documented shape

Right now the method list names top-level fields, but that is not enough to build the page safely.

BE should document the exact structure of:

- `date.one`
- `date.two`
- `one[]`
- `two[]`
- `err`

What FE specifically needs documented:

- shape of each item in `date.one.days` and `date.two.days`
- shape of each footer item in `bonus`
- shape of `other_summ`
- shape of `order_stat`
- shape of header rows in `one[]` / `two[]`
- shape of employee rows in `one[]` / `two[]`
- whether empty periods return empty arrays or `null`

Without that, FE has to infer the payload from legacy `work_schedule`, which is workable but brittle.

## Not Needed Yet

These can wait until CRUD stage:

- save/edit methods
- new shift payloads
- edit shift payloads
- employee move/replace flows
- payroll edit flows
- bonus edit flows
- withheld/given edit flows
- fast action payloads

## Short BE Ask

For the first UI pass, backend only needs to guarantee:

1. `get_all` stays conservative and stable.
2. `get_graph` returns the same nested render payload every time.
3. `one` / `two` and `date.one` / `date.two` are documented precisely.
4. Empty states come back as empty arrays/objects, not missing keys.
5. `access` keys used by the table stay stable.

That is enough to render the first desktop UI.
