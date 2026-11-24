import { JacoResponsiveModalShell } from "@/design-system/shared/ui";
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
    <JacoResponsiveModalShell
      desktopBreakpoint="md"
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
