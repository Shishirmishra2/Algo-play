"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { toast } from "sonner";

function pattern(r: number, c: number, base: number) {
  return (base * (r % base) + Math.floor(r / base) + c) % (base * base);
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function generateSolution(): number[][] {
  const base = 3,
    side = 9;
  const rBase = [0, 1, 2];
  const rows = shuffle(rBase).flatMap((g) =>
    shuffle(rBase).map((r) => g * base + r)
  );
  const cols = shuffle(rBase).flatMap((g) =>
    shuffle(rBase).map((c) => g * base + c)
  );
  const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  return rows.map((r) => cols.map((c) => nums[pattern(r, c, base)]));
}

function generatePuzzle(
  solution: number[][],
  empties = 40
): (number | null)[][] {
  const puzzle = solution.map((r) => [...r]) as (number | null)[][];
  const cells = Array.from({ length: 81 }, (_, i) => i);
  shuffle(cells)
    .slice(0, empties)
    .forEach((i) => {
      puzzle[Math.floor(i / 9)][i % 9] = null;
    });
  return puzzle;
}

export default function Sudoku() {
  const [solution, setSolution] = useState(() => generateSolution());
  const [puzzle, setPuzzle] = useState(() => {
    const sol = generateSolution();
    return { sol, puz: generatePuzzle(sol) };
  });
  const [userBoard, setUserBoard] = useState<(number | null)[][]>(() =>
    puzzle.puz.map((r) => [...r])
  );
  const [given, setGiven] = useState<boolean[][]>(() =>
    puzzle.puz.map((r) => r.map((v) => v !== null))
  );
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [hintsLeft, setHintsLeft] = useState(5);
  const [checked, setChecked] = useState(false);

  const reset = () => {
    const sol = generateSolution();
    const puz = generatePuzzle(sol);
    setSolution(sol);
    setPuzzle({ sol, puz });
    setUserBoard(puz.map((r) => [...r]));
    setGiven(puz.map((r) => r.map((v) => v !== null)));
    setHintsLeft(5);
    setChecked(false);
    setSelected(null);
  };

  const handleCellClick = (r: number, c: number) => {
    if (!given[r][c]) setSelected([r, c]);
  };

  const handleInput = (val: number | null) => {
    if (!selected) return;
    const [r, c] = selected;
    if (given[r][c]) return;
    const newBoard = userBoard.map((row) => [...row]);
    newBoard[r][c] = val;
    setUserBoard(newBoard);
    setChecked(false);
  };

  const giveHint = () => {
    if (hintsLeft <= 0) return;
    const empties: [number, number][] = [];
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (!given[r][c] && userBoard[r][c] !== puzzle.sol[r][c])
          empties.push([r, c]);
    if (!empties.length) {
      toast.success("Board is already correct!");
      return;
    }
    const [r, c] = empties[Math.floor(Math.random() * empties.length)];
    const newBoard = userBoard.map((row) => [...row]);
    newBoard[r][c] = puzzle.sol[r][c];
    setUserBoard(newBoard);
    setHintsLeft((h) => h - 1);
  };

  const checkSolution = () => {
    setChecked(true);
    const correct = userBoard.every((row, r) =>
      row.every((v, c) => v === puzzle.sol[r][c])
    );
    if (correct) toast.success("🎉 Correct! You solved it!");
    else toast.error("❌ Some cells are incorrect. Keep trying!");
  };

  const getCellStyle = (r: number, c: number) => {
    const isSelected = selected?.[0] === r && selected?.[1] === c;
    const isGiven = given[r][c];
    const isSameNumber =
      selected &&
      userBoard[r][c] !== null &&
      userBoard[r][c] === userBoard[selected[0]][selected[1]];
    const isWrong =
      checked && !isGiven && userBoard[r][c] !== null &&
      userBoard[r][c] !== puzzle.sol[r][c];

    let bg = "bg-white/5";
    if (isSelected) bg = "bg-purple-600/60";
    else if (isSameNumber && !isSelected) bg = "bg-purple-400/20";
    else if (isWrong) bg = "bg-red-900/40";
    else if (isGiven) bg = "bg-white/10";

    const borderR =
      (c + 1) % 3 === 0 && c !== 8
        ? "border-r-2 border-r-white/30"
        : "border-r border-r-white/10";
    const borderB =
      (r + 1) % 3 === 0 && r !== 8
        ? "border-b-2 border-b-white/30"
        : "border-b border-b-white/10";

    return `w-full aspect-square flex items-center justify-center text-base font-medium cursor-pointer transition-colors ${bg} ${borderR} ${borderB} ${
      isWrong
        ? "text-red-400"
        : isGiven
        ? "text-white font-bold"
        : "text-purple-200"
    }`;
  };

  return (
    <div className="min-h-screen text-white p-4 pb-24">
      <div className="max-w-sm mx-auto">
        <div className="flex items_center gap-4 mb-4">
          <Link
            href="/games"
            className="text-white hover:text-purple-300"
          >
            <ArrowLeftIcon size={24} />
          </Link>
          <h1 className="text-2xl font-bold">Sudoku</h1>
        </div>

        <div className="border-2 border-white/30 rounded-xl overflow-hidden mb-4">
          <div className="grid grid-cols-9">
            {userBoard.map((row, r) =>
              row.map((val, c) => (
                <button
                  key={`${r}-${c}`}
                  className={getCellStyle(r, c)}
                  onClick={() => handleCellClick(r, c)}
                >
                  {val || ""}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <Button
              key={n}
              onClick={() => handleInput(n)}
              className="h-12 bg-white/10 hover:bg-white/20 text-white font-bold border border-white/20"
            >
              {n}
            </Button>
          ))}
          <Button
            onClick={() => handleInput(null)}
            className="h-12 bg-red-900/30 hover:bg-red-900/50 text-red-300 border border-red-500/30"
          >
            ✕
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={giveHint}
            disabled={hintsLeft <= 0}
            className="bg-blue-700 hover:bg-blue-600 text-sm"
          >
            Hint ({hintsLeft})
          </Button>
          <Button
            onClick={checkSolution}
            className="bg-green-700 hover:bg-green-600 text-sm"
          >
            Check
          </Button>
          <Button
            onClick={reset}
            className="bg-purple-700 hover:bg-purple-600 text-sm"
          >
            New
          </Button>
        </div>
      </div>
    </div>
  );
}

