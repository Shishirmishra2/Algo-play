import {
  AlarmIcon,
  ChartLineUpIcon,
  HouseIcon,
  UserIcon,
} from "@phosphor-icons/react/ssr";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full sm:max-w-lg rounded-t-2xl bg-[#0e0422]">
      <div className="flex items-center justify-between px-8 sm:px-16 py-4 safe-area-pb">
        <Link
          href="/dashboard"
          className="text-white hover:text-purple-300"
        >
          <HouseIcon size={32} />
        </Link>
        <Link
          href="/performance"
          className="text-white hover:text-purple-300"
        >
          <ChartLineUpIcon size={32} />
        </Link>
        <Link href="/quiz" className="text-white hover:text-purple-300">
          <AlarmIcon size={32} />
        </Link>
        <Link href="/profile" className="text-white hover:text-purple-300">
          <UserIcon size={32} />
        </Link>
      </div>
    </header>
  );
}

