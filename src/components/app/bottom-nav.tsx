"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import { copy } from "@/content/copy";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isActive } from "./nav-items";

const ITEMS = NAV_ITEMS.filter((i) => i.mobile);

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label={copy.nav.ariaLabel}
      className="border-border bg-background fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="relative">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[0.6875rem] leading-none outline-none",
                  "focus-visible:bg-surface-muted transition-colors duration-150",
                  active
                    ? "text-foreground font-medium"
                    : "text-muted-foreground",
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="bottom-nav-active"
                    aria-hidden
                    className="bg-accent absolute top-0 h-0.5 w-8 rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                ) : null}
                <Icon
                  weight="light"
                  aria-hidden
                  className={cn(
                    "size-6",
                    item.proximamente && !active && "opacity-60",
                  )}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
