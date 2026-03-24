import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const siteUrl = "https://cant-resize.saschb2b.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Responsive Viewer — Multi-Device Preview",
    template: "%s — Responsive Viewer",
  },
  description:
    "Preview any URL across phones, tablets, and desktops simultaneously. Scroll, click, and navigate — synced across every viewport in real time.",
  keywords: [
    "responsive design",
    "multi-device preview",
    "viewport testing",
    "responsive viewer",
    "device emulator",
    "screen size testing",
    "web development",
    "CSS",
    "mobile preview",
    "tablet preview",
    "desktop preview",
    "synchronized scrolling",
  ],
  authors: [{ name: "Sascha", url: "https://saschb2b.com/" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Responsive Viewer",
    title: "Responsive Viewer — Multi-Device Preview",
    description:
      "One site. Every screen. Preview any URL across devices with synced scrolling, clicks, and navigation.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Responsive Viewer — Multi-Device Preview",
    description:
      "One site. Every screen. Preview any URL across devices with synced scrolling, clicks, and navigation.",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
