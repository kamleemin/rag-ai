"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PATHNAMES } from "@/lib/pathnames";

const navLinks = [
  { label: "Home", href: PATHNAMES.homepage },
  { label: "All Recipes", href: PATHNAMES.recipes },
  { label: "Ingredients", href: PATHNAMES.ingredients },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 flex h-[46px] items-center gap-1.5 overflow-x-auto bg-nav-bg px-5">
      <span className="mr-4 flex-none font-serif text-[17px] font-semibold tracking-wide text-nav-accent italic">
        Kamasak
      </span>
      {navLinks.map((link) => {
        const isActive =
          link.href === PATHNAMES.homepage
            ? pathname === PATHNAMES.homepage
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex-none rounded font-mono text-[10px] font-semibold tracking-[0.06em] whitespace-nowrap px-3.5 py-2 uppercase transition-colors",
              isActive ? "bg-green text-white" : "text-tan hover:text-white"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </header>
  );
}
