import { NextRequest, NextResponse } from "next/server";
import { generateProblems } from "@/lib/geminiProblems";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, difficulty = "intermediate" } = body;

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json({ error: "Service not configured" }, { status: 500 });
    }

    const problems = await generateProblems(topic, difficulty);

    return NextResponse.json({ problems, topic, difficulty });
  } catch (error: any) {
    console.error("Error generating problems:", error);
    return NextResponse.json({ error: "Failed to generate problems" }, { status: 500 });
  }
}
