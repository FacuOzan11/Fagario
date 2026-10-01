import {
  Gauge,
  Gear,
  House,
  Receipt,
  Scroll,
  UsersThree,
  type Icon,
} from "@phosphor-icons/react";

import { copy } from "@/content/copy";

export interface NavItem {
  href:
    | "/dashboard"
    | "/cobros"
    | "/semaforo"
    | "/clientes"
    | "/facturas"
    | "/ajustes";
  label: string;
  icon: Icon;
  /** Muestra el badge "Pronto". */
  proximamente?: boolean;
  /** Aparece en la bottom nav de mobile. */
  mobile?: boolean;
}

const t = copy.nav.items;

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: t.inicio, icon: House, mobile: true },
  { href: "/cobros", label: t.cobros, icon: Receipt, mobile: true },
  { href: "/semaforo", label: t.semaforo, icon: Gauge, mobile: true },
  {
    href: "/clientes",
    label: t.clientes,
    icon: UsersThree,
    proximamente: true,
    mobile: true,
  },
  {
    href: "/facturas",
    label: t.facturas,
    icon: Scroll,
    proximamente: true,
    mobile: true,
  },
  { href: "/ajustes", label: t.ajustes, icon: Gear, proximamente: true },
];

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
