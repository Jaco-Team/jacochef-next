"use client";
import { memo } from "react";
import {
  Box,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Grid,
  Stack,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import { MySelect } from "@/ui/Forms";
import useVendorsStore from "@/src/stores/useVendorsStore";
import VendorCard from "./VendorCard";
import ModalAddVendor from "./ModalAddVendor";
import useApi from "@/src/hooks/useApi";
import useMyAlert from "@/src/hooks/useMyAlert";
import MyAlert from "@/ui/MyAlert";

function VendorsPage() {
  const { isAlert, closeAlert, showAlert, alertMessage, alertStatus } = useMyAlert(100);

  const cities = useVendorsStore((s) => s.cities());
  const cityFilter = useVendorsStore((s) => s.cityFilter);
  const setCityFilter = useVendorsStore((s) => s.setCityFilter);
  const openModal = useVendorsStore((s) => s.openModal);
  const vendors = useVendorsStore((s) => s.vendors);
  const toggleActive = useVendorsStore((s) => s.toggleActive);

  const filtered = vendors.filter((v) => cityFilter === "all" || v.city === cityFilter);
  const activeVendors = filtered.filter((v) => v.active);
  const inactiveVendors = filtered.filter((v) => !v.active);

  const setState = useVendorsStore.setState;

  const { api_laravel } = useApi("vendors");
  const getData = async (method, data) => {
    try {
      setState({ isLoading: true });
      const res = await api_laravel(method, data);
    } catch (e) {
      return;
    }
  };

  return (
    <>
      <Backdrop
        sx={{ zIndex: (theme) => theme.zIndex.modal + 2 }}
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
      <Box>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
          >
            <MySelect
              label="City"
              data={cities.map((c) => ({ id: c, name: c }))}
              value={cityFilter}
              func={(e) => setCityFilter(e.target.value)}
              is_none={false}
              style={{ minWidth: 220 }}
            />
          </Stack>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openModal}
          >
            Add vendor
          </Button>
        </Stack>

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 600 }}>Active ({activeVendors.length})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid
              container
              spacing={2}
            >
              {activeVendors.map((v) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={v.id}
                >
                  <VendorCard
                    vendor={v}
                    onToggleActive={toggleActive}
                  />
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 600 }}>Inactive ({inactiveVendors.length})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid
              container
              spacing={2}
            >
              {inactiveVendors.map((v) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={v.id}
                >
                  <VendorCard
                    vendor={v}
                    onToggleActive={toggleActive}
                  />
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>

        <ModalAddVendor />
      </Box>
    </>
  );
}

export default memo(VendorsPage);
