export default function TimelineLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダースケルトン */}
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="h-7 w-28 animate-pulse rounded bg-gray-200" />
          <div className="flex items-center gap-3">
            <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg border bg-white p-4 shadow-sm"
            >
              {/* ヘッダー部分 */}
              <div className="mb-3 flex items-center justify-between">
                <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
              </div>
              {/* 本文 */}
              <div className="mb-3 space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
              </div>
              {/* 画像プレースホルダー */}
              <div className="mb-3 aspect-video w-full animate-pulse rounded-md bg-gray-200" />
              {/* いいねボタン */}
              <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
