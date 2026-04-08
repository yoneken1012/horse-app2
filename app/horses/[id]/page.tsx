import { Suspense } from "react";

interface HorseDetailPageProps {
  params: Promise<{ id: string }>;
}

async function HorseDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <p className="text-lg font-medium text-gray-600">馬詳細ページ</p>
        <p className="mt-1 text-sm text-gray-400">ID: {id}</p>
        <p className="mt-2 text-sm text-gray-400">（準備中）</p>
      </div>
    </div>
  );
}

export default function HorseDetailPage({ params }: HorseDetailPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      }
    >
      <HorseDetailContent params={params} />
    </Suspense>
  );
}
