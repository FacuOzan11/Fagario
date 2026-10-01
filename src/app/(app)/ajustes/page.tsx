import type { Metadata } from "next";
import { Gear } from "@phosphor-icons/react/dist/ssr";

import { Proximamente } from "@/components/app/proximamente";
import { copy } from "@/content/copy";

const t = copy.proximamente.ajustes;

export const metadata: Metadata = { title: t.titulo };

export default function Page() {
  return <Proximamente titulo={t.titulo} descripcion={t.descripcion} icon={Gear} />;
}
