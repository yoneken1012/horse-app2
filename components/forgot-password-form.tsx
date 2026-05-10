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
import { useState } from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <Card className="bg-card border border-border shadow-none rounded-sm">
          <CardHeader className="p-5 pb-0">
            <CardTitle className="text-base uppercase tracking-[0.2em] font-normal text-foreground">
              CHECK YOUR EMAIL
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              パスワードリセットメールを送信しました
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">
              メールに記載されたリンクからパスワードをリセットしてください。
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card border border-border shadow-none rounded-sm">
          <CardHeader className="p-5 pb-0">
            <CardTitle className="text-base uppercase tracking-[0.2em] font-normal text-foreground">
              FORGOT PASSWORD
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              メールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <form onSubmit={handleForgotPassword}>
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
                {error && <p className="text-xs text-destructive">{error}</p>}
                <Button type="submit" className="w-full rounded-sm uppercase tracking-wider text-xs font-normal py-2.5" disabled={isLoading}>
                  {isLoading ? "Sending..." : "SEND RESET EMAIL"}
                </Button>
              </div>
              <div className="mt-4 text-center text-xs text-muted-foreground">
                アカウントをお持ちですか?{" "}
                <Link
                  href="/auth/login"
                  className="text-primary hover:underline underline-offset-4"
                >
                  Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
