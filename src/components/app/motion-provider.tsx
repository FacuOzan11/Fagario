"use client";

import type * as React from "react";
import { MotionConfig } from "framer-motion";

/** Framer Motion respeta `prefers-reduced-motion` en toda la app. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
