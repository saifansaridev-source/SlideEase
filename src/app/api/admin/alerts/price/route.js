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

export async function GET() {
  try {
    if (!await requireAdmin()) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const db = await getDb();
    const alerts = await db.collection("price_alerts").find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ success: true, data: alerts.map((a) => ({ ...a, _id: a._id.toString() })) });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const { id, active } = await request.json();
    if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });
    const db = await getDb();
    await db.collection("price_alerts").updateOne({ _id: new ObjectId(id) }, { $set: { active: !!active } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
