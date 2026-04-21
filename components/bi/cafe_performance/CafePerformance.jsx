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
    currentMeta,
    currentStageName,
    orderTypeNameMap,
    formatters,
    screens,
    handleFilterChange,
    handleApply,
    handleKitchenStageChange,
    handleKitchenCategoryChange,
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
                />
              ) : null}

              {item.key === "leaders" ? (
                <LeadersTab
                  data={screens.leaders.data}
                  formatters={formatters}
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
