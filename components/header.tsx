"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface HeaderProps {
  userName: string;
  userRole: "owner" | "trainer";
}

const roleBadge: Record<string, string> = {
  trainer: "🏇 調教師",
  owner: "👑 馬主",
};

const navLinks = [
  { href: "/horses", label: "馬一覧" },
  { href: "/timeline", label: "タイムライン" },
];

export function Header({ userName, userRole }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">Uma Vie</h1>
          <nav className="flex gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
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
