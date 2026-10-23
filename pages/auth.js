import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Box } from "@mui/material";
import JacoRecoveryScreen from "@/design-system/shared/ui/JacoRecoveryScreen";
import { isRecoveryCodeComplete, isRecoveryCodeError, parseRecoveryPhone, passwordRecoveryRules, RECOVERY_PHONE_ERROR } from "@/components/auth/recovery";
import { getSsoFailureMessage, prepareSsoLogin, SSO_VERIFIER_STORAGE_KEY } from "@/components/auth/sso";
import { api_laravel, getSsoConfig, getTrustedSsoLoginUrl, storeAuthSession } from "@/src/api_new";

const SmartCaptcha = dynamic(
  () => import("@yandex/smart-captcha").then((mod) => mod.SmartCaptcha),
  { ssr: false },
);
const SMARTCAPTCHA_CLIENT_KEY = process.env.NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY || "";

export default function Auth() {
  const [isLoad, setIsLoad] = useState(false);
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);
  const [resendAfter, setResendAfter] = useState(0);
  const [recoveryStep, setRecoveryStep] = useState("login");
  const [deliveryChannel, setDeliveryChannel] = useState("sms");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatedPassword, setRepeatedPassword] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [codeErrorKey, setCodeErrorKey] = useState(0);
  const [ssoState, setSsoState] = useState({ checking: true, loginUrl: "", starting: false });
  const ssoStartInProgress = useRef(false);

  useEffect(() => {
    let mounted = true;
    const knownError = getSsoFailureMessage(window.location.search);
    if (knownError) setFormError(knownError);
    getSsoConfig().then((response) => {
      if (!mounted) return;
      const payload = response?.data ?? response;
      const loginUrl = payload?.st === true && payload.enabled === true ? getTrustedSsoLoginUrl(payload.login_url) : "";
      setSsoState({ checking: false, loginUrl, starting: false });
    }).catch(() => {
      if (mounted) setSsoState({ checking: false, loginUrl: "", starting: false });
    });
    return () => { mounted = false; };
  }, []);

  const startSsoLogin = async () => {
    const loginUrl = getTrustedSsoLoginUrl(ssoState.loginUrl);
    if (isLoad || ssoState.checking || ssoState.starting || ssoStartInProgress.current || !loginUrl) return;
    ssoStartInProgress.current = true;
    setSsoState((current) => ({ ...current, starting: true }));
    try {
      const target = await prepareSsoLogin({ crypto: window.crypto, storage: window.sessionStorage, loginUrl });
      window.location.assign(target);
    } catch {
      try { window.sessionStorage.removeItem(SSO_VERIFIER_STORAGE_KEY); } catch {}
      ssoStartInProgress.current = false;
      setSsoState({ checking: false, loginUrl: "", starting: false });
    }
  };

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
    if (payload?.captcha_required) setCaptchaRequired(true);
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
    setConfirmationCode("");
    setNewPassword("");
    setRepeatedPassword("");
  };
  const openRecovery = () => {
    setRecoveryStep("request");
    setPhoneTouched(false);
    setFormError("");
    setRecoveryMessage("");
    resetCaptcha();
  };
  const returnToLogin = () => {
    setRecoveryStep("login");
    setConfirmationCode("");
    setNewPassword("");
    setRepeatedPassword("");
    setRecoveryMessage("");
    setFormError("");
    setPhoneTouched(false);
    resetCaptcha();
  };
  const editRecoveryRequest = () => {
    setRecoveryStep("request");
    setConfirmationCode("");
    setNewPassword("");
    setRepeatedPassword("");
    setFormError("");
    resetCaptcha();
  };
  const changeChannel = (value) => {
    setDeliveryChannel(value);
    setConfirmationCode("");
    setNewPassword("");
    setRepeatedPassword("");
    setFormError("");
  };

  async function login() {
    if (isLoad || retryAfter > 0) return;
    if (!password.trim() || !/^(?:\+7\d{10}|8\d{10})$/.test(normalizedPhone.apiValue)) {
      setFormError("Пожалуйста, заполните все поля корректно: телефон и пароль");
      return;
    }
    if (captchaRequired && (!SMARTCAPTCHA_CLIENT_KEY || !captchaToken)) {
      setFormError(SMARTCAPTCHA_CLIENT_KEY ? "Пожалуйста, подтвердите, что вы не робот" : "Защита CAPTCHA временно недоступна. Обратитесь к администратору.");
      return;
    }
    setIsLoad(true);
    setFormError("");
    try {
      const res = await api_laravel("auth", "auth", { login: normalizedPhone.apiValue, pwd: password, captcha_token: captchaToken, auth_mode: "token" }, { throwErrors: true });
      const payload = res?.data ?? res;
      if (!payload || payload.st === false) {
        applySecurityState(payload);
        setFormError(payload?.text || "Пользователь не найден или не имеет доступа");
        resetCaptcha();
        return;
      }
      storeAuthSession(payload, normalizedPhone.apiValue);
      window.location.pathname = "/";
    } catch (error) {
      const status = error?.response?.status;
      const payload = error?.response?.data?.data ?? error?.response?.data;
      applySecurityState(payload, error?.response?.headers?.["retry-after"]);
      setFormError(status === 419 ? "Сессия устарела. Обновите страницу и попробуйте снова." : status === 429 ? "Слишком много запросов. Попробуйте немного позже." : payload?.text || payload?.message || "Ошибка авторизации");
      resetCaptcha();
    } finally { setIsLoad(false); }
  }

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
    try {
      const res = await api_laravel("auth", "check_phone", { login: normalizedPhone.apiValue, captcha_token: captchaToken, delivery_channel: deliveryChannel }, { throwErrors: true });
      const payload = res?.data ?? res;
      applySecurityState(payload);
      if (!payload || payload.st === false) {
        setFormError(payload?.text || "Не удалось запросить код. Попробуйте позже.");
        resetCaptcha();
        return;
      }
      applyResendState(payload);
      setRecoveryMessage(payload.text || "Если номер зарегистрирован, код подтверждения будет отправлен.");
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
      setFormError(status === 429 ? "Слишком много запросов. Попробуйте немного позже." : payload?.text || payload?.message || "Не удалось запросить код. Попробуйте позже.");
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
      setPassword("");
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
    if (recoveryStep === "login") return login();
  };
  const showCaptcha = SMARTCAPTCHA_CLIENT_KEY && (recoveryStep === "request" || recoveryStep === "code" || (recoveryStep === "login" && captchaRequired));
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
        loginPassword={password}
        loading={isLoad}
        error={formError}
        errorKey={codeErrorKey}
        phoneError={recoveryStep === "request" && phoneTouched && !normalizedPhone.valid}
        resendAfter={resendAfter}
        retryAfter={retryAfter}
        recoveryMessage={recoveryMessage}
        securityContent={securityContent}
        ssoAvailable={Boolean(ssoState.loginUrl)}
        ssoChecking={ssoState.checking}
        ssoStarting={ssoState.starting}
        onSsoLogin={startSsoLogin}
        securityBlocked={Boolean((recoveryStep === "login" ? captchaRequired : true) && ((SMARTCAPTCHA_CLIENT_KEY && !captchaToken) || (recoveryStep === "login" && captchaRequired && !SMARTCAPTCHA_CLIENT_KEY)))}
        onPhoneChange={changePhone}
        onPhoneBlur={() => setPhoneTouched(true)}
        onChannelChange={changeChannel}
        onCodeChange={(value) => { setConfirmationCode(value); setFormError(""); }}
        onPasswordChange={(value) => { setNewPassword(value); setFormError(""); }}
        onRepeatedPasswordChange={(value) => { setRepeatedPassword(value); setFormError(""); }}
        onLoginPasswordChange={(value) => { setPassword(value.replaceAll(" ", "")); setFormError(""); }}
        onSubmit={handleSubmit}
        onBack={recoveryStep === "login" ? openRecovery : recoveryStep === "password" ? () => { setRecoveryStep("code"); setFormError(""); } : editRecoveryRequest}
        onLogin={recoveryStep === "success" ? () => { window.location.pathname = "/"; } : returnToLogin}
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
