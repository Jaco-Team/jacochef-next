import { V2Modal } from "@/ui/v2";
import { buildStaffScheduleModalProps } from "./staffScheduleModalPresets";

export default function StaffScheduleResponsiveModal({
  titleSx,
  titleContainerSx,
  contentSx,
  paperSx,
  actionsSx,
  closeButtonSx,
  ...props
}) {
  const modalProps = buildStaffScheduleModalProps({
    titleSx,
    titleContainerSx,
    contentSx,
    paperSx,
    actionsSx,
    closeButtonSx,
  });

  return (
    <V2Modal
      titleSx={modalProps.titleSx}
      titleContainerSx={modalProps.titleContainerSx}
      contentSx={modalProps.contentSx}
      paperSx={modalProps.paperSx}
      actionsSx={modalProps.actionsSx}
      closeButtonSx={modalProps.closeButtonSx}
      {...props}
    />
  );
}
