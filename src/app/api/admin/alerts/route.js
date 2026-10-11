import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const db = await getDb();
    const [priceAlerts, stockAlerts] = await Promise.all([
      db.collection('price_alerts').countDocuments({ status: { $ne: 'fulfilled' } }),
      db.collection('stock_alerts').countDocuments({ status: { $ne: 'fulfilled' } })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        activePriceAlerts: priceAlerts,
        activeStockAlerts: stockAlerts,
        totalActiveAlerts: priceAlerts + stockAlerts
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
