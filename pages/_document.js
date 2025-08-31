import { Html, Head, Main, NextScript } from 'next/document'
import Document from "next/document";
import { ServerStyleSheet } from "styled-components";

import { font } from "@/src/theme";

export default class MyDocument extends Document {
  static async getInitialProps( ctx ) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage
 
    try {
      // Run the React rendering logic synchronously
      ctx.renderPage = () =>
        originalRenderPage({
          // Useful for wrapping the whole react tree
          enhanceApp: (App) => App,
          // Useful for wrapping in a per-page basis
          enhanceComponent: (Component) => Component,
        })
  
      // Run the parent `getInitialProps`, it now includes the custom `renderPage`
      const initialProps = await Document.getInitialProps(ctx)
  
      return {
        ...initialProps,
        styles: [initialProps.styles, sheet.getStyleElement()],
      };
    } finally {
      sheet.seal();
    }
  }
 
  render() {
    return (
      <Html lang="ru" data-scroll="0">
        <Head>
          <meta name="viewport" content="initial-scale=1, width=device-width" />
          <link rel="icon" href="/images/favicon.png" sizes="any" />

          <script src="https://api-maps.yandex.ru/2.1/?apikey=665f5b53-8905-4934-9502-4a6a7b06a900&lang=ru_RU" type="text/javascript"></script>
          <script src="https://yastatic.net/s3/mapsapi-jslibs/heatmap/0.0.1/heatmap.min.js" type="text/javascript"></script>
          <link href="https://unpkg.com/dropzone@6.0.0-beta.1/dist/dropzone.css" rel="stylesheet" type="text/css" />
        </Head>
        
        <body className={font.className}>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}