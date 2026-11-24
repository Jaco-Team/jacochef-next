# Testing

Use one generic entrypoint:

- `npm test -- --type=unit`
- `npm test -- --type=e2e`
- `npm test -- --type=e2e --scope=staff-schedule`
- `npm test -- --type=e2e --scope=staff-schedule --headed`
- `npm test -- --type=e2e --scope=staff-schedule --grep "reload"`

Supported flags:

- `--type=unit|e2e|all`
- `--scope=<module-folder>`
- `--headed`
- `--list`
- `--grep "<pattern>"`
- `--project=<playwright-project>`

Local e2e prerequisites:

- install the Playwright browser once with `npx playwright install chromium --no-shell`
- start the local FE yourself, for example `npm run dev -- --hostname 127.0.0.1 --port 3000`
- keep the local API running on `127.0.0.1:8000` or `localhost:8000`

Current example coverage:

- `tests/unit/staff-schedule`: payroll math, access policy, and modal save/date-gate core logic
- `tests/e2e/staff-schedule`: local API and browser smoke for `staff_schedule`
