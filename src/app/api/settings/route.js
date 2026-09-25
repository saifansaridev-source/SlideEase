import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

const PUBLIC_DEFAULTS = {
  storeName: 'SlideEase',
  storeTagline: 'Walk in Comfort. Stand in Style.',
  supportEmail: 'support@slideease.in',
  supportPhone: '+91 98200 12345',
  whatsappNumber: '919820012345',
  maintenanceMode: false,
  freeShippingThreshold: 999,
  shippingFlatRate: 79,
  codCharge: 49,
};

export async function GET() {
  try {
    const db = await getDb();
    const generalDoc = await db.collection('settings').findOne({ key: 'general' });
    const shippingDoc = await db.collection('settings').findOne({ key: 'shipping_tax' });

    const generalData = generalDoc ? {
      storeName: generalDoc.storeName,
      storeTagline: generalDoc.storeTagline,
      supportEmail: generalDoc.supportEmail,
      supportPhone: generalDoc.supportPhone,
      whatsappNumber: generalDoc.whatsappNumber,
      maintenanceMode: generalDoc.maintenanceMode,
    } : {};

    const shippingData = shippingDoc ? {
      freeShippingThreshold: shippingDoc.freeShippingThreshold,
      shippingFlatRate: shippingDoc.shippingFlatRate,
      codCharge: shippingDoc.codCharge,
    } : {};

    return NextResponse.json({
      success: true,
      data: {
        ...PUBLIC_DEFAULTS,
        ...generalData,
        ...shippingData,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: true, data: PUBLIC_DEFAULTS });
  }
}
