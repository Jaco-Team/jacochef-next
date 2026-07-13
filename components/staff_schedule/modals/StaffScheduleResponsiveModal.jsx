import { V2ResponsiveModalShell } from "@/ui/v2";
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
    <V2ResponsiveModalShell
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
