import React, { useState } from "react";
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

import Cookies from "js-cookie";

import { EyeShow, EyeHide } from "@/ui/icons";
import { api_laravel, api_laravel_local, sanctum } from "@/src/api_new";

const SmartCaptcha = dynamic(
  () => import("@yandex/smart-captcha").then((mod) => mod.SmartCaptcha),
  { ssr: false },
);

const SMARTCAPTCHA_CLIENT_KEY = process.env.NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY || "";

const AUTH_RED = "#a30021";
const AUTH_TEXT = "#1a1a1a";
const AUTH_MUTED = "#8b8b8b";
const AUTH_BORDER = "#e6e6e6";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
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
  "& .MuiOutlinedInput-input": {
    py: 1.6,
  },
};

export default function Auth() {
  const [isLoad, setIsLoad] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaResetKey, setCaptchaResetKey] = useState(0);

  const resetCaptcha = () => {
    setCaptchaToken("");
    setCaptchaResetKey((prev) => prev + 1);
  };

  const checkPhone = (event) => {
    let v = event.target.value;
    v = v.replace(/[^\d+]/gi, "");

    if (v.charAt(0) !== "+") {
      v = v.replace(/\+/g, "");
    } else {
      v = "+" + v.slice(1).replace(/\+/g, "");
    }

    let maxLen = v.charAt(0) === "+" ? 12 : 11;
    v = v.substring(0, maxLen);

    setPhone(v);
    if (formError) {
      setFormError("");
    }
  };

  const setLogin = (event) => {
    setPassword(event.target.value.replaceAll(" ", ""));
    if (formError) {
      setFormError("");
    }
  };

  async function login() {
    if (
      !password.trim() ||
      !phone ||
      (phone.startsWith("+7") && phone.length < 12) ||
      (phone.startsWith("8") && phone.length < 11)
    ) {
      setFormError("Пожалуйста, заполните все поля корректно: телефон и пароль");
      return;
    }

    if (!captchaToken) {
      setFormError("Пожалуйста, подтвердите, что вы не робот");
      return;
    }

    setIsLoad(true);
    setFormError("");

    // captcha_token must be validated on Laravel auth/auth via Yandex SmartCaptcha
    // (SMARTCAPTCHA_SERVER_KEY -> https://smartcaptcha.cloud.yandex.ru/validate)
    const data = {
      login: phone,
      pwd: password,
      captcha_token: captchaToken,
      auth_mode: "session",
    };

    try {
      await sanctum();
      const res = await api_laravel("auth", "auth", data, { throwErrors: true });
      const payload = res?.data ?? res;

      if (!payload || payload.st === false) {
        setFormError(payload?.text || "Пользователь не найден или не имеет доступа");
        resetCaptcha();
        return;
      }

      if (payload.token) {
        localStorage.setItem("token", payload.token);
        Cookies.set("token", payload.token, { expires: 60 });
      }

      if (payload.expires_at) {
        localStorage.setItem("auth_expires_at", payload.expires_at);
      }

      window.location.pathname = "/";
    } catch (error) {
      const status = error?.response?.status;
      if (status === 419) {
        setFormError("Сессия устарела. Обновите страницу и попробуйте снова.");
      } else {
        setFormError(
          error?.response?.data?.text || error?.response?.data?.message || "Ошибка авторизации",
        );
      }
      resetCaptcha();
    } finally {
      setIsLoad(false);
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    login();
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
            radial-gradient(ellipse 90% 70% at 0% 0%, rgba(255, 214, 220, 0.95) 0%, transparent 55%),
            radial-gradient(ellipse 80% 65% at 100% 100%, rgba(255, 228, 232, 0.9) 0%, transparent 55%),
            radial-gradient(ellipse 60% 50% at 85% 15%, rgba(255, 240, 242, 0.85) 0%, transparent 50%),
            linear-gradient(160deg, #ffe8ec 0%, #fff5f6 35%, #ffffff 70%, #fffafa 100%)
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
              mb: 1,
            }}
          >
            Авторизация
          </Typography>

          <Typography
            component="h1"
            sx={{
              fontSize: { xs: 28, sm: 32 },
              fontWeight: 700,
              color: AUTH_TEXT,
              lineHeight: 1.15,
              mb: 1,
            }}
          >
            Вход в аккаунт
          </Typography>

          <Typography
            sx={{
              fontSize: 14,
              lineHeight: 1.5,
              color: AUTH_MUTED,
              mb: 3,
            }}
          >
            Введите номер телефона и пароль, чтобы продолжить работу в приложении.
          </Typography>

          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
          >
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
              label="Пароль"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={setLogin}
              sx={{ ...fieldSx, mb: 2 }}
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
            ) : (
              <Box
                sx={{
                  mb: 2.5,
                  px: 2,
                  py: 1.5,
                  borderRadius: "14px",
                  backgroundColor: "#f3f4f6",
                  textAlign: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.4,
                    color: AUTH_MUTED,
                  }}
                >
                  Используйте номер телефона, указанный в вашем рабочем аккаунте.
                </Typography>
              </Box>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={!captchaToken || !SMARTCAPTCHA_CLIENT_KEY || isLoad}
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
              Войти
            </Button>

            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Typography
                sx={{
                  fontSize: 13,
                  color: AUTH_MUTED,
                  mb: 0.5,
                }}
              >
                Не получается войти?
              </Typography>
              <Link
                href="/registration"
                style={{
                  color: AUTH_RED,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                }}
              >
                Восстановить пароль
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
