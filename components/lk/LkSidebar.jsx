import { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import {
  JacoSurface,
  uiColors,
  uiRadii,
  uiStateColors,
  uiTypography,
} from "@/design-system/shared/ui";

const AVATAR_BASE_URL = "https://storage.yandexcloud.net/user-img/min-img/";

const ATTENTION_COLOR = {
  warning: uiColors.warning,
  danger: uiColors.danger,
};

function AttentionDot({ attention }) {
  if (!attention) {
    return null;
  }

  return (
    <Box
      component="span"
      role="img"
      aria-label="Требует внимания"
      sx={{
        width: 10,
        height: 10,
        flexShrink: 0,
        borderRadius: uiRadii.full,
        backgroundColor: ATTENTION_COLOR[attention],
      }}
    />
  );
}

export default function LkSidebar({
  my,
  workplace,
  sections,
  activeSectionId,
  onNavigate,
  employeeSelect = null,
}) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const subtitle = [my?.app_name, workplace?.point_name].filter(Boolean).join(" · ");
  const activeSection = sections.find((section) => section.id === activeSectionId);
  // На телефоне меню свёрнуто, поэтому метку внимания выносим на саму кнопку.
  const hiddenAttention = sections.find(
    (section) => section.id !== activeSectionId && section.attention,
  )?.attention;

  const selectFromMenu = (sectionId) => {
    setMenuAnchor(null);
    onNavigate(sectionId);
  };

  return (
    <JacoSurface sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
      {employeeSelect}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          pb: 1.5,
          borderBottom: `1px solid ${uiColors.borderLight}`,
        }}
      >
        <Avatar
          src={my?.img_name ? `${AVATAR_BASE_URL}${my.img_name}` : undefined}
          alt=""
          sx={{
            width: 56,
            height: 56,
            backgroundColor: uiColors.surfaceMuted,
            color: uiColors.textMuted,
          }}
        >
          <PersonIcon />
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ ...uiTypography.bodyMedium, color: uiColors.textStrong }}>
            {my?.name}
          </Typography>
          {subtitle ? (
            <Typography sx={{ ...uiTypography.label, color: uiColors.text, mt: 0.25 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
      </Box>

      <Box sx={{ display: { xs: "block", md: "none" } }}>
        <Box
          component="button"
          type="button"
          aria-haspopup="menu"
          aria-expanded={menuAnchor ? "true" : undefined}
          onClick={(event) => setMenuAnchor(event.currentTarget)}
          sx={{
            ...uiTypography.bodyMedium,
            fontFamily: "inherit",
            width: "100%",
            minHeight: 44,
            px: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            border: `1px solid ${uiColors.border}`,
            borderRadius: uiRadii.md,
            textAlign: "left",
            cursor: "pointer",
            color: uiColors.textStrong,
            backgroundColor: uiColors.surface,
            "&:hover": {
              backgroundColor: uiStateColors.hover,
            },
          }}
        >
          <MenuIcon fontSize="small" />
          <Box
            component="span"
            sx={{ flexGrow: 1, minWidth: 0 }}
          >
            {activeSection?.title ?? "Категории"}
          </Box>
          <AttentionDot attention={hiddenAttention} />
        </Box>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          slotProps={{
            paper: {
              sx: {
                width: menuAnchor?.offsetWidth,
                mt: 0.5,
                borderRadius: uiRadii.md,
              },
            },
          }}
        >
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <MenuItem
                key={section.id}
                selected={section.id === activeSectionId}
                onClick={() => selectFromMenu(section.id)}
                sx={{ minHeight: 44, gap: 1 }}
              >
                {Icon ? (
                  <ListItemIcon>
                    <Icon fontSize="small" />
                  </ListItemIcon>
                ) : null}
                <Box
                  component="span"
                  sx={{ flexGrow: 1, minWidth: 0 }}
                >
                  {section.title}
                </Box>
                <AttentionDot attention={section.attention} />
              </MenuItem>
            );
          })}
        </Menu>
      </Box>

      <Box
        component="nav"
        aria-label="Категории кабинета"
        sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", gap: 0.25 }}
      >
        {sections.map((section) => {
          const isActive = section.id === activeSectionId;
          const Icon = section.icon;

          return (
            <Box
              key={section.id}
              component="button"
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => onNavigate(section.id)}
              sx={{
                ...(isActive ? uiTypography.bodyMedium : uiTypography.body),
                fontFamily: "inherit",
                minHeight: 44,
                px: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                border: "none",
                borderRadius: uiRadii.md,
                textAlign: "left",
                cursor: "pointer",
                color: isActive ? uiColors.primary : uiColors.textStrong,
                backgroundColor: isActive ? uiColors.primarySoft : "transparent",
                "&:hover": {
                  backgroundColor: isActive ? uiColors.primarySoft : uiStateColors.hover,
                },
              }}
            >
              {Icon ? <Icon fontSize="small" /> : null}
              <Box
                component="span"
                sx={{ flexGrow: 1, minWidth: 0 }}
              >
                {section.title}
              </Box>
              <AttentionDot attention={section.attention} />
            </Box>
          );
        })}
      </Box>
    </JacoSurface>
  );
}
