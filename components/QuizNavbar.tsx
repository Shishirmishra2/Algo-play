"use client";

import {
  AlarmIcon,
  ChartLineUpIcon,
  HouseIcon,
  UserIcon,
} from "@phosphor-icons/react/ssr";

interface QuizNavbarProps {
  onNavigationAttempt: (href: string) => void;
}

export default function QuizNavbar({ onNavigationAttempt }: QuizNavbarProps) {
  return (
    <header className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-lg rounded-t-2xl bg-[#0e0422]">
      <div className="flex items-center justify-between px-16 py-4">
        <button
          onClick={() => onNavigationAttempt("/dashboard")}
          className="text-white hover:text-purple-300"
        >
          <HouseIcon size={32} />
        </button>
        <button
          onClick={() => onNavigationAttempt("/dashboard")}
          className="text-white hover:text-purple-300"
        >
          <ChartLineUpIcon size={32} />
        </button>
        <button className="text-purple-400 hover:text-purple-300">
          <AlarmIcon size={32} />
        </button>
        <button
          onClick={() => onNavigationAttempt("/profile")}
          className="text-white hover:text-purple-300"
        >
          <UserIcon size={32} />
        </button>
      </div>
    </header>
  );
}

