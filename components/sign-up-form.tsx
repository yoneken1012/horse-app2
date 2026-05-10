"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [selectedRole, setSelectedRole] = useState<"owner" | "trainer">("owner");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("パスワードが一致しません");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/horses`,
          data: {
            name: displayName,
            role: selectedRole,
          },
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-card border border-border shadow-none rounded-sm">
        <CardHeader className="p-5 pb-0">
          <CardTitle className="text-base uppercase tracking-[0.2em] font-normal text-foreground">
            SIGN UP
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            新しいアカウントを作成
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-5">
              <div className="grid gap-1.5">
                <Label htmlFor="display-name" className="text-[10px] uppercase tracking-wider text-muted-foreground font-normal">表示名</Label>
                <Input
                  id="display-name"
                  type="text"
                  placeholder="例: 田中太郎"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-background text-foreground rounded-sm"
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-normal">ロール選択</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="owner"
                      checked={selectedRole === "owner"}
                      onChange={() => setSelectedRole("owner")}
                      className="accent-primary h-4 w-4"
                    />
                    <span className="text-sm text-foreground">馬主</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="trainer"
                      checked={selectedRole === "trainer"}
                      onChange={() => setSelectedRole("trainer")}
                      className="accent-primary h-4 w-4"
                    />
                    <span className="text-sm text-foreground">調教師</span>
                  </label>
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="email" className="text-[10px] uppercase tracking-wider text-muted-foreground font-normal">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background text-foreground rounded-sm"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="password" className="text-[10px] uppercase tracking-wider text-muted-foreground font-normal">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background text-foreground rounded-sm"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="repeat-password" className="text-[10px] uppercase tracking-wider text-muted-foreground font-normal">Repeat Password</Label>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  className="bg-background text-foreground rounded-sm"
                />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button type="submit" className="w-full rounded-sm uppercase tracking-wider text-xs font-normal py-2.5" disabled={isLoading}>
                {isLoading ? "Creating..." : "SIGN UP"}
              </Button>
            </div>
            <div className="mt-4 text-center text-xs text-muted-foreground">
              既にアカウントをお持ちですか?{" "}
              <Link href="/auth/login" className="text-primary hover:underline underline-offset-4">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
