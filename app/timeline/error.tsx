"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function TimelineError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-red-400" />
        <h2 className="mb-2 text-lg font-semibold text-gray-900">
          エラーが発生しました
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          再読み込みしてください。
        </p>
        <Button onClick={reset}>再読み込み</Button>
      </div>
    </div>
  );
}
