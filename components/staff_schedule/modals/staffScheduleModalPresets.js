export const staffScheduleModalPresets = {
  titleSx: {
    fontSize: 18,
    lineHeight: 1.25,
    fontWeight: 400,
    color: "#666666",
  },
  titleContainerSx: {
    height: 48,
    px: 2.5,
    py: 0,
    backgroundColor: "#F7F7F7",
    borderBottom: "1px solid #E5E5E5",
    display: "flex",
    alignItems: "center",
  },
  contentSx: {
    px: 3,
    pt: 2.5,
    pb: 2,
    backgroundColor: "#FFFFFF",
  },
  paperSx: {
    borderRadius: "10px",
    backgroundColor: "#FFFFFF",
    boxShadow: "0 10px 28px rgba(17, 24, 39, 0.18)",
  },
  actionsSx: {
    px: 3,
    py: 1.75,
    borderTop: "none",
    backgroundColor: "#FFFFFF",
  },
  closeButtonSx: {
    color: "#A6A6A6",
  },
};

export function buildStaffScheduleModalProps(overrides = {}) {
  return {
    titleSx: {
      ...staffScheduleModalPresets.titleSx,
      ...overrides.titleSx,
    },
    titleContainerSx: {
      ...staffScheduleModalPresets.titleContainerSx,
      ...overrides.titleContainerSx,
    },
    contentSx: {
      ...staffScheduleModalPresets.contentSx,
      ...overrides.contentSx,
    },
    paperSx: {
      ...staffScheduleModalPresets.paperSx,
      ...overrides.paperSx,
    },
    actionsSx: {
      ...staffScheduleModalPresets.actionsSx,
      ...overrides.actionsSx,
    },
    closeButtonSx: {
      ...staffScheduleModalPresets.closeButtonSx,
      ...overrides.closeButtonSx,
    },
  };
}
