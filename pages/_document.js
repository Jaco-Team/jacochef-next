import { Html, Head, Main, NextScript } from 'next/document'

import { font } from "@/src/theme";

export default function Document() {
  return (
    <Html lang="ru" data-scroll="0">
      <Head>
        <script src="https://api-maps.yandex.ru/2.1/?apikey=665f5b53-8905-4934-9502-4a6a7b06a900&lang=ru_RU" type="text/javascript"></script>
        <script src="https://yastatic.net/s3/mapsapi-jslibs/heatmap/0.0.1/heatmap.min.js" type="text/javascript"></script>
        <link href="https://unpkg.com/dropzone@6.0.0-beta.1/dist/dropzone.css" rel="stylesheet" type="text/css" />
      </Head>
      <body className={font.variable}>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
