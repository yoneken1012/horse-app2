import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Uma Vie",
  description: "Uma Vie - Horse Management App",
};

const notoSansJp = Noto_Sans_JP({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJp.variable} font-sans antialiased`}>
        <div className="min-h-screen w-full flex justify-center bg-backdrop">
          <div className="w-full max-w-[420px] min-h-screen bg-background shadow-[0_0_40px_rgba(0,0,0,0.04)]">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
