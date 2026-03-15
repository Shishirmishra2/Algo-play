"use client";

import Image from "next/image";
import logo from "@/public/logo/logo.png";
import { StarIcon } from "@phosphor-icons/react/ssr";
import { useState, useEffect } from "react";
import { saveUserJourney, getUserJourney } from "@/lib/userPreferences";

interface Step3Props {
  onSelectionChange?: (hasSelection: boolean) => void;
}

export default function Step3({ onSelectionChange }: Step3Props) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(
    null
  );

  useEffect(() => {
    const savedJourney = getUserJourney();
    if (savedJourney.difficulty) {
      setSelectedDifficulty(savedJourney.difficulty);
    }
  }, []);

  const difficulties = [
    { id: "beginner", label: "Beginner", stars: 1 },
    { id: "intermediate", label: "Intermediate", stars: 2 },
    { id: "expert", label: "Expert", stars: 3 },
  ];

  const getCardStyle = (difficultyId: string) => {
    if (selectedDifficulty === difficultyId) {
      return "border-purple-900 bg-purple-700/20 cursor-pointer hover:bg-purple-700/30 transition-colors";
    }
    return "border-neutral-50/10 bg-neutral-700/20 cursor-pointer hover:bg-neutral-600/30 transition-colors";
  };

  const getStarColor = (difficultyId: string) => {
    return selectedDifficulty === difficultyId ? "#fea41d" : "#fff";
  };

  useEffect(() => {
    onSelectionChange?.(selectedDifficulty !== null);
    if (selectedDifficulty) {
      const currentJourney = getUserJourney();
      saveUserJourney({
        subjects: currentJourney.subjects,
        difficulty: selectedDifficulty,
      });
    }
  }, [selectedDifficulty, onSelectionChange]);

  return (
    <>
      <Image src={logo} alt="logo" className="size-40" />
      <h1 className="-mt-18 text-3xl font-semibold">
        Time to <span className="font-bold text-purple-300">Self-Rank!</span>
      </h1>
      <div className="mt-8 flex flex-col gap-8 items-center justify-center">
        <div className="flex gap-8">
          {difficulties.slice(0, 2).map((difficulty) => (
            <div
              key={difficulty.id}
              onClick={() => setSelectedDifficulty(difficulty.id)}
              className={`size-50 flex flex-col gap-1 items-center justify-center text-2xl border-2 rounded-2xl ${getCardStyle(
                difficulty.id
              )}`}
            >
              <span className="flex items-center">
                {Array.from({ length: difficulty.stars }).map((_, index) => (
                  <StarIcon
                    key={index}
                    size={32}
                    weight="fill"
                    fill={getStarColor(difficulty.id)}
                  />
                ))}
              </span>
              {difficulty.label}
            </div>
          ))}
        </div>
        <div
          onClick={() => setSelectedDifficulty("expert")}
          className={`size-50 flex flex-col gap-1 items-center justify-center text-2xl border-2 rounded-2xl ${getCardStyle(
            "expert"
          )}`}
        >
          <span className="flex items-center">
            {Array.from({ length: 3 }).map((_, index) => (
              <StarIcon
                key={index}
                size={32}
                weight="fill"
                fill={getStarColor("expert")}
              />
            ))}
          </span>
          Expert
        </div>
      </div>
    </>
  );
}

