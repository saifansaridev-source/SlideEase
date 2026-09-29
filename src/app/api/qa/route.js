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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    if (!productId) return NextResponse.json({ success: false, error: "productId required" }, { status: 400 });

    const db = await getDb();
    const questions = await db.collection("questions")
      .find({ productId, status: { $in: ["approved", "answered"] } })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, questions: questions.map((q) => ({ ...q, _id: q._id.toString() })) });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    const { productId, question } = await request.json();
    if (!productId) return NextResponse.json({ success: false, error: "productId required" }, { status: 400 });
    if (!question || question.trim().length < 5)
      return NextResponse.json({ success: false, error: "Question must be at least 5 characters." }, { status: 400 });
    if (question.length > 500)
      return NextResponse.json({ success: false, error: "Question must not exceed 500 characters." }, { status: 400 });

    const db = await getDb();
    const doc = {
      productId,
      question: question.trim().substring(0, 500),
      answer: null,
      askedBy: session?.email || "guest",
      answeredBy: null,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("questions").insertOne(doc);
    return NextResponse.json({ success: true, id: result.insertedId.toString(), message: "Your question has been submitted and will be answered shortly." });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
