import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { API_PATHS } from "@/lib/api-paths";
import { PATHNAMES } from "@/lib/pathnames";

async function logIn(password: string): Promise<void> {
  const res = await fetch(API_PATHS.login, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) throw new Error("Wrong password");
}

export function useLoginForm() {
  const [password, setPassword] = useState("");
  const router = useRouter();

  const login = useMutation({
    mutationFn: logIn,
    onSuccess: () => {
      router.replace(PATHNAMES.homepage);
      router.refresh();
    },
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!password) return;
    login.mutate(password);
  }

  return {
    password,
    setPassword,
    handleSubmit,
    isLoggingIn: login.isPending,
    loginError: login.isError,
  };
}
