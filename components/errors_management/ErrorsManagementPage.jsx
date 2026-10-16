"use client";

import { Alert, Box, Stack, Typography } from "@mui/material";
import OrderDetailsModal from "@/components/shared/order/OrderDetailsModal";
import { JacoBackdropLoader, JacoSegmentedTabs } from "@/design-system/shared/ui";
import ComplaintDrawer from "./sections/ComplaintDrawer";
import ComplaintListSection from "./sections/ComplaintListSection";
import ComplaintRegistrationDrawer from "./sections/ComplaintRegistrationDrawer";
import ComplaintSettingsSection from "./sections/ComplaintSettingsSection";
import ComplaintStatisticsSection from "./sections/ComplaintStatisticsSection";
import useErrorsManagementPage from "./useErrorsManagementPage";
import { rootSx, titleSx } from "./constants";

export default function ErrorsManagementPage() {
  const {
    shell,
    complaintList,
    statisticsSection,
    settingsSection,
    complaintDrawer,
    registrationDrawer,
    orderDetails,
  } = useErrorsManagementPage();
  const { loading, message, mobile, tab, title, setTab } = shell;
  return (
    <Box
      className="container_first_child"
      sx={rootSx}
    >
      <JacoBackdropLoader
        open={loading}
        sx={{ "& .MuiCircularProgress-root": { color: "#FFFFFF" } }}
      />
      <Stack spacing={2.5}>
        <Typography
          component="h1"
          sx={titleSx}
        >
          {title}
        </Typography>
        {message ? <Alert severity="error">{message}</Alert> : null}
        <JacoSegmentedTabs
          size="compact"
          value={tab}
          onChange={(_, value) => setTab(value)}
          variant="fullWidth"
          tabSx={{
            whiteSpace: "nowrap",
            flex: 1,
            minWidth: 0,
            px: { xs: 0.5, sm: 2 },
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
          }}
          items={[
            { id: "journal", label: mobile ? "Журнал" : "Журнал жалоб" },
            { id: "registration", label: "Регистрация" },
            { id: "statistics", label: "Статистика" },
            { id: "settings", label: mobile ? "Настройки" : "Варианты решения жалоб" },
          ]}
        />
        {tab === "settings" ? (
          <ComplaintSettingsSection model={settingsSection} />
        ) : tab === "statistics" ? (
          <ComplaintStatisticsSection model={statisticsSection} />
        ) : (
          <ComplaintListSection model={complaintList} />
        )}
      </Stack>
      <ComplaintDrawer
        complaint={complaintDrawer.complaint}
        onClose={complaintDrawer.close}
        onChanged={complaintDrawer.refresh}
        onOpenOrder={complaintDrawer.openOrder}
        api={complaintDrawer.api}
        cities={complaintDrawer.cities}
        points={complaintDrawer.points}
        withLoading={complaintDrawer.withLoading}
      />
      <OrderDetailsModal
        open={orderDetails.open}
        onClose={orderDetails.closeOrder}
        order={orderDetails.order}
      />
      <ComplaintRegistrationDrawer
        selected={registrationDrawer.selected}
        onClose={registrationDrawer.close}
        api={registrationDrawer.api}
        onSaved={registrationDrawer.saved}
        cities={registrationDrawer.cities}
        points={registrationDrawer.points}
        withLoading={registrationDrawer.withLoading}
      />
    </Box>
  );
}
