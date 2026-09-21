import Link from "next/link";
import { PATHNAMES } from "@/lib/pathnames";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-5 pt-5 pb-20 text-center">
      <span className="font-mono text-[10px] tracking-[0.08em] text-tan uppercase">
        Error
      </span>
      <h1 className="mt-2.5 font-serif text-[96px] leading-none font-semibold text-nav-accent italic">
        404
      </h1>
      <h2 className="mt-3.5 mb-2.5 font-serif text-[26px] font-semibold text-ink">
        Page not found
      </h2>
      <p className="mb-8 max-w-[380px] text-sm leading-relaxed text-body-text">
        The recipe you&apos;re looking for doesn&apos;t exist, or the page may
        have moved.
      </p>
      <Link
        href={PATHNAMES.homepage}
        className="rounded-lg bg-green px-6.5 py-3.5 text-sm font-semibold text-white hover:bg-green-hover"
      >
        Back to Home
      </Link>
    </main>
  );
}
