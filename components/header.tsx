"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { School, Crown } from "lucide-react";

interface HeaderProps {
  userName: string;
  userRole: "owner" | "trainer";
}

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
          <span className="inline-flex items-center gap-1.5 bg-secondary text-foreground border border-border rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-wider font-normal select-none">
            {userRole === "trainer" ? (
              <>
                <School className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
                <span>Trainer</span>
              </>
            ) : (
              <>
                <Crown className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
                <span>Owner</span>
              </>
            )}
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
