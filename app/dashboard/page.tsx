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

export default function Dashboard() {
  const [subjectDisplay, setSubjectDisplay] = useState(
    "Data Structure & Algorithms"
  );

  useEffect(() => {
    const journey = getUserJourney();
    if (journey.subjects.length > 0) {
      setSubjectDisplay(getSubjectDisplayText(journey.subjects));
    }
  }, []);

  return (
    <section className="">
      <div className="h-screen">
        <div className="relative bg-gradient-to-b rounded-b-4xl from-[#2A0072] to-[#8F1EEF] flex flex-col gap-4 items-center justify-center" style={{minHeight: '38%'}}>
          <h1 className="text-2xl sm:text-3xl">
            <span className="font-semibold">Algo</span>Play
          </h1>
          <p className="font-medium px-3 py-1.5 rounded-full border-2 text-sm sm:text-base">
            {subjectDisplay}
          </p>
          <div className="pt-3 sm:pt-6 flex gap-8 sm:gap-15 justify-between items-center w-full px-4 sm:px-8">
            <div className="flex-1 flex flex-col gap-1 sm:gap-2 font-bold text-sm sm:text-base">
              <p className="text-lime-500">84 Easy</p>
              <p className="text-yellow-400">30 Medium</p>
              <p className="text-red-400">9 Hard</p>
            </div>
            <div className="flex-1 shrink-0 text-center relatve rounded-full size-32 sm:size-40 flex flex-col justify-center items-center">
              <span className="font-bold text-base sm:text-lg z-10">123/200</span>
              <span className="text-xs z-10">Questions Solved</span>
              <div className="absolute size-32 sm:size-40 rounded-full bg-conic from-fuchsia-500 to-white from-40% z-1" />
              <div className="absolute size-28 sm:size-35 rounded-full bg-purple-700 z-2" />
            </div>
            <div className="flex-1 flex flex-col justify-center items-center">
              <Image src={medal} alt="medal" className="size-12 sm:size-16" />
              <span className="font-bold text-base sm:text-lg">2/5</span>
              <span className="text-xs sm:text-sm">Badges</span>
            </div>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 sm:-bottom-10 flex items-center justify-between gap-2">
            <Link
              href="/games"
              className="bg-white text-black font-semibold flex items-center gap-1 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg text-center rounded-xl"
            >
              <GameControllerIcon size={22} />
              Games
            </Link>
            <div className="bg-white text-black font-semibold flex items-center gap-1 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg text-center rounded-xl">
              <CodeIcon size={22} />
              Problems
            </div>
            <div className="bg-white text-black font-semibold flex items-center gap-1 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg text-center rounded-xl">
              <LightbulbIcon size={22} />
              Learn
            </div>
          </div>
        </div>

        <div className="pt-16 px-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-xl">Suggested Games</h3>
              <h3 className="text-purple-400 cursor-pointer">See All</h3>
            </div>
            <div className="pt-4 flex items-center justify-start gap-2 overflow-hidden mask-r-to-105%">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="relative rounded-2xl shrink-0 overflow-hidden"
                >
                  <Image
                    src={"/images/game.png"}
                    alt="game"
                    width={140}
                    height={140}
                    className="mask-b-to-130%"
                  />
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
                    <span className="font-bold">Monopoly</span>
                    <span className="text-xs whitespace-nowrap text-neutral-300">
                      12 Problems Solved
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Link
            href={"/quiz"}
            className="mt-15 border-2 border-purple-400/20 bg-purple-600/10 rounded-2xl flex min-h-30"
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

