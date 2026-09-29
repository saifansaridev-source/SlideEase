import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { ObjectId } from "mongodb";

async function requireAdmin() {
  const cookieStore = await cookies();
  const sc = cookieStore.get("slidex_session");
  if (!sc) return null;
  const s = verifySession(sc.value);
  return s?.role === "admin" ? s : null;
}

export async function GET(request) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const notified = searchParams.get("notified");
    const db = await getDb();
    const filter = {};
    if (notified === "false") filter.notified = false;
    if (notified === "true") filter.notified = true;
    const alerts = await db.collection("stock_alerts").find(filter).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ success: true, data: alerts.map((a) => ({ ...a, _id: a._id.toString() })) });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const { id, notified } = await request.json();
    if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });
    const db = await getDb();
    await db.collection("stock_alerts").updateOne(
      { _id: new ObjectId(id) },
      { $set: { notified: !!notified, notifiedAt: notified ? new Date() : null } }
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
