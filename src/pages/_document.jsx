import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </Head>
      <body>
        <Main />
        <NextScript />
        <div id="photo-picker-element" ></div>
      </body>
    </Html>
  );
}
