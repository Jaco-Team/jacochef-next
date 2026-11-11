import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  JacoButton,
  JacoIconButton,
  uiColors,
  uiRadii,
  uiTypography,
} from "@/design-system/shared/ui";
import LkCard from "./LkCard";
import { formatLongDate } from "./lkFormat";

const PHOTO_BASE_URL = "https://storage.yandexcloud.net/user-img/max-img/";

function ProfileFact({ label, value }) {
  if (!value) {
    return null;
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1.5 }}>
      <Typography sx={{ ...uiTypography.label, color: uiColors.text }}>{label}</Typography>
      <Typography
        sx={{
          ...uiTypography.label,
          fontWeight: 500,
          color: uiColors.textStrong,
          textAlign: "right",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export function LkProfileDataCard({ my, workplace }) {
  const registrationDate = formatLongDate(my?.date_registration) || my?.date_registration;
  const place = [workplace?.point_name, workplace?.city_name].filter(Boolean).join(", ");

  return (
    <LkCard title="Данные">
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 2.5 }}>
        {my?.img_name ? (
          <Box sx={{ flex: "0 1 220px", minWidth: 0 }}>
            <Box
              component="img"
              src={`${PHOTO_BASE_URL}${my.img_name}`}
              alt="Фото сотрудника"
              sx={{
                display: "block",
                maxWidth: "100%",
                height: "auto",
                borderRadius: uiRadii.sm,
              }}
            />
          </Box>
        ) : null}
        <Box
          sx={{
            flex: "1 1 220px",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          <ProfileFact
            label="ФИО"
            value={my?.name}
          />
          <ProfileFact
            label="Должность"
            value={my?.app_name}
          />
          <ProfileFact
            label="Место работы"
            value={place}
          />
          <ProfileFact
            label="Дата регистрации"
            value={registrationDate}
          />
          <ProfileFact
            label="Стаж работы"
            value={my?.exp}
          />
        </Box>
      </Box>
    </LkCard>
  );
}

export function LkSignInCard({ authCode, onEditCode, onChangePassword }) {
  const [isCodeVisible, setIsCodeVisible] = useState(false);
  const hasCode = authCode !== undefined && authCode !== null && authCode !== "";

  return (
    <LkCard title="Вход">
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
        <Box>
          <Typography sx={{ ...uiTypography.label, color: uiColors.text }}>Код доступа</Typography>
          <Typography
            sx={{
              fontSize: 22,
              lineHeight: 1.3,
              fontWeight: 500,
              letterSpacing: isCodeVisible ? "2px" : "4px",
              color: uiColors.textStrong,
            }}
          >
            {hasCode && isCodeVisible ? authCode : "••••"}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <JacoIconButton
            aria-label={isCodeVisible ? "Скрыть код доступа" : "Показать код доступа"}
            disabled={!hasCode}
            onClick={() => setIsCodeVisible((visible) => !visible)}
          >
            {isCodeVisible ? (
              <VisibilityOffIcon fontSize="small" />
            ) : (
              <VisibilityIcon fontSize="small" />
            )}
          </JacoIconButton>
          <JacoIconButton
            aria-label="Изменить код доступа"
            onClick={onEditCode}
          >
            <EditIcon fontSize="small" />
          </JacoIconButton>
        </Box>
      </Box>

      <JacoButton
        tone="outlinePrimary"
        onClick={onChangePassword}
        sx={{ alignSelf: "flex-start" }}
      >
        Сменить пароль
      </JacoButton>
    </LkCard>
  );
}
