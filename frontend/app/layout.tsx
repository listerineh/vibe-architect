import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { StructuredData } from "@/components/seo";
import { ErrorProvider } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VibeArchitect - AI-First Boilerplate Generator",
  description: "Generate production-ready Next, React and Astro boilerplates optimized for AI-assisted development. Choose Firebase, Supabase, or custom backends. Built with Gemini AI.",
  keywords: ["boilerplate generator", "AI development", "Next.js", "Firebase", "Supabase", "Cursor AI", "Windsurf"],
  authors: [{ name: "Sebastian Alvarez", url: "https://listerineh.dev" }],
  creator: "Sebastian Alvarez",
  publisher: "VibeArchitect",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://vibearchitect.dev',
    title: 'VibeArchitect - AI-First Boilerplate Generator',
    description: 'Generate production-ready Next.js boilerplates optimized for AI-assisted development. Choose Firebase, Supabase, or custom backends.',
    siteName: 'VibeArchitect',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VibeArchitect - AI-First Boilerplate Generator',
    description: 'Generate production-ready Next.js boilerplates with AI',
    creator: '@listerineh',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <StructuredData />
        <ErrorProvider>
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Skip to main content
          </a>
          {children}
        </ErrorProvider>
      </body>
    </html>
  );
}
