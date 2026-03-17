"use client";

import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { type UserProgress } from "@/lib/userProgress";
import Navbar from "@/components/Navbar";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { 
  TrendUp, 
  CheckCircle, 
  Target, 
  Flashlight, 
  ArrowLeft 
} from "@phosphor-icons/react";
import Link from "next/link";

export default function PerformancePage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const graphRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Initial fetch
      const { data } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (data) setProgress(data);
      setLoading(false);

      // Real-time subscription
      const channel = supabase
        .channel(`performance:${user.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "user_progress", filter: `user_id=eq.${user.id}` },
          (payload) => {
            setProgress(payload.new as UserProgress);
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    };
    init();
  }, []);

  useGSAP(() => {
    if (!pathRef.current || loading) return;

    const length = pathRef.current.getTotalLength();

    // Reset path
    gsap.set(pathRef.current, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });

    // "Shooting" animation
    gsap.to(pathRef.current, {
      strokeDashoffset: 0,
      duration: 2,
      ease: "power2.out",
      delay: 0.5,
    });

    // Re-run animation if progress significantly changes
    // (This is triggered by the dependency array)
  }, [loading, progress?.problems_solved]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#010101] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  const accuracy = progress?.quiz_questions_total 
    ? Math.round((progress.quiz_questions_correct / progress.quiz_questions_total) * 100) 
    : 0;

  // Calculate dynamic path based on progress
  const generatePath = () => {
    const easy = progress?.easy_solved ?? 0;
    const medium = progress?.medium_solved ?? 0;
    const hard = progress?.hard_solved ?? 0;
    
    // Scale points (max height 180, min 20)
    const p1 = 180 - Math.min(60, easy * 5);
    const p2 = p1 - Math.min(60, medium * 10);
    const p3 = p2 - Math.min(40, hard * 15);
    
    return `M 0 180 Q 50 ${p1} 150 ${p2} T 300 ${p3} T 400 ${Math.max(10, p3 - 10)}`;
  };

  return (
    <main className="min-h-screen bg-[#010101] text-white pb-24 font-sans">
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        <Link href="/dashboard" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold italic tracking-wider">PERFORMANCE</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="px-6 space-y-8">
        {/* Shooting Graph Section */}
        <section className="relative bg-gradient-to-br from-purple-900/20 to-transparent p-6 rounded-3xl border border-white/5 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-gray-400 text-sm uppercase tracking-widest font-semibold">Growth Trend</p>
              <h2 className="text-3xl font-black mt-1">PRO PROGRESS</h2>
            </div>
            <div className="bg-purple-600/30 p-3 rounded-2xl border border-purple-500/30">
              <TrendUp size={32} className="text-purple-400" weight="bold" />
            </div>
          </div>

          {/* SVG Graph */}
          <div className="relative h-48 w-full mt-4">
            <svg
              ref={graphRef}
              viewBox="0 0 400 200"
              className="w-full h-full drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]"
              preserveAspectRatio="none"
            >
              {/* Grid Lines */}
              {[0, 50, 100, 150].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="400"
                  y2={y}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                />
              ))}

              {/* The "Shooting" Path */}
              <path
                ref={pathRef}
                d={generatePath()}
                fill="none"
                stroke="url(#graphGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <defs>
                <linearGradient id="graphGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
              </defs>
            </svg>

            {/* Glowing particle at the end of the line */}
            <div className="absolute top-0 right-0 size-4 bg-fuchsia-500 rounded-full blur-[6px] animate-pulse" />
          </div>

          <div className="flex justify-between mt-6 text-gray-500 text-[10px] font-bold tracking-tighter uppercase">
            <span>Entry Level</span>
            <span>Current Status</span>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 gap-4">
          <div className="stat-card bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col gap-3">
            <div className="size-10 rounded-2xl bg-blue-500/20 flex items-center justify-center">
              <CheckCircle size={22} className="text-blue-400" weight="fill" />
            </div>
            <div>
              <p className="text-7xl font-black">{accuracy}%</p>
              <p className="text-gray-400 text-xs font-semibold mt-1">ACCURACY RATE</p>
            </div>
          </div>

          <div className="stat-card bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col gap-3">
            <div className="size-10 rounded-2xl bg-green-500/20 flex items-center justify-center">
              <Target size={22} className="text-green-400" weight="fill" />
            </div>
            <div>
              <p className="text-7xl font-black">{progress?.problems_solved ?? 0}</p>
              <p className="text-gray-400 text-xs font-semibold mt-1">PROBLEMS DONE</p>
            </div>
          </div>

          <div className="stat-card bg-white/5 border border-white/10 rounded-3xl p-5 col-span-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center">
                <Flashlight size={28} className="text-yellow-400" weight="fill" />
              </div>
              <div>
                <p className="text-xl font-black uppercase">Quiz Streak</p>
                <p className="text-gray-400 text-xs">{progress?.quizzes_taken ?? 0} total sessions</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-yellow-400">×{progress?.quizzes_taken ?? 0}</p>
            </div>
          </div>
        </section>

        {/* Difficulty Breakdown (Simplified) */}
        <section className="stat-card bg-gradient-to-r from-purple-900/40 to-black border border-white/10 rounded-3xl p-6">
          <h3 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-widest">Mastery Levels</h3>
          <div className="space-y-6">
            {[
              { label: "Beginner", count: progress?.easy_solved ?? 0, color: "bg-green-500", total: 100 },
              { label: "Medium", count: progress?.medium_solved ?? 0, color: "bg-yellow-500", total: 100 },
              { label: "Expert", count: progress?.hard_solved ?? 0, color: "bg-red-500", total: 100 },
            ].map((level) => (
              <div key={level.label} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase">
                  <span>{level.label}</span>
                  <span className="text-gray-400">{level.count} solved</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${level.color} transition-all duration-1000`}
                    style={{ width: `${Math.min(100, (level.count / 100) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Navbar />
    </main>
  );
}
