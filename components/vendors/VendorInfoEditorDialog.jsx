"use client";

import { useEffect, useState } from "react";
import VendorEditDialog from "./VendorEditDialog";
import { VendorMainSection, VendorSettingsSection } from "./VendorFormSections";
import { normalizeCities, normalizeVendor } from "./vendorFormUtils";

export default function VendorInfoEditorDialog({
  open,
  vendor,
  vendorCities,
  allCities,
  isSubmitting,
  onClose,
  onSubmit,
}) {
  const [draftVendor, setDraftVendor] = useState(() => normalizeVendor(vendor));
  const [draftVendorCities, setDraftVendorCities] = useState(() => normalizeCities(vendorCities));

  useEffect(() => {
    if (!open) {
      return;
    }

    setDraftVendor(normalizeVendor(vendor));
    setDraftVendorCities(normalizeCities(vendorCities));
  }, [open, vendor, vendorCities]);

  return (
    <VendorEditDialog
      open={open}
      onClose={onClose}
      onSubmit={() => onSubmit(draftVendor, draftVendorCities)}
      title="Редактировать поставщика"
      isSubmitting={isSubmitting}
      isSubmitDisabled={!draftVendor.name?.trim()}
    >
      <VendorMainSection
        vendor={draftVendor}
        vendorCities={draftVendorCities}
        allCities={allCities}
        onVendorChange={(field, value) => setDraftVendor((prev) => ({ ...prev, [field]: value }))}
        onCitiesChange={setDraftVendorCities}
      />
      <VendorSettingsSection
        mode="update"
        vendor={draftVendor}
        onVendorToggle={(field) =>
          setDraftVendor((prev) => ({ ...prev, [field]: Number(prev[field]) ? 0 : 1 }))
        }
      />
    </VendorEditDialog>
  );
}
