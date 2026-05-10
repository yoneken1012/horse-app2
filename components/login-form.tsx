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

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/horses");
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
            LOGIN
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            メールアドレスとパスワードでログイン
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-5">
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
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-[10px] uppercase tracking-wider text-muted-foreground font-normal">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto text-xs text-muted-foreground hover:text-primary hover:underline underline-offset-4"
                  >
                    パスワードをお忘れですか?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background text-foreground rounded-sm"
                />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button type="submit" className="w-full rounded-sm uppercase tracking-wider text-xs font-normal py-2.5" disabled={isLoading}>
                {isLoading ? "Logging in..." : "LOGIN"}
              </Button>
            </div>
            <div className="mt-4 text-center text-xs text-muted-foreground">
              アカウントをお持ちでないですか?{" "}
              <Link
                href="/auth/sign-up"
                className="text-primary hover:underline underline-offset-4"
              >
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
