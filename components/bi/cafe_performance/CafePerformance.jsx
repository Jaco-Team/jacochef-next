"use client";

import { Backdrop, CircularProgress, Grid, Tab, Tabs, Typography } from "@mui/material";
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

      <Grid
        container
        spacing={3}
        mb={3}
        className="container_first_child"
      >
        <Grid size={12}>
          <Typography variant="h5">{moduleName || "Эффективность кафе"}</Typography>
        </Grid>

        <Grid size={12}>
          <PageFilters
            filters={filters}
            periodPresets={periodPresets}
            periodLabel={activePeriodLabel}
            points={points}
            generatedAt={currentMeta?.generated_at}
            onFilterChange={handleFilterChange}
            onApply={handleApply}
          />
        </Grid>

        <Grid size={12}>
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            variant="scrollable"
            scrollButtons={false}
          >
            {tabs.map((item) => (
              <Tab
                key={item.key}
                label={item.label}
                {...a11yProps(item.id)}
              />
            ))}
          </Tabs>
        </Grid>

        <Grid size={12}>
          {tabs.map((item) => (
            <TabPanel
              key={item.key}
              value={tab}
              index={item.id}
            >
              <Grid
                container
                spacing={3}
              >
                <Grid size={12}>
                  {item.key === "dashboard" ? (
                    <DashboardTab
                      data={screens.dashboard.data}
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
                      onFilterChange={handleFilterChange}
                      onStageChange={handleKitchenStageChange}
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
                </Grid>

                <Grid size={12}>
                  <WarningList warnings={screens[item.key]?.meta?.warnings || []} />
                </Grid>
              </Grid>
            </TabPanel>
          ))}
        </Grid>
      </Grid>
    </>
  );
}
