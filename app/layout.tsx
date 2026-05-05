import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OpsFlow",
  description: "OpsFlow Phase 1 foundation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
