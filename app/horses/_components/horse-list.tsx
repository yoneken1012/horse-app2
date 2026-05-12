import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface Horse {
  id: string;
  name: string;
  birth_year: number | null;
  gender: string | null;
  class: string | null;
  image_url: string | null;
  trainer_id: string;
  created_at: string | null;
}

const genderLabel: Record<string, string> = {
  male: "牡",
  female: "牝",
  gelding: "騸",
};

export async function HorseList() {
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

  // ロールに応じた馬一覧取得
  let horses: Horse[] = [];

  if (profile.role === "trainer") {
    const { data, error } = await supabase
      .from("horses")
      .select("*")
      .eq("trainer_id", userId)
      .order("birth_year", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error("馬一覧の取得に失敗しました:", error.message);
    } else {
      horses = data ?? [];
    }
  } else {
    const { data, error } = await supabase
      .from("horse_owners")
      .select("horses (*)")
      .eq("owner_id", userId);

    if (error) {
      console.error("馬一覧の取得に失敗しました:", error.message);
    } else {
      horses = (data ?? [])
        .map((row) => (row as unknown as { horses: Horse }).horses)
        .filter(Boolean);
    }
    // Sort by birth_year ascending (older first), then by name
    horses.sort((a, b) => {
      const yearA = a.birth_year ?? 9999;
      const yearB = b.birth_year ?? 9999;
      if (yearA !== yearB) return yearA - yearB;
      return a.name.localeCompare(b.name);
    });
  }

  return (
    <>
      <Header userName={profile.name} userRole={profile.role} />

      <main className="px-3 py-3">
        <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-normal mb-3">
          {profile.role === "trainer" ? "担当馬一覧" : "所有馬一覧"}
        </h2>

        {horses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-sm font-normal text-muted-foreground">
              馬が登録されていません
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              {profile.role === "trainer"
                ? "担当馬が登録されると表示されます"
                : "所有馬が登録されると表示されます"}
            </p>
          </div>
        ) : (
          <div className="grid gap-2">
            {horses.map((horse) => (
              <Link key={horse.id} href={`/horses/${horse.id}`}>
                <Card className="bg-card border border-border shadow-none rounded-sm transition-colors hover:border-foreground/20">
                  <CardHeader className="flex flex-row items-center gap-4 p-3">
                    {horse.image_url ? (
                      <img
                        src={horse.image_url}
                        alt={horse.name}
                        className="h-14 w-14 rounded-sm object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-sm bg-secondary text-2xl">
                        🐴
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-sm font-medium text-foreground tracking-wide">{horse.name}</CardTitle>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {horse.birth_year && (
                          <span className="rounded-sm bg-secondary text-foreground border border-border text-[10px] px-1.5 py-0 uppercase tracking-wider">
                            {new Date().getFullYear() - horse.birth_year}歳 ({horse.birth_year}年生)
                          </span>
                        )}
                        {horse.gender && (
                          <span className="rounded-sm bg-secondary text-foreground border border-border text-[10px] px-1.5 py-0 uppercase tracking-wider">
                            {genderLabel[horse.gender] ?? horse.gender}
                          </span>
                        )}
                        {horse.class && (
                          <span className="rounded-sm bg-secondary text-foreground border border-border text-[10px] px-1.5 py-0 uppercase tracking-wider">
                            {horse.class}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
