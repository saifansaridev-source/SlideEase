import { PRODUCTS } from '@/data/products';

export const MOCK_CATEGORIES = [
  { name: "Men's Collection", slug: 'mens', desc: 'Premium slides, loafers and slip-ons for men.', parent: null, displayOrder: 1 },
  { name: "Women's Collection", slug: 'womens', desc: 'Handcrafted juttis, flats, sandals and mules.', parent: null, displayOrder: 2 },
  { name: 'Artisan Loafers', slug: 'mens-loafers', desc: 'Premium artisan loafers and slip-ons for men.', parent: 'mens', displayOrder: 1, typeMapping: 'loafers' },
  { name: 'Ergonomic Slides', slug: 'mens-slides', desc: 'Contoured footbed ergonomic everyday slides.', parent: 'mens', displayOrder: 2, typeMapping: 'slides' },
  { name: 'Strappy Sandals', slug: 'mens-sandals', desc: 'Comfort cross and strappy sandals.', parent: 'mens', displayOrder: 3, typeMapping: 'sandals' },
  { name: 'Casual Footwear', slug: 'mens-casual', desc: 'Relaxed everyday casual footwear for men.', parent: 'mens', displayOrder: 4, typeMapping: 'casual' },
  { name: 'Kutch Juttis & Mojris', slug: 'womens-juttis', desc: 'Handcrafted heritage mirror-work juttis.', parent: 'womens', displayOrder: 1, typeMapping: 'sandals' },
  { name: 'Ikat Slip-on Loafers', slug: 'womens-loafers', desc: 'Pochampally ikat woven loafers.', parent: 'womens', displayOrder: 2, typeMapping: 'loafers' },
  { name: 'Paisley Comfort Sandals', slug: 'womens-sandals', desc: 'Handcrafted paisley comfort sandals and flats.', parent: 'womens', displayOrder: 3, typeMapping: 'sandals' },
  { name: 'Floral Cork Slides', slug: 'womens-slides', desc: 'Natural cork footbed floral and mandala slides.', parent: 'womens', displayOrder: 4, typeMapping: 'slides' },
];

export const MOCK_COUPONS = [
  { code: 'SLIDEEASE10', discount: 10, type: 'percentage', minOrder: 0, active: true },
  { code: 'STARTUPINDIA', discount: 10, type: 'percentage', minOrder: 0, active: true }
];

export const MOCK_ORDERS = [
  {
    orderId: 'ORD-7294',
    customer: { firstname: 'Aditya', lastname: 'Verma', email: 'aditya@example.com', phone: '+91 98765 43210' },
    items: [
      { id: 'prod-01', name: 'Peacock Ikat Loafers', price: 1499, qty: 1, size: '8' }
    ],
    total: 1349,
    status: 'pending',
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    orderId: 'ORD-6129',
    customer: { firstname: 'Neha', lastname: 'Mehta', email: 'neha@example.com', phone: '+91 91234 56789' },
    items: [
      { id: 'prod-02', name: 'Kutch Embroidered Juttis', price: 1299, qty: 1, size: '7' }
    ],
    total: 1169,
    status: 'delivered',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export const MOCK_USERS = [
  { _id: 'mock-user-1', name: 'Rahul Sharma', email: 'rahul@example.com', role: 'admin', points: 150, createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
  { _id: 'mock-user-2', name: 'Priya Patel', email: 'priya@example.com', role: 'customer', points: 80, createdAt: new Date(Date.now() - 15 * 86400000).toISOString() }
];

export const MOCK_STATS = {
  totalRevenue: 2518,
  totalOrders: 2,
  totalCustomers: 2,
  totalProducts: PRODUCTS.length,
  recentOrders: MOCK_ORDERS,
  lowStock: PRODUCTS.filter(p => p.stock === 'low-stock' || p.stock === 'out-of-stock').slice(0, 5),
  topProducts: PRODUCTS.slice(0, 5),
  pendingReturns: 1,
  pendingEnquiries: 2,
};

// Check if error is network/whitelist connection related (only allowed in development)
export function isConnectionError(error) {
  // In production, NEVER return fake business data silently
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEV_FALLBACK !== 'true') {
    return false;
  }

  const msg = error?.message || '';
  return (
    msg.includes('SSL') ||
    msg.includes('connection') ||
    msg.includes('whitelist') ||
    msg.includes('handshake') ||
    msg.includes('MongoServerSelectionError') ||
    msg.includes('ENOTFOUND') ||
    msg.includes('ETIMEDOUT') ||
    msg.includes('ECONNREFUSED')
  );
}
