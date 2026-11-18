"use client";

import { Stack, Typography } from "@mui/material";
import { JacoButton, JacoSurface } from "@/design-system/shared/ui";
import ComplaintListFilters from "./ComplaintListFilters";
import ComplaintListMobileCards from "./ComplaintListMobileCards";
import ComplaintListTable from "./ComplaintListTable";
import ComplaintStatusLegend from "./ComplaintStatusLegend";

function EmptyResults({ mode, canRegister, onRegister }) {
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
            ? "По выбранным фильтрам жалоб нет."
            : "Измените фильтры или найдите заказ по номеру."}
        </Typography>
        {journal && canRegister ? (
          <JacoButton onClick={onRegister}>Перейти к регистрации</JacoButton>
        ) : null}
      </Stack>
    </JacoSurface>
  );
}

export default function ComplaintListSection({ model }) {
  const journal = model.mode === "journal";
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
        canSeePhone={model.canSeePhone}
        onChange={model.update}
        onApply={model.apply}
      />
      {journal ? <ComplaintStatusLegend /> : null}
      {!model.resultsLoaded ? null : model.rows.length === 0 ? (
        <EmptyResults
          mode={model.mode}
          canRegister={model.canRegister}
          onRegister={model.openRegistration}
        />
      ) : model.mobile ? (
        <ComplaintListMobileCards
          rows={model.rows}
          mode={model.mode}
          points={model.points}
          canSeePhone={model.canSeePhone}
          onOpenOrder={model.openOrderDetails}
          onOpenComplaint={model.setSelectedComplaint}
          onRegister={model.setSelected}
          pagination={journal ? pagination : null}
        />
      ) : (
        <ComplaintListTable
          rows={model.rows}
          mode={model.mode}
          points={model.points}
          canSeePhone={model.canSeePhone}
          sort={model.complaintsSort}
          onSort={model.changeComplaintsSort}
          onOpenOrder={model.openOrderDetails}
          onOpenComplaint={model.setSelectedComplaint}
          onRegister={model.setSelected}
          pagination={journal ? pagination : null}
        />
      )}
    </>
  );
}
