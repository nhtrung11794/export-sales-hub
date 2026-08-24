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
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
          {`
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    electric: '#0ea5e9',
                    neon: '#f97316'
                  }
                }
              }
            }
          `}
        </script>
      </head>
      <body>{children}</body>
    </html>
  );
}
