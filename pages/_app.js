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
    <ThemeProvider theme={theme}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link rel="icon" href="/images/favicon.ico" sizes="any" />
      </Head>
      <div className={font.variable}>
        
        <Header isHeader={isHeader} suppressHydrationWarning />
        
        
          <Component {...pageProps} />
        
        
      </div>
    </ThemeProvider>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};
