import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content="Jain Shikanji — Est. 1957, Modinagar. Crazy about quality." />
        {/* Elegant serif for customer-facing headings — loaded via a plain
            <link>, not next/font, so a build never depends on reaching
            Google's servers. See globals.css (.customer-scope h1/h2/h3) for
            where it's applied; falls back to Georgia if it fails to load. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
