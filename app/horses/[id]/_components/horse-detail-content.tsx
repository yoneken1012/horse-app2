import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { HorseTabs } from "./horse-tabs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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

  // 調教師の投稿を取得（この馬の担当調教師の投稿）
  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select(
      `
      *,
      profiles:user_id ( name, avatar_url ),
      reactions ( id, user_id )
    `
    )
    .eq("user_id", horse.trainer_id)
    .order("created_at", { ascending: false });

  if (postsError) {
    console.error("投稿の取得に失敗しました:", postsError.message);
  }

  const safePosts = (posts ?? []).map((post) => {
    const reactions = Array.isArray(post.reactions) ? post.reactions : [];
    return {
      id: post.id as string,
      content: post.content as string,
      media_url: post.media_url as string | null,
      media_type: post.media_type as string | null,
      created_at: post.created_at as string,
      profiles: post.profiles as { name: string; avatar_url: string | null },
      reactionCount: reactions.length,
      isLikedByCurrentUser: reactions.some(
        (r: { user_id: string }) => r.user_id === user.id
      ),
    };
  });

  return (
    <>
      <Header userName={profile.name} userRole={profile.role} />

      <main className="mx-auto max-w-2xl px-4 py-6">
        {/* 戻るリンク */}
        <Link
          href="/horses"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          馬一覧に戻る
        </Link>

        {/* 馬プロフィールカード */}
        <Card className="mb-6 bg-white shadow-sm">
          <CardContent className="flex items-start gap-4 pt-6">
            {horse.image_url ? (
              <img
                src={horse.image_url}
                alt={horse.name}
                className="h-24 w-24 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-gray-100 text-4xl">
                🐴
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{horse.name}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {horse.gender && (
                  <Badge className="bg-gray-900 text-white">
                    {genderLabel[horse.gender] ?? horse.gender}
                  </Badge>
                )}
                {horse.birth_year && (
                  <Badge className="bg-gray-900 text-white">{horse.birth_year}年生（{new Date().getFullYear() - horse.birth_year}歳）</Badge>
                )}
                {horse.class && (
                  <Badge className="bg-gray-900 text-white">{horse.class}</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* タブUI */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <HorseTabs
              posts={safePosts}
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
