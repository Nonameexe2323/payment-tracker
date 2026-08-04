import type { Metadata, Viewport } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { ThemeToggle } from "./components/ThemeToggle";
import JigsawParticles from "./components/JigsawParticles";
import { ToastProvider } from "./components/ToastProvider";

const prompt = Prompt({


  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Jiksaw Shop — ระบบเช็คยอดผ่อนและ ดูไอดีที่เหลือภายในร้าน",
  description: "ระบบจัดการและติดตามยอดผ่อนชำระสินค้า พร้อมเช็คสท็อกไอดีเกมที่เหลือภายในร้าน Jiksaw Shop",
  openGraph: {
    title: "Jiksaw Shop — ระบบเช็คยอดผ่อนและ ดูไอดีที่เหลือภายในร้าน",
    description: "ระบบจัดการและติดตามยอดผ่อนชำระสินค้า พร้อมเช็คสท็อกไอดีเกมที่เหลือภายในร้าน Jiksaw Shop",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 675,
        alt: "Jiksaw Shop",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jiksaw Shop — ระบบเช็คยอดผ่อนและ ดูไอดีที่เหลือภายในร้าน",
    description: "ระบบจัดการและติดตามยอดผ่อนชำระสินค้า พร้อมเช็คสท็อกไอดีเกมที่เหลือภายในร้าน Jiksaw Shop",
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f3ff" },
    { media: "(prefers-color-scheme: dark)", color: "#090d16" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${prompt.variable} font-sans h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col relative" suppressHydrationWarning>
        {/* Prevent flash of wrong theme */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('theme');
                  if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        {/* Animated Background Image with Blur & Dark Overlay */}
        <div className="animated-bg-container" aria-hidden="true">
          <div className="bg-image-layer" />
          <div className="bg-overlay-dark" />
          <div className="bg-blob blob-1" />
          <div className="bg-blob blob-2" />
          <div className="bg-blob blob-3" />
          <div className="bg-blob blob-4" />
          <div className="bg-grid-overlay" />
        </div>

        <ThemeProvider>
          <ToastProvider>
            <div className="relative z-10 flex-1">
              {children}
            </div>
            <ThemeToggle />
            <JigsawParticles />
          </ToastProvider>
        </ThemeProvider>


      </body>
    </html>
  );
}
