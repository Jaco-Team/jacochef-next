import { Box, Stack, Typography } from "@mui/material";

import {
  uiColors,
  uiControl,
  uiRadii,
  uiShadows,
  uiSpacing,
  uiStateColors,
  uiTableColors,
  uiTypography,
} from "@/design-system/shared/tokens";

const meta = {
  title: "Chef Design System/Foundations/Tokens",
  parameters: {
    docs: {
      description: {
        component:
          "Токены из design-system/shared/tokens. Это базовый контракт цветов, радиусов, плотности, типографики и состояний для Chef UI.",
      },
    },
  },
};

export default meta;

function Section({ title, children }) {
  return (
    <Box
      component="section"
      sx={{
        px: { xs: 2, md: 4 },
        py: 3,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography
        variant="h6"
        sx={{ mb: 2, fontWeight: 700 }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function Swatch({ name, value }) {
  return (
    <Box sx={{ minWidth: 150 }}>
      <Box
        sx={{
          height: 52,
          borderRadius: uiRadii.sm,
          border: "1px solid",
          borderColor: "divider",
          background: value,
        }}
      />
      <Typography sx={{ mt: 1, fontSize: 13, fontWeight: 700 }}>{name}</Typography>
      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{value}</Typography>
    </Box>
  );
}

function TokenRow({ name, value }) {
  return (
    <Stack
      direction="row"
      sx={{
        gap: 2,
        alignItems: "center",
        minHeight: 36,
      }}
    >
      <Typography sx={{ width: 150, fontSize: 13, fontWeight: 700 }}>{name}</Typography>
      <Typography sx={{ color: "text.secondary", fontSize: 13 }}>{value}</Typography>
    </Stack>
  );
}

export function Colors() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Section title="Base Colors">
        <Stack
          direction="row"
          sx={{
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          {Object.entries(uiColors).map(([name, value]) => (
            <Swatch
              key={name}
              name={name}
              value={value}
            />
          ))}
        </Stack>
      </Section>
      <Section title="State Colors">
        <Stack
          direction="row"
          sx={{
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          {Object.entries(uiStateColors).map(([name, value]) => (
            <Swatch
              key={name}
              name={name}
              value={value}
            />
          ))}
        </Stack>
      </Section>
      <Section title="Table Colors">
        <Stack
          direction="row"
          sx={{
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          {Object.entries(uiTableColors).map(([name, value]) => (
            <Swatch
              key={name}
              name={name}
              value={value}
            />
          ))}
        </Stack>
      </Section>
    </Box>
  );
}

export function TypographyAndSpacing() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Section title="Typography">
        <Stack spacing={2}>
          {Object.entries(uiTypography).map(([name, value]) => (
            <Box key={name}>
              <Typography sx={value}>{name}: Быстрые действия смены</Typography>
              <Typography sx={{ mt: 0.5, fontSize: 12, color: "text.secondary" }}>
                {JSON.stringify(value)}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Section>
      <Section title="Spacing">
        <Stack spacing={1.5}>
          {Object.entries(uiSpacing).map(([name, value]) => (
            <Stack
              key={name}
              direction="row"
              sx={{
                gap: 2,
                alignItems: "center",
              }}
            >
              <Box sx={{ width: 150 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{name}</Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{value}</Typography>
              </Box>
              <Box
                sx={{
                  width: (theme) => theme.spacing(value),
                  height: 24,
                  bgcolor: uiColors.primary,
                }}
              />
            </Stack>
          ))}
        </Stack>
      </Section>
    </Box>
  );
}

export function ShapeDensityAndElevation() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Section title="Radii">
        <Stack
          direction="row"
          sx={{
            gap: 3,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {Object.entries(uiRadii).map(([name, value]) => (
            <Box key={name}>
              <Box
                sx={{
                  width: 86,
                  height: 48,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: value,
                  bgcolor: "background.paper",
                }}
              />
              <Typography sx={{ mt: 1, fontSize: 13 }}>{name + ": " + value}</Typography>
            </Box>
          ))}
        </Stack>
      </Section>
      <Section title="Control Density">
        {Object.entries(uiControl).map(([name, value]) => (
          <TokenRow
            key={name}
            name={name}
            value={value + "px"}
          />
        ))}
      </Section>
      <Section title="Elevation">
        <Stack
          direction="row"
          sx={{
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          {Object.entries(uiShadows).map(([name, value]) => (
            <Box
              key={name}
              sx={{
                width: 180,
                minHeight: 84,
                p: 2,
                borderRadius: uiRadii.md,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                boxShadow: value,
              }}
            >
              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{name}</Typography>
              <Typography sx={{ mt: 0.5, fontSize: 12, color: "text.secondary" }}>
                {value}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Section>
    </Box>
  );
}
