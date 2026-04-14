import React from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

export const billingFieldRadius = "18px";
export const billingFieldMinHeight = 44;
const billingFieldHorizontalPadding = 16;
const billingFieldVerticalPadding = 10;
const billingFieldLabelX = 16;
const billingFieldLabelShrinkX = 18;

export const billingSectionPaperSx = {
  position: "relative",
  overflow: "hidden",
  borderRadius: { xs: "24px", md: "30px" },
  border: "1px solid rgba(152, 27, 46, 0.08)",
  background:
    "linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(253, 249, 246, 0.95) 100%)",
  boxShadow: "0 24px 54px rgba(15, 23, 42, 0.08)",
  px: { xs: 2, md: 3.5 },
  py: { xs: 2.5, md: 3.5 },
};

export const billingTableContainerSx = {
  borderRadius: "22px",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  boxShadow: "0 14px 32px rgba(15, 23, 42, 0.06)",
  overflowX: "auto",
  overflowY: "hidden",
  WebkitOverflowScrolling: "touch",
  overscrollBehaviorX: "contain",
};

export const billingTableSx = {
  minWidth: { xs: 980, md: "100%" },
  "& .MuiTableHead-root .MuiTableCell-root": {
    background:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)",
    borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
    color: "#1f2937",
  },
  "& .MuiTableBody-root .MuiTableCell-root": {
    borderColor: "rgba(148, 163, 184, 0.16)",
  },
};

export const billingPageFieldSx = {
  "& .MuiFormControl-root": {
    width: "100%",
  },
  "& .ceil_white .MuiFormControl-root, & .ceil_white .MuiTextField-root": {
    borderRadius: `${billingFieldRadius} !important`,
    backgroundColor: "transparent !important",
  },
  "& .MuiInputLabel-root": {
    top: "50%",
    color: "#6b7280",
    fontWeight: 600,
    lineHeight: "24px",
    letterSpacing: "-0.01em",
    transform: `translate(${billingFieldLabelX}px, -50%) scale(1)`,
    transformOrigin: "top left",
    "&.Mui-focused": {
      color: "#9f1239",
    },
    "&.MuiInputLabel-shrink": {
      top: 0,
      backgroundColor: "rgba(255, 255, 255, 0.96)",
      paddingInline: "10px",
      borderRadius: "999px",
      transform: `translate(${billingFieldLabelShrinkX}px, -9px) scale(0.75)`,
    },
  },
  "& .MuiTextField-root .MuiOutlinedInput-root:not(.MuiAutocomplete-inputRoot), & .MuiPickersOutlinedInput-root":
    {
      minHeight: billingFieldMinHeight,
      borderRadius: billingFieldRadius,
      backgroundColor: "rgba(255, 255, 255, 0.88)",
      boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
      transition: "background-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease",
      "& fieldset": {
        borderColor: "rgba(148, 163, 184, 0.18)",
        borderWidth: "1px",
      },
      "&:hover fieldset": {
        borderColor: "rgba(159, 18, 57, 0.28)",
      },
      "&.Mui-focused": {
        backgroundColor: "#ffffff",
        boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "rgba(159, 18, 57, 0.72)",
        borderWidth: "1px",
      },
      "&.Mui-disabled": {
        backgroundColor: "rgba(248, 250, 252, 0.92)",
        boxShadow: "none",
      },
      "&.Mui-disabled fieldset": {
        borderColor: "rgba(148, 163, 184, 0.14)",
      },
    },
  "& .MuiAutocomplete-root .MuiOutlinedInput-root": {
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
    transition: "background-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease",
    borderRadius: billingFieldRadius,
    "& fieldset": {
      borderColor: "rgba(148, 163, 184, 0.18)",
      borderWidth: "1px",
    },
    "&:hover fieldset": {
      borderColor: "rgba(159, 18, 57, 0.28)",
    },
    "&.Mui-focused": {
      backgroundColor: "#ffffff",
      boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "rgba(159, 18, 57, 0.72)",
      borderWidth: "1px",
    },
    "&.Mui-disabled": {
      backgroundColor: "rgba(248, 250, 252, 0.92)",
      boxShadow: "none",
    },
    "&.Mui-disabled fieldset": {
      borderColor: "rgba(148, 163, 184, 0.14)",
    },
  },
  "& .MuiInputBase-input, & .MuiSelect-select": {
    color: "#111827",
    fontWeight: 500,
  },
  "& .MuiTextField-root .MuiOutlinedInput-input:not(.MuiInputBase-inputMultiline):not(.MuiAutocomplete-input)":
    {
      minHeight: "24px",
      boxSizing: "border-box",
      paddingTop: `${billingFieldVerticalPadding}px`,
      paddingBottom: `${billingFieldVerticalPadding}px`,
      paddingLeft: `${billingFieldHorizontalPadding}px`,
      paddingRight: `${billingFieldHorizontalPadding}px`,
    },
  "& .MuiPickersOutlinedInput-root .MuiInputBase-input": {
    minHeight: "24px",
    boxSizing: "border-box",
    paddingTop: `${billingFieldVerticalPadding}px`,
    paddingBottom: `${billingFieldVerticalPadding}px`,
    paddingLeft: `${billingFieldHorizontalPadding}px`,
  },
  "& .MuiInputBase-input::placeholder": {
    color: "#9ca3af",
    opacity: 1,
  },
  "& .MuiAutocomplete-popupIndicator .MuiSvgIcon-root, & .MuiSelect-icon, & .MuiInputAdornment-root .MuiSvgIcon-root":
    {
      color: "#94a3b8",
    },
};

export const billingPriceWarningRowSx = {
  backgroundColor: "rgba(245, 158, 11, 0.12)",
  "& td": {
    backgroundColor: "rgba(255, 251, 235, 0.92)",
  },
  "& td:first-of-type": {
    boxShadow: "inset 4px 0 0 #f59e0b",
  },
};

export const billingPriceWarningChipSx = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  px: 1.25,
  py: 0.5,
  mt: 1,
  borderRadius: "999px",
  backgroundColor: "rgba(245, 158, 11, 0.16)",
  color: "#92400e",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.02em",
};

export const billingConfirmDialogPaperSx = {
  borderRadius: { xs: "22px", md: "28px" },
  border: "1px solid rgba(148, 163, 184, 0.2)",
  background:
    "linear-gradient(180deg, rgba(255, 255, 255, 0.99) 0%, rgba(250, 247, 243, 0.98) 100%)",
  boxShadow: "0 28px 60px rgba(15, 23, 42, 0.22)",
  overflow: "hidden",
};

export function BillingPageHero({ onBack, title, subtitle }) {
  return (
    <Grid
      size={{
        xs: 12,
        sm: 12,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: { xs: "22px", md: "28px" },
          px: { xs: 2, md: 3 },
          py: { xs: 1.75, md: 2.5 },
          background:
            "linear-gradient(135deg, rgba(143, 18, 57, 0.97) 0%, rgba(159, 18, 57, 0.95) 44%, rgba(217, 119, 6, 0.92) 120%)",
          boxShadow: "0 22px 44px rgba(127, 29, 29, 0.22)",
          color: "#fff",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, rgba(255,255,255,0.18), transparent 34%), radial-gradient(circle at bottom left, rgba(255,255,255,0.12), transparent 28%)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: { xs: "stretch", md: "center" },
            justifyContent: "space-between",
            gap: { xs: 1.25, md: 1.75 },
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: { xs: "flex-start", md: "center" },
              gap: { xs: 1.5, md: 2 },
            }}
          >
            <Box
              onClick={onBack}
              sx={{
                width: { xs: 42, md: 46 },
                height: { xs: 42, md: 46 },
                minWidth: { xs: 42, md: 46 },
                minHeight: { xs: 42, md: 46 },
                borderRadius: { xs: "12px", md: "14px" },
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                backgroundColor: "rgba(255,255,255,0.14)",
                border: "1px solid rgba(255,255,255,0.28)",
                backdropFilter: "blur(10px)",
                transition: "transform 0.2s ease, background-color 0.2s ease",
                "&:hover": {
                  transform: "translateX(-2px)",
                  backgroundColor: "rgba(255,255,255,0.2)",
                },
                "&:active": {
                  transform: "scale(0.98)",
                },
              }}
            >
              <ArrowBackIosNewIcon
                style={{
                  width: 20,
                  height: 20,
                }}
              />
            </Box>
            <Box>
              <Typography
                sx={{
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  fontSize: { xs: 11, md: 12 },
                  fontWeight: 700,
                  opacity: 0.82,
                  mb: { xs: 0.125, md: 0.375 },
                }}
              >
                Накладные
              </Typography>
              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: 24, sm: 28, md: 42 },
                  lineHeight: { xs: 1.05, md: 0.98 },
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  mb: subtitle ? { xs: 0.625, md: 0.875 } : 0,
                }}
              >
                {title}
              </Typography>
              {!subtitle ? null : (
                <Typography
                  sx={{
                    maxWidth: 620,
                    fontSize: { xs: 13, md: 16 },
                    lineHeight: { xs: 1.45, md: 1.6 },
                    color: "rgba(255,255,255,0.86)",
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Grid>
  );
}

export function BillingSection({ eyebrow, title, description, children, hideHeader = false }) {
  return (
    <Grid
      size={{
        xs: 12,
        sm: 12,
      }}
    >
      <Paper
        elevation={0}
        sx={billingSectionPaperSx}
      >
        {hideHeader ? null : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 0.75,
              mb: 3,
            }}
          >
            <Typography
              sx={{
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                fontSize: 12,
                fontWeight: 700,
                color: "#9f1239",
              }}
            >
              {eyebrow}
            </Typography>
            <Typography
              component="h2"
              sx={{
                fontSize: { xs: 24, md: 30 },
                lineHeight: 1.1,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "#111827",
              }}
            >
              {title}
            </Typography>
            {!description ? null : (
              <Typography
                sx={{
                  maxWidth: 820,
                  color: "#6b7280",
                  fontSize: 15,
                  lineHeight: 1.65,
                }}
              >
                {description}
              </Typography>
            )}
          </Box>
        )}
        <Grid
          container
          spacing={3}
        >
          {children}
        </Grid>
      </Paper>
    </Grid>
  );
}
