"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";

type Cell = null | "X" | "O";
type MoveHistory = { player: "X" | "O"; index: number }[];

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkWinner(board: Cell[]): { winner: Cell; line: number[] } | null {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return null;
}

function botMove(board: Cell[]): number {
  const empty = board
    .map((v, i) => (v === null ? i : -1))
    .filter((i) => i !== -1);

  for (const i of empty) {
    const test = [...board];
    test[i] = "O";
    if (checkWinner(test)) return i;
  }
  for (const i of empty) {
    const test = [...board];
    test[i] = "X";
    if (checkWinner(test)) return i;
  }
  if (board[4] === null) return 4;
  const corners = [0, 2, 6, 8].filter((i) => board[i] === null);
  if (corners.length)
    return corners[Math.floor(Math.random() * corners.length)];
  return empty[Math.floor(Math.random() * empty.length)];
}

export default function TicTacToe() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [history, setHistory] = useState<MoveHistory>([]);
  const [scores, setScores] = useState({ X: 0, O: 0, tie: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [status, setStatus] = useState("Your turn (X)");
  const [winLine, setWinLine] = useState<number[] | null>(null);

  useEffect(() => {
    if (!isPlayerTurn && !gameOver) {
      const timer = setTimeout(() => {
        const move = botMove(board);
        if (move === undefined) return;
        const newBoard = [...board];
        newBoard[move] = "O";
        const newHistory = [...history, { player: "O" as const, index: move }];
        setBoard(newBoard);
        setHistory(newHistory);

        const result = checkWinner(newBoard);
        if (result) {
          setWinLine(result.line);
          setScores((s) => ({ ...s, O: s.O + 1 }));
          setStatus("Bot (O) wins! 🤖");
          setGameOver(true);
        } else if (newBoard.every((c) => c !== null)) {
          setScores((s) => ({ ...s, tie: s.tie + 1 }));
          setStatus("It's a tie! 🤝");
          setGameOver(true);
        } else {
          setStatus("Your turn (X)");
          setIsPlayerTurn(true);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameOver, board, history]);

  const handleClick = (i: number) => {
    if (!isPlayerTurn || board[i] || gameOver) return;
    const newBoard = [...board];
    newBoard[i] = "X";
    const newHistory = [...history, { player: "X" as const, index: i }];
    setBoard(newBoard);
    setHistory(newHistory);

    const result = checkWinner(newBoard);
    if (result) {
      setWinLine(result.line);
      setScores((s) => ({ ...s, X: s.X + 1 }));
      setStatus("You (X) win! 🎉");
      setGameOver(true);
    } else if (newBoard.every((c) => c !== null)) {
      setScores((s) => ({ ...s, tie: s.tie + 1 }));
      setStatus("It's a tie! 🤝");
      setGameOver(true);
    } else {
      setStatus("Bot thinking...");
      setIsPlayerTurn(false);
    }
  };

  const undoSelf = () => {
    if (gameOver) return;
    const xMoves = history.filter((m) => m.player === "X");
    if (!xMoves.length) return;

    const filteredHistory = [...history];
    for (let i = filteredHistory.length - 1; i >= 0; i--) {
      if (filteredHistory[i].player === "X") {
        filteredHistory.splice(i, 1);
        break;
      }
    }

    const newBoard: Cell[] = Array(9).fill(null);
    filteredHistory.forEach((m) => {
      newBoard[m.index] = m.player;
    });
    setBoard(newBoard);
    setHistory(filteredHistory);
    setIsPlayerTurn(true);
    setStatus("Your turn (X)");
  };

  const undoBot = () => {
    if (gameOver) return;
    const filteredHistory = [...history];
    for (let i = filteredHistory.length - 1; i >= 0; i--) {
      if (filteredHistory[i].player === "O") {
        filteredHistory.splice(i, 1);
        break;
      }
    }
    const newBoard: Cell[] = Array(9).fill(null);
    filteredHistory.forEach((m) => {
      newBoard[m.index] = m.player;
    });
    setBoard(newBoard);
    setHistory(filteredHistory);
    setIsPlayerTurn(false);
    setStatus("Bot thinking...");
  };

  const reset = () => {
    setBoard(Array(9).fill(null));
    setHistory([]);
    setIsPlayerTurn(true);
    setGameOver(false);
    setWinLine(null);
    setStatus("Your turn (X)");
  };

  const getCellStyle = (i: number) => {
    const base =
      "w-full aspect-square flex items-center justify-center text-5xl font-bold rounded-xl border-2 cursor-pointer transition-all ";
    const isWin = winLine?.includes(i);
    if (isWin) return base + "border-green-400 bg-green-900/40";
    if (board[i] === "X")
      return (
        base + "border-red-500/50 bg-red-900/20 text-red-400"
      );
    if (board[i] === "O")
      return (
        base + "border-blue-500/50 bg-blue-900/20 text-blue-400"
      );
    return base + "border-white/10 bg-white/5 hover:bg-white/10";
  };

  return (
    <div className="min-h-screen text-white p-6 pb-24">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/games"
            className="text-white hover:text-purple-300"
          >
            <ArrowLeftIcon size={24} />
          </Link>
          <h1 className="text-2xl font-bold">Tic-Tac-Toe</h1>
        </div>

        <div className="flex justify-between mb-6 text-center">
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl px-6 py-3">
            <div className="text-2xl font-bold text-red-400">
              {scores.X}
            </div>
            <div className="text-xs text-gray-400">You (X)</div>
          </div>
          <div className="bg-gray-900/30 border border-gray-500/30 rounded-xl px-6 py-3">
            <div className="text-2xl font-bold text-gray-400">
              {scores.tie}
            </div>
            <div className="text-xs text-gray-400">Ties</div>
          </div>
          <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl px-6 py-3">
            <div className="text-2xl font-bold text-blue-400">
              {scores.O}
            </div>
            <div className="text-xs text-gray-400">Bot (O)</div>
          </div>
        </div>

        <div className="text-center mb-4 py-2 px-4 bg-white/5 rounded-xl text-sm font-medium">
          {status}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {board.map((cell, i) => (
            <button
              key={i}
              className={getCellStyle(i)}
              onClick={() => handleClick(i)}
            >
              {cell === "X" ? "✕" : cell === "O" ? "○" : ""}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={undoSelf}
            disabled={gameOver}
            variant="outline"
            className="text-xs border-white/20 text-white hover:bg-white/10"
          >
            Undo Mine
          </Button>
          <Button
            onClick={reset}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
          >
            New Game
          </Button>
          <Button
            onClick={undoBot}
            disabled={gameOver}
            variant="outline"
            className="text-xs border-white/20 text-white hover:bg-white/10"
          >
            Undo Bot
          </Button>
        </div>
      </div>
    </div>
  );
}

