"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeftIcon, LightbulbIcon, PlayIcon, CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import Link from "next/link";
import type { CodingProblem } from "@/lib/geminiProblems";

// Dynamically load Monaco Editor (no SSR)
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const LANGUAGES = [
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
];

type Tab = "problem" | "hint";

export default function SolvePage() {
  const router = useRouter();
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [language, setLanguage] = useState<"javascript" | "python" | "java">("javascript");
  const [code, setCode] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("problem");
  const [hint, setHint] = useState("");
  const [hintLoading, setHintLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [solved, setSolved] = useState<boolean[]>([false, false]);
  const [topic, setTopic] = useState("");

  // Fetch problems on mount
  useEffect(() => {
    const storedTopic = sessionStorage.getItem("problemTopic");
    const storedDifficulty = sessionStorage.getItem("problemDifficulty");
    if (!storedTopic) {
      router.push("/problems");
      return;
    }
    setTopic(storedTopic);
    fetchProblems(storedTopic, storedDifficulty || "Intermediate");
  }, []);

  const fetchProblems = async (topic: string, difficulty: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/problems/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProblems(data.problems);
      setCode(data.problems[0]?.starterCode?.javascript || "");
    } catch (e: any) {
      setError(e.message || "Failed to load problems");
    } finally {
      setLoading(false);
    }
  };

  // When problem or language changes, reset code to starter
  useEffect(() => {
    if (problems[currentIdx]) {
      setCode(problems[currentIdx].starterCode[language] || "");
      setHint("");
      setActiveTab("problem");
    }
  }, [currentIdx, language, problems]);

  const handleGetHint = async () => {
    if (!problems[currentIdx] || hintLoading) return;
    setHintLoading(true);
    setActiveTab("hint");
    setHint("");
    try {
      const res = await fetch("/api/problems/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem: problems[currentIdx],
          userCode: code,
          language,
        }),
      });
      const data = await res.json();
      setHint(data.hint || "Try thinking about the problem differently.");
    } catch {
      setHint("Focus on understanding the constraints and think about which data structure fits best.");
    } finally {
      setHintLoading(false);
    }
  };

  const handleMarkSolved = async () => {
    if (solved[currentIdx]) return; // already marked
    const updated = [...solved];
    updated[currentIdx] = true;
    setSolved(updated);
    // Save to Supabase
    fetch("/api/progress/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "problem", problemCount: 1 }),
    }).catch(console.error);
  };

  const currentProblem = problems[currentIdx];

  if (loading) {
    return (
      <div className="min-h-screen text-white flex flex-col items-center justify-center gap-6 p-6">
        <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-purple-500" />
        <div className="text-center">
          <p className="text-xl font-bold text-purple-300">Generating Problems</p>
          <p className="text-gray-400 text-sm mt-1">Gemini is crafting your challenges...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen text-white flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-6xl">⚠️</p>
        <p className="text-xl font-bold text-red-400">Failed to load problems</p>
        <p className="text-gray-400 text-sm text-center">{error}</p>
        <button
          onClick={() => router.push("/problems")}
          className="mt-4 px-6 py-3 bg-purple-600 rounded-xl font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col text-white bg-gradient-to-b from-[#010101] to-[#270035] overflow-hidden">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[#0e0422] border-b border-purple-900/40 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/problems" className="text-gray-400 hover:text-white">
            <ArrowLeftIcon size={20} />
          </Link>
          <span className="text-sm text-gray-400 hidden sm:block truncate max-w-[120px]">{topic}</span>
        </div>

        {/* Problem switcher */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentIdx(0)}
            className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1 transition-all ${
              currentIdx === 0 ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            {solved[0] && <span className="text-green-400">✓</span>} P1
          </button>
          <button
            onClick={() => setCurrentIdx(1)}
            className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1 transition-all ${
              currentIdx === 1 ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            {solved[1] && <span className="text-green-400">✓</span>} P2
          </button>
        </div>

        {/* Language selector */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as any)}
          className="bg-[#1a0a2e] text-white text-xs sm:text-sm border border-purple-700/50 rounded-lg px-2 py-1 focus:outline-none"
        >
          {LANGUAGES.map((l) => (
            <option key={l.id} value={l.id}>{l.label}</option>
          ))}
        </select>
      </header>

      {/* Main Content: Split layout */}
      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">

        {/* LEFT: Problem Panel */}
        <div className="sm:w-[42%] flex flex-col border-b sm:border-b-0 sm:border-r border-purple-900/30 overflow-hidden" style={{maxHeight: '40vh', flex: '0 0 40vh'}} data-role="problem-panel">
          <style>{`@media (min-width: 640px) { [data-role="problem-panel"] { max-height: 100vh; flex: 0 0 42%; } }`}</style>

          {/* Tabs */}
          <div className="flex border-b border-purple-900/30 shrink-0">
            <button
              onClick={() => setActiveTab("problem")}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === "problem" ? "text-white border-b-2 border-purple-500" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Problem
            </button>
            <button
              onClick={() => setActiveTab("hint")}
              className={`px-4 py-2 text-sm font-semibold transition-colors flex items-center gap-1 ${
                activeTab === "hint" ? "text-yellow-300 border-b-2 border-yellow-400" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <LightbulbIcon size={14} /> Hint
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 text-sm">
            {activeTab === "problem" && currentProblem && (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-bold text-white">{currentProblem.title}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                    currentProblem.difficulty?.toLowerCase() === "beginner" ? "bg-green-900/50 text-green-300" :
                    currentProblem.difficulty?.toLowerCase() === "expert" ? "bg-red-900/50 text-red-300" :
                    "bg-yellow-900/50 text-yellow-300"
                  }`}>
                    {currentProblem.difficulty}
                  </span>
                </div>

                <p className="text-gray-300 leading-relaxed">{currentProblem.description}</p>

                {currentProblem.examples?.length > 0 && (
                  <div className="space-y-3">
                    <p className="font-semibold text-gray-200">Examples</p>
                    {currentProblem.examples.map((ex, i) => (
                      <div key={i} className="bg-black/30 rounded-xl p-3 border border-purple-900/30 text-xs font-mono space-y-1">
                        <p><span className="text-gray-500">Input:</span> <span className="text-green-300">{ex.input}</span></p>
                        <p><span className="text-gray-500">Output:</span> <span className="text-blue-300">{ex.output}</span></p>
                        {ex.explanation && <p className="text-gray-400 font-sans">{ex.explanation}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {currentProblem.constraints?.length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-200 mb-2">Constraints</p>
                    <ul className="space-y-1">
                      {currentProblem.constraints.map((c, i) => (
                        <li key={i} className="text-gray-400 text-xs flex gap-2">
                          <span className="text-purple-400 shrink-0">•</span> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === "hint" && (
              <div className="space-y-4">
                {hintLoading ? (
                  <div className="flex flex-col items-center gap-3 py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400" />
                    <p className="text-gray-400 text-xs">Gemini is thinking...</p>
                  </div>
                ) : hint ? (
                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <LightbulbIcon size={16} className="text-yellow-400" />
                      <span className="text-yellow-300 font-semibold text-sm">Gemini Hint</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed text-sm">{hint}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <LightbulbIcon size={32} className="text-gray-600" />
                    <p className="text-gray-500 text-sm">Write some code first, then click "Get Hint" to get a personalized hint from Gemini.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Editor Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            <MonacoEditor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || "")}
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                automaticLayout: true,
                tabSize: 4,
                wordWrap: "on",
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>

          {/* Action bar */}
          <div className="shrink-0 flex items-center justify-between px-3 py-2 bg-[#0e0422] border-t border-purple-900/40 gap-2">
            <div className="flex gap-2">
              <button
                onClick={handleGetHint}
                disabled={hintLoading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 border border-yellow-600/30 transition-all disabled:opacity-50"
              >
                <LightbulbIcon size={14} />
                <span className="hidden xs:inline">Get Hint</span>
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleMarkSolved}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all border ${
                  solved[currentIdx]
                    ? "bg-green-600/20 border-green-600/30 text-green-300"
                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                }`}
              >
                {solved[currentIdx] ? "✓ Solved" : "Mark Solved"}
              </button>
              {currentIdx < problems.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx(currentIdx + 1)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all"
                >
                  Next <CaretRightIcon size={14} />
                </button>
              ) : (
                <Link
                  href="/problems"
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all"
                >
                  Done ✓
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
