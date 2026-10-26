import React, { useEffect, useId, useRef, useState } from "react";
import { Box, Button, GlobalStyles, IconButton, InputAdornment, Paper, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SmsOutlinedIcon from "@mui/icons-material/SmsOutlined";
import TelegramIcon from "@mui/icons-material/Telegram";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CheckIcon from "@mui/icons-material/Check";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import JacoButton from "./JacoButton";
import JacoTextInput from "./JacoTextInput";
import JacoPeriodSwitch from "./JacoPeriodSwitch";
import { formatRecoveryCountdown, isRecoveryCodeComplete, isRecoveryCodeError, maskedRecoveryPhone, parseRecoveryPhone, passwordRecoveryRules, RECOVERY_CODE_LENGTH, RECOVERY_PHONE_ERROR } from "@/components/auth/recovery";

const CRIMSON = "#A50021";
const MUTED = "#6B7280";
const FOCUS = { outline: `2px solid ${CRIMSON}`, outlineOffset: 3 };
const CHANNELS = [
  { value: "sms", label: "SMS", Icon: SmsOutlinedIcon, helper: "Придёт SMS с 6-значным кодом" },
  { value: "telegram", label: "Telegram", Icon: TelegramIcon, helper: "Код придёт в чат с ботом, Telegram должен быть привязан к номеру" },
  { value: "voice", label: "Звонок", Icon: PhoneOutlinedIcon, helper: "Робот позвонит и продиктует код" },
];

export const recoveryFieldSx = {
  "& .MuiOutlinedInput-root": { minHeight: 48, height: 48, borderRadius: "12px", bgcolor: "#FFFFFF", "& fieldset": { borderColor: "#E5E7EB" }, "&:hover fieldset": { borderColor: "#9CA3AF" }, "&.Mui-focused": { boxShadow: "0 0 0 3px rgba(165, 0, 33, 0.10)" }, "&.Mui-focused fieldset": { borderColor: CRIMSON, borderWidth: 1 }, "&.Mui-error fieldset": { borderColor: "#B91C1C" } },
  "& input.MuiInputBase-input": { fontFamily: "inherit", fontSize: 15, lineHeight: 1.5, px: 1.5, "&::placeholder": { opacity: 1, color: MUTED } },
};

function RecoveryField({ id, label, children, ...props }) {
  return (
    <Box>
      <Typography component="label" htmlFor={id} sx={{ display: "block", fontSize: 14, lineHeight: 1.5, fontWeight: 500, mb: 1, color: "#1F2937" }}>{label}</Typography>
      <JacoTextInput id={id} sx={recoveryFieldSx} {...props} />
      {children}
    </Box>
  );
}

function RecoveryPasswordField({ id, label, value, onChange, disabled, autoComplete = "new-password" }) {
  const [visible, setVisible] = useState(false);
  const toggleLabel = label === "Повторите пароль" ? "подтверждение пароля" : label.toLowerCase();
  return (
    <RecoveryField
      id={id}
      label={label}
      name={id}
      value={value}
      type={visible ? "text" : "password"}
      onChange={(event) => onChange(event.target.value)}
      autoComplete={autoComplete}
      disabled={disabled}
      slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton type="button" aria-label={visible ? `Скрыть ${toggleLabel}` : `Показать ${toggleLabel}`} aria-pressed={visible} onClick={() => setVisible((current) => !current)} disabled={disabled} sx={{ color: MUTED, mr: 0.25, "&.Mui-focusVisible": FOCUS }}>{visible ? <VisibilityOffOutlinedIcon sx={{ fontSize: 20 }} /> : <VisibilityOutlinedIcon sx={{ fontSize: 20 }} />}</IconButton></InputAdornment> } }}
    />
  );
}

function RecoveryCodeInput({ code, onChange, error, errorKey, disabled, errorId }) {
  const inputs = useRef([]);
  useEffect(() => { inputs.current[0]?.focus(); }, [errorKey]);
  const focus = (index) => inputs.current[Math.max(0, Math.min(index, RECOVERY_CODE_LENGTH - 1))]?.focus();
  const insert = (index, text) => {
    const digits = text.replace(/\D/g, "");
    if (!digits) return;
    const start = digits.length >= RECOVERY_CODE_LENGTH ? 0 : index;
    const cells = Array.from({ length: RECOVERY_CODE_LENGTH }, (_, position) => code[position] || " ");
    digits.slice(0, RECOVERY_CODE_LENGTH - start).split("").forEach((digit, offset) => { cells[start + offset] = digit; });
    onChange(cells.join("").trimEnd());
    focus(start + digits.length);
  };
  return (
    <Box role="group" aria-label={`Код подтверждения, ${RECOVERY_CODE_LENGTH} цифр`} sx={{ display: "grid", gridTemplateColumns: `repeat(${RECOVERY_CODE_LENGTH}, minmax(0, 1fr))`, gap: 1, "@keyframes recovery-shake": { "0%, 100%": { transform: "translateX(0)" }, "25%, 75%": { transform: "translateX(-4px)" }, "50%": { transform: "translateX(4px)" } } }}>
      {Array.from({ length: RECOVERY_CODE_LENGTH }, (_, index) => (
        <Box
          component="input"
          key={`${index}-${errorKey}`}
          ref={(element) => { inputs.current[index] = element; }}
          value={/\d/.test(code[index] || "") ? code[index] : ""}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`Цифра ${index + 1} кода`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          disabled={disabled}
          onFocus={(event) => event.target.select()}
          onChange={(event) => { if (!event.target.value) { const cells = code.padEnd(RECOVERY_CODE_LENGTH, " ").split(""); cells[index] = " "; onChange(cells.join("").trimEnd()); } else insert(index, event.target.value); }}
          onPaste={(event) => { event.preventDefault(); insert(index, event.clipboardData.getData("text")); }}
          onKeyDown={(event) => {
            if (event.key === "Backspace") { event.preventDefault(); const target = /\d/.test(code[index] || "") ? index : Math.max(0, index - 1); const cells = code.padEnd(RECOVERY_CODE_LENGTH, " ").split(""); cells[target] = " "; onChange(cells.join("").trimEnd()); focus(target); }
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); focus(index + (event.key === "ArrowLeft" ? -1 : 1)); }
          }}
          sx={{ boxSizing: "border-box", minWidth: 0, width: "100%", height: 56, border: `1px solid ${error ? "#B91C1C" : "#E5E7EB"}`, borderRadius: "12px", textAlign: "center", fontFamily: "inherit", fontSize: 24, fontWeight: 600, color: "#111827", bgcolor: "#FFFFFF", outline: "none", animation: error ? "recovery-shake 240ms ease-in-out" : "none", "&:focus": { borderColor: CRIMSON, boxShadow: "0 0 0 3px rgba(165, 0, 33, 0.10)" }, "&:disabled": { opacity: 0.6 }, "@media (prefers-reduced-motion: reduce)": { animation: "none" } }}
        />
      ))}
    </Box>
  );
}

export default function JacoRecoveryScreen({
  step = "request", phone = "", channel = "sms", code = "", password = "", repeatedPassword = "", loginPassword = "",
  loading = false, error = "", errorKey = 0, phoneError = false, resendAfter = 0, retryAfter = 0, recoveryMessage = "", securityContent = null,
  securityBlocked = false, onPhoneChange, onPhoneBlur, onChannelChange, onCodeChange, onPasswordChange, onRepeatedPasswordChange, onLoginPasswordChange, onSubmit, onBack, onLogin, onResend, onChangeChannel,
  ssoAvailable = false, ssoChecking = false, ssoStarting = false, onSsoLogin,
}) {
  const instanceId = useId();
  const ids = { title: `${instanceId}-title`, phone: `${instanceId}-phone`, phoneHelper: `${instanceId}-phone-helper`, channel: `${instanceId}-channel`, channelHelper: `${instanceId}-channel-helper`, error: `${instanceId}-error` };
  const title = { login: "Вход в аккаунт", request: "Восстановление пароля", code: "Введите код", password: "Придумайте новый пароль", success: "Пароль изменён" }[step];
  const rules = passwordRecoveryRules(password, repeatedPassword);
  const parsedPhone = parseRecoveryPhone(phone);
  const phoneValid = step === "login" ? /^(?:\+7\d{10}|8\d{10})$/.test(parsedPhone.apiValue) : parsedPhone.valid;
  const waitSeconds = Math.max(resendAfter, retryAfter);
  const activeChannel = CHANNELS.find((option) => option.value === channel) || CHANNELS[0];
  const primaryDisabled = loading || retryAfter > 0 || (step === "request" && (!phoneValid || securityBlocked || resendAfter > 0)) || (step === "code" && !isRecoveryCodeComplete(code)) || (step === "password" && !Object.values(rules).every(Boolean)) || (step === "login" && (!phoneValid || !loginPassword || securityBlocked || ssoStarting));
  const label = { login: "Войти", request: "Отправить код", code: "Подтвердить", password: "Сохранить пароль", success: "Войти" }[step];
  return (
    <>
    <GlobalStyles styles={{ "@font-face": { fontFamily: "Inter", src: 'url("/fonts/InterVariable.woff2") format("woff2")', fontWeight: "100 900", fontStyle: "normal", fontDisplay: "swap" } }} />
    <Paper component="section" elevation={0} aria-labelledby={ids.title} sx={{ width: "100%", maxWidth: 420, boxSizing: "border-box", borderRadius: "24px", p: { xs: 2, sm: 4 }, bgcolor: "#FFFFFF", color: "#111827", fontFamily: '"Inter", Arial, sans-serif', boxShadow: "0 12px 40px rgba(17, 24, 39, 0.06), 0 2px 8px rgba(17, 24, 39, 0.02)", "& .MuiTypography-root, & .MuiButtonBase-root": { fontFamily: "inherit" } }}>
      {step === "code" || step === "password" ? <IconButton type="button" aria-label="Назад" onClick={onBack} disabled={loading} sx={{ color: MUTED, p: 0.75, ml: -0.75, mb: 2, "&.Mui-focusVisible": FOCUS }}><ArrowBackIcon sx={{ fontSize: 20 }} /></IconButton> : null}
      {step === "login" || step === "request" ? <Box component="img" src="/Favikon.png" alt="Жако" sx={{ width: 32, height: 32, display: "block", objectFit: "contain", mb: 3 }} /> : null}
      {step === "success" ? <CheckCircleRoundedIcon aria-hidden="true" sx={{ fontSize: 48, color: "#15803D", mb: 3 }} /> : null}
      <Typography component="h1" id={ids.title} sx={{ m: 0, fontSize: 24, lineHeight: 1.35, letterSpacing: "-0.025em", fontWeight: 600, mb: 1 }}>{title}</Typography>
      {step === "request" || step === "login" ? <Typography sx={{ fontSize: 14, lineHeight: 1.5, color: MUTED, mb: 3 }}>{step === "request" ? "Отправим код подтверждения на ваш номер" : "Введите номер телефона и пароль"}</Typography> : null}
      {step === "code" ? <Typography sx={{ fontSize: 14, lineHeight: 1.6, color: MUTED, mb: 3 }}>Код отправлен на{" "}<br /><Box component="span" sx={{ color: "#374151", whiteSpace: "nowrap" }}>{maskedRecoveryPhone(phone)}</Box>{" "}<Button type="button" variant="text" onClick={onBack} disabled={loading} sx={{ minWidth: 0, p: 0, ml: 0.5, fontSize: 14, textTransform: "none", color: CRIMSON, "&.Mui-focusVisible": FOCUS }}>Изменить</Button></Typography> : null}
      {step === "password" ? <Typography sx={{ color: MUTED, fontSize: 14, lineHeight: 1.5, mb: 3 }}>Используйте строчные и заглавные латинские буквы и цифры</Typography> : null}
      {step === "success" ? <Typography sx={{ color: MUTED, fontSize: 14, lineHeight: 1.5, mb: 4 }}>Теперь вы можете войти с новым паролем</Typography> : null}
      <Box component="form" noValidate onSubmit={onSubmit}>
        {step === "request" || step === "login" ? <RecoveryField id={ids.phone} label="Номер телефона" name="phone" type="tel" autoComplete="tel" value={phone} onChange={(event) => onPhoneChange?.(parseRecoveryPhone(event.target.value).display)} onBlur={onPhoneBlur} disabled={loading} placeholder="+7 (999) 123-45-67" error={phoneError} slotProps={{ htmlInput: { "aria-describedby": phoneError ? ids.phoneHelper : undefined, "aria-invalid": phoneError } }}>{phoneError ? <Typography id={ids.phoneHelper} role="alert" sx={{ fontSize: 12, lineHeight: 1.5, color: "#B91C1C", mt: 1 }}>{RECOVERY_PHONE_ERROR}</Typography> : null}</RecoveryField> : null}
        {step === "login" ? <Box sx={{ mt: 3 }}><RecoveryPasswordField id={`${instanceId}-login-password`} label="Пароль" value={loginPassword} onChange={onLoginPasswordChange} disabled={loading} autoComplete="current-password" /></Box> : null}
        {step === "request" ? <Box sx={{ mt: 3 }}>
          <Typography id={ids.channel} sx={{ fontSize: 14, lineHeight: 1.5, fontWeight: 500, mb: 1 }}>Способ получения кода</Typography>
          <JacoPeriodSwitch
            aria-labelledby={ids.channel}
            aria-describedby={ids.channelHelper}
            items={CHANNELS.map(({ value, label: channelLabel, Icon }) => ({ id: value, value, label: <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}><Icon aria-hidden="true" sx={{ fontSize: 18 }} />{channelLabel}</Box> }))}
            value={channel}
            onChange={(_event, value) => onChannelChange?.(value)}
            disabled={loading}
            tabSx={{ px: 0.5, fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", display: "flex", alignItems: "center", justifyContent: "center", "& > span": { display: "inline-flex", alignItems: "center", justifyContent: "center" } }}
            sx={{ "&& [role='tab'][aria-selected='true']": { color: `${CRIMSON} !important` }, "& [role='tab'].Mui-focusVisible": { outlineColor: CRIMSON } }}
          />
          <Box sx={{ display: "grid", mt: 1 }}>
            {CHANNELS.map((option) => {
              const isActive = option.value === activeChannel.value;
              return <Typography key={option.value} id={isActive ? ids.channelHelper : undefined} aria-live={isActive ? "polite" : undefined} aria-hidden={isActive ? undefined : true} sx={{ gridArea: "1 / 1", minWidth: 0, visibility: isActive ? "visible" : "hidden", fontSize: 12, lineHeight: 1.5, color: MUTED }}>{option.helper}</Typography>;
            })}
          </Box>
        </Box> : null}
        {step === "code" ? <>
          <RecoveryCodeInput code={code} onChange={onCodeChange} error={isRecoveryCodeError(error)} errorKey={errorKey} disabled={loading} errorId={ids.error} />
          <Box sx={{ mt: 3, textAlign: "center" }}>
            {waitSeconds > 0 ? <Typography sx={{ fontSize: 13, lineHeight: 1.5, color: MUTED }}>Отправить повторно через {formatRecoveryCountdown(waitSeconds)}</Typography> : <Button type="button" onClick={onResend} disabled={loading || securityBlocked} sx={{ p: 0, minHeight: 24, fontSize: 14, textTransform: "none", color: CRIMSON, "&.Mui-focusVisible": FOCUS }}>Отправить снова</Button>}
            <Button type="button" onClick={onChangeChannel} disabled={loading} sx={{ display: "block", mx: "auto", mt: 0.5, p: 0.5, fontSize: 13, textTransform: "none", color: MUTED, "&:hover": { color: CRIMSON }, "&.Mui-focusVisible": FOCUS }}>Выбрать другой способ</Button>
          </Box>
        </> : null}
        {step === "password" ? <>
          <RecoveryPasswordField id={`${instanceId}-new-password`} label="Новый пароль" value={password} onChange={onPasswordChange} disabled={loading} />
          <Box sx={{ mt: 2 }}><RecoveryPasswordField id={`${instanceId}-repeat-password`} label="Повторите пароль" value={repeatedPassword} onChange={onRepeatedPasswordChange} disabled={loading} /></Box>
          <Box component="ul" aria-label="Требования к паролю" sx={{ listStyle: "none", p: 0, m: 0, mt: 2, display: "grid", gap: 1 }}>
            {[["length", "Не менее 8 символов"], ["characters", "Буквы и цифры"], ["match", "Пароли совпадают"]].map(([rule, text]) => <Box component="li" key={rule} sx={{ display: "flex", alignItems: "center", gap: 1, color: rules[rule] ? "#15803D" : MUTED }}><CheckIcon aria-hidden="true" sx={{ fontSize: 16 }} /><Typography sx={{ fontSize: 12, lineHeight: 1.5 }}>{text}<Box component="span" sx={{ position: "absolute", width: "1px", height: "1px", p: 0, m: "-1px", overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0 }}>{rules[rule] ? " — выполнено" : " — не выполнено"}</Box></Typography></Box>)}
          </Box>
        </> : null}
        {securityContent ? <Box sx={{ mt: 2 }}>{securityContent}</Box> : null}
        {recoveryMessage && step === "code" ? <Typography sx={{ mt: 2, color: MUTED, fontSize: 12, lineHeight: 1.5 }}>{recoveryMessage}</Typography> : null}
        {error && !phoneError ? <Box id={ids.error} role="alert" sx={{ mt: 2, color: "#B91C1C" }}>{isRecoveryCodeError(error) ? <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.5, mb: 0.5 }}>Неверный код</Typography> : null}<Typography sx={{ fontSize: 13, lineHeight: 1.5 }}>{error}</Typography></Box> : null}
        {step === "request" && waitSeconds > 0 ? <Typography sx={{ mt: 2, color: MUTED, fontSize: 12 }}>Отправить повторно через {formatRecoveryCountdown(waitSeconds)}</Typography> : retryAfter > 0 && step !== "code" ? <Typography sx={{ mt: 2, color: MUTED, fontSize: 12 }}>Повторите через {formatRecoveryCountdown(retryAfter)}</Typography> : null}
        <JacoButton type={step === "success" ? "button" : "submit"} fullWidth loading={loading} disabled={primaryDisabled} onClick={step === "success" ? onLogin : undefined} sx={{ mt: step === "success" ? 0 : 3, height: 48, minHeight: 48, borderRadius: "12px", fontSize: 15, fontWeight: 600, bgcolor: CRIMSON, "&:hover": { bgcolor: "#8B001C", boxShadow: "none" }, "&.Mui-disabled": { bgcolor: CRIMSON, color: "#FFFFFF", opacity: loading ? 1 : 0.4 }, "&.Mui-focusVisible": FOCUS }}>{label}</JacoButton>
        {step === "login" ? <Box sx={{ mt: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}><Box sx={{ height: "1px", flex: 1, bgcolor: "#E5E7EB" }} /><Typography sx={{ fontSize: 12, color: MUTED }}>или</Typography><Box sx={{ height: "1px", flex: 1, bgcolor: "#E5E7EB" }} /></Box>
          <JacoButton type="button" tone="secondary" fullWidth startIcon={<LoginRoundedIcon sx={{ fontSize: 20 }} />} loading={ssoStarting} disabled={loading || ssoChecking || !ssoAvailable} onClick={onSsoLogin} aria-label="Войти через SSO" aria-describedby={!ssoAvailable || ssoChecking ? `${instanceId}-sso-status` : undefined} sx={{ height: 48, minHeight: 48, borderRadius: "12px", fontSize: 15, color: "#374151", borderColor: "#E5E7EB", "&:hover": { bgcolor: "#F9FAFB", borderColor: "#9CA3AF" }, "&.Mui-focusVisible": FOCUS }}>Войти через SSO</JacoButton>
          {!ssoAvailable || ssoChecking ? <Typography id={`${instanceId}-sso-status`} sx={{ mt: 1, fontSize: 12, lineHeight: 1.5, color: MUTED, textAlign: "center" }}>{ssoChecking ? "Проверяем доступность SSO…" : "Вход через SSO пока недоступен"}</Typography> : null}
        </Box> : null}
        {step === "request" ? <Button type="button" fullWidth onClick={onLogin} disabled={loading} sx={{ mt: 2, minHeight: 32, fontSize: 13, color: MUTED, textTransform: "none", "&:hover": { color: CRIMSON, bgcolor: "transparent" }, "&.Mui-focusVisible": FOCUS }}>← Вернуться ко входу</Button> : null}
        {step === "login" ? <JacoButton type="button" tone="secondary" fullWidth startIcon={<LockResetOutlinedIcon sx={{ fontSize: 20 }} />} onClick={onBack} disabled={loading} sx={{ mt: 2, height: 48, minHeight: 48, borderRadius: "12px", fontSize: 15, color: "#374151", borderColor: "#E5E7EB", "&:hover": { bgcolor: "#F9FAFB", borderColor: "#9CA3AF" }, "&.Mui-focusVisible": FOCUS }}>Восстановить пароль</JacoButton> : null}
      </Box>
    </Paper>
    </>
  );
}
