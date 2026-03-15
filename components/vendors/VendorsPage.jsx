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
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import { MySelect, MyTextInput } from "@/ui/Forms";
import useApi from "@/src/hooks/useApi";
import useMyAlert from "@/src/hooks/useMyAlert";
import MyAlert from "@/ui/MyAlert";
import ModalAddVendor from "./ModalAddVendor";
import VendorCard from "./VendorCard";
import useVendorsStore from "./useVendorsStore";

function VendorsPage() {
  const router = useRouter();

  const { api_laravel } = useApi("vendors");
  const { isAlert, closeAlert, showAlert, alertMessage, alertStatus } = useMyAlert();
  const [search, setSearch] = useState("");
  const [isBootstrapped, setIsBootstrapped] = useState(false);

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
      return vendors;
    }

    return vendors.filter((vendor) => vendor.name?.toLowerCase().includes(normalizedSearch));
  }, [vendors, search]);

  const activeVendors = filteredVendors.filter((vendor) => Number(vendor.is_show) === 1);
  const inactiveVendors = filteredVendors.filter((vendor) => Number(vendor.is_show) !== 1);
  const citySelectValue = cities.length ? city : "";

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
        cities: availableCities,
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
          sx={{ display: "flex", gap: 1, justifyContent: "space-between" }}
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
            style={{ minWidth: 220, maxWidth: 300 }}
          />
          <MyTextInput
            label="Поиск по названию"
            value={search}
            func={(event) => setSearch(event.target.value)}
            sx={{ maxWidth: 300 }}
          />

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openModal}
            sx={{ whiteSpace: "nowrap", ml: "auto" }}
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
                    size={{ xs: 12, sm: 6, xl: 4 }}
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
                    size={{ xs: 12, sm: 6, xl: 4 }}
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
      </Grid>
    </>
  );
}

export default memo(VendorsPage);
