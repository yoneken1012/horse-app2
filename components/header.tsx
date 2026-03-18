"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface HeaderProps {
  userName: string;
  userRole: "owner" | "trainer";
}

const roleBadge: Record<string, string> = {
  trainer: "🏇 調教師",
  owner: "👑 馬主",
};

export function Header({ userName, userRole }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">Horse SNS</h1>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
            {roleBadge[userRole] ?? userRole}
          </span>
          <span className="hidden text-sm font-medium text-gray-700 sm:inline">
            {userName}
          </span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            ログアウト
          </Button>
        </div>
      </div>
    </header>
  );
}
