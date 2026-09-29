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
    const stores = await db.collection("stores").find({}).sort({ name: 1 }).toArray();
    return NextResponse.json({ success: true, data: stores.map((s) => ({ ...s, _id: s._id.toString() })) });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    if (!body.name || !body.address || !body.city) return NextResponse.json({ success: false, error: "name, address, and city required" }, { status: 400 });
    const db = await getDb();
    const store = {
      name: body.name.trim(),
      address: body.address.trim(),
      city: body.city.trim(),
      state: body.state || "",
      phone: body.phone || "",
      hours: body.hours || "",
      lat: body.lat || null,
      lng: body.lng || null,
      active: body.active !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection("stores").insertOne(store);
    return NextResponse.json({ success: true, id: result.insertedId.toString() });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const { id, ...updates } = await request.json();
    if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });
    const db = await getDb();
    delete updates._id;
    await db.collection("stores").updateOne({ _id: new ObjectId(id) }, { $set: { ...updates, updatedAt: new Date() } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });
    const db = await getDb();
    await db.collection("stores").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
