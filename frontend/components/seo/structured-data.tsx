export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "VibeArchitect",
    "applicationCategory": "DeveloperApplication",
    "description": "AI-powered boilerplate generator for Next.js projects. Generate production-ready code with Firebase, Supabase, or custom backends.",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Person",
      "name": "Sebastian Alvarez",
      "url": "https://listerineh.dev"
    },
    "creator": {
      "@type": "Person",
      "name": "Sebastian Alvarez",
      "url": "https://listerineh.dev"
    },
    "featureList": [
      "AI-powered boilerplate generation",
      "Firebase integration",
      "Supabase integration",
      "Custom backend support",
      "TypeScript support",
      "Tailwind CSS integration",
      "Next.js 15 App Router",
      "Optimized for AI-assisted development"
    ],
    "screenshot": "https://vibearchitect.dev/og-image.png",
    "softwareVersion": "0.2.1-alpha",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "ratingCount": "1"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
