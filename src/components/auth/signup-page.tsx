import { SignupForm } from "@/components/auth/signup/signup-form";
import { HomeFooter } from "@/components/home/Footer";
import { HomeHeader } from "@/components/home/Header";

export function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f4f4f4]">
      <HomeHeader />
      <main className="flex w-full flex-1 justify-center px-4 py-8 sm:py-10">
        <SignupForm />
      </main>
      <HomeFooter />
    </div>
  );
}
