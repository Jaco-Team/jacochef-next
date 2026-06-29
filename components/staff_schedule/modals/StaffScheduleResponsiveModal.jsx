import { V2Modal } from "@/ui/v2";

export default function StaffScheduleResponsiveModal({
  titleSx,
  titleContainerSx,
  contentSx,
  paperSx,
  actionsSx,
  closeButtonSx,
  ...props
}) {
  return (
    <V2Modal
      titleSx={{
        fontSize: 16,
        lineHeight: 1.25,
        fontWeight: 400,
        color: "#666666",
        ...titleSx,
      }}
      contentSx={{
        px: 3,
        pt: 2.5,
        pb: 2,
        backgroundColor: "#FFFFFF",
        ...contentSx,
      }}
      paperSx={{
        borderRadius: "10px",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 10px 28px rgba(17, 24, 39, 0.18)",
        ...paperSx,
      }}
      actionsSx={{
        px: 3,
        py: 1.75,
        borderTop: "none",
        backgroundColor: "#FFFFFF",
        ...actionsSx,
      }}
      titleContainerSx={titleContainerSx}
      closeButtonSx={closeButtonSx}
      {...props}
    />
  );
}
