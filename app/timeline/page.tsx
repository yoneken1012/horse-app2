import { Suspense } from "react";
import { TimelineContent } from "./_components/timeline-content";

export default function TimelinePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <p className="text-muted-foreground">読み込み中...</p>
          </div>
        }
      >
        <TimelineContent />
      </Suspense>
    </div>
  );
}
