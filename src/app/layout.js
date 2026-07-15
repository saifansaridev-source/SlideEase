import "./globals.css";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';

export const metadata = {
  metadataBase: new URL('https://www.slidexfootwear.com'),
  title: {
    default: 'Slidex Footwear | Handcrafted Cruelty-Free Vegan Footwear',
    template: '%s | Slidex Footwear'
  },
  description: 'Shop Slidex Footwear: Premium handcrafted, 100% vegan leather sandals, slides, and loafers for men & women. Made proudly in India, bridging traditional prints with modern style.',
  keywords: ['vegan footwear', 'handcrafted shoes', 'indian sandals', 'slidex footwear', 'mens slides', 'womens juttis', 'cruelty free'],
  openGraph: {
    title: 'Slidex Footwear | Premium Handcrafted Vegan Shoes',
    description: 'Step into comfort & culture. Cruelty-free vegan leather shoes designed with traditional Indian craftsmanship.',
    images: [{ url: '/og_image.png', width: 1200, height: 630 }],
    type: 'website',
    url: 'https://www.slidexfootwear.com',
    siteName: 'Slidex Footwear'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Slidex Footwear | Cruelty-Free Indian Crafts',
    description: 'Handcrafted vegan footwear combining heritage fabrics with modern sole comfort. Free shipping nationwide.',
    images: ['/og_image.png']
  },
  icons: {
    icon: '/og_image.png'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
