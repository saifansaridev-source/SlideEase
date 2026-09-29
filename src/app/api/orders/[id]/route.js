import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { ObjectId } from "mongodb";

async function getSession() {
  try {
    const cookieStore = await cookies();
    const sc = cookieStore.get("slidex_session");
    if (!sc) return null;
    return verifySession(sc.value) || null;
  } catch { return null; }
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ success: false, error: "Order ID required" }, { status: 400 });
    const session = await getSession();
    const db = await getDb();

    const isOid = ObjectId.isValid(id) && String(new ObjectId(id)) === id;
    const filter = isOid ? { _id: new ObjectId(id) } : { orderNumber: id };
    const order = await db.collection("orders").findOne(filter);
    if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });

    const customerEmail = (order.customer?.email || "").toLowerCase().trim();
    const customerPhone = (order.customer?.phone || "").replace(/\D/g, "");

    // 1. Admin has full access
    if (session?.role === "admin") {
      return NextResponse.json({ success: true, order: { ...order, _id: order._id.toString() } });
    }

    // 2. Authenticated user
    if (session?.email) {
      const sessionEmail = session.email.toLowerCase().trim();
      if (customerEmail && customerEmail !== sessionEmail) {
        return NextResponse.json({ success: false, error: "Unauthorized access to this order." }, { status: 403 });
      }
      return NextResponse.json({ success: true, order: { ...order, _id: order._id.toString() } });
    }

    // 3. Unauthenticated / Guest access:
    // If querying by exact unguessable 24-character hexadecimal MongoDB ObjectId (returned upon checkout redirect)
    if (isOid) {
      return NextResponse.json({ success: true, order: { ...order, _id: order._id.toString() } });
    }

    // If querying by sequential/human-readable orderNumber without session:
    // Require verification via email or phone query param
    const { searchParams } = new URL(request.url);
    const verifyEmail = (searchParams.get("email") || "").toLowerCase().trim();
    const verifyPhone = (searchParams.get("phone") || "").replace(/\D/g, "");

    if (
      (verifyEmail && verifyEmail === customerEmail) ||
      (verifyPhone && customerPhone && (verifyPhone === customerPhone || customerPhone.endsWith(verifyPhone)))
    ) {
      return NextResponse.json({ success: true, order: { ...order, _id: order._id.toString() } });
    }

    return NextResponse.json({
      success: false,
      error: "Authentication or order verification (email/phone) required to view this order.",
      requiresVerification: true,
    }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (session?.role !== "admin") return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const updates = await request.json();
    const db = await getDb();
    const allowedFields = ["status", "fulfillmentStatus", "trackingNumber", "trackingUrl", "notes"];
    const setData = { updatedAt: new Date() };
    for (const f of allowedFields) { if (updates[f] !== undefined) setData[f] = updates[f]; }
    await db.collection("orders").updateOne({ _id: new ObjectId(id) }, { $set: setData });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}