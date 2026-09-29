import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const db = await getDb();
    const stores = await db.collection("stores")
      .find({ active: true })
      .sort({ name: 1 })
      .toArray();
    return NextResponse.json({ success: true, stores: stores.map((s) => ({ ...s, _id: s._id.toString() })) });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
