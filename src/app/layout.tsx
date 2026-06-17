import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">{children}</body>
    </html>
  );
}
