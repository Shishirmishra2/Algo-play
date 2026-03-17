import { NextRequest, NextResponse } from "next/server";
import { generateHint } from "@/lib/geminiProblems";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { problem, userCode, language } = body;

    if (!problem || !userCode || !language) {
      return NextResponse.json({ error: "problem, userCode, and language are required" }, { status: 400 });
    }

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json({ error: "Service not configured" }, { status: 500 });
    }

    const hint = await generateHint(problem, userCode, language);

    return NextResponse.json({ hint });
  } catch (error: any) {
    console.error("Error generating hint:", error);
    return NextResponse.json({ error: "Failed to generate hint" }, { status: 500 });
  }
}
