import { useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { PATHNAMES } from "@/lib/pathnames";
import { toUserMessage } from "@/lib/user-error-messages";
import { useLogInMutation } from "@/requests/login";
import { LOGIN_ERROR_MESSAGES } from "./const";

export function useLoginForm() {
  const [password, setPassword] = useState("");
  const router = useRouter();

  const { mutate, isPending, error } = useLogInMutation({
    onSuccess: () => {
      router.replace(PATHNAMES.homepage);
      router.refresh();
    },
  });

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!password) {
      return;
    }
    mutate(password);
  }

  return {
    password,
    setPassword,
    handleSubmit,
    isLoggingIn: isPending,
    loginErrorMessage: error ? toUserMessage(error, LOGIN_ERROR_MESSAGES) : null,
  };
}
