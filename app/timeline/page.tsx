import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TimelineContent } from "./_components/timeline-content";

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

  return (
    <div className="min-h-screen bg-slate-50">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <p className="text-muted-foreground">読み込み中...</p>
          </div>
        }
      >
        <TimelineContent userId={user.id} />
      </Suspense>
    </div>
  );
}
