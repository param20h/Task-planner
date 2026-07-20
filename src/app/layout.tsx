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
  title: {
    default: "ZenithFlow — Intelligent Workspace & Productivity OS",
    template: "%s | ZenithFlow"
  },
  description: "ZenithFlow is your AI-powered personal productivity OS. Track habits, plan study sprints, log workout volume, analyze biometrics, and converse with Zenith AI.",
  keywords: [
    "productivity OS",
    "habit tracker",
    "study sprint planner",
    "workout logger",
    "fitness volume tracker",
    "personal analytics dashboard",
    "Zenith AI coach",
    "sprint companion",
    "daily task planner",
    "biometrics visualization",
    "pro AI companion"
  ],
  authors: [{ name: "ZenithFlow Team", url: "https://zenithflow.dev" }],
  creator: "ZenithFlow Team",
  publisher: "ZenithFlow",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://zenithflow.dev",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "64x64" },
    ],
    apple: "/favicon.png",
    shortcut: "/favicon.png",
  },
  openGraph: {
    title: "ZenithFlow — Intelligent Workspace & Productivity OS",
    description: "The AI-powered personal productivity OS. Track habits, plan study sprints, log workout volume, analyze biometrics, and converse with Zenith AI.",
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
    title: "ZenithFlow — Intelligent Workspace & Productivity OS",
    description: "The AI-powered personal productivity OS combining task planning, workout volumes, biometrics, and Zenith AI.",
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
        {/* Structured Data / JSON-LD for Search Engine Rich Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "ZenithFlow",
                "operatingSystem": "All",
                "applicationCategory": "ProductivityApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "249.00",
                  "priceCurrency": "INR"
                },
                "description": "Intelligent workspace & personal productivity OS. Track habits, plan study sprints, log workout volume, analyze biometrics, and converse with Zenith AI.",
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.9",
                  "ratingCount": "180"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "ZenithFlow",
                "url": "https://zenithflow.dev",
                "logo": "https://zenithflow.dev/logo.jpg",
                "sameAs": [
                  "https://twitter.com/zenithflow",
                  "https://github.com/param20h/Task-planner"
                ]
              }
            ])
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
