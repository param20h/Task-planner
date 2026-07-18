// ZenithFlow App Layout - Triggering Netlify Rebuild
import type { Metadata } from "next";
import { Geist_Mono, Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const outfit = Outfit({
  variable: "--font-serif",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zenithflow.dev"),
  title: "ZenithFlow — Intelligent Workspace",
  description: "Your AI-powered personal productivity OS.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "64x64" },
    ],
    apple: "/favicon.png",
    shortcut: "/favicon.png",
  },
  openGraph: {
    title: "ZenithFlow — Intelligent Workspace",
    description: "Your AI-powered personal productivity OS combining task planning, workout volumes, biometrics, and custom AI cognitive coaching.",
    url: "https://zenithflow.dev",
    siteName: "ZenithFlow",
    images: [
      {
        url: "/logo.jpg",
        width: 512,
        height: 512,
        alt: "ZenithFlow Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZenithFlow — Intelligent Workspace",
    description: "Your AI-powered personal productivity OS.",
    images: ["/logo.jpg"],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${plusJakartaSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('momentum_theme') || 'dark';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  
                  var val = localStorage.getItem('momentum_appearance');
                  if (val) {
                    var n = Number(val);
                    document.documentElement.style.setProperty('--glass-opacity', String((n / 100) * 0.4 + 0.1));
                    document.documentElement.style.setProperty('--glass-blur', ((n / 100) * 20 + 8) + 'px');
                  } else {
                    document.documentElement.style.setProperty('--glass-opacity', '0.42');
                    document.documentElement.style.setProperty('--glass-blur', '20px');
                  }
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-black text-slate-900 dark:text-neutral-300">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for (let registration of registrations) {
                      registration.unregister();
                      console.log('Local SW unregistered to prevent dev HMR loop');
                    }
                  });
                } else {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').then(function(reg) {
                      console.log('SW registered:', reg.scope);
                    }).catch(function(err) {
                      console.error('SW registration failed:', err);
                    });
                  });
                }
              }
            `
          }}
        />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
