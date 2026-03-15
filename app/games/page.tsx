"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ArrowLeftIcon } from "@phosphor-icons/react";

const games = [
  {
    id: "tictactoe",
    name: "Tic-Tac-Toe",
    emoji: "⭕",
    desc: "Classic 3×3 vs Bot. With undo!",
    color: "from-red-900/40 to-pink-900/40 border-red-500/30",
  },
  {
    id: "connect4",
    name: "Connect Four",
    emoji: "🔴",
    desc: "Drop pieces to connect 4 in a row vs Bot.",
    color: "from-blue-900/40 to-cyan-900/40 border-blue-500/30",
  },
  {
    id: "minesweeper",
    name: "Minesweeper",
    emoji: "💣",
    desc: "Reveal all safe cells. Don't hit a mine!",
    color: "from-gray-900/40 to-slate-900/40 border-gray-500/30",
  },
  {
    id: "sudoku",
    name: "Sudoku",
    emoji: "🔢",
    desc: "Fill the 9×9 grid. 5 hints available!",
    color: "from-green-900/40 to-emerald-900/40 border-green-500/30",
  },
  {
    id: "uno",
    name: "UNO",
    emoji: "🃏",
    desc: "Classic card game. Match color or number!",
    color: "from-yellow-900/40 to-orange-900/40 border-yellow-500/30",
  },
];

export default function GamesPage() {
  return (
    <div className="min-h-screen text-white p-6 pb-24">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="text-white hover:text-purple-300">
            <ArrowLeftIcon size={24} />
          </Link>
          <h1 className="text-3xl font-bold">Games</h1>
        </div>

        <div className="space-y-4">
          {games.map((game) => (
            <Link key={game.id} href={`/games/${game.id}`}>
              <div
                className={`bg-gradient-to-r ${game.color} border rounded-2xl p-5 flex items-center gap-4 hover:scale-[1.02] transition-transform cursor-pointer mb-4`}
              >
                <span className="text-5xl">{game.emoji}</span>
                <div>
                  <h2 className="text-xl font-bold">{game.name}</h2>
                  <p className="text-gray-300 text-sm">{game.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Navbar />
    </div>
  );
}

