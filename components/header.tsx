"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface HeaderProps {
  userName: string;
  userRole: "owner" | "trainer";
}

const roleBadge: Record<string, string> = {
  trainer: "🏇 Trainer",
  owner: "👑 Owner",
};

export function Header({ userName, userRole }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background">
      <div className="flex items-center justify-between px-3 py-2">
        <Link href="/horses" className="text-base font-medium tracking-[0.15em] text-foreground">
          Uma Vie
        </Link>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-foreground">
            {roleBadge[userRole] ?? userRole}
          </span>
          <span className="text-sm font-medium text-foreground">
            {userName}
          </span>
          <Button variant="outline" size="sm" onClick={handleLogout} className="text-xs uppercase tracking-wider">
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
