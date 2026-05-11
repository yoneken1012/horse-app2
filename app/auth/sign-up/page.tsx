import { SignUpForm } from "@/components/sign-up-form";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-3 py-6">
      <div className="w-full">
        <SignUpForm />
      </div>
    </div>
  );
}
