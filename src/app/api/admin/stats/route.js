import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { MOCK_STATS, isConnectionError } from '@/lib/dbFallback';

export async function GET() {
  try {
    const db = await getDb();
    
    // 1. Calculate Authoritative Total Revenue (Sum of pricing.total or legacy total)
    const revenueStats = await db.collection('orders').aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: { $ifNull: ['$pricing.total', '$total'] } },
        }
      }
    ]).toArray();
    const totalRevenue = revenueStats[0]?.total || 0;
    
    // 2. Count Total Orders & Breakdown
    const totalOrders = await db.collection('orders').countDocuments();
    const paidOrders = await db.collection('orders').countDocuments({ 'payment.status': 'Paid' });
    const codOrders = await db.collection('orders').countDocuments({ 'payment.method': 'COD' });
    
    // 3. Count Total Registered Customers
    const totalCustomers = await db.collection('users').countDocuments();
    
    // 4. Count Products list
    const totalProducts = await db.collection('products').countDocuments();
    
    // 5. Fetch Recent Orders (last 5 items)
    const recentOrders = await db.collection('orders')
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
       
    // 6. Fetch Low Stock Alerts (items where stockQty <= 10 or marked low-stock)
    const lowStock = await db.collection('products')
      .find({
        $or: [
          { stock: 'low-stock' },
          { stockQty: { $lte: 10 } }
        ]
      })
      .limit(6)
      .toArray();

    // 7. Calculate Top Products sorted by rating/demand
    const topProducts = await db.collection('products')
      .find({})
      .sort({ rating: -1 })
      .limit(5)
      .toArray();

    // 8. Count Pending Returns & Enquiries
    let pendingReturns = 0;
    try {
      pendingReturns = await db.collection('returns').countDocuments({ status: { $in: ['pending', 'Pending'] } });
    } catch {}

    let pendingEnquiries = 0;
    try {
      pendingEnquiries = await db.collection('inquiries').countDocuments({ status: { $in: ['unread', 'pending', 'new'] } });
    } catch {}
      
    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        paidOrders,
        codOrders,
        totalCustomers,
        totalProducts,
        recentOrders,
        lowStock,
        topProducts,
        pendingReturns,
        pendingEnquiries
      }
    });
  } catch (error) {
    if (isConnectionError(error)) {
      console.warn("MongoDB connection failed. Using mock stats fallback data.", error.message);
      return NextResponse.json({
        success: true,
        data: MOCK_STATS,
        isFallback: true,
        fallbackNotice: "Offline Fallback Mode active. Please verify your MongoDB Atlas Network IP Whitelist (add 0.0.0.0/0) in security settings."
      });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
