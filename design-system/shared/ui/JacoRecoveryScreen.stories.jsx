import { useState } from "react";
import { Box, Typography } from "@mui/material";
import JacoRecoveryScreen from "./JacoRecoveryScreen";

export default {
  title: "Chef Design System/Auth/Password Recovery",
  component: JacoRecoveryScreen,
  parameters: { layout: "fullscreen" },
};

export function RecoveryFrame({ step = "request", channel = "sms", error = "", phone = "", mobile = false, ssoAvailable = false, ssoChecking = false, ssoStarting = false }) {
  const [state, setState] = useState({ phone, channel, code: "", password: "", repeatedPassword: "" });
  const change = (key) => (value) => setState((previous) => ({ ...previous, [key]: value }));
  return (
    <Box sx={{ width: mobile ? 375 : 420, maxWidth: "100%", minHeight: mobile ? 760 : 640, display: "flex", alignItems: "center", justifyContent: "center", p: mobile ? 2 : 0, boxSizing: "border-box", background: "linear-gradient(145deg, #F4F6FA, #FFFFFF)" }}>
      <JacoRecoveryScreen
        {...state}
        step={step}
        error={error}
        ssoAvailable={ssoAvailable}
        ssoChecking={ssoChecking}
        ssoStarting={ssoStarting}
        onSsoLogin={() => {}}
        phoneError={step === "request" && Boolean(error)}
        onPhoneChange={change("phone")}
        onChannelChange={change("channel")}
        onCodeChange={change("code")}
        onPasswordChange={change("password")}
        onRepeatedPasswordChange={change("repeatedPassword")}
        resendAfter={step === "code" ? 59 : 0}
        recoveryMessage={step === "code" ? "Если номер зарегистрирован, код подтверждения будет отправлен." : ""}
        onSubmit={(event) => event.preventDefault()}
        onBack={() => {}}
        onLogin={() => {}}
        onResend={() => {}}
        onChangeChannel={() => {}}
      />
    </Box>
  );
}

export function RecoveryGallery() {
  const frames = [
    { label: "01 · Отправка кода", step: "request" },
    { label: "01 · Ошибка номера", step: "request", phone: "8 (123) 456-78-90", error: "Введите номер в формате +7 или 8" },
    { label: "01 · Telegram", step: "request", channel: "telegram", phone: "8 (987) 934-03-91" },
    { label: "02 · Ввод кода", step: "code", phone: "8 (987) 934-03-91" },
    { label: "03 · Новый пароль", step: "password", phone: "8 (987) 934-03-91" },
    { label: "04 · Пароль изменён", step: "success" },
  ];
  return (
    <Box sx={{ p: 3, bgcolor: "#F4F6FA", minWidth: "min-content" }}>
      <Typography component="h1" sx={{ fontSize: 24, fontWeight: 600, mb: 3 }}>Восстановление пароля · Жако</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 420px)", gap: 3, alignItems: "flex-start" }}>
        {frames.map(({ label, ...frame }) => (
          <Box key={label} data-preview-frame={label}>
            <Typography sx={{ color: "#6B7280", fontSize: 14, mb: 1 }}>{label}</Typography>
            <RecoveryFrame {...frame} />
          </Box>
        ))}
      </Box>
      <Typography sx={{ color: "#6B7280", fontSize: 14, mt: 4, mb: 1 }}>Mobile · 375 px</Typography>
      <Box data-preview-frame="mobile"><RecoveryFrame mobile /></Box>
    </Box>
  );
}

export const Default = () => <RecoveryFrame />;
export const Error = () => <RecoveryFrame phone="8 (123) 456-78-90" error="Введите номер в формате +7 или 8" />;
export const Telegram = () => <RecoveryFrame channel="telegram" phone="8 (987) 934-03-91" />;
export const Code = () => <RecoveryFrame step="code" phone="8 (987) 934-03-91" />;
export const Password = () => <RecoveryFrame step="password" />;
export const Success = () => <RecoveryFrame step="success" />;
export const Mobile = () => <RecoveryFrame mobile />;
export const AllFrames = () => <RecoveryGallery />;
export const LoginSsoAvailable = () => <RecoveryFrame step="login" ssoAvailable />;
export const LoginSsoLoading = () => <RecoveryFrame step="login" ssoChecking />;
export const LoginSsoStarting = () => <RecoveryFrame step="login" ssoAvailable ssoStarting />;
export const LoginSsoUnavailable = () => <RecoveryFrame step="login" />;
