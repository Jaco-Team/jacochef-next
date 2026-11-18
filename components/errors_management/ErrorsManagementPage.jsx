"use client";

import { Box, Stack, Typography } from "@mui/material";
import OrderDetailsModal from "@/components/shared/order/OrderDetailsModal";
import {
  JacoAlert,
  JacoBackdropLoader,
  JacoSegmentedTabs,
  JacoSurface,
} from "@/design-system/shared/ui";
import ComplaintDrawer from "./sections/ComplaintDrawer";
import ComplaintListSection from "./sections/ComplaintListSection";
import ComplaintRegistrationDrawer from "./sections/ComplaintRegistrationDrawer";
import ComplaintSettingsSection from "./sections/ComplaintSettingsSection";
import ComplaintStatisticsSection from "./sections/ComplaintStatisticsSection";
import useErrorsManagementPage from "./useErrorsManagementPage";
import { rootSx, titleSx } from "./constants";

function NoAccess() {
  return (
    <JacoSurface sx={{ p: { xs: 3, md: 4 }, textAlign: "center" }}>
      <Stack
        spacing={1}
        sx={{ alignItems: "center" }}
      >
        <Typography fontWeight={700}>Нет доступных разделов</Typography>
        <Typography color="text.secondary">
          В вашей должности не включены права на разделы модуля. Обратитесь к администратору.
        </Typography>
      </Stack>
    </JacoSurface>
  );
}

function ActiveSection({ tab, complaintList, statisticsSection, settingsSection }) {
  if (tab === "settings") return <ComplaintSettingsSection model={settingsSection} />;
  if (tab === "statistics") return <ComplaintStatisticsSection model={statisticsSection} />;
  if (tab === "journal" || tab === "registration") {
    return <ComplaintListSection model={complaintList} />;
  }
  return null;
}

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
  const { loading, message, notice, closeNotice, mobile, ready, tab, tabs, title, setTab } = shell;
  return (
    <Box
      className="container_first_child"
      sx={rootSx}
    >
      <JacoBackdropLoader
        open={loading}
        sx={{ "& .MuiCircularProgress-root": { color: "#FFFFFF" } }}
      />
      <JacoAlert
        isOpen={Boolean(notice)}
        status
        text={notice}
        autoHideDuration={5000}
        onClose={closeNotice}
      />
      <Stack spacing={2.5}>
        <Typography
          component="h1"
          sx={titleSx}
        >
          {title}
        </Typography>
        {message ? <JacoAlert severity="error">{message}</JacoAlert> : null}
        {ready && tabs.length === 0 ? <NoAccess /> : null}
        {tabs.length > 0 ? (
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
            items={tabs.map((item) => ({
              id: item.id,
              label: mobile ? item.mobileLabel : item.label,
            }))}
          />
        ) : null}
        {ready ? (
          <ActiveSection
            tab={tab}
            complaintList={complaintList}
            statisticsSection={statisticsSection}
            settingsSection={settingsSection}
          />
        ) : null}
      </Stack>
      <ComplaintDrawer
        complaint={complaintDrawer.complaint}
        onClose={complaintDrawer.close}
        onChanged={complaintDrawer.refresh}
        onOpenOrder={complaintDrawer.openOrder}
        api={complaintDrawer.api}
        cities={complaintDrawer.cities}
        points={complaintDrawer.points}
        permissions={complaintDrawer.permissions}
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
