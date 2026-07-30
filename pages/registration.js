import React, { useState } from "react";

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

import api from "@/src/api";
import { api_laravel } from "@/src/api_new";

import Cookies from "js-cookie";

import { EyeShow, EyeHide } from "@/ui/icons";

const AUTH_RED = "#a30021";
const AUTH_TEXT = "#1a1a1a";
const AUTH_MUTED = "#8b8b8b";
const AUTH_BORDER = "#e6e6e6";

const STEPS = ["Телефон", "Подтверждение"];

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

  const isMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasMixedCase = /(?=.*[a-z])(?=.*[A-Z])/.test(password);
  const isPasswordValid = isMinLength && hasNumber && hasMixedCase;

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
    if (formError) {
      setFormError("");
    }
  };

  const handleSetCode = (event) => {
    const newCode = event.target.value.replaceAll(" ", "");
    setCode(newCode);
    if (formError) {
      setFormError("");
    }

    if (activeStep === 1 && newCode.length === 4) {
      nextStep(newCode);
    }
  };

  async function nextStep(currentCode = "") {
    setIsLoad(true);
    setFormError("");

    try {
      if (activeStep === 0) {
        if (!isPhoneValid) {
          setFormError("Введите корректный номер телефона");
          return;
        }

        if (!isPasswordValid) {
          setFormError("Пароль: не менее 8 символов, цифры, буквы верхнего и нижнего регистра");
          return;
        }

        let res = await api_laravel("auth", "check_phone", { login: phone });
        res = res.data;

        if (res.st === false) {
          setFormError(res.text || "Не удалось отправить код");
        } else {
          setActiveStep(1);
        }
      } else if (activeStep === 1) {
        if (currentCode.length !== 4) {
          setFormError("Код должен состоять ровно из 4 символов");
          return;
        }

        const codeRes = await api("auth", "check_code", {
          login: phone,
          code: currentCode,
        });

        if (codeRes.st === false) {
          setFormError(codeRes.text || "Неверный код подтверждения");
          return;
        }

        let saveRes = await api_laravel("auth", "save_new_pwd", {
          login: phone,
          code: currentCode,
          pwd: password,
        });
        saveRes = saveRes.data;

        if (saveRes.st === false) {
          setFormError(saveRes.text || "Не удалось сохранить пароль");
        } else {
          localStorage.setItem("auth_expires_at", saveRes.expires_at);
          setTimeout(() => {
            window.location.pathname = "/";
          }, 300);
        }
      }
    } catch (error) {
      setFormError("Произошла ошибка. Попробуйте позже.");
    } finally {
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

    if (activeStep === 0) {
      return !isPhoneValid || !isPasswordValid;
    }

    if (activeStep === 1) {
      return code.length !== 4;
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
              </>
            ) : (
              <TextField
                variant="outlined"
                fullWidth
                label="Код из SMS"
                name="code"
                autoComplete="one-time-code"
                autoFocus
                value={code}
                onChange={handleSetCode}
                sx={{ ...fieldSx, mb: 2 }}
                slotProps={{
                  htmlInput: { maxLength: 4 },
                }}
              />
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
                  {activeStep === 0
                    ? "Пароль лучше задать новый, чтобы сразу обновить доступ к аккаунту."
                    : "Код действителен короткое время. Если не пришёл — вернитесь и запросите снова."}
                </Typography>
              </Box>
            )}

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
              {activeStep === 0 ? "Получить код" : "Подтвердить"}
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
