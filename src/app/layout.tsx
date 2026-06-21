import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Menangi iPhone 17 Pro Max — Kotak Misteri RM59",
  description:
    "Hanya RM59 untuk peluang memenangi iPhone 17 Pro Max bernilai RM5,999. Acara terhad, penghantaran percuma di Malaysia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms">
      <body className="flex min-h-screen min-w-0 flex-col overflow-x-clip antialiased">
        {children}
      </body>
    </html>
  );
}
