import "./globals.css";
import Script from "next/script";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import BackToTopButton from '@/components/BackToTopButton';
import LiveChatWidget from '@/components/LiveChatWidget';
import CookieConsent from '@/components/CookieConsent';
import PromoPopup from '@/components/PromoPopup';
import SplitScreenIntro from '@/components/SplitScreenIntro';
import { CartProvider } from '@/context/CartContext';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'SlideEase | Ascend with Heritage — Handcrafted Indian Vegan Luxury',
    template: '%s | SlideEase'
  },
  description: 'Ascend with Heritage with SlideEase: Handcrafted Indian vegan leather sandals, slides, and loafers. Generations of craft, plant-based cork, and modern ergonomic comfort.',
  keywords: ['ascend with heritage', 'slideease', 'vegan footwear', 'handcrafted indian shoes', 'cork slides', 'artisanal loafers', 'cruelty free luxury'],
  authors: [{ name: 'SlideEase' }],
  creator: 'SlideEase',
  publisher: 'SlideEase',
  robots: 'index, follow',
  openGraph: {
    title: 'SlideEase | Ascend with Heritage — Handcrafted Indian Vegan Luxury',
    description: 'Every stitch carries a hand. Every step carries a story. Handcrafted cruelty-free footwear bridging centuries of Indian craftsmanship with modern ergonomic soles.',
    images: [{ url: '/og_image.png', width: 1200, height: 630, alt: 'SlideEase Footwear' }],
    type: 'website',
    url: siteUrl,
    siteName: 'SlideEase'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SlideEase | Ascend with Heritage',
    description: 'Handcrafted Indian vegan footwear combining heritage motifs with modern sole comfort. Free shipping nationwide.',
    images: ['/og_image.png']
  },
  icons: {
    icon: '/og_image.png'
  }
};

export default function RootLayout({ children }) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SlideEase",
    "url": siteUrl,
    "logo": `${siteUrl}/assets/logo.png`,
    "sameAs": [
      "https://instagram.com/slideease",
      "https://facebook.com/slideease"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-22-4567-8900",
      "contactType": "customer service",
      "areaServed": "IN",
      "availableLanguage": ["English", "Hindi"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN",
      "addressLocality": "Mumbai",
      "addressRegion": "Maharashtra"
    }
  };

  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager Script */}
        {gtmId && (
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`
            }}
          />
        )}
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body>
        {/* Google Tag Manager (noscript fallback) */}
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        <CartProvider>
          <SplitScreenIntro />
          <Header />
          <main>{children}</main>
          <Footer />
          <WhatsAppButton />
          <BackToTopButton />
          <LiveChatWidget />
          <CookieConsent />
          <PromoPopup />
        </CartProvider>
      </body>
    </html>
  );
}
