import type { Metadata, Viewport } from "next";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "Smoke.JP — Japan Smoking Map",
  description:
    "Japonya'daki sigara alanları, sigara izinli kafe/bar/restoranlar ve yürüyüş yönü. Tamamen OpenStreetMap topluluk verisinden.",
  manifest: `${basePath}/manifest.json`,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Smoke.JP",
  },
  icons: {
    icon: [
      { url: `${basePath}/icon.svg`, type: "image/svg+xml" },
      { url: `${basePath}/icon-192.png`, sizes: "192x192", type: "image/png" },
      { url: `${basePath}/icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
    apple: `${basePath}/apple-touch-icon.png`,
  },
};

export const viewport: Viewport = {
  themeColor: "#ea580c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

const SW_INIT = `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = '${basePath}/sw.js';
    navigator.serviceWorker.register(swUrl, { scope: '${basePath || "/"}' }).catch(() => {});
  });
}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="h-full overscroll-none">
        {children}
        <script dangerouslySetInnerHTML={{ __html: SW_INIT }} />
      </body>
    </html>
  );
}
