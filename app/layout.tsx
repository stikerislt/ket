import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "KET Scenario Trainer",
  description: "Interaktyvus KET mokymasis pagal scenarijus su taisykliu nuorodomis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lt">
      <body className="antialiased">{children}</body>
    </html>
  );
}
