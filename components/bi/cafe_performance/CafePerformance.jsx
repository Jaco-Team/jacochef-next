"use client";

import { Backdrop, Box, CircularProgress, Stack, Tab, Tabs, Typography } from "@mui/material";
import MyAlert from "@/ui/MyAlert";
import a11yProps from "@/ui/TabPanel/a11yProps";
import TabPanel from "@/ui/TabPanel/TabPanel";
import PageFilters from "./components/PageFilters";
import WarningList from "./components/WarningList";
import DashboardTab from "./tabs/DashboardTab";
import KitchenTab from "./tabs/KitchenTab";
import LeadersTab from "./tabs/LeadersTab";
import QualityTab from "./tabs/QualityTab";
import DeliveryTab from "./tabs/DeliveryTab";
import EmployeeDetailsModal from "./components/EmployeeDetailsModal";
import SlaCategoryDetailsModal from "./components/SlaCategoryDetailsModal";
import MetricDetailsModal from "./components/MetricDetailsModal";
import OrderDetailsModal from "@/components/shared/order/OrderDetailsModal";
import { CP_SPACE } from "./layout";
import useCafePerformanceController from "./useCafePerformanceController";

export default function CafePerformance() {
  const {
    alert,
    moduleName,
    loading,
    tab,
    setTab,
    tabs,
    filters,
    points,
    categories,
    stageTypes,
    orderTypes,
    periodPresets,
    activePeriodLabel,
    appliedPeriodLabel,
    currentMeta,
    currentStageName,
    orderTypeNameMap,
    formatters,
    screens,
    employeeDetails,
    slaCategoryDetails,
    metricDetails,
    orderDetails,
    handleFilterChange,
    handleApply,
    handleKitchenStageChange,
    handleKitchenCategoryChange,
    handleOpenEmployee,
    handleEmployeePageChange,
    handleCloseKitchenEmployee,
    handleOpenSlaCategory,
    handleCloseSlaCategory,
    handleSlaCategoryPageChange,
    handleOpenMetricDetails,
    handleOpenOrderTypeDetails,
    handleCloseMetricDetails,
    handleMetricDetailsPageChange,
  } = useCafePerformanceController();

  return (
    <>
      <Backdrop
        open={loading}
        sx={{ zIndex: (theme) => theme.zIndex.modal + 2 }}
      >
        <CircularProgress />
      </Backdrop>

      <MyAlert
        isOpen={alert.isOpen}
        onClose={alert.onClose}
        status={alert.status}
        text={alert.text}
      />

      <EmployeeDetailsModal
        open={employeeDetails.open}
        onClose={handleCloseKitchenEmployee}
        loading={employeeDetails.loading}
        data={employeeDetails.data}
        formatters={formatters}
        periodLabel={appliedPeriodLabel}
        page={employeeDetails.page}
        perPage={employeeDetails.perPage}
        onPageChange={handleEmployeePageChange}
      />

      <SlaCategoryDetailsModal
        open={slaCategoryDetails.open}
        onClose={handleCloseSlaCategory}
        loading={slaCategoryDetails.loading}
        data={slaCategoryDetails.data}
        metric={slaCategoryDetails.metric}
        formatters={formatters}
        periodLabel={appliedPeriodLabel}
        page={slaCategoryDetails.page}
        perPage={slaCategoryDetails.perPage}
        onPageChange={handleSlaCategoryPageChange}
        onOrderOpen={orderDetails.openOrder}
      />

      <MetricDetailsModal
        open={metricDetails.open}
        onClose={handleCloseMetricDetails}
        loading={metricDetails.loading}
        data={metricDetails.data}
        selectedMetric={metricDetails.metric}
        sourceMetric={metricDetails.sourceMetric}
        formatters={formatters}
        periodLabel={appliedPeriodLabel}
        page={metricDetails.page}
        perPage={metricDetails.perPage}
        onPageChange={handleMetricDetailsPageChange}
        onOrderOpen={orderDetails.openOrder}
        paginationRowsLabel={metricDetails.paginationRowsLabel}
      />

      <OrderDetailsModal
        open={orderDetails.open}
        onClose={orderDetails.closeOrder}
        order={orderDetails.order}
      />

      <Stack
        spacing={CP_SPACE.section}
        className="container_first_child"
        sx={{ mb: CP_SPACE.section }}
      >
        <Stack spacing={CP_SPACE.micro}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700 }}
          >
            {moduleName || "Эффективность кафе"}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Метрики эффективности кухни, выдачи, качества и лидеров сети
          </Typography>
        </Stack>

        <PageFilters
          filters={filters}
          periodPresets={periodPresets}
          periodLabel={activePeriodLabel}
          points={points}
          onFilterChange={handleFilterChange}
          onApply={handleApply}
        />

        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            variant="scrollable"
            scrollButtons={false}
            sx={{
              minHeight: 44,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                minHeight: 44,
                py: CP_SPACE.related,
              },
            }}
          >
            {tabs.map((item) => (
              <Tab
                key={item.key}
                label={item.label}
                {...a11yProps(item.id)}
              />
            ))}
          </Tabs>
        </Box>

        {tabs.map((item) => (
          <TabPanel
            key={item.key}
            value={tab}
            index={item.id}
          >
            <Stack spacing={CP_SPACE.section}>
              {item.key === "dashboard" ? (
                <DashboardTab
                  data={screens.dashboard.data}
                  generatedAt={currentMeta?.generated_at}
                  formatters={formatters}
                  orderTypes={orderTypes}
                  orderTypeNameMap={orderTypeNameMap}
                  onCategoryOpen={handleOpenSlaCategory}
                  onMetricOpen={handleOpenMetricDetails}
                  onOrderTypeOpen={handleOpenOrderTypeDetails}
                />
              ) : null}

              {item.key === "kitchen" ? (
                <KitchenTab
                  data={screens.kitchen.data}
                  formatters={formatters}
                  stageName={currentStageName}
                  filters={filters}
                  categories={categories}
                  stageTypes={stageTypes}
                  onStageChange={handleKitchenStageChange}
                  onCategoryApply={handleKitchenCategoryChange}
                  onEmployeeOpen={handleOpenEmployee}
                />
              ) : null}

              {item.key === "leaders" ? (
                <LeadersTab
                  data={screens.leaders.data}
                  formatters={formatters}
                  filters={filters}
                  onEmployeeOpen={handleOpenEmployee}
                />
              ) : null}

              {item.key === "quality" ? (
                <QualityTab
                  data={screens.quality.data}
                  formatters={formatters}
                />
              ) : null}

              {item.key === "delivery" ? (
                <DeliveryTab
                  data={screens.delivery.data}
                  formatters={formatters}
                  orderTypes={orderTypes}
                  orderTypeNameMap={orderTypeNameMap}
                  onOrderTypeOpen={handleOpenOrderTypeDetails}
                />
              ) : null}

              <WarningList warnings={screens[item.key]?.meta?.warnings || []} />
            </Stack>
          </TabPanel>
        ))}
      </Stack>
    </>
  );
}
