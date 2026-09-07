import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Poetry Platform",
  description: "A quiet space to read, write, and respond to poetry.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
