"use client";
import { memo, useEffect } from "react";
import {
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
import VendorCard from "./VendorCard";
import ModalAddVendor from "./ModalAddVendor";
import useVendorsStore from "./useVendorsStore";
import useApi from "@/src/hooks/useApi";
import useMyAlert from "@/src/hooks/useMyAlert";
import MyAlert from "@/ui/MyAlert";

function VendorsPage() {
  const { isAlert, closeAlert, showAlert, alertMessage, alertStatus } = useMyAlert();

  const module = useVendorsStore((s) => s.module);
  const module_name = useVendorsStore((s) => s.module_name);
  const cities = useVendorsStore((s) => s.cities);
  const city = useVendorsStore((s) => s.city);
  const setCity = useVendorsStore((s) => s.setCity);
  const openModal = useVendorsStore((s) => s.openModal);
  const vendors = useVendorsStore((s) => s.vendors);
  const toggleActive = useVendorsStore((s) => s.toggleActive);
  const isLoading = useVendorsStore((s) => s.isLoading);

  const filtered = vendors; //.filter((v) => city === -1 || v.city === city);
  const activeVendors = filtered.filter((v) => v.is_show);
  const inactiveVendors = filtered.filter((v) => !v.is_show);

  const setState = useVendorsStore.setState;

  const { api_laravel } = useApi(module);

  const getData = async (method, data) => {
    try {
      setState({ isLoading: true });
      const res = await api_laravel(method, data);
      if (!res?.st) {
        throw new Error(res?.text || "Error");
      }
      return res;
    } catch (e) {
      return showAlert(e?.message || "Ошибка запроса", false);
    } finally {
      setState({ isLoading: false });
    }
  };

  const getAll = async () => {
    const res = await getData("get_all");
    setState({
      cities: res?.cities || [],
      vendors: res?.vendor_items || [],
      items: res?.items || [],
      access: res?.access || [],
      module_name: res.module_info?.name || "",
    });
    document.title = res.module_info?.name;
  };

  const getVendors = async () => {
    const { city } = useVendorsStore.getState();
    const res = await getData("get_vendors", { city });
    setState({
      vendors: res?.vendors || [],
    });
  };

  const getVendorInfo = async () => {
    const { city } = useVendorsStore.getState();
    const res = await getData("get_vendors", { city });
    setState({
      vendors: res?.vendors || [],
    });
  };

  useEffect(() => {
    getAll();
  }, []);

  useEffect(() => {
    getVendors();
  }, [city]);

  return (
    <>
      <Backdrop
        sx={{ zIndex: (theme) => theme.zIndex.modal + 2 }}
        open={isLoading}
      >
        <CircularProgress />
      </Backdrop>
      <ModalAddVendor />
      <MyAlert
        isOpen={isAlert}
        status={alertStatus}
        text={alertMessage}
        onClose={closeAlert}
      />
      <Grid
        container
        spacing={2}
        className="container_first_child"
      >
        <Grid
          size={12}
          sx={{ mb: 2 }}
        >
          <h1>{module_name}</h1>
        </Grid>
        <Grid size={12}>
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
                data={[{ id: -1, name: "All" }, ...(cities || [])].map((c) => ({
                  id: c.id,
                  name: c.name,
                }))}
                value={city ?? -1}
                func={(e) => setCity(Number(e.target.value))}
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
              <Typography sx={{ fontWeight: 600 }}>Активные ({activeVendors?.length})</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid
                container
                spacing={2}
              >
                {activeVendors?.map((v) => (
                  <Grid
                    size={{ xs: 12, sm: 6 }}
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
              <Typography sx={{ fontWeight: 600 }}>
                Неактивные ({inactiveVendors?.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid
                container
                spacing={2}
              >
                {inactiveVendors?.map((v) => (
                  <Grid
                    size={{ xs: 12, sm: 6, md: 4 }}
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
        </Grid>
      </Grid>
    </>
  );
}

export default memo(VendorsPage);
