"use client";

import { Button, Stack } from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import {
  VendorMainSection,
  VendorPointMailsSection,
  VendorSettingsSection,
} from "./VendorFormSections";

function VendorEditorForm({
  mode = "create",
  vendor,
  vendorCities = [],
  allCities = [],
  mails = [],
  allPoints = [],
  onVendorChange,
  onVendorToggle,
  onVendorCitiesChange,
  onMailChange,
  onAddMail,
  onRemoveMail,
  onCancel,
  onSubmit,
  isSubmitting,
}) {
  if (!vendor) {
    return null;
  }

  return (
    <Stack spacing={3}>
      <VendorMainSection
        vendor={vendor}
        vendorCities={vendorCities}
        allCities={allCities}
        onVendorChange={onVendorChange}
        onCitiesChange={onVendorCitiesChange}
      />
      <VendorSettingsSection
        mode={mode}
        vendor={vendor}
        onVendorToggle={onVendorToggle}
      />
      <VendorPointMailsSection
        mails={mails}
        allPoints={allPoints}
        vendorCities={vendorCities}
        onMailChange={onMailChange}
        onAddMail={onAddMail}
        onRemoveMail={onRemoveMail}
      />

      <Stack
        direction={{ xs: "column-reverse", sm: "row" }}
        spacing={2}
        justifyContent="flex-end"
      >
        {onCancel ? <Button onClick={onCancel}>Отмена</Button> : null}
        <Button
          variant="contained"
          startIcon={<SaveOutlinedIcon />}
          onClick={onSubmit}
          disabled={isSubmitting || !vendor.name?.trim()}
        >
          {mode === "update" ? "Сохранить" : "Создать поставщика"}
        </Button>
      </Stack>
    </Stack>
  );
}

export default VendorEditorForm;
