import { useMemo, useState } from "react";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { Box, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { V2SelectableList, V2SelectableListItem, V2Select } from "@/ui/v2";
import StaffScheduleResponsiveModal from "./StaffScheduleResponsiveModal";
import { staffScheduleModalTypography } from "./staffScheduleModalTypography";

function buildOptions(options, allowNone) {
  const normalizedOptions = Array.isArray(options)
    ? options.map((item) => ({
        ...item,
        id: String(item?.id ?? ""),
      }))
    : [];

  if (allowNone === false) {
    return normalizedOptions;
  }

  return [{ id: "none", name: "None" }, ...normalizedOptions];
}

export default function StaffScheduleMobileSelectField({
  options,
  value,
  onChange,
  label,
  pickerTitle,
  allowNone,
  disabled = false,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const resolvedOptions = useMemo(() => buildOptions(options, allowNone), [allowNone, options]);
  const normalizedValue = value != null && value !== "" ? String(value) : "none";
  const selectedOption = resolvedOptions.find((item) => item.id === normalizedValue);

  if (!isMobile) {
    return (
      <V2Select
        options={options}
        value={value}
        onChange={onChange}
        label={label}
        allowNone={allowNone}
        disabled={disabled}
      />
    );
  }

  const handleSelect = (nextValue) => {
    onChange?.({
      target: {
        value: nextValue,
      },
    });
    setIsPickerOpen(false);
  };

  return (
    <>
      <Box
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled ? "true" : "false"}
        onClick={disabled ? undefined : () => setIsPickerOpen(true)}
        onKeyDown={
          disabled
            ? undefined
            : (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setIsPickerOpen(true);
                }
              }
        }
        sx={{
          minHeight: 44,
          border: "1px solid #E5E5E5",
          borderRadius: "18px",
          px: 2,
          py: 1,
          backgroundColor: disabled ? "#F5F5F5" : "#FFFFFF",
          cursor: disabled ? "default" : "pointer",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1.5}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={staffScheduleModalTypography.fieldLabel}>{label}</Typography>
            <Typography
              sx={{
                ...staffScheduleModalTypography.fieldValue,
                color: disabled ? "rgba(0, 0, 0, 0.38)" : "#666666",
                wordBreak: "break-word",
              }}
            >
              {selectedOption?.name || "None"}
            </Typography>
          </Box>
          <KeyboardArrowDownRoundedIcon
            sx={{ color: disabled ? "rgba(0, 0, 0, 0.38)" : "#7A7A7A", flexShrink: 0 }}
          />
        </Stack>
      </Box>

      <StaffScheduleResponsiveModal
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        title={pickerTitle || label}
        maxWidth="sm"
        contentSx={{ px: 0, pt: 1.5, pb: 0 }}
        mobileContentSx={{ px: 0, pt: 1.5, pb: 0 }}
      >
        <V2SelectableList
          sx={{ borderLeft: "none", borderRight: "none", borderBottom: "none", borderRadius: 0 }}
        >
          {resolvedOptions.map((item) => {
            const isSelected = item.id === normalizedValue;

            return (
              <V2SelectableListItem
                key={item.id}
                selected={isSelected}
                onClick={() => handleSelect(item.id)}
                sx={{
                  minHeight: 56,
                  px: 2,
                  color: "#666666",
                  "&.Mui-selected": {
                    backgroundColor: "#F2F2F2",
                  },
                  "&.Mui-selected:hover": {
                    backgroundColor: "#F2F2F2",
                  },
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ width: "100%" }}
                >
                  <Typography sx={staffScheduleModalTypography.fieldValue}>{item.name}</Typography>
                  {isSelected ? <CheckRoundedIcon sx={{ color: "#EE2737" }} /> : null}
                </Stack>
              </V2SelectableListItem>
            );
          })}
        </V2SelectableList>
      </StaffScheduleResponsiveModal>
    </>
  );
}
