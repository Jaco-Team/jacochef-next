"use client";

import { Box, Stack, Typography } from "@mui/material";
import { JacoButton, JacoSurface } from "@/design-system/shared/ui";
import JacoSearch from "@/ui/JacoSearch";
import ComplaintListFilters from "./ComplaintListFilters";
import ComplaintListMobileCards from "./ComplaintListMobileCards";
import ComplaintListTable from "./ComplaintListTable";

function EmptyResults({ mode, filtered, onRegister }) {
  if (filtered) {
    return (
      <JacoSurface
        variant="outlined"
        sx={{ p: { xs: 3, md: 4 }, textAlign: "center" }}
      >
        <Typography color="text.secondary">По указанному ID заказа ничего не найдено.</Typography>
      </JacoSurface>
    );
  }
  const journal = mode === "journal";
  return (
    <JacoSurface
      variant="outlined"
      sx={{ p: { xs: 3, md: 4 }, textAlign: "center" }}
    >
      <Stack
        spacing={1.5}
        sx={{ alignItems: "center" }}
      >
        <Typography fontWeight={700}>
          {journal ? "Жалобы не найдены" : "Заказы не найдены"}
        </Typography>
        <Typography color="text.secondary">
          {journal
            ? "За выбранный период жалоб нет."
            : "Измените фильтры или найдите заказ по номеру."}
        </Typography>
        {journal ? <JacoButton onClick={onRegister}>Перейти к регистрации</JacoButton> : null}
      </Stack>
    </JacoSurface>
  );
}

export default function ComplaintListSection({ model }) {
  const pagination = {
    total: model.complaintsTotal,
    page: model.complaintsPage,
    perPage: model.complaintsPerPage,
    onPageChange: model.setComplaintsPage,
    onPerPageChange: (perPage) => {
      model.setComplaintsPerPage(perPage);
      model.setComplaintsPage(0);
    },
  };

  return (
    <>
      <ComplaintListFilters
        filters={model.filters}
        cities={model.cities}
        cafes={model.cafes}
        mode={model.mode}
        onChange={model.update}
        onApply={model.apply}
      />
      {model.resultsLoaded && model.rows.length > 0 ? (
        <Box sx={{ width: { xs: "100%", sm: 360 } }}>
          <JacoSearch
            label="ID заказа"
            value={model.tableOrderIdSearch}
            onValueChange={model.setTableOrderIdSearch}
            debounceMs={350}
          />
        </Box>
      ) : null}
      {!model.resultsLoaded ? null : model.visibleRows.length === 0 ? (
        <EmptyResults
          mode={model.mode}
          filtered={Boolean(model.tableOrderIdSearch)}
          onRegister={model.openRegistration}
        />
      ) : model.mobile ? (
        <ComplaintListMobileCards
          rows={model.visibleRows}
          mode={model.mode}
          points={model.points}
          onOpenOrder={model.openOrderDetails}
          onOpenComplaint={model.setSelectedComplaint}
          onRegister={model.setSelected}
        />
      ) : (
        <ComplaintListTable
          rows={model.visibleRows}
          mode={model.mode}
          points={model.points}
          sort={model.complaintsSort}
          onSort={model.changeComplaintsSort}
          onOpenOrder={model.openOrderDetails}
          onOpenComplaint={model.setSelectedComplaint}
          onRegister={model.setSelected}
          pagination={pagination}
        />
      )}
    </>
  );
}
