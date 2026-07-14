import { HomeFooter } from "@/components/home/Footer";
import { HomeHeader } from "@/components/home/Header";
import { StudentLoginForm } from "@/components/auth/student-login-form";

export function LoginPage({ redirectTo }: { redirectTo?: string }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f4f4f4]">
      <HomeHeader />
      <main className="flex w-full flex-1 items-center justify-center px-4 pb-[min(10vh,96px)] pt-[min(3vh,40px)] sm:pb-[min(12vh,112px)] sm:pt-[min(4vh,48px)]">
        <StudentLoginForm redirectTo={redirectTo} />
      </main>
      <HomeFooter />
    </div>
  );
}
