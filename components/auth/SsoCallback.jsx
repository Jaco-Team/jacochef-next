import { useEffect, useRef } from "react";
import Head from "next/head";
import { Box, CircularProgress, Typography } from "@mui/material";
import JacoSurface from "@/design-system/shared/ui/JacoSurface";
import { api_laravel, storeAuthSession } from "@/src/api_new";
import { completeSsoLogin, consumeSsoLoginVerifier } from "./sso";

export default function SsoCallback() {
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void completeSsoLogin({
      search: window.location.search,
      scrubUrl: () => window.history.replaceState(null, "", "/auth/callback"),
      consumeVerifier: () => consumeSsoLoginVerifier(window.sessionStorage),
      exchange: (loginCode, loginVerifier) => api_laravel("auth/sso", "exchange", { login_code: loginCode, login_verifier: loginVerifier }, { throwErrors: true }),
      storeSession: storeAuthSession,
      navigate: (url) => window.location.replace(url),
    });
  }, []);

  return (
    <>
      <Head><meta name="referrer" content="no-referrer" /></Head>
      <Box sx={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", px: 2, py: 4, boxSizing: "border-box", background: "linear-gradient(145deg, #F4F6FA 0%, #FFFFFF 100%)" }}>
        <JacoSurface sx={{ width: "100%", maxWidth: 420, boxSizing: "border-box", borderRadius: "24px", p: { xs: 2, sm: 4 }, bgcolor: "#FFFFFF", boxShadow: "0 12px 40px rgba(17, 24, 39, 0.06)" }}>
          <Box component="img" src="/Favikon.png" alt="Жако" sx={{ display: "block", width: 32, height: 32, objectFit: "contain", mb: 3 }} />
          <Typography component="h1" sx={{ fontSize: 24, fontWeight: 600, lineHeight: 1.35, color: "#111827", mb: 2 }}>Вход через SSO</Typography>
          <Box role="status" sx={{ display: "flex", alignItems: "center", gap: 1.5, color: "#6B7280" }}><CircularProgress size={20} sx={{ color: "#A50021", flexShrink: 0 }} /><Typography sx={{ fontSize: 14, lineHeight: 1.5 }}>Проверяем безопасное подключение…</Typography></Box>
        </JacoSurface>
      </Box>
    </>
  );
}
