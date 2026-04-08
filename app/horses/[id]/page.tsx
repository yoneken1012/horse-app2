import { Suspense } from "react";
import { HorseDetailContent } from "./_components/horse-detail-content";

interface HorseDetailPageProps {
  params: Promise<{ id: string }>;
}

async function HorseDetailLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <HorseDetailContent horseId={id} />;
}

export default function HorseDetailPage({ params }: HorseDetailPageProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <p className="text-muted-foreground">読み込み中...</p>
          </div>
        }
      >
        <HorseDetailLoader params={params} />
      </Suspense>
    </div>
  );
}
