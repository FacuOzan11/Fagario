import type * as React from "react";
import { connection } from "next/server";

import { AppShell } from "@/components/app/app-shell";
import { getPerfil } from "@/lib/data";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Los datos dependen de la fecha de hoy: siempre render dinámico.
  await connection();
  const perfil = await getPerfil();
  return <AppShell perfil={perfil}>{children}</AppShell>;
}
