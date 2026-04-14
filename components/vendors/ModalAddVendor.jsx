"use client";

import { useEffect, useState } from "react";
import { Button, DialogActions, DialogContent, Stack } from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import useApi from "@/src/hooks/useApi";
import useMyAlert from "@/src/hooks/useMyAlert";
import MyAlert from "@/ui/MyAlert";
import MyModal from "@/ui/MyModal";
import useVendorAccess from "./useVendorAccess";
import useVendorsStore from "./useVendorsStore";
import {
  VendorItemsSection,
  VendorMainSection,
  VendorPointMailsSection,
  VendorSettingsSection,
} from "./VendorFormSections";
import {
  buildVendorItemsPayload,
  buildMailsPayload,
  buildVendorCitiesPayload,
  buildVendorPayload,
  createEmptyVendor,
  normalizeCatalogItems,
  normalizeCities,
} from "./vendorFormUtils";

export default function ModalAddVendor({ onSaved }) {
  const open = useVendorsStore((state) => state.modalOpen);
  const close = useVendorsStore((state) => state.closeModal);
  const cities = useVendorsStore((state) => state.cities);
  const allPoints = useVendorsStore((state) => state.allPoints);
  const allItems = useVendorsStore((state) => state.allItems);
  const { canEdit } = useVendorAccess();

  const { api_laravel } = useApi("vendors");
  const { isAlert, closeAlert, showAlert, alertMessage, alertStatus } = useMyAlert();

  const [vendor, setVendor] = useState(createEmptyVendor());
  const [vendorCities, setVendorCities] = useState([]);
  const [mails, setMails] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allCities = normalizeCities((cities || []).filter((city) => Number(city?.id) > 0));
  const catalogItems = normalizeCatalogItems(allItems);

  const resetState = () => {
    setVendor(createEmptyVendor());
    setVendorCities([]);
    setMails([]);
    setSelectedItems([]);
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!canEdit) {
      showAlert("Недостаточно прав для редактирования поставщиков", false);
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await api_laravel("new_vendor", {
        vendor: buildVendorPayload(vendor, "create"),
        vendor_cities: buildVendorCitiesPayload(vendorCities),
        mails: buildMailsPayload(mails),
      });

      if (!response?.st) {
        throw new Error(response?.text || "Не удалось создать поставщика");
      }

      const createdVendorId = Number(response?.vendor_id ?? response?.vendor?.id ?? response?.id);

      if (selectedItems.length) {
        if (!createdVendorId) {
          throw new Error(
            "Поставщик создан, но backend не вернул vendor_id для сохранения товаров",
          );
        }

        const itemsResponse = await api_laravel("save_vendor_items", {
          vendor_id: createdVendorId,
          items: buildVendorItemsPayload(selectedItems),
        });

        if (!itemsResponse?.st) {
          throw new Error(itemsResponse?.text || "Не удалось сохранить товары поставщика");
        }
      }

      if (Array.isArray(response.vendors)) {
        onSaved?.(response.vendors);
      }
      close();
    } catch (error) {
      showAlert(error?.message || "Ошибка запроса", false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <MyModal
        open={Boolean(open)}
        onClose={close}
        maxWidth="md"
        title="Новый поставщик"
      >
        <DialogContent sx={{ pb: 2 }}>
          <Stack spacing={3}>
            <VendorMainSection
              vendor={vendor}
              vendorCities={vendorCities}
              allCities={allCities}
              onVendorChange={(field, value) => setVendor((prev) => ({ ...prev, [field]: value }))}
              onCitiesChange={setVendorCities}
            />
            <VendorSettingsSection
              mode="create"
              vendor={vendor}
              onVendorToggle={(field) =>
                setVendor((prev) => ({ ...prev, [field]: Number(prev[field]) ? 0 : 1 }))
              }
            />
            <VendorPointMailsSection
              mails={mails}
              allPoints={allPoints}
              vendorCities={vendorCities}
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
            />
            <VendorItemsSection
              allItems={catalogItems}
              selectedItems={selectedItems}
              onSelectedItemsChange={setSelectedItems}
              disabled={isSubmitting}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={close}
            disabled={isSubmitting}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveOutlinedIcon />}
            onClick={handleSubmit}
            disabled={isSubmitting || !vendor.name?.trim() || !canEdit}
          >
            Создать поставщика
          </Button>
        </DialogActions>
      </MyModal>

      <MyAlert
        isOpen={isAlert}
        status={alertStatus}
        text={alertMessage}
        onClose={closeAlert}
      />
    </>
  );
}
