import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { MOCK_STATS, isConnectionError } from '@/lib/dbFallback';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('startupbiz');
    
    // 1. Calculate Total Revenue (Sum of 'total' from all orders)
    const revenueStats = await db.collection('orders').aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]).toArray();
    const totalRevenue = revenueStats[0]?.total || 0;
    
    // 2. Count Total Orders
    const totalOrders = await db.collection('orders').countDocuments();
    
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
       
    // 6. Fetch Low Stock Alerts (items marked as low-stock or less than 15 units count if trackable)
    const lowStock = await db.collection('products')
      .find({ stock: 'low-stock' })
      .limit(5)
      .toArray();

    // 7. Calculate Top Selling Products (simple aggregation or list top 4 highest rated/selling fallback)
    const topProducts = await db.collection('products')
      .find({})
      .sort({ rating: -1 })
      .limit(5)
      .toArray();

    // 8. Count Pending Returns & Enquiries
    let pendingReturns = 0;
    try {
      pendingReturns = await db.collection('returns').countDocuments({ status: 'pending' });
    } catch {}

    let pendingEnquiries = 0;
    try {
      pendingEnquiries = await db.collection('enquiries').countDocuments({ status: { $in: ['unread', 'pending', 'new'] } });
    } catch {}
      
    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
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
