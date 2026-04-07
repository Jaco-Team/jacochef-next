"use client";

import { useEffect, useState } from "react";
import VendorEditDialog from "./VendorEditDialog";
import { VendorPointMailsSection } from "./VendorFormSections";
import { normalizeMails } from "./vendorFormUtils";

export default function VendorPointMailsDialog({
  open,
  mails,
  allPoints,
  vendorCities,
  isSubmitting,
  onClose,
  onSubmit,
}) {
  const [draftMails, setDraftMails] = useState(() => normalizeMails(mails, allPoints));

  useEffect(() => {
    if (!open) {
      return;
    }

    setDraftMails(normalizeMails(mails, allPoints));
  }, [open, mails, allPoints]);

  return (
    <VendorEditDialog
      open={open}
      onClose={onClose}
      onSubmit={() => onSubmit(draftMails)}
      title="Редактировать email по точкам"
      isSubmitting={isSubmitting}
    >
      <VendorPointMailsSection
        mails={draftMails}
        allPoints={allPoints}
        vendorCities={vendorCities}
        onMailChange={(index, field, value) =>
          setDraftMails((prev) =>
            prev.map((mail, mailIndex) =>
              mailIndex === index ? { ...mail, [field]: value } : mail,
            ),
          )
        }
        onAddMail={(mail) => setDraftMails((prev) => [...prev, mail])}
        onRemoveMail={(index) =>
          setDraftMails((prev) => prev.filter((_, mailIndex) => mailIndex !== index))
        }
      />
    </VendorEditDialog>
  );
}
