"use client";

import Image from "next/image";
import medal from "@/public/images/medal.png";
import {
  CodeIcon,
  GameControllerIcon,
  LightbulbIcon,
} from "@phosphor-icons/react/ssr";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { getUserJourney, getSubjectDisplayText } from "@/lib/userPreferences";
import { supabase } from "@/lib/supabase";
import { BADGE_DEFINITIONS, type UserProgress, type UserBadge } from "@/lib/userProgress";
import GameCarousel from "@/components/GameCarousel";

export default function Dashboard() {
  const [subjectDisplay, setSubjectDisplay] = useState("Data Structure & Algorithms");
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Load journey preference
  useEffect(() => {
    const journey = getUserJourney();
    if (journey.subjects.length > 0) {
      setSubjectDisplay(getSubjectDisplayText(journey.subjects));
    }
  }, []);

  // Fetch user, progress, badges — and subscribe to real-time updates
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Initial fetch
      const [progressRes, badgesRes] = await Promise.all([
        supabase.from("user_progress").select("*").eq("user_id", user.id).single(),
        supabase.from("user_badges").select("badge_id, earned_at").eq("user_id", user.id),
      ]);
      if (progressRes.data) setProgress(progressRes.data);
      if (badgesRes.data) setBadges(badgesRes.data);

      // Real-time subscription on progress
      const channel = supabase
        .channel(`progress:${user.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "user_progress", filter: `user_id=eq.${user.id}` },
          (payload) => {
            setProgress(payload.new as UserProgress);
          }
        )
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "user_badges", filter: `user_id=eq.${user.id}` },
          (payload) => {
            setBadges((prev) => [...prev, payload.new as UserBadge]);
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    };
    init();
  }, []);

  // Derived stats
  const questionsSolved = progress?.quiz_questions_correct ?? 0;
  const questionsTotal = Math.max(progress?.quiz_questions_total ?? 200, 200);
  const quizzesTaken = progress?.quizzes_taken ?? 0;
  const problemsSolved = progress?.problems_solved ?? 0;
  const progressPct = questionsTotal > 0 ? Math.round((questionsSolved / questionsTotal) * 100) : 0;
  const circumference = 2 * Math.PI * 45; // r=45
  const strokeDasharray = `${(progressPct / 100) * circumference} ${circumference}`;

  const earnedBadgeIds = new Set(badges.map((b) => b.badge_id));
  const earnedBadges = BADGE_DEFINITIONS.filter((b) => earnedBadgeIds.has(b.id));

  return (
    <section className="">
      <div className="min-h-screen pb-24">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-b rounded-b-4xl from-[#2A0072] to-[#8F1EEF] flex flex-col gap-4 items-center justify-center py-8 px-4">
          <h1 className="text-2xl sm:text-3xl">
            <span className="font-semibold">Algo</span>Play
          </h1>
          <p className="font-medium px-3 py-1.5 rounded-full border-2 text-sm sm:text-base text-center">
            {subjectDisplay}
          </p>

          {/* Stats Row */}
          <div className="pt-3 sm:pt-6 flex gap-8 sm:gap-15 justify-between items-center w-full px-4 sm:px-8">
            {/* Difficulty breakdown */}
            <div className="flex-1 flex flex-col gap-1 sm:gap-2 font-bold text-sm sm:text-base">
              <p className="text-lime-500">{progress?.easy_solved ?? 0} Easy</p>
              <p className="text-yellow-400">{progress?.medium_solved ?? 0} Medium</p>
              <p className="text-red-400">{progress?.hard_solved ?? 0} Hard</p>
            </div>

            {/* Circular progress */}
            <div className="flex-1 shrink-0 text-center relative rounded-full size-32 sm:size-40 flex flex-col justify-center items-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="45" fill="none"
                  stroke="url(#progressGrad)" strokeWidth="8"
                  strokeDasharray={strokeDasharray}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#d946ef" />
                    <stop offset="100%" stopColor="#ffffff" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="font-bold text-base sm:text-lg z-10">{questionsSolved}/{questionsTotal}</span>
              <span className="text-xs z-10">Qs Solved</span>
            </div>

            {/* Badges count */}
            <div className="flex-1 flex flex-col justify-center items-center">
              <Image src={medal} alt="medal" className="size-12 sm:size-16" />
              <span className="font-bold text-base sm:text-lg">{earnedBadges.length}/{BADGE_DEFINITIONS.length}</span>
              <span className="text-xs sm:text-sm">Badges</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 sm:-bottom-10 flex items-center justify-between gap-2">
            <Link
              href="/games"
              className="bg-white text-black font-semibold flex items-center gap-1 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg text-center rounded-xl"
            >
              <GameControllerIcon size={22} />
              Games
            </Link>
            <Link
              href="/problems"
              className="bg-white text-black font-semibold flex items-center gap-1 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg text-center rounded-xl"
            >
              <CodeIcon size={22} />
              Problems
            </Link>
            <div className="bg-white text-black font-semibold flex items-center gap-1 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg text-center rounded-xl">
              <LightbulbIcon size={22} />
              Learn
            </div>
          </div>
        </div>

        {/* Content below header */}
        <div className="pt-16 px-4 space-y-6">

          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Quizzes", value: quizzesTaken, color: "from-purple-900/40 to-purple-800/20", border: "border-purple-500/20" },
              { label: "Q Correct", value: questionsSolved, color: "from-blue-900/40 to-blue-800/20", border: "border-blue-500/20" },
              { label: "Problems", value: problemsSolved, color: "from-green-900/40 to-green-800/20", border: "border-green-500/20" },
            ].map((stat) => (
              <div key={stat.label} className={`bg-gradient-to-br ${stat.color} border ${stat.border} rounded-2xl p-3 text-center`}>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Badges Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-xl">Badges</h3>
              <span className="text-purple-400 text-sm">{earnedBadges.length} earned</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {BADGE_DEFINITIONS.map((badge) => {
                const earned = earnedBadgeIds.has(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`rounded-2xl p-3 flex flex-col items-center gap-1 text-center border transition-all ${
                      earned
                        ? "bg-purple-900/40 border-purple-500/40"
                        : "bg-white/5 border-white/5 opacity-40 grayscale"
                    }`}
                  >
                    <span className="text-2xl">{badge.emoji}</span>
                    <span className="text-xs font-semibold leading-tight">{badge.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="font-semibold text-xl">Suggested Games</h3>
              <Link href="/games" className="text-purple-400 cursor-pointer text-sm">See All</Link>
            </div>
            
            <GameCarousel 
              games={[
                { id: "tictactoe", name: "Tic-Tac-Toe", img: "/images/tictactoe.png", tag: "Logic" },
                { id: "connect4", name: "Connect Four", img: "/images/connect4.png", tag: "Strategy" },
                { id: "minesweeper", name: "Minesweeper", img: "/images/minesweeper.png", tag: "Classic" },
                { id: "sudoku", name: "Sudoku", img: "/images/sudoku.png", tag: "Puzzle" },
                { id: "uno", name: "UNO", img: "/images/uno.png", tag: "Cards" },
              ]} 
            />
          </div>

          {/* Quiz Banner */}
          <Link
            href={"/quiz"}
            className="border-2 border-purple-400/20 bg-purple-600/10 rounded-2xl flex min-h-30"
          >
            <div className="flex-1 relative">
              <Image
                src={"/images/clock.png"}
                alt="clock"
                width={300}
                height={300}
                className="absolute -top-15"
              />
            </div>
            <div className="flex-1 flex justify-start items-center text-7xl font-retro">
              Quiz
            </div>
          </Link>

          <Navbar />
        </div>
      </div>
    </section>
  );
}
