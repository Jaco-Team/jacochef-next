import { Html, Head, Main, NextScript } from 'next/document'

import { font } from "@/src/theme";

export default function Document() {
  return (
    <Html lang="ru" data-scroll="0">
      <Head>
        <link href="https://unpkg.com/dropzone@6.0.0-beta.1/dist/dropzone.css" rel="stylesheet" type="text/css" />
      </Head>
      <body className={font.variable}>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
