interface HorseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function HorseDetailPage({ params }: HorseDetailPageProps) {
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
