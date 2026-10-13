/**
 * SlideEase Default CMS Section Images & Assets
 * Safe to import in both client and server contexts (no Node.js or MongoDB dependencies).
 */

export const DEFAULT_HERO_SLIDES = [
  {
    id: 'slide-1',
    image: '',
    tagline: '✦ Ascend with Heritage',
    heading: 'Every stitch carries a hand.\nEvery step carries a story.',
    description: 'Handcrafted from cork-based vegan leather and traditional Indian artisan weaves, re-engineered with dual-density memory foam for modern movement.',
    ctaText: 'Explore the Collection',
    ctaLink: '/shop',
    secondaryCtaText: 'See the Craft',
    secondaryCtaLink: '/#craft-journey',
    showTagline: true,
    showHeading: true,
    showDescription: true,
    showCta: true,
    showSecondaryCta: true,
    showCountdown: true,
    isActive: true,
    textAlign: 'left',
    overlayOpacity: 65,
  },
  {
    id: 'slide-2',
    image: '',
    tagline: '✦ Living Craft • Cruelty-Free Elegance',
    heading: "The Women's Guild:\nIkat Weaves & Kutch Mirrorwork",
    description: 'Preserving generational textile artistry on contoured, shock-absorbing bases designed for everyday festive and casual poise.',
    ctaText: "Explore Women's",
    ctaLink: '/shop?category=womens',
    secondaryCtaText: 'Meet the Artisans',
    secondaryCtaLink: '/#craft-journey',
    showTagline: true,
    showHeading: true,
    showDescription: true,
    showCta: true,
    showSecondaryCta: true,
    showCountdown: false,
    isActive: true,
    textAlign: 'left',
    overlayOpacity: 65,
  },
  {
    id: 'slide-3',
    image: '',
    tagline: '✦ Grounded Sophistication',
    heading: "The Men's Edit:\nSleek Cork Slides & Formal Loafers",
    description: 'Double-padded memory foam soles wrapped in water-resistant vegan leather. Built for daily strides, celebrations, and understated poise.',
    ctaText: "Explore Men's",
    ctaLink: '/shop?category=mens',
    secondaryCtaText: '360° Studio',
    secondaryCtaLink: '/#showcase-360',
    showTagline: true,
    showHeading: true,
    showDescription: true,
    showCta: true,
    showSecondaryCta: true,
    showCountdown: false,
    isActive: true,
    textAlign: 'left',
    overlayOpacity: 65,
  },
];

export const DEFAULT_SECTION_IMAGES = {
  // Hero Banners
  heroImage1: '',
  heroImage2: '',
  heroImage3: '',

  // Page Heroes
  aboutHeroImage: '/og_image.png',
  contactHeroImage: '/og_image.png',

  // Shop by Style (4 images)
  styleImage1: '/assets/slides.png',
  styleImage2: '/assets/sandals.png',
  styleImage3: '/assets/loafers.png',
  styleImage4: '/assets/mojris.png',

  // Ramjibhai Vankar Story
  ramjiLeftImage: 'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=800&auto=format&fit=crop&q=80',
  ramjiRightImage: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80',

  // Modern Indian Classic Story
  modernClassicImage: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&auto=format&fit=crop&q=80',

  // Sales Page — Empowering Local Weaving Guilds
  weavingGuildsImage: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80',

  // About Page — Walk Light, Walk Right
  walkLightImage: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&auto=format&fit=crop&q=80',

  // Follow Us on Instagram (6 images)
  instagramImage1: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80',
  instagramImage2: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&auto=format&fit=crop&q=80',
  instagramImage3: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&auto=format&fit=crop&q=80',
  instagramImage4: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&auto=format&fit=crop&q=80',
  instagramImage5: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&auto=format&fit=crop&q=80',
  instagramImage6: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&auto=format&fit=crop&q=80',
};

export const DEFAULT_CMS_PAGES = {
  privacy: {
    slug: 'privacy',
    title: 'Privacy Policy',
    metaTitle: 'Privacy Policy | SlideEase Footwear',
    metaDesc: 'SlideEase Footwear Privacy Policy — how we collect, use, and protect your personal data. GDPR and CCPA compliant.',
    published: true,
    content: `<div style="background-color: var(--primary-light, #f0f9ff); border-left: 4px solid var(--primary-color); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; text-align: left;">
  <h3 style="margin: 0 0 1rem 0; font-family: var(--font-heading); color: var(--primary-color);">🔒 Essential Extracts (Key Terms)</h3>
  <ul style="list-style-type: disc; padding-left: 1.5rem; margin: 0; line-height: 1.6; font-size: 0.95rem;">
    <li style="margin-bottom: 0.8rem;"><strong>Data Collection:</strong> We collect your name, shipping address, email, phone number, and payment information solely to process your orders and enhance your shopping experience.</li>
    <li style="margin-bottom: 0.8rem;"><strong>Data Security:</strong> Your payment transactions are securely processed through encrypted, PCI-DSS compliant payment gateways. SlideEase never stores your credit card details.</li>
    <li><strong>Communication:</strong> By providing your information, you agree to receive order updates via email, SMS, and WhatsApp. You can opt out of marketing communications at any time.</li>
  </ul>
</div>

<div class="legal-toc">
  <h3>Table of Contents</h3>
  <ol>
    <li><a href="#pp-1">1. Information We Collect</a></li>
    <li><a href="#pp-2">2. How We Use Your Information</a></li>
    <li><a href="#pp-3">3. Cookies &amp; Tracking Technologies</a></li>
    <li><a href="#pp-4">4. Data Sharing &amp; Third Parties</a></li>
    <li><a href="#pp-5">5. Data Security</a></li>
    <li><a href="#pp-6">6. Data Retention</a></li>
    <li><a href="#pp-7">7. Your Rights (GDPR/CCPA)</a></li>
    <li><a href="#pp-8">8. Children's Privacy</a></li>
    <li><a href="#pp-9">9. Changes to This Policy</a></li>
    <li><a href="#pp-10">10. Contact Us</a></li>
  </ol>
</div>

<div class="legal-section" id="pp-1">
  <h2>1. Information We Collect</h2>
  <p>We collect information in the following ways:</p>
  <h4>Information You Provide Directly</h4>
  <ul style="list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0 1rem;">
    <li><strong>Account Information:</strong> Name, email address, phone number, password when you register.</li>
    <li><strong>Order Information:</strong> Shipping address, billing address, payment details when you make a purchase.</li>
    <li><strong>Communication Data:</strong> Information you provide when contacting us (name, email, message content).</li>
    <li><strong>Review Data:</strong> Name and review content when you submit product reviews.</li>
  </ul>
  <h4>Information Collected Automatically</h4>
  <ul style="list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0;">
    <li><strong>Device Information:</strong> Browser type, operating system, device identifiers.</li>
    <li><strong>Usage Data:</strong> Pages visited, time spent on pages, click patterns, referring URLs.</li>
    <li><strong>Location Data:</strong> Approximate geographic location based on IP address.</li>
    <li><strong>Cookies:</strong> Session and persistent cookies for site functionality and analytics.</li>
  </ul>
</div>

<div class="legal-section" id="pp-2">
  <h2>2. How We Use Your Information</h2>
  <p>We use collected information for the following purposes:</p>
  <ul style="list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0;">
    <li>To process and fulfill your orders, including shipping and delivery</li>
    <li>To manage your account and provide customer support</li>
    <li>To send order confirmations, shipping updates, and delivery notifications</li>
    <li>To personalize your shopping experience and show relevant product recommendations</li>
    <li>To send marketing communications (with your explicit consent)</li>
    <li>To prevent fraud and enhance website security</li>
    <li>To analyze website usage and improve our services</li>
    <li>To comply with legal obligations</li>
  </ul>
</div>

<div class="legal-section" id="pp-3">
  <h2>3. Cookies &amp; Tracking Technologies</h2>
  <p>We use cookies and similar tracking technologies to collect and store information about your interactions with our website.</p>
  <table class="specs-table" style="margin: 1rem 0; width: 100%; border-collapse: collapse;">
    <tbody>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid var(--border-color); width: 30%;"><strong>Essential Cookies</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid var(--border-color);">Required for basic site functionality (cart, login sessions). Cannot be disabled.</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid var(--border-color);"><strong>Analytics Cookies</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid var(--border-color);">Help us understand how visitors use our website (Google Analytics).</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid var(--border-color);"><strong>Marketing Cookies</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid var(--border-color);">Used to deliver personalized advertisements and track campaign performance.</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid var(--border-color);"><strong>Preference Cookies</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid var(--border-color);">Remember your settings and preferences (language, currency).</td>
      </tr>
    </tbody>
  </table>
  <p>You can manage cookie preferences through our <a href="/cookie" style="color: var(--accent-color); font-weight: 600;">Cookie Policy</a> page.</p>
</div>

<div class="legal-section" id="pp-4">
  <h2>4. Data Sharing &amp; Third Parties</h2>
  <p>We do <strong>not sell</strong> your personal data to third parties. We only share essential operational data with verified service partners:</p>
  <ul style="list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0;">
    <li><strong>Payment Gateway:</strong> Razorpay for PCI-DSS compliant secure checkout and verification. Card credentials are never handled or stored on SlideEase servers.</li>
    <li><strong>Logistics Partners:</strong> Shiprocket, Delhivery, and Blue Dart for order fulfillment, live tracking, and reverse pickup logistics.</li>
    <li><strong>Evidence Photos:</strong> Customer-uploaded product photographs are securely stored on private cloud storage solely to verify returns and process exchange/refund eligibility.</li>
    <li><strong>Transactional Communications:</strong> Resend API for sending order confirmations, dispatch notices, and return status notifications.</li>
    <li><strong>Legal Compliance:</strong> When required by applicable statutory authorities under Indian law.</li>
  </ul>
</div>

<div class="legal-section" id="pp-5">
  <h2>5. Data Security</h2>
  <p>We implement industry-standard security measures to protect your data:</p>
  <ul style="list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0;">
    <li>TLS 1.3 encryption for all data in transit across HTTPS</li>
    <li>HMAC SHA-256 cryptographically verified sessions and webhook authentication</li>
    <li>Timing-safe comparison checks protecting against timing attacks</li>
    <li>PCI-DSS compliant payment processing via Razorpay</li>
    <li>Role-based access controls for administrative dashboard operations</li>
    <li>Server-side file validation and MIME filtering for customer uploads</li>
  </ul>
</div>

<div class="legal-section" id="pp-6">
  <h2>6. Data Retention</h2>
  <p>We retain your personal data for as long as necessary to fulfill orders, process warranty or return requests, and comply with tax and accounting requirements.</p>
</div>

<div class="legal-section" id="pp-7">
  <h2>7. Your Rights (GDPR/CCPA &amp; Indian Digital Personal Data Protection)</h2>
  <p>You have the right to access, review, correct, or request deletion of your personal account information at any time.</p>
  <div class="rights-grid">
    <div class="right-card"><h4>🔍 Right to Access</h4><p>Request a copy of personal information and order history.</p></div>
    <div class="right-card"><h4>✏️ Right to Rectification</h4><p>Request correction of inaccurate shipping or profile data.</p></div>
    <div class="right-card"><h4>🗑️ Right to Erasure</h4><p>Request deletion of your account and profile records.</p></div>
    <div class="right-card"><h4>📦 Right to Portability</h4><p>Export your order and address data upon request.</p></div>
  </div>
  <p style="margin-top: 1rem;">To exercise any of these rights, contact our Data Grievance Officer at <strong>support@slideease.in</strong>.</p>
</div>

<div class="legal-section" id="pp-8">
  <h2>8. Children's Privacy</h2>
  <p>Our website is intended for general audiences. We do not knowingly collect personal data from minors under 18 years of age.</p>
</div>

<div class="legal-section" id="pp-9">
  <h2>9. Changes to This Policy</h2>
  <p>We may update this Privacy Policy periodically. Any modifications will be posted directly with an updated revision date.</p>
</div>

<div class="legal-section" id="pp-10">
  <h2>10. Contact Us</h2>
  <p>For any privacy, order, or customer assistance inquiries:</p>
  <ul style="list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0;">
    <li><strong>Customer Support &amp; Returns:</strong> support@slideease.in</li>
    <li><strong>General Inquiries:</strong> contact@slideease.in</li>
    <li><strong>Administrative Operations:</strong> admin@slideease.in</li>
    <li><strong>Corporate Address:</strong> Powai, Mumbai 400076, Maharashtra, India</li>
  </ul>
</div>`
  },

  terms: {
    slug: 'terms',
    title: 'Terms of Service',
    metaTitle: 'Terms of Service | SlideEase Footwear',
    metaDesc: 'Read the Terms of Service for SlideEase Footwear. Understand the rules and conditions that govern your use of our e-commerce platform.',
    published: true,
    content: `<div style="background-color: var(--primary-light, #f0f9ff); border-left: 4px solid var(--primary-color); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; text-align: left;">
  <h3 style="margin: 0 0 1rem 0; font-family: var(--font-heading); color: var(--primary-color);">⚖️ Essential Extracts (Key Terms)</h3>
  <ul style="list-style-type: disc; padding-left: 1.5rem; margin: 0; line-height: 1.6; font-size: 0.95rem;">
    <li style="margin-bottom: 0.8rem;"><strong>Product Representation:</strong> We strive to display product colors and materials as accurately as possible. Slight variations may occur due to screen settings or photographic lighting.</li>
    <li style="margin-bottom: 0.8rem;"><strong>Intellectual Property:</strong> All content on this website—including the SlideEase name, logo, hands-free product designs, and text—is the exclusive property of SlideEase Footwear.</li>
    <li><strong>Governing Law:</strong> These terms are governed by and construed in accordance with the laws of India. Any disputes will be subject to the exclusive jurisdiction of the courts in Mumbai, India.</li>
  </ul>
</div>

<div class="legal-toc">
  <h3>Table of Contents</h3>
  <ol>
    <li><a href="#tos-1">1. Acceptance of Terms</a></li>
    <li><a href="#tos-2">2. Account Registration</a></li>
    <li><a href="#tos-3">3. Products &amp; Pricing</a></li>
    <li><a href="#tos-4">4. Orders &amp; Payment</a></li>
    <li><a href="#tos-5">5. Shipping &amp; Delivery</a></li>
    <li><a href="#tos-6">6. Returns &amp; Refunds</a></li>
    <li><a href="#tos-7">7. Intellectual Property</a></li>
    <li><a href="#tos-8">8. User Conduct</a></li>
    <li><a href="#tos-9">9. Limitation of Liability</a></li>
    <li><a href="#tos-10">10. Governing Law</a></li>
    <li><a href="#tos-11">11. Contact Information</a></li>
  </ol>
</div>

<div class="legal-section" id="tos-1">
  <h2>1. Acceptance of Terms</h2>
  <p>By accessing and using the SlideEase Footwear website, you agree to be bound by these Terms of Service. If you do not agree to all terms and conditions, you must discontinue using our services.</p>
</div>

<div class="legal-section" id="tos-2">
  <h2>2. Account Registration</h2>
  <p>When you create an account, you must provide accurate, complete, and current information. You are responsible for safeguarding your credentials and restricting unauthorized access to your account.</p>
</div>

<div class="legal-section" id="tos-3">
  <h2>3. Products &amp; Pricing</h2>
  <p>All items in our catalog are subject to availability. Prices are listed in Indian Rupees (INR) and are inclusive of GST. We reserve the right to alter pricing or discontinue offerings at our discretion.</p>
</div>

<div class="legal-section" id="tos-4">
  <h2>4. Orders &amp; Payment</h2>
  <p>Orders are confirmed subject to acceptance, inventory allocation, and successful verification. We accept UPI, major credit/debit cards, Net Banking, and Cash on Delivery where serviceable.</p>
</div>

<div class="legal-section" id="tos-5">
  <h2>5. Shipping &amp; Delivery</h2>
  <p>We deliver across serviceable pin codes in India. Standard delivery is complimentary on qualified orders. Timelines are representative transit estimates provided by logistics carriers.</p>
</div>

<div class="legal-section" id="tos-6">
  <h2>6. Returns &amp; Refunds</h2>
  <p>We offer a hassle-free exchange and return window from delivery date, provided footwear remains unworn and in original condition with packaging intact.</p>
</div>

<div class="legal-section" id="tos-7">
  <h2>7. Intellectual Property</h2>
  <p>All trademarks, logos, copy, photographs, and UI elements remain the exclusive intellectual property of SlideEase Footwear.</p>
</div>

<div class="legal-section" id="tos-8">
  <h2>8. User Conduct</h2>
  <p>Users must not engage in unlawful activity, tamper with security barriers, submit fraudulent orders, or transmit harmful scripts.</p>
</div>

<div class="legal-section" id="tos-9">
  <h2>9. Limitation of Liability</h2>
  <p>SlideEase shall not be liable for incidental, special, or consequential damages resulting from the use or inability to use our products or website.</p>
</div>

<div class="legal-section" id="tos-10">
  <h2>10. Governing Law</h2>
  <p>These terms are governed exclusively by the laws of India, under the jurisdiction of competent courts in Mumbai, Maharashtra.</p>
</div>

<div class="legal-section" id="tos-11">
  <h2>11. Contact Information</h2>
  <p>For legal inquiries, contact legal@slideease.in or reach our corporate desk at Kopari, Powai, Mumbai 400076, India.</p>
</div>`
  },

  cookie: {
    slug: 'cookie',
    title: 'Cookie Policy',
    metaTitle: 'Cookie Policy | SlideEase Footwear',
    metaDesc: 'Read about what cookies we use, why we use them, cookie categories, third-party analytics integrations, and how to adjust preference configurations at SlideEase Footwear.',
    published: true,
    content: `<div class="legal-toc">
  <h3>Table of Contents</h3>
  <ol>
    <li><a href="#definition">1. What Are Cookies?</a></li>
    <li><a href="#how-we-use">2. How We Use Cookies</a></li>
    <li><a href="#categories">3. Cookie Categories We Collect</a></li>
    <li><a href="#managing-cookies">4. Managing Cookie Preferences</a></li>
    <li><a href="#updates">5. Policy Updates</a></li>
  </ol>
</div>

<div class="legal-section" id="definition">
  <h2>1. What Are Cookies?</h2>
  <p>Cookies are small text tokens stored in your browser when you access digital services. They maintain sessions, keep track of shopping bags, and preserve individual preferences.</p>
</div>

<div class="legal-section" id="how-we-use">
  <h2>2. How We Use Cookies</h2>
  <p>SlideEase Footwear uses cookies to maintain secure sessions, remember active cart contents, preserve customer login states, and optimize site speed.</p>
</div>

<div class="legal-section" id="categories">
  <h2>3. Cookie Categories We Collect</h2>
  <ul style="list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0;">
    <li style="margin-bottom: 0.8rem;"><strong>Necessary Cookies (Always Active):</strong> Essential to run core storefront features, bag persistence, and checkout.</li>
    <li style="margin-bottom: 0.8rem;"><strong>Analytics &amp; Performance Cookies:</strong> Aggregate visit volumes and navigation speed optimization.</li>
    <li><strong>Marketing &amp; Targeting Cookies:</strong> Manage promotional discount banners, popup frequency, and personalized offers.</li>
  </ul>
</div>

<div class="legal-section" id="managing-cookies">
  <h2>4. Managing Cookie Preferences</h2>
  <p>You can customize, restrict, or delete cookies via your browser settings or directly modify consent preferences on our consent modal.</p>
</div>

<div class="legal-section" id="updates">
  <h2>5. Policy Updates</h2>
  <p>This policy is updated periodically to comply with privacy regulations. Revisions are effective immediately upon posting.</p>
</div>`
  },

  'shipping-returns': {
    slug: 'shipping-returns',
    title: 'Shipping & Returns Policy',
    metaTitle: 'Shipping & Returns Policy | SlideEase Footwear',
    metaDesc: 'Review our India-wide delivery timelines, express shipping, and 30-day hassle-free returns and exchange policy at SlideEase Footwear.',
    published: true,
    content: `<div class="legal-toc">
  <h3>Table of Contents</h3>
  <ol>
    <li><a href="#shipping-policy">1. Shipping &amp; Delivery Policy</a></li>
    <li><a href="#delivery-timelines">2. Delivery Zones &amp; Estimated Timelines</a></li>
    <li><a href="#shipping-charges">3. Shipping Rates &amp; COD Policy</a></li>
    <li><a href="#tracking">4. Tracking Your Order</a></li>
    <li><a href="#returns-policy">5. 30-Day Return &amp; Exchange Policy</a></li>
    <li><a href="#return-steps">6. How to Initiate a Return or Exchange</a></li>
    <li><a href="#refund-process">7. Refund Timelines &amp; Payment Modes</a></li>
    <li><a href="#contact-support">8. Customer Assistance</a></li>
  </ol>
</div>

<div class="legal-section" id="shipping-policy">
  <h2>1. Shipping &amp; Delivery Policy</h2>
  <p>Every pair of handcrafted vegan shoes is inspected, packed with sustainable biodegradable materials, and dispatched from our primary fulfillment facility in Mumbai, Maharashtra.</p>
  <p><strong>Processing Window:</strong> Orders are processed within 1 to 2 business days (Monday through Saturday, excluding public holidays).</p>
</div>

<div class="legal-section" id="delivery-timelines">
  <h2>2. Delivery Zones &amp; Estimated Timelines</h2>
  <p>We partner with premier logistics providers—including Blue Dart, Delhivery, and Xpressbees—to deliver across 19,000+ pin codes in India.</p>
  <ul style="list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0;">
    <li><strong>Mumbai &amp; MMR:</strong> 1 – 2 Business Days</li>
    <li><strong>Metro Cities (Delhi, BLR, HYD, MAA, CCU):</strong> 2 – 4 Business Days</li>
    <li><strong>Rest of India (Tier 2 &amp; 3):</strong> 4 – 6 Business Days</li>
    <li><strong>Special Territories:</strong> 6 – 8 Business Days</li>
  </ul>
</div>

<div class="legal-section" id="shipping-charges">
  <h2>3. Shipping Rates &amp; COD Policy</h2>
  <ul style="list-style-type: disc; padding-left: 1.5rem; line-height: 1.8; margin: 1rem 0;">
    <li><strong>Prepaid Orders:</strong> FREE Standard Shipping across India on qualified prepaid orders.</li>
    <li><strong>Standard Shipping:</strong> A nominal flat shipping fee applies to orders below the free-shipping threshold.</li>
    <li><strong>Cash on Delivery (COD):</strong> Supported across serviceable pin codes with verified reverse logistics fee.</li>
    <li><strong>Express Priority Air Courier:</strong> Expedited air transit available during checkout.</li>
  </ul>
</div>

<div class="legal-section" id="returns-policy">
  <h2>5. 30-Day Hassle-Free Returns &amp; Exchange</h2>
  <p>We want you to feel confident and comfortable in every step. If the size isn't right or you'd prefer an exchange, we offer a straightforward return or exchange window from the date of delivery.</p>
</div>`
  },

  faq: {
    slug: 'faq',
    title: 'Frequently Asked Questions',
    metaTitle: 'FAQ | SlideEase Footwear',
    metaDesc: 'Frequently asked questions about SlideEase footwear orders, shipping, sizing, returns, and care.',
    published: true,
    content: `<div class="faq-cms-container">
  <h2>Frequently Asked Questions</h2>
  <p>Find answers to common inquiries regarding our handcrafted vegan footwear, orders, and delivery.</p>

  <h3>📦 Ordering &amp; Payments</h3>
  <div style="margin-bottom: 1.25rem;">
    <h4>How do I place an order?</h4>
    <p>Browse our catalog, select your size and quantity, and click "Add to Cart." Proceed to checkout, enter your shipping details, and choose your preferred payment method.</p>
  </div>
  <div style="margin-bottom: 1.25rem;">
    <h4>What payment methods are supported?</h4>
    <p>We accept all major UPI apps (GPay, PhonePe, Paytm), Visa, Mastercard, RuPay, Net Banking, and Cash on Delivery (COD) for eligible pin codes.</p>
  </div>

  <h3>🚚 Shipping &amp; Tracking</h3>
  <div style="margin-bottom: 1.25rem;">
    <h4>How long does delivery take?</h4>
    <p>Standard delivery takes 3 to 6 business days across India. Express courier delivers within 24 to 48 hours in metro destinations.</p>
  </div>
  <div style="margin-bottom: 1.25rem;">
    <h4>How do I track my shipment?</h4>
    <p>You will receive an automated tracking link via SMS and email as soon as your package is dispatched with our carrier partners.</p>
  </div>

  <h3>🔄 Returns &amp; Exchanges</h3>
  <div style="margin-bottom: 1.25rem;">
    <h4>What is your exchange policy?</h4>
    <p>We offer hassle-free size exchanges. Footwear must be unworn with original tags and shoebox intact.</p>
  </div>
</div>`
  },

  about: {
    slug: 'about',
    title: 'About SlideEase',
    metaTitle: 'About Us | SlideEase — Handcrafted Vegan Indian Footwear',
    metaDesc: "Learn about SlideEase's mission to blend traditional Indian craftsmanship with cruelty-free vegan materials. Our story, values, and artisan partnerships.",
    published: true,
    content: `<div class="about-cms-container">
  <h2>Crafting Comfort, Celebrating Heritage</h2>
  <p>At SlideEase, we believe style should never come at the cost of conscience. Founded in Mumbai, India, our mission is to create premium-quality, cruelty-free footwear that celebrates India's rich weaving heritage while using zero animal products.</p>
  
  <h3>Walk Light, Walk Right</h3>
  <p>Every pair of SlideEase shoes is handcrafted by master craftspeople from Gujarat, Rajasthan, and Madhya Pradesh—artisanal weavers who have preserved traditional handloom techniques for generations. We combine their generational craft with modern comfort engineering to deliver footwear that is both ethically made and ergonomically contoured.</p>

  <div style="background: var(--bg-light); border-left: 4px solid var(--accent-color); padding: 1.2rem; border-radius: 6px; margin: 1.5rem 0;">
    <h4 style="margin: 0 0 0.5rem 0;">100% PETA-Approved Vegan</h4>
    <p style="margin: 0;">Certified cruelty-free, zero animal derivatives, and crafted with sustainable cork and premium microfiber leather.</p>
  </div>
</div>`
  },

  features: {
    slug: 'features',
    title: 'Signature Product Features',
    metaTitle: 'Features & Engineering | SlideEase Footwear',
    metaDesc: 'Explore the proprietary comfort technology and sustainable craftsmanship behind SlideEase footwear.',
    published: true,
    content: `<div class="features-cms-container">
  <h2>Engineered for Effortless Movement</h2>
  <p>SlideEase combines generational handloom artistry with modern ergonomic footwear engineering.</p>

  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
    <div style="background: var(--bg-light); padding: 1.5rem; border-radius: 10px; border: 1px solid var(--border-color);">
      <h3>✦ Hands-Free Slip-On</h3>
      <p>Precision-molded heel cup and intuitive entry design allowing you to step in effortlessly without bending down or adjusting straps.</p>
    </div>
    <div style="background: var(--bg-light); padding: 1.5rem; border-radius: 10px; border: 1px solid var(--border-color);">
      <h3>✦ Dual-Density Memory Foam</h3>
      <p>Custom-engineered footbed layer that absorbs ground impact and cushions each step with continuous pressure-relief.</p>
    </div>
    <div style="background: var(--bg-light); padding: 1.5rem; border-radius: 10px; border: 1px solid var(--border-color);">
      <h3>✦ Water-Resistant Vegan Leather</h3>
      <p>Cruelty-free, breathable microfiber leather engineered for monsoon durability and easy damp-cloth cleaning.</p>
    </div>
    <div style="background: var(--bg-light); padding: 1.5rem; border-radius: 10px; border: 1px solid var(--border-color);">
      <h3>✦ Arch-Support Contoured Footbed</h3>
      <p>Orthopedic-grade arch contouring that maintains balanced body posture throughout long festive and workday wear.</p>
    </div>
  </div>
</div>`
  }
};

