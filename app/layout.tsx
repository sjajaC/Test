import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Japan Smoking Map | Sigara Alanları",
  description:
    "Japonya'daki tütün içme alanları ve sigara içilebilen kafeleri haritada gör, aralarında rota oluştur.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="h-full">{children}</body>
    </html>
  );
}
