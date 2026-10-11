import Link from "next/link";

export default function PageHeader({
  backHref,
  title,
  backTitle = "Back",
}: {
  backHref: string;
  title: string;
  backTitle?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-border bg-white px-5 py-6 sm:px-10">
      <Link
        href={backHref}
        className="flex items-center gap-1.5 font-sans text-[13px] text-tan"
      >
        ← {backTitle}
      </Link>
      <div className="h-8 w-px bg-border" />
      <h1 className="font-serif text-2xl font-semibold text-ink">{title}</h1>
    </div>
  );
}
