- [x] fix Select warnings on empty set when default is not '' (added props.data.length check)
- [ ] run npx prettier --write ./pages... ./components...
- [ ] add dictionary (centralize tooltip, general error text etc.)
- [ ] move MUI components global styling to theme.js (partially done)
- [x] journal_of_work_of_bactericidal_lamps.js  - Datepicker padding
- [x] locate className ssr warning cause (some MUI components fail at page load) MUI NoSsr solved for MyDatePickerNew


## MUI 5->7 migration 11.10.2025 issues
- [x] Migrated MUI to 7.*, updated due to components API change
- [x] Manually checkead and fixed all endpoints after Grid migration, solved all console Errors and Warnings 
- [x] decomposed and adjusted src/elements.js into components/shared/Forms
- [x] formatDate modernized, decomposed, reimported
- [x] MyAlert extracted, reimported in all files
- [ ] found issues
    - http://localhost:3000/city_site_items - REDIRECTING to index
    - http://localhost:3000/write_off_journal - 404
