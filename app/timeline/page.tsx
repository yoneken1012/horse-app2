import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { PostCard } from "@/components/post-card";

export default async function TimelinePage() {
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

  // 投稿一覧取得
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Header userName={profile.name} />

      <main className="mx-auto max-w-2xl px-4 py-6">
        {/* トレーナー向け投稿フォームプレースホルダー */}
        {profile.role === "trainer" && (
          <div className="mb-6 rounded-lg border-2 border-dashed border-gray-300 bg-white p-6 text-center text-sm text-muted-foreground">
            投稿フォームがここに入ります
          </div>
        )}

        {/* 投稿一覧 */}
        {!posts || posts.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            まだ投稿がありません
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
