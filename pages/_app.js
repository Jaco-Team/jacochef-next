import * as React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { ThemeProvider } from '@mui/material/styles';

import dynamic from 'next/dynamic'
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://5f1483a8fb0efb009af305503f334119@sentry.jacochef.ru/6"
});

import theme from '@/src/theme';

import '@/styles/global.scss'
import '@/styles/tender.scss'

import { font } from "@/src/theme";

const Header = dynamic(() => import('@/src/header'), { ssr: false })

export default function MyApp(props) {
  const { Component, pageProps, router } = props;

  let this_page = router?.state?.route;
  let isHeader = true;

  if( this_page ){
    this_page = this_page.split('/');

    if( this_page[1] == 'auth' || this_page[1] == 'registration' ){
      isHeader = false;
    }
  }

  return (
    <AppRouterCacheProvider {...props} options={{ enableCssLayer: false }}>
      <ThemeProvider theme={theme}>
      
        <Header isHeader={isHeader} suppressHydrationWarning />
        
        <div className={font.variable}>
          <Component {...pageProps} />
        </div>
        
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};
