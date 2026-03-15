"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";

const ROWS = 6;
const COLS = 7;
type Board = (0 | 1 | 2)[][];
type Move = { row: number; col: number; player: 1 | 2 };

function emptyBoard(): Board {
  return Array.from({ length: ROWS }, () =>
    Array(COLS).fill(0) as (0 | 1 | 2)[]
  );
}

function getRowForCol(board: Board, col: number): number | null {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) return r;
  }
  return null;
}

function checkWin(board: Board, player: 1 | 2): number[][] | null {
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c <= COLS - 4; c++)
      if ([0, 1, 2, 3].every((i) => board[r][c + i] === player))
        return [
          [r, c],
          [r, c + 1],
          [r, c + 2],
          [r, c + 3],
        ];
  for (let r = 0; r <= ROWS - 4; r++)
    for (let c = 0; c < COLS; c++)
      if ([0, 1, 2, 3].every((i) => board[r + i][c] === player))
        return [
          [r, c],
          [r + 1, c],
          [r + 2, c],
          [r + 3, c],
        ];
  for (let r = 0; r <= ROWS - 4; r++)
    for (let c = 0; c <= COLS - 4; c++)
      if ([0, 1, 2, 3].every((i) => board[r + i][c + i] === player))
        return [
          [r, c],
          [r + 1, c + 1],
          [r + 2, c + 2],
          [r + 3, c + 3],
        ];
  for (let r = 0; r <= ROWS - 4; r++)
    for (let c = 3; c < COLS; c++)
      if ([0, 1, 2, 3].every((i) => board[r + i][c - i] === player))
        return [
          [r, c],
          [r + 1, c - 1],
          [r + 2, c - 2],
          [r + 3, c - 3],
        ];
  return null;
}

function botPickCol(board: Board): number {
  const available = Array.from({ length: COLS }, (_, i) => i).filter(
    (c) => getRowForCol(board, c) !== null
  );
  for (const c of available) {
    const r = getRowForCol(board, c)!;
    const test = board.map((row) => [...row]) as Board;
    test[r][c] = 2;
    if (checkWin(test, 2)) return c;
  }
  for (const c of available) {
    const r = getRowForCol(board, c)!;
    const test = board.map((row) => [...row]) as Board;
    test[r][c] = 1;
    if (checkWin(test, 1)) return c;
  }
  const centerOrder = [3, 2, 4, 1, 5, 0, 6];
  for (const c of centerOrder) if (available.includes(c)) return c;
  return available[0];
}

export default function Connect4() {
  const [board, setBoard] = useState<Board>(emptyBoard());
  const [history, setHistory] = useState<Move[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winCells, setWinCells] = useState<number[][] | null>(null);
  const [status, setStatus] = useState("Your turn 🔴");
  const [scores, setScores] = useState({ player: 0, bot: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [hoverCol, setHoverCol] = useState<number | null>(null);

  useEffect(() => {
    if (!isPlayerTurn && !gameOver) {
      const timer = setTimeout(() => {
        const col = botPickCol(board);
        const row = getRowForCol(board, col);
        if (row === null) return;
        const newBoard = board.map((r) => [...r]) as Board;
        newBoard[row][col] = 2;
        const newHistory = [...history, { row, col, player: 2 as const }];
        setBoard(newBoard);
        setHistory(newHistory);
        const win = checkWin(newBoard, 2);
        if (win) {
          setWinCells(win);
          setScores((s) => ({ ...s, bot: s.bot + 1 }));
          setStatus("Bot wins! 🤖");
          setGameOver(true);
        } else if (newBoard.every((r) => r.every((c) => c !== 0))) {
          setStatus("Draw! 🤝");
          setGameOver(true);
        } else {
          setStatus("Your turn 🔴");
          setIsPlayerTurn(true);
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameOver, board, history]);

  const handleDrop = (col: number) => {
    if (!isPlayerTurn || gameOver) return;
    const row = getRowForCol(board, col);
    if (row === null) return;
    const newBoard = board.map((r) => [...r]) as Board;
    newBoard[row][col] = 1;
    const newHistory = [...history, { row, col, player: 1 as const }];
    setBoard(newBoard);
    setHistory(newHistory);
    const win = checkWin(newBoard, 1);
    if (win) {
      setWinCells(win);
      setScores((s) => ({ ...s, player: s.player + 1 }));
      setStatus("You win! 🎉");
      setGameOver(true);
    } else if (newBoard.every((r) => r.every((c) => c !== 0))) {
      setStatus("Draw! 🤝");
      setGameOver(true);
    } else {
      setStatus("Bot thinking... 🟡");
      setIsPlayerTurn(false);
    }
  };

  const undoSelf = () => {
    if (gameOver) return;
    const newHistory = [...history];
    for (let i = newHistory.length - 1; i >= 0; i--) {
      if (newHistory[i].player === 1) {
        newHistory.splice(i, 1);
        break;
      }
    }
    rebuildFromHistory(newHistory, true);
  };

  const undoBot = () => {
    if (gameOver) return;
    const newHistory = [...history];
    for (let i = newHistory.length - 1; i >= 0; i--) {
      if (newHistory[i].player === 2) {
        newHistory.splice(i, 1);
        break;
      }
    }
    rebuildFromHistory(newHistory, false);
  };

  const rebuildFromHistory = (newHistory: Move[], playerTurn: boolean) => {
    const newBoard = emptyBoard();
    newHistory.forEach((m) => {
      newBoard[m.row][m.col] = m.player;
    });
    setBoard(newBoard);
    setHistory(newHistory);
    setIsPlayerTurn(playerTurn);
    setStatus(playerTurn ? "Your turn 🔴" : "Bot thinking... 🟡");
  };

  const reset = () => {
    setBoard(emptyBoard());
    setHistory([]);
    setIsPlayerTurn(true);
    setWinCells(null);
    setGameOver(false);
    setStatus("Your turn 🔴");
  };

  const isWinCell = (r: number, c: number) =>
    winCells?.some(([wr, wc]) => wr === r && wc === c);

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
          <h1 className="text-2xl font-bold">Connect Four</h1>
        </div>

        <div className="flex justify-between mb-4 text-center">
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl px-6 py-3">
            <div className="text-2xl font-bold text-red-400">
              {scores.player}
            </div>
            <div className="text-xs text-gray-400">You 🔴</div>
          </div>
          <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-xl px-6 py-3">
            <div className="text-2xl font-bold text-yellow-400">
              {scores.bot}
            </div>
            <div className="text-xs text-gray-400">Bot 🟡</div>
          </div>
        </div>

        <div className="text-center mb-4 py-2 px-4 bg-white/5 rounded-xl text-sm font-medium">
          {status}
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {Array.from({ length: COLS }, (_, c) => (
            <button
              key={c}
              onClick={() => handleDrop(c)}
              onMouseEnter={() => setHoverCol(c)}
              onMouseLeave={() => setHoverCol(null)}
              className={`h-8 rounded text-xs font-bold transition-colors ${
                hoverCol === c
                  ? "bg-purple-500"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              ↓
            </button>
          ))}
        </div>

        <div className="bg-blue-900/40 border border-blue-500/30 rounded-xl p-2">
          <div className="grid grid-cols-7 gap-1">
            {board.map((row, r) =>
              row.map((cell, c) => {
                const win = isWinCell(r, c);
                const hover = hoverCol === c && cell === 0;
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`aspect-square rounded-full transition-all ${
                      win ? "ring-2 ring-green-400" : ""
                    } ${
                      cell === 1
                        ? "bg-red-500 shadow-lg shadow-red-500/30"
                        : cell === 2
                        ? "bg-yellow-400 shadow-lg shadow-yellow-400/30"
                        : hover
                        ? "bg-purple-500/30"
                        : "bg-white/10"
                    }`}
                  />
                );
              })
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
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

