import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { PostCard } from "@/components/post-card";
import { PostForm } from "@/components/post-form";
import { MessageSquare } from "lucide-react";

export async function TimelineContent() {
  const supabase = await createClient();

  // ログインチェック
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  const userId = user.id;

  // プロフィール取得
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    redirect("/auth/login");
  }

  // 投稿一覧取得（reactionsは全件取得して集計する）
  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select(
      `
      *,
      profiles:user_id ( name, avatar_url ),
      reactions ( id, user_id )
    `
    )
    .order("created_at", { ascending: false });

  if (postsError) {
    console.error("投稿の取得に失敗しました:", postsError.message);
  }

  // reactionsの集計（いいね数 + 現在ユーザーのいいね済み判定）
  const postsWithReactionInfo = posts?.map((post) => {
    const reactions = Array.isArray(post.reactions) ? post.reactions : [];
    return {
      id: post.id,
      content: post.content,
      media_url: post.media_url,
      media_type: post.media_type,
      created_at: post.created_at,
      profiles: post.profiles,
      reactionCount: reactions.length,
      isLikedByCurrentUser: reactions.some(
        (r: { user_id: string }) => r.user_id === userId
      ),
    };
  });

  return (
    <>
      <Header userName={profile.name} userRole={profile.role} />

      <main className="mx-auto max-w-2xl px-4 py-6">
        {/* トレーナー向け投稿フォーム */}
        {profile.role === "trainer" && <PostForm userId={userId} />}

        {/* 投稿一覧 */}
        {!postsWithReactionInfo || postsWithReactionInfo.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="mb-4 h-12 w-12 text-gray-300" />
            <p className="text-lg font-medium text-gray-600">
              まだ投稿がありません
            </p>
            <p className="mt-1 text-sm text-gray-400">
              最初の投稿を待っています
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {postsWithReactionInfo.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={userId}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
