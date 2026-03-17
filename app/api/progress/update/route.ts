import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { updateQuizProgress, updateProblemsSolved } from "@/lib/userProgress";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options));
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, correct, total, problemCount } = body;

    if (type === "quiz") {
      if (typeof correct !== "number" || typeof total !== "number") {
        return NextResponse.json({ error: "correct and total required" }, { status: 400 });
      }
      await updateQuizProgress(user.id, correct, total, supabase);
    } else if (type === "problem") {
      await updateProblemsSolved(user.id, problemCount ?? 1, supabase);
    } else {
      return NextResponse.json({ error: "type must be quiz or problem" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Progress update error:", error);
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}
