"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { useShallow } from "zustand/react/shallow";
import {
  Alert,
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useConfirm } from "@/src/hooks/useConfirm";
import MyAlert from "@/ui/MyAlert";
import TabPanel from "@/ui/TabPanel/TabPanel";
import a11yProps from "@/ui/TabPanel/a11yProps";
import TabInfo from "./tabs/TabInfo";
import TabLocations from "./tabs/TabLocations";
import TabProducts from "./tabs/TabProducts";
import TabDocuments from "./tabs/TabDocuments";
import ModalAddDeclaration from "./ModalAddDeclaration";
import VendorInfoEditorDialog from "./VendorInfoEditorDialog";
import VendorPointMailsDialog from "./VendorPointMailsDialog";
import useVendorAccess from "./useVendorAccess";
import useVendorDetailsPage from "./useVendorDetailsPage";
import useVendorDetailsStore from "./useVendorDetailsStore";
import useVendorsStore from "./useVendorsStore";

const TAB_DEFINITIONS = [
  { index: 0, key: "overview", label: "Обзор", icon: <SummarizeOutlinedIcon fontSize="small" /> },
  { index: 1, key: "locations", label: "Локации", icon: <PlaceOutlinedIcon fontSize="small" /> },
  {
    index: 2,
    key: "products",
    label: "Продукты",
    icon: <Inventory2OutlinedIcon fontSize="small" />,
  },
  {
    index: 3,
    key: "documents",
    label: "Документы",
    icon: <DescriptionOutlinedIcon fontSize="small" />,
  },
];

export default function VendorDetailPage() {
  const router = useRouter();
  const vendorId = Number(router.query.id);
  const { canEdit, canUpload } = useVendorAccess();
  const setLoading = useVendorsStore((state) => state.setLoading);
  const [activeTab, setActiveTab] = useState(0);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [isPointMailsDialogOpen, setIsPointMailsDialogOpen] = useState(false);
  const { allCities, allPoints, isDocModalOpen, mails, vendor, vendorCities } =
    useVendorDetailsStore(
      useShallow((state) => ({
        allCities: state.allCities || [],
        allPoints: state.allPoints || [],
        isDocModalOpen: state.isDocModalOpen,
        mails: state.mails || [],
        vendor: state.vendor,
        vendorCities: state.vendorCities || [],
      })),
    );
  const { ConfirmDialog, withConfirm } = useConfirm();
  const {
    alertMessage,
    alertStatus,
    closeAlert,
    closeDocModal,
    handleAddVendorItem,
    handleDeleteDeclaration,
    handleDeleteVendor,
    handleDocumentModalSubmit,
    handleQuickToggleVendorField,
    handleToggleCity,
    handleVendorInfoSubmit,
    handleVendorMailsSubmit,
    handleRemoveVendorItem,
    handleUnbindDeclaration,
    isAlert,
    isLoading,
    openDocModal,
  } = useVendorDetailsPage(vendorId);
  const activeTabDefinition =
    TAB_DEFINITIONS.find((tab) => tab.index === activeTab) ?? TAB_DEFINITIONS[0];

  return (
    <>
      <Backdrop
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 2 }}
        open={isLoading}
      >
        <CircularProgress />
      </Backdrop>

      <MyAlert
        isOpen={isAlert}
        status={alertStatus}
        text={alertMessage}
        onClose={closeAlert}
      />

      <ConfirmDialog />

      <ModalAddDeclaration
        open={isDocModalOpen}
        onClose={closeDocModal}
        onSubmit={handleDocumentModalSubmit}
      />
      <VendorInfoEditorDialog
        open={isInfoDialogOpen}
        vendor={vendor}
        vendorCities={vendorCities}
        allCities={allCities}
        isSubmitting={isLoading}
        onClose={() => setIsInfoDialogOpen(false)}
        onSubmit={async (nextVendor, nextVendorCities) => {
          const isSaved = await handleVendorInfoSubmit(nextVendor, nextVendorCities);
          if (isSaved) {
            setIsInfoDialogOpen(false);
          }
        }}
      />
      <VendorPointMailsDialog
        open={isPointMailsDialogOpen}
        mails={mails}
        allPoints={allPoints}
        vendorCities={vendorCities}
        isSubmitting={isLoading}
        onClose={() => setIsPointMailsDialogOpen(false)}
        onSubmit={async (nextMails) => {
          const isSaved = await handleVendorMailsSubmit(nextMails);
          if (isSaved) {
            setIsPointMailsDialogOpen(false);
          }
        }}
      />

      <Grid
        container
        className="container_first_child"
        spacing={3}
      >
        <Grid
          size={{ xs: 12, md: 3 }}
          sx={{ display: { xs: "none", md: "block" } }}
        >
          <Card sx={{ minHeight: "calc(100vh - 120px)" }}>
            <CardContent sx={{ p: 0 }}>
              <Stack spacing={0}>
                <Button
                  startIcon={<KeyboardBackspaceIcon />}
                  sx={{ justifyContent: "flex-start", p: 2 }}
                  onClick={() => {
                    setLoading(true);
                    router.push("/vendors");
                  }}
                >
                  Все поставщики
                </Button>
                <Box sx={{ px: 3, pb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 800 }}
                  >
                    {vendor?.name || "Поставщик"}
                  </Typography>
                </Box>
                <Tabs
                  orientation="vertical"
                  value={activeTab}
                  onChange={(_, value) => setActiveTab(value)}
                  aria-label="Vendor tabs"
                  sx={{
                    borderTop: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  {TAB_DEFINITIONS.map((tab) => (
                    <Tab
                      key={tab.index}
                      icon={tab.icon}
                      iconPosition="start"
                      label={tab.label}
                      {...a11yProps(tab.index)}
                      sx={{
                        display: "flex",
                        justifyContent: "flex-start",
                        flexDirection: "row",
                        px: 3,
                        py: 1.5,
                        alignItems: "center",
                        whiteSpace: "nowrap",
                        minHeight: 56,
                        minWidth: 180,
                        columnGap: 1,
                        "& .MuiTab-icon": {
                          marginBottom: "0 !important",
                          marginRight: "0 !important",
                        },
                      }}
                    />
                  ))}
                </Tabs>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 9 }}>
          <Stack
            spacing={3}
            sx={{ pb: { xs: 10, md: 0 } }}
          >
            <Box>
              <Box sx={{ display: { xs: "flex", md: "none" }, mb: 1 }}>
                <Button
                  startIcon={<KeyboardBackspaceIcon />}
                  onClick={() => {
                    setLoading(true);
                    router.push("/vendors");
                  }}
                >
                  Назад
                </Button>
              </Box>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", sm: "center" }}
                justifyContent="space-between"
              >
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 800 }}
                >
                  {activeTabDefinition.label}
                </Typography>

                {activeTab === 0 || activeTab === 1 ? (
                  canEdit ? (
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      sx={{ alignSelf: { xs: "center", sm: "auto" } }}
                    >
                      <Button
                        variant="outlined"
                        startIcon={<EditOutlinedIcon />}
                        onClick={() =>
                          activeTab === 0
                            ? setIsInfoDialogOpen(true)
                            : setIsPointMailsDialogOpen(true)
                        }
                        disabled={isLoading || !vendor}
                        sx={{ width: { xs: "100%", sm: "auto" } }}
                      >
                        Редактировать
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<DeleteOutlineIcon />}
                        onClick={withConfirm(
                          handleDeleteVendor,
                          "Удалить поставщика без возможности восстановления?",
                        )}
                        sx={{ width: { xs: "100%", sm: "auto" } }}
                      >
                        Удалить
                      </Button>
                    </Stack>
                  ) : null
                ) : null}
              </Stack>
            </Box>

            {!isLoading && !vendor ? (
              <Alert severity="error">Поставщик не найден или не загрузился.</Alert>
            ) : (
              <>
                <TabPanel
                  value={activeTab}
                  index={0}
                >
                  <TabInfo
                    canEdit={canEdit}
                    onToggleVendorField={handleQuickToggleVendorField}
                    onToggleVendorActive={withConfirm(
                      () => handleQuickToggleVendorField("is_show"),
                      "Изменить активность поставщика?",
                    )}
                  />
                </TabPanel>
                <TabPanel
                  value={activeTab}
                  index={1}
                >
                  <TabLocations
                    canEdit={canEdit}
                    onToggleCity={handleToggleCity}
                  />
                </TabPanel>
                <TabPanel
                  value={activeTab}
                  index={2}
                >
                  <TabProducts
                    canEdit={canEdit}
                    canUpload={canUpload}
                    handleAddVendorItem={handleAddVendorItem}
                    handleRemoveVendorItem={handleRemoveVendorItem}
                    handleUnbindDeclaration={handleUnbindDeclaration}
                    openDocModal={openDocModal}
                  />
                </TabPanel>
                <TabPanel
                  value={activeTab}
                  index={3}
                >
                  <TabDocuments
                    canEdit={canEdit}
                    canUpload={canUpload}
                    handleDeleteDeclaration={handleDeleteDeclaration}
                    handleUnbindDeclaration={handleUnbindDeclaration}
                    openDocModal={openDocModal}
                  />
                </TabPanel>
              </>
            )}
          </Stack>
        </Grid>
      </Grid>

      <Box
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          display: { xs: "block", md: "none" },
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          variant="fullWidth"
          aria-label="Vendor mobile tabs"
          sx={{}}
        >
          {TAB_DEFINITIONS.map((tab) => (
            <Tab
              key={tab.index}
              icon={tab.icon}
              iconPosition="start"
              label={""}
              {...a11yProps(tab.index)}
              sx={{
                display: "flex",
                minHeight: 60,
                minWidth: 60,
                flexDirection: "row",
                alignItems: "center",
                whiteSpace: "nowrap",
                // columnGap: 0,
                "& .MuiTab-icon": {
                  marginBottom: "0 !important",
                  marginRight: "0 !important",
                },
              }}
            />
          ))}
        </Tabs>
      </Box>
    </>
  );
}
