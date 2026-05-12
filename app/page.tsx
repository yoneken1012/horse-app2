import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function AuthRedirect() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/horses");
  } else {
    redirect("/auth/login");
  }

  return null;
}

export default function Home() {
  return (
    <Suspense>
      <AuthRedirect />
    </Suspense>
  );
}
