import type { Metadata } from "next";
import PlausibleProvider from "next-plausible";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";

let title = "ArTIfacts – AI-Powered App Generator by TI";
let description = "Generate your next app with ArTIfacts";
let url = "https://github.com/trilogy-group/";
let ogimage = "https://artifacts.ai/og-image.png";
let sitename = "llamacoder.io";

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    images: [ogimage],
    title,
    description,
    url: url,
    siteName: sitename,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: [ogimage],
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}
