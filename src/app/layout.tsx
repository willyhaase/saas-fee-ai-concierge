import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const metadata: Metadata = {
  metadataBase: new URL("https://saas-fee-concierge.ch"),
  title: {
    default: "Wil Concierge",
    template: "%s",
  },
  description:
    "Wil ist der KI-Concierge für Gäste und Besucher in Saas-Fee mit Informationen zu Restaurants, Aktivitäten, Bergbahnen, Wetter, Events und Aufenthalten.",
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
      <head>
        {gaMeasurementId ? (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            />
            <script
              id="google-analytics"
              dangerouslySetInnerHTML={{
                __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}');
              `,
              }}
            />
          </>
        ) : null}
      </head>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
