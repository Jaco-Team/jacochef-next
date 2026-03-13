"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useApi from "@/src/hooks/useApi";
import useMyAlert from "@/src/hooks/useMyAlert";
import MyAlert from "@/ui/MyAlert";
import useVendorsStore from "./useVendorsStore";
import VendorEditorForm from "./VendorEditorForm";
import {
  buildMailsPayload,
  buildVendorCitiesPayload,
  buildVendorPayload,
  createEmptyVendor,
  normalizeCities,
  normalizeMails,
  normalizeVendor,
} from "./vendorFormUtils";

export default function ModalAddVendor({ onSaved }) {
  const open = useVendorsStore((state) => state.modalOpen);
  const close = useVendorsStore((state) => state.closeModal);

  const { api_laravel } = useApi("vendors");
  const { isAlert, closeAlert, showAlert, alertMessage, alertStatus } = useMyAlert();

  const [isLoading, setIsLoading] = useState(false);
  const [vendor, setVendor] = useState(createEmptyVendor());
  const [allCities, setAllCities] = useState([]);
  const [vendorCities, setVendorCities] = useState([]);
  const [allPoints, setAllPoints] = useState([]);
  const [mails, setMails] = useState([]);

  const title = useMemo(() => "Новый поставщик", []);

  const resetState = () => {
    setVendor(createEmptyVendor());
    setAllCities([]);
    setVendorCities([]);
    setAllPoints([]);
    setMails([]);
  };

  useEffect(() => {
    if (!open) {
      resetState();
      return;
    }

    let isMounted = true;

    const loadTemplate = async () => {
      try {
        setIsLoading(true);
        const response = await api_laravel("get_vendor_info", { vendor_id: 0 });

        if (!response?.st) {
          throw new Error(response?.text || "Не удалось загрузить форму поставщика");
        }

        if (!isMounted) {
          return;
        }

        setVendor(normalizeVendor(response.vendor));
        setAllCities(normalizeCities(response.all_cities));
        setVendorCities(normalizeCities(response.vendor_cities));
        setAllPoints(response.all_points || []);
        setMails(normalizeMails(response.mails));
      } catch (error) {
        showAlert(error?.message || "Ошибка запроса", false);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTemplate();

    return () => {
      isMounted = false;
    };
  }, [open]);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      const response = await api_laravel("new_vendor", {
        vendor: buildVendorPayload(vendor, "create"),
        vendor_cities: buildVendorCitiesPayload(vendorCities),
        mails: buildMailsPayload(mails),
      });

      if (!response?.st) {
        throw new Error(response?.text || "Не удалось создать поставщика");
      }

      onSaved?.(response.vendors || []);
      close();
    } catch (error) {
      showAlert(error?.message || "Ошибка запроса", false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={Boolean(open)}
        onClose={close}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ pr: 6 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6">{title}</Typography>
            <IconButton
              onClick={close}
              sx={{ position: "absolute", right: 16, top: 16 }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          {isLoading && allCities.length === 0 ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              sx={{ minHeight: 240 }}
            >
              <CircularProgress />
            </Stack>
          ) : (
            <VendorEditorForm
              mode="create"
              vendor={vendor}
              vendorCities={vendorCities}
              allCities={allCities}
              mails={mails}
              allPoints={allPoints}
              isSubmitting={isLoading}
              onVendorChange={(field, value) => setVendor((prev) => ({ ...prev, [field]: value }))}
              onVendorToggle={(field) =>
                setVendor((prev) => ({ ...prev, [field]: Number(prev[field]) ? 0 : 1 }))
              }
              onVendorCitiesChange={setVendorCities}
              onMailChange={(index, field, value) =>
                setMails((prev) =>
                  prev.map((mail, mailIndex) =>
                    mailIndex === index ? { ...mail, [field]: value } : mail,
                  ),
                )
              }
              onAddMail={(mail) => setMails((prev) => [...prev, mail])}
              onRemoveMail={(index) =>
                setMails((prev) => prev.filter((_, mailIndex) => mailIndex !== index))
              }
              onCancel={close}
              onSubmit={handleSubmit}
            />
          )}
        </DialogContent>
      </Dialog>

      <MyAlert
        isOpen={isAlert}
        status={alertStatus}
        text={alertMessage}
        onClose={closeAlert}
      />
    </>
  );
}
