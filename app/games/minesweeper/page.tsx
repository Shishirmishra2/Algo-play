"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";

const ROWS = 10;
const COLS = 10;
const MINES = 15;

type CellState = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborCount: number;
};

function generateBoard(firstRow: number, firstCol: number): CellState[][] {
  const safe = new Set<number>();
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      const r = firstRow + dr,
        c = firstCol + dc;
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS)
        safe.add(r * COLS + c);
    }

  const allCells = Array.from(
    { length: ROWS * COLS },
    (_, i) => i
  ).filter((i) => !safe.has(i));
  const mineSet = new Set<number>();
  while (mineSet.size < Math.min(MINES, allCells.length)) {
    mineSet.add(allCells[Math.floor(Math.random() * allCells.length)]);
  }

  const board: CellState[][] = Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => ({
      isMine: mineSet.has(r * COLS + c),
      isRevealed: false,
      isFlagged: false,
      neighborCount: 0,
    }))
  );

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!board[r][c].isMine) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr,
              nc = c + dc;
            if (
              nr >= 0 &&
              nr < ROWS &&
              nc >= 0 &&
              nc < COLS &&
              board[nr][nc].isMine
            )
              count++;
          }
        board[r][c].neighborCount = count;
      }
    }
  }
  return board;
}

function revealCells(
  board: CellState[][],
  row: number,
  col: number
): CellState[][] {
  const newBoard = board.map((r) => r.map((c) => ({ ...c })));
  const flood = (r: number, c: number) => {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
    if (newBoard[r][c].isRevealed || newBoard[r][c].isFlagged) return;
    newBoard[r][c].isRevealed = true;
    if (newBoard[r][c].neighborCount === 0 && !newBoard[r][c].isMine) {
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) flood(r + dr, c + dc);
    }
  };
  flood(row, col);
  return newBoard;
}

const NUM_COLORS: Record<number, string> = {
  1: "text-blue-400",
  2: "text-green-400",
  3: "text-red-400",
  4: "text-blue-800",
  5: "text-red-800",
  6: "text-cyan-400",
  7: "text-black",
  8: "text-gray-400",
};

export default function Minesweeper() {
  const [board, setBoard] = useState<CellState[][] | null>(null);
  const [gameState, setGameState] = useState<
    "idle" | "playing" | "won" | "lost"
  >("idle");
  const [flagCount, setFlagCount] = useState(0);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (gameState !== "playing") return;
    const t = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(t);
  }, [gameState]);

  const handleClick = (r: number, c: number) => {
    if (gameState === "won" || gameState === "lost") return;
    if (board && board[r][c].isFlagged) return;

    if (!board || gameState === "idle") {
      const newBoard = generateBoard(r, c);
      const revealed = revealCells(newBoard, r, c);
      setBoard(revealed);
      setGameState("playing");
      return;
    }

    if (board[r][c].isRevealed) return;

    if (board[r][c].isMine) {
      const newBoard = board.map((row) =>
        row.map((cell) => ({
          ...cell,
          isRevealed: cell.isMine ? true : cell.isRevealed,
        }))
      );
      setBoard(newBoard);
      setGameState("lost");
      return;
    }

    const newBoard = revealCells(board, r, c);
    setBoard(newBoard);

    const unrevealed = newBoard
      .flat()
      .filter((c) => !c.isRevealed && !c.isMine);
    if (unrevealed.length === 0) setGameState("won");
  };

  const handleRightClick = (
    e: React.MouseEvent,
    r: number,
    c: number
  ) => {
    e.preventDefault();
    if (!board || gameState !== "playing") return;
    if (board[r][c].isRevealed) return;
    const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
    newBoard[r][c].isFlagged = !newBoard[r][c].isFlagged;
    setFlagCount((f) => (newBoard[r][c].isFlagged ? f + 1 : f - 1));
    setBoard(newBoard);
  };

  const reset = () => {
    setBoard(null);
    setGameState("idle");
    setFlagCount(0);
    setTime(0);
  };

  const getCellStyle = (cell: CellState) => {
    const base =
      "w-full aspect-square flex items-center justify-center text-xs font-bold rounded cursor-pointer select-none transition-all ";
    if (!cell.isRevealed)
      return (
        base +
        "bg-gray-600 hover:bg-gray-500 border border-gray-500 active:bg-gray-700"
      );
    if (cell.isMine) return base + "bg-red-700 border border-red-500";
    return base + "bg-gray-800 border border-gray-700";
  };

  return (
    <div className="min-h-screen text-white p-4 pb-24">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/games"
            className="text-white hover:text-purple-300"
          >
            <ArrowLeftIcon size={24} />
          </Link>
          <h1 className="text-2xl font-bold">Minesweeper</h1>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="bg-white/10 rounded-xl px-4 py-2 text-sm">
            💣 {MINES - flagCount}
          </div>
          <div
            className={`text-lg font-bold ${
              gameState === "won"
                ? "text-green-400"
                : gameState === "lost"
                ? "text-red-400"
                : "text-white"
            }`}
          >
            {gameState === "idle"
              ? "Click to start!"
              : gameState === "won"
              ? "You won! 🎉"
              : gameState === "lost"
              ? "Boom! 💥"
              : "Playing..."}
          </div>
          <div className="bg-white/10 rounded-xl px-4 py-2 text-sm">
            ⏱ {time}s
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-xl p-2 mb-4">
          <div
            className="grid gap-0.5"
            style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
          >
            {(board ||
              Array.from({ length: ROWS }, () =>
                Array.from({ length: COLS }, () => ({
                  isMine: false,
                  isRevealed: false,
                  isFlagged: false,
                  neighborCount: 0,
                }))
              )).map((row, r) =>
              row.map((cell, c) => (
                <button
                  key={`${r}-${c}`}
                  className={getCellStyle(cell)}
                  onClick={() => handleClick(r, c)}
                  onContextMenu={(e) => handleRightClick(e, r, c)}
                >
                  {cell.isFlagged && !cell.isRevealed
                    ? "🚩"
                    : cell.isRevealed && cell.isMine
                    ? "💣"
                    : cell.isRevealed && cell.neighborCount > 0
                    ? (
                      <span
                        className={NUM_COLORS[cell.neighborCount]}
                      >
                        {cell.neighborCount}
                      </span>
                    )
                    : ""}
                </button>
              ))
            )}
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mb-4">
          Right-click (or long press) to place flags 🚩
        </p>

        <Button
          onClick={reset}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {gameState === "idle" ? "New Game" : "Reset"}
        </Button>
      </div>
    </div>
  );
}

