// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: CSS side-effect import
import "../styles/globals.css";
import type { ReactNode } from "react";
import Script from "next/script";
import Providers from "./providers";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://accounts.google.com/gsi/client"
          async
          defer
          strategy="afterInteractive"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
        <div id="photo-picker-element" />
      </body>
    </html>
  );
}

