import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex h-[calc(100vh-96px)] items-center justify-center bg-light-gray">
      <SignIn />
    </main>
  );
}
