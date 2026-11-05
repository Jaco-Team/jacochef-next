import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Box } from "@mui/material";
import JacoRecoveryScreen from "@/design-system/shared/ui/JacoRecoveryScreen";
import { isRecoveryCodeComplete, isRecoveryCodeError, parseRecoveryPhone, passwordRecoveryRules, RECOVERY_PHONE_ERROR } from "@/components/auth/recovery";
import { api_laravel, storeAuthSession } from "@/src/api_new";

const SmartCaptcha = dynamic(
  () => import("@yandex/smart-captcha").then((mod) => mod.SmartCaptcha),
  { ssr: false },
);
const SMARTCAPTCHA_CLIENT_KEY = process.env.NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY || "";

export default function Registration() {
  const [isLoad, setIsLoad] = useState(false);
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const [retryAfter, setRetryAfter] = useState(0);
  const [resendAfter, setResendAfter] = useState(0);
  const [recoveryStep, setRecoveryStep] = useState("request");
  const [deliveryChannel, setDeliveryChannel] = useState("sms");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatedPassword, setRepeatedPassword] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [recoveryPhoneError, setRecoveryPhoneError] = useState("");
  const [codeErrorKey, setCodeErrorKey] = useState(0);

  useEffect(() => {
    if (retryAfter <= 0 && resendAfter <= 0) return undefined;
    const timer = window.setInterval(() => {
      setRetryAfter((seconds) => Math.max(0, seconds - 1));
      setResendAfter((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [retryAfter > 0 || resendAfter > 0]);

  const resetCaptcha = () => {
    setCaptchaToken("");
    setCaptchaResetKey((previous) => previous + 1);
  };
  const applySecurityState = (payload, retryAfterHeader = 0) => {
    const seconds = Number(payload?.retry_after || retryAfterHeader || 0);
    if (Number.isFinite(seconds) && seconds > 0) setRetryAfter(Math.ceil(seconds));
  };
  const applyResendState = (payload) => {
    const seconds = Number(payload?.resend_after || 0);
    setResendAfter(Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : 0);
  };
  const normalizedPhone = parseRecoveryPhone(phone);
  const changePhone = (value) => {
    setPhone(value);
    setFormError("");
    setRecoveryPhoneError("");
    setConfirmationCode("");
    setNewPassword("");
    setRepeatedPassword("");
  };
  const editRecoveryRequest = () => {
    setRecoveryStep("request");
    setConfirmationCode("");
    setNewPassword("");
    setRepeatedPassword("");
    setFormError("");
    setRecoveryPhoneError("");
    resetCaptcha();
  };
  const changeChannel = (value) => {
    setDeliveryChannel(value);
    setConfirmationCode("");
    setNewPassword("");
    setRepeatedPassword("");
    setFormError("");
    setRecoveryPhoneError("");
  };

  const handleRecoveryRequestFailure = (payload, fallback) => {
    const message = payload?.text || payload?.message || fallback;
    setFormError(message);
    if (payload?.error_code === "account_not_found") {
      setRecoveryStep("request");
      setRecoveryPhoneError(message);
      setPhoneTouched(true);
      setConfirmationCode("");
      setNewPassword("");
      setRepeatedPassword("");
      setRecoveryMessage("");
      setResendAfter(0);
    }
  };

  async function sendPasswordResetCode() {
    if (isLoad || retryAfter > 0 || resendAfter > 0) return;
    if (!normalizedPhone.valid) {
      setPhoneTouched(true);
      setFormError(RECOVERY_PHONE_ERROR);
      return;
    }
    if (SMARTCAPTCHA_CLIENT_KEY && !captchaToken) {
      setFormError("Пожалуйста, подтвердите, что вы не робот");
      return;
    }
    setIsLoad(true);
    setFormError("");
    setRecoveryPhoneError("");
    try {
      const res = await api_laravel("auth", "check_phone", { login: normalizedPhone.apiValue, captcha_token: captchaToken, delivery_channel: deliveryChannel }, { throwErrors: true });
      const payload = res?.data ?? res;
      applySecurityState(payload);
      if (!payload || payload.st !== true) {
        handleRecoveryRequestFailure(payload, "Не удалось запросить код. Попробуйте позже.");
        resetCaptcha();
        return;
      }
      applyResendState(payload);
      setRecoveryMessage(payload.text || "Запрос на отправку кода принят. Дождитесь сообщения.");
      setConfirmationCode("");
      setNewPassword("");
      setRepeatedPassword("");
      setRecoveryStep("code");
      setCodeErrorKey((previous) => previous + 1);
      resetCaptcha();
    } catch (error) {
      const status = error?.response?.status;
      const payload = error?.response?.data?.data ?? error?.response?.data;
      applySecurityState(payload, error?.response?.headers?.["retry-after"]);
      if (status === 429) {
        setFormError("Слишком много запросов. Попробуйте немного позже.");
      } else {
        handleRecoveryRequestFailure(payload, "Не удалось запросить код. Попробуйте позже.");
      }
      resetCaptcha();
    } finally { setIsLoad(false); }
  }

  const handlePasswordFailure = (message) => {
    setFormError(message);
    if (isRecoveryCodeError(message)) {
      setRecoveryStep("code");
      setConfirmationCode("");
      setCodeErrorKey((previous) => previous + 1);
    }
  };
  async function submitNewPassword() {
    if (isLoad || retryAfter > 0) return;
    if (!isRecoveryCodeComplete(confirmationCode) || !Object.values(passwordRecoveryRules(newPassword, repeatedPassword)).every(Boolean)) {
      setFormError("Проверьте код и требования к новому паролю");
      return;
    }
    setIsLoad(true);
    setFormError("");
    try {
      const res = await api_laravel("auth", "save_new_pwd", { login: normalizedPhone.apiValue, code: confirmationCode, pwd: newPassword }, { throwErrors: true });
      const payload = res?.data ?? res;
      if (!payload || payload.st !== true) {
        applySecurityState(payload);
        handlePasswordFailure(payload?.text || "Не удалось обновить пароль. Попробуйте позже.");
        return;
      }
      storeAuthSession(payload, normalizedPhone.apiValue);
      setConfirmationCode("");
      setNewPassword("");
      setRepeatedPassword("");
      setRecoveryStep("success");
    } catch (error) {
      const status = error?.response?.status;
      const payload = error?.response?.data?.data ?? error?.response?.data;
      applySecurityState(payload, error?.response?.headers?.["retry-after"]);
      handlePasswordFailure(status === 429 ? "Слишком много запросов. Попробуйте немного позже." : payload?.text || payload?.message || "Не удалось обновить пароль. Попробуйте позже.");
    } finally { setIsLoad(false); }
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isLoad || retryAfter > 0) return;
    if (recoveryStep === "request") return sendPasswordResetCode();
    if (recoveryStep === "code") {
      if (!isRecoveryCodeComplete(confirmationCode)) { setFormError("Введите 6 цифр кода"); return; }
      // The existing API verifies the code atomically together with the password, not here.
      setFormError("");
      setRecoveryStep("password");
      return;
    }
    if (recoveryStep === "password") return submitNewPassword();
  };
  const showCaptcha = SMARTCAPTCHA_CLIENT_KEY && (recoveryStep === "request" || recoveryStep === "code");
  const securityContent = showCaptcha ? <SmartCaptcha key={captchaResetKey} sitekey={SMARTCAPTCHA_CLIENT_KEY} language="ru" onSuccess={setCaptchaToken} onTokenExpired={resetCaptcha} /> : null;

  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", px: 2, py: 4, boxSizing: "border-box", background: "linear-gradient(145deg, #F4F6FA 0%, #FFFFFF 100%)" }}>
      <JacoRecoveryScreen
        step={recoveryStep}
        phone={phone}
        channel={deliveryChannel}
        code={confirmationCode}
        password={newPassword}
        repeatedPassword={repeatedPassword}
        loading={isLoad}
        error={formError}
        errorKey={codeErrorKey}
        phoneError={recoveryStep === "request" && (Boolean(recoveryPhoneError) || (phoneTouched && !normalizedPhone.valid))}
        phoneErrorText={recoveryPhoneError || RECOVERY_PHONE_ERROR}
        resendAfter={resendAfter}
        retryAfter={retryAfter}
        recoveryMessage={recoveryMessage}
        securityContent={securityContent}
        securityBlocked={Boolean(SMARTCAPTCHA_CLIENT_KEY && !captchaToken)}
        onPhoneChange={changePhone}
        onPhoneBlur={() => setPhoneTouched(true)}
        onChannelChange={changeChannel}
        onCodeChange={(value) => { setConfirmationCode(value); setFormError(""); }}
        onPasswordChange={(value) => { setNewPassword(value); setFormError(""); }}
        onRepeatedPasswordChange={(value) => { setRepeatedPassword(value); setFormError(""); }}
        onSubmit={handleSubmit}
        onBack={recoveryStep === "password" ? () => { setRecoveryStep("code"); setFormError(""); } : editRecoveryRequest}
        onLogin={recoveryStep === "success" ? () => { window.location.pathname = "/"; } : () => { window.location.pathname = "/auth"; }}
        onResend={sendPasswordResetCode}
        onChangeChannel={editRecoveryRequest}
      />
    </Box>
  );
}

export async function getServerSideProps({ res }) {
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  return { props: {} };
}
