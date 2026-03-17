"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";

const topics = [
  {
    id: "Data Structures & Algorithms",
    label: "Data Structures & Algorithms",
    emoji: "🌳",
    desc: "Arrays, Trees, Graphs, Sorting & Searching",
    color: "from-purple-900/50 to-purple-800/30 border-purple-500/30",
    accent: "text-purple-300",
  },
  {
    id: "Dynamic Programming",
    label: "Dynamic Programming",
    emoji: "🧩",
    desc: "Memoization, Tabulation, Optimization",
    color: "from-blue-900/50 to-blue-800/30 border-blue-500/30",
    accent: "text-blue-300",
  },
  {
    id: "Linked List",
    label: "Linked Lists",
    emoji: "🔗",
    desc: "Singly, Doubly, Circular & operations",
    color: "from-cyan-900/50 to-cyan-800/30 border-cyan-500/30",
    accent: "text-cyan-300",
  },
  {
    id: "Binary Search",
    label: "Binary Search",
    emoji: "🔍",
    desc: "Search algorithms and variations",
    color: "from-green-900/50 to-green-800/30 border-green-500/30",
    accent: "text-green-300",
  },
  {
    id: "Stack and Queue",
    label: "Stack & Queue",
    emoji: "📚",
    desc: "LIFO, FIFO, Monotonic stacks",
    color: "from-yellow-900/50 to-yellow-800/30 border-yellow-500/30",
    accent: "text-yellow-300",
  },
  {
    id: "Graph Algorithms",
    label: "Graph Algorithms",
    emoji: "🕸️",
    desc: "BFS, DFS, Dijkstra, Topological Sort",
    color: "from-orange-900/50 to-orange-800/30 border-orange-500/30",
    accent: "text-orange-300",
  },
  {
    id: "String Manipulation",
    label: "String Manipulation",
    emoji: "🔤",
    desc: "Pattern matching, Anagrams, Palindromes",
    color: "from-pink-900/50 to-pink-800/30 border-pink-500/30",
    accent: "text-pink-300",
  },
  {
    id: "Operating System",
    label: "Operating Systems",
    emoji: "⚙️",
    desc: "Process scheduling, Memory management",
    color: "from-red-900/50 to-red-800/30 border-red-500/30",
    accent: "text-red-300",
  },
];

const difficulties = ["Beginner", "Intermediate", "Expert"];

export default function ProblemsPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState("Intermediate");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStart = async () => {
    if (!selectedTopic) return;
    setLoading(true);
    // Store selection in sessionStorage so solve page can fetch
    sessionStorage.setItem("problemTopic", selectedTopic);
    sessionStorage.setItem("problemDifficulty", selectedDifficulty);
    router.push("/problems/solve");
  };

  return (
    <div className="min-h-screen text-white p-4 sm:p-6 pb-28">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-white hover:text-purple-300">
          <ArrowLeftIcon size={24} />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Problems</h1>
          <p className="text-gray-400 text-sm">Pick a topic, solve 2 challenges</p>
        </div>
      </div>

      {/* Difficulty Selector */}
      <div className="mb-6">
        <p className="text-gray-400 text-sm mb-3 font-medium uppercase tracking-wider">Difficulty</p>
        <div className="flex gap-2">
          {difficulties.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDifficulty(d)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border-2 ${
                selectedDifficulty === d
                  ? "bg-purple-600 border-purple-500 text-white"
                  : "border-white/10 text-gray-400 hover:border-purple-400/50"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Topic Cards */}
      <p className="text-gray-400 text-sm mb-3 font-medium uppercase tracking-wider">Choose Topic</p>
      <div className="grid grid-cols-1 gap-3 mb-8">
        {topics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => setSelectedTopic(topic.id)}
            className={`bg-gradient-to-r ${topic.color} border-2 rounded-2xl p-4 flex items-center gap-4 text-left transition-all hover:scale-[1.01] ${
              selectedTopic === topic.id
                ? "ring-2 ring-purple-400 ring-offset-1 ring-offset-transparent scale-[1.01]"
                : ""
            }`}
          >
            <span className="text-3xl shrink-0">{topic.emoji}</span>
            <div className="flex-1 min-w-0">
              <h2 className={`font-bold text-base sm:text-lg ${topic.accent}`}>{topic.label}</h2>
              <p className="text-gray-400 text-xs sm:text-sm">{topic.desc}</p>
            </div>
            {selectedTopic === topic.id && (
              <div className="shrink-0 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Start Button */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full sm:max-w-lg px-4">
        <button
          onClick={handleStart}
          disabled={!selectedTopic || loading}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
            selectedTopic && !loading
              ? "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-lg shadow-purple-900/40"
              : "bg-white/5 text-gray-500 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading Problems...
            </span>
          ) : selectedTopic ? (
            `Start Solving →`
          ) : (
            "Select a topic to continue"
          )}
        </button>
      </div>

      <Navbar />
    </div>
  );
}
