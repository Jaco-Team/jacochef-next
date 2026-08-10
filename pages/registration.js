import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Link from "next/link";

import { api_laravel, sanctum } from "@/src/api_new";

import Cookies from "js-cookie";

import { EyeShow, EyeHide } from "@/ui/icons";

const SmartCaptcha = dynamic(
  () => import("@yandex/smart-captcha").then((mod) => mod.SmartCaptcha),
  { ssr: false },
);

const SMARTCAPTCHA_CLIENT_KEY = process.env.NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY || "";

const AUTH_RED = "#a30021";
const AUTH_TEXT = "#1a1a1a";
const AUTH_MUTED = "#8b8b8b";
const AUTH_BORDER = "#e6e6e6";

const STEPS = ["Телефон", "Подтверждение"];

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    height: 56,
    alignItems: "center",
    borderRadius: "14px",
    backgroundColor: "#fff",
    "& fieldset": {
      borderColor: AUTH_BORDER,
    },
    "&:hover fieldset": {
      borderColor: "#d0d0d0",
    },
    "&.Mui-focused fieldset": {
      borderColor: AUTH_RED,
      borderWidth: "1px",
    },
  },
  "& .MuiInputLabel-root": {
    color: AUTH_MUTED,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: AUTH_RED,
  },
  "& .MuiInputLabel-root:not(.MuiInputLabel-shrink)": {
    top: "50%",
    transform: "translate(14px, -50%) scale(1)",
  },
  "& .MuiOutlinedInput-input": {
    height: "100%",
    boxSizing: "border-box",
    py: 0,
  },
};

function StepIndicator({ activeStep }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        mb: 3,
        px: 1,
      }}
    >
      {STEPS.map((label, index) => {
        const isActive = index === activeStep;
        const isDone = index < activeStep;

        return (
          <React.Fragment key={label}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: 88,
              }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#fff",
                  backgroundColor: isActive || isDone ? AUTH_RED : "#d1d5db",
                  mb: 0.75,
                }}
              >
                {index + 1}
              </Box>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive || isDone ? AUTH_RED : AUTH_MUTED,
                }}
              >
                {label}
              </Typography>
            </Box>

            {index < STEPS.length - 1 ? (
              <Box
                sx={{
                  flex: 1,
                  height: 2,
                  mt: "13px",
                  mx: 1,
                  backgroundColor: isDone ? AUTH_RED : "#e5e7eb",
                  borderRadius: 1,
                  maxWidth: 120,
                }}
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </Box>
  );
}

export default function Registration() {
  const [isLoad, setIsLoad] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [retryAfter, setRetryAfter] = useState(0);
  const [resendAfter, setResendAfter] = useState(0);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaResetKey, setCaptchaResetKey] = useState(0);

  useEffect(() => {
    if (retryAfter <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setRetryAfter((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [retryAfter]);

  useEffect(() => {
    if (resendAfter <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setResendAfter((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendAfter]);

  const resetCaptcha = () => {
    setCaptchaToken("");
    setCaptchaResetKey((key) => key + 1);
  };

  const applyRetryAfter = (payload, retryAfterHeader = 0) => {
    const seconds = Number(payload?.retry_after || retryAfterHeader || 0);
    if (Number.isFinite(seconds) && seconds > 0) {
      setRetryAfter(Math.ceil(seconds));
    }
  };

  const passwordRequirements = [
    { label: "Не менее 8 символов", met: password.length >= 8 },
    { label: "Хотя бы одна цифра", met: /\d/.test(password) },
    { label: "Строчная латинская буква", met: /[a-z]/.test(password) },
    { label: "Заглавная латинская буква", met: /[A-Z]/.test(password) },
  ];
  const isPasswordValid = passwordRequirements.every((requirement) => requirement.met);

  const isPhoneValid =
    !!phone &&
    ((phone.startsWith("+7") && phone.length === 12) ||
      (phone.startsWith("8") && phone.length === 11));

  const handlePasswordChange = (event) => {
    setPassword(event.target.value.replaceAll(" ", ""));
    if (formError) {
      setFormError("");
    }
  };

  const checkPhone = (event) => {
    let v = event.target.value;
    v = v.replace(/[^\d+]/g, "");

    if (v.startsWith("+7")) {
      v = v.substring(0, 12);
    } else if (v.startsWith("8")) {
      v = v.substring(0, 11);
    } else {
      v = v.substring(0, 11);
    }

    setPhone(v);
    setRetryAfter(0);
    if (formError) {
      setFormError("");
    }
  };

  const handleSetCode = (event) => {
    const newCode = event.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(newCode);
    if (formError) {
      setFormError("");
    }
  };

  async function nextStep(currentCode = "") {
    if (retryAfter > 0) {
      return;
    }

    setIsLoad(true);
    setFormError("");

    try {
      await sanctum();

      if (activeStep === 0) {
        if (!isPhoneValid) {
          setFormError("Введите корректный номер телефона");
          return;
        }

        if (!isPasswordValid) {
          setFormError("Пароль: не менее 8 символов, цифры, буквы верхнего и нижнего регистра");
          return;
        }

        if (!SMARTCAPTCHA_CLIENT_KEY || !captchaToken) {
          setFormError(
            SMARTCAPTCHA_CLIENT_KEY
              ? "Пожалуйста, подтвердите, что вы не робот"
              : "Защита CAPTCHA временно недоступна. Обратитесь к администратору.",
          );
          return;
        }

        let res = await api_laravel(
          "auth",
          "check_phone",
          { login: phone, captcha_token: captchaToken },
          { throwErrors: true },
        );
        res = res?.data ?? res;

        if (res.st === false) {
          applyRetryAfter(res);
          setFormError(res.text || "Не удалось отправить код");
        } else {
          setResendAfter(Number(res.resend_after) || 60);
          setActiveStep(1);
        }
        resetCaptcha();
      } else if (activeStep === 1) {
        if (currentCode.length !== 6) {
          setFormError("Код должен состоять ровно из 6 цифр");
          return;
        }

        let saveRes = await api_laravel(
          "auth",
          "save_new_pwd",
          {
            login: phone,
            code: currentCode,
            pwd: password,
          },
          { throwErrors: true },
        );
        saveRes = saveRes?.data ?? saveRes;

        if (saveRes.st === false) {
          applyRetryAfter(saveRes);
          setFormError(saveRes.text || "Не удалось сохранить пароль");
        } else {
          const legacyToken = saveRes.legacy_token || saveRes.token;
          if (legacyToken) {
            localStorage.setItem("token", legacyToken);
            Cookies.set("token", legacyToken, {
              expires: 60,
              sameSite: "lax",
              secure: window.location.protocol === "https:",
            });
          }
          if (saveRes.expires_at) {
            localStorage.setItem("auth_expires_at", saveRes.expires_at);
          }
          setTimeout(() => {
            window.location.pathname = "/";
          }, 300);
        }
      }
    } catch (error) {
      const status = error?.response?.status;
      const payload = error?.response?.data?.data ?? error?.response?.data;
      applyRetryAfter(payload, error?.response?.headers?.["retry-after"]);

      if (status === 419) {
        setFormError("Сессия устарела. Обновите страницу и попробуйте снова.");
      } else if (status === 429) {
        setFormError("Слишком много запросов. Попробуйте немного позже.");
      } else {
        setFormError(payload?.text || payload?.message || "Произошла ошибка. Попробуйте позже.");
      }
      if (activeStep === 0) {
        resetCaptcha();
      }
    } finally {
      setIsLoad(false);
    }
  }

  async function resendCode() {
    if (isLoad || resendAfter > 0) {
      return;
    }

    if (!SMARTCAPTCHA_CLIENT_KEY || !captchaToken) {
      setFormError(
        SMARTCAPTCHA_CLIENT_KEY
          ? "Пожалуйста, подтвердите, что вы не робот"
          : "Защита CAPTCHA временно недоступна. Обратитесь к администратору.",
      );
      return;
    }

    setIsLoad(true);
    setFormError("");

    try {
      await sanctum();
      let res = await api_laravel(
        "auth",
        "check_phone",
        { login: phone, captcha_token: captchaToken },
        { throwErrors: true },
      );
      res = res?.data ?? res;

      if (res.st === false) {
        const seconds = Number(res.retry_after || 0);
        if (Number.isFinite(seconds) && seconds > 0) {
          setResendAfter(Math.ceil(seconds));
        }
        setFormError(res.text || "Не удалось отправить код");
      } else {
        setResendAfter(Number(res.resend_after) || 60);
      }
    } catch (error) {
      const status = error?.response?.status;
      const payload = error?.response?.data?.data ?? error?.response?.data;
      const seconds = Number(
        payload?.retry_after || error?.response?.headers?.["retry-after"] || 0,
      );
      if (Number.isFinite(seconds) && seconds > 0) {
        setResendAfter(Math.ceil(seconds));
      }
      setFormError(
        status === 429
          ? "Слишком много запросов. Попробуйте немного позже."
          : payload?.text || payload?.message || "Произошла ошибка. Попробуйте позже.",
      );
    } finally {
      resetCaptcha();
      setIsLoad(false);
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    nextStep(code);
  };

  const isButtonDisabled = () => {
    if (isLoad) {
      return true;
    }

    if (retryAfter > 0) {
      return true;
    }

    if (activeStep === 0) {
      return !isPhoneValid || !isPasswordValid || !SMARTCAPTCHA_CLIENT_KEY || !captchaToken;
    }

    if (activeStep === 1) {
      return code.length !== 6;
    }

    return true;
  };

  return (
    <>
      <Backdrop
        sx={{ zIndex: 99, color: "#fff" }}
        open={isLoad}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          py: 4,
          background: `
            radial-gradient(ellipse 90% 70% at 0% 0%, rgba(219, 234, 254, 0.82) 0%, transparent 56%),
            radial-gradient(ellipse 80% 65% at 100% 100%, rgba(226, 232, 240, 0.78) 0%, transparent 58%),
            radial-gradient(ellipse 60% 50% at 85% 15%, rgba(240, 249, 255, 0.9) 0%, transparent 52%),
            linear-gradient(160deg, #eef4f9 0%, #f6f9fc 38%, #ffffff 72%, #f8fafc 100%)
          `,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 420,
            borderRadius: "28px",
            px: { xs: 3, sm: 4 },
            py: { xs: 3.5, sm: 4.5 },
            boxShadow: "0 18px 50px rgba(15, 23, 42, 0.08)",
            backgroundColor: "#fff",
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2.5,
              mx: "auto",
              backgroundColor: "#fff",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
              overflow: "hidden",
            }}
          >
            <Box
              component="img"
              alt="Жако"
              src="/Favikon.png"
              sx={{ width: 48, height: 48, objectFit: "contain" }}
            />
          </Box>

          <Typography
            sx={{
              fontSize: 11,
              letterSpacing: "0.14em",
              fontWeight: 600,
              color: AUTH_MUTED,
              textTransform: "uppercase",
              textAlign: "center",
              mb: 1,
            }}
          >
            Восстановление пароля
          </Typography>

          <Typography
            component="h1"
            sx={{
              fontSize: { xs: 26, sm: 30 },
              fontWeight: 700,
              color: AUTH_TEXT,
              lineHeight: 1.15,
              textAlign: "center",
              mb: 1,
            }}
          >
            Восстановление доступа
          </Typography>

          <Typography
            sx={{
              fontSize: 14,
              lineHeight: 1.5,
              color: AUTH_MUTED,
              textAlign: "center",
              mb: 3,
            }}
          >
            {activeStep === 0
              ? "Укажите номер телефона и новый пароль. После этого мы отправим код подтверждения."
              : "Введите код из SMS, чтобы подтвердить номер и сохранить новый пароль."}
          </Typography>

          <StepIndicator activeStep={activeStep} />

          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
          >
            {activeStep === 0 ? (
              <>
                <TextField
                  variant="outlined"
                  fullWidth
                  label="Номер телефона"
                  name="phone"
                  autoComplete="tel"
                  autoFocus
                  value={phone}
                  onChange={checkPhone}
                  sx={{ ...fieldSx, mb: 2 }}
                />

                <TextField
                  variant="outlined"
                  fullWidth
                  name="password"
                  label="Новый пароль"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={handlePasswordChange}
                  sx={{ ...fieldSx, mb: 1.5 }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            disableRipple
                          >
                            {showPassword ? (
                              <EyeShow style={{ fontSize: 26 }} />
                            ) : (
                              <EyeHide style={{ fontSize: 26 }} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Box sx={{ mb: 2.5, px: 0.25 }}>
                  <Typography
                    sx={{
                      mb: 1,
                      fontSize: 12,
                      fontWeight: 600,
                      color: AUTH_MUTED,
                    }}
                  >
                    Пароль должен содержать:
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 0.75,
                    }}
                  >
                    {passwordRequirements.map((requirement) => (
                      <Box
                        key={requirement.label}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.75,
                        }}
                      >
                        <Box
                          sx={{
                            width: 18,
                            height: 18,
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "50%",
                            border: `1px solid ${requirement.met ? "#2e7d32" : "#cbd5e1"}`,
                            backgroundColor: requirement.met ? "#e8f5e9" : "#fff",
                            color: "#2e7d32",
                            fontSize: 12,
                            fontWeight: 800,
                            lineHeight: 1,
                          }}
                        >
                          {requirement.met ? "✓" : ""}
                        </Box>
                        <Typography
                          sx={{
                            fontSize: 12,
                            lineHeight: 1.3,
                            color: requirement.met ? "#2e7d32" : AUTH_MUTED,
                          }}
                        >
                          {requirement.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                {SMARTCAPTCHA_CLIENT_KEY ? (
                  <Box sx={{ mb: 2 }}>
                    <SmartCaptcha
                      key={captchaResetKey}
                      sitekey={SMARTCAPTCHA_CLIENT_KEY}
                      language="ru"
                      onSuccess={setCaptchaToken}
                      onTokenExpired={resetCaptcha}
                    />
                  </Box>
                ) : null}
              </>
            ) : (
              <>
                <TextField
                  variant="outlined"
                  fullWidth
                  label="Код из SMS"
                  name="code"
                  autoComplete="one-time-code"
                  autoFocus
                  value={code}
                  onChange={handleSetCode}
                  sx={{ ...fieldSx, mb: 1 }}
                  slotProps={{
                    htmlInput: { maxLength: 6, inputMode: "numeric" },
                  }}
                />

                {resendAfter <= 0 && SMARTCAPTCHA_CLIENT_KEY ? (
                  <Box sx={{ mt: 1.5, mb: 1 }}>
                    <SmartCaptcha
                      key={captchaResetKey}
                      sitekey={SMARTCAPTCHA_CLIENT_KEY}
                      language="ru"
                      onSuccess={setCaptchaToken}
                      onTokenExpired={resetCaptcha}
                    />
                  </Box>
                ) : null}

                <Button
                  type="button"
                  fullWidth
                  variant="text"
                  onClick={resendCode}
                  disabled={isLoad || resendAfter > 0 || !SMARTCAPTCHA_CLIENT_KEY || !captchaToken}
                  sx={{ mb: 2, textTransform: "none", color: AUTH_RED }}
                >
                  {resendAfter > 0
                    ? `Повторная отправка через ${resendAfter} с`
                    : "Отправить код повторно"}
                </Button>
              </>
            )}

            {formError ? (
              <Box
                sx={{
                  mb: 2.5,
                  px: 2,
                  py: 1.5,
                  borderRadius: "14px",
                  backgroundColor: "#f8ebe6",
                  textAlign: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.4,
                    color: "#7a3b2e",
                    fontWeight: 500,
                  }}
                >
                  {formError}
                </Typography>
              </Box>
            ) : null}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isButtonDisabled()}
              sx={{
                py: 1.5,
                borderRadius: "14px",
                textTransform: "none",
                fontSize: 16,
                fontWeight: 700,
                backgroundColor: AUTH_RED,
                boxShadow: "0 10px 24px rgba(163, 0, 33, 0.28)",
                "&:hover": {
                  backgroundColor: "#8c001c",
                  boxShadow: "0 12px 28px rgba(163, 0, 33, 0.34)",
                },
                "&.Mui-disabled": {
                  backgroundColor: "#d7a8b2",
                  color: "#fff",
                  boxShadow: "none",
                },
              }}
            >
              {retryAfter > 0
                ? "Попробуйте позже"
                : activeStep === 0
                  ? "Получить код"
                  : "Подтвердить"}
            </Button>

            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Typography
                sx={{
                  fontSize: 13,
                  color: AUTH_MUTED,
                  mb: 0.5,
                }}
              >
                Вспомнили пароль?
              </Typography>
              <Link
                href="/auth"
                style={{
                  color: AUTH_RED,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                }}
              >
                Вернуться к авторизации
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </>
  );
}

export async function getServerSideProps({ req, res }) {
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=3600");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT");

  return {
    props: {},
  };
}
