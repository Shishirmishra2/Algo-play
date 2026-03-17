import { supabase } from "./supabase";

// ─── Badge definitions ──────────────────────────────────────────────────────
export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const BADGE_DEFINITIONS: Badge[] = [
  {
    id: "first_quiz",
    name: "Quiz Starter",
    emoji: "🎯",
    description: "Completed your first quiz",
  },
  {
    id: "quiz_ace",
    name: "Quiz Ace",
    emoji: "⭐",
    description: "Scored 80%+ on a quiz",
  },
  {
    id: "quiz_master",
    name: "Quiz Master",
    emoji: "🏆",
    description: "Completed 5 quizzes",
  },
  {
    id: "top_scorer",
    name: "Top Scorer",
    emoji: "🥇",
    description: "Scored 90%+ on a quiz",
  },
  {
    id: "first_problem",
    name: "Code Cracker",
    emoji: "💻",
    description: "Solved your first problem",
  },
  {
    id: "problem_solver",
    name: "Problem Solver",
    emoji: "🧠",
    description: "Solved 5 coding problems",
  },
];

// ─── Types ───────────────────────────────────────────────────────────────────
export interface UserProgress {
  id?: string;
  user_id: string;
  quizzes_taken: number;
  quiz_questions_correct: number;
  quiz_questions_total: number;
  problems_solved: number;
  easy_solved: number;
  medium_solved: number;
  hard_solved: number;
  updated_at?: string;
}

export interface UserBadge {
  badge_id: string;
  earned_at: string;
}

// ─── Fetch progress ──────────────────────────────────────────────────────────
export const getProgress = async (userId: string): Promise<UserProgress | null> => {
  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    console.error("getProgress error:", error);
    return null;
  }
  return data;
};

// ─── Fetch badges ────────────────────────────────────────────────────────────
export const getBadges = async (userId: string): Promise<UserBadge[]> => {
  const { data, error } = await supabase
    .from("user_badges")
    .select("badge_id, earned_at")
    .eq("user_id", userId);

  if (error) {
    console.error("getBadges error:", error);
    return [];
  }
  return data || [];
};

// ─── Award badge (no-op if already earned) ───────────────────────────────────
const awardBadge = async (userId: string, badgeId: string) => {
  await supabase
    .from("user_badges")
    .upsert({ user_id: userId, badge_id: badgeId }, { onConflict: "user_id,badge_id" });
};

// ─── Update progress after a quiz ────────────────────────────────────────────
export const updateQuizProgress = async (
  userId: string,
  correct: number,
  total: number
): Promise<void> => {
  // Fetch existing or start fresh
  const existing = await getProgress(userId);

  const newQuizzesTaken = (existing?.quizzes_taken ?? 0) + 1;
  const newCorrect = (existing?.quiz_questions_correct ?? 0) + correct;
  const newTotal = (existing?.quiz_questions_total ?? 0) + total;

  await supabase.from("user_progress").upsert(
    {
      user_id: userId,
      quizzes_taken: newQuizzesTaken,
      quiz_questions_correct: newCorrect,
      quiz_questions_total: newTotal,
      problems_solved: existing?.problems_solved ?? 0,
      easy_solved: existing?.easy_solved ?? 0,
      medium_solved: existing?.medium_solved ?? 0,
      hard_solved: existing?.hard_solved ?? 0,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  // Check and award badges
  const pct = total > 0 ? (correct / total) * 100 : 0;

  if (newQuizzesTaken === 1) await awardBadge(userId, "first_quiz");
  if (newQuizzesTaken >= 5) await awardBadge(userId, "quiz_master");
  if (pct >= 80) await awardBadge(userId, "quiz_ace");
  if (pct >= 90) await awardBadge(userId, "top_scorer");
};

// ─── Update progress after solving a problem ─────────────────────────────────
export const updateProblemsSolved = async (
  userId: string,
  count: number = 1
): Promise<void> => {
  const existing = await getProgress(userId);
  const newSolved = (existing?.problems_solved ?? 0) + count;

  await supabase.from("user_progress").upsert(
    {
      user_id: userId,
      quizzes_taken: existing?.quizzes_taken ?? 0,
      quiz_questions_correct: existing?.quiz_questions_correct ?? 0,
      quiz_questions_total: existing?.quiz_questions_total ?? 0,
      problems_solved: newSolved,
      easy_solved: existing?.easy_solved ?? 0,
      medium_solved: existing?.medium_solved ?? 0,
      hard_solved: existing?.hard_solved ?? 0,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (newSolved === 1) await awardBadge(userId, "first_problem");
  if (newSolved >= 5) await awardBadge(userId, "problem_solver");
};
