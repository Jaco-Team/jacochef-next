"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Backdrop,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { MySelect, MyTextInput } from "@/ui/Forms";
import useApi from "@/src/hooks/useApi";
import useMyAlert from "@/src/hooks/useMyAlert";
import { useConfirm } from "@/src/hooks/useConfirm";
import MyAlert from "@/ui/MyAlert";
import ModalAddVendor from "./ModalAddVendor";
import useVendorAccess from "./useVendorAccess";
import VendorCard from "./VendorCard";
import useVendorsStore from "./useVendorsStore";
import { normalizeCatalogItems } from "./vendorFormUtils";

function VendorsPage() {
  const router = useRouter();

  const { api_laravel } = useApi("vendors");
  const { ConfirmDialog, withConfirm } = useConfirm();
  const { isAlert, closeAlert, showAlert, alertMessage, alertStatus } = useMyAlert();
  const [search, setSearch] = useState("");
  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const { canEdit } = useVendorAccess();

  const module_name = useVendorsStore((state) => state.module_name);
  const cities = useVendorsStore((state) => state.cities);
  const city = useVendorsStore((state) => state.city);
  const vendors = useVendorsStore((state) => state.vendors);
  const isLoading = useVendorsStore((state) => state.isLoading);
  const openModal = useVendorsStore((state) => state.openModal);
  const setBootstrap = useVendorsStore((state) => state.setBootstrap);
  const setCity = useVendorsStore((state) => state.setCity);
  const setVendors = useVendorsStore((state) => state.setVendors);
  const setLoading = useVendorsStore((state) => state.setLoading);

  const filteredVendors = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return vendors ?? [];
    }

    return (
      vendors?.filter(
        (vendor) =>
          vendor.name?.toLowerCase().includes(normalizedSearch) ||
          vendor.inn?.toLowerCase().includes(normalizedSearch),
      ) ?? []
    );
  }, [vendors, search]);

  const activeVendors = filteredVendors.filter((vendor) => Number(vendor.is_show) === 1);
  const inactiveVendors = filteredVendors.filter((vendor) => Number(vendor.is_show) !== 1);
  const citySelectValue = cities.length ? city : "";

  const handleDeleteVendor = async (vendorId) => {
    if (!vendorId) {
      return false;
    }

    const response = await callApi("delete_vendor", {
      vendor_id: Number(vendorId),
    });

    if (!response?.st) {
      return false;
    }

    const nextVendors = (useVendorsStore.getState().vendors ?? []).filter(
      (vendor) => Number(vendor.id) !== Number(vendorId),
    );
    setVendors(nextVendors);
    showAlert("Поставщик удален", true);
    return true;
  };

  const callApi = async (method, data = {}) => {
    try {
      setLoading(true);
      const response = await api_laravel(method, data);

      if (!response?.st) {
        throw new Error(response?.text || "Ошибка запроса");
      }

      return response;
    } catch (error) {
      showAlert(error?.message || "Ошибка запроса", false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadBootstrap = async () => {
      const response = await callApi("get_all");

      if (!response || !isMounted) {
        return;
      }

      const availableCities = response.cities || [];
      const hasCurrentCity = availableCities.some((option) => Number(option.id) === Number(city));
      const nextCity = hasCurrentCity
        ? Number(city)
        : Number(
            availableCities.find((option) => Number(option.id) === -1)?.id ??
              availableCities[0]?.id ??
              -1,
          );

      setBootstrap({
        module_name: response.module_info?.name || "Поставщики",
        access: response.access || {},
        cities: availableCities,
        allPoints: response.all_points || [],
        allDeclarations: response.all_declarations || [],
        allItems: normalizeCatalogItems(response.all_items),
        vendors: [],
        city: nextCity,
      });
      document.title = response.module_info?.name || "Поставщики";
      setIsBootstrapped(true);
    };

    loadBootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isBootstrapped) {
      return;
    }

    let isMounted = true;

    const loadVendors = async () => {
      const response = await callApi("get_vendors", { city: Number(city) });

      if (response && isMounted) {
        setVendors(response.vendors || []);
      }
    };

    loadVendors();

    return () => {
      isMounted = false;
    };
  }, [city, isBootstrapped]);

  return (
    <>
      <Backdrop
        sx={{ zIndex: (theme) => theme.zIndex.modal + 2 }}
        open={isLoading}
      >
        <CircularProgress />
      </Backdrop>

      <ModalAddVendor onSaved={setVendors} />

      <MyAlert
        isOpen={isAlert}
        status={alertStatus}
        text={alertMessage}
        onClose={closeAlert}
      />

      <ConfirmDialog />

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
        <Grid
          size={12}
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1,
            justifyContent: "space-between",
          }}
        >
          <MySelect
            label="Город"
            data={(cities || []).map((option) => ({
              id: option.id,
              name: option.name,
            }))}
            value={citySelectValue}
            func={(event) => setCity(Number(event.target.value))}
            is_none={false}
            sx={{ minWidth: 180, maxWidth: { xs: "auto", sm: 300 } }}
          />
          <MyTextInput
            type="search"
            label="Поиск по названию или ИНН"
            value={search}
            func={(event) => setSearch(event.target.value)}
            sx={{ maxWidth: { xs: "auto", sm: 300 } }}
          />

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openModal}
            disabled={!canEdit}
            sx={{ minWidth: 180, whiteSpace: "nowrap", ml: { sm: "auto", xs: "none" } }}
          >
            Добавить поставщика
          </Button>
        </Grid>

        <Grid size={12}>
          <Accordion
            defaultExpanded
            sx={{ borderRadius: "16px !important" }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 700 }}>Активные ({activeVendors.length})</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid
                container
                spacing={2}
              >
                {activeVendors.map((vendor) => (
                  <Grid
                    key={vendor.id}
                    size={{ xs: 12, sm: 12, xl: 6 }}
                  >
                    <VendorCard
                      vendor={vendor}
                      cities={cities}
                      onClick={(item) => {
                        setLoading(true);
                        router.push(`/vendors/${item.id}`);
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        <Grid size={12}>
          <Accordion sx={{ borderRadius: "16px !important" }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 700 }}>
                Неактивные ({inactiveVendors.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid
                container
                spacing={2}
              >
                {inactiveVendors.map((vendor) => (
                  <Grid
                    key={vendor.id}
                    size={{ xs: 12, sm: 12, xl: 6 }}
                  >
                    <VendorCard
                      vendor={vendor}
                      cities={cities}
                      action={
                        canEdit ? (
                          <Tooltip title="Удалить поставщика">
                            <IconButton
                              onClick={withConfirm(
                                () => handleDeleteVendor(vendor.id),
                                "Удалить неактивного поставщика без возможности восстановления?",
                              )}
                              sx={{ color: "primary.main" }}
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          </Tooltip>
                        ) : null
                      }
                      onClick={(item) => {
                        setLoading(true);
                        router.push(`/vendors/${item.id}`);
                      }}
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
