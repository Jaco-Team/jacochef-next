import { Html, Head, Main, NextScript } from 'next/document'

import { font } from "@/src/theme";

export default function Document() {
  return (
    <Html lang="ru" data-scroll="0">
      <Head />
      
      <body className={font.variable}>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}