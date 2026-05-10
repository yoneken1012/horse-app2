import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      {params?.error ? (
        <p className="text-xs text-muted-foreground">
          Code error: {params.error}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          An unspecified error occurred.
        </p>
      )}
    </>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-3 py-6">
      <div className="w-full">
        <div className="flex flex-col gap-6">
          <Card className="bg-card border border-border shadow-none rounded-sm">
            <CardHeader className="p-5 pb-0">
              <CardTitle className="text-base uppercase tracking-[0.2em] font-normal text-foreground">
                ERROR
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <Suspense>
                <ErrorContent searchParams={searchParams} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
