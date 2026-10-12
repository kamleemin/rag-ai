import { NEXT_PARAM, toSafeNextPath } from "@/lib/next-path";
import LoginForm from "./login-form";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  // Where to go after logging in — the page the proxy sent them here from.
  const next = toSafeNextPath((await searchParams)[NEXT_PARAM]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-5 pt-5 pb-20">
      <LoginForm next={next} />
    </main>
  );
}
