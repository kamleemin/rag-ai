"use client";

import { Input } from "@/components/ui/input";
import { useLoginForm } from "./use-login-form";

export default function LoginForm() {
  const { password, setPassword, handleSubmit, isLoggingIn, loginError } =
    useLoginForm();

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-[380px] rounded-[10px] border border-border bg-white px-8 py-7"
    >
      <h1 className="mb-2 font-serif text-2xl font-semibold text-ink">
        Welcome back
      </h1>
      <p className="mb-6 text-sm leading-relaxed text-body-text">
        Enter your password to open your recipes.
      </p>
      <label
        htmlFor="password"
        className="mb-2 block font-mono text-[10px] tracking-[0.06em] text-tan uppercase"
      >
        Password
      </label>
      <Input
        id="password"
        type="password"
        autoComplete="current-password"
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        aria-invalid={loginError || undefined}
        className="mb-5 h-auto rounded-md border-border bg-muted px-3.5 py-3 text-sm text-ink"
      />
      <button
        type="submit"
        disabled={isLoggingIn}
        className="w-full rounded-md bg-green px-6 py-3 font-sans text-sm font-semibold text-white hover:bg-green-hover disabled:opacity-60"
      >
        {isLoggingIn ? "Logging in…" : "Log in"}
      </button>
      {loginError && (
        <p role="alert" className="mt-3 text-[13px] text-red-600">
          That password didn&apos;t work. Please try again.
        </p>
      )}
    </form>
  );
}
