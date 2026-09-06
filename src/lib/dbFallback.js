import { PRODUCTS } from '@/data/products';

export const MOCK_CATEGORIES = [
  { name: "Men's Collection", slug: 'mens', desc: 'Premium slides, loafers and slip-ons for men.' },
  { name: "Women's Collection", slug: 'womens', desc: 'Handcrafted juttis, flats, sandals and mules.' }
];

export const MOCK_COUPONS = [
  { code: 'SLIDEEASE10', discount: 0.10, minOrder: 0, active: true },
  { code: 'STARTUPINDIA', discount: 0.10, minOrder: 0, active: true }
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

// Check if error is network/whitelist connection related
export function isConnectionError(error) {
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
