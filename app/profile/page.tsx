"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { ArrowLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const getUserInitials = () => {
    if (!user?.user_metadata?.first_name || !user?.user_metadata?.last_name) {
      return user?.email?.charAt(0).toUpperCase() || "U";
    }
    return `${user.user_metadata.first_name.charAt(0)}${user.user_metadata.last_name.charAt(0)}`;
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`;
    }
    return user?.email || "User";
  };

  return (
    <div className="min-h-screen text-white p-6 pb-24">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-8">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 mr-4" asChild>
            <Link href="/dashboard"><ArrowLeftIcon size={24} /></Link>
          </Button>
          <h1 className="text-xl font-semibold">User Profile</h1>
        </div>

        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <Avatar className="w-24 h-24 ring-4 ring-purple-500">
              <AvatarImage src="" alt={getUserDisplayName()} />
              <AvatarFallback className="text-xl bg-purple-600 text-white">{getUserInitials()}</AvatarFallback>
            </Avatar>
          </div>
          <h2 className="text-2xl font-bold">{getUserDisplayName()}</h2>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-300">General</h3>
          <div className="space-y-2">
            {["My Account", "Quiz History", "FAQ & Support"].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <span>{item}</span>
                <CaretRightIcon size={20} className="text-gray-400" />
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-300">Settings</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <span>Language</span>
              <CaretRightIcon size={20} className="text-gray-400" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
              <span>Dark Mode</span>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} className="data-[state=checked]:bg-purple-600" />
            </div>
          </div>
        </div>

        <Button onClick={handleLogout} variant="destructive" className="w-full bg-red-600 hover:bg-red-700">
          Logout
        </Button>
      </div>
      <Navbar />
    </div>
  );
}

