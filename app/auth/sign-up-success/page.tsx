import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-3 py-6">
      <div className="w-full">
        <div className="flex flex-col gap-6">
          <Card className="bg-card border border-border shadow-none rounded-sm">
            <CardHeader className="p-5 pb-0">
              <CardTitle className="text-base uppercase tracking-[0.2em] font-normal text-foreground">
                THANK YOU
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                アカウント登録ありがとうございます
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground">
                確認メールをお送りしました。メール内のリンクをクリックしてアカウントを有効化してください。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
