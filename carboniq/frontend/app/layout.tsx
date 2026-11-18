import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CarbonIQ",
  description: "Track factory emissions in one place",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
