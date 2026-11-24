"use client";

import { Box } from "@mui/material";
import { JacoAlert, JacoBackdropLoader } from "@/design-system/shared/ui";
import AuthTab from "./AuthTab";
import PaymentsTab from "./PaymentsTab";
import useSiteStepConversion from "./useSiteStepConversion";
import { FilterBar, FlowDialog, PageTabs } from "./widgets";

const TITLES = {
  auth: "Авторизация",
  payments: "Онлайн-оплата",
  orders: "Заказы",
  reviews: "Отзывы",
};

export default function SiteStepConversion() {
  const {
    loading,
    moduleName,
    tab,
    setTab,
    filters,
    updateFilters,
    cities,
    pointOptions,
    clients,
    scenarios,
    paymentMethods,
    screens,
    alert,
    closeAlert,
    flow,
    closeFlow,
    openFlow,
    isDemo,
  } = useSiteStepConversion();

  const selects =
    tab === "payments"
      ? [
          {
            key: "city",
            label: "Город",
            value: filters.city_id,
            options: cities,
            onChange: (city_id) => updateFilters({ city_id }),
          },
          {
            key: "point",
            label: "Точка",
            value: filters.point_id,
            options: pointOptions,
            onChange: (point_id) => updateFilters({ point_id }),
          },
          {
            key: "method",
            label: "Способ",
            value: filters.payment_method,
            options: paymentMethods,
            onChange: (payment_method) => updateFilters({ payment_method }),
          },
        ]
      : [
          {
            key: "city",
            label: "Город",
            value: filters.city_id,
            options: cities,
            onChange: (city_id) => updateFilters({ city_id }),
          },
          {
            key: "client",
            label: "Клиент",
            value: filters.client,
            options: clients,
            onChange: (client) => updateFilters({ client }),
          },
          {
            key: "scenario",
            label: "Сценарий",
            value: filters.scenario,
            options: scenarios,
            onChange: (scenario) => updateFilters({ scenario }),
          },
        ];

  return (
    <Box
      className="v2-module"
      sx={{ backgroundColor: "#F5F6F8", minHeight: "100vh" }}
    >
      <JacoBackdropLoader open={loading} />
      <JacoAlert
        isOpen={alert.open}
        onClose={closeAlert}
        status={alert.status}
        text={alert.text}
      />
      <FlowDialog
        open={flow.open}
        loading={flow.loading}
        title={flow.title}
        steps={flow.steps}
        onClose={closeFlow}
      />
      <Box
        sx={{ maxWidth: 1400, mx: "auto", pb: 6, marginTop: "68px", mb: 0, paddingInline: "24px" }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
          <Box
            sx={{
              fontSize: 32,
              lineHeight: 1.15,
              fontWeight: 700,
              color: "#1F2937",
              mb: 1.5,
              mt: 2,
            }}
          >
            {moduleName}
          </Box>
          {isDemo ? (
            <Box
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: "999px",
                backgroundColor: "#FFF4E5",
                color: "#C2410C",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              Демо-данные
            </Box>
          ) : null}
        </Box>
        <Box sx={{ fontSize: 16, lineHeight: 1.15, fontWeight: 700, color: "#1F2937", mb: 1.5 }}>
          {TITLES[tab]}
        </Box>
        <Box sx={{ mb: 2 }}>
          <PageTabs
            value={tab}
            onChange={setTab}
          />
        </Box>
        {tab === "auth" || tab === "payments" ? (
          <Box sx={{ mb: 2 }}>
            <FilterBar
              filters={filters}
              selects={selects}
              onPeriod={(period) => updateFilters({ period })}
              onDateStart={(value) =>
                updateFilters({ date_start: value ? value.format("YYYY-MM-DD") : null })
              }
              onDateEnd={(value) =>
                updateFilters({ date_end: value ? value.format("YYYY-MM-DD") : null })
              }
            />
          </Box>
        ) : null}
        {tab === "auth" ? (
          <AuthTab
            data={screens.auth}
            onRowClick={(row) => openFlow(row, "auth")}
          />
        ) : null}
        {tab === "payments" ? (
          <PaymentsTab
            data={screens.payments}
            onRowClick={(row) => openFlow(row, "payments")}
          />
        ) : null}
      </Box>
    </Box>
  );
}
