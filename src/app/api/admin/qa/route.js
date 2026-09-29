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
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const db = await getDb();
    const questions = await db.collection("questions").find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ success: true, data: questions.map((q) => ({ ...q, _id: q._id.toString() })) });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const { id, answer, status } = await request.json();
    if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });
    const db = await getDb();
    const update = { updatedAt: new Date() };
    if (answer !== undefined) { update.answer = answer.substring(0, 2000); update.answeredBy = admin.email; }
    if (status) update.status = status;
    if (answer && !status) update.status = "answered";
    await db.collection("questions").updateOne({ _id: new ObjectId(id) }, { $set: update });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });
    const db = await getDb();
    await db.collection("questions").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
