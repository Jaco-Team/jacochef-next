import * as React from "react";
import * as Sentry from "@sentry/react";
import PropTypes from "prop-types";
import { ThemeProvider, CssBaseline, StyledEngineProvider } from "@mui/material";

import dynamic from "next/dynamic";

import theme, { font } from "@/src/theme";

import "@/styles/global.scss";
import "@/styles/tender.scss";

Sentry.init({
  dsn: "https://5f1483a8fb0efb009af305503f334119@sentry.jacochef.ru/6",
});

const Header = dynamic(() => import("@/src/header"), { ssr: false });

export default function MyApp(props) {
  const { Component, pageProps, router } = props;

  let this_page = router?.state?.route;
  let isHeader = true;

  if (this_page) {
    this_page = this_page.split("/");

    if (this_page[1] == "auth" || this_page[1] == "registration") {
      isHeader = false;
    }
  }

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        {/* <CssBaseline /> */}

        {isHeader && <Header suppressHydrationWarning />}

        <div className={font.className}>
          <Component
            {...pageProps}
            router={router}
          />
        </div>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};
