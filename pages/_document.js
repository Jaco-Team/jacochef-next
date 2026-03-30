import Document, { Html, Head, Main, NextScript } from "next/document";
import { font } from "@/src/theme";

export default class MyDocument extends Document {
  render() {
    return (
      <Html
        lang="ru"
        data-scroll="0"
      >
        <Head>
          <link
            rel="icon"
            href="/images/favicon.png"
            sizes="any"
          />
          <link
            href="https://unpkg.com/dropzone@6.0.0-beta.1/dist/dropzone.css"
            rel="stylesheet"
            type="text/css"
          />
        </Head>
        <body className={font.className}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
