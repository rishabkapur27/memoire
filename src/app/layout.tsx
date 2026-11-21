import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "@fontsource-variable/cormorant-garamond/wght.css";
import "@fontsource-variable/cormorant-garamond/wght-italic.css";
import "@fontsource-variable/manrope/index.css";
import "./globals.css";
import { SITE } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Mémoire | Artisan French Bread Pre-orders in Gurgaon",
    template: "%s | Mémoire",
  },
  description:
    "Pre-order slow fermented French sourdough, baguettes and brioche from Mémoire, an artisan bakehouse in Gurgaon. Reserve tomorrow's loaves for pickup or delivery.",
  keywords: [
    "sourdough Gurgaon",
    "artisan bread Gurgaon",
    "French bakery Gurgaon",
    "baguette Gurgaon",
    "bread delivery Gurgaon",
    "Mémoire bakery",
  ],
  openGraph: {
    type: "website",
    siteName: "Mémoire",
    locale: "en_IN",
    url: "/",
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  themeColor: "#6d1d2b",
};

const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className="h-full">
      <body className="flex min-h-full flex-col">
        {children}
        {clarityId && (
          <Script id="ms-clarity" strategy="afterInteractive">
            {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", ${JSON.stringify(clarityId)});`}
          </Script>
        )}
      </body>
    </html>
  );
}
