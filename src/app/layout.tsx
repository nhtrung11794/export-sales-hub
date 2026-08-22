import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Export Sales Interactive Hub",
  description: "Workstation số hóa quy trình Sales Xuất khẩu B2B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
