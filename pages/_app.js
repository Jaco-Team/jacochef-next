import * as React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { ThemeProvider } from '@mui/material/styles';

import dynamic from 'next/dynamic'

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
    <AppRouterCacheProvider {...props}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link rel="icon" href="/images/favicon.ico" sizes="any" />

        <script src="https://api-maps.yandex.ru/2.1/?apikey=665f5b53-8905-4934-9502-4a6a7b06a900&lang=ru_RU" type="text/javascript"></script>
        <script src="https://yastatic.net/s3/mapsapi-jslibs/heatmap/0.0.1/heatmap.min.js" type="text/javascript"></script>
        <link href="https://unpkg.com/dropzone@6.0.0-beta.1/dist/dropzone.css" rel="stylesheet" type="text/css" />
      </Head>
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
