import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    // 調教師: trainer_idが自分の馬を取得
    const { data, error } = await supabase
      .from("horses")
      .select("*")
      .eq("trainer_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("馬一覧の取得に失敗しました:", error.message);
    } else {
      horses = data ?? [];
    }
  } else {
    // 馬主: horse_ownersテーブル経由で馬を取得
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
  }

  return (
    <>
      <Header userName={profile.name} userRole={profile.role} />

      <main className="mx-auto max-w-2xl px-4 py-6">
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          {profile.role === "trainer" ? "担当馬一覧" : "所有馬一覧"}
        </h2>

        {horses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg font-medium text-gray-600">
              馬が登録されていません
            </p>
            <p className="mt-1 text-sm text-gray-400">
              {profile.role === "trainer"
                ? "担当馬が登録されると表示されます"
                : "所有馬が登録されると表示されます"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {horses.map((horse) => (
              <Link key={horse.id} href={`/horses/${horse.id}`}>
                <Card className="transition-colors hover:bg-gray-50">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    {horse.image_url ? (
                      <img
                        src={horse.image_url}
                        alt={horse.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 text-2xl">
                        🐴
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-base">{horse.name}</CardTitle>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {horse.gender && (
                          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                            {genderLabel[horse.gender] ?? horse.gender}
                          </span>
                        )}
                        {horse.birth_year && (
                          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                            {horse.birth_year}年生
                          </span>
                        )}
                        {horse.class && (
                          <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
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
