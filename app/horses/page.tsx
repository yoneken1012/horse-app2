import { Suspense } from "react";
import { HorseList } from "./_components/horse-list";

export default function HorsesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <p className="text-muted-foreground">読み込み中...</p>
          </div>
        }
      >
        <HorseList />
      </Suspense>
    </div>
  );
}
