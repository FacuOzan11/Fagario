"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import { copy } from "@/content/copy";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isActive } from "./nav-items";

export function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav aria-label={copy.nav.ariaLabel}>
      <ul className="grid gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="relative">
              {item.proximamente && item.href === "/clientes" ? (
                <div aria-hidden className="bg-border mx-3 my-3 h-px" />
              ) : null}
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex h-10 items-center gap-3 rounded-md px-3 text-[0.9375rem] outline-none",
                  "focus-visible:ring-ring transition-colors duration-150 focus-visible:ring-2",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="sidebar-active"
                    aria-hidden
                    className="bg-surface-muted absolute inset-0 rounded-md"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                ) : null}
                <Icon
                  weight="light"
                  aria-hidden
                  className="relative size-5 shrink-0"
                />
                <span
                  className={cn("relative flex-1", active && "font-medium")}
                >
                  {item.label}
                </span>
                {item.proximamente ? (
                  <span className="border-border text-subtle-foreground relative rounded-full border px-2 text-[0.6875rem] leading-5">
                    {copy.nav.badgeProximamente}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
