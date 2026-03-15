import { NextRequest, NextResponse } from "next/server";
import { generateQuizQuestions } from "@/lib/geminiQuiz";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subjects, difficulty = "intermediate", count = 10 } = body;

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return NextResponse.json(
        { error: "At least one subject must be selected" },
        { status: 400 }
      );
    }

    if (count < 1 || count > 20) {
      return NextResponse.json(
        { error: "Question count must be between 1 and 20" },
        { status: 400 }
      );
    }

    const validDifficulties = ["beginner", "intermediate", "expert"];
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { error: "Difficulty must be beginner, intermediate, or expert" },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Quiz generation service is not properly configured" },
        { status: 500 }
      );
    }

    const questions = await generateQuizQuestions(subjects, difficulty, count);

    if (!questions || questions.length === 0) {
      throw new Error("No questions were generated");
    }

    return NextResponse.json({
      questions,
      metadata: {
        generated_at: new Date().toISOString(),
        subjects,
        difficulty,
        count: questions.length,
        generated_by: "gemini",
      },
    });
  } catch (error: any) {
    console.error("Error in quiz generation API:", error);

    let errorMessage = "Failed to generate quiz questions";
    if (error.message?.includes("API key"))
      errorMessage = "Quiz service is not properly configured";
    else if (
      error.message?.includes("quota") ||
      error.message?.includes("limit")
    )
      errorMessage =
        "Quiz service is temporarily unavailable due to high demand";
    else if (error.message?.includes("timeout"))
      errorMessage = "Quiz generation timed out. Please try again";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

