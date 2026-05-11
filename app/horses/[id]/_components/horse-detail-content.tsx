import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { HorseTabs } from "./horse-tabs";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

const genderLabel: Record<string, string> = {
  male: "牡",
  female: "牝",
  gelding: "騸",
};

export async function HorseDetailContent({ horseId }: { horseId: string }) {
  const supabase = await createClient();

  // ログインチェック
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  // プロフィール取得
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    redirect("/auth/login");
  }

  // 馬情報取得
  const { data: horse, error: horseError } = await supabase
    .from("horses")
    .select("*")
    .eq("id", horseId)
    .single();

  if (horseError || !horse) {
    redirect("/horses");
  }

  // 馬のデータベースリンク取得
  const { data: horseLinks } = await supabase
    .from("horse_links")
    .select("url, title")
    .eq("horse_id", horseId)
    .eq("category", "database");

  // この馬のチャット履歴を取得
  const { data: chatsData, error: chatsError } = await supabase
    .from("horse_chats")
    .select(`
      id,
      message,
      image_url,
      created_at,
      user_id,
      profiles:user_id ( name, avatar_url )
    `)
    .eq("horse_id", horseId)
    .order("created_at", { ascending: false });

  if (chatsError) {
    console.error("チャットの取得に失敗しました:", chatsError.message);
  }

  const safeChats = (chatsData ?? []).map((chat) => ({
    id: chat.id as string,
    message: chat.message as string,
    image_url: chat.image_url as string | null,
    created_at: chat.created_at as string,
    user_id: chat.user_id as string,
    profiles: chat.profiles as unknown as { name: string; avatar_url: string | null },
  }));

  return (
    <>
      <Header userName={profile.name} userRole={profile.role} />

      <main className="px-3 py-3">
        {/* 戻るリンク */}
        <Link
          href="/horses"
          className="mb-3 inline-flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          ← Back
        </Link>

        {/* 馬プロフィールカード */}
        <Card className="mb-3 bg-card border border-border shadow-none rounded-sm">
          <CardContent className="flex items-start gap-4 p-3">
            {horse.image_url ? (
              <img
                src={horse.image_url}
                alt={horse.name}
                className="h-20 w-20 rounded-sm object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-sm bg-secondary text-4xl">
                🐴
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-lg font-medium text-foreground tracking-wide">{horse.name}</h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {horse.birth_year && (
                  <Badge className="bg-secondary text-foreground border border-border font-normal text-[10px] px-1.5 py-0 uppercase tracking-wider">
                    {new Date().getFullYear() - horse.birth_year}歳 ({horse.birth_year}年生)
                  </Badge>
                )}
                {horse.gender && (
                  <Badge className="bg-secondary text-foreground border border-border font-normal text-[10px] px-1.5 py-0 uppercase tracking-wider">
                    {genderLabel[horse.gender] ?? horse.gender}
                  </Badge>
                )}
                {horse.class && (
                  <Badge className="bg-secondary text-foreground border border-border font-normal text-[10px] px-1.5 py-0 uppercase tracking-wider">
                    {horse.class}
                  </Badge>
                )}
              </div>
              {horseLinks && horseLinks.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-3">
                  {horseLinks.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 underline-offset-4 hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {link.title ?? "France Galop"}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* タブUI */}
        <Card className="bg-card border border-border shadow-none rounded-sm">
          <CardContent className="p-3">
            <HorseTabs
              chats={safeChats}
              horseId={horseId}
              currentUserId={user.id}
              currentUserName={profile.name}
            />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
