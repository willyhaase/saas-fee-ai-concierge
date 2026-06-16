import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const gaMeasurementId =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-MHL3TGDKC6";

export const metadata: Metadata = {
  metadataBase: new URL("https://willyhaase-saas-fee-ai-concierge.vercel.app"),
  title: {
    default: "Saas-Fee AI Concierge",
    template: "%s",
  },
  description:
    "KI-Concierge und Gästeservice für Ferienwohnungen in Saas-Fee.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "1024x1024" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de-CH"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        {gaMeasurementId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}');
              `}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
